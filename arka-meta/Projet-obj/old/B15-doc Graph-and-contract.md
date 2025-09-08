# B15 — DocGraph & Contract Tests (US)

**Track:** Governance Builder Roadmap
**Depends on:** B13 (Chat Kernel v1), B14 (Gates/Recipes wiring)
**RBAC:** viewer (RO), operator (RW limited), owner (RW+admin)
**Branch target:** `feat/b15-docgraph-contract-tests`
**Principle:** small, composable bricks; no hardcoded text/urls; CI-guarded; scale-out ready.

---

## 1) Scope

* Introduce **DocGraph**: a **read-only knowledge map** linking Documents ⇄ Tasks ⇄ Agents (personae).
* Enable **Contract Tests** via chat commands and API for **read-only validation** of modules/processes (no auto-fix).
* Provide **first-class governance view** (what exists, who owns, what’s covered by tests) to de-risk next iterations (Builder advanced, Teams personas).

**Out of Scope (B15):**

* Graph editing (CRUD of nodes/edges) → planned B21.
* Auto-repair / auto-refactor from tests → planned B21+.
* Heavy LLM indexing (semantic doc graph) → planned B18/B21; B15 stays deterministic (declared links + light extraction).

---

## 2) Goals & Non-Goals

**Goals**

* Single-pane **Governance**: visualize doc/process coverage; expose owners and test status.
* **Contract Tests** executable from chat (`/test <module>`) and API; uniform PASS/WARN/FAIL with trace id.
* **Evidence-ready**: every test emits structured logs (NDJSON) and can be attached to Evidence packs later.

**Non-Goals**

* Not a full builder UI yet; no drag-edit.
* Not replacing CI suites; this is product-level contract checks (shape/links/required fields/owners/SLAs).

---

## 3) User Stories

1. **As Owner**, I open Governance → DocGraph; I search "onboarding"; I see linked docs, tasks, and the RH owner; I spot untested nodes (grey) and decide to add tests next sprint.
2. **As Operator**, I run `/test onboarding` in chat; I get a PASS with details and a trace id; I share the result card.
3. **As Viewer**, I hover a task node; I see status (OK/Á risque), last test, and the responsible persona.

---

## 4) Architecture Overview

* **Data**: Declarative registry in `content/docgraph/*.json` (nodes+edges); optional light extractors from markdown frontmatter.
* **Services**:

  * `GET /api/docgraph` → graph JSON (aggregated registry + cache).
  * `POST /api/contract-tests/run` → run named test suite(s), return verdicts + trace id.
* **Chat Kernel binding**: `/test <key>` in cockpit routes to the API, streams logs to SSE; final summary card posted to feed.
* **Observability**: NDJSON logs `chat_gateway` + per-test `contract_test` channel with `{trace_id, module, verdict, checks[]}`.

---

## 5) Data Contracts

### 5.1 DocGraph Schema (JSON)

```json
{
  "id": "dg.onboarding.rh",
  "title": "Onboarding RH",
  "version": "0.1.0",
  "nodes": [
    { "id": "doc.proc.onboarding", "type": "doc", "title": "Procédure Onboarding", "owner": "RH", "path": "docs/rh/onboarding.md" },
    { "id": "task.kit.onboarding", "type": "task", "title": "Préparer kit", "owner": "RH" },
    { "id": "persona.rh", "type": "persona", "title": "Conseiller RH", "owner": "RH" }
  ],
  "edges": [
    { "from": "doc.proc.onboarding", "to": "task.kit.onboarding", "kind": "informs" },
    { "from": "task.kit.onboarding", "to": "persona.rh", "kind": "owned_by" }
  ],
  "tags": ["RH","Onboarding"],
  "updated_at": "2025-09-08T10:00:00Z"
}
```

**Global index** `content/docgraph/_index.json` aggregates all graphs (IDs, titles, tags, file refs).

### 5.2 Contract Test Manifest

