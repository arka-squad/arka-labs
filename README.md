[![network-gate](https://github.com/arka-squad/arka-labs/actions/workflows/network-gate.yml/badge.svg?branch=main)](https://github.com/arka-squad/arka-labs/actions/workflows/network-gate.yml)
[![rbac-smokes](https://github.com/arka-squad/arka-labs/actions/workflows/rbac-smokes.yml/badge.svg?branch=main)](https://github.com/arka-squad/arka-labs/actions/workflows/rbac-smokes.yml)
[![secret-scan](https://github.com/arka-squad/arka-labs/actions/workflows/secret-scan.yml/badge.svg?branch=main)](https://github.com/arka-squad/arka-labs/actions/workflows/secret-scan.yml)


# CI

Les pull requests doivent passer **network-gate**, **rbac-smokes** (mode `fail`) et **secret-scan** avant fusion. Les journaux NDJSON des smokes RBAC sont conservés uniquement comme artefacts Actions. Une approbation de revue est requise et les branches doivent être à jour. En cas d'échec transitoire, relancez les jobs via "Re-run jobs" dans l'onglet Actions.

# Arka Console

Mini console for orchestrating agents and tracking memory via GitHub pull requests.

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment variables

| Variable | Description |
| --- | --- |
| `POSTGRES_URL` | PostgreSQL connection string |
| `MODE` | `shadow` (default) or `active` |
| `ALLOWLIST_REPOS` | Comma separated repo full names allowed for webhooks |
| `GITHUB_APP_ID` | GitHub App identifier |
| `GITHUB_PRIVATE_KEY` | Private key for the GitHub App |
| `GITHUB_WEBHOOK_SECRET` | Secret used to validate webhook signatures |
| `MEMORY_PR` | `true` to append memory comments on pull requests |
| `OPENAI_API_KEY` | Optional – used by agents |

## Usage

- Start the dev server with `npm run dev`.
- Health endpoint: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- Webhook ping test: send a `ping` event with the secret to `/api/webhook/github`.
- Pushing to `main` deploys to Vercel. Cron for `/api/jobs/drain` is defined in `vercel.json`.

### QA smokes `/api/agents`

Scripts `scripts/smoke_agents.sh` et `scripts/smoke_agents.ps1` vérifient les statuts attendus (403,200,403,200).
Variables requises : `HOST`, `TOKEN_VIEWER`, `TOKEN_EDITOR`, `TOKEN_ADMIN`.
Variables optionnelles : `HTTPS_PROXY`, `HTTP_PROXY`, `ALL_PROXY`, `NO_PROXY` (définir `NO_PROXY=*` pour désactiver les proxies).
Chaque appel est réalisé en mode verbeux avec `--connect-timeout 5` et `--max-time 10`.
Les résultats sont journalisés en NDJSON dans `arka-meta/reports/codex/rbac_qa_logs.ndjson` avec `code=000` en cas d'échec.
Des JWT de test sont fournis sous `arka-meta/reports/staging/tokens_staging.json`.

### Wrapper `apiFetch`

Toutes les requêtes vers `/api` doivent utiliser `apiFetch` (`lib/http.ts`).
Cette fonction ajoute automatiquement l'en-tête `Authorization` si un token est disponible et redirige vers `/login` en cas de `401`.
Une règle ESLint (`no-restricted-syntax`) bloque tout `fetch('/api…')` direct.

## Deployment

Set the environment variables on Vercel and push to `main` to trigger deployment.

