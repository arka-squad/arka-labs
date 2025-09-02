# Accessibilité — Page Bêta (R2.5)

- **Focus** : `:focus-visible` sur liens/boutons/inputs ; anneau AA >= 4.5:1.
- **Nav** : `aria-current="page"` sur le lien actif.
- **Formulaire** :
  - Associer `label[for]` ↔ `id` ; erreurs via `aria-invalid` + `aria-describedby`.
  - Zone d'état envoi/succès avec `aria-live="polite"`.
  - Cibles min 40×40px ; ordre tab logique.
- **Images** : décoratives `alt=""`, signifiantes `alt` descriptif.
- **Couleurs** : texte sur `#151F27`/`#0C1319` ≥ AA ; anneau `ring-slate-700/60`.