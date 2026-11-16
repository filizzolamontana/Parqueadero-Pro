# Parqueadero-Pro: reinicia el backend sin cerrar procesos ajenos.
$ErrorActionPreference = 'Stop'
$backend = Join-Path $PSScriptRoot 'backend'
if (-not (Test-Path (Join-Path $backend 'server.js'))) {
    Write-Host 'ERROR: Coloca este script en la carpeta principal del proyecto, junto a backend.' -ForegroundColor Red
    exit 1
}
$port = 3000
$connections = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
$pids = @($connections | Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($processId in $pids) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
    if (-not $proc) { continue }
    $command = [string]$proc.CommandLine
    $isProject = ($proc.Name -match '^node(\.exe)?$') -and ($command -match 'server\.js')
    if ($isProject) {
        Write-Host "Deteniendo backend anterior (PID $processId)..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Start-Sleep -Seconds 2
    } else {
        Write-Host "El puerto $port esta ocupado por otro programa (PID $processId): $($proc.Name)" -ForegroundColor Red
        Write-Host "Comando: $command"
        Write-Host 'Cierra ese programa manualmente antes de continuar.'
        exit 1
    }
}
if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
    Write-Host 'El puerto 3000 sigue ocupado. Cierra la terminal anterior e intentalo de nuevo.' -ForegroundColor Red
    exit 1
}
Write-Host 'Iniciando backend en puerto 3000...' -ForegroundColor Green
Set-Location $backend
npm run dev
