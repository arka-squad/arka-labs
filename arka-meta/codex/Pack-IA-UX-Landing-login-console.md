# Norme — Pack IA UX (Codex‑ready) v1.0

# Norme — Pack IA UX (Codex‑ready) v1.0

**But**: Garantir que Codex reconstruise l'UI **ISO maquettes** sans accès Figma via un **Pack IA** complet, versionné dans le repo.

**Portée**: **IN**: Landing (hotfix), Console, Login. **OUT**: refonte visuelle globale, backend/API.

---

## Cadrage (à appliquer tel quel)

* **Contrats**

  * Chemin unique des livrables: `arka-meta/codex/`
  * Fichiers obligatoires (**6**): `tokens.json`, `copy_catalog.json`, `motion_spec.md`, `a11y_notes.md`, `codex_ui_map.yml`, `codex_selectors.json`
  * Assets obligatoires: `public/arka-logo-blanc.svg`
  * Nommage IDs (**data-codex-id**): *kebab\_case* stable, scope clair (ex: `nav_dashboard`, `topbar_logout`)
  * Le GPT est cloisonné: **TOUT** ce dont Codex a besoin vit dans le repo (**zéro dépendance Figma**)

* **Livrables UX**

  * **tokens.json**: couleurs/typo/rayons/gradients/spacing/shadow/motion (durations, easings)
  * **copy\_catalog.json**: libellés FR exacts (CTA, erreurs login, nav, tooltips) — inclut exclusivement *« bêta »*
  * **motion\_spec.md**: transitions onglets **200–300ms**, **stagger 60ms**, easing standard; switch projet
  * **a11y\_notes.md**: focus-visible, aria-current, aria-live toasts, cibles **40×40**, contrastes **AA**
  * **codex\_ui\_map.yml**: plan des pages/onglets/redirects/guards (voir *Template*)
  * **codex\_selectors.json**: mapping data-codex-id → sélecteurs CSS testables (voir *Template*)

* **Exigences pages**

  * **Landing**

    * Topbar: liens réels `/fonctionnalites`, `/beta` (ex‑sécurité), `/tarification`
    * CTA *« Ouvrir la console »* → `/console` ; non‑auth → `/login` (**guard**)
    * Redirect permanent `/securite` → `/beta`
    * Footer: garder *« Rejoignez… »* ; **supprimer** 2 phrases bannies; CTA *« bêta »* partout
  * **Console**

    * Topbar: logo (`/`), titre *« Console »*, project selector (placeholder si 0), toggles thème/paramètres → **overlay pending**, Logout si auth
    * Nav: Dashboard, Chat, Documents, Prompt Builder, Observabilité (+ hover/focus **AA**)
    * Animations: changement d’onglet (**240ms**), switch projet (stagger/skeleton)
  * **Login**

    * États: normal, **401 INVALID\_CREDENTIALS**, **401 INVALID\_PASSWORD**, erreur réseau, reset
    * Post‑login: redirection `/console` ; *« Se connecter »* retiré; Logout en topbar

* **Tests/plan**

  * *Given repo*, *When* CI lit `arka-meta/codex/`, *Then* les **6 fichiers** existent (size>0) et sont valides (jq/yq).
  * *Given* `ui_map.yml`, *When* contrôle, *Then* pages {landing, console, login}, redirects {/securite→/beta}, guard {/console→/login} sont présents.
  * *Given* `selectors.json`, *When* contrôle, *Then* le set minimal est présent: `[topbar_logo, topbar_logout, project_selector, nav_dashboard, nav_chat, nav_documents, nav_prompt_builder, nav_observabilite, btn_theme, btn_settings, login_email, login_password, login_submit, login_error, link_reset, cta_open_console, link_fonctionnalites, link_beta, link_tarification]`.
  * *Given preview*, *When* smokes UI, *Then* `200` sur `/fonctionnalites,/beta,/tarification`; `/securite→301/308 /beta`; non‑auth `/console→/login`; landing texte *« bêta »* présent sans mention de l’ancienne terminologie.
  * *Given intégration*, *When* inspection, *Then* tous éléments interactifs ont **data-codex-id** stables (`selectors.json`).

