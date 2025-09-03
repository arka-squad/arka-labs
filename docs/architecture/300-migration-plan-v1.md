# 300-migration-plan-v1

## Vague 0 – Verrouillage CI & CODEOWNERS

- **Entrée** : dépôt actuel.
- **Actions** : activer protection de branche `main`, ajouter `CODEOWNERS` minimal pour `.github/workflows/**`.
- **Risques** : blocage des PR si règles trop strictes.
- **Critères d'acceptation** : workflows `secret-scan`, `network-gate`, `rbac-smokes` requis ; CODEOWNERS appliqué.
- **Rollback** : retirer protection ou fichier `CODEOWNERS`.

## Vague 1 – Préparation structurelle

- **Entrée** : Vague 0 stabilisée.
- **Actions** : créer arbo cible vide (`apps/`, `services/`, `packages/`, `infra/`) ; déplacer dossiers existants sans changer les imports ; ajouter alias/symlinks temporaires.
- **Risques** : chemins cassés, config build.
- **Critères d'acceptation** : build et tests passent, aucune régression.
- **Rollback** : revert des déplacements.

## Vague 2 – Refactor imports

- **Entrée** : structure cible en place.
- **Actions** : mettre à jour imports, `tsconfig`/alias, pipelines CI ; relocaliser tests.
- **Risques** : erreurs d'import, baisse de couverture.
- **Critères d'acceptation** : lint/typecheck OK, tests unitaires & e2e verts.
- **Rollback** : revenir aux alias précédents.

## Vague 3 – Nettoyage & consolidation

- **Entrée** : imports refactorisés.
- **Actions** : supprimer artefacts (`dist-tests`, `logs`), fusionner tests, archiver `ui-examples/`, compléter documentation.
- **Risques** : perte d'historique, oublis de dépendances.
- **Critères d'acceptation** : repo sans doublons, docs à jour.
- **Rollback** : récupérer artefacts via `git revert`.

## Prochaines étapes

- Ticket : ajout du fichier `CODEOWNERS`.
- Ticket : création du workflow `OPS R3 - B1 Smokes`.
- Ticket : migration des tests e2e vers `tests/`.
- Ticket : suppression de `dist-tests/` après refactor.

