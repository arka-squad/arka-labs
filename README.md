# Arka Console

Mini console for orchestrating agents and tracking memory via GitHub pull requests.

## Quick Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

- `POSTGRES_URL`
- `OPENAI_API_KEY`
- `GITHUB_APP_ID`
- `GITHUB_PRIVATE_KEY`
- `GITHUB_WEBHOOK_SECRET`
- `ALLOWLIST_REPOS` (default: `nova-ora/nova-meta,nova-ora/nova.assist,nova-ora/Nova.companion,nova-ora/nova-audio-bridge`)
- `MODE` (`shadow` or `active`)
- `MEMORY_PR` (`true` to append memory)

## Vercel

Deploy with Vercel and set the environment variables above. Cron job for `/api/jobs/drain` is configured in `vercel.json`.
