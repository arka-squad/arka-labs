param()
$HostUrl = $env:HOST
$TokenViewer = $env:TOKEN_VIEWER
$TokenEditor = $env:TOKEN_EDITOR
$TokenAdmin = $env:TOKEN_ADMIN

$tests = @(
    @{ token = $TokenViewer; method = 'GET'; body = $null },
    @{ token = $TokenEditor; method = 'GET'; body = $null },
    @{ token = $TokenEditor; method = 'POST'; body = '{}' },
    @{ token = $TokenAdmin; method = 'POST'; body = '{}' }
)

foreach ($t in $tests) {
    $headers = @{ Authorization = "Bearer $($t.token)" }
    if ($t.method -eq 'GET') {
        $res = Invoke-WebRequest -Headers $headers -Method Get "$HostUrl/api/agents"
    } else {
        $res = Invoke-WebRequest -Headers $headers -Method Post -Body $t.body -ContentType 'application/json' "$HostUrl/api/agents"
    }
    $res.StatusCode
}
