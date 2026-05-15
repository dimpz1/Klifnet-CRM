param(
  [int]$Port = 8787,
  [string]$BindHost = "0.0.0.0"
)

$ErrorActionPreference = "Stop"

$nodeCandidates = @(
  "C:\Users\dimpu\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe",
  "node"
)

$node = $null
foreach ($candidate in $nodeCandidates) {
  try {
    if ($candidate -eq "node") {
      $cmd = Get-Command node -ErrorAction SilentlyContinue
      if ($cmd) {
        $node = $cmd.Source
        break
      }
    } elseif (Test-Path $candidate) {
      $node = $candidate
      break
    }
  } catch {
  }
}

if (-not $node) {
  throw "No encontre Node.js para iniciar el CRM."
}

$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#") -or $line -notmatch "=") {
      return
    }
    $parts = $line -split "=", 2
    $key = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")
    if ($key) {
      [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
  }
  Write-Host "Config: .env cargado."
}

$env:PORT = [string]$Port
$env:HOST = $BindHost

$ips = @()
try {
  $ips = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
    Select-Object -ExpandProperty IPAddress)
} catch {
}

Write-Host ""
Write-Host "KLIFNET CRM iniciando..."
Write-Host "Esta PC: http://127.0.0.1:$Port/"
if ($BindHost -eq "0.0.0.0") {
  foreach ($ip in $ips) {
    Write-Host "WiFi/LAN: http://${ip}:$Port/"
  }

  try {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    $ruleName = "KLIFNET CRM $Port"
    if ($isAdmin -and -not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
      New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port | Out-Null
      Write-Host "Firewall: regla creada para permitir el puerto $Port."
    } elseif (-not $isAdmin) {
      Write-Host "Firewall: si no abre desde otro equipo, ejecuta este script como administrador una vez."
    }
  } catch {
    Write-Host "Firewall: no se pudo verificar la regla automaticamente."
  }
}
Write-Host ""

& $node "$PSScriptRoot\server\index.js"
