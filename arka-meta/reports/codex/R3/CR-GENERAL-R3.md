## [2025-09-05 01:33] Lot 1 – Encodage + CI + Landing (cockpit)
- Encodage: ajout meta charset UTF-8 dans app/layout.tsx.
- CI: garde-fou encodage (scripts/check_encoding.mjs) + tape smokes.yml (fail si mojibake).
- Landing: FR normalisé (entités HTML), cockpit partout, CTA corrigé, assets relatifs + cache-buster.
- Cockpit: pas de changement de structure (Lot 2 à suivre).
- Commits:
  - 8e79f20 fix(landing): escape apostrophes with &rsquo;
  - 229c645 fix(landing): rebuild page.tsx in UTF-8 safe HTML entities
  - 867b8f1 chore(lot1): UTF-8 meta + encoding guard + FR landing