`content/tests/contract/<module>.json`

```json
{
  "id": "ct.onboarding",
  "title": "Contract Test — Onboarding",
  "checks": [
    { "id": "doc_exists", "kind": "file.exists", "args": {"path": "docs/rh/onboarding.md"} },
    { "id": "doc_frontmatter_owner", "kind": "md.frontmatter.contains", "args": {"key": "owner", "value": "RH"} },
    { "id": "graph_binding", "kind": "docgraph.includes", "args": {"node": "doc.proc.onboarding"} },
    { "id": "task_has_owner", "kind": "graph.node.prop", "args": {"id": "task.kit.onboarding", "prop": "owner", "expect": "RH"} }
  ],
  "severity_map": {"doc_exists": "fail", "doc_frontmatter_owner": "warn", "graph_binding": "fail", "task_has_owner": "fail"}
}
```

**Verdict**: PASS if no fail; WARN if any warn and no fail; FAIL otherwise. Each check returns `{ok:boolean, evidence?, message?}`.

---

## 6) API Spec

### 6.1 `GET /api/docgraph`

* **Query**: `q?` (filter by text / tag), `ids?` (array), `compact?=1` (omit titles to reduce size).
* **200** `{ graphs:[{id,title,tags,updated_at}], nodes:[...], edges:[...] }`
* **Notes**: Server composes index + graphs; caches in-memory with ETag.

### 6.2 `POST /api/contract-tests/run`

* **Body**: `{ modules: string[]; stream?: boolean }`
* **200**: `{ trace_id, results: Array<{ module, verdict, checks: Array<{id, ok, severity, message?, evidence?}> }> }`
* **Errors**: 400 invalid module; 422 bad manifest; 500 runtime.
* **SSE** (if `stream=true`): events `{t:'open'|'log'|'check'|'done'|'error'}`.

---

## 7) Chat Integration

* Command: `/test <module>` → uses Chat Kernel router to call `POST /api/contract-tests/run?stream=1`.
* UI Dock: shows running status + TTFT; on completion, posts a **Result Card** with summary + copyable `trace_id`.
* Errors (401/429/5xx) mapped to toasts (already covered by B13 Dock patterns).

---

## 8) UI Spec

### 8.1 Governance → DocGraph (read-only)

* Search bar + tag filters.
* Graph: zoom/pan, highlight nodes by type (doc/task/persona); legend + badges (owner, last test).
* Side panel (right): details of selected node (title, owner, links, last verdict).
* Empty states: helpful prompts (no hard text in JSX; use content registry).

### 8.2 Test Result Card (Chat)

* Header: `Contract Test — <module>` + pill `PASS|WARN|FAIL`.
* Body: list of checks (icon + label + message).
* Footer: `trace_id`, timestamp, copy buttons.

---

## 9) Content Registry & Assets

* All labels under `content/site/governance.json` and `content/site/tests.json` (i18n-ready).
* Images/icons resolved via `getIcon()/getImage()` (no hardlinks).
* Graph sample seeds in `content/docgraph/` (2–3 examples: Onboarding RH, Proc ISO, Campagne Market).

---

## 10) Security & RBAC

* `GET /api/docgraph`: viewer+ (RO).
* `POST /api/contract-tests/run`: operator+ (deny viewer).
* JWT required; PREFILL dev bypass forbidden in prod (guard in CI).

---

## 11) Performance

* In-memory cache for graphs; ETag/If-None-Match.
* Graph payload compact mode; lazy hydrate side panel.
* SSE chunked writes; backpressure-safe.

---

## 12) Logs & Evidence

* Channel `contract_test.ndjson`: `{ts, trace_id, module, check_id, ok, severity, message, evidence?}`
* Chat gateway logs include `trace_id` correlation.
* Ready to bundle into Evidence export (B19).

---

## 13) CI Gates

