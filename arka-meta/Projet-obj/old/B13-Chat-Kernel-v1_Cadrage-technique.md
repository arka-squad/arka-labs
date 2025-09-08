# B13 — Chat Kernel v1 — Cadrage technique (Codex‑ready)

## Portée
- BYOK (Bring Your Own Key) avec sessions éphémères.
- Registry Providers/Models et routing Agent→Provider→Model (multi‑gate).
- SSE stream token‑par‑token avec TTFT mesuré.
- Intents minimales: `/gate`, `/test`, `/assign`, `/link` (parse + dispatch, idempotence).
- RBAC, rate‑limit, offline‑safe, evidence pack texte‑only.

## Endpoints & contrats (JSON/SSE)
- `POST /api/keys/exchange`
  - In: `{ provider:"openai|anthropic|openrouter|vercel_ai", token:"***" }`
  - Out: `{ session_token:"opaque", ttl_s:3600 }`
  - Notes: ne jamais logger la clé brute; logs NDJSON: `{provider, model?, key_hash, ttl_s}`.
- `DELETE /api/keys/session/:id`
  - Invalide la session côté serveur; prochain stream → `401`.
- `GET /api/providers`
  - Out: `{ items:[{ id, display_name, models:[{id,display,limits?}] }], cached_ms }` (seed offline si nécessaire, cache 5 min).
- `POST /api/providers/test`
  - In: `{ provider, model, session_token }`
  - Out: `{ ok:true, latency_ms:number }` (TTFB simulé si offline).
- `GET /api/chat/stream?thread_id&agent&ctx`
  - SSE events NDJSON: `{t:"open"|"token"|"done"|"error", at:number, token?, err?, trace_id}`.
  - TTFT < 2000 ms (démo), keep‑alive 20 s, support `AbortSignal`.

## En‑têtes & flags
- Requêtes UI/API: `X-Trace-Id`, `X-Provider`, `X-Model`, `X-Provider-Session`.
- Flags:
  - `NEXT_PUBLIC_AI_ENABLED=true` (active routes dev/preview)
  - `AI_STREAM_REQUIRED=1` (smoke CI optionnel)
  - `MEM_WRITE_ENABLED=true` (dev uniquement; prod → no‑write)

## RBAC (résumé)
- Viewer: BYOK OK, `/providers` OK, `/chat/stream` OK (intents simulées); mutations sensibles interdites prod.
- Editor/Owner: BYOK + routing + intents actives.
- Rappels: 401 (non authentifié), 403 (rôle insuffisant), 429 (rate‑limit) — messages i18n homogènes.

## Sécurité
- Clés: jamais stockées en clair; sessions opaques (TTL configurable). Hash clé en logs (`sha256(key+salt)`), jamais la clé.
- CORS strict pour `/keys/*`; anti‑replay (horodatage); rate‑limit global + par session.
- En prod: `MemoryRepo` en lecture seule (no‑write guard) pour mapping et sessions; pas de token dans les URLs.
- Offline‑safe: watermark DEMO + lecture seule; bannières via `OfflineBanner`.

## Observabilité & evidences
- Logs NDJSON `logs/chat_gateway.ndjson`: `{ts, trace_id, agent, provider, model, ttft_ms, tokens}`.
- Export: `arka-meta/reports/codex/R3/chat/{thread.json, chat_gateway.ndjson, sha256sums.txt}`.
- TTFT: mesuré côté serveur et affiché en UI (Dock), corrélé par `X-Trace-Id`.

## UI & composants
- `TokenModal` (BYOK: provider, token, modèle, tester, enregistrer, TTL restant)
- `ProviderSelect` (chips par agent, switch à chaud, test provider)
- `Dock` (stream + TTFT + Copier trace)
- `useChatCommands` (parse intents), `bus.ts` (EventTarget `chat:intent`), idempotence par clé d’intent

## Tests & CI
- Unit: parser intents, router provider, TTL/révocation sessions.
- SSE shape: `open|token|done|error` (linter/contract simple).
- Smokes: `/api/health`, `/api/metrics/{kpis,runs}` (existants), `/api/chat/stream` (si `AI_STREAM_REQUIRED=1`).
- RBAC‑smokes: 200/401/403 sur `keys`, `providers`, `chat/stream` selon rôle.

## Réutilisation existante
- Renommer/étendre B9 → `/api/chat/stream` (pilote) en s’appuyant sur `NEXT_PUBLIC_AI_ENABLED`.
- Re‑use `MemoryRepo` (sessions/mapping), `OfflineBanner`/`Watermark` (B11).

## Risques & garde‑fous
- PII/légal: doc BYOK + “no storage”; masquer le token en UI; disclaimer.
- Coûts/latence providers: `providers/test` + fallback simulateur (echo) pour TTFT stable en démo.
- Preview: mutations et BYOK derrière flags; aucune persistance prod.

## Acceptance (DoD B13)
- AC verts B13‑01→09; TTFT p95 < 2000 ms en démo.
- Evidence pack texte‑only exporté + `sha256sums.txt`.
- Docs BYOK & README chat à jour; A11y AA vérifiée.




----------------------------

