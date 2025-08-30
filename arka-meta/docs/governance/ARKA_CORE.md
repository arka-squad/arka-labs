# 📦 Arka — Codex Governance v2 (Pack Canonique)

## 1) `arka-meta/docs/governance/ARKA_CORE.md`

````md
# ARKA_CORE — Codex Governance v2 (canonique)

> **Objet** : Référence unique de gouvernance Produit/Tech. Fait foi sur AGP/PMO/QA/Codex.
> **Statut** : v2 (2025‑08‑30) — remplace l’usage dispersé des PDFs/MD précédents.

## Sommaire
- [1. Portée & Principes](#1-portée--principes)
- [2. Index documentaire officiel](#2-index-documentaire-officiel)
- [3. Invariants DoD (Arka)](#3-invariants-dod-arka)
- [4. Gates & Workflow](#4-gates--workflow)
- [5. Politique de Logs & Idempotence](#5-politique-de-logs--idempotence)
- [6. Mémoire biface (DB + PR)](#6-mémoire-biface-db--pr)
- [7. Sécurité & Perf (budgets)](#7-sécurité--perf-budgets)
- [8. Taxonomie Labels](#8-taxonomie-labels)
- [9. Table de correspondance (anciens → v2)](#9-table-de-correspondance-anciens--v2)
- [10. Versionning & Changelog](#10-versionning--changelog)

---

## 1. Portée & Principes
- **Gouvernance radicale** : statuts, gates, checklists, contrats stricts.
- **Branché ou rien** : une livraison UI/Backend n’est DONE que **branchée** (route réelle + smoke). Storybook seul = **FAIL**.
- **Zéro lock‑in** : propriété client, auditabilité par PR.
- **Séparation multi‑clients** : RBAC `viewer|operator|owner` partout (UI + API).

## 2. Index documentaire officiel
- **Vision & Objectifs** → `../vision/`
- **Plan & Invest** → `../plan/`
- **Backlog & Specs** → `../backlog/`
- **Fiches Agents** → `../agents/`
- **Livrables UX/DEV** → `../livrables/`
- **Rapports** (AGP/QA/PMO/Audits) → `../rapports/`
- **Gouvernance & Templates** → `./`

## 3. Invariants DoD (Arka)
- **Sécurité** : JWT fail‑fast, HMAC webhooks, **idempotence** sur POST sensibles.
- **Logs JSON** : `trace_id`, `actor`, `role`, `route`, `status`, `latency_ms`.
- **Mémoire biface** : DB (opérationnelle) **+** PR (append‑only, diffable, JSONL + Markdown hashé).
- **Perf** : Chat **TTFT p95 < 2000 ms** ; Voix **RTT p95 < 2500 ms** ; Web **LCP ≤ 2500 ms, TTI ≤ 2000 ms, CLS < 0.1**.
- **Accessibilité** : WCAG 2.1 **AA**.

## 4. Gates & Workflow
1) **DoR Gate** (ticket démarrable) → bloc `definition_of_ready` rempli (contrats API/UI, perf, sécurité, evidences).
2) **CI Gate** (automatique) → échec si : secrets détectés | tests FAIL | budgets perf cassés | contrat non respecté.
3) **QA Gate** → **CR‑Codex.yaml** présent et **PASS**.
4) **AGP Gate** → PASS si invariants + risques labelisés (`risk:*`).

## 5. Politique de Logs & Idempotence
- **Logs** (toutes routes clés) : JSON structuré, champs min :
  ```json
  {"ts":"ISO8601","trace_id":"uuid","route":"/api/...","status":200,
   "latency_ms":123,"actor":"user|agent","role":"viewer|operator|owner",
   "method":"POST","idempotency_key":"uuid?","note":"..."}
````

* **Idempotence** : en-tête `X-Idempotency-Key` pour `run/abort` & webhooks ; rejet des doublons (409 ou 202 no‑op).

## 6. Mémoire biface (DB + PR)

* **DB temps réel** : `threads/messages`, `agent_events`, `documents`.
* **PR audit** : export **JSONL** + **Markdown** hashé ; append‑only ; un export par session close.

## 7. Sécurité & Perf (budgets)

* **Secret scanning** en CI (fail si trouvé).
* **Budgets perf** au niveau ticket (Lighthouse attaché en evidence).

## 8. Taxonomie Labels

* `Status/` : triage · in‑progress · ready‑for‑agp · ready‑for‑pmo · blocked
* `Gate/` : gate\:DoR=true · gate/agp-pass · gate/qa-pass
* `Risk/` : security · latency · perf · deps · scope
* `Lot/` : lot\:M1 · lot\:M2 · lot\:M3
* `Priority/` : P0 · P1 · P2

## 9. Table de correspondance (anciens → v2)

| Ancien document                                            | Couverture v2                                   |
| ---------------------------------------------------------- | ----------------------------------------------- |
| **Arka\_Règles-de-Base\_v1.pdf**                           | Sections 1·3·4·5·7 (invariants & sécurité/perf) |
| **Norme‑commune‑Arka\_Formats‑de‑livrables‑DEV\_v1.2.pdf** | DoR/DoD, formats, CI Gate                       |
| **agent#9‑Codex\_v1.pdf**                                  | Exécution Codex, CR‑Codex.yaml, Branché ou rien |

## 10. Versionning & Changelog

* **Changement majeur** : fusion des règles en **Codex Governance v2** (canonique).
* **2025‑08‑30** : création v2 · alias `latest` → gouv v2 · archivage des versions antérieures sous `../_archive/`.



### ✅ Dépôt recommandé

* `arka-meta/docs/governance/ARKA_CORE.md`
* `arka-meta/docs/governance/codex_rules_current.md`
* `arka-meta/docs/governance/TPL-CR-Codex.yaml`

> Optionnel : ajouter `REGLES_BASE.latest.md` (pointeur texte vers `ARKA_CORE.md`) et `TPL-CR-Codex.latest.yaml` (pointeur vers le template).
