# apps/

Ce répertoire contient les applications (UI/CLI). La console web vit dans `apps/console/`.

Règles:
- Pas d’import direct depuis `services/` (HTTP only).
- Peut consommer `packages/*` (ui, utils, types).
