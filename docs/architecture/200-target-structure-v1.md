# 200-target-structure-v1

## Arborescence cible

```text
.
├── apps/
│   ├── console/          # UI web principale
│   └── agent/            # agents locaux/edge
├── services/
│   └── api/              # API HTTP + adapters
├── packages/
│   ├── ui/               # composants UI partagés
│   ├── utils/            # utilitaires communs
│   └── types/            # types partagés
├── infra/
│   ├── ci/               # workflows & scripts
│   └── iac/              # infra as code
├── tests/                # e2e & intégration globaux
├── arka-meta/            # règles & rapports
└── docs/                 # documentation
```

## Frontières & dépendances

- `apps/*` consomment `services/api` via HTTP ; aucune dépendance directe aux packages internes hors `packages/*`.
- `services/api` peut utiliser `packages/*` mais jamais `apps/*`.
- Pas de cycles : `packages` → `services` → `apps`.

Les contrats HTTP et schémas JSON sont validés (zod/AJV), les logs sont au format JSON, RBAC appliqué partout.

## Règles de placement

- Tests unitaires proches du code (`*.test.ts`) dans chaque module.
- Tests d'intégration/e2e dans `tests/`.
- Scripts DevOps et workflows dans `infra/ci`.
- Fixtures et prompts à côté des tests associés.
- Modules `ai/*` rangés sous `packages/`.

## Ownership

- `apps/*` : **Owner**
- `services/api` : **Owner** (backend)
- `packages/*` : **Merlin** (revue Owner)
- `infra/*` : **DevOps**
- `tests/` : **QA**
- `arka-meta/` : **AGP/PMO**
- `.github/workflows/**` : **Owner + Merlin** (revue obligatoire)

