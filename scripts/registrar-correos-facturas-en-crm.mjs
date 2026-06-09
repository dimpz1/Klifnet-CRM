import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

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

function slug(value) {
  return normalizeHeader(value).replace(/\s+/g, '-') || crypto.randomUUID()
}

function rowValue(row, aliases = []) {
  const normalized = new Map(Object.keys(row || {}).map((key) => [normalizeHeader(key), key]))
  for (const alias of aliases) {
    const key = normalized.get(normalizeHeader(alias))
    if (key) return row[key]
  }
  return ''
}

function rowsFromReport(reportFile) {
  const ext = path.extname(reportFile).toLowerCase()
  if (['.xlsx', '.xls', '.xlsm'].includes(ext)) {
    const workbook = XLSX.readFile(reportFile, { cellText: false, cellDates: true })
    const sheetName = workbook.SheetNames.find((name) => normalizeHeader(name).includes('facturas')) || workbook.SheetNames[0]
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' }).map((row) => ({
      rfc: rowValue(row, ['RFC Empresa/ PF', 'RFC Empresa/PF', 'RFC', 'RFC Receptor', 'rfcReceptor']),
      razonSocial: rowValue(row, ['Razon social empresa/ PF', 'Razon social empresa/PF', 'Razon social', 'Razon Social', 'razonSocial']),
      para: rowValue(row, ['Correo prioridad', 'Correo principal', 'Para', 'Destinatario', 'Email']),
      cc: rowValue(row, ['Copiados', 'Copiados ', 'CC', 'Copia', 'Copias']),
      bcc: rowValue(row, ['Copia oculta', 'CCO', 'BCC']),
      factura: rowValue(row, ['Factura', 'Folio'])
    }))
  }
  const payload = JSON.parse(fs.readFileSync(reportFile, 'utf8'))
  return (payload.records || []).map((record) => ({
    rfc: record.rfcReceptor || record.rfc,
    razonSocial: record.razonSocial,
    para: record.para,
    cc: record.cc || record.copias || record.copiados,
    bcc: record.bcc || record.cco,
    factura: record.factura || record.folio
  }))
}

function contactFromEmail(email, sendAs, index = 0) {
  return {
    id: `factura-${sendAs}-${slug(email)}`,
    name: '',
    email,
    phone: '',
    role: sendAs === 'para' ? 'Responsable facturacion' : sendAs === 'cc' ? 'Responsable secundario' : 'Copia oculta',
    sendAs
  }
}

function mergeContacts(current = [], emails = [], sendAs = 'para') {
  const next = [...current]
  emails.forEach((email, index) => {
    const cleanEmail = String(email || '').toLowerCase()
    const existing = next.find((contact) => contact.email === cleanEmail)
    if (existing) {
      existing.sendAs = existing.sendAs === 'para' ? 'para' : sendAs
      return
    }
    next.push(contactFromEmail(cleanEmail, sendAs, index))
  })
  return next
}

