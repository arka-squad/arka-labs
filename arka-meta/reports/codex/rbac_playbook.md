# Playbook QA RBAC

## Scénarios cURL
```bash
HOST=${HOST:-https://www.arka-team.app}
TOKEN_VIEWER=<viewer-token>
TOKEN_EDITOR=<editor-token>
TOKEN_ADMIN=<admin-token>

curl -sv -H "Authorization: Bearer $TOKEN_VIEWER" "$HOST/api/agents"
curl -sv -H "Authorization: Bearer $TOKEN_EDITOR" "$HOST/api/agents"
curl -sv -X POST -H "Authorization: Bearer $TOKEN_EDITOR" -H 'Content-Type: application/json' -d '{}' "$HOST/api/agents"
curl -sv -X POST -H "Authorization: Bearer $TOKEN_ADMIN" -H 'Content-Type: application/json' -d '{}' "$HOST/api/agents"
```

## Scénarios PowerShell
```ps1
$HostUrl = $env:HOST
Invoke-WebRequest -Verbose -Headers @{ Authorization = "Bearer $env:TOKEN_VIEWER" } "$HostUrl/api/agents"
Invoke-WebRequest -Verbose -Headers @{ Authorization = "Bearer $env:TOKEN_EDITOR" } "$HostUrl/api/agents"
Invoke-WebRequest -Verbose -Method Post -Headers @{ Authorization = "Bearer $env:TOKEN_EDITOR" } -Body '{}' "$HostUrl/api/agents"
Invoke-WebRequest -Verbose -Method Post -Headers @{ Authorization = "Bearer $env:TOKEN_ADMIN" } -Body '{}' "$HostUrl/api/agents"
```

## Attendus

| Rôle   | Route           | Méthode | Code |
| ------ | --------------- | ------- | ---- |
| viewer | /api/agents     | GET     | 403  |
| editor | /api/agents     | GET     | 200  |
| editor | /api/agents     | POST    | 403  |
| admin  | /api/agents     | POST    | 200  |

## Contrat NDJSON (logs RBAC & smokes)

Chaque ligne doit respecter le schéma suivant :
```json
{
  "ts": "2024-01-01T00:00:00Z",
  "trace_id": "uuid",
  "route": "/api/agents",
  "method": "GET",
  "role": "viewer",
  "decision": "deny",
  "status": 403,
  "duration_ms": 12
}
```

Clés obligatoires : `ts`, `trace_id`, `route`, `method`, `role`, `decision`, `status`, `duration_ms`.

### Exemples
```json
{"ts":"2024-01-01T00:00:00Z","trace_id":"a","route":"/api/agents","method":"GET","role":"viewer","decision":"deny","status":403,"duration_ms":8}
{"ts":"2024-01-01T00:00:01Z","trace_id":"b","route":"/api/agents","method":"GET","role":"editor","decision":"allow","status":200,"duration_ms":7}
{"ts":"2024-01-01T00:00:02Z","trace_id":"c","route":"/api/agents","method":"POST","role":"admin","decision":"allow","status":200,"duration_ms":9}
```

## Checklist de réception
- [ ] Les commandes ci-dessus renvoient la séquence attendue 403,200,403,200
- [ ] Les logs respectent le contrat NDJSON
- [ ] Proxies désactivés via `NO_PROXY=*` si nécessaire
