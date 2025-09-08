**B15 — DocDesk v0 (écran de gestion des fichiers)** au format **spec-integration Codex-ready**, strict et exécutable (zéro interprétation). Aligné **Console v12** (DocDesk/Rooms/Graph/Board/Timeline) et nos règles Codex (branché-ou-rien, RBAC, logs JSON, evidence pack texte-only).

---

# B15 · DocDesk v0 — **Écran “Gestion des fichiers”** (Codex-ready)

## 0) Definition-of-Ready (DoR)

```yaml
definition_of_ready:
  contexte: "Cas pratique RH — préparer une journée de coworking : lister/filtrer les docs, voir propriétaire & statut de test, déclencher /test, exporter des preuves."
  objectif: "Livrer une page /console/documents branchée (RO) avec DocCards, filtres, sidebar détail, déclencheur /test et export v0."
  portee: "IN: GET /api/documents, GET /api/documents/:id, POST /api/tests/run (bind chat), GET /api/evidence/export; OUT: CRUD doc, upload, editor, Graph/Board avancés."
  contrats:
    api:
      routes:
        - { method: GET,  path: /api/documents,             codes: [200,400,401,403,500] }
        - { method: GET,  path: /api/documents/:id,         codes: [200,401,403,404,500] }
        - { method: POST, path: /api/tests/run,             codes: [200,400,401,403,404,422,500] }
        - { method: GET,  path: /api/evidence/export,       codes: [200,401,403,500] }
      rules: [response_shape_must_match, error_codes_strict]
      headers_required: ["Authorization: Bearer <jwt>", "X-Trace-Id: <uuid>"]
      pagination: { page_param: "page", page_size_param: "limit", defaults: { page: 1, limit: 20 }, max_page_size: 50 }
    ui:
      pages: ["/console/documents"]
      actions_api_map:
        - { action: "RunContractTest", calls: ["POST /api/tests/run"] }
        - { action: "ExportEvidence",   calls: ["GET /api/evidence/export"] }
  securite:
    rbac:
      viewer: ["GET /api/documents", "GET /api/documents/:id"]
      operator: ["POST /api/tests/run"]
      owner: ["GET /api/evidence/export"]
    logs_trace_id: true
  budgets:
    lcp_ms_p75: 2500
    tti_console_ms_p75: 2000
    api_latency_ms_p95: 500
    a11y_level: "AA"
  tests_plan:
    - "Given seeds, When GET /api/documents, Then 200 + items[] shape ok"
    - "Given operator, When POST /api/tests/run, Then 200 + verdict ∈ {PASS,WARN,FAIL}"
    - "Given viewer, When POST /api/tests/run, Then 403"
    - "Given owner,  When GET /api/evidence/export, Then 200 (zip)"
  oracles:
    curl_examples:
      - name: documents_list
        cmd: curl -sH "Authorization: Bearer $JWT" -H "X-Trace-Id: $XID" "$HOST/api/documents?page=1&limit=20&q=&tags=&status="
        expect_json_shape: { items: [], page: "int", limit: "int", total: "int" }
      - name: document_show
        cmd: curl -sH "Authorization: Bearer $JWT" -H "X-Trace-Id: $XID" "$HOST/api/documents/doc.coworking.proc"
        expect_json_keys: ["id","title","owner","state","status","tags","updated_at","path"]
      - name: run_test
        cmd: curl -sH "Authorization: Bearer $JWT" -H "X-Trace-Id: $XID" -X POST "$HOST/api/tests/run" -d '{"docId":"doc.coworking.proc"}'
        expect_json_shape: { trace_id: "string", verdict: "string", checks: [] }
      - name: export_pack
        cmd: curl -sH "Authorization: Bearer $JWT_OWN" -H "X-Trace-Id: $XID" "$HOST/api/evidence/export?scope=coworking" -o /tmp/pack.zip -w "%{http_code}\n"
        expect_http: 200
    no_mocks: true
  evidences_attendues:
    - "screenshots/{documents_list.png,documents_sidebar.png,chat_card_test.png}"
    - "logs/ui_network.json"
    - "reports/metrics/kpis.json"
    - "exports/coworking_proofs.zip"
  gate_DoR: true
```

