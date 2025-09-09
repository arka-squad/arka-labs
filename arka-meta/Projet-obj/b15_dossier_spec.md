# B15 · DocDesk v0 — **Espace Dossier** (Codex-ready, refonte)

## 0) Definition-of-Ready (DoR)

```yaml
definition_of_ready:
  contexte: "Cas pratique RH — gérer le dossier 'Journée Coworking Q4' avec vision, contexte, agents, documents et roadmap dans un cockpit unifié."
  objectif: "Livrer une page /console/folders/:id branchée avec Vision (objectifs/livrables/contraintes), Contexte guidé, Agents assignés, Documents liés, Roadmap simple et KPIs dossier."
  portee: "IN: GET /api/folders/:id, GET /api/folders/:id/documents, POST /api/folders/:id/assign, POST /api/folders/:id/context, GET /api/folders/:id/roadmap; OUT: CRUD dossier complet, upload docs, Graph/Board avancés."
  contrats:
    api:
      routes:
        - { method: GET,  path: /api/folders/:id,             codes: [200,401,403,404,500] }
        - { method: GET,  path: /api/folders/:id/documents,   codes: [200,400,401,403,500] }
        - { method: POST, path: /api/folders/:id/assign,      codes: [200,400,401,403,422,500] }
        - { method: POST, path: /api/folders/:id/context,     codes: [200,400,401,403,422,500] }
        - { method: GET,  path: /api/folders/:id/roadmap,     codes: [200,401,403,404,500] }
        - { method: POST, path: /api/tests/run,               codes: [200,400,401,403,404,422,500] }
        - { method: GET,  path: /api/evidence/export,         codes: [200,401,403,500] }
      rules: [response_shape_must_match, error_codes_strict]
      headers_required: ["Authorization: Bearer <jwt>", "X-Trace-Id: <uuid>"]
      pagination: { page_param: "page", page_size_param: "limit", defaults: { page: 1, limit: 20 }, max_page_size: 50 }
    ui:
      pages: ["/console/folders/:id"]
      actions_api_map:
        - { action: "AssignAgent",       calls: ["POST /api/folders/:id/assign"] }
        - { action: "AddContext",        calls: ["POST /api/folders/:id/context"] }
        - { action: "RunContractTest",   calls: ["POST /api/tests/run"] }
        - { action: "ExportEvidence",    calls: ["GET /api/evidence/export"] }
  securite:
    rbac:
      viewer: ["GET /api/folders/:id", "GET /api/folders/:id/documents", "GET /api/folders/:id/roadmap"]
      operator: ["POST /api/folders/:id/context", "POST /api/folders/:id/assign", "POST /api/tests/run"]
      owner: ["GET /api/evidence/export"]
    logs_trace_id: true
  budgets:
    lcp_ms_p75: 2500
    tti_console_ms_p75: 2000
    api_latency_ms_p95: 500
    a11y_level: "AA"
  tests_plan:
    - "Given folder seeds, When GET /api/folders/coworking-q4, Then 200 + vision/context/agents shape ok"
    - "Given operator, When POST /api/folders/:id/assign, Then 200 + agent assigné visible"
    - "Given viewer, When POST /api/folders/:id/assign, Then 403"
    - "Given owner,  When GET /api/evidence/export?folder=coworking-q4, Then 200 (zip)"
  oracles:
    curl_examples:
      - name: folder_show
        cmd: curl -sH "Authorization: Bearer $JWT" -H "X-Trace-Id: $XID" "$HOST/api/folders/coworking-q4"
        expect_json_keys: ["id","title","vision","context","agents","status","updated_at"]
      - name: folder_documents
        cmd: curl -sH "Authorization: Bearer $JWT" -H "X-Trace-Id: $XID" "$HOST/api/folders/coworking-q4/documents"
        expect_json_shape: { items: [], page: "int", limit: "int", total: "int" }
      - name: assign_agent
        cmd: curl -sH "Authorization: Bearer $JWT" -H "X-Trace-Id: $XID" -X POST "$HOST/api/folders/coworking-q4/assign" -d '{"agentId":"heloise-rh","role":"A","docIds":["doc.coworking.proc"]}'
        expect_json_shape: { folder_id: "string", agent_id: "string", role: "string", assigned_docs: [] }
      - name: add_context
        cmd: curl -sH "Authorization: Bearer $JWT" -H "X-Trace-Id: $XID" -X POST "$HOST/api/folders/coworking-q4/context" -d '{"type":"note","content":"Attention sécurité incendie"}'
        expect_json_shape: { folder_id: "string", context_id: "string", type: "string", content: "string" }
      - name: export_folder
        cmd: curl -sH "Authorization: Bearer $JWT_OWN" -H "X-Trace-Id: $XID" "$HOST/api/evidence/export?folder=coworking-q4" -o /tmp/folder_pack.zip -w "%{http_code}\n"
        expect_http: 200
    no_mocks: true
  evidences_attendues:
    - "screenshots/{folder_cockpit.png,agents_sidebar.png,roadmap_timeline.png}"
    - "logs/ui_network.json"
    - "reports/metrics/folder_kpis.json"
    - "exports/coworking_q4_pack.zip"
  gate_DoR: true
```