* **Évidences**

  * Exports PNG **1920px**: `console_[tab].png`, `login_[state].png`, `landing.png`
  * **Preview Vercel URL**
  * `arka-meta/reports/codex/R2_5/sha256sums.txt` (SHA des 6 fichiers + assets)
  * Captures *inspect* montrant **data-codex-id** (nav, topbar, login)

* **Risques**

  * Drift maquette ↔ tokens/copy (désalignement texte/couleurs)
  * IDs instables (renommage casse Codex/QA)
  * Redirects/guards manquants (landing/console/login)

* **Next step**: UX produit le Pack IA conforme à ce cadrage dans une MR dédiée; PMO coche **DoR**; Codex intègre.

## Checklists DoR/DoD

**Definition of Ready (UX)**

* [ ] Figma à jour (view + prototype), mais non nécessaire à Codex
* [ ] 6 fichiers du Pack IA présents dans `arka-meta/codex/`
* [ ] Assets logo & favicon en place
* [ ] `codex_ui_map.yml` contient pages, redirects, guards, transitions
* [ ] `codex_selectors.json` couvre le set minimal + composants ajoutés

**Definition of Done (MR)**

* [ ] CI verte avec contrôles ci‑dessus
* [ ] Preview Vercel fournie
* [ ] PNG 1920px déposés
* [ ] SHA listés dans `arka-meta/reports/codex/R2_5/sha256sums.txt`
* [ ] Captures *inspect* avec `data-codex-id` (nav, topbar, login)


# 📦 Pack IA — R2.5 (Codex‑ready)

> **But**: permettre à Codex de reconstruire l’UI **ISO maquettes** sans accès Figma. **Tout** le nécessaire vit dans le repo.

```
arka-meta/
└─ codex/
   ├─ tokens.json
   ├─ copy_catalog.json
   ├─ motion_spec.md
   ├─ a11y_notes.md
   ├─ codex_ui_map.yml
   └─ codex_selectors.json
public/
└─ assets/logo/arka-logo-blanc.svg
```



---

## 7) Contrôles CI (à copier dans votre pipeline)

```bash
# Présence / validité des fichiers
jq -e '.colors and .typography' codex/tokens.json

(test -s codex/copy_catalog.json) && jq -e '.login.errors and .cta_open_console? // .landing.cta_open_console' codex/copy_catalog.json

(test -s codex/motion_spec.md) && grep -Ei '200ms|240ms|300ms|stagger' codex/motion_spec.md

(test -s codex/a11y_notes.md) && grep -i 'focus-visible' codex/a11y_notes.md

yq -e '.pages.landing and .pages.console and .pages.login and .redirects and .auth.guards' codex/codex_ui_map.yml

jq -e '.selectors.topbar_logo and .selectors.nav_observabilite and .selectors.login_submit and .selectors.cta_open_console' codex/codex_selectors.json

# Assets obligatoires
[ -s public/arka-logo-blanc.svg ] && [ -s public/favicon.ico ]

# Évidences
mkdir -p arka-meta/reports/codex/R2_5
sha256sum codex/* public/arka-logo-blanc.svg public/favicon.ico > arka-meta/reports/codex/R2_5/sha256sums.txt
```

---

### Notes d’implémentation

* **Couleurs** & **radii** alignés avec la preview Console (bg `#0C1319`, blocks `#151F27`, border `#1F2A33`).
* **Typo**: Poppins (400→800). H1≈36, H2≈24, corps 14–16.
* **Motion**: onglets 240 ms; stagger 60 ms.
* **A11y**: focus-visible AA, aria-current sur tab actif, aria-live pour messages/erreurs.

> Dès que vous committez ces 6 fichiers + 2 assets, **Codex** peut intégrer et tester sans autre dépendance.

