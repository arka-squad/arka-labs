# Arka Console v12 — Builder de Gouvernance & DocDesk (Spécification intégrale)

**Statut**: Draft v12.0 — prêt pour wireframes low‑fi et prototypage no‑code.  
**Audience**: Owner, AGP, QA‑ARC, PMO, UX/UI.  
**Principes clés**: gouvernance par **briques** (type n8n), **gates** explicites, **Doc Graph** (documents vivants), **evidence‑first**, **observabilité native**, **RBAC viewer|operator|owner**.

---

## 1) Objectifs & Périmètre
**But**: fournir une console Arka unifiée avec:
1. Un **Builder de Gouvernance** (drag‑&‑drop) pour composer les flux d’organisation (Intake→Cadrage→Gates→Release→Learn).  
2. Un **DocDesk** (gestion documentaire visuelle) : DocRooms, Graph, Board, Timeline, assignations RACI, oracles testables.  
3. **Observabilité**: KPIs core (p95 TTFT/RTT, error‑rate), runs paginés, trace_id, evidence packs.

**IN**: bibliothèque de nœuds, gates, Doc Graph, KPIs/runs, RBAC 3 rôles, recettes prêtes.  
**OUT**: DMS juridique externe, signature légale avancée, facturation.

---

## 2) Principes & Vocabulaire
- **Brique/Nœud**: bloc fonctionnel réutilisable.  
- **Gate**: règle de passage (bloquante ou souple) agrégée sur sous‑flux.  
- **Oracle/Contrat**: vérification automatisée (API, règle, budget).  
- **Evidence Pack**: zip d’évidences (rapports, captures, checksums).  
- **Run**: exécution d’un flux; contient `trace_id`.  
- **Doc Graph**: graphe typé Docs↔Gates↔Agents↔Projets.  
- **Room**: sous‑espace documentaire contextuel (par type/squad/projet).  
- **RACI**: Responsible/Accountable/Consulted/Informed.

---

## 3) Ports, Événements & États (contrats communs)
**Ports**:  
- `in.flow | out.flow` (contrôle), `in.data? | out.data?` (payload JSON),  
- `in.docs?` (réf docs) | `out.evidence?` (artefacts).

**Événements**: `PASS | FAIL | WARN | SKIP | BLOCKED | EVI_REQUIRED | SCOPE_CHANGE`.

**États d’exécution**: `QUEUED, RUNNING, PASS, FAIL, WARN, SKIP, BLOCKED`.

**Badges**: `Gate PASS`, `Evidence OK`, `Perf OK`, `RBAC OK`, `Security OK`, `Compliance OK`.

---

## 4) Bibliothèque de briques (nœuds)
> Format: **rôle** · **ports** · **props clés** · **événements** · **artefacts** · **oracles par défaut** · **KPIs**

### A) Contrôle & Routage
- **Start / End** · entrée/sortie de flux · props: `name, description`.  
- **Gate (Aggregator)** · agrège statuts enfants; `mode: hard|soft`, `thresholds` · emits `PASS|FAIL|WARN`.  
- **Condition** · expression JSON/labels/statuts · `expr` · route sur `true/false`.  
- **Parallel / Join** · exécutions concurrentes puis synchronisation · `fanout` · KPIs: `duration_ms`.  
- **Manual‑Approval** · attente humaine · `approver_role, timeout` · `APPROVED|REJECTED`.  
- **Retry/Backoff** · retraits auto · `max_retries, strategy, timeout`.  
- **Scheduler/Trigger** · `cron, webhook, event_source` · `TRIGGERED`.

### B) Cadrage & Admission
- **Intake** · crée une demande/projet · `sources(repo,ticket)`, `sponsors`, `labels`.  
- **Cadrage (Scope)** · borne IN/OUT · `objectifs, livrables, risques_init` · artefact `cadrage.md`.  
- **Definition of Ready (DoR)** · checklist d’entrée · `items[]` · oracles: `documents_presence`.  

### C) Rôles, RACI & Politiques
- **RACI** · matrice par brique/squad · `A,R,C,I` · out.data: `raci.json`.  
- **Policy** · attache une politique (tests, SLO, docs) · `policy_id, enforcement:on|monitor`.  
- **ADR** · décision d’architecture · `title, context, decision, consequences` · artefact `adr-xxxx.md`.

### D) Qualité, Sécurité, Conformité
- **Contracts/Oracles** · exécute tests de contrats · `suite_id, env` · artefact `rapport_oracles.json`.  
- **QA Review** · critères de recette · `checklist, approvers` · `EVI_REQUIRED`.  
- **Security Scan** · secrets/dépendances/SAST‑DAST · `tools, severity_threshold`.  
- **RBAC Check** · visibilité/permissions UI+API · `roles_required` · oracle: `rbac_smoke`.  
- **Compliance** · normes (RGPD, A11y…) · `standard, scope, exemptions`.

