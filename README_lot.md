# Backend M2 endpoints

_Last updated: 2025-08-27_

## Table of Contents
- [SSE](#sse)
- [Documents](#documents)
- [Metrics](#metrics)
- [Spec Integration](#spec-integration)

## SSE
```bash
curl -N -H "Authorization: Bearer $TOKEN" https://api.arka.local/api/threads/<threadId>/stream
```

## Documents
```bash
curl -H "Authorization: Bearer $TOKEN" https://api.arka.local/api/documents?project=arka
curl -H "Authorization: Bearer $TOKEN" -F file=@doc.txt -F project=arka https://api.arka.local/api/documents
curl -X DELETE -H "Authorization: Bearer $TOKEN" https://api.arka.local/api/documents/1
```

## Metrics
```bash
curl -H "Authorization: Bearer $TOKEN" "https://api.arka.local/api/metrics?project=arka"
```

## Spec Integration
- [Backend API spec](arka-meta/backend/spec-integration.md)
- [Console UI spec](apps/console/spec-integration.md)
