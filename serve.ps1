# Servidor HTTP Simple para TSUKI-WEB-PROJECT
# Uso: PowerShell -ExecutionPolicy Bypass -File serve.ps1

$Port = 8000
$Path = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "🚀 Iniciando servidor en http://localhost:$Port"
Write-Host "📁 Sirviendo desde: $Path"
Write-Host "❌ Presiona Ctrl+C para detener"
Write-Host ""

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

try {
    while ($true) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq '/') { $localPath = '/index.html' }
        
        $filePath = Join-Path $Path $localPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            try {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = 
                    if ($filePath -match '\.html$') { 'text/html; charset=utf-8' }
                    elseif ($filePath -match '\.js$') { 'application/javascript; charset=utf-8' }
                    elseif ($filePath -match '\.css$') { 'text/css; charset=utf-8' }
                    elseif ($filePath -match '\.glb$') { 'model/gltf-binary' }
                    elseif ($filePath -match '\.json$') { 'application/json' }
                    elseif ($filePath -match '\.(png|jpg|jpeg|gif|svg|webp)$') { 'image/' + ($filePath -replace '^.*\.', '').ToLower() }
                    elseif ($filePath -match '\.(mp3|m4a|wav|ogg)$') { 'audio/' + ($filePath -replace '^.*\.', '').ToLower() }
                    else { 'application/octet-stream' }
                
                $response.ContentLength64 = $content.Length
                $response.OutputStream.Write($content, 0, $content.Length)
                Write-Host "✅ $($request.Url.LocalPath) ($($content.Length) bytes)"
            } catch {
                Write-Host "❌ Error leyendo $filePath : $_"
                $response.StatusCode = 500
                $response.StatusDescription = "Internal Server Error"
            }
        } else {
            $response.StatusCode = 404
            $response.StatusDescription = "Not Found"
            Write-Host "❌ 404 - No encontrado: $($request.Url.LocalPath)"
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "🛑 Servidor detenido"
}