### E) Performance & Expérience
- **Perf Budget** · compare LCP/TTI/TTFT/RTT/CLS · `budgets, source` · artefact `perf_report.json`.  
- **Accessibilité** · WCAG checks · `level, pageset`.  
- **UX/UI Review** · heuristiques/guidelines · `criteria_set, ds_version`.

### F) Observabilité & Mesure
- **KPIs Collector** · récup. KPIs core · `period, source_routes[]` · artefact `kpis.json`.  
- **Runs History** · journal exécutions (20/l) · `filters(page, limit)` · out.data: `runs[]`.  
- **Trace Correlator** · corrélation `trace_id` UI↔API↔CI · `sources[]`.  
- **SLO/SLA** · calcul objectifs & burn rate · `targets, window`.

### G) Documentation & Évidences
- **Doc Assign** · lie doc→agents/projets · `doc_type, assignees[], links[]`.  
- **Doc Validate** · états `Draft→Review→Gated→Approved→Released→Deprecated` · `signers[]`.  
- **Evidence Collector** · assemble `evidence-pack.zip` · `includes[], checksum:true`.  
- **Publish/Notify** · publie docs/packs · `channels[], audiences[]`.

### H) Build, CI & Changement
- **CI Status** · récupère statuts pipelines requis · `checks_required[]`.  
- **Change Request** · crée/lie CR (Jira/GitHub/Linear) · `title, refs`.  
- **Release** · versionne, changelog, tags · `semver, notes, rollback_plan`.  
- **Rollback Plan** · plan testé · `steps[], verif_oracles[]`.

### I) Intégrations & Données
- **API Call** · REST/GraphQL générique · `method, url, auth, payload`.  
- **Webhook Out** · émet évènement · `endpoint, secret, retries`.  
- **Storage** · push/pull artefacts (S3/Blob/Git) · `path, retention`.  
- **Ticketing** · opérations issues · `provider, action(assign/comment/state)`.

### J) Mémoire & Audit
- **Snapshot/Memory** · snapshots append‑only (JSONL, PR‑snap) · `label, scope`.  
- **Tag/Label** · applique labels projet/risque/maturité · `labels[]`.  
- **Audit Log** · piste d’audit horodatée · `actor, action, object`.

### K) Roadmap & Delivery
- **Roadmap Planner** · hiérarchie Thème→Epic→Feature→Story · `horizons, capacities, scoring:WSJF|RICE`.  
- **Epic** · conteneur d’objectifs · `okr_refs, risk, deps[]` · events `READY|BLOCKED|SPLIT|MERGED`.  
- **Milestone** · point de contrôle · `date_target, gates_required[]` · artefact `milestone_report.md`.  
- **Sprint/Cadence** · itération · `dates, velocity_target, wip_max`.  
- **Dependency Map** · contraintes FS/FF/SF/SS · `links[] (type, criticity)`.  
- **Prioritization** · calcule WSJF/RICE · `formula, thresholds`.  
- **Release Train** · groupage features pour livraison · `window, go_nogo_criteria`.

### L) Chat & Collaboration (ChatOps)
- **Chat Channel** · connecte Slack/Discord/Teams · `workspace, channel, filters[]`.  
- **Thread Linker** · relie fil↔Epic/Doc/ADR · `rules(#EPIC‑123, urls)` · artefact `thread_index.json`.  
- **Summarizer** · synthèse quotidienne/hebdo · `frequency, structure` · artefact `chat_summary.md`.  
- **Decision Extractor** · détecte décisions/contrats · `triggers[]` · out: `adr-draft.md`.  
- **Stand‑up / Rétro Bot** · rituels · `cadence, questions` · artefact `micro-cr.md`.  
- **Moderation & Policy Gate** · code de conduite · `policies[]` · events `FLAGGED|APPROVED`.  
- **Notify/Dispatch** · router alertes gates/dates/incidents · `rules, priority_map`.

### M) Insights & Gouvernance
- **Risk Register** · registre risques · `prob, impact, owner, plan`.  
- **Budget & Effort** · consommation vs prévision · `budget, cost_per_day, burn_rate`.  
- **KPI Dashboard** · vues Produit/Ops/Qualité · `thresholds, period`.  
- **Knowledge Search** · recherche dans Docs/ADR/Chat/Issues · `scopes[], facets[]`.

---

## 5) DocDesk — gestion documentaire visuelle
**Concept**: *Doc Graph + Rooms*.

### Types de Rooms
- **Policies**, **Processes**, **ADRs**, **Contracts**, **Evidences**, **Notes stratégiques**, **Projets**, **Squads**.

