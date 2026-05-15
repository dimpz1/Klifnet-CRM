import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
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
const legacyStateFile = path.join(dataDir, 'server-state.json')
const encryptionKeyFile = path.join(dataDir, 'secret.key')
const adminBootstrapFile = path.join(dataDir, 'admin-inicial.txt')
const maxBodyBytes = 50 * 1024 * 1024
const sessionTtlMs = 1000 * 60 * 60 * 12
const resetTokenTtlMs = 1000 * 60 * 20

const privateFileMap = {
  wialon: 'DispositivosWialon_Abril2026.xlsx.enc',
  pagos: 'Klifnet_Admon_Mensual_Pagos.xlsx.enc',
  cotizacion: 'cotizacion_CalidadSP.xlsx.enc',
  lineas: 'base_relacion_lineas.json.enc'
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
  lineas: 'application/json; charset=utf-8'
}

const sessions = new Map()

function ensureDataDirs() {
  fs.mkdirSync(uploadsDir, { recursive: true })
  fs.mkdirSync(privateFilesDir, { recursive: true })
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

function decryptBuffer(filePath) {
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(payload.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()])
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

function consumePasswordReset(email, token) {
  const payload = loadPasswordResets()
  const hash = keyedTokenHash(token)
  const record = (payload.tokens || []).find((candidate) => candidate.email === email && candidate.hash === hash && !candidate.usedAt)
  if (!record || new Date(record.expiresAt).getTime() < Date.now()) return false
  record.usedAt = new Date().toISOString()
  savePasswordResets(payload)
  return true
}

function loadOneTimeTokens() {
  return decryptJson(oneTimeTokensFile, { tokens: [] })
}

function saveOneTimeTokens(payload) {
  encryptJson(oneTimeTokensFile, payload)
}

function consumeOneTimeToken(token, email) {
  if (!fs.existsSync(oneTimeTokensFile)) return false
  const payload = loadOneTimeTokens()
  const hash = keyedTokenHash(token)
  const record = (payload.tokens || []).find((candidate) => candidate.hash === hash && !candidate.usedAt)
  if (!record) return false
  record.usedAt = new Date().toISOString()
  record.usedBy = email
  saveOneTimeTokens(payload)
  return true
}

async function deliverResetToken(email, token) {
  const message = `Token de recuperacion KLIFNET CRM para ${email}: ${token}\nVence en 20 minutos.\n`
  if (process.env.KLIFNET_RESET_WEBHOOK_URL) {
    const response = await fetch(process.env.KLIFNET_RESET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, subject: 'Token recuperacion KLIFNET CRM', text: message, token })
    })
    if (response.ok) return { sent: true, via: 'webhook' }
  }
  fs.appendFileSync(passwordResetOutboxFile, `${new Date().toISOString()} ${message}`, { encoding: 'utf8', mode: 0o600 })
  return { sent: false, via: 'local', path: passwordResetOutboxFile }
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
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

function bootstrapUsers() {
  const payload = loadUsers()
  if (payload.users.length) return
  const email = normalizeEmail(process.env.KLIFNET_ADMIN_EMAIL || 'felipe.gomez@klifnet.com')
  const password = process.env.KLIFNET_ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url')
  const hashed = passwordHash(password)
  payload.users.push({
    id: crypto.randomUUID(),
    email,
    name: 'Administrador',
    role: 'admin',
    salt: hashed.salt,
    passwordHash: hashed.hash,
    createdAt: new Date().toISOString()
  })
  payload.createdAt = payload.createdAt || new Date().toISOString()
  saveUsers(payload)
  console.log(`Usuario admin inicial: ${email}`)
  if (!process.env.KLIFNET_ADMIN_PASSWORD) {
    fs.writeFileSync(adminBootstrapFile, `Correo: ${email}\nPassword temporal: ${password}\n`, { mode: 0o600 })
    console.log(`Password temporal guardado en ${adminBootstrapFile}`)
  }
}

function importLegacyStateIfNeeded() {
  if (fs.existsSync(stateFile) || !fs.existsSync(legacyStateFile)) return
  const legacy = JSON.parse(fs.readFileSync(legacyStateFile, 'utf8'))
  encryptJson(stateFile, legacy)
  fs.renameSync(legacyStateFile, `${legacyStateFile}.migrated`)
}

function readState() {
  return decryptJson(stateFile, { updatedAt: '', state: null })
}

function writeState(payload) {
  encryptJson(stateFile, payload)
}

function privateFilePath(kind) {
  const mapped = privateFileMap[kind]
  return mapped ? path.join(privateFilesDir, mapped) : ''
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
      sendJson(res, 200, { ok: true, user: null, users: [] })
      return true
    }
    const user = usersPayload.users.find((candidate) => candidate.id === session.userId)
    sendJson(res, 200, {
      ok: true,
      user: user ? publicUser(user) : null,
      users: user?.role === 'admin' ? usersPayload.users.map(publicUser) : []
    })
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
      fallback: delivery.sent ? '' : 'Servidor local'
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
    const validToken = consumePasswordReset(email, token) || consumeOneTimeToken(token, email)
    if (!validToken) {
      sendJson(res, 401, { ok: false, error: 'Token invalido, expirado o usado.' })
      return true
    }
    setUserPassword(user, newPassword)
    saveUsers(usersPayload)
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
      const saved = readState()
      sendJson(res, 200, { ok: true, state: saved.state || null, updatedAt: saved.updatedAt || '' })
      return
    }

    if (url.pathname === '/api/state' && (req.method === 'POST' || req.method === 'PUT')) {
      const body = JSON.parse(await readBody(req))
      const updatedAt = new Date().toISOString()
      writeState({
        updatedAt,
        savedFrom: req.socket.remoteAddress || '',
        savedBy: session.email,
        state: body.state || body
      })
      sendJson(res, 200, { ok: true, updatedAt })
      return
    }

    if (url.pathname === '/api/private-file' && req.method === 'GET') {
      const kind = url.searchParams.get('kind')
      const filePath = privateFilePath(kind)
      if (!filePath || !fs.existsSync(filePath)) {
        sendJson(res, 404, { ok: false, error: 'Base privada no encontrada.' })
        return
      }
      sendBuffer(res, 200, decryptBuffer(filePath), binaryTypes[kind] || 'application/octet-stream')
      return
    }

    if (url.pathname === '/api/private-file' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req))
      const kind = body.kind
      const filePath = privateFilePath(kind)
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
bootstrapUsers()
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
