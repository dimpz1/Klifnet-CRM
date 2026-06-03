import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import * as XLSX from 'xlsx'

const require = createRequire(import.meta.url)
const { PDFParse } = require('pdf-parse')

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultOutDir = path.join(repoRoot, 'outputs', 'facturas_enviadas')
const privateInvoicesFile = path.join(repoRoot, 'data', 'private-files', 'ultimas_facturas_emitidas.json.enc')
const secretKeyFile = path.join(repoRoot, 'data', 'secret.key')
let invoiceProfilesByRfc = new Map()

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name)
  if (index < 0) return fallback
  return process.argv[index + 1] || fallback
}

function hasArg(name) {
  return process.argv.includes(name)
}

function loadEnv(file = path.join(repoRoot, '.env')) {
  if (!fsSync.existsSync(file)) return
  const rows = fsSync.readFileSync(file, 'utf8').split(/\r?\n/g)
  rows.forEach((row) => {
    const clean = row.trim()
    if (!clean || clean.startsWith('#')) return
    const match = clean.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) return
    const [, key, raw] = match
    if (process.env[key]) return
    process.env[key] = raw.replace(/^["']|["']$/g, '')
  })
}

function parseTargetDate(value) {
  const input = String(value || '2026-06-01').trim()
  const slash = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (slash) {
    const [, day, month, yearText] = slash
    const year = Number(yearText.length === 2 ? `20${yearText}` : yearText)
    return new Date(year, Number(month) - 1, Number(day))
  }
  const dash = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (dash) {
    const [, year, month, day] = dash
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  throw new Error(`Fecha invalida: ${input}. Usa 2026-06-01 o 01/06/2026.`)
}

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function nextDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
}

function sameLocalDay(date, target) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false
  return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth() && date.getDate() === target.getDate()
}

function text(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeRfc(value) {
  return text(value).toUpperCase().replace(/[^A-Z0-9&Ñ]/g, '')
}

function safeFilename(value, fallback = 'archivo') {
  const clean = text(value)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 140)
  return clean || fallback
}

function addressList(addressObject) {
  return (addressObject?.value || [])
    .map((item) => item.address || item.name || '')
    .filter(Boolean)
    .join(', ')
}

function normalizePdfText(value) {
  return String(value || '')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
}

function isEncryptedPayload(payload) {
  return Boolean(payload && payload.version === 1 && payload.alg === 'aes-256-gcm' && payload.iv && payload.tag && payload.data)
}

function getEncryptionKey() {
  if (process.env.KLIFNET_SECRET_KEY) return crypto.createHash('sha256').update(process.env.KLIFNET_SECRET_KEY).digest()
  if (!fsSync.existsSync(secretKeyFile)) return null
  return Buffer.from(fsSync.readFileSync(secretKeyFile, 'utf8').trim(), 'base64')
}

function decryptPayload(payload) {
  const key = getEncryptionKey()
  if (!key) throw new Error('No hay llave local data/secret.key para leer facturas cifradas.')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()])
}

function readMaybeEncryptedJson(filePath) {
  if (!fsSync.existsSync(filePath)) return null
  let buffer = fsSync.readFileSync(filePath)
  for (let depth = 0; depth < 20; depth += 1) {
    const payload = JSON.parse(buffer.toString('utf8'))
    if (!isEncryptedPayload(payload)) return payload
    buffer = decryptPayload(payload)
  }
  return JSON.parse(buffer.toString('utf8'))
}

function invoiceRowsFromPayload(payload = {}) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.latest_invoices)) return payload.latest_invoices
  if (Array.isArray(payload.invoiceProfiles)) return payload.invoiceProfiles
  if (Array.isArray(payload.facturas)) return payload.facturas
  return []
}

function normalizeInvoiceProfile(row = {}) {
  return {
    razonSocial: text(row.razonSocial || row.razon_social || row.legalName || row.company || row.name),
    rfc: normalizeRfc(row.rfc || row.rfc_receptor || row.rfcReceptor),
    folio: text(row.folio || row.factura || row.numero || row.numeroFactura),
    uuid: text(row.uuid),
    total: text(row.total)
  }
}

function loadInvoiceProfileMap() {
  try {
    const payload = readMaybeEncryptedJson(privateInvoicesFile)
    const rows = invoiceRowsFromPayload(payload).map(normalizeInvoiceProfile).filter((row) => row.rfc)
    invoiceProfilesByRfc = new Map(rows.map((row) => [row.rfc, row]))
    return rows.length
  } catch (error) {
    console.warn(`No se pudo usar base de razones sociales cifrada: ${error.message || error}`)
    invoiceProfilesByRfc = new Map()
    return 0
  }
}