### Vues
- **Graph**: nœuds (docs/projets/agents/gates) + arêtes typées (`justifie, assigne, alimente, impacte, bloque`).  
- **Board**: colonnes d’état (Draft→…→Deprecated) + couloirs par **risque**.  
- **Timeline**: ADR & releases dans le temps (marqueurs d’évidence).  
- **Rooms Grid**: cartes intelligentes (voir ci‑dessous).

### DocCards (cartes intelligentes)
- **Header**: icône type, titre, état, owner, dernière revue.  
- **Chips**: risques (max 2), gates liés (pastille PASS/FAIL), KPIs liés.  
- **Actions**: Assigner (drag agent→RACI), Ouvrir Preview, Tester Contrat, Attacher Evidence, Publier.  
- **Preview**: `/documents/:id/preview` + attachments (NDJSON/PNG/MD) + checksum visible.

### États documentaires
`Draft → Review → Gated → Approved → Released → Deprecated` (+ `Rejected` si besoin).  
**Règles**: un **Gate** doit être **PASS** pour passer `Gated→Approved`.

---

## 6) Agents & Squads

### Roster (liste agents)
- Champs: `id, display_name, role_primary, skills[≤5], tz, availability_days, load_percent, on_call, rbac(V|O|OW), status(green|amber|red)`.
- Vues: **Grid compact** (cartes 4×3), **List** (dense), **Heatmap** (charge par squad).

### Fiche Agent ultra‑compacte (card spec)
- **Header (1 ligne)**: avatar 20px · nom · rôle (émoji) · statut (●) · fuseau (UTC±).  
- **Infos clés (2 lignes)**: *Charge* (▮▮▯ 65%) · *Dispo* (3j) · *On‑call* (oui/non) / *Skills* (3 tags) · *Confiance* (A/B/C) · *RBAC* (V/O/OW).  
- **Context chips**: 2 missions (EPIC‑ID), 1 risque (⚠️), 1 doc à relire (📄).  
- **KPIs mini**: `TTFT 1.2j · Gate PASS 92% · Commits/sem 8`.  
- **Actions**: Assigner · Ping · Déléguer · Escalader · Substituer.  
- **Hover**: tiroir latéral (dispo calendrier, historique 30j, objectifs, feedbacks).

### Squads
- `id, mission, owner, members[], capacity_points, rituals(cadence), perimeter, kpis`.  
- Vues: *Squad Board* (missions/risques), *Squad Timeline*, *Rituels* (stand‑up, rétro, démo).

### Allocation & équilibrage
- **Load Balancer**: `rule(round_robin|expertise|cost)`, `target_load%`.  
- Alertes: `OVERALLOCATED (>85%)`, `UNDERUTILIZED (<40%)`.

---

## 7) Roadmap & Delivery
- **Hiérarchie**: *Thème → Epic → Feature → Story*.  
- **Priorisation**: WSJF/RICE, slots de capacité, décisions gelées (freeze windows).  
- **Dépendances**: FS/FF/SF/SS avec criticité, chemins critiques.  
- **Sprints**: vélocité cible, WIP max, spillover%.  
- **Milestones**: critères d’acceptation + gates requis.  
- **Release Train**: fenêtres Go/No‑Go, **Rollback plan** obligatoire.

---

