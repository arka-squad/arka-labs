# Norme — Pack IA UX (Codex‑ready) v1.1 · **Page “Bêta privée” + Layout Topbar**

**But** : permettre à Codex de reconstruire l’UI **ISO maquettes** (sans Figma) pour la page **/beta** (+ **/beta/merci**) et le **layout Topbar** commun.

**Portée** : **IN** : Topbar (layout), Page Bêta, Page Merci. **OUT** : backend/API, auth réelle, envoi de formulaire serveur.

---

## 1) Cadrage (à appliquer tel quel)

### 1.1 Contrats

* **Chemin unique des livrables** : `arka-meta/codex/page-beta/`
* **Fichiers obligatoires (6)** : `tokens.json`, `copy_catalog.json`, `motion_spec.md`, `a11y_notes.md`, `codex_ui_map.yml`, `codex_selectors.json`
* **Assets obligatoires (2)** : `public/arka-logo-blanc.svg`, `public/favicon.ico`
* **Convention d’IDs (`data-codex-id`)** : **snake\_case** stable, scope clair. *Ex.* `topbar_logo`, `hero_title`, `cta_apply_beta`, `field_first_name`.
* **GPT cloisonné** : tout le nécessaire vit dans le repo (**zéro dépendance Figma**).

### 1.2 Exigences UI

* **Topbar (layout commun)**

  * Liens : `/fonctionnalites` (`link_fonctionnalites`), `/beta` (`link_beta` — actif sur /beta), `/tarification` (`link_tarification`).
  * CTA : `cta_open_console` → `/console` (si non-auth, guard côté app vers `/login`, hors périmètre ici).
  * Focus-visible AA, hover 120 ms, logo cliquable `/` (`topbar_logo`).
* **Bandeau d’alerte** : `banner_limited` = « Ouverture limitée — 5 équipes sélectionnées. »
* **Page /beta**

  * **Hero** : `hero_title`, `hero_subtitle`, bullets `hero_b1..b3`, micro‐copy `hero_micro`.
  * **CTA principal** : `cta_apply_beta` → ancre `#form`.
  * **Sticky CTA** : `cta_apply_sticky` qui apparaît après \~400px de scroll.
  * **Sections** : Pourquoi, Ce que vous obtenez, Éligibilité, Déroulé, Cas d’usage, FAQ.
  * **Formulaire** : champs *Coordonnées/Projet/Engagement* avec IDs `field_*`, bouton `submit_apply`, états `state_sending`, `state_sent`.
  * **Erreurs** (texte) : `err_required`, `err_email`, `err_checkbox` (présentes en sr-only pour CI).
* **Page /beta/merci**

  * `thanks_title`, `thanks_text`, `thanks_c1..c3`, CTA `thanks_cta` → `/vision` (ou page vision/produit si dispo).

### 1.3 Tests/plan

* *Given repo*, *When* CI lit `arka-meta/codex/page-beta/`, *Then* les **6 fichiers** existent (size>0) et passent jq/yq/grep.
* *Given* `codex_ui_map.yml`, *When* contrôle, *Then* pages `{beta, beta_thanks}` + layout topbar + sticky CTA déclaré.
* *Given* `codex_selectors.json`, *When* contrôle, *Then* le **set minimal + page beta** est présent (voir §2.2).
* *Given preview*, *When* smokes UI, *Then* `200` sur `/beta` et `/beta/merci`; `link_beta` a `aria-current="page"` sur `/beta`.
* *Given intégration*, *When* inspection, *Then* tous éléments interactifs ont **data-codex-id** stables.

### 1.4 Évidences à fournir

* PNG **1920px** : `beta_hero.png`, `beta_form.png`, `beta_faq.png`, `beta_thanks.png`.
* **Preview URL** (Vercel) montrant `/beta` et `/beta/merci`.
* `arka-meta/reports/codex/R2_5/sha256sums.txt` (SHA des 6 fichiers + assets).
* Captures *inspect* montrant `data-codex-id` (topbar, hero, CTA, formulaire, merci).

### 1.5 Risques

* Drift **maquette ↔ copy/tokens** ; IDs instables ; sticky CTA absent ; contrastes AA non respectés.

---

## 2) Templates à livrer (copier‑coller)

