# Webhooks

## POST /api/webhook/github

### Valid

```bash
curl -X POST \
  -H "X-Hub-Signature-256: sha256=<sig>" \
  -H "X-GitHub-Delivery: <event_id>" \
  -d '{"sample":true}' \
  https://<host>/api/webhook/github
```

Response:

```json
{ "ok": true }
```

### Bad signature

```bash
curl -X POST \
  -H "X-Hub-Signature-256: sha256=bad" \
  -H "X-GitHub-Delivery: <event_id>" \
  -d '{"sample":true}' \
  https://<host>/api/webhook/github
```

Response:

```json
{ "error": "bad_signature" }
```

### Duplicate event

Sending the same request twice returns:

```json
{ "ok": true, "idempotent": true }
```
