Livrer B14 « Gate Aggregator + Recettes » sous forme de mission claire, exécutable et Codex‑ready, alignée avec B13 (intents Chat) et la vision produit V3. Ce document est la source de vérité pour cadrer, livrer et valider le lot.

Objectif
- Agréger, exécuter et tracer des « gates » (perf, sécurité, contrats, ops) et des « recettes » (enchaînements de gates) depuis le Chat et le Cockpit, avec résultats auditables et traçables.

Portée (v1)
- Inclus:
  - Catalogue de gates/recettes avec métadonnées (id, scope, risques, durées, tags).
  - Orchestrateur local (Node) avec timeouts, statut de job, SSE et logs NDJSON.
  - API REST (GET/POST) + endpoints de suivi (jobs, logs) + en‑têtes de traçage.
  - Intégrations: intents Chat (/gate, /test) et page Console/Gates (lecture + run safe).
  - RBAC minimal: viewer (RO), admin/owner (exécution), scopes safe/owner‑only.
  - Observabilité: trace_id, métriques clés, artefacts NDJSON/JSON en sortie.
- Exclus (v2): runners distants, marketplace externe, historique long en DB, SDK clients.

Contrats API (stables)
- Commun: headers « Authorization: Bearer <JWT> », « X-Trace-Id: <uuid> », « x-idempotency-key: <uuid> » pour POST run.
- Catalogue
  - GET /api/gates → 200 { items: GateDef[] }
  - GET /api/recipes → 200 { items: RecipeDef[] }
- Exécution (idempotente)
  - POST /api/gates/run → 202 { job_id, gate_id, inputs, accepted_at, trace_id }
  - POST /api/recipes/run → 202 { job_id, recipe_id, inputs, accepted_at, trace_id }
- Suivi & logs
  - GET /api/gates/jobs/:id → 200 { job: JobStatus, result?: GateResult|RecipeResult }
  - GET /api/gates/jobs/:id/logs → 200 text/x-ndjson (flux concaténé)
  - (Optionnel) GET /api/gates/stream?job_id=… (SSE: open, gate:start, gate:metric, gate:pass/fail/warn, done, error)
- Webhook (optionnel): POST /api/gates/webhook (HMAC‑SHA256) — 2xx si OK, 4xx si signature invalide.

RBAC (règles)
- viewer: GET catalogue + suivi jobs/logs
- admin/owner: viewer + POST run (safe). owner requis pour scope owner‑only.
- Codes d’erreur: 400 invalid_input | 401 unauthorized | 403 forbidden | 404 not_found | 409 already_running | 422 shape_mismatch | 429 rate_limited | 500 internal_error.

Schemas (JSON Schema)
- GateDef: { id, version, title, category:[perf|security|contracts|ops|kpis], inputs, outputs, risk:[low|med|high], scope:[safe|owner-only], est_duration_ms, tags[] }
- RecipeDef: { id, version, title, steps:[{ id, gate_id|recipe_id, if?, parallel?, retry? }], inputs, outputs, scope, tags }
- JobStatus: { job_id, type:[gate|recipe], status:[queued|running|pass|fail|warn|error|canceled], started_at?, finished_at?, progress:{total,done}, trace_id }
- GateResult: { gate_id, status:[pass|fail|warn], metrics: {k: number|string}, evidence: EvidenceRef[], message? }
- RecipeResult: { recipe_id, status, summary:{pass,fail,warn}, steps:[{ id, status, gate_result? }] }
- EvidenceRef: { type:[ndjson|json|text|url], path, bytes?, sha256 }

Runner (v1)
- In‑process (Node), timeouts par gate, sandbox minimale.
- Registre: /gates/catalog/*.mjs exportant `def` et `run(inputs, ctx)`; `validate(inputs)` facultatif.
- Conventions de métriques: p95_ms, p99_ms, error_rate_percent, lcp_ms, tti_ms, cls, a11y_score, schema_mismatch_count…

UI (Chat + Console)
- Chat (héritage B13):
  - Intent `/gate <id|alias>` → POST /api/gates/run → écoute SSE → rendu des événements (start, metrics, pass/fail, done) + affichage trace_id.
  - Intent `/test …` → exécute une recette prédéfinie.
- Console:
  - Page « Gates »: liste filtrable, détails, CTA « Lancer » pour scope safe; disabled + tooltip pour owner‑only.
  - Panneau des runs: statut en temps réel, toasts de réussite/échec, lien vers logs.

Observabilité & Sécurité
- Traçage: X-Trace-Id dans requêtes/réponses; corrélation UI↔API.
- Logs NDJSON: événements de gate/recette; exportables comme evidence.
- Webhook: signature HMAC, horodatage (+/‑5 min), aucune donnée sensible en clair.

Budgets & Perf (acceptance)
- 95% des gates < 30s; heartbeat SSE 15s; chunks NDJSON ≈1KB; débit ≈10 evt/s.
- Latence P95: GET < 200ms; POST /run < 500ms (acceptation).

Plan de tests (Given/When/Then)
- Catalogue
  - Given viewer When GET /api/gates Then 200 and items[].id != ""
  - Given viewer When GET /api/recipes Then 200
- Run gate
  - Given admin When POST /api/gates/run {gate_id:"perf.api.ttft_p95"} with X-Idempotency-Key Then 202 {job_id}
  - Given same key When POST again Then 202 same job_id
  - Given viewer When POST /api/gates/run Then 403
- Stream / Jobs
  - Given job_id When GET /api/gates/jobs/:id Then 200 with status in [running|pass|fail]
  - Given job_id When GET /api/gates/jobs/:id/logs Then 200 NDJSON (≥1 line)
- Recette
  - Given owner When POST /api/recipes/run {recipe_id:"release.preflight"} Then 202 and steps execute in order (parallel honored)
- Webhook
  - Given bad signature When POST /api/gates/webhook Then 403
- UI
  - Page Gates: CTA activé/désactivé selon scope; toasts pass/fail; historique visible.

Évidences attendues
- JSON: catalogue, job status, résultats de gate et recette.
- NDJSON: logs d’un run complet (open→done) archivés.
- CI: artefacts `results/gates/*.json`, `logs/gates/*.ndjson`, `sha256sums.txt`.

Jalons (exécutables)
1) Seeds: 5 gates + 3 recettes + schemas JSON.
2) Runner + API (GET/POST, jobs, logs) + SSE.
3) Intégration Chat + page Console/Gates.
4) Tests (unit, API, E2E) + CI (contrats + smokes).

Note vision (V3)
- Ce lot s’inscrit dans la promesse « organisation IA prête à l’emploi » (vision‑produit‑v3, KS‑Page‑arka‑v3, diver‑docs). Les gates et recettes matérialisent la gouvernance par preuves et l’orchestration multi‑agents.

PMO
- Ouvrir une PR unique `feat/b14-gate-aggregator` (catalogue, runner, API, UI, tests). Scope strict; pas d’autres chantiers.