> **Version** : R2.5 — placez ces 6 fichiers dans `arka-meta/codex/page-beta/`

### 2.1 `codex_ui_map.yml`

```yml
version: R2.5
layout:
  topbar:
    logo: { id: topbar_logo, href: "/" }
    links:
      - { id: link_fonctionnalites, href: "/fonctionnalites", text: "Fonctionnalités" }
      - { id: link_beta,            href: "/beta",             text: "Inscription à la bêta" }
      - { id: link_tarification,    href: "/tarification",     text: "Tarification" }
    cta: { id: cta_open_console, href: "/console", text: "Ouvrir la console" }
    banner: { id: banner_limited, text: "Ouverture limitée — 5 équipes sélectionnées." }

pages:
  beta:
    id: pg_beta
    hero:
      title:    { id: hero_title }
      subtitle: { id: hero_subtitle }
      bullets:
        - { id: hero_b1 }
        - { id: hero_b2 }
        - { id: hero_b3 }
      micro: { id: hero_micro }
      cta:   { id: cta_apply_beta, href: "#form", text: "👉 Candidater à la bêta" }
    sticky_cta:
      id: cta_apply_sticky
      threshold_px: 400
    sections:
      - why
      - get
      - eligibility
      - timeline
      - usecases
      - faq
    form:
      submit: { id: submit_apply, text: "👉 Envoyer ma candidature" }
      states:
        sending: { id: state_sending, text: "Envoi en cours…" }
        sent:    { id: state_sent,    text: "Candidature envoyée ✅" }
      errors:
        required: { id: err_required,  text: "Champ requis" }
        email:    { id: err_email,     text: "Format d’email invalide" }
        checks:   { id: err_checkbox,  text: "Merci de cocher les engagements nécessaires" }
      fields:
        - { id: field_first_name }
        - { id: field_last_name }
        - { id: field_email }
        - { id: field_org }
        - { id: field_role }
        - { id: field_timezone }
        - { id: field_problem }
        - { id: field_deliverable }
        - { id: field_stack }
        - { id: field_data_type }
        - { id: field_team_size }
        - { id: field_urgency }
        - { id: field_referent_ok }
        - { id: field_kpi_ok }
        - { id: field_privacy_ok }

  beta_thanks:
    id: pg_beta_thanks
    nodes:
      - { id: thanks_title }
      - { id: thanks_text }
      - { id: thanks_c1 }
      - { id: thanks_c2 }
      - { id: thanks_c3 }
      - { id: thanks_cta, href: "/vision", text: "Découvrir la vision Arka" }

redirects: []
auth:
  guards: []
```

### 2.2 `codex_selectors.json`

```json
{
  "$schema": "https://arka.dev/schemas/codex_selectors.schema.json",
  "version": "R2.5",
  "selectors": {
    "topbar_logo": "[data-codex-id='topbar_logo']",
    "link_fonctionnalites": "[data-codex-id='link_fonctionnalites']",
    "link_beta": "[data-codex-id='link_beta']",
    "link_tarification": "[data-codex-id='link_tarification']",
    "cta_open_console": "[data-codex-id='cta_open_console']",
    "banner_limited": "[data-codex-id='banner_limited']",

    "hero_title": "[data-codex-id='hero_title']",
    "hero_subtitle": "[data-codex-id='hero_subtitle']",
    "hero_b1": "[data-codex-id='hero_b1']",
    "hero_b2": "[data-codex-id='hero_b2']",
    "hero_b3": "[data-codex-id='hero_b3']",
    "hero_micro": "[data-codex-id='hero_micro']",
    "cta_apply_beta": "[data-codex-id='cta_apply_beta']",
    "cta_apply_sticky": "[data-codex-id='cta_apply_sticky']",

    "field_first_name": "[data-codex-id='field_first_name'], #field_first_name",
    "field_last_name": "[data-codex-id='field_last_name'], #field_last_name",
    "field_email": "[data-codex-id='field_email'], #field_email",
    "field_org": "[data-codex-id='field_org'], #field_org",
    "field_role": "[data-codex-id='field_role'], #field_role",
    "field_timezone": "[data-codex-id='field_timezone'], #field_timezone",
    "field_problem": "[data-codex-id='field_problem'], #field_problem",
    "field_deliverable": "[data-codex-id='field_deliverable'], #field_deliverable",
    "field_stack": "[data-codex-id='field_stack'], #field_stack",
    "field_data_type": "[data-codex-id='field_data_type'], #field_data_type",
    "field_team_size": "[data-codex-id='field_team_size'], #field_team_size",
    "field_urgency": "[data-codex-id='field_urgency'], #field_urgency",
    "field_referent_ok": "[data-codex-id='field_referent_ok'], #field_referent_ok",
    "field_kpi_ok": "[data-codex-id='field_kpi_ok'], #field_kpi_ok",
    "field_privacy_ok": "[data-codex-id='field_privacy_ok'], #field_privacy_ok",

    "submit_apply": "[data-codex-id='submit_apply']",
    "state_sending": "[data-codex-id='state_sending']",
    "state_sent": "[data-codex-id='state_sent']",

    "err_required": "[data-codex-id='err_required']",
    "err_email": "[data-codex-id='err_email']",
    "err_checkbox": "[data-codex-id='err_checkbox']",

    "thanks_title": "[data-codex-id='thanks_title']",
    "thanks_text": "[data-codex-id='thanks_text']",
    "thanks_c1": "[data-codex-id='thanks_c1']",
    "thanks_c2": "[data-codex-id='thanks_c2']",
    "thanks_c3": "[data-codex-id='thanks_c3']",
    "thanks_cta": "[data-codex-id='thanks_cta']"
  },
  "deprecated_ids": []
}
```

