# ============================================================
#  EDTU - Servidor en RED LOCAL (para celulares y tabletas)
#  Haz doble clic (o clic derecho > Ejecutar con PowerShell).
#  Se pedira permiso de Administrador automaticamente.
# ============================================================

# --- 1) Auto-elevacion a Administrador ---
$me = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $me.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host "Solicitando permisos de administrador..."
  Start-Process powershell -Verb RunAs -ArgumentList "-NoExit","-ExecutionPolicy","Bypass","-File","`"$PSCommandPath`""
  exit
}

$port = 8080
$root = $PSScriptRoot

# --- 2) Regla de Firewall (solo red privada) ---
$ruleName = "EDTU $port"
if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow `
    -Protocol TCP -LocalPort $port -Profile Private,Domain | Out-Null
  Write-Host "Regla de firewall creada para el puerto $port."
} else {
  Write-Host "Regla de firewall ya existente."
}

# --- 3) Liberar el puerto si algo lo ocupa ---
$busy = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
foreach ($c in $busy) { try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction Stop } catch {} }

# --- 4) Detectar IP local ---
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' } |
  Select-Object -First 1 -ExpandProperty IPAddress)

# --- 5) Servidor HTTP (todas las interfaces) ---
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")
try { $listener.Start() }
catch {
  Write-Host "ERROR al iniciar el servidor: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Pulsa una tecla para salir."; [void][System.Console]::ReadKey($true); exit
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  EDTU activo en RED LOCAL" -ForegroundColor Cyan
Write-Host "  En esta PC:        http://localhost:$port/"
Write-Host "  En movil/tablet:   http://$ip`:$port/" -ForegroundColor Green
Write-Host "  (ambos dispositivos deben estar en el mismo Wi-Fi)"
Write-Host "  Deja esta ventana ABIERTA. Ctrl+C para detener."
Write-Host "==========================================================" -ForegroundColor Cyan

$mime = @{
  ".html"="text/html; charset=utf-8"; ".htm"="text/html; charset=utf-8";
  ".js"="application/javascript"; ".css"="text/css"; ".json"="application/json";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".svg"="image/svg+xml"; ".ico"="image/x-icon"
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response
  $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart("/"))
  if ([string]::IsNullOrEmpty($rel)) { $rel = "index.html" }
  $path = Join-Path $root $rel
  $res.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate")
  if (Test-Path $path -PathType Leaf) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $ext = [System.IO.Path]::GetExtension($path).ToLower()
    if ($mime.ContainsKey($ext)) { $res.ContentType = $mime[$ext] }
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $res.StatusCode = 404
    $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - No encontrado: $rel")
    $res.OutputStream.Write($msg, 0, $msg.Length)
  }
  $res.Close()
}
