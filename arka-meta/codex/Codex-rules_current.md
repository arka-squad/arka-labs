# ⚖️ Règles Codex — Arka (v1.2)

> **But** : règles prescriptives minimales pour exécuter les tickets Arka **sans improvisation**. À lier dans chaque ticket via :
> **Règles Codex** : `arka-meta/codex_rules/codex_rules_current.md`

---

### 1) Branché ou rien

Aucune livraison *Storybook‑only*. Une US UI est **DONE** si la page et la route sont présentes **et branchées** aux API prévues.
**Parcours fumée obligatoire** : `/ → /login → POST /api/auth/login → /console`.

---

### 2) Contrats stricts

Respect **exact** des codes/réponses listés dans les tickets/specs.
Ex. Webhook : pas de `204/500` si non prévus ; ratelimit = `202` **ou** `403` selon spec.

#### 2 bis) Anti‑mocks & Anti‑skip (*Gate PR*)

* Interdits dans ce scope : tests `skip`, données **mockées** sur les endpoints déclarés *branchés*.
* **Gate PR automatique** :

  * Échec si `test.skip` détecté dans `tests/**`.
  * Échec si import de `mockRuns`/`fixtures` dans `app/api/metrics/**` (Observabilité).
  * Échec si la réponse JSON **ne contient pas** les clés obligatoires du contrat (*shape linter*).

---

### 3) Logs JSON partout

Sur routes clés (`login / projects / agents / health / webhook`) : `{ts, level, msg, route, status, ...}`.
**Évidence** : extraits de logs inclus dans `audit_synthese.md`.

---

### 4) RBAC appliqué & visible

Middleware côté back **et** états UI (`viewer` RO, `operator` limité, `owner` total).
**Évidence** : tests *table‑driven* (route × rôle) + capture UI.

---

### 5) Sécurité basique

Aucun secret par défaut. Démarrage **interdit** si secret manquant (*fail‑fast*).
HMAC/GitHub : `403` si invalide ; **allowlist** obligatoire.

---

### 6) Performance & A11y

Budgets : **LCP ≤ 2.5s** (`/`, `/login`), **TTI ≤ 2s** (`/console`), **CLS < 0.1**, niveau **AA**.
**Évidence** : rapport Lighthouse/CI joint.

---

### 7) Tests & Schémas

Unitaires + E2E (`login → console`).
Contrats JSON via **schémas** (AJV ou équivalent).
Rapport de tests **exporté**.

---

### 8) Arbo & Routage

Présence des pages : `/`, `/login`, `/console`, sous‑routes
(` /console/(chat|documents|prompt-builder|observabilite)`).
Zéro doublon incohérent (`types.d.ts`, imports). **Nettoyage** requis.

---

### 9) Clarification obligatoire

Si un point est flou ou manquant dans un ticket : **ne pas boucher les trous**.
Poser **1 question courte** et **bloquer** jusqu’à réponse.

#### 9 bis) Clarification **unique** & blocage

* Une seule **question** par ticket ; sans réponse → **stop dev**.
* Renvoi au DoR/**oracles** du ticket (cURL/fixtures) au lieu d’un mock.

---

### 10) Livrables normalisés

Respect des **noms/chemins** demandés dans tickets & cadrage (reports, patches, synthèse).
Toujours livrer `audit_synthese.md` + tenir à jour `codex_rules_current.md`.

---

### 11) Compte‑rendu de livraison Codex (obligatoire)

⚠️ Obligation Codex : produire en sortie un fichier **`CR-Codex.yaml`** conforme au template
`arka-meta/backlog/templates/TPL-CR-Codex.yaml`. Sans ce CR **rempli** → livraison **invalide**.
**Emplacement** : `arka-meta/reports/codex/CR-<TCK-XXXX-YY>.yaml`

**Template attendu (extrait)** :

```yaml
Codex-Delivery-Report:
  ticket_id: <TCK-XXXX-YY>
  lot: <M3>
  version: <R1-M3 v1.1>
  repo: <arka-console | arka-backend>
  branch: <feature/TCK-XXXX>
  commit: <sha>
  delivered_components:
    - "path/to/file1"
    - "path/to/file2"
  tests_local:
    passed: true|false
    coverage:
      lines: <int>  # %
      branches: <int>  # %
  perf_local:
    chat_ttft_ms_p95: <int>
    voice_rtt_ms_p95: <int>
    api_latency_ms_p95: <int>
  security_local:
    hmac: true|false
    idempotence: true|false
    logs_trace_id: true|false
  evidence:
    - "screenshot_*.png"
    - "logs_*.json"
    - "lighthouse_*.pdf"
  # ✅ Compléments obligatoires
  compliance_norme:
    skeleton_respected: true|false
    reference: "arka-meta/normes/Norme-commune-Arka_Formats-de-livrables-Codex-ready_DEV_v1.2.pdf"
  evidence_pack:
    screenshots: ["screenshots_parcours.png", "screenshots/console_{sm,md,lg}.png"]
    logs: ["logs/ui_network.json", "logs_run_*.json"]
    checksums: ["arka-meta/reports/codex/<EPIC>/sha256sums.txt"]
  remarks:
    - "Limites connues ou points à surveiller"
  next_step: "QA vérifie preuves + relaye AGP"
  ts: YYYY-MM-DDThh:mmZ
```

---

### 12) Référence au squelette de livrables

* Chaque livraison Codex doit **prouver** sa conformité au squelette de livrables :
  `arka-meta/normes/Norme-commune-Arka_Formats-de-livrables-Codex-ready_DEV_v1.2.pdf`
* La conformité est déclarée dans le **CR-Codex.yaml** via le bloc `compliance_norme` (cf. §11).
* Aucun fichier séparé : la **validation est intégrée** au compte‑rendu.

**Extrait attendu** :

```yaml
compliance_norme:
  skeleton_respected: true|false
  reference: "arka-meta/normes/Norme-commune-Arka_Formats-de-livrables-Codex-ready_DEV_v1.2.pdf"
```

---

## 13) 🤖 AI‑Ready (exécutables) — Gates PR communs

> Applique des **garde‑fous automatiques** pour empêcher les livraisons non‑exécutables par l’IA.

**Gates obligatoires (CI)**

* **Shape linter** : les réponses d’API contiennent les clés obligatoires (`items`, `count`, `page`, `page_size`, etc.).
* **Anti‑mocks** : aucun import de *fixtures* non autorisées dans `app/api/**` des endpoints déclarés *branchés*.
* **Anti‑skip** : échec si `test.skip` présent.
* **Évidence pack** : présence des fichiers exigés par le ticket/DoR (`screenshots_*`, `logs/ui_network.json`, `sha256sums.txt`).
* **Budgets UI** : Lighthouse (`LCP p75`, `TTI p75`, `A11y`) et axe‑core → FAIL si dépassements/violations.

**Sorties attendues (CI artifacts)**

* `reports/lh_*.json`, `reports/axe_*.json`, `screenshots/*`, `logs/*`, `reports/curl_*.json`.

---

### 🔁 Versionnement des règles

* Fichier courant : `codex_rules_current.md` (pointe vers la dernière vX).
* Nouveau cycle d’audit ⇒ `codex_rules_v{n+1}.md` + **changelog** en tête.
