# TCK-ARKA-GOPACK-V0_1 — Consolidated v1.2 (Codex‑ready)

> **But**: livrer une **Console utilisable** (démo interne/externe), UI branchée en **lecture** avec garde réseau, RBAC cohérent et smokes déterministes. Inclut **DoR**, **oracles**, **spec-integration v1.2**, **CI**, **scripts**, **matrice RBAC**, **évidences**, **checklists**, **risques**. Cette v1.2 intègre les durcissements demandés (HOST primaire, oracles étendus, artefacts, guard CI, UX:KIT, etc.).

---

## 0) Executive Summary & Ancrages normatifs

* **Branché ou rien** (zéro Storybook-only). **Anti-mocks/Anti-skip** sur routes *branchées*.
* **Budgets** UI: LCP ≤ 2.5s (/, /login), TTI ≤ 2s (/console), CLS < 0.1. **A11y**: WCAG 2.1 AA.
* **RBAC UI (R2.5)**: `viewer` (RO), `operator` (édition locale limitée), `owner` (édition complète). **Compat**: `editor→operator`, `admin→owner`.
* **Observabilité**: `/api/metrics/kpis` expose `{ p95.{ttft_ms,rtt_ms}, error_rate_percent }` (arrondi 1 déc.).
* **Offline/Démo**: bannière RO + watermark **DEMO**; net‑guard UI.

---

## 1) Ticket JSON (codex‑ready, consolidé)

```json
{
  "id": "TCK-ARKA-GOPACK-V0_1",
  "version": "R2.5 v0.1",
  "title": "Arka – Go Pack v0.1 (Console utilisable + CI smokes)",
  "status": "ready-for-codex",
  "labels": ["lot:R2.5","priority:P0","ui","rbac","ci/smokes","a11y","perf"],
  "description": "Livrer la Console v0.1 utilisable: login+RBAC, 3 KPIs, Documents RO (20/l), Observabilité simple, Threads RO(5), Prompt Builder v1 (local-only, export/import JSON), net-guard UI en offline, Mode Démo, smokes CI déterministes basés matrice RBAC.",
  "repository": "arka-console",
  "component": "app/",
  "env": {
    "required": [
      "HOST (defaut=https://www.arka-team.app)",
      "RBAC_TOKEN (pour /login pasting)",
      "RBAC_TOKEN_VIEWER/RBAC_TOKEN_OPERATOR/RBAC_TOKEN_OWNER (CI)",
      "NO_PROXY, HTTPS_PROXY, HTTP_PROXY, ALL_PROXY (réseau CI)"
    ],
    "notes": [
      "Fallback: https://arka-liard.vercel.app si HOST non joignable",
      "Rôles normalisés UI: viewer | operator | owner (compat: editor→operator, admin→owner)",
      "JWT HS256 (iss=arka, aud=arka-squad); clock_skew tolérée côté BE"
    ]
  },
  "acceptance": [
    "A1 Auth/RBAC: badge rôle visible (topbar), 401->/login; API ajoute Authorization si RBAC_TOKEN présent; logout clear token+redirect.",
    "A2 KPIs: 3 cartes (p95.ttft_ms, p95.rtt_ms, error_rate_percent) affichées avec 1 décimale; Health chip = vert si GET /api/health -> 200.",
    "A3 Documents: GET /api/documents?page=1&page_size=20 ; tableau = 20 lignes si dispo; tri stable created_at DESC, id ASC; empty/error states.",
    "A4 Prompt Builder v1 (local-only): owner/operator éditent localement; viewer RO; export/import JSON round-trip identique; badge LOCAL • non persisté.",
    "A5 Observabilité: graphe + filtres Lot/Sprint (UI); valeurs cohérentes avec KPIs; mock autorisé seulement en DEMO ou si offline.",
    "A6 Threads RO: 5 derniers threads (title + last_msg_at lisible), règle last_msg_at=COALESCE(MAX(messages.created_at),threads.created_at) côté BE.",
    "A7 A11y/Perf: nav clavier complète; contrastes >=4.5:1; LCP ≤2.5s (/,/login), TTI ≤2s (/console), CLS <0.1.",
    "A8 Offline/Démo: si /api/health != 200 => bannière 'Service indisponible — authentifié, mais l’API ne répond pas. La Console passe en lecture seule.'; Mode DEMO applique seeds + watermark; bouton Copier métriques.",
    "A9 CI smokes: rbac-smokes basés matrice (warn|fail) + artefacts logs; network-gate publie codes /api/health (primary/fallback)."
  ],
  "ai_ready": {
    "lighthouse": {
      "/": { "lcp_ms_max": 2500, "tti_ms_max": 2000, "a11y_min": 90 },
      "/login": { "lcp_ms_max": 2500, "tti_ms_max": 2000, "a11y_min": 90 },
      "/console": { "tti_ms_max": 2000, "a11y_min": 90 }
    },
    "visual_regression": false,
    "oracles": [
      "GET /api/health",
      "GET /api/metrics/kpis",
      "GET /api/documents?page=1&page_size=20",
      "GET /api/chat/threads",
      "GET /api/metrics/runs?page=1&limit=20"
    ],
    "gates": ["network-gate", "rbac-smokes", "secret-scan"]
  },
  "files_to_add_or_edit": [
    {"path":"spec-integration.md","purpose":"spec UI v0.1 pour dev"},
    {"path":"arka-meta/reports/staging/rbac_matrix.json","purpose":"matrice smokes RBAC"},
    {"path":"arka-meta/reports/staging/payloads/agents.create.example.json","purpose":"payload POST agents"},
    {"path":"scripts/smokes_matrix_guard.mjs","purpose":"runner smokes basé matrice (Node)"},
    {"path":"scripts/smoke_agents.sh","purpose":"smokes bash guardés (fallback CI)"},
    {"path":".github/workflows/network-gate.yml","purpose":"probe santé (primary/fallback)"},
    {"path":".github/workflows/rbac-smokes.yml","purpose":"smokes RBAC + artefacts"},
    {"path":".github/workflows/secret-scan.yml","purpose":"gitleaks action (licence via secret si org)"},
    {"path":".github/.gitleaks.toml","purpose":"allowlist faux positifs"},
    {"path":"README.md","purpose":"section CI + Mode Démo + net-guard"},
    {"path":"docs/UX-KIT/usage.md","purpose":"guide composants"},
    {"path":"docs/UX-KIT/props.json","purpose":"props clés des composants"}
  ],
  "merges_required": "1 MR (UI + CI + matrice)",
  "evidence": [
    "screenshots/{login.png,console_nav.png,documents.png,observabilite.png}",
    "logs/ui_network.json",
    "lighthouse_*.json",
    "vercel_build_*.log",
    "arka-meta/reports/codex/R2_5/sha256sums.txt"
  ],
  "notes": [
    "Ne pas modifier 'compétences' d’agent: Prompt Builder v1 est local-only (doc/outillage), pas un skill editor.",
    "UI ne doit jamais afficher 'SKIPPED'; réservé aux logs CI.",
    "Host par défaut: https://www.arka-team.app ; fallback Vercel automatique si health!=200."
  ]
}
```

