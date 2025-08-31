# Observabilité

## /api/metrics/kpis
```json
{
  "p95": { "ttft_ms": 100, "rtt_ms": 200 },
  "error_rate_percent": 50
}
```

## /api/metrics/runs
```json
{
  "items": [
    { "ttft_ms": 100, "rtt_ms": 200, "status": "200" },
    { "ttft_ms": 200, "rtt_ms": 300, "status": "500" }
  ],
  "page": 1,
  "page_size": 2,
  "count": 2
}
```
