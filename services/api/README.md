# services/api

Service HTTP (API) consommé par les apps.

Contrats:
- Schémas JSON validés (zod/AJV) et logs JSONL.
- RBAC appliqué (viewer/operator/owner).

Dépendances:
- Peut utiliser `packages/*`.
- Ne dépend jamais de `apps/*`.
