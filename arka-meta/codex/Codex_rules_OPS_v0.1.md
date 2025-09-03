# Codex\_rules\_OPS\_v0.1 — TaskForce Aeka (R3)

> **Objet** : règles **OPS** de livraison pour Codex en mode **TaskForce Aeka**. Ce document **complète** (et ne duplique pas) `Codex-rules_current.md`.
>
> **Priorités** : exécution rapide, **zéro binaire en PR**, **evidence pack 100% texte**, oracles CI, traçabilité.
>
> **Portée** : B1→B12 **hors B7 (annulé)**. **B1** exécuté en **fast‑track par Merlin** (hors process Codex), approbation **Owner**.

---

## 0) Snippet à coller en en‑tête de chaque ticket

```md
**Règles OPS (TaskForce Aeka)** : `arka-meta/codex/Codex_rules_OPS_v0.1.md` — exécution rapide, **texte‑only**, oracles CI requis.
```

> Pour rappel : **règles générales** → `arka-meta/codex/Codex-rules_current.md` (v1.2).

---

## Politique Réseau des Agents
- Par défaut, **Internet = OFF** pour les agents Codex après configuration.
- Les tâches nécessitant du réseau s’exécutent via **GitHub Actions**.
- Exceptions : requièrent un ticket "Override Net" avec allowlist d’hôtes et durée limitée.
- B1 (R3) : **aucune exception** — smokes & KPIs via GH Actions ; RBAC & gitleaks sans Internet côté agent.

### Secrets & gitleaks (offline/CI)
- **CI** : gitleaks **obligatoire** ; version doit matcher `vX.Y.Z` (pas de stub). Échec sinon.
- **Local offline** : si gitleaks absent, le hook **skip** et journalise l’état ; le contrôle est fait par l’action CI.
- **Interdit** de committer un stub ou un binaire dans le repo. Tout stub doit rester éphémère (ex: `/tmp/gitleaks`).
- Tout contournement (`--no-verify`) est proscrit et doit être justifié par ticket.

---

## 1) Critères d’acceptation — tronc commun (AC‑OPS)

1. **Traçabilité** : chaque requête UI émet **`X-Trace-Id`** ; **logs NDJSON** disponibles en dev/preview (`logs/ui_network.json`).
2. **RBAC** : `viewer|operator|owner` appliqué **et** visible (gardes API + états UI). 401→redirect login ; 403→interdit.
3. **Parcours fumée** (sans mocks sur endpoints branchés) : `/ → /login → POST /api/auth/login → /console`.
4. **Observabilité** : page `/console/observabilite` montre **KPIs** (p95 TTFT, p95 RTT, error\_rate%) + **Runs** paginés (20/l) ; tri stable.
5. **Agent slice (B9)** : endpoint **`/api/ai/stream`** (Vercel AI SDK) **stream token‑par‑token** ; **TTFT** affiché en UI ; **logs** `{model, role, ttft_ms, tokens_total}` en NDJSON (dev/preview).
6. **DEMO/offline** (B11) : host KO ⇒ UX **lecture‑seule** sans erreur bloquante (bannière), seeds DEMO optionnels.
7. **Performance & A11y** : budgets affichés ; pas de régression majeure ; niveau **AA** (axe‑core/lint a11y en CI accep­té).
8. **Evidence pack** : artefacts **texte only** livrés (cf. §3) + `arka-meta/reports/codex/<EPIC>/sha256sums.txt` mis à jour.
9. **Conformité contrats** : codes HTTP & **shape JSON** stricts ; **shape‑linter** CI vert.
10. **Gates & labels** : `DOR → AGP-PASS → OWNER-PASS → QA-PASS → READY-FOR-CUT`. (B1 : override **Merlin+Owner**).

---

## 2) Interdits explicites (FAIL PR immédiat)

* **Aucun binaire** en PR : `.png .jpg .jpeg .gif .mp4 .pdf .webp .psd` etc. (hook/CI **binary‑detector** obligatoire).
* **Mocks/fixtures** importés dans `app/api/**` pour des endpoints déclarés *branchés* (anti‑mocks CI).
* `test.skip` n’importe où (anti‑skip CI).
* Utilisation de `--no-verify` lors des commits (contourne les hooks).
* **Secrets** en clair/commit (fail‑fast au démarrage si secret manquant ; rotation si doute).
* **Edge/Cron** activés pour R3 (non requis) ; **runtime Node** attendu.
* Écritures persistantes **non prévues** (B10 en squelette uniquement).