### 2.3 `tokens.json`

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
    "success": "#10B981",
    "danger": "#E11D48",
    "warning": "#F59E0B",
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
  "motion": { "durations": { "fast":120, "normal":240, "slow":300 }, "stagger": 60, "easing": "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  "layout": { "container.maxWidth": 1280, "sidebar.width.md": 320, "grid.gap": 16 }
}
```

### 2.4 `copy_catalog.json`

```json
{
  "$schema": "https://arka.dev/schemas/copy_catalog.json",
  "version": "R2.5",
  "locale": "fr-FR",
  "brand": { "name": "Arka" },
  "layout_topbar": {
    "links": { "fonctionnalites": "Fonctionnalités", "beta": "Inscription à la bêta", "tarification": "Tarification" },
    "cta_open_console": "Ouvrir la console",
    "banner_limited": "Ouverture limitée — 5 équipes sélectionnées."
  },
  "beta": {
    "hero_title": "Bêta privée Arka — 5 équipes seulement",
    "hero_subtitle": "1 → 5 → 1 : une seule console qui se divise en 5 rôles et reforme une équipe (AGP, PMO, QA/ARC, UX/UI, Codex) pour accélérer vos projets réels.",
    "bullets": [
      "Orchestration d’agents, pas un bot isolé.",
      "Un résultat par sprint : cadrage, prototype ou mise en prod légère.",
      "Accompagnement humain pendant la bêta."
    ],
    "cta_apply": "👉 Candidater à la bêta",
    "micro": "Réponse sous 72 h • Pas de spam • Vos données restent chez vous",
    "form": {
      "groups": ["Coordonnées", "Projet", "Engagement"],
      "labels": {
        "first_name": "Prénom*",
        "last_name": "Nom*",
        "email": "Email pro*",
        "org": "Organisation / Projet*",
        "role": "Rôle (PO/PM/CTO/Founder/Autre)*",
        "timezone": "Pays & fuseau horaire*",
        "problem": "Quel problème souhaitez‑vous résoudre ?*",
        "deliverable": "Livrable visé en 4 semaines*",
        "stack": "Stack / outils actuels (libre)",
        "data_type": "Données utilisées*",
        "team_size": "Équipe impliquée (1–5 personnes)*",
        "urgency": "Urgence (à livrer sous…)*",
        "referent_ok": "Je peux être référent ~4 h/sem",
        "kpi_ok": "J’accepte la collecte de KPIs d’usage pendant la bêta",
        "privacy_ok": "J’accepte la charte de confidentialité Arka"
      },
      "submit": "👉 Envoyer ma candidature",
      "states": { "sending": "Envoi en cours…", "sent": "Candidature envoyée ✅" },
      "errors": {
        "REQUIRED": "Champ requis",
        "EMAIL": "Format d’email invalide",
        "CHECKS": "Merci de cocher les engagements nécessaires"
      }
    },
    "faq": [
      { "q": "La bêta est-elle payante ?", "a": "Non pour l’accès logiciel et l’accompagnement standard. Des coûts matériels peuvent s’appliquer si vous demandez l’ArkaBox physique (optionnelle)." },
      { "q": "Où vont mes données ?", "a": "Nous privilégions des données anonymisées ou des jeux de test. Par défaut, vos données ne sont pas stockées par Arka au-delà de la session, sauf si vous l’autorisez (journalisation de test). Un accord de NDA est possible sur demande." },
      { "q": "Faut-il des développeurs ?", "a": "Pas obligatoire. L’équipe ‘Codex’ peut proposer des pseudo-PR et exemples de scripts ; vous validez/intégrez côté code si nécessaire." },
      { "q": "Hardware requis ?", "a": "Un navigateur récent, un micro pour les tests vocaux. L’ArkaBox est optionnelle." },
      { "q": "Combien de temps avant une réponse ?", "a": "Sous 72 h après envoi du formulaire." },
      { "q": "Que se passe-t-il après la bêta ?", "a": "Vous gardez vos playbooks et productions. Un programme early adopters (tarif préférentiel) sera proposé aux équipes souhaitant continuer." }
    ]
  },
  "thanks": {
    "title": "Merci — votre candidature est bien envoyée ✅",
    "text": "Nous revenons vers vous sous 72 h.",
    "bullets": [
      "préparez un exemple de données (anonymisé)",
      "listez 1 à 3 résultats concrets visés en 4 semaines",
      "identifiez votre référent (4 h/sem)"
    ],
    "cta": "Découvrir la vision Arka"
  }
}
```

### 2.5 `motion_spec.md`

```md
# Motion Spec — Page Bêta (R2.5)

