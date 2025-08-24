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

## Deployment

Set the environment variables on Vercel and push to `main` to trigger deployment. test

