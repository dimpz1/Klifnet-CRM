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

function serveStatic(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`)
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
