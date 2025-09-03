# 400-ci-policy-and-ownership

## Workflows requis

| workflow | statut |
| --- | --- |
| `secret-scan.yml` | required |
| `rbac-smokes.yml` | required |
| `network-gate.yml` | required |
| `ops-r3-b1-smokes.yml` | required (à créer) |

## Protection de branche

- Checks requis sur `main` : `secret-scan`, `rbac-smokes`, `network-gate`, `ops-r3-b1-smokes`.
- Interdiction des pushes directs sur `main`.
- Merge via PR avec revue obligatoire.

## CODEOWNERS (à implémenter)

```text
.github/workflows/** @Owner @Merlin
apps/**              @Owner
services/**          @Owner
packages/**          @Merlin
infra/**             @DevOps
tests/**             @QA
arka-meta/**         @AGP
docs/**              @AGP
```

## Tokens & variables

- `PROD_HOST` et `PREVIEW_HOST` stockés dans les secrets GitHub (ENV).
- `GITHUB_TOKEN` obligatoire pour les scans PR et upload d'artefacts.
- Aucun secret en clair dans le dépôt.

## DoR / DoD d'une PR archi

- **DoR** : ticket lié, inventaire généré, plan de tests défini.
- **DoD** : tests unitaires & e2e verts, `sha256sums.txt` et `logs/ui_network.json` fournis, revues Owner+AGP+QA, CI 100% verte.

## Matrice d'ownership

| zone | Owner | Merlin | AGP | QA | DevOps |
| --- | --- | --- | --- | --- | --- |
| apps/* | X |  |  |  |  |
| services/api | X |  |  |  |  |
| packages/* |  | X |  |  |  |
| infra/* |  |  |  |  | X |
| tests/ |  |  |  | X |  |
| arka-meta/ |  |  | X |  |  |
| docs/ |  |  | X |  |  |
| .github/workflows/** | X | X |  |  |  |

