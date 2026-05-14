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
const stateFile = path.join(dataDir, 'server-state.json')
const maxBodyBytes = 50 * 1024 * 1024

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

function ensureDataDirs() {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0'
  })
  res.end(JSON.stringify(payload))
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

function writeJsonAtomic(filePath, payload) {
  ensureDataDirs()
  const tempPath = `${filePath}.tmp`
  fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf8')
  fs.renameSync(tempPath, filePath)
}

async function handleApi(req, res, url) {
  try {
    if (url.pathname === '/api/state' && req.method === 'GET') {
      if (!fs.existsSync(stateFile)) {
        sendJson(res, 200, { ok: true, state: null, updatedAt: '' })
        return
      }
      const saved = JSON.parse(fs.readFileSync(stateFile, 'utf8'))
      sendJson(res, 200, { ok: true, state: saved.state || null, updatedAt: saved.updatedAt || '' })
      return
    }

    if (url.pathname === '/api/state' && (req.method === 'POST' || req.method === 'PUT')) {
      const body = JSON.parse(await readBody(req))
      const updatedAt = new Date().toISOString()
      writeJsonAtomic(stateFile, {
        updatedAt,
        savedFrom: req.socket.remoteAddress || '',
        state: body.state || body
      })
      sendJson(res, 200, { ok: true, updatedAt })
      return
    }

    if (url.pathname === '/api/uploads' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req))
      const category = safeCategory(body.category)
      const fileName = safeFileName(body.filename)
      const extension = path.extname(fileName)
      const baseName = path.basename(fileName, extension)
      const uploadDir = path.join(uploadsDir, category)
      fs.mkdirSync(uploadDir, { recursive: true })
      const stampedName = `${new Date().toISOString().replace(/[:.]/g, '-')}-${baseName}${extension}`
      const outputPath = path.join(uploadDir, stampedName)
      const data = Buffer.from(String(body.dataBase64 || ''), 'base64')
      fs.writeFileSync(outputPath, data)
      sendJson(res, 200, {
        ok: true,
        path: path.relative(rootDir, outputPath).replace(/\\/g, '/'),
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