- **Topbar hover** : 120ms, easing out.
- **Hero in** : fade + slight scale 1.02 → 1.0, 240ms.
- **Bullets** : stagger 60ms.
- **Sticky CTA** : apparition/disp., fade-slide (Y:8px), 180ms.
- **Focus ring** : 120ms (opacité 1 → 0.9), toujours visible au clavier.
```

### 2.6 `a11y_notes.md`

```md
# Accessibilité — Page Bêta (R2.5)

- **Focus** : `:focus-visible` sur liens/boutons/inputs ; anneau AA >= 4.5:1.
- **Nav** : `aria-current="page"` sur le lien actif.
- **Formulaire** :
  - Associer `label[for]` ↔ `id` ; erreurs via `aria-invalid` + `aria-describedby`.
  - Zone d'état envoi/succès avec `aria-live="polite"`.
  - Cibles min 40×40px ; ordre tab logique.
- **Images** : décoratives `alt=""`, signifiantes `alt` descriptif.
- **Couleurs** : texte sur `#151F27`/`#0C1319` ≥ AA ; anneau `ring-slate-700/60`.
```

---

## 3) Patch d’instrumentation — extrait JSX (Preview/App)

> À placer dans vos composants si besoin d’exposer **data-codex-id**

```jsx
// Topbar
<Link href="/" data-codex-id="topbar_logo"><img src="/arka-logo-blanc.svg" alt="Arka" /></Link>
<a data-codex-id="link_fonctionnalites" href="/fonctionnalites">Fonctionnalités</a>
<a data-codex-id="link_beta" href="/beta" aria-current="page">Inscription à la bêta</a>
<a data-codex-id="link_tarification" href="/tarification">Tarification</a>
<a data-codex-id="cta_open_console" href="/console">Ouvrir la console</a>
<p data-codex-id="banner_limited">Ouverture limitée — 5 équipes sélectionnées.</p>

// Hero
<h1 data-codex-id="hero_title">Bêta privée Arka — 5 équipes seulement</h1>
<p data-codex-id="hero_subtitle">…</p>
<li data-codex-id="hero_b1">Orchestration d’agents…</li>
<li data-codex-id="hero_b2">Un résultat par sprint…</li>
<li data-codex-id="hero_b3">Accompagnement humain…</li>
<p data-codex-id="hero_micro">Réponse sous 72 h…</p>
<a data-codex-id="cta_apply_beta" href="#form">👉 Candidater à la bêta</a>
<a data-codex-id="cta_apply_sticky" href="#form">Candidater à la bêta</a>

