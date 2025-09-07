B14 — Gate Aggregator + Recettes

Cadrage:
  but: "Permettre d’agréger, exécuter et tracer des 'gates' (perf, sécurité, contrats…) et des 'recettes' (ensembles orchestrés de gates) depuis le Chat et le Cockpit, avec résultats auditables."
  portee:
    in:
      - Registre de gates (catalogue typé + métadonnées)
      - Orchestrateur de recettes (séquences/graphes de gates, dépendances, parallélisme)
      - API & SSE pour lancer/suivre: run gate/recette → job → events → résultats
      - Intégration Chat (intents `/gate`, `/test`) + Cockpit (panneau Gates)
      - Observabilité: métriques, logs NDJSON, trace_id corrélé UI→API
      - RBAC: viewer RO, operator exécute gates safe, owner tout
      - CI: contrats JSON, smokes E2E, guards perf & sécurité
    out:
      - Exécution sur infra client (runners distants) — v2
      - Marketplace de gates externes tierces — v2
      - Persistences lourdes (DB historique longue) — v2 (v1: stockage fichiers NDJSON/JSON court terme)

  contrats:
    rbac:
      viewer: ["GET /api/gates*", "GET /api/recipes*", "GET /api/gates/jobs/:id", "GET /api/gates/stream"]
      operator: viewer + ["POST /api/gates/run (scopes:safe)", "POST /api/recipes/run (scopes:safe)"]
      owner: "*"
    api:
      # Catalogue
      - GET /api/gates              → 200 { items: GateDef[] }
      - GET /api/recipes            → 200 { items: RecipeDef[] }
      # Exécution (idempotente)
      - POST /api/gates/run         → 202 { job_id, gate_id, inputs, accepted_at, trace_id }
      - POST /api/recipes/run       → 202 { job_id, recipe_id, inputs, accepted_at, trace_id }
      # Suivi & résultats
      - GET  /api/gates/jobs/:id    → 200 { job: JobStatus, result?: GateResult|RecipeResult }
      - GET  /api/gates/jobs/:id/logs → 200 text/ndjson (events concat)
      - GET  /api/gates/stream?job_id=…  (SSE)
          events NDJSON:
            {"t":"open","ts","job_id"}
            {"t":"stage","name","status"}          # recette
            {"t":"gate:start","gate_id","inputs"}
            {"t":"gate:metric","k","v"}            # ex: p95_ms
            {"t":"gate:warn","code","msg"}
            {"t":"gate:fail","code","msg"}
            {"t":"gate:pass","summary"}
            {"t":"done","status","stats":{"pass","fail","warn","duration_ms"}}
            {"t":"error","code","msg"}
      # Webhook (optionnel, si callback client)
      - POST /api/gates/webhook  (HMAC-SHA256)
          headers: X-Signature: sha256=<hex>, X-Event-Id, X-Trace-Id
          body: {job_id, status, payload}
          2xx only; 4xx si HMAC invalide
    headers_communs:
      - Authorization: Bearer <JWT>
      - X-Trace-Id: <uuid>
      - X-Idempotency-Key: <uuid>  # requis pour POST /run
    codes_erreur:
      - 400 invalid_input | 401 unauthorized | 403 forbidden | 404 not_found | 409 already_running | 422 shape_mismatch | 429 rate_limited | 500 internal_error
    schemas (JSON Schema; strict, versionnés):
      - GateDef.schema.json:
          { id, version, title, category: ["perf","security","contracts","ops","kpis"],
            inputs: {...}, outputs: {...}, risk: ["low","med","high"],
            scope: ["safe","owner-only"], est_duration_ms, tags: string[] }
      - RecipeDef.schema.json:
          { id, version, title, steps: Array<{ id, gate_id|recipe_id, if?:expr, parallel?:boolean, retry?:{count,backoff_ms} }>,
            inputs, outputs, scope, tags }
      - JobStatus.schema.json:
          { job_id, type:"gate"|"recipe", status:"queued"|"running"|"pass"|"fail"|"warn"|"error"|"canceled",
            started_at?, finished_at?, progress:{total, done}, trace_id }
      - GateResult.schema.json:
          { gate_id, status:"pass"|"fail"|"warn", metrics:{[k]:number|string}, evidence: EvidenceRef[], message? }
      - RecipeResult.schema.json:
          { recipe_id, status, summary:{pass,fail,warn}, steps: Array<{id,status,gate_result?}> }
      - EvidenceRef.schema.json:
          { type:"ndjson"|"json"|"text"|"url", path, bytes?, sha256 }

  orc/runner (implémentation v1):
    - Runner in-process (Node) avec timeouts (par gate) et sandbox minimale
    - Registre: /gates/catalog/*.mjs exportant `run(inputs, ctx)` + `validate(inputs)`
    - Conventions métriques (noms standards): p95_ms, p99_ms, error_rate_percent, lcp_ms, tti_ms, cls, a11y_score, schema_mismatch_count…

  ui (cockpit + chat):
    dock_chat (B13):
      - Intent `/gate <id|alias>` → POST /api/gates/run (idempotent) → écouter SSE → écho tokens:
        * À `gate:start` → bulle info "Gate <id> démarrée"
        * À `gate:metric` → live TTFT-like (mini HUD)
        * À `gate:pass/fail/warn` → tag coloré + lien "voir détails"
        * À `done` → résumé + trace_id ; copier trace (toast)
      - Intent `/test <docId>` → alias recette `contracts.basic` avec input {docId}
    cockpit (panneau Gates):
      - Page `/console/gates`: 
        * colonne gauche: Catalogue (filtre par catégorie/tags, recherche)
        * colonne centrale: Détails Gate/Recette (markdown+schema), bouton "Lancer", inputs dynamiques
        * colonne droite: Runs récents (20), status chips, trace_id cliquable (→ Observabilité)
      - États: empty/loading/error ; toasts : success/warn/error ; A11y: aria-live polite
      - Badge RBAC: CTA disabled si rôle insuffisant (tooltip "owner requis")
    ux textes (via Content Registry):
      - `ui.gates.banner.owner_required`
      - `ui.gates.inputs.placeholder.*`
      - `ui.gates.results.summary.*`

  gates & recettes v1 (seed):
    gates:
      - perf.lighthouse.basic     (inputs:{url}, outputs:{lcp_ms, tti_ms, cls, score_a11y})
      - perf.api.ttft_p95         (inputs:{window_minute}, outputs:{p95_ms})
      - contracts.schema.documents (inputs:{doc_ids[]}, outputs:{schema_mismatch_count})
      - security.webhook.hmac     (inputs:{payload, secret}, outputs:{status})
      - ops.kpis.kpi_snapshot     (inputs:{}, outputs:{ttft_p95, rtt_p95, error_rate_percent})
    recettes:
      - perf.budget_demo          (steps:[perf.lighthouse.basic, perf.api.ttft_p95], scope:safe)
      - contracts.basic           (steps:[contracts.schema.documents], scope:safe)
      - release.preflight         (steps:[ops.kpis.kpi_snapshot, perf.api.ttft_p95, security.webhook.hmac], scope:owner-only)

  idempotence & concurrence:
    - POST /run doit fournir `X-Idempotency-Key`; même clé dans 5 min → 202 (job existant renvoyé)
    - Limites: 5 jobs parallèles / user ; 1 job actif / gate_id si `dedupe:true` dans GateDef
    - Cancel: POST /api/gates/jobs/:id/cancel (owner) → 202 (v1 optionnel)

  observabilite:
    metrics (Prom/OTLP ready):
      - gates_jobs_total{type,status,gate_id}
      - gates_duration_ms{gate_id,quantile=p95}
      - recipes_duration_ms{recipe_id,quantile=p95}
      - gates_errors_total{gate_id,code}
      - sse_clients{route="/api/gates/stream"}
    logs NDJSON (stdout+fichiers dev/preview):
      - {ts, level, msg, route, job_id, gate_id|recipe_id, status, duration_ms, trace_id, user_role}
    evidence pack:
      - stocker `logs/gates/<job_id>.ndjson` + `results/gates/<job_id>.json` (dev/preview); PR: joindre `sha256sums.txt`

  budgets & perf:
    - accept: 95% gates < 30s ; SSE heartbeat 15s ; chunk NDJSON ≤ 1KB ; throughput SSE ≥ 10 evt/s stable
    - API P95 latency: GET < 200ms ; POST run < 500ms (acceptance)

  sécurité:
    - JWT obligatoire (sauf preview dev guard) ; scope gate `owner-only` bloquée pour roles ≠ owner → 403
    - Webhook HMAC requis si configuré ; horodatage & rejet si dérive > 5 min
    - Redaction: aucune donnée sensible des docs/keys dans logs ; EvidenceRef filtrée

  tests_plan (Given/When/Then):
    - Catalogue
      * Given viewer When GET /api/gates Then 200 && items[].id non vides
      * Given viewer When GET /api/recipes Then 200
    - Run gate
      * Given operator with scope safe When POST /api/gates/run {gate_id:"contracts.schema.documents", doc_ids:["D-203"]} & X-Idempotency-Key Then 202 {job_id}
      * Given same key When POST again Then 202 same job_id
      * Given viewer When POST /api/gates/run Then 403
    - Stream
      * Given job_id When GET /api/gates/stream?job_id Then receive open → gate:start → (metrics)* → gate:pass|fail → done
      * Given done When GET /api/gates/jobs/:id Then 200 with result schema-valid
    - Recette
      * Given owner When POST /api/recipes/run {recipe_id:"release.preflight"} Then 202 And steps executed in order with parallel where set
    - Webhook
      * Given configured secret When POST /api/gates/webhook with invalid signature Then 403
    - UI (cockpit)
      * Given operator When open /console/gates Then CTA "Lancer" enabled for safe gates ; disabled for owner-only with tooltip
      * Given click Lancer Then panel "Run en cours…" shows live events ; on pass/fail shows summary & link "Voir trace"
      * Chat intent
        - Given "/gate perf.budget_demo" Then chat shows streaming of events & final summary

  evidences:
    - Snapshots JSON: catalog, sample results, recipe summary
    - Screencast: run d’une gate (pass) + d’une gate (fail) + recette
    - NDJSON sample: events stream complet (open→done)
    - CI artefacts: `results/gates/*.json`, `logs/gates/*.ndjson`, `sha256sums.txt`

  risques:
    - "flaky" des mesures perf (environnement non déterministe) → mitig: seed/data mocks côté perf.api*, tolérance ±10%
    - "long jobs" bloquants → mitig: timeouts, `retry` param dans steps, stream keep-alive
    - "dérive contrats" (schemas évoluent) → mitig: versionner GateDef/RecipeDef + compat couches

  next_step:
    - Ajouter `/gates/catalog/` (5 gates + 3 recettes seeds) + JSON Schemas
    - Implémenter orchestrateur (runner local + SSE) + endpoints + logs/metrics
    - Brancher intents Chat + Panneau `/console/gates`
    - Écrire tests unit (schemas/runner) + API + E2E (chat+UI)