---

## 2) Definition‑of‑Ready (DoR) — Bloc YAML (à coller en tête du ticket)

```yaml
definition_of_ready:
  contexte: "Go Pack v0.1 : prouver la Console R2.5 en réel (lecture only), gouvernée et auditée"
  objectif: "Parcours /→/login→/console sans erreur ; pages branchées ; CI smokes publiées ; evidence pack joint"
  portee: "UI Console + CI + Matrice RBAC ; pas d’API write ni back office"

  contrats:
    api:
      routes:
        - { method: GET, path: "/api/health", response_schema: { status: "ok" }, codes: [200] }
        - { method: GET, path: "/api/metrics/kpis", response_schema: { p95: { ttft_ms: "int", rtt_ms: "int" }, error_rate_percent: "number(1dec)" }, codes: [200] }
        - { method: GET, path: "/api/metrics/runs?page=1&limit=20", response_keys: [items,page,limit,count], codes: [200] }
        - { method: GET, path: "/api/documents", query: "page=1&page_size=20", response_keys: [items,page,page_size,count], codes: [200] }
        - { method: GET, path: "/api/chat/threads", response_keys: [items[].id, items[].title, items[].last_msg_at], codes: [200] }
      pagination: { page_param: "page", page_size_param: "page_size", defaults: { page: 1, page_size: 20 }, max_page_size: 100 }
      rules: [ response_shape_must_match, error_codes_strict ]
    ui:
      pages: ["/", "/login", "/console", "/console/documents", "/console/prompt-builder", "/console/observabilite"]
      actions_api_map:
        - { action: "LoadKPIs", calls: ["GET /api/metrics/kpis"] }
        - { action: "ListRuns", calls: ["GET /api/metrics/runs?page=1&limit=20"] }
        - { action: "ListDocs", calls: ["GET /api/documents?page=1&page_size=20"] }
        - { action: "ListThreads", calls: ["GET /api/chat/threads"] }

  donnees:
    fixtures: ["CAPSULES/r3-e2e/SQLPACK.md"]

  securite:
    rbac:
      viewer: ["GET /api/*"]
      operator: ["GET /api/*"]
      owner: ["*"]
    secrets: ["RBAC_TOKEN*", "GITLEAKS_LICENSE (optionnel)"]
    hmac: false

  budgets:
    lcp_home_ms_p75: 2500
    tti_console_ms_p75: 2000
    a11y_level: "AA"

  tests_plan:
    - "Given viewer, When open /console, Then KPIs visibles & HealthChip vert si 200"
    - "Given owner, When open /console/documents, Then 20 lignes max + tri stable"
    - "Given operator, When open /console/prompt-builder, Then édition locale + export/import JSON identique"

  oracles:
    curl_examples:
      - { name: documents_list, cmd: "curl -s \"$HOST/api/documents?page=1&page_size=20\"", expect_json_keys: [items,page,page_size,count], expect_sort: { by: [created_at,id], order: [DESC,ASC] } }
      - { name: chat_threads, cmd: "curl -s \"$HOST/api/chat/threads\"", expect_json_shape: { items: [ { id: "uuid", title: "string", last_msg_at: "iso8601" } ] } }
      - { name: metrics_kpis, cmd: "curl -s \"$HOST/api/metrics/kpis\"", expect_json_shape: { p95: { ttft_ms: "int", rtt_ms: "int" }, error_rate_percent: "number(1dec)" } }
      - { name: metrics_runs, cmd: "curl -s \"$HOST/api/metrics/runs?page=1&limit=20\"", expect_json_keys: [items,page,limit,count] }
    no_mocks: true

  environnement:
    roles_et_actions:
      owner_executes: ["Migration SQL", "Seed SQL"]
      codex_executes: ["Code", "Tests", "Evidences"]

  evidences_attendues:
    - "screenshots/{login.png,console_nav.png,documents.png,observabilite.png}"
    - "logs/ui_network.json"
    - "lighthouse_*.json"
    - "vercel_build_*.log"
    - "arka-meta/reports/codex/R2_5/sha256sums.txt"

  gate_DoR: true
```