---

## 1) Parcours E2E (lecture humaine)

**Ouverture** `/console/folders/coworking-q4` *(states: loading → ready | empty | error)* → **Vision toujours visible** (objectif/livrable/contraintes/succès) → **Contexte guidé** (agent pose questions, utilisateur ajoute notes) → **Assignation agents** (drag&drop, RACI) → **Documents liés** (test/statut) → **Roadmap** (jalons/statuts) → **KPIs** (% avancement) → **Export** (dossier de preuves complet).

**Cockpit = hub central** du dossier, conforme **DocDesk Console v12** avec navigation fluide entre toutes les facettes du projet.

---

## 2) RBAC & visibilité

* **viewer** : voir dossier/docs/roadmap (RO), pas d'actions.
* **operator** : + ajouter contexte, assigner agents, lancer tests.
* **owner** : + export dossier complet.
  UI masque les CTA non autorisés, et 401/403 sont gérés en page (bannière + a11y).

---

## 3) Contrats API (schémas stricts)

### 3.1 `GET /api/folders/:id` → 200

```json
{
  "id": "coworking-q4",
  "title": "Journée Coworking Q4",
  "status": "active",
  "vision": {
    "objectif": "Organiser la journée coworking RH et produire un plan de formation Q4 validé",
    "livrable": "Synthèse écrite, planning clair, décisions validées",
    "contraintes": ["Budget ≤ 1k€", "Salle confirmée J-7", "Documents Q3 disponibles"],
    "succes": ["3 décisions actées", "Planning assigné", "Feedback collecté"]
  },
  "context": {
    "guided_notes": [
      {"id": "ctx1", "type": "agent_question", "content": "Quel est le nombre de participants attendu?", "agent": "heloise-rh"},
      {"id": "ctx2", "type": "user_note", "content": "Attention sécurité incendie - sortie de secours côté est"}
    ],
    "completion": 75
  },
  "agents": [
    {"id": "heloise-rh", "name": "Héloïse RH", "role": "A", "load": 65, "status": "active"},
    {"id": "agp-gate", "name": "AGP Gate", "role": "R", "load": 20, "status": "available"}
  ],
  "stats": {
    "docs_total": 5,
    "docs_tested": 3,
    "agents_assigned": 2,
    "roadmap_progress": 60
  },
  "updated_at": "2025-09-08T10:00:00Z"
}
```

### 3.2 `GET /api/folders/:id/documents` → 200

```json
{
  "items": [
    {
      "id": "doc.coworking.proc",
      "title": "Procédure Journée Coworking",
      "type": "procedure",
      "owner": "RH",
      "status": "pass",
      "assigned_to": "heloise-rh",
      "raci_role": "A",
      "updated_at": "2025-09-08T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 5
}
```

