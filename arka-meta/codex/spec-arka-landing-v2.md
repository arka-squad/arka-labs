Voici une intégration graphique à effectuer pour la landing, attention :

Séparation stricte Marketing vs Cockpit - Deux “shells” :
Marketing (light) : / → stack Next.js + Tailwind, variables :root (ci‑dessus), feuilles dédiées (cascade layers reset → base → components → utilities).
Cockpit (dark) : /cockpit/** → layout isolé
L'intégration a déjà commencée mais n'est absolument pas complete et aproximative, Verifi et annalyse l'architecture technique d'intégration pour bien prendre en compte ce qui est fait et bien séparer la partie "marketing" du reste "Cockpit", 


Le fichier des specifications complete se trouve à cette endroit : arka-meta\codex\spec-arka-landing-v2.md

Le fichier est découpé en section, il y a égualement un passage dédié au comportement des 2 slider. 

spec du fichier à intégrer : local\arka-codex\agent\Docs\Projet-obj\spec-inte-landing.m

peut tu annalyser tout ca et me preparer les issues.

je joint une capture d'acran, "attention les texte ne sont pas correcte sur cette capture, pour le contenu il faut se referé uniquement au document arka-meta\codex\spec-arka-landing-v2.md " 



Landing Arka — Spécification ultra‑détaillée (v1.0)

Scope figé : page Landing (publique, SEO), thème clair. Sections : Header, Hero (#0b1015), KPI strip, En clair, Nos agents (slider), Exemples, Fonctionnalités, Où vit le projet (slider), Preuve, Pour qui, Footer.
Contraintes : BG global #e3e0db, typo Poppins, gradient brand (FAB652 → F25636 → E0026D). LCP ≤ 2.5s (mobile 4G), CLS < 0.1, WCAG 2.1 AA.

0) Tokens & base CSS (landing clair)


```css

/* Fonts */
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&display=swap");

:root {
  /* Brand */
  --grad-start:#FAB652; --grad-mid:#F25636; --grad-end:#E0026D;
  --brand-grad: linear-gradient(135deg, var(--grad-start) 0%, var(--grad-mid) 50%, var(--grad-end) 100%);

  /* Surfaces */
  --bg:#e3e0db;          /* fond page */
  --surface:#FFFFFF;      /* cartes */
  --ink:#0F172A;          /* texte principal */
  --muted:#334155;        /* texte secondaire */
  --border: rgba(0,0,0,.06);

  /* Radii & depth */
  --r-lg: 16px; --r-xl: 20px; --shadow: 0 12px 24px rgba(15,23,42,.08);

  /* Container */
  --container: 90rem; /* 1440px */
}

html, body { background: var(--bg); color: var(--ink); font-family: Poppins, ui-sans-serif, system-ui, Arial; }
.container { max-width: var(--container); margin-inline: auto; padding-inline: 24px; }
.card { background: var(--surface); border:1px solid var(--border); border-radius: var(--r-xl); box-shadow: var(--shadow); }
.badge { display:inline-flex; align-items:center; gap:8px; border-radius:999px; padding:6px 12px; border:1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.10); color:#fff; backdrop-filter: blur(8px); }
.grad { background-image: var(--brand-grad); -webkit-background-clip:text; background-clip:text; color:transparent; }

Notes UI

Typo : titres 600/700, accents 900 (« mots clés » en Extra Black + texte en gradient oblique autorisé).

Do not: pas de radius sur hero block (aspect « Apple cadre carré »). Ailleurs radius 16–20px.


```






# Section 1 - Header (Topbar landing) — Spécification ultra‑détaillée (v1.0)

> **Concerne** : barre de navigation publique de la landing Arka. Thème clair, fond page `#e3e0db`.
> **Objectifs** : branding lisible, accès rapide aux ancres, CTA visibles, sticky, budgets perf/a11y/CLS respectés.

---

## 1) Rôle & position

* **Composant** : `Header` (alias `TopbarLanding`).
* **Landmark** : `<header role="banner" aria-label="En-tête du site">`.
* **Position** : sticky (toujours visible). `position: sticky; top: 0; z-index: 50;`.
* **Hauteur** : **56px** (Tailwind `h-14`) — **fixe** à tous les breakpoints.
* **Largeur** : 100% viewport, contenu centré par **container** (`max-w: 1440px` + `px-6`).
* **Contrainte CLS** : 0 (réserver la hauteur via classe utilitaire `h-14`).

---

## 2) Grille & layout

* **Structure** : `grid grid-cols-[auto_1fr_auto] items-center h-14 gap-4`.
* **Container** : wrapper `.container` (1440px max, `mx-auto px-6`).
* **Colonnes** :

  1. **Gauche** (auto) — logo.
  2. **Centre** (1fr) — navigation primaire (ancres) centrée.
  3. **Droite** (auto) — actions (CTA "Ouvrir le cockpit", "Se connecter").

---

## 3) Thème & tokens

* **Fond** : `rgba(227,224,219,0.80)` (sur `#e3e0db`) + `backdrop-filter: blur(8px)`.
* **Bordure bas** : `1px solid rgba(0,0,0,.08)`.
* **Texte** : principal `#0F172A`, secondaire `#334155`.
* **Hover** liens : `#0F172A` à 90% + soulignement fin (`underline-offset-4`).
* **CTA primaire** : fond **dégradé brand** (135°: `#FAB652 → #F25636 → #E0026D`), texte blanc, rayon **12px**.
* **CTA secondaire** : outline : `border: 1px solid rgba(15,23,42,.12)` + `bg-white/40` au hover.

---

## 4) Zone gauche : Logo

* `<a href="/" aria-label="Arka" class="inline-flex items-center h-8">`
* Visuel (texte vectoriel ou SVG) : **ARKA** avec **gradient brand** appliqué au texte.
* **Taille** : hauteur optique \~20px (contenant `h-8` pour zone cliquable ≥32px).
* **Hover** : opacité 100% (sinon 90%).

---

## 5) Zone centre : Navigation (ancres)

* **Balise** : `<nav aria-label="Navigation principale">`.
* **Liste** : `<ul class="flex items-center justify-center gap-6">` → `<li><a ...></a></li>`.
* **Entrées** (ordre exact) :

  * **Fonctionnalités** → `#features`
  * **Comment ça marche** → `#how` *(en v1 : ancre vers `#features`)*
  * **Tarifs** → `#pricing` *(placeholder v1, renvoie `#features`)*
  * **FAQ** → `#faq` *(placeholder footer)*
* **Stylie lien** : `text-sm font-medium text-[#334155] hover:text-[#0F172A] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded`.
* **Hit‑area** : padding `py-1.5 px-2.5` (≥ 32×32px).

---

## 6) Zone droite : Actions (CTA)

* **Bouton primaire** : **Ouvrir le cockpit**

  * `href="/cockpit?demo=1"` (v1 recommandé)
  * Classes : `inline-flex items-center gap-2 h-9 px-4 rounded-[12px] text-white` + `bg-[image:var(--brand-grad)]` + `shadow-[0_6px_16px_rgba(226,2,109,.22)]`.
  * Icône optionnelle : `Rocket` (lucide) 16px.
* **Bouton secondaire** : **Se connecter**

  * `href="/login"`
  * Classes : `inline-flex items-center h-9 px-3 rounded-[12px] border border-black/10 text-[#0F172A] hover:bg-white/60`.
* **Ordre visuel** desktop : secondaire **avant** primaire (pour dégager l’action forte en extrémité).
* **Tab order** : liens nav → `Se connecter` → `Ouvrir le cockpit`.

---

## 7) Accessibilité (AA)

* Contrastes : texte ≥ 4.5:1 sur fond translucide.
* **Focus clavier** : anneau `ring-2 ring-black/20` sur liens/CTA.
* **ARIA** :

  * `<header role="banner">` ; `<nav aria-label="Navigation principale">`.
  * Chaque lien a `aria-current="page"` si l’ancre correspond à la section visible (option v1.1 via observer).
* **Skip link** (option) : lien caché `Aller au contenu` en haut, visible au focus.

---

## 8) Responsivité

* **≥1280px** : layout défini ci‑dessus.
* **md (≥768px & <1280px)** : gap nav réduit (`gap-4`), CTA gardés entiers.
* **sm (<768px)** :

  * Nav bascule en **menu** (hamburger) : bouton à droite du logo, ouvre un **Sheet** pleine largeur.
  * Les CTA passent sous le menu dans le sheet (ordre : `Se connecter`, `Ouvrir le cockpit`).
  * **Hauteur** inchangée `h-14`.

---

## 9) API/Props (composant)

```ts
export type HeaderProps = {
  links?: { label: string; href: string }[]; // défaut: items section 5
  onOpenCockpit?: () => void;                // analytics
  onLogin?: () => void;                      // analytics
  sticky?: boolean;                          // défaut: true
};
```

* **Valeurs par défaut** : `links = [{label:'Fonctionnalités',href:'#features'}, ...]`, `sticky=true`.

---

## 10) États & micro‑interactions

* **Hover** liens : soulignement doux + teinte foncée.
* **CTA primaire** : légère **élévation** (`translateY(-1px)`) au hover.
* **Scroll** : dès `window.scrollY > 8` → renforce la bordure bas (`border-black/12`) pour lisibilité.
* **Reduced motion** : désactiver translateY, garder hover plat.

---

## 11) Télémétrie (facultatif)

* `landing.header.nav_click` (label)
* `landing.header.login_click`
* `landing.header.open_cockpit_click`

---

## 12) Tests d’acceptation (QA)

* Hauteur **56px** constante, aucun **CLS**.
* Liens nav **cliquables** (hit‑area ≥ 32×32), focus visibles.
* CTA : `Se connecter` → `/login`, `Ouvrir le cockpit` → `/cockpit?demo=1`.
* Sticky + blur OK ; bordure bas visible dès scroll > 8px.
* Mobile : menu hamburger remplace la nav ; CTA présents dans le sheet.
* Contrastes AA OK.

---

## 13) Exemple d’usage (exact)

```tsx
<Header
  onOpenCockpit={()=>telemetry('landing.header.open_cockpit_click')}
  onLogin={()=>telemetry('landing.header.login_click')}
/>
```

---

## 14) Extrait HTML/Tailwind (desktop)

```html
<header role="banner" class="sticky top-0 z-50 h-14 border-b border-black/10 bg-[rgba(227,224,219,0.8)] backdrop-blur">
  <div class="container h-full grid grid-cols-[auto_1fr_auto] items-center gap-4">
    <a href="/" aria-label="Arka" class="inline-flex items-center h-8 opacity-90 hover:opacity-100">
      <span class="text-lg font-semibold bg-gradient-to-br from-[#FAB652] via-[#F25636] to-[#E0026D] bg-clip-text text-transparent">arka</span>
    </a>
    <nav aria-label="Navigation principale" class="hidden sm:block">
      <ul class="flex items-center justify-center gap-6">
        <li><a href="#features" class="text-sm font-medium text-[#334155] hover:text-[#0F172A] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded py-1.5 px-2.5">Fonctionnalités</a></li>
        <li><a href="#how" class="text-sm font-medium text-[#334155] hover:text-[#0F172A] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded py-1.5 px-2.5">Comment ça marche</a></li>
        <li><a href="#pricing" class="text-sm font-medium text-[#334155] hover:text-[#0F172A] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded py-1.5 px-2.5">Tarifs</a></li>
        <li><a href="#faq" class="text-sm font-medium text-[#334155] hover:text-[#0F172A] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded py-1.5 px-2.5">FAQ</a></li>
      </ul>
    </nav>
    <div class="hidden sm:flex items-center gap-2">
      <a href="/login" class="inline-flex items-center h-9 px-3 rounded-[12px] border border-black/10 text-[#0F172A] hover:bg-white/60">Se connecter</a>
      <a href="/cockpit?demo=1" class="inline-flex items-center gap-2 h-9 px-4 rounded-[12px] text-white" style="background-image: linear-gradient(135deg,#FAB652 0%,#F25636 50%,#E0026D 100%);">Ouvrir le cockpit</a>
    </div>
    <!-- sm:< menu hamburger / sheet > -->
  </div>
</header>
```

---

## 15) Erreurs & fallback

* **Police non chargée** : conserver `font-family: Poppins, ui-sans-serif, system-ui, Arial` (stack systeme).
* **Blur non supporté** : laisser `background: rgba(227,224,219,0.92)` (lisible).
* **JS off (mobile)** : nav desktop masquée → prévoir menu simple en bas de page (liens répétés dans le footer) — option.




# Section 2 - Hero (bloc sombre #0b1015) — Spécification ultra‑détaillée (v1.0)

> **Concerne** : premier bloc de la landing (visuel fort + promesse + CTAs). Thème **sombre** local, page **claire** (`#e3e0db`). **Sans radius**, « gros bloc » plein‑largeur du container.

---

## 1) Rôle & objectifs

* **But** : délivrer la promesse en 5s, pousser l’essai (CTA) et annoncer le contexte (badge démo).
* **Composant** : `Hero`.
* **Landmark** : `<section id="hero" aria-label="Section de tête">`.
* **KPI** : LCP ≤ **2.5s** (mobile 4G), CLS **0**.

---

## 2) Thème & tokens

* **Fond** : `#0b1015`.
* **Texte** : principal `#FFFFFF`, secondaire `#D1D5DB` (≈ slate‑300), muted `#9CA3AF` (≈ slate‑400).
* **Gradient accent** (mots clés) : linear‑gradient(12deg, `#FAB652`, `#F25636` 50%, `#E0026D`).
* **Chips** : fond `rgba(255,255,255,.10)`, bord `rgba(255,255,255,.18)`, texte blanc.
* **CTA primaire** : gradient plein (même dégradé), texte blanc, **rayon 12px**.
* **CTA secondaire** : outline blanc 14% + hover `bg-white/10`.

---

## 3) Layout & grille

* **Container** : `.container` (max‑width 1440px, `px-6`).
* **Bloc** : `display:grid` 12 colonnes, `gap-x: 24px`.
* **Paddings** : `py-16` (sm), `py-20` (md), `py-24` (lg).
* **Colonnes** :

  * **Texte** (gauche) : `col-span-12 md:col-span-7`.
  * **Visuel** (droite) : `col-span-12 md:col-span-5`.
* **Sans radius** : pas d’arrondis sur le bloc héro (contraste avec cartes plus bas).

---

## 4) Contenus (texte validé)

* **Badge top** : `Cockpit v0.1.0-demo · Données de démo` (unique, pas de double badge).
* **Titre (H1)** :

  `Pilotez une équipe d’ <span class="accent">agents IA experts</span> — pas un assistant isolé.`

  * Police **Poppins** ; mots non accentués en `font‑semibold (600)` ; **accent** en `900` (Extra Black) + **gradient** (**sans italique**), **oblique 12°**.
* **Sous‑titre** (2–3 lignes) :

  `Avec Arka, vous ne dialoguez pas avec une machine. Vous dirigez une squad spécialisée : RH, Formation, Qualité, Organisation. Chaque agent IA est un expert dans son domaine, et tous travaillent ensemble, en ping‑pong, pour livrer mieux.`
* **Chips** (3) : `Experts, pas généralistes` · `Collaboration multi‑rôles` · `Mémoire souveraine`.
* **CTAs** :

  * **Primary** : `Entrer dans le cockpit` → **`/cockpit?demo=1`** (reco v1).
  * **Secondary** : `Voir la démo 90s` → `#demo` *(placeholder v1: `#features`)*.

