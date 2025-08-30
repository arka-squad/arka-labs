# Prompt Builder UI

Interface de composition de prompts avec contrôle RBAC.

## Rôles
- **viewer** : lecture seule
- **operator** : ajout et suppression sans versionning
- **owner** : édition complète et versionning

## Mapping AC QA
- Given viewer, When ouverture page, Then lecture seule
- Given operator, When ajout bloc, Then bloc sauvegardé mais pas versionné
- Given owner, When ajout bloc, Then bloc versionné + badge "versionné"
