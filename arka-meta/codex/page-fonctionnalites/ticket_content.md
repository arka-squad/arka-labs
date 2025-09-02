# Norme — Pack IA UX (Codex‑ready) v1.0 · **Page « fonctionnalités »** & **Layout Topbar**

**But** : permettre à Codex de reconstruire **ISO maquette** la page `/fonctionnalites` et le **layout Topbar** *sans Figma*, à partir d’un pack autonome versionné.

**Portée** : **IN** : page « fonctionnalités », layout **Topbar** commun. **OUT** : backend/API.

**Chemins** :

* Page : `arka-meta/codex/page-fonctionnalites/`
* Layout Topbar : `arka-meta/codex/layout-topbar/`

**Rappel IDs** : `data-codex-id` en **snake\_case** stable (ex. `link_fonctionnalites`, `cta_open_console`).

---

## 1) Livrables (6 fichiers + assets) — *pour chaque pack*

* `tokens.json`
* `copy_catalog.json`
* `motion_spec.md`
* `a11y_notes.md`
* `codex_ui_map.yml`
* `codex_selectors.json`
* Assets : `public/arka-logo-blanc.svg`, `public/favicon.ico` (réutilisables)

> Les **tokens** ci‑dessous sont cohérents avec la Console (R2.5). Les textes reflètent les derniers libellés validés : **« Inscription à la bêta »**, **« Contactez‑nous »**, *Tarification (à venir)*, CTA **« Bientôt disponible »** (Starter/Pro).

---

## 2) Pack — **page « fonctionnalités »** (`arka-meta/codex/page-fonctionnalites/`)

### `tokens.json`

```json
{
  "$schema": "https://arka.dev/schemas/tokens.json",
  "version": "R2.5",
  "colors": {
    "bg.body": "#0C1319",
    "bg.block": "#151F27",
    "border.soft": "#1F2A33",
    "ring.soft": "rgb(51 65 85 / 0.60)",
    "text.primary": "#FFFFFF",
    "text.secondary": "#CBD5E1",
    "text.muted": "#94A3B8",
    "grad.start": "#FAB652",
    "grad.mid": "#F25636",
    "grad.end": "#E0026D"
  },
  "gradients": {
    "brand": "linear-gradient(135deg, #FAB652 0%, #F25636 50%, #E0026D 100%)"
  },
  "typography": {
    "font.family": "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    "sizes": { "xs":12, "sm":14, "base":16, "lg":18, "xl":20, "2xl":24, "3xl":30, "4xl":36 },
    "weights": { "regular":400, "medium":500, "semibold":600, "bold":700, "extrabold":800 },
    "lineHeights": { "tight":1.15, "snug":1.25, "normal":1.45 }
  },
  "radius": { "sm":8, "md":12, "lg":16, "xl":20 },
  "spacing": { "xs":4, "sm":8, "md":12, "lg":16, "xl":20, "2xl":24, "3xl":32, "4xl":40 },
  "shadows": { "card": "0 6px 16px rgba(0,0,0,0.35)", "elevated": "0 10px 30px rgba(0,0,0,0.45)" },
  "motion": { "durations": { "fast":120, "normal":240, "slow":300 }, "stagger":60, "easing":"cubic-bezier(0.2, 0.8, 0.2, 1)" },
  "layout": { "container.maxWidth":1280, "grid.gap":16 }
}
```

### `copy_catalog.json`

```json
{
  "locale": "fr-FR",
  "page": {
    "features": {
      "title": "Arka — Nos services & fonctionnalités",
      "hero": {
        "lead": "Votre première organisation numérique universelle. Des squads augmentées (humain·e + IA) orchestrées par Arka, avec gouvernance codifiée, mémoire auditable et résultats mesurables.",
        "cta_beta": "Inscription à la bêta",
        "cta_contact": "Contactez‑nous"
      },
      "sections": {
        "pricing": {
          "title": "Tarification (à venir)",
          "starter_cta": "Bientôt disponible",
          "pro_cta": "Bientôt disponible",
          "enterprise_cta": "Obtenir un devis"
        },
        "why": {
          "items": [
            "Organisation, pas un bot",
            "Auditabilité radicale",
            "Souveraineté",
            "Expérience unifiée",
            "ADR & gouvernance",
            "Performance observable"
          ]
        }
      }
    }
  }
}
```

### `motion_spec.md`

```md
# Motion — page « fonctionnalités »
- Entrée sections: fade+slideUp(8px) `240ms`.
- Hover liens Topbar: `120ms` (accent), easing standard.
- Listes cartes (features / squads): `stagger 60ms`.
- Focus ring: apparition `120ms` (AA visible).
```

### `a11y_notes.md`

```md
# A11y — page « fonctionnalités »
- `:focus-visible` sur tous CTA/liens (contraste AA ≥ 4.5:1).
- Icône de titre: `role="img"` implicite, décoratif (via `aria-hidden`). Taille 20px (h-5 w-5), `shrink-0`, `mt-1` pour l’alignement sur 2 lignes.
- Sections titrées avec `aria-labelledby`. Listes en `<ul>` sémantiques.
- Cibles mini 40×40px.
- Texte sur `#151F27`/`#0C1319` conforme AA.
```

### `codex_ui_map.yml`

```yml
version: R2.5
pages:
  fonctionnalites:
    id: pg_features
    route: "/fonctionnalites"
    layout: { use: "layout_topbar" }
    hero:
      title: "Arka — Nos services & fonctionnalités"
      ctas:
        - { id: cta_beta, href: "/beta", text: "Inscription à la bêta" }
        - { id: cta_contact, href: "#contact", text: "Contactez‑nous" }
    sections:
      - { id: sec_obtenez, title: "Ce que vous obtenez" }
      - { id: sec_squads, title: "Squads disponibles" }
      - { id: sec_how, title: "Comment ça marche" }
      - { id: sec_why, title: "Pourquoi Arka" }
      - { id: sec_pricing, title: "Tarification (à venir)" }
      - { id: sec_security, title: "Sécurité & conformité (aperçu)" }
      - { id: sec_faq, title: "Foire aux questions" }
      - { id: sec_cta, title: "CTA final" }
```

### `codex_selectors.json`

```json
{
  "selectors": {
    "topbar_logo": "[data-codex-id='topbar_logo']",
    "link_fonctionnalites": "[data-codex-id='link_fonctionnalites']",
    "link_beta": "[data-codex-id='link_beta']",
    "link_tarification": "[data-codex-id='link_tarification']",
    "cta_open_console": "[data-codex-id='cta_open_console']",

    "cta_beta": "[data-codex-id='cta_beta']",
    "cta_contact": "[data-codex-id='cta_contact']",

    "pricing_starter_cta": "[data-codex-id='pricing_starter_cta']",
    "pricing_pro_cta": "[data-codex-id='pricing_pro_cta']",
    "pricing_enterprise_cta": "[data-codex-id='pricing_enterprise_cta']"
  },
  "deprecated_ids": []
}
```

**Patch d’instrumentation (extraits JSX)** — à appliquer dans la page :

```jsx
// Hero CTAs (ajouter les IDs)
<CTA href="/beta" label="Inscription à la bêta" data-codex-id="cta_beta" />
<CTA href="#contact" variant="ghost" label="Contactez‑nous" data-codex-id="cta_contact" />

// Pricing CTAs
<Button data-codex-id="pricing_starter_cta" ...>Bientôt disponible</Button>
<Button data-codex-id="pricing_pro_cta" ...>Bientôt disponible</Button>
<Button data-codex-id="pricing_enterprise_cta" ...>Obtenir un devis</Button>
```

---

