import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import tls from 'node:tls'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

function loadDotEnv() {
  const envPath = path.join(rootDir, '.env')
  if (!fs.existsSync(envPath)) return
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const index = line.indexOf('=')
    const key = line.slice(0, index).trim()
    const value = line
      .slice(index + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

loadDotEnv()

const port = Number(process.env.PORT || 8787)
const host = process.env.HOST || '0.0.0.0'
const dataDir = path.resolve(process.env.DATA_DIR || path.join(rootDir, 'data'))
const uploadsDir = path.join(dataDir, 'uploads')
const privateFilesDir = path.join(dataDir, 'private-files')
const usersFile = path.join(dataDir, 'users.enc')
const passwordResetFile = path.join(dataDir, 'password-resets.enc')
const passwordResetOutboxFile = path.join(dataDir, 'password-reset-tokens.txt')
const oneTimeTokensFile = path.join(dataDir, 'one-time-tokens.enc')
const stateFile = path.join(dataDir, 'server-state.enc')
const userStateDir = path.join(dataDir, 'user-states')
const legacyStateFile = path.join(dataDir, 'server-state.json')
const encryptionKeyFile = path.join(dataDir, 'secret.key')
const adminBootstrapFile = path.join(dataDir, 'admin-inicial.txt')
const maxBodyBytes = 50 * 1024 * 1024
const sessionTtlMs = 1000 * 60 * 60 * 12
const resetTokenTtlMs = 1000 * 60 * 20
const defaultAllowedEmails = ['felipe.gomez@klifnet.com', 'isaacgestrada94@gmail.com']

const privateFileMap = {
  wialon: 'DispositivosWialon_Abril2026.xlsx.enc',
  pagos: 'Klifnet_Admon_Mensual_Pagos.xlsx.enc',
  cotizacion: 'cotizacion_CalidadSP.xlsx.enc',
  facturas: 'ultimas_facturas_emitidas.json.enc',
  lineas: ['base_relacion_lineas.json', 'base_relacion_lineas.json.enc']
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
}

const binaryTypes = {
  wialon: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pagos: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  cotizacion: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  facturas: 'application/json; charset=utf-8',
  lineas: 'application/json; charset=utf-8'
}

const sessions = new Map()

function ensureDataDirs() {
  fs.mkdirSync(uploadsDir, { recursive: true })
  fs.mkdirSync(privateFilesDir, { recursive: true })
  fs.mkdirSync(userStateDir, { recursive: true })
}

function writeAtomic(filePath, buffer) {
  ensureDataDirs()
  const tempPath = `${filePath}.tmp`
  fs.writeFileSync(tempPath, buffer)
  fs.renameSync(tempPath, filePath)
}

function getEncryptionKey() {
  ensureDataDirs()
  if (process.env.KLIFNET_SECRET_KEY) {
    return crypto.createHash('sha256').update(process.env.KLIFNET_SECRET_KEY).digest()
  }
  if (!fs.existsSync(encryptionKeyFile)) {
    fs.writeFileSync(encryptionKeyFile, crypto.randomBytes(32).toString('base64'), { mode: 0o600 })
  }
  return Buffer.from(fs.readFileSync(encryptionKeyFile, 'utf8').trim(), 'base64')
}

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.from(
    JSON.stringify({
      version: 1,
      alg: 'aes-256-gcm',
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      data: encrypted.toString('base64')
    })
  )
}

function isEncryptedPayload(payload) {
  return Boolean(payload && payload.version === 1 && payload.alg === 'aes-256-gcm' && payload.iv && payload.tag && payload.data)
}

function decryptPayload(payload) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(payload.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()])
}

function decryptBuffer(filePath) {
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return decryptPayload(payload)
}

function readMaybeEncryptedBuffer(filePath, options = {}) {
  let buffer = fs.readFileSync(filePath)
  const maxDepth = 50
  for (let depth = 0; depth < maxDepth; depth += 1) {
    try {
      const payload = JSON.parse(buffer.toString('utf8'))
      if (!isEncryptedPayload(payload)) return buffer
      try {
        buffer = decryptPayload(payload)
      } catch (error) {
        if (options.strict) throw new Error(`No se pudo descifrar ${path.basename(filePath)} con la llave local.`)
        return buffer
      }
    } catch {
      return buffer
    }
  }
  if (options.strict) throw new Error(`${path.basename(filePath)} sigue cifrada despues de ${maxDepth} capas; vuelve a cargar la base de lineas desde el CRM.`)
  return buffer
}

function encryptJson(filePath, payload) {
  writeAtomic(filePath, encryptBuffer(Buffer.from(JSON.stringify(payload, null, 2), 'utf8')))
}

function decryptJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback
  return JSON.parse(decryptBuffer(filePath).toString('utf8'))
}

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    ...extraHeaders
  })
  res.end(JSON.stringify(payload))
}

