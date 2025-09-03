# 100-repo-map-audit

audit du 2025-09-03. Inventaire complet: [repo_inventory.txt](../../arka-meta/reports/archi/audit_20250903/repo_inventory.txt).

## Topology

| path | type | taille (fichiers) | owner | observations |
| --- | --- | --- | --- | --- |
| app/ | dir | 72 | Owner | chevauchement avec apps/console |
| apps/console/ | dir | 34 | Owner | console legacy parallèle à app/ |
| src/ | dir | 14 | Owner | code Next.js partiel |
| components/ | dir | 8 | Owner | composants UI partagés |
| lib/ | dir | 20 | Owner | utilitaires communs |
| db/ | dir | 1 | Owner | schéma ou seed |
| scripts/ | dir | 11 | DevOps | scripts CI divers |
| sql/ | dir | 9 | Owner | migrations SQL |
| dist-tests/ | dir | 7 | QA | artefacts tests compilés, doublon de tests/ |
| tests/ | dir | 26 | QA | sources de tests node |
| public/ | dir | 14 | Owner | assets statiques |
| arka-meta/ | dir | 118 | AGP/PMO | règles et rapports |
| logs/ | dir | 1 | N/A | logs commités |
| jobs/ | dir | 1 | N/A | scripts isolés |
| ui-examples/ | dir | 2 | N/A | exemples non reliés |

## Compteurs

- Dossiers de tests: **2** (`tests`, `dist-tests/tests`)
- Dossiers de fixtures: **0**
- Fichiers binaires: **21** (PNG/PDF)
- Workflows CI: **3**

## Doublons/Conflits de nommage

- `app/` vs `apps/console/` : deux points d'entrée UI.
- `dist-tests/` commit en plus de `tests/`.
- Multiples `README*` au racine.

## Tests dispersés

- Tests node dans `tests/`.
- Artefacts compilés dans `dist-tests/tests/`.
- Pas de dossier unique pour e2e ; couverture inconnue.

## Orphelins

- `dist-tests/` (build output)
- `ui-examples/` (exemples isolés)
- `logs/` (artefacts de build)
- `jobs/` (scripts sans références)

## Dettes CI

- Workflow `OPS R3 - B1 Smokes` manquant.
- Pas de `CODEOWNERS` ni protection de branche documentée.

_Evidence: arka-meta/reports/archi/audit_20250903/repo_inventory.txt_