---

## 5) Visuel (image droite)

* **Nature** : **PNG sans fond** (pas de cadre), `object-contain`.
* **Source** : `/assets/hero/arkabox-board` (formats **AVIF/WEBP/PNG**).
* **`srcset`** : `480 / 768 / 1200 / 1600` + `sizes="(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 560px"`.
* **Hauteurs** : `max-h-[360px] (sm)`, `max-h-[460px] (md)`, `max-h-[520px] (lg)`.
* **Préchargement** : `<link rel="preload" as="image" href="...avif" imagesizes="..." imagesrcset="...">` + `fetchpriority="high"` sur `<img>`.
* **Alt** : `alt="Aperçu du cockpit Arka – board et actions visibles"`.

---

## Section KPI (TTFT p95 / RTT p95 / Erreurs p95) — Spécification ultra‑détaillée v1.0

> **Concerne** : les **3 tuiles** graphiques sous le hero de la landing. Thème clair, métriques normalisées **ms / %** avec **arrondi 1 décimale**.
> **Objectifs** : lisibilité immédiate, style cohérent, zéro CLS, perfs maîtrisées.

---

### 1) Rôle & structure

* **Composant** : `KpiBlock` (x3).
* **Contenu** :

  1. **Label** (ex. `TTFT p95`) — en **uppercase xs** gris.
  2. **Valeur principale** (ex. `1,5`) + **unité** (`ms` | `%`).
  3. **Meta** à droite : `Min • Max` (arrondis **1 décimale**).
  4. **Sparkline** (SVG pleine largeur) : **ligne gradient** + **aire dégradée** douce.
* **Ordre** : TTFT p95, RTT p95, Erreurs p95.

---

### 2) Tokens & style

* **Carte** : `bg-white` • `ring-1 ring-black/5` • `shadow-[0_8px_24px_rgba(15,23,42,.06)]` • `rounded-2xl` • `padding: 20px`.
* **Typo** : Poppins ; valeurs en **tabular-nums** (si dispo), poids `600`.
* **Couleurs** :

  * **Ligne** : dégradé brand `#FAB652 → #F25636 → #E0026D`.
  * **Aire** : vertical `#FAB652 @25% → #E0026D @10% → transparent`.
  * **Texte** : label `#64748B` (slate‑500), valeur `#0F172A`, unité `#64748B`.
* **Rayons** : 16px (r‑xl) ; aucune bordure interne.

---

### 3) Dimensions & grille

* **Section** : grille responsive `grid-cols-1 md:grid-cols-3 gap-4`.
* **Tuile** (contenu) :

  * **Header** (label + valeur + meta) hauteur auto.
  * **Sparkline** : hauteur **64px** effective (`h-16`), marges internes `5px` top/bottom.
  * **Réservation** : toujours réserver `h-16` pour **CLS=0**.

---

### 4) Données & formatage

* **Entrées** : `{ label: string; value: number; unit: 'ms'|'%'; series: number[] }`.
* **Arrondi** : **1 décimale** partout (`Intl.NumberFormat('fr-FR', { minimumFractionDigits:1, maximumFractionDigits:1 })`).
* **Unités** : suffixe **non collé** à la valeur (espace insécable `\u00A0`).
* **Contraintes** :

  * `TTFT p95`, `RTT p95` → **ms** ≥ 0 ;
  * `Erreurs p95` → **%** **0–100** (clamp visuel, mais conservez la valeur brute pour meta).
* **Séries** : 5–24 points recommandé ; si `series.length === 1`, tracer point‑à‑point **sans animation** ; si **vide**, fallback → `series=[value]` et masquer `Min/Max`.

---

### 5) Échelle & rendu SVG

* **Taille** : `viewBox="0 0 W H"` avec `W=300`, `H=60` ; `preserveAspectRatio="none"`.
* **Y‑scale** : linéaire **\[min(series), max(series)]** ; si `min==max`, étendre domaine ±1% (évite ligne plate collée) : `min' = v*0.995`, `max' = v*1.005`.
* **Marge interne** : 5px haut/bas ; **aucun axe**, **aucune grille**.
* **Ligne** : `stroke-width: 2`, `stroke-linecap: round`, segments `M/L` (polyline) — **pas** de smoothing CPU.
* **Aire** : chemin **fermé** sous la ligne → base `Y=H` ; opacité **douce** (voir tokens).
* **Dégradés** : deux `<linearGradient>` par carte ; **ID unique** dérivé de `label` **sanitizé** `[A‑Z0‑9]`.

---

### 6) Interactions & accessibilité

* **Rôle** : la carte porte l’info ; le sparkline est **décoratif** → `aria-hidden="true"`.
* **Carte** : focusable si cliquable (pas nécessaire v1).
* **Texte lisible** : contrastes AA OK (vérifier label `slate‑500` sur fond blanc).
* **Meta** : `Min 1,2 • Max 3,4` → lisible au clavier/lecteurs d’écran.
* **Motion** : éviter les animations d’apparition ; si animation future, respecter `prefers-reduced-motion: reduce`.

---

### 7) Perf & budgets

* **No lib** : SVG inline pur ; aucun canvas.
* **Poids** : < 1 KB par sparkline.
* **LCP** : les tuiles sont **sous le hero** — ne bloquent pas la police ; paint immédiat.
* **CLS** : réserver les hauteurs (voir §3) ; interdiction de reflow à l’arrivée des données.

---

### 8) API composant (`KpiBlock`)

```ts
export type KpiProps = {
  label: 'TTFT P95'|'RTT P95'|'Erreurs P95'|string;
  value: number;            // affiché en gros
  unit: 'ms'|'%';           // suffixe
  series: number[];         // sparkline
};
```

**Comportement** :

* Calculer `min/max` sur `series` **non clonée** ;
* Formatter `value`, `min`, `max` en **1 décimale** ;
* Construire `pathLine` via `M/L`; `pathArea = pathLine + ' L W H L 0 H Z'` ;
* Définir `<defs>` avec `id="${idBase}Line|Area"`.

---

### 9) Cas limites & gestion d’erreurs

* **Série constante** : appliquer domaine élargi ±1% (cf. §5) ; min==max en meta **identiques** (ex: `Min 1,5 • Max 1,5`).
* **Série monotone décroissante/croissante** : pas d’overshoot (segments linéaires).
* **Valeurs négatives** : **refusées** (log/console.warn) → clamp à 0 pour ms ; à \[0,100] pour %.
* **Série vide** : fallback `series=[value]`, masquer meta (ou afficher `Min = Max = value`).
* **Très grand `series.length`** (> 240) : sous‑échantillonner 1/10 avant rendu (perf).

---

### 10) QA — critères d’acceptation

1. **Format** : valeurs et meta en **1 décimale** ; espace insécable avant l’unité.
2. **Rendu** : ligne **dégradée** + aire **dégradée** visibles ; **aucun axe**.
3. **Échelle** : la ligne tient entre 5px et `H-5px` ; pas de clipping.
4. **Accessibilité** : `aria-hidden` sur `<svg>` ; textes lisibles au clavier.
5. **Perf** : **aucune** dépendance externe ; **aucune** animation ; DOM léger (< 20 nœuds/SVG).
6. **Responsive** : 1 colonne en < md ; 3 colonnes en ≥ md ; aucune casse.

---

### 11) Jeux d’essai (ajouter aux tests visuels)

* **TTFT p95** : `value=1.5 ms`, `series=[1.9,1.7,1.6,1.5,1.6,1.5]` → `Min 1,5 • Max 1,9`.
* **RTT p95** : `value=3.2 ms`, `series=[3.4,3.3,3.2,3.2,3.3,3.2]` → `Min 3,2 • Max 3,4`.
* **Erreurs p95** : `value=0.8 %`, `series=[0.9,0.8,0.8,0.9,0.8,0.8]` → `Min 0,8 • Max 0,9`.
* **Série constante** : `series=[2,2,2,2]` → ligne au **milieu** visuel, `Min=Max=2,0`.
* **Série unique** : `series=[1.7]` → trait court sans aire « écrasée » ; meta affichable `Min=Max=1,7`.
* **Clamp %** : `series=[-2, 120]` → rendu limité à `[0,100]`, console.warn.

---

### 12) Snippet Tailwind/React de référence (aligné preview)

```tsx
<KPIBlock label="TTFT P95" value={1.5} unit="ms" series={[1.9,1.7,1.6,1.5,1.6,1.5]} />
<KPIBlock label="RTT P95"  value={3.2} unit="ms" series={[3.4,3.3,3.2,3.2,3.3,3.2]} />
<KPIBlock label="Erreurs P95" value={0.8} unit="%" series={[0.9,0.8,0.8,0.9,0.8,0.8]} />
```

---

### 13) Évolutions v1.1 (optionnelles)

* **Tooltip** (hover/focus) affichant la dernière valeur de `series` formatée.
* **Badge tendance** `↑/↓/→` selon `series[last]-series[first]`.
* **Ligne de base** (pointillée) à la valeur courante.
* **Animation** « draw on » (stroke‑dasharray) **désactivée** si `prefers-reduced-motion`.
* **Détails UI** : valeur centrée, label en haut en petit, mini‑sparkline (arrondie) en bas. **Arrondi 16px**.



---

## 7) Accessibilité (AA)

* **H1 unique** sur la page.
* Boutons avec `aria-label` → `Entrer dans le cockpit (démo)`, `Voir la démo 90s`.
* Image informative : `alt` descriptif (10–12 mots). Si décorative, `aria-hidden="true"`.
* Navigation clavier : ordre `Badge → H1 → sous‑titre → CTA primary → CTA secondary → chips`.
* **Reduced motion** : pas d’animations de texte ; hover doux uniquement.

---

## 8) Responsivité

* **≥1280px** : titre ≤ **3 lignes** ; CTAs **sur 1 ligne** ; image droite `max-h-520`.
* **md (≥768px)** : grille 7/5 ; CTAs 1 ligne ; chips à la ligne suivante si besoin.
* **sm (<768px)** : pile verticale, image **sous** le texte ; CTAs **empilés** (primary au‑dessus).

---

## 9) Interactions & micro‑UI

* **Accent** (gradient) : appliqué uniquement aux mots clés via `.accent` ; **pas** d’italique.
* **Hover CTA primaire** : légère élévation (`translate-y-[-1px]`) ; ombre `0 10px 20px rgba(226,2,109,.22)`.
* **Hover CTA secondaire** : `bg-white/10`.
* **Chips** : curseur par défaut (non cliquables v1).

---

## 10) Performance

* Image hero **LCP** : AVIF prioritaire + fallback WEBP/PNG ; `fetchpriority=high` ; `decoding="async"`.
* Ratio‑box pour réserver la place de l’image (`aspect-[16/10]` mobile, hauteur max desktop) → **CLS 0**.
* **CSS critique** du hero ≤ 6–8 KB inline, reste différé.

---

## 11) API/Props (composant)

```ts
export type HeroProps = {
  badge?: string; // défaut: "Cockpit v0.1.0-demo · Données de démo"
  title: string | React.ReactNode; // inclut les <Accent> sur mots clés
  subtitle: string;
  chips?: string[]; // ["Experts, pas généralistes", "Collaboration multi-rôles", "Mémoire souveraine"]
  ctas?: { label: string; href: string; variant: 'primary'|'secondary' }[];
  image: { src: string; alt: string; srcset?: string; sizes?: string };
  metrics?: { ttft_ms: number; rtt_ms: number; error_rate_percent: number }; // pour KPI strip
};
```

* **Défauts** : `badge` & `chips` & `ctas` préremplis avec la copy ci‑dessus.

---

## 12) Exemples de markup

### 12.1 HTML/Tailwind (structure)

```html
<section id="hero" class="bg-[#0b1015] text-white">
  <div class="container grid grid-cols-12 gap-x-6 py-20">
    <!-- Col texte -->
    <div class="col-span-12 md:col-span-7 space-y-6">
      <span class="badge">Cockpit v0.1.0-demo · Données de démo</span>
      <h1 class="text-4xl md:text-5xl/[1.1] font-semibold">
        Pilotez une équipe d’ <span class="font-black bg-clip-text text-transparent" style="background-image:linear-gradient(12deg,#FAB652,#F25636 50%,#E0026D)">agents IA experts</span> — pas un assistant isolé.
      </h1>
      <p class="text-slate-300 max-w-prose">
        Avec Arka, vous ne dialoguez pas avec une machine. Vous dirigez une squad spécialisée : RH, Formation, Qualité, Organisation. Chaque agent IA est un expert dans son domaine, et tous travaillent ensemble, en ping‑pong, pour livrer mieux.
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <a href="/cockpit?demo=1" class="h-11 px-5 inline-flex items-center rounded-[12px] text-white" style="background-image:linear-gradient(135deg,#FAB652 0%,#F25636 50%,#E0026D 100%)">Entrer dans le cockpit</a>
        <a href="#demo" class="h-11 px-5 inline-flex items-center rounded-[12px] border border-white/20 hover:bg-white/10">Voir la démo 90s</a>
        <span class="badge">Experts, pas généralistes</span>
        <span class="badge">Collaboration multi‑rôles</span>
        <span class="badge">Mémoire souveraine</span>
      </div>
    </div>

    <!-- Col image -->
    <div class="col-span-12 md:col-span-5 flex items-center justify-center mt-10 md:mt-0">
      <img src="/assets/hero/arkabox-board.png" alt="Aperçu du cockpit Arka – board et actions visibles" class="max-h-[520px] w-auto object-contain" loading="eager" decoding="async" fetchpriority="high" />
    </div>
  </div>
</section>

<!-- KPI strip sous le hero -->
<section class="container mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div class="card p-5 text-center">
    <div class="text-xs text-slate-600">TTFT p95</div>
    <div class="mt-1 text-2xl font-semibold">1.5 ms</div>
    <div class="mt-3 h-8 rounded bg-gradient-to-b from-black/5 to-transparent"></div>
  </div>
  <div class="card p-5 text-center">
    <div class="text-xs text-slate-600">RTT p95</div>
    <div class="mt-1 text-2xl font-semibold">3.2 ms</div>
    <div class="mt-3 h-8 rounded bg-gradient-to-b from-black/5 to-transparent"></div>
  </div>
  <div class="card p-5 text-center">
    <div class="text-xs text-slate-600">Erreurs p95</div>
    <div class="mt-1 text-2xl font-semibold">0.8%</div>
    <div class="mt-3 h-8 rounded bg-gradient-to-b from-black/5 to-transparent"></div>
  </div>
</section>
```

### 12.2 React (avec props)

```tsx
<Hero
  badge="Cockpit v0.1.0-demo · Données de démo"
  title={<>
    Pilotez une équipe d’ <Accent>agents IA experts</Accent> — pas un assistant isolé.
  </>}
  subtitle="Avec Arka, vous ne dialoguez pas avec une machine. Vous dirigez une squad spécialisée : RH, Formation, Qualité, Organisation. Chaque agent IA est un expert…"
  chips={["Experts, pas généralistes","Collaboration multi‑rôles","Mémoire souveraine"]}
  ctas={[{label:"Entrer dans le cockpit", href:"/cockpit?demo=1", variant:'primary'},{label:"Voir la démo 90s", href:"#demo", variant:'secondary'}]}
  image={{ src:"/assets/hero/arkabox-board.avif", alt:"Aperçu du cockpit Arka – board et actions visibles", srcset:"...", sizes:"..." }}
  metrics={{ ttft_ms:1.5, rtt_ms:3.2, error_rate_percent:0.8 }}
/>
```

