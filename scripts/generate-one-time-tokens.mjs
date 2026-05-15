import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const dataDir = path.join(rootDir, 'data')
const keyFile = path.join(dataDir, 'secret.key')
const tokenVaultFile = path.join(dataDir, 'one-time-tokens.enc')
const tokenCount = Number(process.argv[2] || 10000)
const force = process.argv.includes('--force')

function ensureDataDir() {
  fs.mkdirSync(dataDir, { recursive: true })
}

function getEncryptionKey() {
  ensureDataDir()
  if (!fs.existsSync(keyFile)) {
    fs.writeFileSync(keyFile, crypto.randomBytes(32).toString('base64'), { mode: 0o600 })
  }
  return Buffer.from(fs.readFileSync(keyFile, 'utf8').trim(), 'base64')
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

function writeAtomic(filePath, buffer) {
  const tempPath = `${filePath}.tmp`
  fs.writeFileSync(tempPath, buffer)
  fs.renameSync(tempPath, filePath)
}

function tokenValue() {
  return `KT-${crypto.randomBytes(18).toString('base64url').toUpperCase().match(/.{1,6}/g).join('-')}`
}

function tokenHash(token) {
  return crypto.createHmac('sha256', getEncryptionKey()).update(token).digest('hex')
}

if (!Number.isInteger(tokenCount) || tokenCount < 1 || tokenCount > 100000) {
  throw new Error('Cantidad invalida. Usa un numero entre 1 y 100000.')
}

if (fs.existsSync(tokenVaultFile) && !force) {
  throw new Error(`Ya existe ${tokenVaultFile}. Usa --force si quieres reemplazar la lista.`)
}

const generatedAt = new Date().toISOString()
const seen = new Set()
const plaintext = []
const records = []

while (records.length < tokenCount) {
  const token = tokenValue()
  if (seen.has(token)) continue
  seen.add(token)
  const id = `OTT-${String(records.length + 1).padStart(5, '0')}`
  plaintext.push(`${id},${token}`)
  records.push({
    id,
    hash: tokenHash(token),
    createdAt: generatedAt,
    usedAt: '',
    usedBy: ''
  })
}

const exportStamp = generatedAt.replace(/[:.]/g, '-')
const plaintextFile = path.join(dataDir, `one-time-tokens-${exportStamp}.csv`)
const vault = {
  generatedAt,
  total: records.length,
  algorithm: 'hmac-sha256',
  oneTime: true,
  tokens: records
}

writeAtomic(tokenVaultFile, encryptBuffer(Buffer.from(JSON.stringify(vault, null, 2), 'utf8')))
writeAtomic(plaintextFile, Buffer.from(`id,token\n${plaintext.join('\n')}\n`, 'utf8'))

console.log(JSON.stringify({ tokenVaultFile, plaintextFile, total: records.length }, null, 2))
