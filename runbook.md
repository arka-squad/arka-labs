# Runbook

## Common Issues

### Database connection failures
1. Check `POSTGRES_URL`.
2. Redeploy with correct secret.

### Rotating secrets
Update the secret in Vercel and redeploy the project.

### Redeploy
Push to `main` and trigger Vercel deployment.
