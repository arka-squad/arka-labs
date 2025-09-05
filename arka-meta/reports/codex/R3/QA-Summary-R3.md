# QA Summary — R3 v0.1.0-demo

## Contexte
- Envs: prod https://arka-squad.app, preview https://arka-liard.vercel.app
- Périmètre: B1→B12 livrés; UI lecture‑seule où prévu, no‑write prod
- PRs/tag: #112, #114, #115, #117 mergées; tag `v0.1.0-demo` OK

## Synthèse
- B1 Base/Env: PASS
- B2 CI/Gates: PASS
- B3 Auth/RBAC (UI): PASS
- B4 KPIs/Health: PASS
- B5 Documents RO: PASS
- B6 Threads RO: PASS
- B7 Prompt Builder: CANCEL (masqué proprement)
- B8 Observabilité v0.5: PASS
- B9 AI Stream (pilote): PASS (dev/preview only; 404 prod toléré)
- B10 Substrat mémoire: PASS
- B11 DEMO/Offline: PASS
- B12 Evidence & Cut: PASS

## Détails
- B1: domaines/opérations OK; redirect "/console"→"/cockpit" (308 prod/302 preview); canonical host guard prod.
- B2: workflows verts (network‑gate, rbac‑smokes, secret‑scan, binary‑detector, OPS R3 - B1 Smokes).
- B3: /login (token paste) OK; badge rôle; guard cockpit OK.
- B4: /api/health 200; /api/metrics/kpis 200 admin / 403 viewer; Dashboard alimente KPIs.
- B5/B6: Documents/Threads lecture‑seule OK; tri/pagination/encarts conformes.
- B7: nav masquée; route 410; dead code nettoyé.
- B8: sparkline TTFT + runs paginés; cohérence visuelle.
- B9: `/api/chat/stream` (socle B13) activable en preview (flag); smoke optionnel.
- B10: `/api/memory/health` 200; no‑write guard prod OK.
- B11: OfflineBanner + Watermark; lecture‑seule si KO.
- B12: action release‑cut-demo SUCCESS; artefacts téléchargés; tag poussé.

## RBAC (échantillon)
- health: viewer 200 | admin 200
- metrics/kpis: viewer 403 | admin 200
- metrics/runs: viewer 403 | admin 200
- documents: viewer 200; threads: viewer 200
- ai stream: 404 prod (flag off) toléré; preview covered by smoke optionnel

## CI
- main: `network-gate`, `rbac-smokes`, `secret-scan`, `binary-detector`, `OPS R3 - B1 Smokes` SUCCESS
- option: `AI_STREAM_REQUIRED=1` → smoke `/api/chat/stream` (SSE `open|token|done`)

## Evidences (texte‑only)
- Cut: `arka-meta/reports/codex/R3/_cut_*/{health.json,kpis.json,runs.json,sha256sums.txt}`
- Vérifs: `arka-meta/reports/codex/R3/verify_arka-squad.app.json`, `verify_arka-liard.vercel.app.json`
- CR: `local/arka-codex/20250904-CR-GENERAL/CR-GENERAL-R3.md`

## Points d’attention
- SWC warnings Vercel (mineur); à lisser via build local `next build` si besoin.
- B9 renommé → `/api/chat/stream`; aligner smokes/refs quand B13 livré.
- Cockpit: sections taguées `data-codex-fake="dashboard_v1"` à remplacer lors du branchement live.

## Recommandations QA
- Marquer B1→B12 "QA‑PASS" et "READY‑FOR‑CUT" (cut effectué).
- Conserver AI smoke en option tant que B13 n’est pas branché.
- Laisser `/console/*` vivre pendant la transition; redirect racine déjà actif.

