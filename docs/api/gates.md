# API Gates

## GET /api/gates
Liste tous les gates disponibles.

- **Headers** : `Authorization: Bearer <JWT>`
- **Réponse 200**
```json
{ "items": [{ "id": "perf.api.ttft_p95", "title": "TTFT p95" }] }
```
- **Erreurs** :
  - `401 unauthorized`
  - `403 forbidden`
  - `500 invalid_output`

## GET /api/recipes
Liste les recettes disponibles.

- **Headers** : `Authorization: Bearer <JWT>`
- **Réponse 200**
```json
{ "items": [{ "id": "release.preflight", "title": "Préflight" }] }
```
- **Erreurs** : `401 unauthorized | 403 forbidden | 500 invalid_output`

## POST /api/gates/run
Lance un gate.

- **Headers** :
  - `Authorization: Bearer <JWT>`
  - `x-idempotency-key: <uuid>`
- **Body**
```json
{ "gate_id": "perf.api.ttft_p95", "inputs": { "window_minute": 1 } }
```
- **Réponse 202**
```json
{ "job_id": "g1", "gate_id": "perf.api.ttft_p95", "inputs": { "window_minute": 1 }, "accepted_at": "2024-01-01T00:00:00Z", "trace_id": "t1" }
```
- **Erreurs** :
  - `400 idempotency-key-required | invalid_input`
  - `401 unauthorized`
  - `403 forbidden`
  - `409 already_running`
  - `429 rate_limited`
  - `500 internal_error`

## POST /api/recipes/run
Lance une recette.

- **Headers** : `Authorization: Bearer <JWT>`, `x-idempotency-key`
- **Body**
```json
{ "recipe_id": "release.preflight", "inputs": { "window_minute": 1, "payload": "p", "secret": "s" } }
```
- **Réponse 202** : `{ "job_id": "r1", "recipe_id": "release.preflight" }`
- **Erreurs** : `400 idempotency-key-required | invalid_input | 401 unauthorized | 403 forbidden | 409 already_running | 429 rate_limited | 500 internal_error`

## GET /api/gates/jobs/:id
Récupère l'état d'un job de gate ou recette.

- **Headers** : `Authorization: Bearer <JWT>`
- **Réponse 200**
```json
{
  "job": {
    "job_id": "g1",
    "type": "gate",
    "status": "finished",
    "started_at": "2024-01-01T00:00:00Z",
    "finished_at": "2024-01-01T00:00:05Z",
    "progress": { "total": 1, "done": 1 },
    "trace_id": "t1"
  },
  "result": {}
}
```
- **Erreurs** : `401 unauthorized | 404 not_found | 500 invalid_job`

## GET /api/gates/jobs/:id/logs
Retourne les logs NDJSON d'un job.

- **Headers** : `Authorization: Bearer <JWT>`
- **Réponse 200** : `application/x-ndjson`
```
{"ts":"...","level":"info","msg":"gate:start"}
```
- **Erreurs** : `401 unauthorized | 404 not_found`

