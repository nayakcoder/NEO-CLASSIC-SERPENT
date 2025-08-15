# Simple HTTP Server for Neon Serpent Game
$port = 8080
$root = Get-Location

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "🚀 Neon Serpent: Reborn server running at:" -ForegroundColor Green
Write-Host "   http://localhost:$port" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Mobile Controls:" -ForegroundColor Yellow
Write-Host "   • Swipe in any direction to move the snake" -ForegroundColor White
Write-Host "   • Tap DASH button (⚡) to activate phase dash" -ForegroundColor White
Write-Host "   • Tap PAUSE button (⏸️) to pause/resume" -ForegroundColor White
Write-Host ""
Write-Host "💻 Desktop Controls:" -ForegroundColor Yellow
Write-Host "   • WASD or Arrow Keys to move" -ForegroundColor White
Write-Host "   • Space to dash" -ForegroundColor White
Write-Host "   • P to pause" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# MIME types
$mimeTypes = @{
    '.html' = 'text/html'
    '.css'  = 'text/css'
    '.js'   = 'text/javascript'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.ico'  = 'image/x-icon'
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get requested file path
        $path = $request.Url.AbsolutePath
        if ($path -eq '/') { $path = '/index.html' }
        
        $cleanPath = $path.TrimStart('/')
        $filePath = Join-Path $root $cleanPath
        
        if (Test-Path $filePath -PathType Leaf) {
            # Get file extension and set content type
            $ext = [System.IO.Path]::GetExtension($filePath)
            if ($mimeTypes.ContainsKey($ext)) {
                $response.ContentType = $mimeTypes[$ext]
            }
            
            # Read and serve file
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
            
            Write-Host "✅ Served: $path" -ForegroundColor Green
        } else {
            # 404 Not Found
            $response.StatusCode = 404
            $html = "<h1>404 - File Not Found</h1><p>$path</p>"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($html)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            
            Write-Host "❌ Not found: $path" -ForegroundColor Red
        }
        
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Server stopped: $($_.Exception.Message)" -ForegroundColor Yellow
} finally {
    $listener.Stop()
    $listener.Dispose()
}
