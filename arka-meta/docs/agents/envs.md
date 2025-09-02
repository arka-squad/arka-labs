# Agent Docs — Environnement arka-labs (CI smokes RBAC)

## But
Valider en continu les contrats réseau/RBAC de R2.5 avec oracles, matrice figée et evidence pack (artefacts NDJSON + SHA256).

## Hôtes & variables
- `HOST_PRIMARY=https://arka-squad.app`
- `HOST_FALLBACK=https://arka-liard.vercel.app`
- `NO_PROXY=localhost,127.0.0.1,.vercel.app,.vercel.dev,vercel.com,arka-squad.app,www.arka-squad.app,arka-liard.vercel.app`

## Secrets (repo)
- `RBAC_TOKEN_VIEWER`, `RBAC_TOKEN_EDITOR`, `RBAC_TOKEN_ADMIN` (JWT HS256 `iss=arka`, `aud=arka-squad`)
- `GITLEAKS_LICENSE`

## Workflows GitHub Actions
- `network-gate.yml` — Sanity sortie réseau → `GET /api/health` (200) + log fallback.
- `rbac-smokes.yml` — Pick host (apex→fallback), `node scripts/net_self_check.mjs`, `bash scripts/smoke_agents.sh`, compare aux attentes (`arka-meta/reports/staging/rbac_matrix.json`), upload artefacts.
- `secret-scan.yml` — Gitleaks officiel + allowlist (SHA/fixtures).

> Permissions conseillées : `permissions: { contents: read }`, `timeout-minutes`, `concurrency` (anti-doublon).

## Matrice RBAC (staging, figée)
- `GET /api/health` : viewer/editor/admin → **200**
- `GET /api/agents` : viewer **403**, editor **200**, admin **200**
- `POST /api/agents` : editor **403**, admin **201|200** ; **400** si body invalide
- Payload d’exemple POST : `arka-meta/reports/staging/payloads/agents.create.example.json` (schéma minimal accepté)

## Artefacts à chaque run
- `logs/net_self_check.ndjson`
- `arka-meta/reports/codex/rbac_qa_logs.ndjson`
- `arka-meta/reports/codex/R2_5/sha256sums.txt`
- Résumé Markdown (attendu vs obtenu) dans la sortie de job, lien vers artefacts.

## Procédure de tri
1. Health = 200 → OK réseau.
2. Diff smokes = Ø → PASS ; sinon afficher diff (endpoint × rôle × code).
3. En cas d’échec :
   - 403 inattendu → vérifier `Authorization`, rôle/claims, middleware route.
   - 400 admin → aligner payload au contrat POST.
   - Re-run après correction jusqu’à PASS.

## Références
- R2.5 (gates oracles/RBAC/evidence pack) — Plan Directeur 2.5
- Règles Codex : « branché ou rien », contrats stricts, logs JSON
