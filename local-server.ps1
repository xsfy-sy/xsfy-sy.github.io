# HEILIGS PIER 本地预览服务器
# 由"本地预览.bat"调用，双击 bat 后在本窗口运行，关闭窗口即停止
param(
  [string]$Root = (Split-Path -Parent $MyInvocation.MyCommand.Path),
  [int]$Port = 8010
)

$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host ""
  Write-Host "启动失败：端口 $Port 可能被占用。" -ForegroundColor Red
  Write-Host "请关闭之前的预览窗口后重试。" -ForegroundColor Red
  Write-Host ""
  pause
  exit 1
}

Write-Host ""
Write-Host "  本地预览已启动:  $prefix" -ForegroundColor Green
Write-Host "  网站根目录:      $Root"
Write-Host "  关闭本窗口即停止预览" -ForegroundColor Yellow
Write-Host ""

# MIME 类型表
$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".htm"  = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png"  = "image/png"
  ".gif"  = "image/gif"
  ".webp" = "image/webp"
  ".avif" = "image/avif"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".txt"  = "text/plain; charset=utf-8"
  ".mp4"  = "video/mp4"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch {
    break
  }
  try {
    $req = $ctx.Request
    $res = $ctx.Response

    # URL 解码并防目录穿越
    $urlPath = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($urlPath -eq "/") { $urlPath = "/index.html" }
    $rel = $urlPath.TrimStart("/") -replace "/", "\"
    $file = Join-Path $Root $rel
    $fullRoot = [System.IO.Path]::GetFullPath($Root)
    $fullFile = [System.IO.Path]::GetFullPath($file)

    if ($fullFile.StartsWith($fullRoot) -and (Test-Path $fullFile -PathType Leaf)) {
      $bytes = [System.IO.File]::ReadAllBytes($fullFile)
      $ext = [System.IO.Path]::GetExtension($fullFile).ToLower()
      $res.ContentType = $mime[$ext]
      if (-not $res.ContentType) { $res.ContentType = "application/octet-stream" }
      # 本地预览不禁缓存，但加 no-cache 保证每次拿到最新文件
      $res.Headers.Add("Cache-Control", "no-cache")
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $res.StatusCode = 200
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
      $res.ContentType = "text/plain; charset=utf-8"
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    $res.OutputStream.Close()
  } catch {
    # 单个请求出错不影响服务器继续运行
  }
}