📦 Arka Console — Pack IA R2.5 (à copier dans arka-meta/)
1) codex/tokens.json
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
    "brand": "linear-gradient(135deg, #FAB652 0%, #F25636 50%, #E0026D 100%)",
    "kpi.ttft": "linear-gradient(135deg, #FAB652 0%, #F25636 60%)",
    "kpi.rtt": "linear-gradient(135deg, #F25636 0%, #E0026D 100%)",
    "kpi.err": "linear-gradient(135deg, #E0026D 0%, #E0026D 100%)"
  },
  "typography": {
    "font.family": "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    "sizes": { "xs":12, "sm":14, "base":16, "lg":18, "xl":20, "2xl":24, "3xl":30, "4xl":36 },
    "weights": { "regular":400, "medium":500, "semibold":600, "bold":700, "extrabold":800 },
    "lineHeights": { "tight":1.15, "snug":1.25, "normal":1.45 }
  },
  "radius": { "sm":8, "md":12, "lg":16, "xl":20 },
  "spacing": { "xs":4, "sm":8, "md":12, "lg":16, "xl":20, "2xl":24, "3xl":32, "4xl":40 },
  "shadows": {
    "card": "0 6px 16px rgba(0,0,0,0.35)",
    "elevated": "0 10px 30px rgba(0,0,0,0.45)"
  },
  "motion": {
    "durations": { "fast":120, "normal":240, "slow":300 },
    "stagger": 60,
    "easing": "cubic-bezier(0.2, 0.8, 0.2, 1)"
  },
  "layout": {
    "container.maxWidth": 1280,
    "sidebar.width.md": 320,
    "grid.gap": 16
  }
}

2) codex/copy_catalog.json
{
  "locale": "fr-FR",
  "brand": { "name": "Arka" },
  "nav": {
    "dashboard": "Dashboard",
    "chat": "Chat",
    "documents": "Documents",
    "prompt": "Prompt Builder",
    "observabilite": "Observabilité"
  },
  "topbar": {
    "title_console": "Console",
    "project_selector_empty": "Aucun projet — créez-en un",
    "theme": "Thème",
    "settings": "Configuration",
    "logout": "Se déconnecter"
  },
  "landing": {
    "links": {
      "fonctionnalites": "Fonctionnalités",
      "beta": "Inscription à la bêta",
      "tarification": "Tarification"
    },
    "cta_open_console": "Ouvrir la console",
    "cta_primary": "Inscrivez-vous à la bêta"
  },
  "login": {
    "email": "Email",
    "password": "Mot de passe",
    "submit": "Se connecter",
    "forgot": "Mot de passe oublié ?",
    "errors": {
      "INVALID_CREDENTIALS": "Identifiants inconnus. Vérifiez votre email.",
      "INVALID_PASSWORD": "Mot de passe invalide.",
      "NETWORK": "Erreur réseau. Réessayez dans un instant."
    }
  },
  "documents": {
    "title": "Documents",
    "drop_hint": "Glisser-déposer vos fichiers ici ou",
    "choose_files": "Choisir des fichiers"
  },
  "prompt": {
    "title": "Prompt Builder — PMO Wake-up",
    "generate": "Générer le prompt",
    "save": "Enregistrer"
  },
  "obs": { "title": "Observabilité — Squad Digital" },
  "kpis": {
    "lead_time": "Lead Time (p90)",
    "deploy_freq": "Deployment Freq.",
    "cfr": "Change Failure Rate",
    "mttr_p1": "MTTR P1"
  }
}

3) codex/motion_spec.md
# Motion Spec — R2.5

- **Changement d’onglet (Console)** : `duration=240ms`, `easing=cubic-bezier(0.2,0.8,0.2,1)`
  - Effet : `fadeIn + slideUp (8px)` sur le panneau principal.
- **Hover Nav** : `duration=120ms` (accent/gradient), `easing=out`.
- **Changement de projet** : Stagger `60ms` sur les cartes + éventuel `skeleton` 200ms.
- **Overlays (pending settings/theme)** : `fade` 180ms in/out.
- **Focus ring** : apparition `120ms`, opacité 1 → 0.9 (AA visible).