---

## 3) Codex Header (à placer sous la DoR)

```yaml
codex_header:
  agent: Codex
  regles: "arka-meta/codex_rules/codex_rules_current.md"
  oracles:
    curl_examples:
      - { name: documents_list, cmd: "curl -s \"$HOST/api/documents?page=1&page_size=20\"", expect_json_keys: [items,page,page_size,count], expect_sort: { by: [created_at,id], order: [DESC,ASC] } }
      - { name: chat_threads, cmd: "curl -s \"$HOST/api/chat/threads\"", expect_json_shape: { items: [ { id: "uuid", title: "string", last_msg_at: "iso8601" } ] } }
      - { name: metrics_kpis, cmd: "curl -s \"$HOST/api/metrics/kpis\"", expect_json_shape: { p95: { ttft_ms: "int", rtt_ms: "int" }, error_rate_percent: "number(1dec)" } }
      - { name: metrics_runs, cmd: "curl -s \"$HOST/api/metrics/runs?page=1&limit=20\"", expect_json_keys: [items,page,limit,count] }
    no_mocks: true
  contrats:
    api:
      pagination: { page_param: "page", page_size_param: "page_size", defaults: { page: 1, page_size: 20 }, max_page_size: 100 }
  environnement:
    roles_et_actions:
      owner_executes: ["Migration SQL", "Seed SQL"]
      codex_executes: ["Code+Tests+Evidences"]
  evidences_attendues:
    - "screenshots/{login.png,console_nav.png,documents.png,observabilite.png}"
    - "logs/ui_network.json"
    - "lighthouse_*.json"
    - "vercel_build_*.log"
    - "arka-meta/reports/codex/R2_5/sha256sums.txt"
  gate_DoR: true
```

---

## 4) Contrats API (lecture v0.1) & Oracles

**Health** — `GET /api/health` → `200 {"status":"ok"}`

**KPIs** — `GET /api/metrics/kpis` → `200 { "p95": { "ttft_ms": int, "rtt_ms": int }, "error_rate_percent": number }`

**Runs** — `GET /api/metrics/runs?page=1&limit=20` → `200 { items: [...], page, limit, count }` (tri serveur: `created_at DESC`).

**Documents** — `GET /api/documents?page=1&page_size=20` → `200 { items: [{ id, project_id, name, mime, size, storage_url, created_at }], page, page_size, count }` (tri **UI**: `created_at DESC, id ASC`).

**Threads** — `GET /api/chat/threads` → `200 { items: [{ id, title, last_msg_at }] }` (server rule : `last_msg_at = COALESCE(MAX(messages.created_at), threads.created_at)`).

**cURL oracles (copier/coller)**

```bash
curl -s "$HOST/api/health"
curl -s "$HOST/api/metrics/kpis" | jq .
curl -s "$HOST/api/metrics/runs?page=1&limit=20" | jq .
curl -s "$HOST/api/documents?page=1&page_size=20" | jq .
curl -s "$HOST/api/chat/threads" | jq .
```

