import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '..')
const strict = process.argv.includes('--strict')
const syntaxOnly = process.argv.includes('--syntax-only')

const checks = []

function addCheck(level, message, detail = '') {
  checks.push({ level, message, detail })
}

function runGit(args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' })
}

function trackedFiles() {
  try {
    return runGit(['ls-files']).split(/\r?\n/).filter(Boolean)
  } catch (error) {
    addCheck('error', 'No se pudo leer git ls-files.', error.message)
    return []
  }
}

function checkSyntax(files) {
  files
    .filter((file) => /\.(mjs|js)$/i.test(file))
    .filter((file) => !file.startsWith('public/vendor/'))
    .forEach((file) => {
      try {
        execFileSync('node', ['--check', file], { cwd: repoRoot, stdio: 'pipe' })
        addCheck('ok', `Sintaxis OK: ${file}`)
      } catch (error) {
        addCheck('error', `Sintaxis invalida: ${file}`, String(error.stderr || error.message).trim())
      }
    })
}

function checkRequiredFiles() {
  ;['package.json', 'package-lock.json', '.gitignore', '.gitattributes', '.env.example', 'iniciar-crm.bat', 'iniciar-crm.ps1'].forEach((file) => {
    if (fs.existsSync(path.join(repoRoot, file))) addCheck('ok', `Archivo requerido presente: ${file}`)
    else addCheck('warn', `Falta archivo operativo recomendado: ${file}`)
  })
}

function checkTrackedSensitiveFiles(files) {
  const forbiddenPatterns = [
    /^\.env($|\.)/,
    /^data\//,
    /^outputs\//,
    /^Codex\//,
    /^node_modules\//,
    /^server\.(err\.)?log$/,
    /password-reset-tokens/i,
    /one-time-tokens-\d/i
  ]
  const sensitive = files.filter((file) => forbiddenPatterns.some((pattern) => pattern.test(file)))
  if (!sensitive.length) {
    addCheck('ok', 'No hay secretos, bases locales ni salidas trackeadas por Git.')
    return
  }
  addCheck(
    'warn',
    'Hay archivos locales/sensibles trackeados por Git; primero migra data/ fuera del repo con npm run data:migrate y despues desversiona con respaldo.',
    sensitive.join('\n')
  )
}

function checkStaticAllowlist() {
  const serverFile = fs.readFileSync(path.join(repoRoot, 'server', 'index.js'), 'utf8')
  if (!serverFile.includes('function isPublicStaticPath') || !serverFile.includes("pathname.startsWith('/public/vendor/')")) {
    addCheck('error', 'El servidor no muestra una allowlist clara para archivos estaticos.')
    return
  }
  if (serverFile.includes("url.pathname.startsWith('/public/data/')") && serverFile.includes('isPublicStaticPath(url.pathname)')) {
    addCheck('ok', 'Servidor usa allowlist de estaticos y bloquea carpetas privadas.')
  } else {
    addCheck('warn', 'Revisa manualmente la allowlist de estaticos del servidor.')
  }
}

const files = trackedFiles()
checkSyntax(files)

if (!syntaxOnly) {
  checkRequiredFiles()
  checkTrackedSensitiveFiles(files)
  checkStaticAllowlist()
}

const summary = checks.reduce(
  (acc, check) => {
    acc[check.level] = (acc[check.level] || 0) + 1
    return acc
  },
  { ok: 0, warn: 0, error: 0 }
)

for (const check of checks) {
  const label = check.level.toUpperCase().padEnd(5)
  console.log(`${label} ${check.message}`)
  if (check.detail) {
    console.log(
      check.detail
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => `      ${line}`)
        .join('\n')
    )
  }
}

console.log(`\nResumen: ${summary.ok || 0} OK, ${summary.warn || 0} advertencias, ${summary.error || 0} errores.`)

if ((summary.error || 0) > 0 || (strict && (summary.warn || 0) > 0)) {
  process.exitCode = 1
}