### 3.3 `POST /api/folders/:id/assign` (operator+) → 200

```json
{
  "folder_id": "coworking-q4",
  "agent_id": "heloise-rh",
  "role": "A",
  "assigned_docs": ["doc.coworking.proc", "doc.checklist.materiel"],
  "assigned_at": "2025-09-08T11:00:00Z"
}
```

* **Req**: `{"agentId": "heloise-rh", "role": "A|R|C|I", "docIds": ["doc.coworking.proc"]}`

### 3.4 `POST /api/folders/:id/context` (operator+) → 200

```json
{
  "folder_id": "coworking-q4",
  "context_id": "ctx3",
  "type": "user_note",
  "content": "Pas disponible le vendredi",
  "created_at": "2025-09-08T11:30:00Z"
}
```

* **Req**: `{"type": "note|constraint|objective", "content": "..."}`

### 3.5 `GET /api/folders/:id/roadmap` → 200

```json
{
  "folder_id": "coworking-q4",
  "milestones": [
    {"id": "m1", "title": "Salle réservée", "date": "2025-09-15", "status": "done"},
    {"id": "m2", "title": "Atelier coworking", "date": "2025-09-22", "status": "pending"},
    {"id": "m3", "title": "Synthèse livrée", "date": "2025-09-23", "status": "pending"}
  ],
  "progress": 33,
  "critical_path": ["m1", "m2", "m3"]
}
```

---

## 4) UI — spécification des **fonctionnalités & infos affichées**

### 4.1 **Vision Globale** (header fixe, toujours visible)

* **Titre dossier** + **statut** (active/archived/blocked).
* **4 sections compactes** :
  * **Objectif** (1 ligne claire) : *"Organiser coworking + plan formation Q4"*
  * **Livrable** (résultat attendu) : *"Synthèse écrite, planning validé"*
  * **Contraintes** (max 3 chips) : *"≤1k€", "J-7", "Q3 dispo"*
  * **Succès** (critères mesurables) : *"3 décisions", "Planning assigné", "Feedback ok"*

### 4.2 **Espace Contexte** (zone centrale gauche)

* **Messages guidés de l'agent** (ex. Héloïse RH) :
  * *"Combien de participants attendus ?"*
  * *"Des contraintes spécifiques d'accessibilité ?"*
* **Zone ajout utilisateur** :
  * Bouton **"Ajouter une note"** → modal simple (type: note/contrainte/objectif).
  * Notes existantes en chips modifiables.
* **Barre de progression contexte** : *"Contexte 75% complet"*

### 4.3 **Sidebar Agents & Missions** (droite)

* **Liste agents assignés** :
  * Avatar + nom + rôle RACI + charge (▮▮▯ 65%) + statut (●).
  * **Actions** : Réassigner, Déléguer, Ping.
* **Zone assignation** :
  * **Drag & Drop** : glisser agent → document (définit RACI automatiquement).
  * **Assignments actuelles** : badge sur docs + couleur par agent.

### 4.4 **Documents & Tâches** (zone centrale bas)

* **Liste documents liés au dossier** :
  * DocCard classique : titre, type, owner, **statut test** (🟢🟠🔴), **agent assigné** (badge).
  * **Actions rapides** : Test, Réassigner, Contexte.
* **Filtres** : Par agent assigné, par statut, par type.

### 4.5 **Roadmap & Suivi** (onglet/section)

* **Timeline horizontale** simple :
  * Jalons avec dates, statuts (done/pending/blocked), interdépendances.
  * **Bouton Geler** (validation) sur jalons critiques.
* **Vue d'ensemble** : % avancement, chemin critique, prochaine échéance.

### 4.6 **KPIs Dashboard** (widget compact)

* **4 métriques clés** :
  * **% docs testés** : 3/5 (60%)
  * **Assignations** : 2 agents actifs
  * **Roadmap** : 33% avancé
  * **Contexte** : 75% complet