function emailCandidatesFromReport(reportFile) {
  const candidates = new Map()
  const ignored = { ownRfc: 0, noEmail: 0, internalEmail: 0, missingRfc: 0 }
  for (const record of rowsFromReport(reportFile)) {
    const rfc = normalizeRfc(record.rfc)
    if (!rfc) {
      ignored.missingRfc += 1
      continue
    }
    if (ownRfcs.has(rfc)) {
      ignored.ownRfc += 1
      continue
    }
    const rawEmails = `${record.para || ''} ${record.cc || ''} ${record.bcc || ''}`.split(/[;,\s]+/g).filter(Boolean)
    const emails = validExternalEmails(record.para)
    const ccEmails = validExternalEmails(record.cc)
    const bccEmails = validExternalEmails(record.bcc)
    if (!emails.length && !ccEmails.length && !bccEmails.length) {
      if (rawEmails.length) ignored.internalEmail += 1
      else ignored.noEmail += 1
      continue
    }
    if (!candidates.has(rfc)) {
      candidates.set(rfc, {
        rfc,
        razonSocial: text(record.razonSocial),
        contacts: [],
        facturas: new Set(),
        destinatariosOriginales: new Set()
      })
    }
    const item = candidates.get(rfc)
    if (record.razonSocial && !item.razonSocial) item.razonSocial = text(record.razonSocial)
    if (record.factura) item.facturas.add(String(record.factura))
    rawEmails.forEach((email) => item.destinatariosOriginales.add(email))
    item.contacts = mergeContacts(item.contacts, emails, 'para')
    item.contacts = mergeContacts(item.contacts, ccEmails, 'cc')
    item.contacts = mergeContacts(item.contacts, bccEmails, 'bcc')
  }
  const rows = Array.from(candidates.values()).map((item) => {
    const selectedEmail = item.contacts.find((contact) => contact.sendAs === 'para')?.email || item.contacts[0]?.email || ''
    return {
      rfc: item.rfc,
      razonSocial: item.razonSocial,
      email: selectedEmail,
      contacts: item.contacts,
      emailAlternos: item.contacts.map((contact) => contact.email).filter((email) => email !== selectedEmail).join(', '),
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
    contacts: [],
    linkedCompanies: []
  }
}

function clearEmailFields(meta = {}) {
  const next = { ...meta }
  next.email = ''
  next.contactEmail = ''
  next.contact = ''
  next.phone = ''
  next.secondaryContact = ''
  next.secondaryEmail = ''
  next.secondaryPhone = ''
  next.contacts = []
  return next
}

function setMetaContacts(state, companyName, candidate) {
  const cleanName = text(companyName)
  if (!cleanName) return
  const currentMeta = { ...blankMeta(cleanName), ...(state.companyMeta?.[cleanName] || {}) }
  state.companyMeta = {
    ...(state.companyMeta || {}),
    [cleanName]: {
      ...currentMeta,
      legalName: currentMeta.legalName || candidate.razonSocial || cleanName,
      rfc: candidate.rfc || currentMeta.rfc || '',
      email: candidate.email || '',
      contactEmail: candidate.email || '',
      contacts: candidate.contacts || []
    }
  }
}

function updateStatePayload(payload, candidates) {
  const state = payload.state || payload
  state.companyMeta = state.companyMeta || {}
  Object.keys(state.companyMeta).forEach((companyName) => {
    state.companyMeta[companyName] = clearEmailFields(state.companyMeta[companyName])
  })

  const profiles = (Array.isArray(state.invoiceProfiles) ? state.invoiceProfiles : []).map((profile) => ({
    ...profile,
    contactEmail: '',
    contacts: [],
    emailSource: '',
    emailUpdatedAt: ''
  }))
  const profileByRfc = new Map(profiles.map((profile, index) => [normalizeRfc(profile.rfc), { profile, index }]).filter(([rfc]) => rfc))
  const profileByName = new Map(profiles.map((profile, index) => [normalizeHeader(profile.razonSocial), { profile, index }]).filter(([name]) => name))
  const result = {
    candidates: candidates.length,
    updated: [],
    created: [],
    missingProfile: []
  }
  for (const candidate of candidates) {
    const match = profileByRfc.get(candidate.rfc) || profileByName.get(normalizeHeader(candidate.razonSocial))
    if (!match) {
      const createdProfile = {
        id: `factura-${candidate.rfc || slug(candidate.razonSocial)}`,
        razonSocial: candidate.razonSocial,
        rfc: candidate.rfc,
        contactEmail: candidate.email,
        contacts: candidate.contacts || [],
        linkedCompanies: [],
        emailSource: path.basename(argValue('--report', defaultReportFile)),
        emailUpdatedAt: new Date().toISOString()
      }
      profiles.push(createdProfile)
      setMetaContacts(state, candidate.razonSocial, candidate)
      result.created.push(candidate)
      continue
    }
    const nextProfile = {
      ...match.profile,
      contactEmail: candidate.email,
      contacts: candidate.contacts || [],
      emailSource: 'facturas_enviadas_2026-06-01',
      emailUpdatedAt: new Date().toISOString()
    }
    profiles[match.index] = nextProfile
    const razonSocial = text(nextProfile.razonSocial || candidate.razonSocial)
    setMetaContacts(state, razonSocial, { ...candidate, razonSocial, rfc: normalizeRfc(nextProfile.rfc) || candidate.rfc })
    ;(Array.isArray(nextProfile.linkedCompanies) ? nextProfile.linkedCompanies : []).forEach((companyName) => {
      setMetaContacts(state, companyName, { ...candidate, razonSocial, rfc: normalizeRfc(nextProfile.rfc) || candidate.rfc })
    })
    result.updated.push(candidate)
  }
  state.invoiceProfiles = profiles
  state.invoiceEmailImport = {
    source: path.basename(argValue('--report', defaultReportFile)),
    appliedAt: new Date().toISOString(),
    updated: result.updated.length,
    created: result.created.length,
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
  console.log(`Perfiles creados: ${result.created.length}`)
  console.log(`Sin perfil fiscal: ${result.missingProfile.length}`)
  console.log(`Ignorados RFC propio (${Array.from(ownRfcs).join(', ')}): ${ignored.ownRfc}`)
  console.log(`Ignorados internos/sin correo: ${ignored.internalEmail + ignored.noEmail}`)
}

main()