// Form fields (exemples)
<input data-codex-id="field_first_name" id="field_first_name" />
<select data-codex-id="field_role" id="field_role" />
<textarea data-codex-id="field_problem" id="field_problem" />
<input type="checkbox" data-codex-id="field_referent_ok" id="field_referent_ok" />
<button data-codex-id="submit_apply">👉 Envoyer ma candidature</button>
<output data-codex-id="state_sending" aria-live="polite">Envoi en cours…</output>
<output data-codex-id="state_sent" aria-live="polite">Candidature envoyée ✅</output>
<span data-codex-id="err_required" className="sr-only">Champ requis</span>
<span data-codex-id="err_email" className="sr-only">Format d’email invalide</span>
<span data-codex-id="err_checkbox" className="sr-only">Merci de cocher les engagements nécessaires</span>

// Page Merci
<h1 data-codex-id="thanks_title">Merci — votre candidature est bien envoyée ✅</h1>
<p data-codex-id="thanks_text">Nous revenons vers vous sous 72 h.</p>
<li data-codex-id="thanks_c1">préparez un exemple…</li>
<li data-codex-id="thanks_c2">listez 1 à 3 résultats…</li>
<li data-codex-id="thanks_c3">identifiez votre référent…</li>
<a data-codex-id="thanks_cta" href="/vision">Découvrir la vision Arka</a>
```

---

## 4) Contrôles CI (à coller dans votre pipeline)

```bash
# Présence / validité des fichiers
jq -e '.colors and .typography' arka-meta/codex/page-beta/tokens.json

(test -s arka-meta/codex/page-beta/copy_catalog.json) && jq -e '.beta.hero_title and .layout_topbar.links and .thanks.title' arka-meta/codex/page-beta/copy_catalog.json

(test -s arka-meta/codex/page-beta/motion_spec.md) && grep -Ei '120ms|180ms|240ms|stagger' arka-meta/codex/page-beta/motion_spec.md

(test -s arka-meta/codex/page-beta/a11y_notes.md) && grep -i 'focus-visible' arka-meta/codex/page-beta/a11y_notes.md

yq -e '.pages.beta and .pages.beta_thanks and .layout.topbar and .pages.beta.form.fields' arka-meta/codex/page-beta/codex_ui_map.yml

jq -e '.selectors.hero_title and .selectors.cta_apply_beta and .selectors.field_email and .selectors.submit_apply and .selectors.thanks_title' arka-meta/codex/page-beta/codex_selectors.json

# Assets obligatoires
[ -s public/arka-logo-blanc.svg ] && [ -s public/favicon.ico ]

# Évidences (SHA)
mkdir -p arka-meta/reports/codex/R2_5
sha256sum arka-meta/codex/page-beta/* public/arka-logo-blanc.svg public/favicon.ico > arka-meta/reports/codex/R2_5/sha256sums.txt
```

---

## 5) Notes d’implémentation

* **Couleurs/typo** alignées Console : bg `#0C1319`, blocks `#151F27`, border `#1F2A33`, Poppins 400→800.
* **Copy** : privilégier *« bêta »* (pas d’ancienne terminologie) ; CTA principal et sticky cohérents.
* **Motion** : 240 ms hero, 60 ms stagger, 180 ms sticky CTA.
* **A11y** : champs labelisés, erreurs reliées, `aria-current` sur nav active.

---

## 6) Checklists DoR / DoD

**Definition of Ready (UX)**

* [ ] Les 6 fichiers existent dans `arka-meta/codex/page-beta/` (non vides).
* [ ] Assets logo & favicon présents.
* [ ] IDs `data-codex-id` recensés dans `codex_selectors.json` (incl. form + thanks).

**Definition of Done (MR)**

* [ ] CI verte (jq/yq/grep + SHA).
* [ ] Preview Vercel avec `/beta` et `/beta/merci`.
* [ ] PNG 1920px déposés.
* [ ] Captures *inspect* montrant `data-codex-id` sur topbar/hero/form/merci.