function sendBuffer(res, status, buffer, contentType) {
  res.writeHead(status, {
    'Content-Type': contentType || 'application/octet-stream',
    'Cache-Control': 'no-store, max-age=0'
  })
  res.end(buffer)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let total = 0
    req.on('data', (chunk) => {
      total += chunk.length
      if (total > maxBodyBytes) {
        reject(new Error('Payload demasiado grande.'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function safeFileName(value) {
  return String(value || 'archivo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function safeCategory(value) {
  return safeFileName(value || 'general').replace(/\./g, '-') || 'general'
}

function cookieHeader(req) {
  return Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=')
        return index >= 0 ? [part.slice(0, index), decodeURIComponent(part.slice(index + 1))] : [part, '']
      })
  )
}

function currentSession(req) {
  const token = cookieHeader(req).klifnet_session
  if (!token) return null
  const session = sessions.get(token)
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token)
    return null
  }
  session.expiresAt = Date.now() + sessionTtlMs
  return session
}

function requireSession(req, res) {
  const session = currentSession(req)
  if (session) return session
  sendJson(res, 401, { ok: false, error: 'Necesitas iniciar sesion.' })
  return null
}

function loadUsers() {
  return decryptJson(usersFile, { users: [], createdAt: new Date().toISOString() })
}

function saveUsers(payload) {
  encryptJson(usersFile, payload)
}

function passwordHash(password, salt = crypto.randomBytes(16).toString('base64')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('base64')
  return { salt, hash }
}

function verifyPassword(password, user) {
  const current = passwordHash(password, user.salt).hash
  return crypto.timingSafeEqual(Buffer.from(current), Buffer.from(user.passwordHash))
}

function setUserPassword(user, password) {
  const hashed = passwordHash(password)
  user.salt = hashed.salt
  user.passwordHash = hashed.hash
  user.passwordChangedAt = new Date().toISOString()
}

function secureToken(prefix = 'KR') {
  return `${prefix}-${crypto.randomBytes(18).toString('base64url').toUpperCase().match(/.{1,6}/g).join('-')}`
}

function keyedTokenHash(token) {
  return crypto.createHmac('sha256', getEncryptionKey()).update(String(token || '').trim()).digest('hex')
}

function allowedAuthEmails() {
  const configured = String(process.env.KLIFNET_ALLOWED_EMAILS || '')
    .split(/[,\s;]+/g)
    .map(normalizeEmail)
    .filter(Boolean)
  return configured.length ? configured : defaultAllowedEmails
}

function isAllowedAuthEmail(email) {
  return allowedAuthEmails().includes(normalizeEmail(email))
}

function loadPasswordResets() {
  return decryptJson(passwordResetFile, { tokens: [] })
}

function savePasswordResets(payload) {
  encryptJson(passwordResetFile, payload)
}

function createPasswordReset(email) {
  const token = secureToken('KR')
  const payload = loadPasswordResets()
  const now = new Date()
  payload.tokens = (payload.tokens || []).filter((record) => !record.usedAt && new Date(record.expiresAt).getTime() > Date.now())
  payload.tokens.push({
    email,
    hash: keyedTokenHash(token),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + resetTokenTtlMs).toISOString(),
    usedAt: ''
  })
  savePasswordResets(payload)
  return token
}

function verifyPasswordReset(email, token) {
  const payload = loadPasswordResets()
  const hash = keyedTokenHash(String(token || '').trim())
  const record = (payload.tokens || []).find((candidate) => candidate.email === email && candidate.hash === hash && !candidate.usedAt)
  if (!record || new Date(record.expiresAt).getTime() < Date.now()) return null
  return { payload, record }
}

function markPasswordResetUsed(validatedToken) {
  if (!validatedToken?.record || !validatedToken?.payload) return
  validatedToken.record.usedAt = new Date().toISOString()
  savePasswordResets(validatedToken.payload)
}

function consumePasswordReset(email, token) {
  const validatedToken = verifyPasswordReset(email, token)
  if (!validatedToken) return false
  markPasswordResetUsed(validatedToken)
  return true
}

function loadOneTimeTokens() {
  return decryptJson(oneTimeTokensFile, { tokens: [] })
}

function saveOneTimeTokens(payload) {
  encryptJson(oneTimeTokensFile, payload)
}

function verifyOneTimeToken(token) {
  if (!fs.existsSync(oneTimeTokensFile)) return null
  const payload = loadOneTimeTokens()
  const hash = keyedTokenHash(String(token || '').trim())
  const record = (payload.tokens || []).find((candidate) => candidate.hash === hash && !candidate.usedAt)
  if (!record) return null
  return { payload, record }
}

function markOneTimeTokenUsed(validatedToken, email) {
  if (!validatedToken?.record || !validatedToken?.payload) return
  validatedToken.record.usedAt = new Date().toISOString()
  validatedToken.record.usedBy = email
  saveOneTimeTokens(validatedToken.payload)
}

function consumeOneTimeToken(token, email) {
  const validatedToken = verifyOneTimeToken(token)
  if (!validatedToken) return false
  markOneTimeTokenUsed(validatedToken, email)
  return true
}

function cleanSmtpAddress(value) {
  return String(value || '').trim().replace(/[<>"\r\n]/g, '')
}

function cleanHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim()
}

function encodeMailHeader(value) {
  return `=?UTF-8?B?${Buffer.from(cleanHeader(value), 'utf8').toString('base64')}?=`
}

function formatMailAddress(name, email) {
  const address = cleanSmtpAddress(email)
  const label = cleanHeader(name)
  return label ? `"${label.replace(/"/g, "'")}" <${address}>` : `<${address}>`
}

function dotStuff(message) {
  return String(message)
    .replace(/\r?\n/g, '\r\n')
    .split('\r\n')
    .map((line) => (line.startsWith('.') ? `.${line}` : line))
    .join('\r\n')
}

function smtpConfig() {
  const smtpHost = process.env.KLIFNET_SMTP_HOST
  if (!smtpHost) return null
  const secure = String(process.env.KLIFNET_SMTP_SECURE || '').toLowerCase() === 'true'
  const smtpPort = Number(process.env.KLIFNET_SMTP_PORT || (secure ? 465 : 587))
  const smtpUser = process.env.KLIFNET_SMTP_USER || ''
  const smtpFrom = process.env.KLIFNET_SMTP_FROM || smtpUser
  if (!smtpFrom) throw new Error('Falta KLIFNET_SMTP_FROM o KLIFNET_SMTP_USER.')
  return {
    host: smtpHost,
    port: smtpPort,
    secure,
    user: smtpUser,
    pass: process.env.KLIFNET_SMTP_PASS || '',
    from: smtpFrom,
    name: process.env.KLIFNET_SMTP_NAME || 'KLIFNET CRM'
  }
}

function createSmtpClient(socket) {
  let currentSocket = socket
  let buffer = ''
  let waiting = null

  function takeResponse() {
    const lines = buffer.split('\n')
    if (!buffer.endsWith('\n')) lines.pop()
    let consumed = 0
    const responseLines = []
    for (const line of lines) {
      consumed += line.length + 1
      const cleaned = line.replace(/\r$/, '')
      responseLines.push(cleaned)
      if (/^\d{3} /.test(cleaned)) {
        buffer = buffer.slice(consumed)
        return responseLines.join('\n')
      }
    }
    return null
  }

  function resolveWaiting() {
    if (!waiting) return
    const response = takeResponse()
    if (!response) return
    const current = waiting
    waiting = null
    current.cleanup()
    current.resolve(response)
  }

  function onData(chunk) {
    buffer += chunk.toString('utf8').replace(/\r\n/g, '\n')
    resolveWaiting()
  }

  function read() {
    const response = takeResponse()
    if (response) return Promise.resolve(response)
    return new Promise((resolve, reject) => {
      function cleanup() {
        currentSocket.off('error', onError)
        currentSocket.off('close', onClose)
      }
      function onError(error) {
        cleanup()
        waiting = null
        reject(error)
      }
      function onClose() {
        cleanup()
        waiting = null
        reject(new Error('Conexion SMTP cerrada.'))
      }
      waiting = { resolve, reject, cleanup }
      currentSocket.once('error', onError)
      currentSocket.once('close', onClose)
    })
  }

  currentSocket.on('data', onData)

  return {
    get socket() {
      return currentSocket
    },
    write(command) {
      currentSocket.write(command)
    },
    replaceSocket(nextSocket) {
      currentSocket.off('data', onData)
      currentSocket = nextSocket
      buffer = ''
      currentSocket.on('data', onData)
    },
    read,
    end() {
      currentSocket.end()
    }
  }
}

function connectSmtp(config) {
  return new Promise((resolve, reject) => {
    const socket = config.secure
      ? tls.connect({ host: config.host, port: config.port, servername: config.host })
      : net.connect({ host: config.host, port: config.port })
    socket.setTimeout(30000, () => socket.destroy(new Error('Timeout SMTP.')))
    if (config.secure) {
      socket.once('secureConnect', () => resolve(createSmtpClient(socket)))
    } else {
      socket.once('connect', () => resolve(createSmtpClient(socket)))
    }
    socket.once('error', reject)
  })
}

async function smtpCommand(client, command, expectedCodes) {
  if (command) client.write(`${command}\r\n`)
  const response = await client.read()
  const code = Number(response.slice(0, 3))
  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP respondio ${response}`)
  }
  return response
}

async function upgradeSmtpToTls(client, host) {
  await smtpCommand(client, 'STARTTLS', [220])
  const secureSocket = tls.connect({ socket: client.socket, servername: host })
  await new Promise((resolve, reject) => {
    secureSocket.once('secureConnect', resolve)
    secureSocket.once('error', reject)
  })
  client.replaceSocket(secureSocket)
}

function normalizeEmailList(value) {
  const values = Array.isArray(value) ? value.flat(Infinity) : String(value || '').split(/[;,\s]+/g)
  return Array.from(new Set(values.map(normalizeEmail).filter(isValidEmail)))
}

function formatMailAddressList(emails = []) {
  return emails.map((email) => formatMailAddress('', email)).join(', ')
}

async function sendSmtpMail({ to, cc = [], bcc = [], subject, text }) {
  const config = smtpConfig()
  if (!config) return false
  const client = await connectSmtp(config)
  try {
    await smtpCommand(client, '', [220])
    let ehlo = await smtpCommand(client, `EHLO ${os.hostname() || 'klifnet-crm'}`, [250])
    if (!config.secure && /STARTTLS/i.test(ehlo)) {
      await upgradeSmtpToTls(client, config.host)
      ehlo = await smtpCommand(client, `EHLO ${os.hostname() || 'klifnet-crm'}`, [250])
    }
    if (config.user && config.pass) {
      await smtpCommand(client, 'AUTH LOGIN', [334])
      await smtpCommand(client, Buffer.from(config.user, 'utf8').toString('base64'), [334])
      await smtpCommand(client, Buffer.from(config.pass, 'utf8').toString('base64'), [235])
    }
    const fromAddress = cleanSmtpAddress(config.from)
    const toAddresses = normalizeEmailList(to).map(cleanSmtpAddress)
    const ccAddresses = normalizeEmailList(cc).map(cleanSmtpAddress)
    const bccAddresses = normalizeEmailList(bcc).map(cleanSmtpAddress)
    const allRecipients = Array.from(new Set([...toAddresses, ...ccAddresses, ...bccAddresses]))
    if (!toAddresses.length || !allRecipients.length) throw new Error('Correo sin destinatario Para valido.')
    const domain = fromAddress.split('@')[1] || 'klifnet.local'
    const headers = [
      `From: ${formatMailAddress(config.name, fromAddress)}`,
      `To: ${formatMailAddressList(toAddresses)}`,
      ...(ccAddresses.length ? [`Cc: ${formatMailAddressList(ccAddresses)}`] : []),
      `Subject: ${encodeMailHeader(subject)}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@${domain}>`
    ]
    await smtpCommand(client, `MAIL FROM:<${fromAddress}>`, [250])
    for (const recipient of allRecipients) {
      await smtpCommand(client, `RCPT TO:<${recipient}>`, [250, 251])
    }
    await smtpCommand(client, 'DATA', [354])
    await smtpCommand(client, `${dotStuff(`${headers.join('\r\n')}\r\n\r\n${text}`)}\r\n.`, [250])
    await smtpCommand(client, 'QUIT', [221])
    return true
  } finally {
    client.end()
  }
}

async function deliverResetToken(email, token) {
  const subject = 'Token recuperacion KLIFNET CRM'
  const message = `Token de recuperacion KLIFNET CRM para ${email}: ${token}\nVence en 20 minutos.\n`
  let deliveryError = ''
  if (process.env.KLIFNET_SMTP_HOST) {
    try {
      await sendSmtpMail({ to: email, subject, text: message })
      return { sent: true, via: 'smtp' }
    } catch (error) {
      deliveryError = error.message || 'Error SMTP desconocido.'
      console.error(`No se pudo enviar token por SMTP: ${deliveryError}`)
    }
  } else {
    deliveryError = 'SMTP no configurado en .env.'
  }
  if (process.env.KLIFNET_RESET_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.KLIFNET_RESET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, text: message, token })
      })
      if (response.ok) return { sent: true, via: 'webhook' }
      deliveryError = `${deliveryError ? `${deliveryError} ` : ''}Webhook respondio ${response.status}.`
    } catch (error) {
      deliveryError = `${deliveryError ? `${deliveryError} ` : ''}${error.message || 'Error webhook desconocido.'}`
    }
  }
  fs.appendFileSync(passwordResetOutboxFile, `${new Date().toISOString()} ${message}`, { encoding: 'utf8', mode: 0o600 })
  return { sent: false, via: 'local', path: passwordResetOutboxFile, error: deliveryError }
}

function isValidEmail(value) {
  const email = normalizeEmail(value)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

async function sendBillingEmailBatch(messages = []) {
  if (!smtpConfig()) throw new Error('SMTP no configurado en .env.')
  const cleanMessages = messages
    .slice(0, 100)
    .map((message) => ({
      to: normalizeEmailList(message.to),
      cc: normalizeEmailList(message.cc),
      bcc: normalizeEmailList(message.bcc),
      subject: cleanHeader(message.subject || 'KLIFNET CRM - Facturacion'),
      text: String(message.text || '').trim()
    }))
    .filter((message) => message.to.length && message.subject && message.text)
  const results = []
  for (const message of cleanMessages) {
    try {
      const sent = await sendSmtpMail(message)
      results.push({ to: message.to.join(', '), cc: message.cc.join(', '), bcc: message.bcc.length, sent: Boolean(sent), error: sent ? '' : 'SMTP no configurado.' })
    } catch (error) {
      results.push({ to: message.to.join(', '), cc: message.cc.join(', '), bcc: message.bcc.length, sent: false, error: error.message || 'Error SMTP.' })
    }
  }
  return {
    requested: messages.length,
    accepted: cleanMessages.length,
    sent: results.filter((result) => result.sent).length,
    failed: results.filter((result) => !result.sent).length,
    results
  }
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email,
    role: user.role || 'usuario',
    createdAt: user.createdAt || ''
  }
}

function prepareAuthStore() {
  const payload = loadUsers()
  if (payload.users.length) {
    const allowed = new Set(allowedAuthEmails())
    const before = payload.users.length
    payload.users = payload.users.filter((user) => allowed.has(normalizeEmail(user.email)))
    if (payload.users.length !== before) {
      saveUsers(payload)
      console.log('Usuarios fuera de la lista permitida fueron removidos.')
    }
    return
  }
  console.log(`Sin usuarios iniciales. Crea el primer acceso con correo autorizado y token. Correos permitidos: ${allowedAuthEmails().join(', ')}`)
}

function importLegacyStateIfNeeded() {
  const archiveLegacyState = (suffix) => {
    const archivedFile = `${legacyStateFile}.${suffix}`
    if (fs.existsSync(archivedFile)) fs.rmSync(archivedFile)
    fs.renameSync(legacyStateFile, archivedFile)
  }
  if (!fs.existsSync(legacyStateFile)) return
  if (fs.existsSync(stateFile)) {
    archiveLegacyState('ignored')
    return
  }
  const allowLegacyImport = String(process.env.KLIFNET_ALLOW_LEGACY_STATE_IMPORT || '').toLowerCase() === 'true'
  if (!allowLegacyImport) {
    archiveLegacyState('ignored')
    console.warn('Se ignoro server-state.json legado para evitar contaminar el estado cifrado. Usa KLIFNET_ALLOW_LEGACY_STATE_IMPORT=true si necesitas migrarlo manualmente.')
    return
  }
  const legacy = JSON.parse(fs.readFileSync(legacyStateFile, 'utf8'))
  encryptJson(stateFile, legacy)
  archiveLegacyState('migrated')
}

function readState() {
  return decryptJson(stateFile, { updatedAt: '', state: null })
}

function writeState(payload) {
  encryptJson(stateFile, payload)
}

function userStateFile(session) {
  const userKey = session?.userId || normalizeEmail(session?.email) || 'anon'
  const safeUserKey = safeFileName(userKey) || 'anon'
  return path.join(userStateDir, `${safeUserKey}.enc`)
}

function readUserState(session) {
  const filePath = userStateFile(session)
  if (fs.existsSync(filePath)) {
    return decryptJson(filePath, { updatedAt: '', state: null })
  }
  // Compatibilidad: usa el estado global solo como lectura inicial.
  return readState()
}

function writeUserState(session, payload) {
  const filePath = userStateFile(session)
  encryptJson(filePath, payload)
}

function privateFilePath(kind, options = {}) {
  const mapped = privateFileMap[kind]
  if (!mapped) return ''
  if (!Array.isArray(mapped)) return path.join(privateFilesDir, mapped)
  if (options.forWrite) return path.join(privateFilesDir, mapped[0])
  const existing = mapped.find((fileName) => fs.existsSync(path.join(privateFilesDir, fileName)))
  return path.join(privateFilesDir, existing || mapped[0])
}

function privateFileCandidates(kind) {
  const mapped = privateFileMap[kind]
  if (!mapped) return []
  return (Array.isArray(mapped) ? mapped : [mapped]).map((fileName) => path.join(privateFilesDir, fileName))
}

function normalizeLineBasePayload(payload) {
  if (Array.isArray(payload)) return { source: 'base_relacion_lineas_array', lineas: payload, normalizedLineas: true }
  if (Array.isArray(payload?.lineas)) return payload
  if (Array.isArray(payload?.lines)) return { ...payload, lineas: payload.lines, normalizedLineas: true }
  if (Array.isArray(payload?.state?.lines)) {
    return {
      source: payload.source || 'server-state-lines',
      updatedAt: payload.updatedAt || '',
      lineas: payload.state.lines,
      normalizedLineas: true
    }
  }
  return null
}

function readPrivateFile(kind) {
  const candidates = privateFileCandidates(kind).filter((filePath) => fs.existsSync(filePath))
  let lastError = ''
  for (const filePath of candidates) {
    try {
      const buffer = readMaybeEncryptedBuffer(filePath, { strict: true })
      if (kind === 'lineas') {
        const payload = JSON.parse(buffer.toString('utf8'))
        const normalizedPayload = normalizeLineBasePayload(payload)
        if (!normalizedPayload) {
          const keys = Array.isArray(payload) ? ['array'] : Object.keys(payload || {}).slice(0, 12)
          lastError = `${path.basename(filePath)} no trae lineas[], lines[] ni state.lines[]. Campos encontrados: ${keys.join(', ') || 'sin campos'}.`
          continue
        }
        return { buffer: Buffer.from(JSON.stringify(normalizedPayload)), filePath }
      }
      return { buffer, filePath }
    } catch (error) {
      lastError = error.message || String(error)
    }
  }
  const error = new Error(lastError || 'Base privada no encontrada.')
  error.statusCode = candidates.length ? 409 : 404
  throw error
}

function writeEncryptedUpload(category, fileName, data) {
  const extension = path.extname(fileName)
  const baseName = path.basename(fileName, extension)
  const uploadDir = path.join(uploadsDir, safeCategory(category))
  fs.mkdirSync(uploadDir, { recursive: true })
  const stampedName = `${new Date().toISOString().replace(/[:.]/g, '-')}-${baseName}${extension}.enc`
  const outputPath = path.join(uploadDir, stampedName)
  writeAtomic(outputPath, encryptBuffer(data))
  return outputPath
}

async function handleAuth(req, res, url) {
  const usersPayload = loadUsers()

  if (url.pathname === '/api/auth/me' && req.method === 'GET') {
    const session = currentSession(req)
    if (!session) {
      sendJson(res, 200, { ok: true, user: null, users: [], setupRequired: usersPayload.users.length === 0, allowedEmails: allowedAuthEmails() })
      return true
    }
    const user = usersPayload.users.find((candidate) => candidate.id === session.userId)
    sendJson(res, 200, {
      ok: true,
      user: user ? publicUser(user) : null,
      users: user?.role === 'admin' ? usersPayload.users.map(publicUser) : [],
      setupRequired: usersPayload.users.length === 0,
      allowedEmails: allowedAuthEmails()
    })
    return true
  }

  if (url.pathname === '/api/auth/setup-info' && req.method === 'GET') {
    sendJson(res, 200, {
      ok: true,
      setupRequired: usersPayload.users.length === 0,
      allowedEmails: allowedAuthEmails()
    })
    return true
  }

  if (url.pathname === '/api/auth/setup-token' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req))
    const email = normalizeEmail(body.email)
    if (!email || !isAllowedAuthEmail(email)) {
      sendJson(res, 403, { ok: false, error: 'Ese correo no esta autorizado para crear cuenta.' })
      return true
    }
    const token = createPasswordReset(email)
    const delivery = await deliverResetToken(email, token)
    sendJson(res, 200, {
      ok: true,
      message: 'Token generado.',
      delivered: Boolean(delivery.sent),
      fallback: delivery.sent ? '' : 'Servidor local',
      tokenPath: delivery.sent ? '' : 'data/password-reset-tokens.txt',
      smtpError: delivery.error || ''
    })
    return true
  }

  if (url.pathname === '/api/auth/setup' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req))
    const email = normalizeEmail(body.email)
    const token = String(body.token || '').trim()
    const password = String(body.password || '')
    if (!email || !isAllowedAuthEmail(email)) {
      sendJson(res, 403, { ok: false, error: 'Ese correo no esta autorizado para crear cuenta.' })
      return true
    }
    if (!token || password.length < 8) {
      sendJson(res, 400, { ok: false, error: 'Captura token y password de minimo 8 caracteres.' })
      return true
    }
    if (usersPayload.users.some((user) => normalizeEmail(user.email) === email)) {
      sendJson(res, 409, { ok: false, error: 'Ese correo ya tiene cuenta.' })
      return true
    }
    const passwordResetToken = verifyPasswordReset(email, token)
    const oneTimeToken = passwordResetToken ? null : verifyOneTimeToken(token)
    if (!passwordResetToken && !oneTimeToken) {
      sendJson(res, 401, { ok: false, error: 'Token invalido, expirado o usado.' })
      return true
    }
    const hashed = passwordHash(password)
    usersPayload.users.push({
      id: crypto.randomUUID(),
      email,
      name: body.name || email,
      role: usersPayload.users.length === 0 ? 'admin' : 'usuario',
      salt: hashed.salt,
      passwordHash: hashed.hash,
      createdAt: new Date().toISOString()
    })
    usersPayload.createdAt = usersPayload.createdAt || new Date().toISOString()
    saveUsers(usersPayload)
    if (passwordResetToken) markPasswordResetUsed(passwordResetToken)
    if (oneTimeToken) markOneTimeTokenUsed(oneTimeToken, email)
    sendJson(res, 200, { ok: true })
    return true
  }

  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req))
    const email = normalizeEmail(body.email)
    const user = usersPayload.users.find((candidate) => candidate.email === email)
    if (!user || !verifyPassword(body.password || '', user)) {
      sendJson(res, 401, { ok: false, error: 'Correo o password incorrectos.' })
      return true
    }
    const token = crypto.randomBytes(32).toString('base64url')
    sessions.set(token, { userId: user.id, email: user.email, role: user.role || 'usuario', expiresAt: Date.now() + sessionTtlMs })
    sendJson(res, 200, { ok: true, user: publicUser(user), users: user.role === 'admin' ? usersPayload.users.map(publicUser) : [] }, {
      'Set-Cookie': `klifnet_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(sessionTtlMs / 1000)}`
    })
    return true
  }

  if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
    const token = cookieHeader(req).klifnet_session
    if (token) sessions.delete(token)
    sendJson(res, 200, { ok: true }, { 'Set-Cookie': 'klifnet_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' })
    return true
  }

  if (url.pathname === '/api/auth/change-password' && req.method === 'POST') {
    const session = requireSession(req, res)
    if (!session) return true
    const body = JSON.parse(await readBody(req))
    const user = usersPayload.users.find((candidate) => candidate.id === session.userId)
    const newPassword = String(body.newPassword || '')
    if (!user || !verifyPassword(body.currentPassword || '', user)) {
      sendJson(res, 401, { ok: false, error: 'Password actual incorrecto.' })
      return true
    }
    if (newPassword.length < 8) {
      sendJson(res, 400, { ok: false, error: 'El password nuevo debe tener minimo 8 caracteres.' })
      return true
    }
    setUserPassword(user, newPassword)
    saveUsers(usersPayload)
    sendJson(res, 200, { ok: true })
    return true
  }

  if (url.pathname === '/api/auth/forgot-password' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req))
    const email = normalizeEmail(body.email)
    const user = usersPayload.users.find((candidate) => candidate.email === email)
    let delivery = { sent: false }
    if (user) {
      const token = createPasswordReset(email)
      delivery = await deliverResetToken(email, token)
    }
    sendJson(res, 200, {
      ok: true,
      message: 'Si el correo existe, se genero un token de recuperacion.',
      delivered: Boolean(delivery.sent),
      fallback: delivery.sent ? '' : 'Servidor local',
      tokenPath: delivery.sent ? '' : 'data/password-reset-tokens.txt',
      smtpError: delivery.error || ''
    })
    return true
  }

  if (url.pathname === '/api/auth/reset-password' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req))
    const email = normalizeEmail(body.email)
    const token = String(body.token || '').trim()
    const newPassword = String(body.newPassword || '')
    const user = usersPayload.users.find((candidate) => candidate.email === email)
    if (!user || !token || newPassword.length < 8) {
      sendJson(res, 400, { ok: false, error: 'Captura correo, token y password nuevo de minimo 8 caracteres.' })
      return true
    }
    const passwordResetToken = verifyPasswordReset(email, token)
    const oneTimeToken = passwordResetToken ? null : verifyOneTimeToken(token)
    if (!passwordResetToken && !oneTimeToken) {
      sendJson(res, 401, { ok: false, error: 'Token invalido, expirado o usado.' })
      return true
    }
    setUserPassword(user, newPassword)
    saveUsers(usersPayload)
    if (passwordResetToken) markPasswordResetUsed(passwordResetToken)
    if (oneTimeToken) markOneTimeTokenUsed(oneTimeToken, email)
    sendJson(res, 200, { ok: true })
    return true
  }

  if (url.pathname === '/api/users' && req.method === 'POST') {
    const session = requireSession(req, res)
    if (!session) return true
    if (session.role !== 'admin') {
      sendJson(res, 403, { ok: false, error: 'Solo admin puede crear usuarios.' })
      return true
    }
    const body = JSON.parse(await readBody(req))
    const email = normalizeEmail(body.email)
    const password = String(body.password || '')
    if (!isAllowedAuthEmail(email)) {
      sendJson(res, 403, { ok: false, error: 'Ese correo no esta autorizado para crear cuenta.' })
      return true
    }
    if (!email || password.length < 8) {
      sendJson(res, 400, { ok: false, error: 'Captura correo y password de minimo 8 caracteres.' })
      return true
    }
    if (usersPayload.users.some((user) => user.email === email)) {
      sendJson(res, 409, { ok: false, error: 'Ese correo ya existe.' })
      return true
    }
    const hashed = passwordHash(password)
    usersPayload.users.push({
      id: crypto.randomUUID(),
      email,
      name: body.name || email,
      role: body.role === 'admin' ? 'admin' : 'usuario',
      salt: hashed.salt,
      passwordHash: hashed.hash,
      createdAt: new Date().toISOString()
    })
    saveUsers(usersPayload)
    sendJson(res, 200, { ok: true, users: usersPayload.users.map(publicUser) })
    return true
  }

  if (url.pathname.startsWith('/api/users/') && req.method === 'DELETE') {
    const session = requireSession(req, res)
    if (!session) return true
    if (session.role !== 'admin') {
      sendJson(res, 403, { ok: false, error: 'Solo admin puede borrar usuarios.' })
      return true
    }
    const id = decodeURIComponent(url.pathname.split('/').pop() || '')
    if (id === session.userId) {
      sendJson(res, 400, { ok: false, error: 'No puedes borrar tu propio usuario activo.' })
      return true
    }
    usersPayload.users = usersPayload.users.filter((user) => user.id !== id)
    saveUsers(usersPayload)
    sendJson(res, 200, { ok: true, users: usersPayload.users.map(publicUser) })
    return true
  }

  return false
}

async function handleApi(req, res, url) {
  try {
    if (await handleAuth(req, res, url)) return
    const session = requireSession(req, res)
    if (!session) return

    if (url.pathname === '/api/state' && req.method === 'GET') {
      const saved = readUserState(session)
      sendJson(res, 200, { ok: true, state: saved.state || null, updatedAt: saved.updatedAt || '' })
      return
    }

    if (url.pathname === '/api/state' && (req.method === 'POST' || req.method === 'PUT')) {
      const body = JSON.parse(await readBody(req))
      const updatedAt = new Date().toISOString()
      writeUserState(session, {
        updatedAt,
        savedFrom: req.socket.remoteAddress || '',
        savedBy: session.email,
        state: body.state || body
      })
      sendJson(res, 200, { ok: true, updatedAt })
      return
    }

    if (url.pathname === '/api/billing/send-emails' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req))
      const batch = await sendBillingEmailBatch(Array.isArray(body.messages) ? body.messages : [])
      sendJson(res, 200, {
        ok: true,
        message: `Correos enviados: ${batch.sent}. Fallidos: ${batch.failed}.`,
        ...batch
      })
      return
    }

    if (url.pathname === '/api/private-file' && req.method === 'GET') {
      const kind = url.searchParams.get('kind')
      try {
        const file = readPrivateFile(kind)
        sendBuffer(res, 200, file.buffer, binaryTypes[kind] || 'application/octet-stream')
      } catch (error) {
        sendJson(res, error.statusCode || 500, { ok: false, error: error.message || 'No se pudo abrir la base privada.' })
        return
      }
      return
    }

    if (url.pathname === '/api/private-file' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req))
      const kind = body.kind
      const filePath = privateFilePath(kind, { forWrite: true })
      if (!filePath) {
        sendJson(res, 400, { ok: false, error: 'Tipo de base privada invalido.' })
        return
      }
      const data = Buffer.from(String(body.dataBase64 || ''), 'base64')
      writeAtomic(filePath, encryptBuffer(data))
      sendJson(res, 200, { ok: true, kind, bytes: data.length })
      return
    }

    if (url.pathname === '/api/uploads' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req))
      const category = safeCategory(body.category)
      const fileName = safeFileName(body.filename)
      const data = Buffer.from(String(body.dataBase64 || ''), 'base64')
      const outputPath = writeEncryptedUpload(category, fileName, data)
      sendJson(res, 200, {
        ok: true,
        path: path.relative(rootDir, outputPath).replace(/\\/g, '/'),
        encrypted: true,
        bytes: data.length
      })
      return
    }

    sendJson(res, 404, { ok: false, error: 'API no encontrada.' })
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message || 'Error de servidor.' })
  }
}

function serveStatic(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`)
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url)
    return
  }

  if (url.pathname.startsWith('/public/data/') || url.pathname.startsWith('/public/templates/')) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  const requestPath = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)
  const absolutePath = path.resolve(rootDir, `.${requestPath}`)

  if (!absolutePath.startsWith(rootDir)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  const extension = path.extname(absolutePath).toLowerCase()
  res.writeHead(200, {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'Cache-Control': 'no-store, max-age=0'
  })
  fs.createReadStream(absolutePath).pipe(res)
}

ensureDataDirs()
prepareAuthStore()
importLegacyStateIfNeeded()

const server = http.createServer(serveStatic)

function localNetworkUrls() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((network) => network && network.family === 'IPv4' && !network.internal)
    .map((network) => `http://${network.address}:${port}`)
}

server.listen(port, host, () => {
  console.log(`KLIFNET CRM listo en http://127.0.0.1:${port}`)
  if (host === '0.0.0.0') {
    const urls = localNetworkUrls()
    if (urls.length) {
      console.log('Acceso desde la red WiFi:')
      urls.forEach((url) => console.log(`  ${url}`))
    }
  }
})