---

## 5) Spec‑Intégration UI — **`spec-integration.md` (v1.2, rempli)**

### 1) Contexte & objectifs

* **Source**: cadrage R2.5 (déménagement Arka) + maquettes internes Console.
* **Objectifs**: Console utilisable en lecture; Observabilité (KPIs + Runs RO); Documents RO; Threads RO; Prompt Builder v1 **local-only**; net‑guard UI.
* **Cible**: Desktop first, responsive mobile; public B2B squads tech.
* **Contraintes**: perf (LCP/TTI/CLS), WCAG AA, RBAC visible, anti-mocks, evidence pack.

### 2) Stack & environnement

* **Next.js (App Router), React 18, Tailwind**; shadcn/ui facultatif; lucide-react icônes.
* **Wrapper `apiFetch`**: ajoute `Authorization: Bearer <token>` si `RBAC_TOKEN` (LocalStorage). Redirige `/login` si 401. **Génère `X-Trace-Id`** (UUID v4) par requête et le propage.
* **HOST**: `NEXT_PUBLIC_HOST` (défaut `https://www.arka-team.app`), fallback Vercel si `GET /api/health` ≠ 200.

### 3) Design System & tokens (exemple minimal)

```json
{
  "colors": {
    "bg": "#0B0F14",
    "fg": "#F2F5F7",
    "muted": "#8A98A6",
    "primary": "#4F7DFF",
    "success": "#12B981",
    "warning": "#F59E0B",
    "danger": "#EF4444",
    "card": "#121826"
  },
  "radius": { "xl": 16, "2xl": 24 },
  "shadow": { "sm": "0 1px 2px rgba(0,0,0,.2)", "md": "0 6px 24px rgba(0,0,0,.24)" },
  "font": { "head": "Inter, ui-sans-serif", "body": "Inter, ui-sans-serif" },
  "spacing": { "xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 24, "2xl": 32 }
}
```

**A11y**: contrastes ≥ 4.5:1; focus-visible; `aria-live` pour Health/erreurs; labels formulaires.

### 4) Responsive

* **Breakpoints**: sm 640, md 768, lg 1024, xl 1280.
* **Comportements**: SideNav compact < md; tables scroll-x; cards en grille auto-fit.

### 5) Pages/Vues & data-sources

| URL                       | Contenu                                              | Data sources                                                                         | Notes                                              |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `/`                       | Redirect → `/login` si non auth, sinon `/console`    | `GET /api/health`                                                                    | Perf budget LCP ≤ 2.5s                             |
| `/login`                  | Champ textarea `RBAC_TOKEN`, bouton **Se connecter** | —                                                                                    | Stocke token (localStorage) + redirect `/console`  |
| `/console`                | **3 KPI Cards** + **HealthChip** + **Threads(5)**    | `GET /api/metrics/kpis`, `GET /api/chat/threads`, `GET /api/health`                  | Health `aria-live`                                 |
| `/console/documents`      | Table 20/lignes, pagination, tri stable              | `GET /api/documents?page=1&page_size=20`                                             | Empty/error states                                 |
| `/console/prompt-builder` | Blocs éditables **local-only**; export/import JSON   | —                                                                                    | Badge `LOCAL • non persisté • v1`                  |
| `/console/observabilite`  | Graphe simple + filtres Lot/Sprint + **Runs RO**     | `GET /api/metrics/kpis`, `GET /api/metrics/runs?page=1&limit=20`                     | Mock **uniquement** DEMO/offline                   |

### 6) Composants détaillés (props clés)

* **NavBar**: `{ onLogout(), role:"viewer|operator|owner" }`
* **SideNav**: `{ current:string }` (liens: Console, Documents, Prompt Builder, Observabilité)
* **RoleBadge**: `{ role }` (codes couleur + aria-label)
* **KpiCard**: `{ label:string, value:number, unit?:string, help?:string }` (arrondi 1 déc.)
* **HealthChip**: `{ state:"ok|ko|unknown" }` (`aria-live="polite"`)
* **DataTable**: `{ rows:Item[], page:number, pageSize:number, total:number, onPageChange(n) }`
* **PromptBlock**: `{ blocks:Block[], onChange(blocks), onExport(), onImport(file) }`
* **OfflineBanner**: message figé (cf. acceptance A8)
* **DemoWatermark**: overlay semi-transparent `DEMO`

### 7) Interactions & flux

