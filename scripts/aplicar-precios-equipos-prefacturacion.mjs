import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const secretKeyFile = path.join(repoRoot, 'data', 'secret.key')
const userStatesDir = path.join(repoRoot, 'data', 'user-states')
const defaultReportFile = 'C:/Users/dimpu/Downloads/descargas de videos/reporte_facturacion_junio_2026.xlsx'

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] || fallback : fallback
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function getEncryptionKey() {
  if (process.env.KLIFNET_SECRET_KEY) return crypto.createHash('sha256').update(process.env.KLIFNET_SECRET_KEY).digest()
  return Buffer.from(fs.readFileSync(secretKeyFile, 'utf8').trim(), 'base64')
}

function isEncryptedPayload(payload) {
  return Boolean(payload && payload.version === 1 && payload.alg === 'aes-256-gcm' && payload.iv && payload.tag && payload.data)
}

function decryptPayload(payload) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(payload.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()])
}

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  return Buffer.from(
    JSON.stringify({
      version: 1,
      alg: 'aes-256-gcm',
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      data: encrypted.toString('base64')
    })
  )
}

function decryptJson(filePath) {
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!isEncryptedPayload(payload)) return payload
  return JSON.parse(decryptPayload(payload).toString('utf8'))
}

function writeEncryptedJson(filePath, payload) {
  const tempPath = `${filePath}.tmp`
  fs.writeFileSync(tempPath, encryptBuffer(Buffer.from(JSON.stringify(payload, null, 2), 'utf8')))
  fs.renameSync(tempPath, filePath)
}

function latestUserStateFile() {
  const explicit = argValue('--state', '')
  if (explicit) return path.resolve(explicit)
  const files = fs
    .readdirSync(userStatesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.enc'))
    .map((entry) => path.join(userStatesDir, entry.name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
  if (!files.length) throw new Error('No encontre estados cifrados en data/user-states.')
  return files[0]
}

function text(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function cleanId(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' && Number.isFinite(value)) return String(Math.trunc(value))
  return String(value).replace(/\.0$/, '').replace(/\s+/g, '').trim()
}

function normalizeHeader(value) {
  return text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function rowValue(row, aliases = []) {
  const normalized = new Map(Object.keys(row || {}).map((key) => [normalizeHeader(key), key]))
  for (const alias of aliases) {
    const key = normalized.get(normalizeHeader(alias))
    if (key) return row[key]
  }
  return ''
}

function parseMoney(value) {
  const clean = String(value ?? '').replace(/[$,\s]/g, '').replace(',', '.')
  const number = Number(clean)
  return Number.isFinite(number) ? Number(number.toFixed(2)) : 0
}

function cleanBillingGroupName(value) {
  return text(value) || 'Principal'
}

function parsePaymentMonths(value) {
  return text(value)
    .split(/[,;|]/g)
    .map((month) => text(month))
    .filter(Boolean)
}

function deviceKeys(device = {}) {
  return [
    cleanId(device.id),
    cleanId(device.uid),
    cleanId(device.imei),
    cleanId(device.imeiLong),
    cleanId(device.imeiShort)
  ].filter(Boolean)
}

function rowKeys(row = {}) {
  return [
    cleanId(rowValue(row, ['UID'])),
    cleanId(rowValue(row, ['IMEI'])),
    cleanId(rowValue(row, ['IMEI largo'])),
    cleanId(rowValue(row, ['IMEI corto']))
  ].filter(Boolean)
}

function readEquipmentRows(reportFile) {
  const workbook = XLSX.readFile(reportFile, { cellText: false, cellDates: true })
  const sheetName = workbook.SheetNames.find((name) => normalizeHeader(name).includes('equipos')) || workbook.SheetNames[0]
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })
}

function applyPrices(payload, reportRows) {
  const state = payload.state || payload
  const devices = Array.isArray(state.devices) ? state.devices : []
  const deviceByKey = new Map()
  devices.forEach((device, index) => {
    deviceKeys(device).forEach((key) => {
      if (!deviceByKey.has(key)) deviceByKey.set(key, index)
    })
  })

  const result = { rows: reportRows.length, updated: 0, unmatched: [], skippedWithoutPrice: 0 }
  reportRows.forEach((row) => {
    const price = parseMoney(rowValue(row, ['Precio pactado a capturar'])) || parseMoney(rowValue(row, ['Precio actual CRM']))
    if (!price) {
      result.skippedWithoutPrice += 1
      return
    }
    const matchKey = rowKeys(row).find((key) => deviceByKey.has(key))
    if (!matchKey) {
      result.unmatched.push({
        empresa: text(rowValue(row, ['Empresa CRM origen'])),
        equipo: text(rowValue(row, ['Equipo'])),
        uid: cleanId(rowValue(row, ['UID'])),
        imei: cleanId(rowValue(row, ['IMEI largo'])) || cleanId(rowValue(row, ['IMEI']))
      })
      return
    }
    const index = deviceByKey.get(matchKey)
    const device = devices[index]
    devices[index] = {
      ...device,
      company: text(rowValue(row, ['Empresa CRM origen'])) || device.company,
      billingGroup: cleanBillingGroupName(rowValue(row, ['Grupo facturacion'])) || device.billingGroup,
      billingCycle: normalizeHeader(rowValue(row, ['Cobro'])) || device.billingCycle || 'mensual',
      paymentMonths: parsePaymentMonths(rowValue(row, ['Meses pago'])),
      renewalDate: text(rowValue(row, ['Fecha renovacion'])) || device.renewalDate || '',
      soldBy: text(rowValue(row, ['Vendido por'])) || device.soldBy || '',
      agreedPrice: price,
      priceNote: text(rowValue(row, ['Nota precio'])) || device.priceNote || 'Actualizado desde reporte de prefacturacion junio 2026',
      billable: true
    }
    result.updated += 1
  })
  state.devices = devices
  state.paymentImport = {
    source: path.basename(argValue('--report', defaultReportFile)),
    appliedAt: new Date().toISOString(),
    priceUpdateOnly: true,
    matchedById: result.updated,
    unmatchedRules: result.unmatched.length
  }
  if (payload.state) payload.state = state
  return result
}

function main() {
  const reportFile = path.resolve(argValue('--report', defaultReportFile))
  const stateFile = latestUserStateFile()
  const backupDir = path.join(repoRoot, 'data', 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupFile = path.join(backupDir, `${path.basename(stateFile)}.antes-precios-prefacturacion-${stamp()}`)
  fs.copyFileSync(stateFile, backupFile)
  const payload = decryptJson(stateFile)
  const rows = readEquipmentRows(reportFile)
  const result = applyPrices(payload, rows)
  writeEncryptedJson(stateFile, payload)
  const auditDir = path.join(repoRoot, 'outputs', 'facturacion')
  fs.mkdirSync(auditDir, { recursive: true })
  const auditFile = path.join(auditDir, `precios_equipos_aplicados_${stamp()}.json`)
  fs.writeFileSync(auditFile, JSON.stringify({ reportFile, stateFile, backupFile, result }, null, 2))
  console.log(`Estado actualizado: ${stateFile}`)
  console.log(`Respaldo: ${backupFile}`)
  console.log(`Auditoria: ${auditFile}`)
  console.log(`Filas reporte: ${result.rows}`)
  console.log(`Equipos actualizados: ${result.updated}`)
  console.log(`Sin match: ${result.unmatched.length}`)
  console.log(`Sin precio: ${result.skippedWithoutPrice}`)
}

main()
