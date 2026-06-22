# EDTU - Servidor local estatico (sin dependencias)
# Uso: powershell -ExecutionPolicy Bypass -File server.ps1
$port = 8080
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()
Write-Host "EDTU server activo en http://localhost:$port/  (Ctrl+C para detener)"

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