* **Auth**: coller `RBAC_TOKEN` → localStorage → redirect → `apiFetch` injecte `Authorization` + `X-Trace-Id`.
* **Offline**: si `/api/health` ≠ 200 → bannière + désactivation actions d’édition.
* **Documents**: requête initiale `?page=1&page_size=20`; tri stable (`created_at DESC, id ASC`) côté UI.
* **Prompt Builder**: **aucune écriture serveur**; export/import **deep‑equal** JSON.
* **Logs UI réseau**: enregistrer `{ts, method, url, status, dur_ms, trace_id}` dans `logs/ui_network.json` (évidence).

### 8) Scénarios/US (extraits)

1. **Viewer** ouvre `/console` → voit 3 KPI + HealthChip + 5 threads.
2. **Owner** ouvre Documents → 20 lignes max; pagination stable; tri stable.
3. **Operator** ouvre Prompt Builder → édite localement; exporte JSON; ré‑importe → **deep‑equal** OK.

### 9) Tests & validation

* **Perf**: `npx lighthouse http://$HOST/console --preset=desktop --output=json --output-path=reports/lh_console.json` (budgets: LCP≤2500, TTI≤2000, A11y≥90). Répliquer pour `/` et `/login`.
* **A11y**: `npx @axe-core/cli http://$HOST/console --exit 1 --save reports/axe_console.json`.
* **Réseau**: capturer `logs/ui_network.json` (XHR/Fetch routes clés + codes + durées + trace_id).

### 10) Tâches & priorités

* [P0] Pages & nav + wrapper `apiFetch` + RBAC badge.
* [P0] Console KPIs + Threads + HealthChip.
* [P0] Documents 20/l + tri stable + états.
* [P0] Prompt Builder local-only (export/import + badge).
* [P1] Observabilité (graphe + filtres Lot/Sprint + Runs RO).
* [P1] Offline banner + Demo watermark.
* [P1] A11y (focus, aria‑live), perf (images, fonts).

---

## 6) CI — Workflows (référence consolidée)

### Paramètres CI
- `RBAC_SMOKES_MODE`: `fail` (défaut). Mettre `warn` ponctuellement pour une démo publique.

### Scripts utilisés
- Runner matrice: `scripts/smokes_matrix_guard.mjs` (lit `arka-meta/reports/staging/rbac_matrix.json`, compare codes attendus/obtenus).
- Fallback minimal: `scripts/smoke_agents.sh` (GET/POST de base, log NDJSON).
- Guard réseau: étape “pick-host + net-guard” dans `rbac-smokes.yml` (skip propre si host down).

### Sécurité / secrets
- **Fail-fast** si `RBAC_TOKEN_VIEWER|EDITOR|ADMIN` **ou** `RBAC_TOKEN_VIEWER|OPERATOR|OWNER` absents (selon mapping de secrets).
- JWT HS256 claims (staging): `iss="arka"`, `aud="arka-squad"`, `iat`, `exp` (≥ 24h), `clock_skew_s ≤ 60`.

### Branch protection (GitHub)
- Require status checks: `network-gate`, `rbac-smokes`, `secret-scan`.
- Require branches to be up to date: **ON**.

### Gitleaks
- Config: `.github/.gitleaks.toml`; secret: `GITLEAKS_LICENSE`.
- En offline: `scripts/gitleaks_run.sh` → `SKIPPED(gitleaks_unreachable)` (la gate CI `secret-scan` reste active côté PR).

### Artefacts & rétention
- Artefacts: `logs/net_self_check.ndjson`, `arka-meta/reports/codex/rbac_qa_logs.ndjson`, `arka-meta/reports/codex/R2_5/sha256sums.txt`, `lighthouse_*.json`, `vercel_build_*.log`.
- Rétention: **7 jours**.
- `.gitignore`: `logs/**`, `*.ndjson`, `*.zip`.

### `.github/workflows/network-gate.yml`

```yaml
name: network-gate
on:
  workflow_dispatch:
  pull_request:
    paths: ['**/*']

concurrency:
  group: network-gate-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  gate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    env:
      HOST_PRIMARY: https://www.arka-team.app
      HOST_FALLBACK: https://arka-liard.vercel.app
      HTTP_PROXY: ""
      HTTPS_PROXY: ""
      ALL_PROXY: ""
      NO_PROXY: "localhost,127.0.0.1,.vercel.app,.vercel.dev,vercel.com,arka-team.app,www.arka-team.app,arka-liard.vercel.app"
    steps:
      - uses: actions/checkout@v4
      - name: net-dbg
        run: |
          echo "== proxy env =="; env | grep -iE 'http_proxy|https_proxy|all_proxy|no_proxy' || true
          echo "== resolv =="; cat /etc/resolv.conf || true
          echo "== DNS =="; getent hosts arka-team.app || true; getent hosts arka-liard.vercel.app || true
      - name: curl primary
        run: |
          set -euxo pipefail
          t0=$(date -Ins)
          code=$(curl -4sS -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 15 "$HOST_PRIMARY/api/health" || echo 000)
          echo "PRIMARY $t0 -> $code"
      - name: curl fallback
        run: |
          set -euxo pipefail
          t0=$(date -Ins)
          code=$(curl -4sS -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 15 "$HOST_FALLBACK/api/health" || echo 000)
          echo "FALLBACK $t0 -> $code"
```