---

## 3) Livrables & artefacts attendus (texte‑only)

```
logs/ui_network.json
logs/ai_gateway.ndjson                 # si B9 modifié
reports/obs_kpis.json
reports/obs_runs_page1.json
reports/curl_health.json               # oracles CI
reports/curl_kpis.json
reports/curl_runs.json
reports/curl_ai_stream.json            # si B9
arka-meta/reports/codex/<EPIC>/sha256sums.txt (MAJ)
```

**Note** : pas d’images. Tout état d’UI est **prouvé par données** (JSON/NDJSON) ou sorties CI.

---

## 4) Résumé AC par brique (B1→B12, B7 annulé)

* **B1 — Base/Env (fast‑track Merlin)** : DNS/Vercel/secrets ; previews PR OK ; protections de branche ; `NEXT_PUBLIC_HOST`/`NO_PROXY` posés. *Override gates*: Merlin→Owner.
* **B2 — CI gates** : `network-gate`, `rbac-smokes`, `secret-scan` ; 2 runs verts ; artefacts CI publiés.
* **B3 — Auth/RBAC** : `/login` (JWT collé), `RoleBadge`, guard `/console/**` ; E2E redirect/401→logout.
* **B4 — Console/KPIs** : cartes KPIs (p95 TTFT/RTT, error\_rate%) + **HealthChip**.
* **B5 — Documents RO** *(si data prête)* : table 20/l, tri stable, états empty/erreur.
* **B6 — Threads RO** : encart 5 derniers + page RO (option P1).
* **B7 — Prompt Builder** : **ANNULÉ** R3.
* **B8 — Observabilité v0.1** : graphe simple + Runs 20/l + filtres Lot/Sprint (UI‑only).
* **B9 — Gateway IA (pilote)** : `/api/ai/stream` streaming ; TTFT visible UI ; logs NDJSON (dev/preview).
* **B10 — Substrat mémoire** : **squelette** (KV/DB/blob) sans branchement UI ; aucune écriture prod.
* **B11 — DEMO/Offline** : watermark DEMO + bannière offline non bloquante.
* **B12 — Evidence & Cut** : evidence pack complet ; tag `v0.1.0-demo` ; CI verte.

---

## 5) CI — Jobs minimaux requis

* **binary‑detector** : fail si binaire détecté en diff.
* **shape‑linter** : vérifie clés obligatoires sur `metrics/kpis`, `metrics/runs`, `ai/stream`.
* **rbac‑smokes** : matrice rôle×endpoint (200/401/403 attendus).
* **curl‑oracles** : `health`, `kpis`, `runs`, `ai/stream` retournent 200 (si B9 actif).
* **axe‑a11y** (light) : passe AA sur pages clés (`/`, `/login`, `/console/observabilite`).

---

## 6) Pièces jointes (références utiles, 1‑ligne)

> Les fichiers sont accessibles en PJ sous `arka-meta/codex/OPS/<File-name>`

* `Arka-Go-Pack_v0-1_Codex-ready_Full-map.md` — carte globale B1→B12, jalon R3.
* `Codex-rules_current.md` — règles prescriptives minimales (v1.2).
* `Plan-Directeur-Arka_v3.1_GoPack_v0.1.md` — plan directeur aligné Go Pack.
* `Vision-produit-Arka_v2.md` — vision produit condensée.
* `README.md` — informations racine du dépôt.
* `regle-de-base-arka-v1.md` — règles de base d’architecture.
* `SQLPACK.md` — annexes SQL et conventions.
* `Rétrospective-Consolidée-Release-1_M1-M3.md` — synthèse REX.

---

## 7) Gouvernance (TaskForce Aeka)

* **Flux PR** : Codex → **Merlin‑review** → **Owner‑approval** → (PMO/AGP : traçabilité & suivi) → QA‑PASS → Cut.
* **Délais cibles** : Merlin ≤ 4h OJ, Owner ≤ 8h OJ.
* **Décisions** : `ADR` courts + `aeka-decisions.md`.

---

## 8) Changelog

* **v0.1** — Première version **OPS** (Aeka). **Spécificités R3** : *no‑binary*, B1 fast‑track, B7 annulé.