### 4.7 **Actions principales** (toolbar)

* **Exporter dossier** (owner) : zip avec docs, décisions, assignations, roadmap.
* **Archiver** (owner) : transformer en starter kit réutilisable.
* **Partager** (operator) : lien readonly pour stakeholders.

---

## 5) Observabilité

* **Trace-ID** sur toutes les actions (assignation, ajout contexte, tests).
* **Logs NDJSON** : `logs/folder_activity.json` (qui fait quoi quand).
* **Activity feed** : historique des actions dans le sidebar (optionnel).

---

## 6) Seeds (B15)

### 6.1 **Dossier principal**

```yaml
folder:
  id: "coworking-q4"
  title: "Journée Coworking Q4"
  vision:
    objectif: "Organiser journée coworking RH + plan formation Q4"
    livrable: "Synthèse écrite, planning validé, décisions actées"
    contraintes: ["Budget ≤ 1k€", "Salle J-7", "Docs Q3 disponibles"]
    succes: ["3 décisions actées", "Planning assigné", "Feedback collecté"]
```

### 6.2 **Agents disponibles**

* **Héloïse RH** (PMO RH) : charge 65%, experte coworking, disponible 3j/sem.
* **AGP Gate** (validation) : charge 20%, tests de conformité.
* **Analyste/Redac** : rédaction synthèses, charge 40%.

### 6.3 **Documents liés** (5 minimum)

* `coworking_procedure.md` (assigné: Héloïse, RACI: A, status: pass)
* `checklist_materiel.md` (assigné: Héloïse, RACI: A, status: warn)
* `budget_previsionnel.md` (non assigné, status: untested)
* `convocation_modele.md` (assigné: Analyste, RACI: R, status: pass)
* `synthese_q3.md` (assigné: Analyste, RACI: C, status: fail)

### 6.4 **Roadmap** (3 jalons)

* **J-15** : Contexte complet (status: done)
* **J-7** : Salle réservée + matériel confirmé (status: pending)
* **J0** : Journée coworking (status: pending)
* **J+1** : Synthèse livrée (status: pending)

---

## 7) CI Gates (fail-fast)

* **rbac-smokes** : matrice viewer/operator/owner sur 7 routes (statuts attendus).
* **shape-linter** : schémas `GET /api/folders/:id` et sous-ressources.
* **assignment-logic** : RACI cohérent (1 seul A par doc, R obligatoire).
* **context-completion** : % contexte calculé correctement.

---

## 8) Tests (exécutables)

### 8.1 Unit/Contract

* **folder_contract.test.ts** : shape exact + vision complète + agents avec charge.
* **assignment_logic.test.ts** : RACI rules + drag&drop comportement.
* **context_completion.test.ts** : % basé sur questions agent vs réponses user.

### 8.2 E2E (Given/When/Then)

1. **Vision**
   *Given* dossier coworking-q4, *When* GET `/api/folders/coworking-q4`, *Then* 200 + vision.objectif != "" + contraintes array.
2. **Assignation**
   *Given* operator, *When* POST assign heloise-rh RACI=A docs=[proc,checklist], *Then* 200 + badges visibles sur DocCards.
3. **Contexte**
   *Given* contexte 50%, *When* POST add note "sécurité incendie", *Then* completion % mis à jour + visible.
4. **Documents liés**
   *Given* 5 docs assignés, *When* filtre par agent=heloise, *Then* seuls docs assignés affichés.
5. **Export**
   *Given* owner, *When* export folder, *Then* zip contient `folder.json, docs.jsonl, agents.json, roadmap.json`.

---

## 9) Done (DoD B15 · DocDesk Dossier v0)

* Page **/console/folders/:id** **branchée** aux API.
* **Vision toujours visible** + **contexte guidé** + **assignation drag&drop**.
* **RBAC** appliqué (CTA masqués selon rôle).
* **Logs NDJSON** + **evidence pack dossier** livrés.
* **Oracles cURL** verts + **seeds opérationnelles**.

---