---

## 13) Tests d’acceptation (QA)

* **Sans radius** sur le bloc hero ; largeur = **container** (1440px max), centrée.
* **Titre** : mots clés en **Extra Black + gradient oblique**, **non italique**.
* **CTAs** sur **1 ligne** en ≥1024px ; sur mobile, empilés.
* **Image** : **PNG sans fond**, pas de cadre ; ne dépasse pas `max-h-520` en desktop.
* **KPI strip** : 3 cartes blanches sous le hero ; valeurs **exactes** : 1.5 ms / 3.2 ms / 0.8%.
* **LCP** : image hero correctement préchargée (préload + `fetchpriority`).
* **CLS** : aucun saut lors du chargement (ratio box OK).

---

## 14) Erreurs & fallback

* **Image manquante** : afficher placeholder (gradient doux + texte « Aperçu cockpit »), conserver hauteurs.
* **Police Poppins** indispo : stack `ui-sans-serif, system-ui, Arial`.
* **No JS** : CTAs = liens standards ; aucun JS nécessaire pour rendu.

---

## 15) Télémétrie (facultatif)

* `landing.hero.cta` (label: `try|demo`)
* `landing.hero.badge_seen` (true)
* `landing.kpi.view` (on visible)




# Section 3 - En clair — Spécification ultra‑détaillée (v1.0)

> **Concerne** : section d’explication simple et lisible après le hero. Thème **clair** (fond page `#e3e0db`). Deux **cartes blanches** côte à côte (≥768px), **glow localisé** interne, texte **centré** en intro.

---

## 1) Rôle & objectifs

* **But** : expliquer en 2 phrases la promesse opérationnelle, puis détailler 2 idées clés.
* **Composant** : `EnClair`.
* **Landmark** : `<section id="what" aria-labelledby="what-title">`.

---

## 2) Structure & layout

* **Container** : `.container` (max‑width 1440px, `px-6`).
* **Intro centrée** :

  * **Titre (H2)** : `En clair` (font‑semibold 600).
  * **Sous‑titre** : `Pas un robot, une équipe coordonnée. Vous gardez la main, ils exécutent et s’améliorent ensemble.` (max‑width **60ch**).
  * **Espacement** : `mt-2` entre titre/sous‑titre, `mt-8 md:mt-10` vers les cartes.
* **Grille cartes** : `grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6`.
* **Cartes** : `.card p-6 md:p-8 rounded-[20px] border border-[var(--border)] shadow-[0_12px_24px_rgba(15,23,42,.08)] relative overflow-hidden`.
* **Hauteurs égales** : `grid` interne pour forcer l’alignement (voir §4).

---

## 3) Thème & tokens

* **Fond page** : `#e3e0db`.
* **Carte** : `--surface:#FFFFFF`, `--border: rgba(0,0,0,.06)`.
* **Texte** : principal `#0F172A`, secondaire `#334155`.
* **Icônes** : `#0F172A` à 80% (`opacity-80`).
* **Glow localisé** : gradients **internes** (pas visibles hors carte), positions **différentes** entre cartes.

```css
/* Glows internes (à appliquer sur .card via ::before) */
.card.glow-a::before {
  content: ""; position: absolute; inset: -20%; pointer-events: none;
  background: radial-gradient(180px 140px at 20% 25%, rgba(250,182,82,.12), transparent 60%),
              radial-gradient(220px 160px at 85% 80%, rgba(224,2,109,.10), transparent 60%);
}
.card.glow-b::before {
  content: ""; position: absolute; inset: -20%; pointer-events: none;
  background: radial-gradient(200px 160px at 80% 20%, rgba(242,86,54,.10), transparent 60%),
              radial-gradient(180px 140px at 15% 75%, rgba(250,182,82,.12), transparent 60%);
}
```

---

## 4) Anatomie d’une carte

* **Wrapper** : `.card glow-a` (carte 1) / `.card glow-b` (carte 2).
* **Grid interne** : `grid [grid-template-rows: auto_auto_1fr] gap-3` → icône, titre, texte.
* **Icône** : capsule douce `w-10 h-10 grid place-items-center rounded-[12px] bg-black/5 border border-black/5`.
* **Titre (H3)** : `text-xl font-semibold text-[#0F172A]`.
* **Paragraphe** : `text-[#334155] leading-relaxed` (max‑width pleine carte).

---

## 5) Contenu validé (texte)

* **Bloc 1 — Un poste de commande**

  * *Icône* : `Command` (lucide-react).
  * *Texte* : `Vous donnez la direction. Les agents experts s’organisent entre eux : assignations, validations, corrections.`
* **Bloc 2 — Retour d’état immédiat**

  * *Icône* : `AlertTriangle` (lucide-react).
  * *Texte* : `La squad vous répond : OK ou À risque. Et si besoin, propose déjà une alternative.`

---

## 6) Accessibilité (AA)