4) codex/a11y_notes.md
# Accessibilité — R2.5

- Focus : utiliser `:focus-visible` sur tous liens/boutons (contraste AA ≥ 4.5:1).
- Nav tabs : indiquer l’onglet actif via `aria-current="page"`.
- Toasts/erreurs : zone `aria-live="polite"`.
- Cibles interactives : min 40×40 px.
- Images décoratives : `alt=""` ; images signifiantes : `alt` descriptif.
- Couleurs : texte sur `#151F27` et `#0C1319` ≥ AA ; anneau de focus `ring-slate-700/60`.

5) codex/codex_ui_map.yml
pages:
  landing:
    id: pg_landing
    topbar_links:
      - { id: link_fonctionnalites, href: "/fonctionnalites", text: "Fonctionnalités" }
      - { id: link_beta,            href: "/beta",             text: "Inscription à la bêta" }
      - { id: link_tarification,    href: "/tarification",     text: "Tarification" }
    cta_primary: { id: cta_open_console, href: "/console", text: "Ouvrir la console" }
  console:
    id: pg_console
    auth_required: true
    topbar:
      title: "Console"
      logo:   { id: topbar_logo, href: "/" }
      logout: { id: topbar_logout }
      project_selector: { id: project_selector, empty_placeholder: "Aucun projet — créez-en un" }
      feature_toggles:
        - { id: btn_theme, action: "overlay_pending" }
        - { id: btn_settings, action: "overlay_pending" }
    nav_tabs:
      - { id: nav_dashboard,      text: "Dashboard" }
      - { id: nav_chat,           text: "Chat" }
      - { id: nav_documents,      text: "Documents" }
      - { id: nav_prompt_builder, text: "Prompt Builder" }
      - { id: nav_observabilite,  text: "Observabilité" }
    transitions:
      tab_change: { duration_ms: 240, easing: "standard" }
      project_change: { stagger_ms: 60 }
  login:
    id: pg_login
    widgets:
      email:    { id: login_email }
      password: { id: login_password }
      submit:   { id: login_submit, text: "Se connecter" }
      error:    { id: login_error }
      reset:    { id: link_reset, href: "/reset" }
redirects:
  - { from: "/securite", to: "/beta", type: "permanent" }
auth:
  guards:
    - { protected: "/console", unauth_redirect: "/login" }

6) codex/codex_selectors.json
{
  "selectors": {
    "topbar_logo": "[data-codex-id='topbar_logo']",
    "topbar_logout": "[data-codex-id='topbar_logout']",
    "project_selector": "[data-codex-id='project_selector']",
    "btn_theme": "[data-codex-id='btn_theme']",
    "btn_settings": "[data-codex-id='btn_settings']",

    "nav_dashboard": "[data-codex-id='nav_dashboard']",
    "nav_chat": "[data-codex-id='nav_chat']",
    "nav_documents": "[data-codex-id='nav_documents']",
    "nav_prompt_builder": "[data-codex-id='nav_prompt_builder']",
    "nav_observabilite": "[data-codex-id='nav_observabilite']",

    "login_email": "[data-codex-id='login_email']",
    "login_password": "[data-codex-id='login_password']",
    "login_submit": "[data-codex-id='login_submit']",
    "login_error": "[data-codex-id='login_error']",
    "link_reset": "[data-codex-id='link_reset']",

    "cta_open_console": "[data-codex-id='cta_open_console']",
    "link_fonctionnalites": "[data-codex-id='link_fonctionnalites']",
    "link_beta": "[data-codex-id='link_beta']",
    "link_tarification": "[data-codex-id='link_tarification']"
  }
}

7) Assets obligatoires (racine du projet)

public/assets/logo/arka-logo-blanc.svg

public/favicon.ico

🔧 Patch « instrumentation » de ta preview (extraits à coller)