* **Schema check** for docgraph and test manifests (JSON Schema/Zod).
* **No-hardlinks** ESLint for assets.
* **Determinism**: tests must be pure (no network) unless marked `kind:"http"` with recorded fixture.

---

## 14) Acceptance Criteria (Given/When/Then)

1. **DocGraph loads**
   Given graphs in `content/docgraph`, When GET `/api/docgraph`, Then response contains nodes/edges and 200 with ETag.
2. **Test passes**
   Given `ct.onboarding` checks green, When `/test onboarding`, Then card shows PASS and logs contain `trace_id`.
3. **Warn then Fail**
   Given a missing frontmatter owner, When run, Then verdict WARN; if missing doc, Then FAIL.
4. **RBAC enforced**
   Given a viewer, When POST `/api/contract-tests/run`, Then 403.

---

## 15) Pseudo-PR (skeleton)

```
Pseudo-PR:
  branch: "feat/b15-docgraph-contract-tests"
  changes:
    - file: content/docgraph/_index.json
      after: |
        { "graphs": [ {"id":"dg.onboarding.rh","title":"Onboarding RH","tags":["RH","Onboarding"],"file":"content/docgraph/dg.onboarding.rh.json"} ] }
    - file: content/docgraph/dg.onboarding.rh.json
      after: |
        { "id":"dg.onboarding.rh", "title":"Onboarding RH", "version":"0.1.0", "nodes":[...], "edges":[...], "tags":["RH","Onboarding"], "updated_at":"2025-09-08T10:00:00Z" }
    - file: content/tests/contract/ct.onboarding.json
      after: |
        { "id":"ct.onboarding", "title":"Contract Test — Onboarding", "checks":[...], "severity_map":{...} }
    - file: app/api/docgraph/route.ts
      after: |
        // GET: aggregate index + graphs; cache; filter by q/tags; RBAC viewer+
    - file: app/api/contract-tests/run/route.ts
      after: |
        // POST: validate modules; run checks; stream SSE logs; summarize verdicts; RBAC operator+
    - file: components/governance/DocGraph.tsx
      after: |
        // Read-only graph component with zoom/pan; side panel; search & tags
    - file: lib/tests/contract/engine.ts
      after: |
        // Deterministic runners for kinds: file.exists, md.frontmatter.contains, docgraph.includes, graph.node.prop
    - file: content/site/governance.json
      after: |
        { "labels": { "graph": "DocGraph", "search_placeholder": "Rechercher…" } }
  tests: [
    "GET /api/docgraph returns graphs",
    "POST /api/contract-tests/run returns PASS with trace_id",
    "RBAC viewer forbidden on POST run",
    "Engine resolves md.frontmatter and graph props"
  ]
  rollback: "git revert <sha>"
  notes: "No network in default checks; fixtures for http kinds; ensure PREFILL bypass blocked in prod."
```

---

## 16) Tasks (short & precise)

* [ ] Seed 2–3 docgraphs (RH Onboarding, ISO Proc, Market Campaign).
* [ ] Implement `/api/docgraph` (cache + filters + ETag).
* [ ] Contract test engine with 4 kinds + schema validation.
* [ ] `/api/contract-tests/run` with SSE + summary.
* [ ] Chat command `/test <module>` → result card (reuse Dock toasts).
* [ ] DocGraph component (read-only) + side panel + search/tags.
* [ ] CI gates (schemas, determinism, lint no-hardlinks).
* [ ] Evidence logs channel + trace correlation.

---

## 17) Risks & Mitigations

* **Staleness** (graph desync) → cache bust on file mtime; ETag; reload banner.
* **Flaky tests** → deterministic runners; fixtures for network; time-bound checks.
* **UX overload** → progressive disclosure; side panel collapsible; keyboard nav.

---

## 18) Next (handoff to B16)

* Feed Roster Lite with owners from DocGraph (role clarity).
* Suggest missing owners as quick-assign entries.
* Extend contract checks to validate roster coverage.
