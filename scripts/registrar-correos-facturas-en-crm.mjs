import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const secretKeyFile = path.join(repoRoot, 'data', 'secret.key')
const userStatesDir = path.join(repoRoot, 'data', 'user-states')
const defaultReportFile = path.join(repoRoot, 'outputs', 'facturas_enviadas', '2026-06-01', 'relacion_facturas_enviadas_2026-06-01.json')
const ownRfcs = new Set(['EACR710305PQ2'])
const ignoredEmails = new Set(['felipe.gomez@klifnet.com', 'isaacgestrada94@gmail.com', 'satelitalsolution@gmail.com'])
const ignoredDomains = new Set(['klifnet.com'])

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

function normalizeRfc(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9&Ñ]/g, '').trim()
}

function normalizeHeader(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function text(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function validExternalEmails(value) {
  return String(value || '')
    .split(/[;,\s]+/g)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/i.test(email))
    .filter((email) => !ignoredEmails.has(email))
    .filter((email) => {
      const domain = email.split('@')[1] || ''
      return !ignoredDomains.has(domain)
    })
}

function emailCandidatesFromReport(reportFile) {
  const payload = JSON.parse(fs.readFileSync(reportFile, 'utf8'))
  const candidates = new Map()
  const ignored = { ownRfc: 0, noEmail: 0, internalEmail: 0, missingRfc: 0 }
  for (const record of payload.records || []) {
    const rfc = normalizeRfc(record.rfcReceptor)
    if (!rfc) {
      ignored.missingRfc += 1
      continue
    }
    if (ownRfcs.has(rfc)) {
      ignored.ownRfc += 1
      continue
    }
    const rawEmails = String(record.para || '').split(/[;,\s]+/g).filter(Boolean)
    const emails = validExternalEmails(record.para)
    if (!emails.length) {
      if (rawEmails.length) ignored.internalEmail += 1
      else ignored.noEmail += 1
      continue
    }
    if (!candidates.has(rfc)) {
      candidates.set(rfc, {
        rfc,
        razonSocial: text(record.razonSocial),
        emails: new Map(),
        facturas: new Set(),
        destinatariosOriginales: new Set()
      })
    }
    const item = candidates.get(rfc)
    if (record.razonSocial && !item.razonSocial) item.razonSocial = text(record.razonSocial)
    if (record.factura) item.facturas.add(String(record.factura))
    rawEmails.forEach((email) => item.destinatariosOriginales.add(email))
    emails.forEach((email) => item.emails.set(email, Number(item.emails.get(email) || 0) + 1))
  }
  const rows = Array.from(candidates.values()).map((item) => {
    const selectedEmail = Array.from(item.emails.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || ''
    return {
      rfc: item.rfc,
      razonSocial: item.razonSocial,
      email: selectedEmail,
      emailAlternos: Array.from(item.emails.keys()).filter((email) => email !== selectedEmail).join(', '),
      facturas: Array.from(item.facturas).join(', '),
      destinatariosOriginales: Array.from(item.destinatariosOriginales).join(', ')
    }
  })
  return { rows, ignored }
}

function blankMeta(company) {
  return {
    legalName: company,
    rfc: '',
    email: '',
    contactEmail: '',
    linkedCompanies: []
  }
}

function updateStatePayload(payload, candidates) {
  const state = payload.state || payload
  const profiles = Array.isArray(state.invoiceProfiles) ? state.invoiceProfiles : []
  const profileByRfc = new Map(profiles.map((profile, index) => [normalizeRfc(profile.rfc), { profile, index }]).filter(([rfc]) => rfc))
  const result = {
    candidates: candidates.length,
    updated: [],
    existing: [],
    missingProfile: []
  }
  for (const candidate of candidates) {
    const match = profileByRfc.get(candidate.rfc)
    if (!match) {
      result.missingProfile.push(candidate)
      continue
    }
    const currentEmail = text(match.profile.contactEmail || match.profile.email || match.profile.correo)
    if (currentEmail) {
      result.existing.push({ ...candidate, currentEmail })
      continue
    }
    const nextProfile = {
      ...match.profile,
      contactEmail: candidate.email,
      emailSource: 'facturas_enviadas_2026-06-01',
      emailUpdatedAt: new Date().toISOString()
    }
    profiles[match.index] = nextProfile
    const razonSocial = text(nextProfile.razonSocial || candidate.razonSocial)
    if (razonSocial) {
      const currentMeta = { ...blankMeta(razonSocial), ...(state.companyMeta?.[razonSocial] || {}) }
      state.companyMeta = {
        ...(state.companyMeta || {}),
        [razonSocial]: {
          ...currentMeta,
          legalName: razonSocial,
          rfc: normalizeRfc(nextProfile.rfc) || currentMeta.rfc || '',
          email: candidate.email,
          contactEmail: currentMeta.contactEmail || candidate.email
        }
      }
    }
    result.updated.push(candidate)
  }
  state.invoiceProfiles = profiles
  state.invoiceEmailImport = {
    source: 'relacion_facturas_enviadas_2026-06-01.json',
    appliedAt: new Date().toISOString(),
    updated: result.updated.length,
    existing: result.existing.length,
    missingProfile: result.missingProfile.length
  }
  if (payload.state) payload.state = state
  return result
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

function main() {
  const reportFile = path.resolve(argValue('--report', defaultReportFile))
  const stateFile = latestUserStateFile()
  const backupDir = path.join(repoRoot, 'data', 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupFile = path.join(backupDir, `${path.basename(stateFile)}.antes-correos-facturas-${stamp()}`)
  fs.copyFileSync(stateFile, backupFile)
  const { rows, ignored } = emailCandidatesFromReport(reportFile)
  const payload = decryptJson(stateFile)
  const result = updateStatePayload(payload, rows)
  writeEncryptedJson(stateFile, payload)
  const auditFile = path.join(repoRoot, 'outputs', 'facturas_enviadas', '2026-06-01', `correos_registrados_crm_${stamp()}.json`)
  fs.writeFileSync(auditFile, JSON.stringify({ reportFile, stateFile, backupFile, ignored, result }, null, 2))
  console.log(`Estado actualizado: ${stateFile}`)
  console.log(`Respaldo: ${backupFile}`)
  console.log(`Auditoria: ${auditFile}`)
  console.log(`Candidatos: ${result.candidates}`)
  console.log(`Correos registrados: ${result.updated.length}`)
  console.log(`Ya tenian correo: ${result.existing.length}`)
  console.log(`Sin perfil fiscal: ${result.missingProfile.length}`)
  console.log(`Ignorados RFC propio (${Array.from(ownRfcs).join(', ')}): ${ignored.ownRfc}`)
  console.log(`Ignorados internos/sin correo: ${ignored.internalEmail + ignored.noEmail}`)
}

main()