\*(DoR conforme à la **Norme commune Codex-ready** + checklists E2E)

---

## 1) Parcours E2E (lecture humaine)

**Affichage** `/console/documents` *(states: loading → ready | empty | error)* → **Filtrer/chercher** → **Sélectionner un doc** (ouvre **Sidebar** de détail) → **/test** (depuis Chat via intent ou bouton qui route vers Chat) → **Voir badge de statut** mis à jour sur la DocCard → **Exporter** (owner) un pack de preuves.
DocDesk = pivot **vues RO** du patrimoine documentaire, conforme **Console v12** (DocCards, Preview, Evidence).

---

## 2) RBAC & visibilité

* **viewer** : liste/voir (RO), pas d’actions.
* **operator** : + lancer **/test**.
* **owner** : + **export**.
  UI masque les CTA non autorisés, et 401/403 sont gérés en page (bannière + a11y). *(Règles Codex : RBAC visible + smokes CI)*

---

## 3) Contrats API (schémas stricts)

### 3.1 `GET /api/documents` → 200

```json
{
  "items": [
    { "id":"doc.coworking.proc","type":"procedure","title":"Procédure Journée Coworking","state":"Approved","owner":"RH","status":"pass","tags":["RH","Coworking"],"updated_at":"2025-09-08T10:00:00Z" }
  ],
  "page": 1,
  "limit": 20,
  "total": 5
}
```

* **Query**: `page, limit, q, tags, status` (status ∈ `pass|warn|fail|untested`).
* **Errors** 4xx/5xx shape unique: `{"error":"<code>","message":"<human>","trace_id":"..."}`.
  \*(Console v12 — Documents + pagination; Contrats stricts)

### 3.2 `GET /api/documents/:id` → 200

```json
{
  "id":"doc.coworking.proc",
  "type":"procedure",
  "title":"Procédure Journée Coworking",
  "owner":"RH",
  "state":"Approved",
  "status":"pass",
  "tags":["RH","Coworking"],
  "updated_at":"2025-09-08T10:00:00Z",
  "path":"docs/rh/coworking_procedure.md",
  "last_tests":[{"at":"2025-09-08T11:00:00Z","verdict":"PASS","trace_id":"uuid"}]
}
```

### 3.3 `POST /api/tests/run` (operator+) → 200

```json
{ "trace_id":"uuid","verdict":"PASS","checks":[{"id":"doc_exists","ok":true,"severity":"fail"}] }
```

* **Req**: `{"docId":"doc.coworking.proc"}` ; **verdict** ∈ `PASS|WARN|FAIL`.
* Lié aux **intents Chat** et TTFT/Trace du **Dock B13** (affichage carte résultat).

### 3.4 `GET /api/evidence/export?scope=coworking` (owner) → 200 (zip)

Contenu minimal attendu : `docs.jsonl, tests.json, agents.json, roadmap.json, kpis.json, sha256sums.txt`. \*(Evidence pack texte-only)

---

## 4) UI — spécification des **fonctionnalités & infos affichées**

### 4.1 En-tête de page

* **Titre** “Documents”, **compteur** total (`N`), **bouton Exporter** (owner only).
* **Barre de recherche** (q) + **Filtres**: Tags (chips), **Statut** (Pass/Warn/Fail/Untested).

### 4.2 **Liste paginée** (20 / page)

Chaque **DocCard** affiche, en un coup d’œil :

