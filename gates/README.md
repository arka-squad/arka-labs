Gates & Recettes — Catalogue (Seeds v1)

Structure
- gates/catalog/gates.json — liste des gates (métadonnées GateDef)
- gates/catalog/recipes.json — liste des recettes (RecipeDef)
- schemas/gates/*.schema.json — contrats JSON Schema

Remarques
- Ces seeds ne déclenchent aucune exécution; la logique runner/API sera livrée dans la PR feat/b14-gate-aggregator.
- Les IDs sont stables et versionnés; les champs inputs/outputs sont minimaux pour cadrer l’implémentation.

