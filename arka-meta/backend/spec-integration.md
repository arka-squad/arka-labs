# Backend API – Spec d'intégration

_Date: 2025-08-27_

## 1. Contexte
API backend M2 offrant streaming SSE, documents, métriques et autres capacités. Contrat complet disponible dans l'OpenAPI situé à ../contracts/openapi.yaml.

## 2. Stack
- Next.js 14
- Node.js / TypeScript
- PostgreSQL

## 3. Modélisation & Endpoints
Les endpoints sont décrits dans l'[OpenAPI](../contracts/openapi.yaml). Exemples d'utilisation via curl sont fournis dans [README_lot.md](../../README_lot.md).

## 4. Tests, CI/CD & Monitoring
- `npm test`
- `npm run api:lint`
- Logs JSON `cat: 'api'` drainés vers sink.
