# Observabilité

## /api/metrics/kpis

### 200

```json
{
  "p95": { "ttft_ms": 100, "rtt_ms": 200 },
  "error_rate_percent": 50
}
```

### 503

```json
{ "error": "db_unavailable" }
```

## /api/metrics/runs

### 200

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

### 503

```json
{ "error": "db_unavailable" }
```
