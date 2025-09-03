# Build fix notes

- Purged legacy `next/document` usage; root and console layouts now rely on native `<html>`/`<body>`.
- Console layout is a server component importing client `ConsoleShell` via alias.
- ESLint rule and CI workflow guard prevent reintroducing `next/document` or the Html component.
- TypeScript path aliases and resolver in place; imports use `@components/*`, `@console/*`, `@app/*`.
- Commands executed locally:
  - `npx tsc -p tsconfig.json`
  - `npm run lint`
  - `NODE_ENV=production npm run build`