## 8) ChatOps & Collaboration
- **Channels** (Slack/Discord/Teams) → événements normalisés.  
- **Thread Linker**: auto‑lien (#EPIC‑123, URLs) vers Epic/Doc/ADR.  
- **Summarizer**: digest quotidien/hebdo (Décisions/Actions/Risques).  
- **Decision Extractor**: repère “Décision:” → brouillon ADR.  
- **Rituels**: stand‑up / rétro / office hours → export *Micro‑CR*.  
- **Moderation**: confidentialité & code de conduite; redactions.  
- **Notify/Dispatch**: règles d’escalade (gates FAIL, dates, incidents).

---

## 9) Observabilité & KPIs
- **KPIs Core**: `p95_ttft_ms, p95_rtt_ms, error_rate_percent`.  
- **Runs**: pagination `limit=20`, filtrage par `project, status, date`.  
- **Trace**: `trace_id` corrélé UI→API→CI→DB; bouton *Copier trace*.  
- **Vues**: *Ops* (disponibilité, erreurs), *Produit* (latence, feature run‑rate), *Qualité* (Gate PASS, dette).

---

## 10) API — Contrats (extraits)
> REST JSON; contrats stables (versionnés). Sans code, uniquement schémas.

### Documents
- `GET /api/documents?page&limit&sort` → `{ items:[{id,type,title,state,owner,updated_at}], page, limit, total }`  
- `POST /api/documents/:id/assign` → `{ assignees:[id], raci:"A|R|C|I" }`  
- `POST /api/documents/:id/state` → `{ to:"Review|Approved|…", comment }`

### Metrics
- `GET /api/metrics/kpis?period` → `{ p95:{ ttft_ms, rtt_ms }, error_rate_percent }`  
- `GET /api/metrics/runs?page&limit&filters` → `{ runs:[{id, status, started_at, duration_ms, trace_id}], page, limit }`

### Builder
- `POST /api/flows` → `{ id, name, nodes[], edges[] }`  
- `POST /api/flows/:id/run` → `{ run_id, status:QUEUED }`  
- `GET /api/runs/:id` → `{ status, events[], artefacts[] }`

### Roadmap
- `GET /api/roadmap` → `{ themes:[{id,name,epics:[…]}], capacity, risks }`  
- `POST /api/epics` / `…/milestones` / `…/sprints` (CRUD minimal)

### ChatOps
- `POST /api/chat/link-thread` → `{ thread_id, target:{type:"epic|doc|adr", id} }`  
- `POST /api/chat/summarize` → `{ thread_id, period } → { summary_md }`

### RBAC & Audit
- `GET /api/me/permissions` → `{ roles:["viewer","operator"], scopes[] }`  
- `GET /api/audit?page&limit` → `{ events:[{actor, action, object, at}], … }`

---

## 11) Evidence & Memory
**Evidence pack** (zip): `/packs/<project>/<run_id>/evidence-pack.zip`  
Contenu: `reports/*.json`, `screens/*.png`, `docs/*.md`, `checksums.sha256`, `manifest.json` (auteur, versions, horodatage).  
**Memory**: `*.jsonl` append‑only + *PR snapshots* (hashés) — visibles dans DocDesk.

---

## 12) RBAC & Sécurité
- **Rôles**: `viewer` (lecture), `operator` (exécuter, annoter), `owner` (éditer, valider, publier).  
- **Guardrails**: HMAC webhooks, idempotence, secret‑scan, network gates CI.  
- **Audit**: piste immuable (horodatage, acteur, before/after, trace_id).

---

## 13) Écrans clés (wireframes à produire)
1. **Home / KPIs**: 3 tuiles KPI, derniers runs, alertes gates, accès rapides.  
2. **Builder (Canvas)**: palette de briques, mini‑map, panneau *Evidence*, logs/événements.  
3. **DocDesk — Graph**: nœuds typés, arêtes, badges PASS/FAIL, panneau contextuel.  
4. **DocRoom — Board**: états par colonne, assignations RACI (drag‑&‑drop), prévisualisation droite.  
5. **Roster Agents**: grille de fiches ultra‑compactes + filtres (rôle, charge, skill, TZ).  
6. **Agent Drawer**: détails light, calendrier, historique 30j, scorecard.  
7. **Roadmap Planner**: hiérarchie, dépendances, capacité, priorisation WSJF/RICE.  
8. **Observability / Runs**: liste paginée, filtres, détail d’un run (événements, artefacts, trace_id).

---

## 14) Tests (Given/When/Then — extraits)
- **Gate agrégé**  
  *Given* un flux avec 3 sous‑nœuds dont 1 `FAIL`, *When* j’exécute, *Then* le Gate parent est `FAIL(hard)` et affiche la cause.  
- **Doc Validate**  
  *Given* un doc Policy en `Review` sans evidence, *When* je clique `Approve`, *Then* l’action est bloquée avec `EVI_REQUIRED`.  
- **RBAC**  
  *Given* un utilisateur `viewer`, *When* il tente `POST /api/flows`, *Then* `403` et un évènement d’audit est écrit.  
- **KPIs/Runs**  
  *Given* `/api/metrics/kpis` renvoie des valeurs hors budget, *When* j’ouvre le Dashboard, *Then* je vois un badge `Perf NOK` et une carte d’action.

---

## 15) Risques & Mesures
- **Scope creep** → limites par release, backlog clair (parking lot).  
- **Perf UI** → budgets par écran, chargement paresseux, pagination stricte.  
- **Sécurité** → secrets chiffrés, rôles minimaux, audits continus.  
- **Adoption** → recettes prêtes, formations rapides, intégrations Slack/Jira.  
- **Dette documentaire** → DocRooms, rappels, extraction depuis Chat.

---

## 16) Recettes prêtes (flows exemple)
- *Intake → Cadrage → DoR → Gate*  
- *RACI → Policy → Contracts → Gate → Release*  
- *Security Scan → RBAC Check → Compliance → Gate*  
- *Perf Budget → KPIs Collector → SLO → Gate*  
- *Chat Channel → Decision Extractor → ADR (draft) → Doc Validate → Publish*

---

## 17) Next Steps
1) Valider la taxonomie de briques (v12) et les props minimales.  
2) Produire les **wireframes low‑fi** des 8 écrans (Figma/Miro).  
3) Définir les **contrats API** finaux (schémas JSON + erreurs).  
4) Ébauche des **oracles** par défaut (stubs) et des **budgets**.  
5) Sélectionner 1 **projet pilote** et dérouler 2 sprints d’essai.

