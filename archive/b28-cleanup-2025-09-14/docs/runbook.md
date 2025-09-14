# Runbook

## Database migration

```bash
psql "$POSTGRES_URL" -f sql/001_init.sql
```

## Deployment

Push to `main` to trigger the Vercel build. All environment variables must be configured in the Vercel project.

## Verifying webhooks

Send a ping to the GitHub webhook endpoint:

```bash
curl -X POST http://localhost:3000/api/webhook/github \
  -H "X-GitHub-Event: ping" \
  -H "X-Hub-Signature-256: sha256=$(echo -n '{}' | openssl dgst -sha256 -hmac "$GITHUB_WEBHOOK_SECRET" -hex | sed 's/^/\/')" \
  -d '{}'
```

## Cron jobs

Vercel calls `/api/jobs/drain` every 5 minutes as configured in `vercel.json`.

## Secrets policy

All credentials are managed outside the repository. Never commit real secrets or `.env.local`; use `.env.example` for placeholders only. Rotate exposed keys immediately and store them in the team's secret manager. Run `scripts/pre-commit-secrets` before pushing changes and ensure CI secret scans pass.

Ne jamais coller un vrai secret dans un doc ; utiliser uniquement des placeholders comme <TOKEN_EXAMPLE>.


## Rotation

1. Générer un nouveau secret (ex: `openssl rand -hex 32`).
2. Mettre à jour les variables dans [Vercel project settings](https://vercel.com/docs/projects/environment-variables).
3. Déployer pour prendre en compte les nouvelles valeurs.
4. Rollback : restaurer l'ancienne valeur depuis l'historique Vercel en cas de problème.