* `<section id="what" aria-labelledby="what-title">` + `<h2 id="what-title">En clair</h2>`.
* Icônes **décoratives** avec `aria-hidden="true"` *ou* `role="img" aria-label="…"` si nécessaires.
* Contrastes : titres ≥ **7:1** recommandé (texte #0F172A / fond blanc), paragraphes ≥ **4.5:1**.
* Navigation clavier : ordre naturel (titre → sous‑titre → carte 1 → carte 2).

---

## 7) Responsivité

* **≥1280px** : deux cartes alignées, hauteurs égales.
* **md (≥768px)** : même qu’au‑dessus.
* **sm (<768px)** : cartes **empilées**, `gap-4`, paddings `p-6`.

---

## 8) API/Props (composant)

```ts
export type EnClairProps = {
  title?: string;       // défaut: "En clair"
  subtitle?: string;    // défaut: phrase validée ci-dessus
  items?: { icon: 'Command'|'AlertTriangle'|string; title: string; text: string }[]; // 2 items
};
```

* **Défauts** : 2 objets *items* préchargés avec les contenus §5.

---

## 9) Exemples de markup

### 9.1 HTML/Tailwind

```html
<section id="what" aria-labelledby="what-title" class="py-16">
  <div class="container">
    <header class="text-center max-w-3xl mx-auto">
      <h2 id="what-title" class="text-3xl font-semibold text-[#0F172A]">En clair</h2>
      <p class="mt-2 text-[#334155]">Pas un robot, une équipe coordonnée. Vous gardez la main, ils exécutent et s’améliorent ensemble.</p>
    </header>

    <div class="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <!-- Carte 1 -->
      <article class="card glow-a p-8 relative overflow-hidden">
        <div class="w-10 h-10 grid place-items-center rounded-[12px] bg-black/5 border border-black/5" aria-hidden="true">
          <!-- Icône Command -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-80"><path d="M9 3a3 3 0 0 0-3 3v12a3 3 0 1 0 3-3H7m0-6h2m6 0h2m-2 6h2m-2-6V6a3 3 0 1 0-3 3h0m0 6h0a3 3 0 1 0 3 3v-3"/></svg>
        </div>
        <h3 class="mt-4 text-xl font-semibold text-[#0F172A]">Un poste de commande</h3>
        <p class="mt-2 text-[#334155] leading-relaxed">Vous donnez la direction. Les agents experts s’organisent entre eux : assignations, validations, corrections.</p>
      </article>

      <!-- Carte 2 -->
      <article class="card glow-b p-8 relative overflow-hidden">
        <div class="w-10 h-10 grid place-items-center rounded-[12px] bg-black/5 border border-black/5" aria-hidden="true">
          <!-- Icône AlertTriangle -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-80"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h3 class="mt-4 text-xl font-semibold text-[#0F172A]">Retour d’état immédiat</h3>
        <p class="mt-2 text-[#334155] leading-relaxed">La squad vous répond : OK ou À risque. Et si besoin, propose déjà une alternative.</p>
      </article>
    </div>
  </div>
</section>
```

### 9.2 React (props)

```tsx
<EnClair
  subtitle="Pas un robot, une équipe coordonnée. Vous gardez la main, ils exécutent et s’améliorent ensemble."
  items={[
    { icon:'Command', title:'Un poste de commande', text:'Vous donnez la direction. Les agents experts s’organisent entre eux : assignations, validations, corrections.' },
    { icon:'AlertTriangle', title:"Retour d’état immédiat", text:'La squad vous répond : OK ou À risque. Et si besoin, propose déjà une alternative.' },
  ]}
/>
```

---

## 10) Performance

* **Aucune image** requise ; SVG icônes inline (ou via `lucide-react`).
* Glows **CSS only**, pas d’images de fond → coût négligeable ; `::before` non interactif.
* **CLS** nul (hauteurs réservées par la grille).

---

## 11) Tests d’acceptation (QA)

* Titre/sous‑titre centrés, largeur **≤60ch**.
* Deux cartes **hauteur égale** ≥768px, empilées <768px.
* Glows visibles **dans** la carte uniquement (aucun débordement sur le fond `#e3e0db`).
* Contrastes AA OK ; icônes décoratives non annoncées par les lecteurs (ou avec `aria-label` explicite si choisies informatives).

---

## 12) Erreurs & fallback

* **CSS non supporté** pour `radial-gradient` : retirer la classe `glow-*` — contenu reste lisible.
* **JS off** : aucune dépendance JS requise.


--------------------


# Sliders de la landing — Position & comportement (v1.0)

> **Concerne** :
>
> * **AgentsSlider** (section « Nos agents experts », id `#agents`).
> * **ProjectMapCarousel** (section « Où vit le projet », id `#workspace`).
>
> **But** : rails **full‑bleed** façon Apple, parfaitement **alignés à la grille** du container, avec **scroll‑snap** précis, **aucune déformation** des cartes, **navigation clavier/touch** et **reset** fiable.

---

## 1) Grille, container et portée full‑bleed

* **Container de section** : `max-width: 90rem` (≈ 1440px), **gouttières** `px = 24px`.

* **Full‑bleed contrôlé** : le rail déborde en **pleine largeur** (`100vw`) tout en restant **aligné** au container grâce à un **padding interne calculé**.

* **Formule de padding rail** (cohérente avec la preview) :

  ```css
  /* Variables */
  :root { --container: 90rem; --gutter: 24px; }
  /* Padding dynamique pour caler la 1re carte sous le titre */
  --rail-pad: max(calc((100vw - var(--container)) / 2 + var(--gutter)), 16px);
  ```

* **Wrapper full‑bleed** : `w-screen relative left-1/2 right-1/2 -mx-[50vw]` pour étirer le rail sur tout le viewport.

* **Alignements attendus** :

  * **Départ** : **bord gauche** de la **1ʳᵉ carte** **pile** sous le titre (même x que le container).
  * **Fin** : **bord droit** de la **dernière carte** **pile** sous le groupe de flèches.

---

## 2) Rail : scroll & snap (précision)

* **Disposition** : `display:flex; gap:24px; overflow-x:auto;`.
* **Snap natif** : `scroll-snap-type: x mandatory;` sur le rail, et **chaque carte** `scroll-snap-align: start; scroll-snap-stop: always;`.
* **Padding de scroll** (clé anti‑décalage) : `scroll-padding-left/right: var(--rail-pad);` pour supprimer l’offset fantôme au début/fin.
* **Lissage** : `scroll-behavior: smooth;` ; **désactivé** si `prefers-reduced-motion: reduce`.
* **Stabilité visuelle** : `scrollbar-gutter: stable both-edges;` (évite CLS quand la barre apparaît).

---

## 3) Cartes : dimensions **uniformes** (anti‑déformation)

* **Fixed‑basis** par palier (ne jamais utiliser `flex:1`) :

  * **AgentsSlider** : `sm: w-[55%]`, `md: 240px`, `lg: 320px`, `xl: 360px`.
  * **ProjectMapCarousel** : `sm: 60%`, `md: 340px`, `lg: 380px`, `xl: 420px`.
* **Hauteur** : image **réduite d’1/3** vs prototypes initiaux, zones internes avec `min-h` garantissant une hauteur **constante**.
* **Image** : `object-fit: cover`, ratio contrôlé (`h-28 / h-36 / h-44 / h-48`) — **aucune** variation au slide.
* **Interdits** : `width:auto` couplé au contenu, `flex:1`, `min-width:0` sur cartes — sources de dilatation.

---

## 4) Navigation (flèches, bullets, clavier, touch)

### 4.1 Algorithme `snapTo(index)` (référence)

```ts
function snapTo(index:number, smooth=true){
  const rail = railRef.current; const card = cardRefs.current[index];
  if(!rail || !card) return;
  const pl = parseFloat(getComputedStyle(rail).paddingLeft || '0');
  const target = card.offsetLeft - pl;                 // bord gauche carte – padding
  const max = rail.scrollWidth - rail.clientWidth;     // borne droite
  rail.scrollTo({ left: Math.max(0, Math.min(target, max)), behavior: smooth?'smooth':'auto' });
}
```

* **Flèches** ◀︎▶︎ : `onClick` → `snapTo(active±1)` + mise à jour d’état.
* **Bullets** : `onClick` → `snapTo(i)` ; `aria-current="true"` sur l’active.
* **Clavier** : `←/→` défilent ; `Enter` sur carte = `snapTo(i)` ; `Home/End` = 1ʳᵉ / dernière carte.
* **Touch** : inertie native (`-webkit-overflow-scrolling: touch`).

### 4.2 Détection de la carte active

* **Règle** : carte dont **le bord gauche** est **le plus proche** du **bord gauche du rail**.

```ts
const pl = parseFloat(getComputedStyle(rail).paddingLeft || '0');
const left = rail.scrollLeft + pl;
active = indexOfMin(cards.map(c => Math.abs(c.offsetLeft - left)));
```

* **Rafraîchissement** : sur `scroll`, mise à jour **via** `requestAnimationFrame` (évite spam).

### 4.3 Reset (retour à l’origine)

* **Esc** : `snapTo(0, true)` + reset mode immersif (si utilisé).
* **Bouton** *Revenir au début* (option) : visible `active > 0`.

### 4.4 États & limites

* **Désactiver** ◀︎ si `active=0`, ▶︎ si `active=last`.
* **Resize** : `onresize` → `snapTo(active, false)` pour réaligner sans animation.

---

## 5) Accessibilité (A11y)

* **Rail** : `role="group" aria-roledescription="carousel" aria-label="Agents|Sections" aria-live="off"`.
* **Cartes** : `role="region" aria-label="{ROLE — Titre}" tabindex="0"` (focusables).
* **Flèches** : `aria-controls` = id du rail ; `aria-label="Carte suivante|précédente"` ; **hit‑area** ≥ 44px.
* **Bullets** : `role="tablist"`, chaque bullet `role="tab" aria-selected` + `aria-controls`.
* **Images** : `alt` descriptif (10–12 mots) ; placeholder si erreur.
* **Réduction de mouvement** : `@media (prefers-reduced-motion: reduce){ scroll-behavior:auto; }`.

---

## 6) Performance & budgets

* **Lazy** images (`loading="lazy"`) sauf la 1ʳᵉ (préload possible).
* **Srcset** recommandé : 480 / 768 / 1200 / 1600 ; poids ≤ 160 KB (desktop), ≤ 90 KB (mobile).
* **CLS = 0** : réserver hauteurs image/texte ; pas d’injection tardive qui pousse la mise en page.
* **Aucune lib** : scroll‑snap natif + JS minimal.
* **Scrollbars** : discrets ; option `scrollbar-gutter: stable` sur le rail.

---

## 7) Variantes par slider

### 7.1 AgentsSlider

* **Taille carte** : `sm:w-[55%] md:w-[240px] lg:w-[320px] xl:w-[360px]` ; image `h-28/36/44/48`.
* **Contenu** : titre + **chip rôle** (dégradé brand), 2 lignes de copy, 3 skills max (✓), CTA optionnel.
* **Mode immersif** (option) : agrandir **visuellement** la carte active (transform léger) **sans** changer sa **width** → pas de casse de snap.

### 7.2 ProjectMapCarousel

* **Taille carte** : `sm:w-[60%] md:w-[340px] lg:w-[380px] xl:w-[420px]` ; image/icone à gauche, texte à droite.
* **CTA** : bouton rond en pied de carte (`ArrowRight`), n’affecte pas le layout.

---

## 8) Cas limites & anti‑bugs

* **Dilatation au slide** : provient de `flex:1` / `w:auto` / `min-width:0` sur cartes → **interdit**.
* **Collages en fin de rail** : oublier `scrollPaddingRight` → **toujours** définir `scrollPaddingLeft/Right` = `railPad`.
* **Reset impossible** : prévoir raccourci `Esc` + bouton reset.
* **Scrollbar Windows** : sans `scrollbar-gutter: stable`, léger shift → **activer** si possible.
* **Images lentes** : garder une **hauteur fixe** (ratio) + fond neutre pour éviter les « pop ».

---

## 9) QA — critères d’acceptation

1. **Alignement départ** : 1ʳᵉ carte **pile** sous le titre (même x que les autres sections).
2. **Alignement fin** : dernière carte **pile** sous les flèches, sans résidu de marge.
3. **Snap** : flèche/bullet/clavier **alignent** exactement le bord gauche de la carte avec le bord du rail.
4. **Uniformité** : largeur **identique** de *toutes* les cartes à chaque breakpoint ; **aucune** variation pendant le drag.
5. **Reset** : `Esc` ramène **instantanément** au début ; l’alignement d’origine est **identique** à l’état initial.
6. **A11y** : focus visible, libellés aria corrects, hit‑areas ≥ 44px, `prefers-reduced-motion` respecté.
7. **Perf** : aucune image hors écran chargée au premier paint ; LCP du hero inchangé ; CLS = 0.

---

## 10) Pseudo‑API (comportements)

```ts
type SliderControls = 'arrows'|'bullets'|'both';

interface BaseSliderProps<T>{
  items: T[];
  initialIndex?: number;           // défaut 0
  controls?: SliderControls;       // défaut 'both'
  onSlide?: (index:number)=>void;  // télémétrie
  onReset?: ()=>void;              // reset demandé
}
```

—

## 11) Extraits d’implémentation (alignés preview)

* **Wrapper full‑bleed** : `<div class="w-screen relative left-1/2 right-1/2 -mx-[50vw]">`.
* **Rail** : appliquer `style={{ paddingLeft: railPad, paddingRight: railPad, scrollPaddingLeft: railPad, scrollPaddingRight: railPad }}`.
* **Reset motion** : `<style>@media (prefers-reduced-motion: reduce){ #rail{ scroll-behavior:auto } }</style>`.

---

## 12) Télémétrie (option)

* `landing.slider.agents.slide` (index)
* `landing.slider.workspace.slide` (index)
* `landing.slider.reset` (count)
* `landing.slider.image_error` (id)

---

## 13) Check‑list debug rapide

* [ ] Les cartes gardent la **même largeur** pendant le drag (aucune flex‑grow).
* [ ] La 1ʳᵉ carte **colle** au titre après un **reset**.
* [ ] Les flèches se **désactivent** aux extrémités.
* [ ] `scrollPadding` = `railPad` **des deux côtés**.
* [ ] `requestAnimationFrame` throttle la détection d’active (scroll).



--------------------

# Section 4 - Nos agents experts — Spécification ultra‑détaillée (v1.1)

> **Concerne** : section *Nos agents experts* avec **rail full‑bleed** façon Apple (aligné à gauche sur la grille, fin alignée sous les flèches). Cartes **uniformes** (aucune déformation au slide), image **réduite d’1/3** vs anciennes versions.
>
> **Objectifs** :
>
> 1. Comprendre *qui fait quoi* en 10s.
> 2. Défilement fluide **scroll‑snap** aligné au container.
> 3. A11y & perf : clavier complet, lazy images, LCP inchangé.

---

## 1) Rôle & landmarks

* **Composant** : `AgentsSlider`.
* **Landmark section** : `<section id="agents" aria-labelledby="agents-title">`.
* **Landmark rail** : `<div role="group" aria-roledescription="carousel" aria-label="Agents">`.
* **KPI UX** :

  * **Reset** disponible (Esc/bouton) → réaligne la 1ʳᵉ carte **exactement** sous le titre.
  * **Zéro déformation** des cartes à tout moment.

---

## 2) Grille, container & full‑bleed

* **Container (section)** : `.container` (max‑width **1440px**, `px: 24px`).
* **Header (titre + sous‑titre)** : alignés **sur la même x‑gauche** que le container.
* **Rail full‑bleed** : largeur **100vw** *avec padding calculé* pour rester calé sur la grille du container :

```css
/* Padding rail basé sur la largeur réelle du container */
:root { --container: 90rem; --gutter: 24px; }
--rail-pad: clamp(16px, calc((100vw - var(--container)) / 2 + var(--gutter)), 96px);

.rail {
  padding-inline: var(--rail-pad);
  scroll-padding-inline: var(--rail-pad); /* clé pour le snap exact */
}
```

* **Départ** : **bord gauche** de la **1ʳᵉ carte** aligné **pile** sous le titre.
* **Fin** : **bord droit** de la **dernière carte** aligné **pile** sous les flèches (grâce à `padding-right: var(--rail-pad)`).

---

## 3) Carte — anatomie & dimensions (uniformes)

* **Largeur fixe (flex‑item)** : `flex: 0 0` **→ aucune variation au slide**.
* **Breakpoints (w)** :

  * **sm** `<768px` : `min(80vw, 420px)` (1 carte par écran)
  * **md** `≥768px` : **240px**
  * **lg** `≥1024px` : **320px**
  * **xl** `≥1280px` : **360px**
* **Hauteur** : `auto`, mais **zones internes verrouillées** :

  * **Image** : *réduite d’1/3* → `h-28 md:h-36 lg:h-44 xl:h-48`.
  * **Contenu** : grille interne `grid-rows: auto auto 1fr auto` avec `min-height` (ex. `min-h-[190px]`) pour bloquer l’ampleur.
* **Image** : `object-fit: cover; border-top-left/right-radius: 16px;`

  * Ratio **desktop** `3:2`, **mobile** `16:9` via hauteur fixe + cover.
* **Header carte** : Titre h3 + **chip rôle** (capsule dégradé brand, texte blanc).
* **Copy** : 2 lignes max (`line-clamp-2`).
* **Skills** : 3 puces max (✓ + 2–4 mots).
* **CTA** (option) : petit bouton outline `rounded-full`.
* **Style** : `rounded-16, bg-white, ring-1 border-black/05, shadow y=12 blur=24 opacité 8%`.

**Interdits** : `flex: 1` ou `width: auto` qui pourraient provoquer une **dilatation** lors des scrolls/resize.

---

## 4) Slider — comportements (ultra‑précis)

### 4.1 Défilement & snap

* Conteneur **horizontale** : `display:flex; gap: 24px; overflow-x:auto;`
* **Snap** : `scroll-snap-type: x mandatory;` et **chaque carte** : `scroll-snap-align: start; scroll-snap-stop: always;`
* **Scroll padding** : `scroll-padding-left/right: var(--rail-pad)` (évite l’offset fantôme).
* **Aperçu desktop** : **2,5 cartes** visibles (selon viewport), grâce aux largeurs fixes + gap.

### 4.2 Alignement exact (flèches / bullets / clavier)

* **Algorithme commun** de ciblage :

```ts
function snapTo(index:number, smooth=true){
  const rail = railRef.current; const card = cardRefs[index];
  const pl = parseFloat(getComputedStyle(rail).paddingLeft || '0');
  const target = card.offsetLeft - pl;               // bord gauche carte – padding
  const max = rail.scrollWidth - rail.clientWidth;   // limite droite
  rail.scrollTo({ left: Math.max(0, Math.min(target, max)), behavior: smooth?'smooth':'auto' });
}
```

* **Boutons** ◀︎ ▶︎ : `onClick` → `snapTo(active±1)` + mise à jour `active`.
* **Bullets** : `onClick` → `snapTo(i)` ; `aria-current="true"` sur l’active.
* **Clavier** :

  * `←/→` : nav + snap;
  * `Enter` : focus carte → `snapTo(i)` ;
  * `Esc` : **Reset** (voir 4.4).
  * `Home/End` : aller **première/dernière** (snap exact).

### 4.3 Détection active (en drag)

* **Heuristique** : carte **dont le bord gauche** est **le plus proche** du **bord gauche du rail** (plutôt que centre viewport) :

```ts
const left = rail.scrollLeft + pl;
active = closestIndex(cards.map(c => Math.abs(c.offsetLeft - left)));
```

* Mise à jour **`active`** sur `scroll` (rafraîchie via `requestAnimationFrame`).

### 4.4 Reset (alignement d’origine)

* **Raccourci** : `Esc` → `snapTo(0, true)` + `immersive=false`.
* **Bouton** : option discret « Revenir au début » (icône ↩) visible quand `active > 0`.

### 4.5 États & sécurité

* **Désactivation flèches** : ◀︎ **disabled** si `active=0`, ▶︎ **disabled** si `active=last`.
* **Resize** : `onresize` → `snapTo(active, false)` (évite dérive).
* **Reduced motion** : `prefers-reduced-motion` → `scroll-behavior:auto` (pas d’anim).
* **Touch** : inertie iOS activée (`-webkit-overflow-scrolling: touch`).

---

## 5) Accessibilité

* **Section** : `<h2 id="agents-title">Nos agents experts</h2>`.
* **Rail** : `role="group" aria-roledescription="carousel" aria-label="Agents" aria-live="off"`.
* **Carte** : `role="region" aria-label="{ROLE — Titre}" tabindex="0"` (focusable).
* **Flèches** : `aria-controls="agents-rail" aria-label="Carte suivante|précédente"` ; zone cliquable **44px** min.
* **Bullets** : `role="tablist"` (option) ; chaque bullet `role="tab" aria-selected` et `aria-controls`.
* **Images** : `alt="{ROLE — Titre}, illustration"` (10–12 mots), sinon décoratives → `aria-hidden="true"`.

---

## 6) Performance

* **Lazy** images (`loading="lazy"`) **sauf la 1ʳᵉ** (preload possible).
* **`srcset`** : `480 / 768 / 1200 / 1600`, poids cible ≤ **160 KB** (desktop), ≤ **90 KB** (mobile).
* **CLS** : réservez les hauteurs (`h-28/36/44/48`), **pas** d’images sans ratio.
* **JS** léger : aucun observer complexe requis; le snap natif fait l’essentiel.

---

## 7) Data model (JSON)

```jsonc
[
  {
    "id": "rh",
    "title": "Conseiller RH",
    "role": "RH",
    "image": "/site/agents/rh@2x.jpg",
    "summary": "Prépare dossiers, contrats, onboarding.",
    "skills": ["Dossiers RH", "Contrats", "Onboarding"],
    "cta": { "label": "Voir l’équipe", "href": "#roster" }
  }
]
```

**Règles contenu** : titre court (≤ 24ch), summary 2 lignes max, 3 skills max.

---

## 8) API/Props (composant)

```ts
export type AgentCardData = {
  id: string;
  title: string;           // ex. "Vision & cap"
  role: string;            // ex. "AGP"
  image: string;           // URL (AVIF/WEBP/JPG)
  summary: string;         // 2 lignes max
  skills: string[];        // 3 max
  cta?: { label: string; href: string };
};

export type AgentsSliderProps = {
  items: AgentCardData[];
  initialIndex?: number;        // défaut: 0
  align: 'container-left';      // verrouille l’offset de départ
  controls?: 'arrows'|'bullets'|'both';
  immersiveOnFirstSlide?: boolean; // défaut: true desktop
  onSlide?: (index:number)=>void;  // télémetrie
  onExpand?: (index:number)=>void; // si on clique une carte
  onReset?: ()=>void;              // quand Esc / bouton reset
};
```

---

## 9) Markup de référence (HTML/Tailwind)

```html
<section id="agents" aria-labelledby="agents-title" class="container py-16">
  <header class="flex items-end justify-between gap-4">
    <div>
      <h2 id="agents-title" class="text-3xl md:text-4xl font-semibold text-slate-900">Nos agents experts</h2>
      <p class="mt-2 text-slate-600 font-medium">Une squad où chaque rôle est clair…</p>
    </div>
    <div class="hidden md:flex items-center gap-2">
      <button aria-controls="agents-rail" aria-label="Carte précédente" class="h-11 w-11 rounded-full bg-white ring-1 ring-black/10">◀</button>
      <button aria-controls="agents-rail" aria-label="Carte suivante" class="h-11 w-11 rounded-full bg-white ring-1 ring-black/10">▶</button>
    </div>
  </header>

  <!-- rail full‑bleed -->
  <div class="mt-6 w-screen relative left-1/2 right-1/2 -mx-[50vw]">
    <div id="agents-rail" class="rail flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6">
      <!-- carte (ex.) -->
      <article class="flex-none w-[55%] md:w-[240px] lg:w-[320px] xl:w-[360px] snap-start rounded-[16px] bg-white ring-1 ring-black/5 shadow-[0_12px_24px_rgba(15,23,42,.08)]">
        <div class="relative overflow-hidden rounded-t-[16px] bg-slate-100 h-28 md:h-36 lg:h-44 xl:h-48">
          <img src="/site/agents/rh@2x.jpg" alt="RH — Conseiller RH, illustration" class="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div class="p-6 grid [grid-template-rows:auto_auto_1fr_auto] min-h-[190px]">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-slate-900">Conseiller RH</h3>
            <span class="px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D]">RH</span>
          </div>
          <p class="mt-2 text-slate-700 line-clamp-2">Prépare dossiers, contrats, onboarding.</p>
          <ul class="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-700">
            <li class="col-span-3 sm:col-span-1 flex items-center gap-2">✓ Dossiers RH</li>
            <li class="col-span-3 sm:col-span-1 flex items-center gap-2">✓ Contrats</li>
            <li class="col-span-3 sm:col-span-1 flex items-center gap-2">✓ Onboarding</li>
          </ul>
        </div>
      </article>
      <!-- … autres cartes … -->
    </div>
  </div>

  <!-- bullets + fraction -->
  <div class="mt-4 flex items-center justify-center gap-3">
    <div class="flex items-center gap-2">
      <button class="h-2.5 w-2.5 rounded-full bg-slate-800" aria-label="Aller à la carte 1"></button>
      <button class="h-2.5 w-2.5 rounded-full bg-slate-400/40" aria-label="Aller à la carte 2"></button>
    </div>
    <span class="ml-2 text-sm text-slate-600">1 / 6</span>
  </div>
</section>
```

---

## 10) QA — tests d’acceptation

1. **Alignements** : départ **pile** sous le titre ; fin **pile** sous les flèches.
2. **Snap** : chaque descente flèche/bullet/clavier aligne **exactement** le bord gauche de la carte à gauche du rail.
3. **Uniformité** : *toutes* les cartes ont **exactement** la même **largeur** et la même **hauteur de zones** (image/texte), **aucune** variation pendant le défilement/redimensionnement.
4. **Reset** : `Esc` ou bouton « Revenir au début » recentre **immédiatement** la 1ʳᵉ carte sous le titre.
5. **A11y** : focus visible, flèches 44px, libellés aria corrects ; navigation au clavier **complète**.
6. **Perf** : seules les images visibles + 1 prochaine se chargent ; **srcset** opérationnel ; **CLS = 0**.

---

## 11) États d’erreur & fallback

* **Image manquante** : placeholder dégradé + **initiales du rôle** (ex. *AGP*), même ratio; `alt` conservé.
* **JS off** : rail **scrollable** natif (snap conserve l’alignement).
* **Color‑scheme** : si thème foncé plus tard, seuls fonds/texte/anneaux changent, **dimensions inchangées**.

---

## 12) Télémétrie (facultatif)

* `landing.slider.agents.slide` (index)
* `landing.slider.agents.expand` (index)
* `landing.slider.agents.reset` (count)
* `landing.slider.agents.image_error` (id)



# Section 5 - Exemples — Spécification ultra‑détaillée (v1.0)

> **Concerne** : section marketing « Exemples ». **Fond de section blanc**, cartes dans la **couleur du BG global** `#e3e0db`. Tagline **sous** le titre, **petit**, **sans parenthèses** : *1 commande = 1 résultat*.

---

## 1) Rôle & objectifs

* **But** : montrer en 3 cas concrets qu’une **commande** déclenche une **mission** prise en main par la squad, avec un **statut** clair et un **résultat** partageable.
* **Composant** : `Examples` (sous‑composants : `ExampleCard`, `Pill`).
* **Landmark** : `<section id="examples" aria-labelledby="examples-title">`.

---

## 2) Thème & tokens

* **Fond section** : `#FFFFFF` (plein‑largeur, **full‑bleed** optionnel dans la maquette).
* **Cartes** : fond `#e3e0db` (même teinte que la page), `border: 1px solid rgba(0,0,0,.06)`, `radius: 16–20px`, **ombre légère** `0 8px 24px rgba(15,23,42,.06)` (ou **aucune** si tu veux encore plus « plat »).
* **Texte** : primaire `#0F172A`, secondaire `#334155`.
* **Chip /commande** : capsule claire (fond blanc 70–80%, bordure noire 10%), **font‑mono**.
* **Pills (statuts)** :

  * `PASS → OK` (emerald), `WARN → Attention` (amber), `FAIL → Bloquant` (rose),
  * `A_FAIRE → À faire` (indigo), `A_RISQUE → À risque` (rose).
* **Glows internes** (optionnels) : radiaux **très légers** **à l’intérieur** des cartes (aucune fuite sur le fond blanc de la section).

```css
/* Extraits CSS pour glows internes sur .example-card */
.example-card::before{
  content:""; position:absolute; inset:0; pointer-events:none; border-radius:inherit;
  background:
    radial-gradient(38% 30% at 10% 0%,  #FAB65222, transparent 60%),
    radial-gradient(30% 26% at 95% 100%, #E0026D14, transparent 60%);
}
.example-card.b-2::before{ background:
    radial-gradient(32% 28% at 85% 90%, #F256361a, transparent 60%),
    radial-gradient(26% 22% at 15% 80%, #FAB6521f, transparent 60%); }
.example-card.b-3::before{ background:
    radial-gradient(36% 26% at 20% 10%, #FAB65222, transparent 60%),
    radial-gradient(26% 22% at 80% 85%, #E0026D14, transparent 60%); }
```

---

## 3) Layout & grille

* **Container** : `.container` (max‑width **1440px**, `px-6`).
* **Header** (centré) :

  * **H2** `Exemples` (600), `id="examples-title"`.
  * **Tagline** (petit, `text-sm`, `font-medium`, `color: #64748B`) : *1 commande = 1 résultat*.
  * **Espacement** : `mt-2` sous le titre.
* **Pile de cartes** : `grid gap-6` (1 colonne). **Pas de 3 colonnes** : chaque cas doit respirer.
* **Interne carte** : `grid md:grid-cols-12 gap-6 items-start` :

  * **Col gauche (md:5)** : Titre + chip **/commande**.
  * **Col droite (md:7)** : **Pill statut** + Résultat (titre court + 1–2 lignes).

---

## 4) Anatomie d’une `ExampleCard`

* **Wrapper** : `<article class="example-card relative p-6 md:p-8 rounded-[20px] bg-[#e3e0db] ring-1 ring-black/5 shadow-[0_8px_24px_rgba(15,23,42,.06)]">`.
* **Bloc gauche** :

  * **H3** (xl, 600) — promesse lisible.
  * **Chip /commande** : `font-mono text-[15px]`, icône `Sparkles` 16px, fond blanc 70–80%, bordure 10%.
* **Bloc droite** :

  * **Pill statut** (voir §2) + **titre de résultat** (500) sur une ligne.
  * **Paragraphe** : 1–2 phrases, max **160–180** caractères.
* **A11y** : `role="group" aria-label="{Titre} — {commande}"`.

---

## 5) Contenu validé (3 cas)

1. **Préparer un onboarding RH**

   * **Commande** : `/kit onboarding`
   * **Statut** : `A_FAIRE` (À faire)
   * **Résultat** : *Onboarding* — *Le Conseiller RH prépare le kit, le Coach organisation vérifie les étapes, le Qualité valide la conformité. Résultat : checklist complète J‑7 à J+7.*

2. **Mettre une procédure à jour**

   * **Commande** : `/assign Proc-23`
   * **Statut** : `A_FAIRE`
   * **Résultat** : *Procédure mise à jour* — *Le Coach prend la tâche, le Qualité revoit la cohérence, le Support la publie. Résultat : procédure à jour, validée.*

3. **Signaler un risque conformité**

   * **Commande** : `/gate conformité`
   * **Statut** : `A_RISQUE`
   * **Résultat** : *Conformité* — *Le Qualité évalue, l’Analyste propose des correctifs, le Coach les intègre. Résultat : livrable marqué À risque avec actions proposées.*

---

## 6) Accessibilité (AA)

* Section : `<section id="examples" aria-labelledby="examples-title">` + `<h2 id="examples-title">Exemples</h2>`.
* Chaque carte : `role="group"` + `aria-label` (concat titre + commande).
* Icônes décoratives : `aria-hidden="true"`.
* Contrastes AA (texte #0F172A sur fond #e3e0db ≥ 7:1 recommandé pour les titres).

---

## 7) Responsivité

* **sm (<768px)** : cartes **plein‑écran** en largeur, blocs haut/bas empilés ; paddings `p-6`.
* **md (≥768px)** : grille 5/7 (voir §3) ; conserver **marges** et **rythme**.
* **xl (≥1280px)** : respirations accrues (`gap-6` → `gap-8` optionnel).

---

## 8) API/Props (composant)

```ts
export type ExampleItem = {
  title: string;
  command: string;                     // ex: "/kit onboarding"
  status: 'PASS'|'WARN'|'FAIL'|'A_FAIRE'|'A_RISQUE';
  resultTitle: string;
  resultDesc: string;                   // 1–2 phrases max
};

export type ExamplesProps = {
  title?: string;                       // défaut: "Exemples"
  tagline?: string;                     // défaut: "1 commande = 1 résultat"
  items: ExampleItem[];                 // 3 éléments
};
```

---

## 9) Markup — exemples

### 9.1 HTML/Tailwind

```html
<div class="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-white">
  <section id="examples" aria-labelledby="examples-title" class="container py-16">
    <header class="text-center max-w-3xl mx-auto">
      <h2 id="examples-title" class="text-3xl md:text-4xl font-semibold text-[#0F172A]">Exemples</h2>
      <p class="mt-2 text-sm text-slate-500 font-medium">1 commande = 1 résultat</p>
    </header>

    <div class="mt-8 grid gap-6">
      <article class="example-card relative p-8 rounded-[20px] bg-[#e3e0db] ring-1 ring-black/5">
        <div class="relative grid md:grid-cols-12 gap-6 items-start">
          <div class="md:col-span-5">
            <h3 class="text-xl font-semibold text-[#0F172A]">Préparer un onboarding RH</h3>
            <div class="mt-3 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-3 py-2 font-mono text-[15px] text-slate-800">
              <svg aria-hidden width="16" height="16" viewBox="0 0 24 24"><path d="M12 2v4m0 12v4m6-6h4M2 12H6m9.5-6.5l2.5 2.5M6 18l-2.5 2.5" stroke="currentColor" stroke-width="2" fill="none"/></svg>
              /kit onboarding
            </div>
          </div>
          <div class="md:col-span-7">
            <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1 bg-indigo-500/10 text-indigo-700 ring-indigo-500/20">À faire</span>
            <span class="ml-2 font-medium text-[#0F172A]">Onboarding</span>
            <p class="mt-2 text-[#334155]">Le Conseiller RH prépare le kit, le Coach organisation vérifie les étapes, le Qualité valide la conformité. Résultat : checklist complète J‑7 à J+7.</p>
          </div>
        </div>
      </article>
      <!-- Cartes 2 et 3 selon §5, classes .b-2 / .b-3 pour varier les glows -->
    </div>
  </section>
</div>
```

### 9.2 React

```tsx
<Examples
  items=[
    { title:"Préparer un onboarding RH", command:"/kit onboarding", status:"A_FAIRE", resultTitle:"Onboarding", resultDesc:"Le Conseiller RH prépare le kit… J‑7 à J+7."},
    { title:"Mettre une procédure à jour", command:"/assign Proc-23", status:"A_FAIRE", resultTitle:"Procédure mise à jour", resultDesc:"Le Coach prend la tâche… validée."},
    { title:"Signaler un risque conformité", command:"/gate conformité", status:"A_RISQUE", resultTitle:"Conformité", resultDesc:"Le Qualité évalue… actions proposées."}
  ]
/>
```

---

## 10) Performance

* **Aucune image** nécessaire (icônes SVG inline).
* **CLS** nul : hauteurs stables, pas de contenu chargé dynamiquement.
* **CSS** : glows **CSS only** ; pas d’ombres lourdes.

---

## 11) Tests d’acceptation (QA)

* Titre **Exemples** centré ; tagline **juste dessous**, `text-sm`, **sans parenthèses**.
* **Fond section** blanc ; **chaque carte** fond `#e3e0db` ; **glow interne** discret (aucune fuite visuelle).
* Cartes **alignées** (grille 12 col. 5/7 en md+), lisibilité AA.
* Pills de **statut** correctes selon données.
* Monospace et contraste OK sur la **commande**.

---

## 12) Erreurs & fallback

* Si `status` inconnu → pill `À faire` par défaut (indigo).
* Si texte trop long → clamp (2 lignes) sur la description.
* Si glows non supportés → pas d’effet; garder couleurs/contrastes.










# Section 6 - Fonctionnalités — Spécification ultra‑détaillée (v1.0)

> **Concerne** : section marketing « Tout piloter depuis un seul endroit ». Thème **clair** (fond page `#e3e0db`). **Image PNG sans fond** à **gauche**, **contenu à droite**. Pas de scroll horizontal.

---

## 1) Rôle & objectifs

* **But** : montrer le cockpit comme point unique d’orchestration (chat multi‑agents, recettes, visibilité directe, mémoire souveraine, preuves).
* **Composant** : `FeaturesSection`.
* **Landmark** : `<section id="features" aria-labelledby="features-title">`.

---

## 2) Grille & layout

* **Container** : `.container` (max‑width 1440px, `px-6`).
* **Grille** : `grid grid-cols-1 lg:grid-cols-12 gap-10 items-center`.

  * **Col. image** (gauche) : `lg:col-span-5`.
  * **Col. texte** (droite) : `lg:col-span-7`.
* **Paddings** : `py-16` (desktop), `py-12` (tablet), `py-10` (mobile).
* **Alignements** : titres/paragraphes calés sur la grille (même **x** que les autres sections).

---

## 3) Thème & tokens

* **Fond page** : `#e3e0db` (hérité).
* **Texte** : principal `#0F172A`, secondaire `#334155`.
* **Pills/icônes** : gradient brand (FAB652 → F25636 → E0026D) pour les pictos; check neutral si non spécifié.
* **Cartes/panneaux** : non utilisés ici (contenu nu), éviter les ombres lourdes.

---

## 4) Visuel (colonne gauche)

* **Type** : **PNG/WEBP/AVIF sans fond** (pas de cadre), `object-contain`.
* **Source** : `/assets/hero/arkabox-board.*` (AVIF prioritaire, WEBP/PNG fallback).
* **Attributs** : `loading="lazy"` (sauf si LCP secondaire voulu), `decoding="async"`.
* **Tailles** : `sizes="(max-width: 1024px) 90vw, 520px"` ; `srcset` 480/768/1200/1600.
* **Contraintes** : ne **pas dépasser** la hauteur de son conteneur; **aucun** cadre/ombre.
* **Alt** (12 mots max) : « Aperçu du cockpit Arka : chat, recettes, observabilité, preuves ».

---

## 5) Contenus (colonne droite)

* **Titre (H2)** : *Tout piloter depuis un seul endroit* (font‑semibold 600).
* **Paragraphe 1** :
  `Le cockpit Arka réunit : le chat orchestrateur multi‑agents, des recettes métiers prêtes à l’emploi, la visibilité en direct des résultats, et une mémoire souveraine (ArkaMeta).`
* **Paragraphe 2** :
  `Vous donnez la direction, les agents experts se relaient pour exécuter. Les indicateurs se mettent à jour en direct. À la fin, une preuve formelle est générée : claire, lisible, exportable.`
* **Liste « Fonctionnalités clés » (4 items)** :

  1. **Chat multi‑agents experts** — *RH, Qualité, Organisation répondent et déclenchent des actions.*
  2. **Recettes métiers** — *Onboarding, Formation, Conformité, Process internes.*
  3. **ArkaMeta — mémoire souveraine** — *Historique, décisions, livrables; hébergée chez vous.*
  4. **Preuves exportables** — *Dossiers clairs pour audits, clients, subventions.*
* **Chips actions** (option, ligne sous la liste) : `Assigner`, `Vérifier`, `Lier un doc`, `Exporter la preuve`.

---

## 6) Anatomie UI (colonne droite)

* **Bloc titre** : `h2.text-3xl md:text-4xl.font-semibold.text-[#0F172A]`.
* **Paragraphes** : `mt-3 text-[#334155] max-w-2xl`.
* **Items** : grille verticale `mt-8 grid gap-6`.

  * **Icône** : pastille ronde **gradient brand** `h-8 w-8 rounded-full`.
  * **Label** : `font-medium text-[#0F172A]`.
  * **Desc** : `text-[#334155]` (une phrase).
* **Chips** : `inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-slate-800 backdrop-blur`.

---

## 7) Accessibilité (AA)

* `<section id="features" aria-labelledby="features-title">` + `<h2 id="features-title">…</h2>`.
* Images **informative** → `alt` descriptif (10–12 mots). Si purement décorative → `aria-hidden="true"`.
* Icônes **décoratives** : `aria-hidden="true"`. Icônes sémantiques possibles via `role="img" aria-label`.
* Focus clavier visible sur **tous** les liens/éléments interactifs (chips non interactives v1 → `cursor-default`).
* Contrastes : ≥ 4.5:1 texte/fond.

---

## 8) Responsivité

* **≥1280px** : grille 5/7; image `object-contain`, pas de débordement; textes ≤ 70ch.
* **md (≥768px)** : identique; alignements conservés.
* **sm (<768px)** : **pile verticale** (image **avant** texte) ; conserver `gap-8–10` ; par défaut pas de chips si manque d’espace.

---

## 9) Interactions & micro‑UI

* Icône brand : **aucune animation**. Hover doux sur chips (légère élévation **interdite** v1, conserver plat).
* Pas de liens « En savoir plus » v1 (peut être ajouté v1.1).
* **Reduced motion** : aucune transition requise ici (statique).

---

## 10) Performance

* **Lazy** image (hors LCP); `decoding="async"`; poids cible ≤ 160 KB desktop, ≤ 90 KB mobile.
* `srcset` + `sizes` corrects; réserver la place (ratio‑box si image très large) → **CLS 0**.
* CSS local minimal (≤ 2 KB); reste dans tokens globaux.

---

## 11) API/Props (composant)

```ts
export type FeatureItem = { title: string; desc: string; icon?: React.ReactNode };
export type FeaturesProps = {
  image: { src: string; alt: string; srcset?: string; sizes?: string };
  title?: string;                // défaut : "Tout piloter depuis un seul endroit"
  p1?: string;                   // défaut : paragraphe 1 validé
  p2?: string;                   // défaut : paragraphe 2 validé
  items?: FeatureItem[];         // défaut : 4 items validés
  chips?: string[];              // défaut : ["Assigner","Vérifier","Lier un doc","Exporter la preuve"]
};
```

---

## 12) Exemples de markup

### 12.1 HTML/Tailwind (structure)

```html
<section id="features" aria-labelledby="features-title" class="py-16">
  <div class="container grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
    <div class="lg:col-span-5">
      <img src="/assets/hero/arkabox-board.avif" alt="Aperçu du cockpit Arka : chat, recettes, observabilité, preuves" class="w-full h-auto object-contain" loading="lazy" decoding="async" />
    </div>
    <div class="lg:col-span-7">
      <h2 id="features-title" class="text-3xl md:text-4xl font-semibold text-[#0F172A]">Tout piloter depuis un seul endroit</h2>
      <p class="mt-3 text-[#334155] max-w-2xl">Le cockpit Arka réunit : le chat orchestrateur multi‑agents, des recettes métiers prêtes à l’emploi, la visibilité en direct des résultats, et une mémoire souveraine (ArkaMeta).</p>
      <p class="mt-2 text-[#334155] max-w-2xl">Vous donnez la direction, les agents experts se relaient pour exécuter. Les indicateurs se mettent à jour en direct. À la fin, une preuve formelle est générée : claire, lisible, exportable.</p>
      <div class="mt-8 grid gap-6">
        <div class="flex items-start gap-3"><span class="inline-flex h-8 w-8 rounded-full bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] text-white items-center justify-center">✓</span><div><div class="font-medium text-[#0F172A]">Chat multi‑agents experts</div><p class="text-[#334155]">RH, Qualité, Organisation répondent et déclenchent des actions.</p></div></div>
        <div class="flex items-start gap-3"><span class="inline-flex h-8 w-8 rounded-full bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] text-white items-center justify-center">✓</span><div><div class="font-medium text-[#0F172A]">Recettes métiers</div><p class="text-[#334155]">Onboarding, Formation, Conformité, Process internes.</p></div></div>
        <div class="flex items-start gap-3"><span class="inline-flex h-8 w-8 rounded-full bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] text-white items-center justify-center">✓</span><div><div class="font-medium text-[#0F172A]">ArkaMeta — mémoire souveraine</div><p class="text-[#334155]">Historique, décisions, livrables — hébergés chez vous.</p></div></div>
        <div class="flex items-start gap-3"><span class="inline-flex h-8 w-8 rounded-full bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] text-white items-center justify-center">✓</span><div><div class="font-medium text-[#0F172A]">Preuves exportables</div><p class="text-[#334155]">Dossiers clairs pour audits, clients, subventions.</p></div></div>
      </div>
      <div class="mt-6 flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-slate-800 backdrop-blur">Assigner</span>
        <span class="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-slate-800 backdrop-blur">Vérifier</span>
        <span class="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-slate-800 backdrop-blur">Lier un doc</span>
        <span class="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-slate-800 backdrop-blur">Exporter la preuve</span>
      </div>
    </div>
  </div>
</section>
```

### 12.2 React (props)

```tsx
<FeaturesSection />
// ou
<FeaturesSection
  image={{ src:"/assets/hero/arkabox-board.avif", alt:"Aperçu du cockpit Arka : chat, recettes, observabilité, preuves" }}
  items={[
    { title:"Chat multi‑agents experts", desc:"RH, Qualité, Organisation répondent et déclenchent des actions." },
    { title:"Recettes métiers", desc:"Onboarding, Formation, Conformité, Process internes." },
    { title:"ArkaMeta — mémoire souveraine", desc:"Historique, décisions, livrables — hébergés chez vous." },
    { title:"Preuves exportables", desc:"Dossiers clairs pour audits, clients, subventions." },
  ]}
  chips={["Assigner","Vérifier","Lier un doc","Exporter la preuve"]}
/>
```

---

## 13) Tests d’acceptation (QA)

* Titre **exact** : *Tout piloter depuis un seul endroit*.
* Image **sans fond**, **sans cadre/ombre**, `object-contain`, pas de débordement.
* 2 paragraphes présents (copy validée), 4 items listés avec icônes **gradient**.
* Chips présentes si `chips[]` non vide; non cliquables v1.
* **Aucun** scroll horizontal; alignements grille OK.
* Contrastes AA OK (texte foncé / fond clair).
* **CLS 0** (ratio image réservé si nécessaire).

---

## 14) Erreurs & fallback

* **Image manquante** : afficher placeholder neutre (bloc aspect 16:10, fond `#f1f5f9`, texte « Aperçu indisponible »), conserver dimensions.
* **Gradient non supporté** : icône passe en fond plein `#0F172A` et texte blanc.
* **JS off** : section purement statique, aucune dépendance.




# Section 7 - Où vit le projet — Spécification ultra‑détaillée (v1.0)

> **Concerne** : section « Workspace » de la landing. Rail **full‑bleed** type Apple, **mêmes comportements** que le slider *Nos agents*. Thème clair (fond page `#e3e0db`).

---

## 1) Rôle & objectifs

* **But** : montrer **où vit** le projet (espaces clés) sans jargon.
* **Composant** : `WorkspaceSlider`.
* **Landmark** : `<section id="workspace" aria-labelledby="workspace-title">`.

---

## 2) Structure & layout

* **Container** : `.container` (max‑width 1440px, `px-6`).
* **Header** : titre **aligné** au bord gauche du container, sous‑titre en dessous.

  * **Titre (H2)** : `Où vit le projet` (font‑semibold 600).
  * **Sous‑titre** : `Tout est visible, rien n’est perdu` (font‑medium 500).
* **Toolbar** : flèches ◀︎ ▶︎ (44px) **à droite** du header.
* **Rail full‑bleed** (cf. §3) placé **juste sous** le header (marge `mt-6`).
* **Bullets + fraction** **centrées** sous le rail.

---

## 3) Rail full‑bleed & alignements

* **Wrapper plein écran** : `w-screen relative left-1/2 right-1/2 -mx-[50vw]`.
* **Padding de rail** (calage sur la grille) :

  * `--rail-pad = max(calc((100vw - 90rem)/2 + 24px), 16px)`
  * appliquer à `padding-left/right` **et** `scroll-padding-left/right` du rail.
* **Alignement de départ** : le **bord gauche** de la **1ʳᵉ carte** est **exactement** sous le bord gauche du container (même *x* que le titre).
* **Alignement final** : après avoir atteint la dernière carte, son **bord droit** est **aligné** sous les **flèches** (bord droit du container).
* **Snap** : `scroll-snap-type: x mandatory;` ; cartes `snap-start snap-always`.
* **Défilement** : `overflow-x: auto;` + `scroll-behavior: smooth;` (désactivé en `prefers-reduced-motion`).

---

## 4) Carte — anatomie & styles

* **Dimensions fixes (uniformes)** : `w-[88%] sm:w-[60%] md:w-[340px] lg:w-[380px] xl:w-[420px]` ; `flex-none`.
* **Hauteur** : contenu **auto‑rows-fr** pour égaliser (pas de déformation au slide).
* **Style** : `rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_24px_rgba(15,23,42,.08)] p-6`.
* **Icône** : pastille **gradient brand** `h-12 w-12 rounded-2xl` (SVG lucide 20px, couleur blanche).
* **Titre (H3)** : `text-xl font-semibold text-[#0F172A]`.
* **Texte** : `text-[#334155]` (2 lignes **max** en mobile, 3 max desktop ; `line-clamp` autorisée).
* **CTA optionnel** : bouton rond `h-9 w-9` à droite (flèche `ArrowRight`).
* **Glows localisés** (optionnels) : radiaux **discrets** à l’intérieur **uniquement**, jamais sur le BG global.

```css
/* Exemple glows locaux */
.card.glow-1::before{content:"";position:absolute;inset:-20%;pointer-events:none;background:radial-gradient(200px_160px_at_10%_8%,#FAB65222,transparent_60%),radial-gradient(160px_120px_at_90%_88%,#E0026D14,transparent_60%);}
.card.glow-2::before{content:"";position:absolute;inset:-20%;pointer-events:none;background:radial-gradient(180px_140px_at_85%_14%,#FAB65222,transparent_60%),radial-gradient(160px_120px_at_18%_82%,#E0026D14,transparent_60%);}
```

---

## 5) Navigation & comportements

* **Flèches** : boutons **44×44** ; `aria-controls` = id du rail ; clic **aligne** la carte suivante/précédente **au bord gauche**.
* **Bullets** : boutons ronds (8–10px) ; clic **aligne** la carte ciblée ; **fraction** `x / N` affichée.
* **Clavier** : `←/→` = précédent/suivant ; `Enter` sur carte = **aligner** ; `Esc` = **reset** (revient à l’alignement de départ et enlève l’état « immersif » si présent).
* **Reset visuel** (option) : petit bouton `Réinitialiser` à gauche des bullets (icône `Home`), masqué par défaut (`sr-only` en v1, visible v1.1 si besoin UX).
* **Scroll padding** : garantit que la carte active **colle** au padding gauche/droit sans « offset fantôme ».

---

## 6) Breakpoints (3 paliers)

* **Desktop ≥ 1200px** : 2,5 cartes visibles ; largeur carte `380–420px` ; flèches visibles.
* **Tablet 768–1199px** : 1,5 carte visible ; flèches visibles ; bullets visibles.
* **Mobile < 768px** : 1 carte **plein‑écran** (100% rail) ; bullets visibles ; flèches masquées.

---

## 7) Accessibilité (AA)

* `role="region" aria-label="{Titre carte}"` pour chaque carte.
* Flèches : `aria-controls="workspace-rail"` + `aria-label="Carte suivante|précédente"`.
* Bullets : `aria-label="Aller à l’élément {n}"` ; la bullet active a `aria-current="true"`.
* Focus **visible** (anneau) sur flèches, bullets, cartes ; Tab parcourt **header → rail → bullets**.

---

## 8) Performance & médias

* **Icônes** en SVG (lucide‑react), pas d’images lourdes.
* Rail **GPU‑friendly** : `will-change: scroll-position;` (optionnel).
* `prefers-reduced-motion` : transitions et smooth‑scroll **désactivés**.
* **CLS** : aucun (largeurs fixes, padding stabilisé).

---

## 9) Données (JSON — items)

```jsonc
[
  { "id":"chat",      "icon":"MessageSquare", "title":"Chat",                 "desc":"Là où l’on décide et déclenche." },
  { "id":"roadmap",   "icon":"Route",         "title":"Roadmap",             "desc":"Missions et jalons." },
  { "id":"docdesk",   "icon":"BookOpen",      "title":"DocDesk",             "desc":"Documents, contrats, supports versionnés." },
  { "id":"builder",   "icon":"Settings",      "title":"Builder Gouvernance", "desc":"Règles et check‑lists." },
  { "id":"roster",    "icon":"Users",         "title":"Roster",              "desc":"Rôles de la squad, charges, dispo." },
  { "id":"observa",   "icon":"Activity",      "title":"Observabilité",       "desc":"Santé et indicateurs clés." },
  { "id":"arkameta",  "icon":"HardDrive",     "title":"ArkaMeta",            "desc":"Mémoire souveraine, chez vous." },
  { "id":"evidence",  "icon":"ClipboardList", "title":"Evidence",            "desc":"Le paquet de preuves à partager." }
]
```

---

## 10) Exemples de markup

### 10.1 HTML/Tailwind (structure exacte)

```html
<section id="workspace" aria-labelledby="workspace-title" class="mx-auto max-w-[90rem] px-6 py-16">
  <div class="flex items-end justify-between gap-4">
    <header>
      <h2 id="workspace-title" class="text-3xl md:text-4xl font-semibold text-[#0F172A]">Où vit le projet</h2>
      <p class="mt-2 text-[#334155] font-medium">Tout est visible, rien n’est perdu</p>
    </header>
    <div class="hidden md:flex items-center gap-2">
      <button aria-controls="workspace-rail" aria-label="Précédent" class="h-11 w-11 rounded-full bg-white ring-1 ring-black/10 shadow-sm hover:bg-slate-50">◀︎</button>
      <button aria-controls="workspace-rail" aria-label="Suivant" class="h-11 w-11 rounded-full bg-white ring-1 ring-black/10 shadow-sm hover:bg-slate-50">▶︎</button>
    </div>
  </div>

  <!-- Rail full‑bleed aligné -->
  <div class="mt-6 w-screen relative left-1/2 right-1/2 -mx-[50vw]">
    <div id="workspace-rail" class="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6"
         style="--pad:max(calc((100vw - 90rem)/2 + 24px), 16px); padding-left:var(--pad); padding-right:var(--pad); scroll-padding-left:var(--pad); scroll-padding-right:var(--pad);">
      <!-- Carte -->
      <article class="flex-none snap-start w-[88%] sm:w-[60%] md:w-[340px] lg:w-[380px] xl:w-[420px] relative overflow-hidden rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_24px_rgba(15,23,42,.08)] p-6">
        <div class="flex items-start gap-4">
          <div class="bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] text-white inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl">🗨️</div>
          <div>
            <h3 class="text-xl font-semibold text-[#0F172A]">Chat</h3>
            <p class="mt-2 text-[#334155]">Là où l’on décide et déclenche.</p>
          </div>
        </div>
      </article>
      <!-- … autres cartes … -->
    </div>
  </div>

  <!-- Bullets -->
  <div class="mt-4 flex items-center justify-center gap-3">
    <div class="flex items-center gap-2">
      <button class="h-2.5 w-2.5 rounded-full bg-slate-800" aria-current="true"></button>
      <button class="h-2.5 w-2.5 rounded-full bg-slate-400/40"></button>
      <!-- … -->
    </div>
    <span class="text-sm text-slate-600">1 / 8</span>
  </div>
</section>
```

### 10.2 React (props)

```tsx
<WorkspaceSlider items={workspaceItems} />
```

---

## 11) Tests d’acceptation (QA)

* **Alignement départ** : bord gauche **carte 1** = bord gauche **container**.
* **Alignement fin** : bord droit **dernière carte** = bord droit **container** (sous les flèches).
* **Uniformité** : toutes les cartes ont **exactement la même largeur/hauteur** ; aucun **redimensionnement** pendant le slide.
* **Snap** : chaque navigation (flèche/bullet/clavier) **aligne** la carte active **au bord gauche** (pas d’offset).
* **Reset** : `Esc` (ou bouton dédié) revient à l’état initial **exact**.
* **A11y** : roles/labels conformes, focus visibles, bullets avec `aria-current`.
* **Perf** : aucun CLS ; smooth‑scroll désactivé si `prefers-reduced-motion`.

---

## 12) Erreurs & fallback

* **JS off** : rail défile **manuellement** ; flèches inactives masquées via `noscript` si besoin.
* **Motion réduite** : `scroll-behavior:auto` + pas de transitions.
* **Icons manquantes** : fallback emoji (comme HTML ci‑dessus).


# Section 8 - C’est quoi une « preuve » — Spécification ultra‑détaillée (v1.0)

> **Concerne** : section pédagogique « officielle » présentant la notion de *preuve* (résumé d’actions validées). Thème **clair**, BG page `#e3e0db`. **Texte gauche**, **carte officielle** à droite.

---

## 1) Rôle & objectifs

* **But** : expliquer *simplement* ce qu’est une preuve (liste concrète), montrer un **exemple crédible** façon document officiel (réf., date, empreinte, statut).
* **Composant** : `Evidence`.
* **Landmark** : `<section id="evidence" aria-labelledby="evidence-title">`.

---

## 2) Structure & layout

* **Container** : `.container` (max‑width 1440px, `px-6`).
* **Grille** : `grid grid-cols-1 lg:grid-cols-12 gap-10 items-center`.

  * **Col. texte** (gauche) : `lg:col-span-6`.
  * **Col. carte** (droite) : `lg:col-span-6`.
* **Espacements** : `py-16` section, `mt-3` entre titre → intro, `mt-4` pour listes.

---

## 3) Thème & tokens

* **Fond page** : `#e3e0db` (hérite du global).
* **Titres** : `#0F172A` (ink), **600–700**.
* **Paragraphe** : `#334155` (muted).
* **Carte** (officielle) : fond `#FFFFFF`, bordure `rgba(0,0,0,.06)`, **radius 20px**, ombre `0 20px 50px rgba(15,23,42,.12)`.
* **Pill OFFICIEL** : `bg-emerald-600/10`, `text-emerald-700`, `ring-1 ring-emerald-600/20`.
* **Accent brand** : gradient `#FAB652 → #F25636 → #E0026D` autorisé pour pictos/boutons.
* **Glow interne** carte : radiaux **très légers**, **strictement internes** (aucun débordement sur le BG global).

```css
/* Calques décoratifs internes à la carte (ne pas dépasser) */
.evidence-card::before{
  content:""; position:absolute; inset:0; pointer-events:none; opacity:.85;
  background:
    radial-gradient(60% 60% at 120% -10%, rgba(242,86,54,.13), transparent 60%),
    radial-gradient(30% 30% at 0% 100%, rgba(224,2,109,.08), transparent 60%);
}
```

---

## 4) Anatomie — Colonne **texte** (gauche)

* **Titre (H2)** : `C’est quoi une “preuve” ?` (sans emojis, ton institutionnel).
* **Intro** : une phrase : *« Une preuve, c’est un petit dossier qui résume ce qui a été fait et validé — concret, pas techno. »*
* **Liste (4 points)** :

  1. **Actions clés** : qui, quoi, quand.
  2. **Résultats** : OK / À risque, décisions.
  3. **Version livrée** : référence horodatée.
  4. **Empreinte numérique** : garantit l’intégrité.
* **Outro** : 2 lignes max (utilité : client, audit, subvention, mémoire interne).

---

## 5) Anatomie — **Carte officielle** (droite)

**Wrapper** : `.card evidence-card relative p-6 overflow-hidden`.

**Header**

* À gauche : icône (capsule, **gradient brand**, 36–40px) + titre **« Preuve d’exécution »**.
* À droite : **Pill « OFFICIEL »** (voir tokens). Rôle visuel.
* **Séparateur** : `border-b border-slate-200 pb-3`.

**Body** (stack `gap-2`, taille texte `15px`)

* **Réf.** : `cockpit@0.1.0-demo` (mono optionnel pour la ref).
* **Émis le** : ISO local (ex : `2025‑09‑05 14:32`).
* **Actions** : `/kit onboarding · /assign Proc‑23`.
* **Résultats** : `OK · À faire · Décision validée`.
* **Empreinte** : `sha256: <64 hex>` en **monospace** `text-sm` + libellé **Empreinte** en gras.

**Footer**

* À gauche : petit texte `Document signé • Intégrité vérifiée`.
* À droite : **Bouton/Label « Validé »** (gradient brand) `px-3 py-1` (pas un vrai bouton en v1).
* **Watermark** : `ARKA` **en bas‑droite**, `text-[72px]`, **ultra‑faible** (`text-slate-900/5`) & `rotate(-15deg)`.

**A11y**

* Le watermark est `aria-hidden="true"`.
* Icône décorative avec `aria-hidden` (ou `role="img" aria-label="Document"` si nécessaire).

---

## 6) Accessibilité (AA)

* Section : `<section id="evidence" aria-labelledby="evidence-title">` + `<h2 id="evidence-title">…</h2>`.
* Contraste : titres ≥ 7:1, paragraphes ≥ 4.5:1.
* Empreinte en **mono** lisible (≥ 12–13px), sélectionnable et **copiable** (via bouton optionnel voir §8).
* Sémantique : la carte peut être un `<article aria-label="Preuve d’exécution">`.

---

## 7) Responsivité

* **≥1280px** : grille 6/6 comme décrit, carte à hauteur naturelle.
* **md (≥768px)** : garder 6/6.
* **sm (<768px)** : pile verticale (texte **au‑dessus**, carte **au‑dessous**), mêmes paddings, glows conservés.

---

## 8) Interactions & micro‑UI (v1)

* **Copier l’empreinte** : petit bouton texte `Copier` (option) placé après la valeur → copie au presse‑papiers, feedback *« Copié »* 1,2 s.
* **Télécharger** (option v1.1) : lien discret `Télécharger (.json)` → export du JSON de preuve.
* **Reduced motion** : désactiver toute animation d’apparition éventuelle.

---

## 9) Performance

* **Aucune image distante obligatoire** (SVG icônes inline). Watermark = texte.
* La carte ne doit pas devenir LCP. Priorité : **image du Hero**.
* **CLS** : réserver les hauteurs (pas de contenu async qui pousse la carte).

---

## 10) API/Props (composant)

```ts
export type Proof = {
  ref: string;                 // ex: "cockpit@0.1.0-demo"
  issued_at_iso: string;       // ex: "2025-09-05T14:32:00+02:00"
  actions: string[];           // ex: ["/kit onboarding","/assign Proc-23"]
  results: string[];           // ex: ["OK","À faire","Décision validée"]
  version_ref?: string;        // ex: "arkabox@1.4.2#build.178"
  digest: { algo: 'sha256'; value: string }; // 64 hex
  status: 'VALIDATED'|'RISK'|'DRAFT';
  issuer?: string;             // ex: "Arka Cockpit"
  signature?: { type: 'ed25519'|'rsa'; signer: string; valid: boolean } | null;
};

export type EvidenceProps = {
  proof: Proof;                 // données à afficher
  onCopyDigest?: (value: string) => void; // callback (analytics)
};
```

---

## 11) Exemples de markup

### 11.1 HTML/Tailwind

```html
<section id="evidence" aria-labelledby="evidence-title" class="py-16">
  <div class="container grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
    <!-- Col gauche : texte -->
    <div class="lg:col-span-6">
      <h2 id="evidence-title" class="text-3xl md:text-4xl font-semibold text-[#0F172A]">C’est quoi une “preuve” ?</h2>
      <p class="mt-3 text-[#334155] max-w-2xl">Une preuve, c’est un petit dossier qui résume ce qui a été fait et validé — concret, pas techno.</p>
      <ul class="mt-4 space-y-2 text-[#334155]">
        <li>Les actions clés (qui, quoi, quand).</li>
        <li>Les résultats (OK / À risque, décisions).</li>
        <li>La version livrée (référence horodatée).</li>
        <li>Une empreinte numérique pour garantir l’intégrité.</li>
      </ul>
      <p class="mt-3 text-[#334155] max-w-2xl">Lisible et rejouable. Utile pour un client, un audit, un dossier de subvention… Ou simplement pour garder la mémoire claire.</p>
    </div>

    <!-- Col droite : carte -->
    <article class="lg:col-span-6 relative card evidence-card p-6 overflow-hidden" aria-label="Preuve d’exécution">
      <header class="relative flex items-center justify-between border-b border-slate-200 pb-3">
        <div class="flex items-center gap-3">
          <div class="bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] text-white inline-flex h-9 w-9 items-center justify-center rounded-full">
            <!-- icône -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          </div>
          <div class="font-semibold text-slate-900">Preuve d’exécution</div>
        </div>
        <span class="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20 px-3 py-1 text-sm">OFFICIEL</span>
      </header>

      <div class="relative mt-4 grid gap-2 text-slate-800 text-[15px]">
        <div><span class="font-medium">Réf.</span> : cockpit@0.1.0-demo • <span class="font-medium">Émis le</span> : 2025‑09‑05 14:32</div>
        <div><span class="font-medium">Actions</span> : /kit onboarding · /assign Proc‑23</div>
        <div><span class="font-medium">Résultats</span> : OK · À faire · Décision validée</div>
        <div class="font-mono text-sm text-slate-600"><span class="font-medium not-italic">Empreinte</span> : sha256: 9f8c…e21
          <button class="ml-2 text-xs underline decoration-dotted">Copier</button>
        </div>
      </div>

      <footer class="relative mt-6 flex items-center justify-between border-t border-slate-200 pt-3">
        <div class="text-xs text-slate-500">Document signé • Intégrité vérifiée</div>
        <div class="bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] text-white inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm">
          <!-- icône check -->
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          Validé</div>
      </footer>

      <div aria-hidden class="pointer-events-none absolute -right-10 -bottom-6 rotate-[-15deg] text-[72px] font-black text-slate-900/5 select-none">ARKA</div>
    </article>
  </div>
</section>
```

### 11.2 React (props)

```tsx
<Evidence proof={{
  ref: "cockpit@0.1.0-demo",
  issued_at_iso: new Date().toISOString(),
  actions: ["/kit onboarding","/assign Proc-23"],
  results: ["OK","À faire","Décision validée"],
  digest: { algo: 'sha256', value: '9f8c1a…0be21' },
  status: 'VALIDATED', issuer: 'Arka Cockpit'
}}/>
```

---

## 12) Tests d’acceptation (QA)

* **Texte** clair : titre, intro, 4 points, outro présents et lisibles.
* **Carte** crédible : `OFFICIEL` visible, `Réf.`, `Émis le`, `Actions`, `Résultats`, `Empreinte` (mono) présents.
* **Empreinte** : 64 hex (sha256), **copiable** (feedback).
* **Watermark** discret, non gênant, `aria-hidden`.
* **Glows** : strictement **internes** à la carte, aucun halo sur le BG global.
* **AA** : contrastes OK, tailles ≥ 14–16px (texte), focus visible sur `Copier`.
* **Perf** : aucun impact LCP ; pas de CLS.

---

## 13) Erreurs & fallback

* **Données manquantes** : masquer la ligne (ex : `signature`) sans casser la grille.
* **Empreinte invalide** : afficher en texte `Empreinte indisponible` (muted), désactiver `Copier`.
* **JS off** : bouton `Copier` devient un simple `<code>` sélectionnable.


# Section 9 « Pour qui » — Spécification ultra‑détaillée (v1.0)

> **Concerne** : section audience/segments de la landing. Thème **clair** (fond page `#e3e0db`). 4 **cartes** en grille (2×2 ≥ md), glows **variés** et discrets, **image illustrative sans cadre** à gauche en desktop.

---

## 1) Rôle & objectifs

* **But** : identifier clairement les publics visés en 8–12 secondes.
* **Composant** : `Audience`.
* **Landmark** : `<section id="who" aria-labelledby="who-title">`.

---

## 2) Structure & layout

* **Container** : `.container` (max‑width 1440px, `px-6`).
* **En‑tête centré** :

  * **Titre (H2)** : `Pour qui` (font‑semibold 600).
  * **Sous‑titre** : `Aujourd’hui et demain` (font‑medium 500).
* **Grille principale (desktop ≥ 1024px)** : `grid grid-cols-12 gap-10 items-center`.

  * **Col. image** : `col-span-5` à gauche.
  * **Col. cartes** : `col-span-7` à droite → `grid md:grid-cols-2 gap-6 auto-rows-fr`.
* **Mobile (< 768px)** : pile verticale : image → cartes (4) pleine largeur.

---

## 3) Thème & tokens

* **Fond page** : `#e3e0db`.
* **Carte** : `--surface:#FFFFFF`, `--border: rgba(0,0,0,.06)`, radius **16–20px**, ombre douce `0 12px 30px rgba(15,23,42,.08)`.
* **Texte** : principal `#0F172A`, secondaire `#334155`.
* **Accent icône** : **dégradé brand** (135° : `#FAB652 → #F25636 → #E0026D`).
* **Glows internes** (dans la carte uniquement) :

```css
.cardGlowA::before{content:"";position:absolute;inset:0;pointer-events:none;background:
  radial-gradient(30% 24% at 10% 8%, #FAB6521A, transparent),
  radial-gradient(22% 18% at 90% 88%, #E0026D12, transparent)}
.cardGlowB::before{content:"";position:absolute;inset:0;pointer-events:none;background:
  radial-gradient(36% 30% at 88% 12%, #FAB6521A, transparent),
  radial-gradient(24% 22% at 18% 82%, #E0026D12, transparent)}
.cardGlowC::before{content:"";position:absolute;inset:0;pointer-events:none;background:
  radial-gradient(40% 30% at 14% 88%, #FAB6521A, transparent),
  radial-gradient(24% 22% at 86% 24%, #E0026D12, transparent)}
.cardGlowD::before{content:"";position:absolute;inset:0;pointer-events:none;background:
  radial-gradient(48% 38% at 78% 52%, #FAB65219, transparent),
  radial-gradient(24% 20% at 22% 20%, #E0026D10, transparent)}
```

---

## 4) Anatomie d’une carte

* **Wrapper** : `relative overflow-hidden card ring-1 ring-black/5 rounded-[20px] p-6 md:p-7` + une classe glow (`cardGlowA…D`).
* **En‑tête** : icône dans capsule $**dégradé brand**, 36px–40px, `rounded-xl`$ + titre **semibold**.
* **Contenu** :

  * **Liste** 2–3 puces (✅ icône `Check` 16px), **ou** un court paragraphe (max 140 caractères).
  * Interlignage `leading-relaxed`, taille `text-sm` / `text-base` selon densité.
* **Hauteur** : `auto-rows-fr` côté grille pour uniformiser visuel.

---

## 5) Contenus validés

* **RH solo et petites équipes**

  * Puces : `Décharger le quotidien`, `Sans embaucher`.
* **PME et directions**

  * Puces : `Piloter missions & preuves`, `Décider en confiance`.
* **Écoles et formations**

  * Puces : `Scénarios guidés`, `10× plus vite`, `Sans données sensibles`.
* **Extensions**

  * Paragraphe : `Compta, Finance, Marketing, Support. La squad s’installe, documente et tient la durée.`

---

## 6) Image (colonne gauche)

* **Nature** : illustration **sans fond** (PNG/WEBP/AVIF), **sans cadre**.
* **Style** : `object-contain; width:100%; height:auto;` + blur **décoratif** léger en arrière‑plan optionnel.
* **Alt** : `Publics visés par Arka` (10–12 mots si besoin).
* **Perf** : `loading="lazy"` $sauf LCP local si image très visible$, `decoding="async"`.

---

## 7) Accessibilité (AA)

* `<section id="who" aria-labelledby="who-title">` + `<h2 id="who-title">Pour qui</h2>`.
* Icônes décoratives : `aria-hidden="true"`.
* Contrastes AA : titres ≥ 7:1, paragraphes ≥ 4.5:1 sur fond blanc.
* **Clavier** : navigation séquentielle header → cartes $ordre DOM$. Focus visible sur liens/boutons éventuels.

---

## 8) Responsivité

* **≥ 1280px** : image gauche $5 cols$ + grille 2×2 à droite.
* **md (≥ 768px)** : idem; gap 6–10.
* **sm (< 768px)** : image pleine largeur, puis 4 cartes empilées.
* **Motion** : si `prefers-reduced-motion` → désactiver flous/animations secondaires.

---

## 9) API/Props (composant)

```ts
export type AudienceItem = {
  id: string;
  icon: React.ReactNode; // ou nom d’icône si mapping interne
  title: string;
  points?: string[];     // 0..3
  long?: string;         // alternatif à points
  glow?: 'A'|'B'|'C'|'D';
};

export type AudienceProps = {
  title?: string;          // défaut: "Pour qui"
  subtitle?: string;       // défaut: "Aujourd’hui et demain"
  image?: { src:string; alt:string; }; // illustr.
  items: AudienceItem[];   // longueur = 4
};
```

* **Défauts** : items préremplis avec les contenus §5, mapping glows : A,B,C,D dans l’ordre.

---

## 10) Exemples de markup

### 10.1 HTML/Tailwind

```html
<section id="who" aria-labelledby="who-title" class="py-16">
  <div class="container">
    <header class="text-center max-w-4xl mx-auto">
      <h2 id="who-title" class="text-3xl md:text-4xl font-semibold text-[#0F172A]">Pour qui</h2>
      <p class="mt-2 text-[#334155] font-medium">Aujourd’hui et demain</p>
    </header>

    <div class="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-5 relative">
        <img src="/assets/hero/arkabox-board.avif" alt="Publics visés par Arka" class="w-full h-auto object-contain" loading="lazy" decoding="async" />
        <div aria-hidden class="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-50 [background:radial-gradient(30%_30%_at_30%_60%,#FAB65233,transparent),radial-gradient(30%_30%_at_70%_40%,#E0026D22,transparent)]"></div>
      </div>

      <div class="lg:col-span-7 grid md:grid-cols-2 gap-6 auto-rows-fr">
        <article class="relative overflow-hidden cardGlowA rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_30px_rgba(15,23,42,.08)] p-6">
          <div class="relative">
            <div class="flex items-center gap-3">
              <div class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white" style="background-image:linear-gradient(135deg,#FAB652,#F25636 50%,#E0026D)">👥</div>
              <div class="font-semibold text-[#0F172A]">RH solo et petites équipes</div>
            </div>
            <ul class="mt-3 space-y-2 text-[#334155]">
              <li class="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1 opacity-80"><polyline points="20 6 9 17 4 12"/></svg> Décharger le quotidien</li>
              <li class="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1 opacity-80"><polyline points="20 6 9 17 4 12"/></svg> Sans embaucher</li>
            </ul>
          </div>
        </article>

        <article class="relative overflow-hidden cardGlowB rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_30px_rgba(15,23,42,.08)] p-6">
          <div class="relative">
            <div class="flex items-center gap-3">
              <div class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white" style="background-image:linear-gradient(135deg,#FAB652,#F25636 50%,#E0026D)">🏢</div>
              <div class="font-semibold text-[#0F172A]">PME et directions</div>
            </div>
            <ul class="mt-3 space-y-2 text-[#334155]">
              <li class="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1 opacity-80"><polyline points="20 6 9 17 4 12"/></svg> Piloter missions & preuves</li>
              <li class="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1 opacity-80"><polyline points="20 6 9 17 4 12"/></svg> Décider en confiance</li>
            </ul>
          </div>
        </article>

        <article class="relative overflow-hidden cardGlowC rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_30px_rgba(15,23,42,.08)] p-6">
          <div class="relative">
            <div class="flex items-center gap-3">
              <div class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white" style="background-image:linear-gradient(135deg,#FAB652,#F25636 50%,#E0026D)">🎓</div>
              <div class="font-semibold text-[#0F172A]">Écoles et formations</div>
            </div>
            <ul class="mt-3 space-y-2 text-[#334155]">
              <li class="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1 opacity-80"><polyline points="20 6 9 17 4 12"/></svg> Scénarios guidés</li>
              <li class="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1 opacity-80"><polyline points="20 6 9 17 4 12"/></svg> 10× plus vite</li>
              <li class="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1 opacity-80"><polyline points="20 6 9 17 4 12"/></svg> Sans données sensibles</li>
            </ul>
          </div>
        </article>

        <article class="relative overflow-hidden cardGlowD rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_30px_rgba(15,23,42,.08)] p-6">
          <div class="relative">
            <div class="flex items-center gap-3">
              <div class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white" style="background-image:linear-gradient(135deg,#FAB652,#F25636 50%,#E0026D)">💼</div>
              <div class="font-semibold text-[#0F172A]">Extensions</div>
            </div>
            <p class="mt-3 text-[#334155]">Compta, Finance, Marketing, Support. La squad s’installe, documente et tient la durée.</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</section>
```

### 10.2 React (props)

```tsx
<Audience
  image={{ src:"/assets/hero/arkabox-board.avif", alt:"Publics visés par Arka" }}
  items={[
    { id:"rh",  icon:<Users size={18}/>,        title:"RH solo et petites équipes", points:["Décharger le quotidien","Sans embaucher"], glow:'A' },
    { id:"pme", icon:<Building2 size={18}/>,    title:"PME et directions",          points:["Piloter missions & preuves","Décider en confiance"], glow:'B' },
    { id:"edu", icon:<GraduationCap size={18}/>,title:"Écoles et formations",       points:["Scénarios guidés","10× plus vite","Sans données sensibles"], glow:'C' },
    { id:"ext", icon:<Briefcase size={18}/>,    title:"Extensions",                 long:"Compta, Finance, Marketing, Support. La squad s’installe, documente et tient la durée.", glow:'D' },
  ]}
/>
```

---

## 11) Performance

* Image **lazy** (hors cas LCP local), poids cible ≤ 120 KB (desktop), ≤ 80 KB (mobile). Formats **AVIF/WEBP** + PNG fallback.
* Aucun chargement d’assets décoratifs lourds pour les glows (CSS only).
* **CLS 0** : réserver la place de l’image via container fixe.

---

## 12) Tests d’acceptation (QA)

* Titre + sous‑titre centrés, alignés au container.
* En desktop : image **à gauche** sans cadre ; 4 cartes **homogènes** à droite (hauteurs visuelles alignées).
* Glows **non identiques** entre cartes et **confinés** à l’intérieur.
* Contrastes AA OK, icônes décoratives non annoncées.
* Mobile : cartes empilées sous l’image, espaces équilibrés.

---

## 13) Erreurs & fallback

* **Image manquante** : afficher un placeholder dégradé + libellé `Illustration` ; conserver hauteurs.
* **Icône non fournie** : fallback `Check` avec teinte slate.
* **JS off** : aucun comportement dynamique requis.

---

## 14) Télémétrie (facultatif)

* `landing.audience.view` (visible)
* `landing.audience.card_click` (id)


# Section 10 - Footer — Spécification ultra‑détaillée (v1.0)

> **Concerne** : pied de page marketing de la landing Arka. Thème **clair** (fond global `#e3e0db`).
> **Objectifs** : terminer la page proprement, fournir les liens légaux et contact, garantir l’accessibilité et la cohérence de marque.

---

## 1) Rôle & position

* **Composant** : `Footer`.
* **Landmark** : `<footer role="contentinfo" aria-label="Pied de page du site">`.
* **Position** : en bas du document, immédiatement après la dernière section de contenu.
* **Largeur** : **100%** viewport ; contenu centré par **container** (max‑width **1440px**, padding **24px**).
* **Hauteur** : auto ; **espacement vertical** `py-10` (desktop), `py-8` (mobile).

---

## 2) Structure & layout

* **Container** : `.container mx-auto max-w-[90rem] px-6`.
* **Grille desktop** : `flex items-center justify-between gap-4`.
* **Mobile (<768px)** : `flex-col sm:flex-row` → empilement **logo** au‑dessus, **liens** en dessous, centrés.
* **Séparateur haut** :

  * Bordure `border-t border-[rgba(0,0,0,.10)]`.
  * Aucun gradient ni ombre lourde.

**Arborescence recommandée** :

```
<footer>
  <div class="container ...">
    <div class="branding">arka (texte en gradient)</div>
    <nav aria-label="Liens de bas de page">
      <ul class="links">[Mentions] • [Contact] • [Statut]</ul>
    </nav>
  </div>
</footer>
```

---

## 3) Thème & tokens

* **Fond page** : hérite de `--bg: #e3e0db`.
* **Texte** : principal `#0F172A`, secondaire `#475569` (≈ slate‑600).
* **Bordures** : `rgba(0,0,0,.10)`.
* **Logo** : texte **arka** avec **gradient brand** (135°: `#FAB652 → #F25636 → #E0026D`).
* **Rayons** : aucun (footer plat, cohérent avec l’en‑tête).

Tokens à réutiliser (déjà définis dans la spec globale) :

```css
:root{ --grad-start:#FAB652; --grad-mid:#F25636; --grad-end:#E0026D; --brand-grad:linear-gradient(135deg,var(--grad-start),var(--grad-mid) 50%,var(--grad-end)); }
```

---

## 4) Contenu & ordre visuel

* **Branding** (gauche) :

  * `<span class="text-xl font-extrabold tracking-tight bg-clip-text text-transparent" style="background-image:var(--brand-grad)">arka</span>`.
* **Liens** (droite) :

  * **Mentions** → `/legal/mentions`
  * **Contact** → `/contact`
  * **Statut** → `/status`
* **Séparateurs** : `·` (point milieu) **visuel** seulement (`aria-hidden="true"`), liste balisée en `<ul>` pour l’accessibilité.
* **Tab order** : logo → Mentions → Contact → Statut.

Optionnels (non affichés v1, mais prévus dans l’API) : copyright `© {year} Arka`, réseaux sociaux.

---

## 5) Accessibilité (AA)

* `<footer role="contentinfo">` + `<nav aria-label="Liens de bas de page">`.
* Liens avec **focus visible** (`ring-2 ring-black/20 rounded`).
* Séparateurs « · » marqués `aria-hidden="true"` **et** structure réelle en **liste** pour lecteurs d’écran.
* Contraste texte/fond ≥ **4.5:1** ; vérifier particulièrement l’état `:hover`.

---

## 6) Responsivité

* **≥768px** : `flex-row` (logo à gauche, nav à droite).
* **<768px** : `flex-col` centré, `gap-y-4`, liens en **wrap** (`gap-x-3 gap-y-2`).

---

## 7) Micro‑interactions

* **Hover liens** : teinte plus foncée `hover:text-[#0F172A]` + soulignement léger `hover:underline underline-offset-4`.
* **Focus clavier** : `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20`.
* **Reduced motion** : aucune animation nécessaire.

---

## 8) API/Props (composant)

```ts
export type FooterLink = { label: string; href: string };
export type FooterProps = {
  links?: FooterLink[];               // défaut: Mentions/Contact/Statut
  showLogo?: boolean;                 // défaut: true
  year?: number;                      // défaut: new Date().getFullYear()
  onLinkClick?: (href: string) => void; // télémétrie (facultatif)
};
```

**Valeurs par défaut** :

```ts
links = [
  { label: 'Mentions', href: '/legal/mentions' },
  { label: 'Contact',  href: '/contact' },
  { label: 'Statut',   href: '/status' }
];
```

---

## 9) Exemples de markup

### 9.1 HTML/Tailwind

```html
<footer role="contentinfo" class="mt-24 border-t border-black/10">
  <div class="mx-auto max-w-[90rem] px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
    <div class="text-xl font-extrabold tracking-tight text-slate-900">
      <span class="bg-clip-text text-transparent" style="background-image:linear-gradient(135deg,#FAB652 0%,#F25636 50%,#E0026D 100%)">arka</span>
    </div>
    <nav aria-label="Liens de bas de page">
      <ul class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <li><a href="/legal/mentions" class="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded">Mentions</a></li>
        <li aria-hidden="true" class="text-slate-400">·</li>
        <li><a href="/contact" class="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded">Contact</a></li>
        <li aria-hidden="true" class="text-slate-400">·</li>
        <li><a href="/status" class="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded">Statut</a></li>
      </ul>
    </nav>
  </div>
</footer>
```

### 9.2 React (props)

```tsx
<Footer
  year={new Date().getFullYear()}
  onLinkClick={(href)=>telemetry('landing.footer.click', { href })}
/>
```

---

## 10) Performance & SEO

* **Zéro** image distante ; mise en page simple (1 div + nav).
* Texte **sélectionnable** ; pas de contenu masqué important.
* Aucune dépendance JS ; fonctionne **sans JS**.

---

## 11) Tests d’acceptation (QA)

* Bordure supérieure visible (`border-t` `rgba(0,0,0,.10)`).
* Logo **arka** avec gradient brand (texte lisible, pas pixellisé).
* Liens **exactement** : `/legal/mentions`, `/contact`, `/status`.
* **Tab order** logique ; focus visibles.
* Mobile : logo au‑dessus, liens en wrap, centrés ; desktop : alignement **gauche/droite**.
* Contrastes AA OK.

---

## 12) Erreurs & fallback

* **Police manquante** : fallback `ui-sans-serif, system-ui, Arial`.
* **CSS no‑gradient** : afficher le logo en texte plein (#0F172A) sans gradient.
* **No JS** : aucune dégradation.
