import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '..')
const sourceDir = path.join(repoRoot, 'data')
const writeEnv = process.argv.includes('--write-env')
const explicitTarget = process.argv.find((arg) => arg.startsWith('--target='))?.slice('--target='.length)
const defaultTarget =
  process.platform === 'win32'
    ? path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'KLIFNET-CRM', 'data')
    : path.join(os.homedir(), '.klifnet-crm', 'data')
const targetDir = path.resolve(explicitTarget || process.env.DATA_DIR || defaultTarget)

function copyDir(source, target) {
  if (!fs.existsSync(source)) return
  fs.mkdirSync(target, { recursive: true })
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)
    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath)
      continue
    }
    if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath)
    }
  }
}

function upsertEnvValue(filePath, key, value) {
  const line = `${key}=${value}`
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${line}\n`, 'utf8')
    return
  }
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  const index = lines.findIndex((current) => current.trim().startsWith(`${key}=`))
  if (index >= 0) lines[index] = line
  else lines.push(line)
  fs.writeFileSync(filePath, `${lines.filter((current, currentIndex) => current || currentIndex < lines.length - 1).join('\n')}\n`, 'utf8')
}

if (!fs.existsSync(sourceDir)) {
  console.log(`No existe carpeta local de datos: ${sourceDir}`)
  process.exit(0)
}

copyDir(sourceDir, targetDir)

if (writeEnv) {
  upsertEnvValue(path.join(repoRoot, '.env'), 'DATA_DIR', targetDir)
}

console.log(
  JSON.stringify(
    {
      ok: true,
      sourceDir,
      targetDir,
      envUpdated: writeEnv,
      next: 'Reinicia el CRM y valida que abre tus bases antes de desversionar data/.'
    },
    null,
    2
  )
)
