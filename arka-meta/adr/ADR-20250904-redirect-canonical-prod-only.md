# ADR-20250904 — Redirect canonical prod-only

- Status: accepted
- Date: 2025-09-04
- Owner: Codex

## Contexte
Les redirections 301 canoniques ne doivent s'appliquer qu'en production afin d'éviter de casser les environnements de Preview (Vercel) et le développement local.

Le dépôt utilise Next.js. Un redirect permanent est défini dans `next.config.js`.

## Décision
- Activer les redirections 301 uniquement quand `VERCEL_ENV === 'production'`.
- En Preview/Dev: laisser passer pour permettre les tests et bypass.

## Conséquences
- Expérience stable en Preview, aucune surprise côté CI.
- Canonical SEO correct en production uniquement.

## Implémentation (exemple)

```ts
// middleware.ts
export function middleware(req: NextRequest) {
  const isProd = process.env.VERCEL_ENV === 'production';
  if (isProd) {
    // Exemple: forcer /www -> apex, sécuriser trailing slashes, etc.
    // return NextResponse.redirect(new URL('/', req.url), 301);
  }
  return NextResponse.next();
}
```

```js
// next.config.js (si nécessaire)
const isProd = process.env.VERCEL_ENV === 'production';
module.exports = {
  async redirects() {
    if (!isProd) return [];
    return [
      // { source: '/securite', destination: '/beta', permanent: true },
    ];
  },
};
```

## Rollback
Supprimer la condition `VERCEL_ENV` et/ou la règle de redirect.

