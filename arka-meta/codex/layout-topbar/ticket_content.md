3) Pack — Layout Topbar (arka-meta/codex/layout-topbar/)

tokens.json

Réutilise les mêmes tokens que la page (copie identique), pour cohérence des couleurs/focus.

copy_catalog.json

{
  "locale": "fr-FR",
  "topbar": {
    "title_console": "Console",
    "project_selector_empty": "Aucun projet — créez-en un",
    "theme": "Thème",
    "settings": "Configuration",
    "logout": "Se déconnecter"
  },
  "links": {
    "fonctionnalites": "Fonctionnalités",
    "beta": "Inscription à la bêta",
    "tarification": "Tarification"
  },
  "cta": { "open_console": "Ouvrir la console" }
}

motion_spec.md

# Motion — Layout Topbar
- Hover liens: `120ms`.
- Apparition Topbar (sticky): fade subtle `180ms`.
- Focus ring: `120ms`.

a11y_notes.md

# A11y — Layout Topbar
- Logo: lien vers `/` avec texte alternatif « Arka ».
- Liens de nav: utiliser `aria-current="page"` sur l’onglet actif.
- Cibles min 40×40px; focus-visible AA sur tous les éléments interactifs.
- Sélecteur de projet: `aria-label="Projet actif"`.

codex_ui_map.yml

version: R2.5
layout:
  layout_topbar:
    id: layout_topbar
    topbar:
      logo:   { id: topbar_logo, href: "/" }
      links:
        - { id: link_fonctionnalites, href: "/fonctionnalites", text: "Fonctionnalités" }
        - { id: link_beta,            href: "/beta",             text: "Inscription à la bêta" }
        - { id: link_tarification,    href: "/tarification",     text: "Tarification" }
      cta_primary: { id: cta_open_console, href: "/console", text: "Ouvrir la console" }

codex_selectors.json

{
  "selectors": {
    "topbar_logo": "[data-codex-id='topbar_logo']",
    "link_fonctionnalites": "[data-codex-id='link_fonctionnalites']",
    "link_beta": "[data-codex-id='link_beta']",
    "link_tarification": "[data-codex-id='link_tarification']",
    "cta_open_console": "[data-codex-id='cta_open_console']"
  }
}

Patch d’instrumentation (extraits JSX) — à appliquer dans le layout :

<Link href="/" data-codex-id="topbar_logo">...
<TopbarLink href="/fonctionnalites" id="link_fonctionnalites" ... />
<TopbarLink href="/beta" id="link_beta" ... />
<TopbarLink href="/tarification" id="link_tarification" ... />
<Button href="/console" data-codex-id="cta_open_console">Ouvrir la console</Button>

4) CI — contrôles (adapter les chemins)

Page « fonctionnalités »

jq -e '.colors and .typography' arka-meta/codex/page-fonctionnalites/tokens.json
jq -e '.page.features.sections.pricing.title' arka-meta/codex/page-fonctionnalites/copy_catalog.json
(test -s arka-meta/codex/page-fonctionnalites/motion_spec.md) && grep -Ei '240ms|stagger' arka-meta/codex/page-fonctionnalites/motion_spec.md
(test -s arka-meta/codex/page-fonctionnalites/a11y_notes.md) && grep -i 'focus-visible' arka-meta/codex/page-fonctionnalites/a11y_notes.md
yq -e '.pages.fonctionnalites' arka-meta/codex/page-fonctionnalites/codex_ui_map.yml
jq -e '.selectors.cta_beta and .selectors.pricing_starter_cta' arka-meta/codex/page-fonctionnalites/codex_selectors.json

Layout Topbar

jq -e '.colors and .typography' arka-meta/codex/layout-topbar/tokens.json
(test -s arka-meta/codex/layout-topbar/motion_spec.md) && grep -Ei '120ms' arka-meta/codex/layout-topbar/motion_spec.md
(test -s arka-meta/codex/layout-topbar/a11y_notes.md) && grep -i 'aria-current' arka-meta/codex/layout-topbar/a11y_notes.md
yq -e '.layout.layout_topbar' arka-meta/codex/layout-topbar/codex_ui_map.yml
jq -e '.selectors.topbar_logo and .selectors.cta_open_console' arka-meta/codex/layout-topbar/codex_selectors.json

Évidences

mkdir -p arka-meta/reports/codex/R2_5
sha256sum \
  arka-meta/codex/page-fonctionnalites/* \
  arka-meta/codex/layout-topbar/* \
  public/arka-logo-blanc.svg public/favicon.ico \
  > arka-meta/reports/codex/R2_5/sha256sums.txt

5) Risques & mitigations

IDs manquants sur les CTAs héro/pricing → patch d’instrumentation fourni.

Drift copy (ex. « démonstration » vs « bêta ») → copy_catalog.json source de vérité.

Contraste icône: icône titre plein, sans gradient, hérite du texte.

