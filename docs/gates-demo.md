# Démo : Gates & Recettes

Ce guide montre comment exécuter un gate puis une recette via l'API.

## Prérequis
- un token JWT avec rôle `editor` ou plus
- `curl`

## Lancer un gate
1. Lister les gates disponibles :
   ```bash
   curl -H "Authorization: Bearer $TOKEN" $HOST/api/gates
   ```
2. Exécuter un gate de perf :
   ```bash
   curl -X POST $HOST/api/gates/run \
     -H "Authorization: Bearer $TOKEN" \
     -H "x-idempotency-key: $(uuidgen)" \
     -d '{"gate_id":"perf.api.ttft_p95","inputs":{"window_minute":1}}'
   ```
   La réponse renvoie `job_id`.
3. Suivre le job :
   ```bash
   curl -H "Authorization: Bearer $TOKEN" $HOST/api/gates/jobs/<job_id>
   curl -H "Authorization: Bearer $TOKEN" $HOST/api/gates/jobs/<job_id>/logs
   ```

## Lancer une recette
1. Lister les recettes :
   ```bash
   curl -H "Authorization: Bearer $TOKEN" $HOST/api/recipes
   ```
2. Exécuter la recette `release.preflight` :
   ```bash
   curl -X POST $HOST/api/recipes/run \
     -H "Authorization: Bearer $TOKEN" \
     -H "x-idempotency-key: $(uuidgen)" \
     -d '{"recipe_id":"release.preflight","inputs":{"window_minute":1,"payload":"p","secret":"s"}}'
   ```
   Récupérer ensuite l'état avec `/api/gates/jobs/<job_id>` comme ci-dessus.

