# Contracts — /api/chat/stream (socle B13)

- Method: `GET /api/chat/stream?thread_id=&agent=&ctx=&role=`
- Headers:
  - `Authorization: Bearer <JWT>` (si requis selon RBAC)
  - `X-Trace-Id: <uuid>` (recommandé)
  - `X-Provider: <openai|anthropic|openrouter|vercelai>`
  - `X-Model: <model_id>`
  - `X-Provider-Session: <session_token>` ou `X-Provider-Key: <key>` (preview‑only)
  - `Accept: text/event-stream`
- Events (SSE, NDJSON): `open | token | heartbeat | done | error`
- Errors: `401 auth.missing_jwt | 403 auth.forbidden_role | 429 rate.limit.exceeded | 503 provider.unavailable`

Note: Ce socle émet `open|token|done` en démo; heartbeat/error seront ajoutés avec B13‑04.