* **Icône type** (procédure/contrat/checklist), **Titre** (cliquable), **Owner** (badge).
* **Statut de test** (pastille 🟢/🟠/🔴/⚪) = `status`.
* **État documentaire** (`state`: Draft/Review/Gated/Approved/Released/Deprecated).
* **Mise à jour** (date lisible) + **Tags**.
* **Actions rapides** :

  * **/test** (bouton → route l’intent vers Chat et ouvre la carte résultat),
  * **Assigner** (vignette future, non active en B15 si hors scope),
  * **Preview** (ouvre `…/preview` si dispo).

**États de liste** :

* `loading` (skeleton 6–8 cartes), `empty` (message éducatif : “Aucun document — filtre trop strict ?”), `error` (bannière + `trace_id`).

### 4.3 **Sidebar (détail doc sélectionné)**

* **Header** : icône, **Titre**, **Owner**, **State**, **Status** (pastille), **Dernière revue**.
* **Méta** : `path`, `tags[]`, `updated_at`.
* **Historique de tests (3 derniers)** : date, verdict, **trace\_id** (copiable).
* **CTA** : **Lancer /test** (si operator), sinon grisé.
* **Liens** : “Ouvrir dans DocGraph” (placeholder pour B21+), “Voir Evidence” (ouvre pack si déjà exporté).
  \*(DocCard/Preview/Actions conformes DocDesk)

### 4.4 **Accessibilité & Performance**

* Navigation clavier complète (focus rings, `aria-live` pour bannières).
* Budgets : **LCP ≤ 2.5 s**, **TTI ≤ 2 s** (page), pagination serveur. \*(Budgets Codex)

---

## 5) Observabilité

* Toutes requêtes **UI→API** portent `X-Trace-Id` ; **logs NDJSON** capturés (`logs/ui_network.json`).
* Bouton **Copier trace** sur la carte résultat du Chat (TTFT/Trace Dock B13).

---

## 6) Seeds (B15)

* **Docs** (min 5) : `coworking_procedure.md`, `convocation_modele.md`, `checklist_materiel.md`, `budget_journee.md`, `raci_coworking.md` *(frontmatter: owner,tags)*.
* **Tests** : `ct.coworking.json` (4 checks → PASS), `ct.convocation.json` (1 WARN), `ct.budget.json` (1 FAIL).
  \*(DocDesk — types, états, actions)

---

## 7) CI Gates (fail-fast)

* **rbac-smokes** : matrice viewer/operator/owner sur 4 routes ci-dessus (statuts attendus).
* **shape-linter** : schémas `GET /api/documents` et `GET /api/documents/:id`.
* **anti-mocks/anti-skip** : interdit sur endpoints branchés & tests.
* **binary-detector** : aucun binaire en PR (evidence zip généré runtime).

---

## 8) Tests (exécutables)

### 8.1 Unit/Contract

* **documents\_contract.test.ts** : shape exact + tri stable (`updated_at DESC, id ASC`), pagination 20. (référence style console)
* **document\_show\.test.ts** : présence `last_tests[].trace_id`.

### 8.2 E2E (Given/When/Then)

1. **Liste**
   *Given* 5 docs seedés, *When* GET `/api/documents?page=1&limit=20`, *Then* 200 + `items.length=5` + badges **Owner/Status** visibles.
2. **Filtre**
   *Given* filtre `status=fail`, *When* rafraîchir, *Then* seules cartes 🔴 affichées.
3. **Test**
   *Given* operator JWT, *When* POST `/api/tests/run {docId:"doc.coworking.proc"}`, *Then* verdict `PASS` + carte Chat avec **trace\_id**.
4. **Export**
   *Given* owner, *When* `GET /api/evidence/export?scope=coworking`, *Then* zip contient `docs.jsonl` & `tests.json`.
   \*(E2E conforme norme de cadrage)

---

## 9) Done (DoD B15 · DocDesk v0)

* Page **/console/documents** **branchée** aux API (pas de Storybook-only).
* **RBAC** appliqué & visible (CTA masqués).
* **Logs NDJSON** + **evidence pack** livrés.
* **Oracles cURL** verts.

---
