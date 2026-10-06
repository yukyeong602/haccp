$port = 8080
$basePath = "C:\Users\Administrator\.gemini\antigravity-ide\scratch\haccp-cooking-master"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "HTTP Server listening on http://localhost:$port/"
} catch {
    Write-Error "Failed to start listener: $_"
    exit 1
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.LocalPath
        if ($rawPath -eq "/" -or [string]::IsNullOrEmpty($rawPath)) {
            $rawPath = "/index.html"
        }

        $relPath = $rawPath.TrimStart('/').Replace('/', '\')
        $filePath = Join-Path $basePath $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = "application/octet-stream"
            switch ($ext) {
                ".html" { $mime = "text/html; charset=utf-8" }
                ".css"  { $mime = "text/css; charset=utf-8" }
                ".js"   { $mime = "application/javascript; charset=utf-8" }
                ".json" { $mime = "application/json; charset=utf-8" }
                ".png"  { $mime = "image/png" }
                ".jpg"  { $mime = "image/jpeg" }
                ".svg"  { $mime = "image/svg+xml" }
            }
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.OutputStream.Flush()
        } else {
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.StatusCode = 404
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
            $response.OutputStream.Flush()
        }
        $response.Close()
    } catch {
        # ignore disconnects
    }
}