Dans Arka Console — Preview R1 (all-in-one), ajoute les attributs :

/* Topbar */
<img
  data-codex-id="topbar_logo"
  src="https://arka-liard.vercel.app/assets/logo/arka-logo-blanc.svg"
  alt="Arka logo"
  className="h-9 w-auto"
/>

<select
  data-codex-id="project_selector"
  aria-label="Projet actif"
  value={project}
  onChange={(e) => setProject(e.target.value)}
  className="rounded-xl border px-3 py-2 text-sm"
  style={{ background: "#151F27", borderColor: "#1F2A33" }}
/>

<button
  data-codex-id="btn_theme"
  onClick={() => setDark(!dark)}
  className="rounded-xl border p-2"
  style={{ background: "#151F27", borderColor: "#1F2A33" }}
  aria-label="Basculer le thème"
>
  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
</button>

<button
  data-codex-id="btn_settings"
  className="rounded-xl border p-2"
  style={{ background: "#151F27", borderColor: "#1F2A33" }}
  aria-label="Paramètres"
>
  <Settings className="h-4 w-4" />
</button>

/* Nav items */
{[
  { id: "dashboard", label: "Dashboard", sel: "nav_dashboard" },
  { id: "chat", label: "Chat", sel: "nav_chat" },
  { id: "documents", label: "Documents", sel: "nav_documents" },
  { id: "prompt", label: "Prompt Builder", sel: "nav_prompt_builder" },
  { id: "obs", label: "Observabilité", sel: "nav_observabilite" }
].map((i) => (
  <li key={i.id}>
    <button
      data-codex-id={i.sel}
      onClick={() => setTab(i.id)}
      aria-current={tab === i.id ? "page" : undefined}
      className={`w-full rounded-xl px-3 py-2 text-left outline-none ring-2 ring-transparent ${tab === i.id ? "text-white shadow" : ""}`}
      style={tab === i.id ? { background: GRADIENT, border: "1px solid transparent" } : { background: "#151F27", border: "1px solid #1F2A33", color: "#E5E7EB" }}
    >
      {i.label}
    </button>
  </li>
))}

/* Landing CTA – si tu l’as dans une page dédiée, marquer aussi : */
<a data-codex-id="cta_open_console" href="/console" className="...">Ouvrir la console</a>
/* Et dans la landing : data-codex-id pour link_fonctionnalites, link_beta, link_tarification */

/* Login (si tu remontes la page login dans cette preview, exemple d’IDs) */
<input data-codex-id="login_email" ... />
<input data-codex-id="login_password" ... />
<button data-codex-id="login_submit">Se connecter</button>
<p role="alert" aria-live="polite" data-codex-id="login_error" />
<a data-codex-id="link_reset" href="/reset">Mot de passe oublié ?</a>

✅ CI / Evidences (copier dans ton pipeline)
# Présence / validité
jq -e '.colors and .typography' arka-meta/codex/tokens.json
test -s arka-meta/codex/copy_catalog.json && jq -e '.login.errors and .landing.cta_open_console' arka-meta/codex/copy_catalog.json
test -s arka-meta/codex/motion_spec.md && grep -Ei '200ms|240ms|300ms|stagger' arka-meta/codex/motion_spec.md
test -s arka-meta/codex/a11y_notes.md && grep -i 'focus-visible' arka-meta/codex/a11y_notes.md
yq -e '.pages.landing and .pages.console and .pages.login and .redirects and .auth.guards' arka-meta/codex/codex_ui_map.yml
jq -e '.selectors.topbar_logo and .selectors.nav_observabilite and .selectors.login_submit and .selectors.cta_open_console' arka-meta/codex/codex_selectors.json

# Assets
[ -s public/arka-logo-blanc.svg ] && [ -s public/favicon.ico ]

# SHA (évidences)
mkdir -p arka-meta/reports/codex/R2_5
sha256sum arka-meta/codex/* public/arka-logo-blanc.svg public/favicon.ico > arka-meta/reports/codex/R2_5/sha256sums.txt