### `.github/workflows/rbac-smokes.yml`

```yaml
name: rbac-smokes
on:
  workflow_dispatch:
  pull_request:
    paths: ['**/*']

concurrency:
  group: rbac-smokes-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  actions: read

jobs:
  smokes:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    env:
      HOST_PRIMARY: https://www.arka-team.app
      HOST_FALLBACK: https://arka-liard.vercel.app
      RBAC_SMOKES_MODE: fail
      HTTP_PROXY: ""
      HTTPS_PROXY: ""
      ALL_PROXY: ""
      NO_PROXY: "localhost,127.0.0.1,.vercel.app,.vercel.dev,vercel.com,arka-team.app,www.arka-team.app,arka-liard.vercel.app"
    steps:
      - uses: actions/checkout@v4

      - name: pick-host + net-guard
        id: guard
        shell: bash
        run: |
          set -euo pipefail
          mkdir -p logs
          p=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "$HOST_PRIMARY/api/health" || echo 000)
          if [ "$p" = "200" ]; then echo "HOST=$HOST_PRIMARY" >> $GITHUB_ENV; echo "STATE=online" >> $GITHUB_ENV; else echo "HOST=$HOST_FALLBACK" >> $GITHUB_ENV; f=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "$HOST_FALLBACK/api/health" || echo 000); if [ "$f" = "200" ]; then echo "STATE=online" >> $GITHUB_ENV; else echo "STATE=offline" >> $GITHUB_ENV; fi; fi
          echo "{\"ts\":\"$(date -Ins)\",\"primary\":\"$p\",\"host\":\"${HOST:-unset}\",\"state\":\"${STATE:-unset}\"}" | tee logs/net_self_check.ndjson

      - name: run matrix smokes (if present)
        if: ${{ hashFiles('scripts/smokes_matrix_guard.mjs') != '' && env.STATE == 'online' }}
        shell: bash
        env:
          RBAC_TOKEN_VIEWER: ${{ secrets.RBAC_TOKEN_VIEWER }}
          RBAC_TOKEN_OPERATOR: ${{ secrets.RBAC_TOKEN_OPERATOR }}
          RBAC_TOKEN_OWNER:  ${{ secrets.RBAC_TOKEN_OWNER }}
        run: |
          set -euo pipefail
          node --version
          mkdir -p logs
          node scripts/smokes_matrix_guard.mjs --host "$HOST" --mode "$RBAC_SMOKES_MODE" | tee -a logs/rbac_smokes.ndjson

      - name: run minimal smokes (fallback)
        if: ${{ hashFiles('scripts/smokes_matrix_guard.mjs') == '' && env.STATE == 'online' }}
        shell: bash
        env:
          RBAC_TOKEN_VIEWER: ${{ secrets.RBAC_TOKEN_VIEWER }}
          RBAC_TOKEN_OPERATOR: ${{ secrets.RBAC_TOKEN_OPERATOR }}
          RBAC_TOKEN_OWNER:  ${{ secrets.RBAC_TOKEN_OWNER }}
        run: |
          set -euo pipefail
          mkdir -p logs
          echo "Running smokes on $HOST"
          for role in viewer operator owner; do
            tok_var="RBAC_TOKEN_${role^^}"
            token="${!tok_var:-}"
            code=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 -H "Authorization: Bearer $token" "$HOST/api/agents" || echo 000)
            echo "{\"ts\":\"$(date -Ins)\",\"role\":\"$role\",\"route\":\"/api/agents\",\"code\":$code}" | tee -a logs/rbac_smokes.ndjson
          done

      - name: upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: rbac-smokes
          path: |
            logs/net_self_check.ndjson
            logs/rbac_smokes.ndjson
```

### `.github/workflows/secret-scan.yml` & `.github/.gitleaks.toml`

```yaml
name: secret-scan
on: { pull_request: { paths: ['**/*'] } }
concurrency: { group: secret-scan-${{ github.ref }}, cancel-in-progress: true }
permissions: { contents: read }
jobs:
  gitleaks:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Gitleaks scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
        with:
          args: >
            detect --redact --no-banner --exit-code 1 --config .github/.gitleaks.toml
```

