# B14 — API + RBAC (contrat)

Endpoints (v1)
- GET `/api/gates` → 200 `{ items: GateDef[] }`
- GET `/api/recipes` → 200 `{ items: RecipeDef[] }`
- POST `/api/gates/run` (x-idempotency-key) → 202 `{ job_id, gate_id, inputs, accepted_at, trace_id }`
- POST `/api/recipes/run` (x-idempotency-key) → 202 `{ job_id, recipe_id, inputs, accepted_at, trace_id }`
- GET `/api/gates/jobs/:id` → 200 `{ job: JobStatus, result? }`
- GET `/api/gates/jobs/:id/logs` → 200 `text/x-ndjson`
- (opt) GET `/api/gates/stream?job_id=…` (SSE)

Headers communs
- `Authorization: Bearer <JWT>`
- `X-Trace-Id: <uuid>`
- `x-idempotency-key: <uuid>` (POST run)

RBAC
- viewer: GET catalogue + suivi jobs/logs
- admin/owner: POST run (safe). `owner` requis pour scope `owner-only`.

Codes d’erreur
- `400 invalid_input | 401 unauthorized | 403 forbidden | 404 not_found | 409 already_running | 422 shape_mismatch | 429 rate_limited | 500 internal_error`

Schemas (référence)
- Voir `schemas/gates/*.schema.json` (GateDef, RecipeDef, JobStatus, GateResult, RecipeResult, EvidenceRef)