function parseInvoiceFilename(filename = '') {
  const upper = path.basename(filename).toUpperCase()
  const rfcPattern = '[A-Z&Ñ]{3,4}\\d{6}[A-Z0-9]{3}'
  const direct = upper.match(new RegExp(`(${rfcPattern})[_\\s-]+(\\d{2,12})[_\\s-]+(${rfcPattern})`))
  const rfcs = [...upper.matchAll(new RegExp(rfcPattern, 'g'))].map((item) => item[0])
  return {
    emisorRfc: direct?.[1] || rfcs[0] || '',
    folio: direct?.[2] || '',
    receptorRfc: direct?.[3] || rfcs[1] || ''
  }
}

function matchFirst(patterns, value) {
  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return text(match[1])
  }
  return ''
}

function extractTotal(pdfText) {
  const matches = [...pdfText.matchAll(/\bTOTAL\b[^\d$]{0,30}\$?\s*([\d,]+\.\d{2})/gi)]
  if (!matches.length) return ''
  return matches[matches.length - 1][1].replace(/,/g, '')
}

function extractInvoiceInfo(pdfText, subject = '', filename = '') {
  const clean = normalizePdfText(pdfText)
  const compact = clean.replace(/\n/g, ' ')
  const fromFilename = parseInvoiceFilename(filename)
  const uuids = [...compact.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi)].map((item) => item[0].toUpperCase())
  const rfcs = [
    ...compact.matchAll(/\b[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}\b/g),
    ...[fromFilename.emisorRfc, fromFilename.receptorRfc].filter(Boolean).map((rfc) => [rfc])
  ].map((item) => normalizeRfc(item[0]))
  const receptorProfile = invoiceProfilesByRfc.get(fromFilename.receptorRfc) || null
  const folio = matchFirst(
    [
      /\b(?:folio fiscal|uuid)\b\s*:?\s*([0-9a-f-]{20,})/i,
      /\b(?:factura|folio|serie y folio|no\.?\s*factura|numero)\b\s*:?\s*([A-Z0-9-]{3,30})/i,
      /\b(?:folio)\s+([A-Z0-9-]{3,30})/i
    ],
    compact
  )
  const razonSocialFromPdf = matchFirst(
    [
      /\b(?:razon social|razon social receptor|nombre del receptor|cliente|receptor|facturado a)\b\s*:?\s*([A-Z0-9ÁÉÍÓÚÜÑ&.,' -]{4,120})\s+(?:RFC|R\.?F\.?C\.?|DOMICILIO|REGIMEN|USO CFDI)/i,
      /\bRECEPTOR\b\s*([A-Z0-9ÁÉÍÓÚÜÑ&.,' -]{4,120})\s+(?:RFC|R\.?F\.?C\.?)/i
    ],
    clean
  )
  const total = extractTotal(compact) || receptorProfile?.total || ''
  return {
    factura: (folio && !folio.includes('-') ? folio : '') || fromFilename.folio || receptorProfile?.folio || '',
    uuid: uuids[0] || (folio?.includes('-') ? folio.toUpperCase() : ''),
    razonSocial: razonSocialFromPdf || receptorProfile?.razonSocial || '',
    rfcDetectados: [...new Set(rfcs)].filter(Boolean).join(', '),
    rfcEmisor: fromFilename.emisorRfc,
    rfcReceptor: fromFilename.receptorRfc,
    total,
    textoMuestra: text(clean.slice(0, 700)),
    asuntoDetectado: subject,
    archivoDetectado: filename
  }
}

async function extractPdf(buffer) {
  let parser = null
  try {
    parser = new PDFParse({ data: buffer })
    const parsed = await parser.getText()
    return parsed.text || ''
  } catch (error) {
    return `ERROR PDF: ${error.message || error}`
  } finally {
    await parser?.destroy?.().catch(() => {})
  }
}

async function ensureDirs(outDir) {
  await fs.mkdir(outDir, { recursive: true })
  await fs.mkdir(path.join(outDir, 'pdfs'), { recursive: true })
}

async function savePdf(outDir, parsed, attachment, index) {
  const sentAt = parsed.date instanceof Date ? dateKey(parsed.date) : 'sin-fecha'
  const base = safeFilename(`${sentAt}_${parsed.subject || 'sin_asunto'}_${index}_${attachment.filename || 'factura.pdf'}`)
  const filename = base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`
  const pdfPath = path.join(outDir, 'pdfs', filename)
  await fs.writeFile(pdfPath, attachment.content)
  return pdfPath
}

async function recordsFromParsedEmail(parsed, targetDate, outDir, sourceLabel) {
  const sentAt = parsed.date instanceof Date ? parsed.date : null
  if (!sameLocalDay(sentAt, targetDate)) return { records: [], withoutPdf: [] }
  const pdfAttachments = (parsed.attachments || []).filter((attachment) => {
    const filename = attachment.filename || ''
    return /pdf$/i.test(filename) || /application\/pdf/i.test(attachment.contentType || '')
  })
  if (!pdfAttachments.length) {
    return {
      records: [],
      withoutPdf: [
        {
          fechaEnvio: sentAt?.toISOString() || '',
          asunto: parsed.subject || '',
          para: addressList(parsed.to),
          cc: addressList(parsed.cc),
          fuente: sourceLabel
        }
      ]
    }
  }
  const records = []
  for (let index = 0; index < pdfAttachments.length; index += 1) {
    const attachment = pdfAttachments[index]
    const pdfPath = await savePdf(outDir, parsed, attachment, index + 1)
    const pdfText = await extractPdf(attachment.content)
    const invoice = extractInvoiceInfo(pdfText, parsed.subject, attachment.filename)
    records.push({
      fechaEnvio: sentAt?.toISOString() || '',
      asunto: parsed.subject || '',
      para: addressList(parsed.to),
      cc: addressList(parsed.cc),
      de: addressList(parsed.from),
      factura: invoice.factura,
      uuid: invoice.uuid,
      razonSocial: invoice.razonSocial,
      rfcDetectados: invoice.rfcDetectados,
      rfcEmisor: invoice.rfcEmisor,
      rfcReceptor: invoice.rfcReceptor,
      total: invoice.total,
      pdf: attachment.filename || path.basename(pdfPath),
      pdfGuardado: pdfPath,
      messageId: parsed.messageId || '',
      fuente: sourceLabel,
      textoMuestra: invoice.textoMuestra
    })
  }
  return { records, withoutPdf: [] }
}

async function openSentMailbox(client, configured) {
  const candidates = [
    configured,
    '[Gmail]/Sent Mail',
    '[Gmail]/Enviados',
    '[Google Mail]/Sent Mail',
    'Sent',
    'Sent Items',
    'Enviados',
    'Elementos enviados'
  ].filter(Boolean)
  const errors = []
  for (const mailbox of candidates) {
    try {
      await client.mailboxOpen(mailbox)
      return mailbox
    } catch (error) {
      errors.push(`${mailbox}: ${error.message || error}`)
    }
  }
  throw new Error(`No pude abrir Enviados. Configura KLIFNET_IMAP_SENT_BOX. Intentos: ${errors.join(' | ')}`)
}

async function extractFromImap(targetDate, outDir) {
  const host = process.env.KLIFNET_IMAP_HOST || 'imap.gmail.com'
  const port = Number(process.env.KLIFNET_IMAP_PORT || 993)
  const user = process.env.KLIFNET_IMAP_USER || process.env.KLIFNET_SMTP_USER || ''
  const pass = process.env.KLIFNET_IMAP_PASS || process.env.KLIFNET_SMTP_PASS || ''
  const secure = String(process.env.KLIFNET_IMAP_SECURE || 'true').toLowerCase() !== 'false'
  if (!user || !pass) throw new Error('Falta KLIFNET_IMAP_USER/KLIFNET_IMAP_PASS en .env de la PC donde esta el correo.')

  const client = new ImapFlow({ host, port, secure, auth: { user, pass }, logger: false })
  const records = []
  const withoutPdf = []
  await client.connect()
  try {
    const mailbox = await openSentMailbox(client, process.env.KLIFNET_IMAP_SENT_BOX)
    const query = { since: targetDate, before: nextDay(targetDate) }
    const limit = Number(argValue('--limit', 0))
    let count = 0
    for await (const message of client.fetch(query, { uid: true, envelope: true, internalDate: true, source: true })) {
      if (limit && count >= limit) break
      count += 1
      const parsed = await simpleParser(message.source)
      if (!parsed.date && message.internalDate) parsed.date = message.internalDate
      const result = await recordsFromParsedEmail(parsed, targetDate, outDir, `${mailbox} UID ${message.uid}`)
      records.push(...result.records)
      withoutPdf.push(...result.withoutPdf)
    }
  } finally {
    await client.logout().catch(() => {})
  }
  return { records, withoutPdf }
}

async function extractFromDirectory(targetDate, outDir, sourceDir) {
  if (!sourceDir) throw new Error('Usa --source-dir con la carpeta que contiene .eml o PDFs.')
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  const records = []
  const withoutPdf = []
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const fullPath = path.join(sourceDir, entry.name)
    if (/\.eml$/i.test(entry.name)) {
      const parsed = await simpleParser(await fs.readFile(fullPath))
      const result = await recordsFromParsedEmail(parsed, targetDate, outDir, fullPath)
      records.push(...result.records)
      withoutPdf.push(...result.withoutPdf)
    } else if (/\.pdf$/i.test(entry.name)) {
      const content = await fs.readFile(fullPath)
      const pdfText = await extractPdf(content)
      const invoice = extractInvoiceInfo(pdfText, '', entry.name)
      records.push({
        fechaEnvio: '',
        asunto: '',
        para: '',
        cc: '',
        de: '',
        factura: invoice.factura,
        uuid: invoice.uuid,
        razonSocial: invoice.razonSocial,
        rfcDetectados: invoice.rfcDetectados,
        rfcEmisor: invoice.rfcEmisor,
        rfcReceptor: invoice.rfcReceptor,
        total: invoice.total,
        pdf: entry.name,
        pdfGuardado: fullPath,
        messageId: '',
        fuente: fullPath,
        textoMuestra: invoice.textoMuestra
      })
    }
  }
  return { records, withoutPdf }
}

function sheetFromObjects(rows, headers) {
  return XLSX.utils.aoa_to_sheet([headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))])
}

async function writeWorkbook(outDir, targetDate, records, withoutPdf) {
  const headers = [
    'fechaEnvio',
    'para',
    'cc',
    'de',
    'asunto',
    'razonSocial',
    'rfcDetectados',
    'rfcEmisor',
    'rfcReceptor',
    'factura',
    'uuid',
    'total',
    'pdf',
    'pdfGuardado',
    'messageId',
    'fuente',
    'textoMuestra'
  ]
  const wb = XLSX.utils.book_new()
  const mainSheet = sheetFromObjects(records, headers)
  mainSheet['!cols'] = headers.map((header) => ({ wch: Math.min(Math.max(header.length + 6, 16), header === 'textoMuestra' ? 80 : 34) }))
  XLSX.utils.book_append_sheet(wb, mainSheet, 'Facturas enviadas')
  const noPdfHeaders = ['fechaEnvio', 'para', 'cc', 'asunto', 'fuente']
  XLSX.utils.book_append_sheet(wb, sheetFromObjects(withoutPdf, noPdfHeaders), 'Correos sin PDF')
  const summaryRows = [
    ['Fecha revisada', dateKey(targetDate)],
    ['Facturas PDF detectadas', records.length],
    ['Correos sin PDF', withoutPdf.length],
    ['Generado', new Date().toISOString()]
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Resumen')
  const outputFile = path.join(outDir, `relacion_facturas_enviadas_${dateKey(targetDate)}.xlsx`)
  XLSX.writeFile(wb, outputFile)
  await fs.writeFile(path.join(outDir, `relacion_facturas_enviadas_${dateKey(targetDate)}.json`), JSON.stringify({ records, withoutPdf }, null, 2))
  return outputFile
}

async function main() {
  loadEnv()
  const profilesLoaded = loadInvoiceProfileMap()
  const targetDate = parseTargetDate(argValue('--date', '2026-06-01'))
  const source = argValue('--source', process.env.KLIFNET_SENT_SOURCE || 'imap').toLowerCase()
  const outDir = path.resolve(argValue('--out', path.join(defaultOutDir, dateKey(targetDate))))
  await ensureDirs(outDir)
  const result =
    source === 'dir' || hasArg('--source-dir')
      ? await extractFromDirectory(targetDate, outDir, path.resolve(argValue('--source-dir', '')))
      : await extractFromImap(targetDate, outDir)
  const outputFile = await writeWorkbook(outDir, targetDate, result.records, result.withoutPdf)
  console.log(`Listo: ${outputFile}`)
  console.log(`PDFs relacionados: ${result.records.length}`)
  console.log(`Correos sin PDF: ${result.withoutPdf.length}`)
  console.log(`Razones sociales cargadas por RFC: ${profilesLoaded}`)
}

main().catch((error) => {
  console.error(`ERROR: ${error.message || error}`)
  process.exit(1)
})