```toml
title = "arka-labs gitleaks config"
[allowlist]
description = "Ignore faux positifs (sha256, fixtures RBAC, logs)"
paths = [
  "arka-meta/reports/codex/",
  "arka-meta/reports/staging/tokens_staging.json",
  "logs/"
]
regexes = [
  "<viewer-token>",
  "<operator-token>",
  "<owner-token>",
  "Bearer\\s+REDACTED"
]
```

---

## 7) Scripts — Matrix runner & fallback (durcis)

### `scripts/smokes_matrix_guard.mjs`

```js
#!/usr/bin/env node
import fs from 'node:fs/promises';
import process from 'node:process';

const args = Object.fromEntries(
  process.argv.slice(2)
    .map((a,i,arr)=>a.startsWith('--')?[a.slice(2),arr[i+1]]:[])
    .filter(Boolean)
);
const host = args.host;
const mode = (args.mode||'warn').toLowerCase();

const TOK = {
  viewer: process.env.RBAC_TOKEN_VIEWER || '',
  operator: process.env.RBAC_TOKEN_OPERATOR || '',
  owner:  process.env.RBAC_TOKEN_OWNER  || ''
};

const matrix = JSON.parse(await fs.readFile('arka-meta/reports/staging/rbac_matrix.json','utf8'));
const out = [];

function buildPath(name){
  // Supporte clés oracles en chemin complet ("/api/..." ou "/...?") ou segment ("metrics/kpis")
  if (name.startsWith('/')) return name;
  return `/api/${name}`;
}

async function call(method, path, role, body) {
  const res = await fetch(`${host}${path}`, {
    method, headers: { 'Authorization': `Bearer ${TOK[role]}`, 'Content-Type':'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.status;
}

function ok(expected, code){ return expected.includes(code); }

// oracles
for (const [key, cfg] of Object.entries(matrix.oracles)) {
  const path = buildPath(key);
  for (const [method, roles] of Object.entries(cfg)) {
    for (const [role, expected] of Object.entries(roles)) {
      const code = await call(method, path, role);
      out.push({ ts:new Date().toISOString(), role, route:path, code });
      if (!ok(expected, code) && mode==='fail') process.exitCode = 1;
    }
  }
}
// domain endpoints (method + path dans la clé)
const payload = await fs.readFile('arka-meta/reports/staging/payloads/agents.create.example.json','utf8').catch(()=>null);
const payloadJson = payload ? JSON.parse(payload) : undefined;
for (const [route, roles] of Object.entries(matrix.endpoints)) {
  const [method, rawPath] = route.split(' ');
  for (const [role, expected] of Object.entries(roles)) {
    const body = method==='POST' ? payloadJson : undefined;
    const code = await call(method, rawPath, role, body);
    out.push({ ts:new Date().toISOString(), role, route:rawPath, code });
    if (!ok(expected, code) && mode==='fail') process.exitCode = 1;
  }
}
await fs.mkdir('logs', { recursive:true });
await fs.writeFile('logs/rbac_smokes.ndjson', out.map(x=>JSON.stringify(x)).join('\n'));
console.log(out.map(x=>JSON.stringify(x)).join('\n'));
```

### `scripts/smoke_agents.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
HOST=${HOST:-https://www.arka-team.app}
mkdir -p logs
for role in viewer operator owner; do
  tok_var="RBAC_TOKEN_${role^^}"
  token="${!tok_var:-}"
  code=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 -H "Authorization: Bearer $token" "$HOST/api/agents" || echo 000)
  echo "{\"ts\":\"$(date -Ins)\",\"role\":\"$role\",\"route\":\"/api/agents\",\"code\":$code}" | tee -a logs/rbac_smokes.ndjson
