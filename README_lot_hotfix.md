# Hotfix Lot M2 – Flux de navigation corrigé

Ce correctif aligne la navigation principale de l'interface sur la cible **Landing → Login → Console**.

1. **Landing** (`/`) :
   - CTA "Ouvrir la console" redirige vers `/login`.
   - `uiLog` émet `{cat:'ui', route:'/', event:'cta_click'}`.
2. **Login** (`/login`) :
   - Authentification classique (POST `/api/auth/login`).
   - Stub SSO (`GET /api/auth/sso/start`) renvoie `501`.
   - En cas de succès, redirection vers `/console`.
3. **Console** (`/console`) :
   - Point d'entrée unique pour les applications internes (Chat, Documents, Prompt Builder, Observabilité).
   - Toutes les redirections post‑login mènent désormais vers cette route.

Les anciennes références vers `/projects` ont été supprimées afin d'éviter toute confusion.
