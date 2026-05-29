param(
  [int]$Port = 8787,
  [string]$BindHost = "0.0.0.0",
  [switch]$Restart
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

$listener = $null
try {
  $listener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
} catch {
}

if ($listener) {
  $processId = $listener.OwningProcess
  $processName = "desconocido"
  try {
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
      $processName = $process.ProcessName
    }
  } catch {
  }

  if ($Restart) {
    Write-Host "Puerto $Port ocupado por $processName (PID $processId). Reiniciando..."
    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
      Start-Sleep -Seconds 1
    } catch {
      throw "No pude cerrar el proceso que ocupa el puerto $Port. Cierra node.exe o ejecuta como administrador."
    }
  } else {
    Write-Host ""
    Write-Host "KLIFNET CRM ya esta corriendo en el puerto $Port."
    Write-Host "Proceso: $processName (PID $processId)"
    Write-Host "Abre: http://127.0.0.1:$Port/"
    if ($BindHost -eq "0.0.0.0") {
      try {
        Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
          Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
          ForEach-Object { Write-Host "Red: http://$($_.IPAddress):$Port/" }
      } catch {
      }
    }
    Write-Host ""
    Write-Host "Para reiniciar usa: .\iniciar-crm.ps1 -Restart"
    exit 0
  }
}

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