done
```

---

## 8) Matrice RBAC (staging, étendue)

`arka-meta/reports/staging/rbac_matrix.json`

```json
{
  "oracles": {
    "health":        { "GET": { "viewer": [200], "operator": [200], "owner": [200] } },
    "metrics/kpis":  { "GET": { "viewer": [200], "operator": [200], "owner": [200] } },
    "/api/documents?page=1&page_size=20": { "GET": { "viewer": [200], "operator": [200], "owner": [200] } },
    "chat/threads":  { "GET": { "viewer": [200], "operator": [200], "owner": [200] } },
    "/api/metrics/runs?page=1&limit=20": { "GET": { "viewer": [200], "operator": [200], "owner": [200] } }
  },
  "endpoints": {
    "GET /api/agents":  { "viewer": [403], "operator": [200], "owner": [200] },
    "POST /api/agents": { "operator": [403], "owner": [200, 201] }
  }
}
```

**Payload POST** — `arka-meta/reports/staging/payloads/agents.create.example.json`

```json
{ "name": "smoke-agent" }
```

> **Note**: `GET /api/documents/:id/preview` n'est pas gelé ici faute d'`id` fixe. À couvrir via test manuel/fixture ou oracles dynamiques quand un `id` stable sera disponible.

---

## 9) Evidence Pack (à livrer avec la MR)

* `screenshots/{login.png,console_nav.png,documents.png,observabilite.png}`
* `logs/ui_network.json` (avec `trace_id`)
* `logs/rbac_smokes.ndjson` (artefact CI)
* `lighthouse_*.json`
* `vercel_build_*.log` (en cas d'échec build)
* `arka-meta/reports/codex/R2_5/sha256sums.txt`

---

## 10) MR Checklists (copier dans la PR)

### MR‑UI v0.1 — « POC utilisable »

* [ ] `/console/documents` → `?page=1&page_size=20` + tri stable (UI si besoin)
* [ ] Badge rôle global + logout clair; surfaces non autorisées masquées
* [ ] HealthChip reflète `/api/health` 200/KO (`aria-live`)
* [ ] Observabilité: filtres Lot/Sprint; **Runs RO**; mock **uniquement** DEMO|offline
* [ ] Prompt Builder: **LOCAL ONLY** + export/import JSON (round‑trip identique) + badge `LOCAL • non persisté • v1`
* [ ] Evidence pack UI (4 captures + `logs/ui_network.json`)

### MR‑MATRIX v0.1 — « Freeze RBAC »

* [ ] `rbac_matrix.json` conforme (oracles étendus + endpoints)
* [ ] `agents.create.example.json` = `{ "name": "smoke-agent" }`
* [ ] `rbac_notes.md` (assumptions JWT)
* [ ] `R2_5/sha256sums.txt` recalculé

### MR‑CI v0.1 — « Smokes déterministes »

* [ ] `network-gate.yml` + `rbac-smokes.yml` présents; artefacts publiés
* [ ] `scripts/smokes_matrix_guard.mjs` opérationnel; `scripts/smoke_agents.sh` fallback
* [ ] `RBAC_SMOKES_MODE=fail` (basculable en `warn` pour démo)

---

## 11) Alignement RBAC (compat mapping)

* **UI cible**: `viewer | operator | owner`
* **Compat tickets/CI**: `editor → operator`, `admin → owner`
* **Secrets CI**: prévoir `RBAC_TOKEN_OPERATOR`, `RBAC_TOKEN_OWNER` (alias possibles `RBAC_TOKEN_EDITOR`, `RBAC_TOKEN_ADMIN`)

---

## 12) Risques & mitigations

* **Réseau**: DNS/proxy runner → *Mitigation*: neutralisation proxy + fallback host + artefacts net‑self‑check.
* **Tokens expirés**: *Mitigation*: rotation régulière; jobs CI en `warn` seulement pour démos publiques.
* **Perf LCP/TTI**: *Mitigation*: police locale, lazy‑load, images optimisées; mesure Lighthouse.
* **A11y**: *Mitigation*: axe‑core en CI; revue focus/contrast.

---

## 13) Gate Go/No‑Go

```yaml
Design-Review: PASS
actions_required: []
ts: 2025-09-02T00:00:00Z
```

---

## 14) UX:KIT (outputs attendus)

Arborescence indicative pour figer les livrables UI consommables :

```
/docs/UX-KIT/
  usage.md
  props.json
/app/
  console/page.tsx
  console/documents/page.tsx
  console/prompt-builder/page.tsx
  console/observabilite/page.tsx
/components/
  NavBar.tsx
  SideNav.tsx
  RoleBadge.tsx
  KpiCard.tsx
  HealthChip.tsx
  DataTable.tsx
  PromptBlock.tsx
  OfflineBanner.tsx
  DemoWatermark.tsx
/design-system/
  tokens.json
```

---

## 15) Ce qu’il manque / À durcir — **résumé appliqué**

- **Domaine primaire**: HOST primaire = `https://www.arka-team.app` (fallback Vercel). **NO_PROXY** mis à jour.
- **Oracles “Contrats API”**: ajoutés `GET /api/chat/threads`, `GET /api/metrics/runs` (cURL + DoR + matrice). Préview document à couvrir via fixture ultérieure.
- **Evidence Pack élargi**: `lighthouse_*.json`, `vercel_build_*.log`, `trace_id` dans `ui_network.json`.
- **Propagation `X-Trace-Id`**: spécifiée et exigée en logs.
- **Bloc `ai_ready`**: ajouté au ticket (budgets Lighthouse + gates).
- **Matrice RBAC**: étendue aux oracles de lecture (docs/threads/runs).
- **Branch protection**: checks requis listés.
- **Gitleaks**: rappel conf + secret + comportement offline.
- **Incident build Vercel**: consigne d’archivage des logs build.
- **UX:KIT**: structure de sortie ajoutée.

