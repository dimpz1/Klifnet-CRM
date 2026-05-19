import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import tls from 'node:tls'
import { fileURLToPath } from 'node:url'
import dotenv from "dotenv";

// Rutas del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Cargar .env desde raíz
dotenv.config({
  path: path.join(rootDir, '.env')
});

// Debug SMTP
console.log(
  "KLIFNET_SMTP_USER =",
  process.env.KLIFNET_SMTP_USER
);

console.log(
  "KLIFNET_SMTP_HOST =",
  process.env.KLIFNET_SMTP_HOST
);

// Mantener función original
function loadDotEnv() {
  const envPath = path.join(rootDir, '.env')
  if (!fs.existsSync(envPath)) return
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const index = line.indexOf('=')
    const key = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, '')
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

// loadDotEnv()

// NO ejecutar porque dotenv ya lo hace
// loadDotEnv()

const port = Number(process.env.PORT || 8787)
const host = process.env.HOST || '0.0.0.0'