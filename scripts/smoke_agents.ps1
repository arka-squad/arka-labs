param()
$HostUrl = $env:HOST
$TokenViewer = $env:TOKEN_VIEWER
$TokenEditor = $env:TOKEN_EDITOR
$TokenAdmin = $env:TOKEN_ADMIN

$Log = "arka-meta/reports/codex/rbac_qa_logs.ndjson"
Set-Content -Path $Log -Value ""
$counts = @{}
$VerbosePreference = 'Continue'

function Invoke-Test {
    param($Role, $Method, $Token)
    $ts = (Get-Date).ToString("o")
    try {
        $params = @{Uri = "$HostUrl/api/agents"; Method = $Method; Headers = @{ Authorization = "Bearer $Token" }; TimeoutSec = 10 }
        if ($env:NO_PROXY) { $params.NoProxy = $true }
        $res = Invoke-WebRequest @params -UseBasicParsing -Verbose
        $code = [int]$res.StatusCode
        $err = $null
    } catch {
        $code = 000
        $err = $_.Exception.Message
    }
    $obj = @{ ts=$ts; host=$HostUrl; route='/api/agents'; method=$Method; role=$Role; code=$code }
    if ($err) { $obj.error = $err }
    ($obj | ConvertTo-Json -Compress) | Add-Content -Path $Log
    $key = "$Role|$code"
    if ($counts.ContainsKey($key)) { $counts[$key]++ } else { $counts[$key] = 1 }
}

Invoke-Test 'viewer' 'GET' $TokenViewer
Invoke-Test 'editor' 'GET' $TokenEditor
Invoke-Test 'editor' 'POST' $TokenEditor
Invoke-Test 'admin' 'POST' $TokenAdmin

"Summary:" | Write-Host
foreach ($key in $counts.Keys) {
    $parts = $key.Split('|')
    Write-Host "$($parts[0]) $($parts[1]) $($counts[$key])"
}
