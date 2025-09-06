
# base CSS — Spécification ultra‑détaillée (v1.0)

```css

/* ---------------------------------------------
   Fonts
   --------------------------------------------- */

/* Option A: Google Fonts (simple)  */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap");

/* Option B: auto-host (remplace ces URLs par tes fichiers si besoin)
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter-Variable.woff2") format("woff2");
  font-weight: 100 900; font-display: swap;
}
@font-face {
  font-family: "JetBrains Mono";
  src: url("/fonts/JetBrainsMono[wght].woff2") format("woff2");
  font-weight: 100 800; font-display: swap;
}
*/

:root {
  /* Font stacks */
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

  /* Radii & layout tokens */
  --r-xs: 6px;
  --r-sm: 8px;
  --r-md: 12px;
  --r-xl: 16px;
  --gap: 12px;

  /* Elevation */
  --shadow-soft: 0 1px 0 rgba(0,0,0,.25), 0 8px 24px rgba(0,0,0,.25);
  --ring-soft: rgb(51 65 85 / 0.60); /* = ring.soft */

  /* Brand gradient (used on bars/badges when demandé) */
  --grad-start: #FAB652;
  --grad-mid:   #F25636;
  --grad-end:   #E0026D;
  --brand-grad: linear-gradient(135deg, var(--grad-start) 0%, var(--grad-mid) 50%, var(--grad-end) 100%);
}

/* Theme — Dark (par défaut)  */
:root,
.theme-dark {
  /* Surfaces & borders */
  --bg:       #0C1117;
  --surface:  #10161D;
  --elevated: #141B23;
  --border:   #1F2A33; /* = border.soft */
  --bubble:   #18212B;

  /* Text */
  --fg:     #FFFFFF; /* text.primary */
  --fgdim:  #CBD5E1; /* text.secondary */
  --muted:  #94A3B8; /* text.muted */

  /* States */
  --primary: #22D3EE;
  --success: #10B981;
  --warn:    #F59E0B;
  --danger:  #E11D48;
}

/* Theme — Light (optionnel, si tu veux un switch plus tard) */
.theme-light {
  --bg:       #F6F7F9;
  --surface:  #FFFFFF;
  --elevated: #FFFFFF;
  --border:   #E5E7EB;
  --bubble:   #F3F4F6;

  --fg:     #0B1220;
  --fgdim:  #4B5563;
  --muted:  #6B7280;

  --primary: #0EA5E9;
  --success: #10B981;
  --warn:    #F59E0B;
  --danger:  #DC2626;
}

/* Base document */
html, body, #root {
  height: 100%;
}
html, body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Typo helpers */
.mono { font-family: var(--font-mono); }
.text-primary   { color: var(--fg); }
.text-secondary { color: var(--fgdim); }
.text-muted     { color: var(--muted); }

/* Card / panel helpers */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-soft);
}
.bubble {
  background: var(--bubble);
  border: 1px solid var(--border);
  border-radius: 12px;
}

/* Buttons (neutres) */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  height: 32px; padding: 0 12px;
  color: var(--fg); background: transparent;
  border: 1px solid var(--border);
  border-radius: 10px;
}
.btn:hover { background: rgba(255,255,255,.05); }
.btn:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--ring-soft); }

/* Status pills */
.pill    { padding: 2px 8px; border: 1px solid transparent; border-radius: 999px; font-size: 12px; }
.pill--pass { background: color-mix(in oklab, var(--success) 18%, transparent); color: var(--success); border-color: color-mix(in oklab, var(--success) 30%, transparent); }
.pill--warn { background: color-mix(in oklab, var(--warn) 18%, transparent);    color: var(--warn);    border-color: color-mix(in oklab, var(--warn) 30%, transparent); }
.pill--fail { background: color-mix(in oklab, var(--danger) 18%, transparent);  color: var(--danger);  border-color: color-mix(in oklab, var(--danger) 30%, transparent); }

/* Progress / badges avec dégradé brand */
.brand-gradient { background-image: var(--brand-grad); }

/* Scrollbars — discrets, n’apparaissent qu’au survol des zones scrollables */
*::-webkit-scrollbar       { width: 8px; height: 8px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background: transparent; border-radius: 8px; border: 2px solid transparent; }
*:hover::-webkit-scrollbar-thumb { background: var(--bubble); }

.scroller { scrollbar-width: thin; scrollbar-color: transparent transparent; }
.scroller:hover { scrollbar-color: var(--bubble) transparent; }

/* Focus global (clavier) */
:where(button, a, input, select, textarea, [role="button"]):focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--ring-soft);
  border-radius: 8px;
}

/* Inputs (search / chat) */
.input {
  height: 36px; padding: 0 12px;
  background: var(--elevated);
  color: var(--fg);
  border: 1px solid var(--border);
  border-radius: 9999px;
}
.input::placeholder { color: color-mix(in oklab, var(--fgdim) 70%, transparent); }

/* Textarea style “bulle” (chat composer) */
.textarea-bubble {
  background: color-mix(in oklab, var(--elevated) 80%, transparent);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--fg);
}

/* Utility spacing for sections that doivent scroller
   (le body reste sans scroll global) */
html, body { overflow: hidden; }
.section-scroll { min-height: 0; overflow: auto; }

  ```

# Topbar — Spec v1.0 (AppHeader)



## 1) Rôle & position

* **Composant**: `Topbar` (alias `AppHeader`).
* **Landmark**: `<header role="banner">`.
* **Comportement**: toujours visible en haut; peut être en `position: sticky; top:0; z-index:30` si tu veux qu’elle reste fixée.
* **Largeur**: 100% viewport; **hauteur**: `56px` (Tailwind `h-14`).

## 2) Grille & layout

* **Conteneur**: `grid grid-cols-[auto_1fr_auto] items-center h-14 px-4 gap-4`
* **Fond**: `bg-[var(--surface)]`
* **Bordure bas**: `border-b border-[var(--border)]`

Colonnes :

1. **Gauche (auto)** – logo.
2. **Centre (1fr)** – recherche centrée.
3. **Droite (auto)** – badge de rôle + actions.

## 3) Thème (tokens)

* `--surface` : #10161D (fond barre)
* `--border`  : #1F2A33 (séparateurs)
* `--fg`      : #FFFFFF (texte)
* `--fgdim`   : #CBD5E1 (texte secondaire)
* `--elevated`: #141B23 (fond du champ)
* `--ring-soft`: rgb(51 65 85 / 0.60) (focus)
* `--primary` : #22D3EE
* `--success` : #10B981
* `--muted`   : #94A3B8

> La topbar **doit** respecter ces variables (déjà présentes dans `Tokens`).

---

## 4) Zone gauche : Logo

* **Elément**: `<a href="/" aria-label="Arka">`
* **Visuel**: `<img src="/assets/logo/arka-logo-blanc.svg" alt="Arka" class="h-5 opacity-90" />`
* **Taille**: hauteur 20px (h-5); largeur auto.
* **Hit area**: minimum 32×32px (padding cliquable autour si besoin).
* **Hover**: légère montée d’opacité (`opacity-100`).
* **But**: retour Dashboard ou Home.

---

## 5) Zone centrale : Recherche

* **Wrapper** (centré):

  ```
  <div class="flex justify-center">
    <div class="flex items-center gap-2 text-[var(--fgdim)] 
                bg-[var(--elevated)] border border-[var(--border)] 
                rounded-full px-3 py-1 w-full max-w-xl">
      <Search class="w-4 h-4"/>
      <input ... />
    </div>
  </div>
  ```
* **Taille**: largeur fluide, **max** `max-w-xl` (≈ 36rem).
* **Champ**:

  * `type="search"`, `placeholder`: **“Rechercher (⌘K)”** (vient de `DEMO.topbar.search_placeholder`).
  * Classes: `bg-transparent outline-none text-[var(--fg)] placeholder:text-[var(--fgdim)]/70 w-full`
  * **Focus**: anneau `ring-1 ring-[var(--ring-soft)]` sur le wrapper (`:focus-within`).
* **Raccourci clavier**:

  * `⌘K` (Mac) / `Ctrl+K` (Win/Linux) → focus champ.
  * `Esc` → blur/fermer la palette si ouverte.
* **Palette de recherche (optionnel, plus tard)**:

  * Popover sous le champ, largeur du champ, coins `--r-xl`.
  * Sections: “Récents”, “Commandes” (ex: `>metrics`, `>doc POL-12`).
  * Navigation clavier: ↑ ↓ Entrée; `aria-activedescendant`.

---

## 6) Zone droite : Rôle + actions

* **Libellé**: “Role:” texte xs, `text-[var(--fgdim)]`.
* **Badge rôle**:

  * Classe commune: `px-2 py-1 rounded text-xs border`
  * **Couleurs** selon rôle:

    * `owner` → `border-[var(--primary)] text-[var(--primary)]`
    * `operator` → `border-[var(--success)] text-[var(--success)]`
    * `viewer` → `border-[var(--muted)] text-[var(--muted)]`
  * `aria-label="Current role: OWNER|OPERATOR|VIEWER"`.
* **Boutons**:

  * **Share**: `h-8 px-3 rounded bg-white/5 border border-[var(--border)] text-xs flex items-center gap-1`
  * **Run**: identique (icône `Play`).
  * **Hover**: background `bg-white/10`.
  * **Focus**: `ring-1 ring-[var(--ring-soft)]`.
  * **Disabled (si besoin)**: baisser opacité à .5 + cursor-not-allowed.

---

## 7) Accessibilité (A11y)

* `<header role="banner" aria-label="Application top bar">`
* Champ de recherche: `aria-label="Rechercher"`.
* Boutons avec `aria-label` explicites; icônes **jamais seules** sans titre (déjà OK via texte).
* Contraste AA: fond sombre + texte clair (déjà aligné).

---

## 8) Responsivité

* ≥ **1280px**: comportement actuel (recherche `max-w-xl`).
* **lg (≥1024px)**: rien à changer.
* **md (<1024px)**: réduire `max-w-lg` (optionnel).
* **sm (<768px)**:

  * Le champ peut passer en **icône seule** (loupe). Clic ouvre un **dialog** plein écran pour la recherche.
  * Les boutons “Share / Run” restent visibles mais tu peux les passer en **icône** seule si manque d’espace.

> Dans ta preview actuelle, on peut garder le comportement desktop partout—mais l’intégrateur a ce plan de repli.

---

## 9) API/props (composant)

```ts
type Role = 'viewer' | 'operator' | 'owner';

type TopbarProps = {
  role: Role;                       // rendu du badge
  onSearchFocus?: () => void;       // ⌘K / Ctrl+K ou click dans input
  onShare?: () => void;             // click bouton Share
  onRun?: () => void;               // click bouton Run
  onLogoClick?: () => void;         // click logo
  placeholder?: string;             // défaut: "Rechercher (⌘K)"
};
```

* Valeurs par défaut: `placeholder = DEMO.topbar.search_placeholder`.

---

## 10) États & micro-interactions

* **Hover** sur éléments cliquables: `bg-white/5` ou opacité à 100%.
* **Focus clavier**: anneau `var(--ring-soft)` sur **wrapper du champ** et **boutons**.
* **Loading** (optionnel): afficher un spinner dans le champ quand la palette charge.
* **Erreur** (optionnel): bordure champ en `var(--danger)` + message court sous le champ.

---

## 11) Télémétrie (facultatif)

* `header.search.focus`
* `header.search.submit`
* `header.action.share`
* `header.action.run`
* `header.logo.click`

> Attacher `trace_id` courant si présent dans le HUD.

---

## 12) Tests d’acceptation (QA)

* La topbar tient en **56px** de hauteur partout.
* Le **logo** est à gauche, **recherche centrée**, **actions à droite**.
* `⌘K/Ctrl+K` focus le champ.
* Focus visible au clavier.
* Badge de rôle a la bonne couleur selon `role`.
* Icônes et textes ont un contraste AA suffisant.
* En <768px (si tu actives la variante), la recherche passe en icône et ouvre un dialog.

---

## 13) Exemple d’usage (exactement comme ta preview)

```tsx
<Topbar
  role="owner"
  onShare={() => {/* open share modal */}}
  onRun={() => {/* trigger CI run / test flow */}}
/>
```


# Leftbar — Spec v1.0 (SidebarNav)

## 1) Rôle & position

* **Composant**: `Leftbar` (alias `SidebarNav`).
* **Landmark**: `<nav aria-label="Navigation principale">`.
* **Position**: colonne gauche, **fixe** dans l’app-shell.
* **Dimensions**: largeur **72px** (Tailwind `w-[72px]`), **hauteur 100vh**.
* **Z-index**: 20 (en dessous de la topbar si elle est sticky).
* **Fond / bordures**: `bg-[var(--surface)]` + `border-r border-[var(--border)]`.

## 2) Grille & sections

* Haut (56px): bouton menu (icône “hamburger”).
* Liste des entrées (pile de boutons icône).
* Bas: **Messages (Inbox)** + **Avatar** (user) empilés.

```tsx
<aside className="h-full w-[72px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col">
  <div className="h-14 grid place-items-center border-b border-[var(--border)]">
    <Menu className="w-5 h-5" />
  </div>
  {/* items */}
  {/* footer: inbox + avatar */}
</aside>
```

## 3) Icônes (lucide-react)

Importer depuis `lucide-react` :

* **Dashboard** → `Activity`
* **Roadmap** → `CalendarRange`
* **Gouvernance (Builder)** → `Layers`
* **DocDesk** → `FileText`
* **Observabilité** → `Gauge`
* **Roster (Agents)** → `Users`
* **Inbox (messages)** → `Inbox` (bouton bas)
* **Menu (header de la sidebar)** → `Menu`

> Optionnels si besoin plus tard:
>
> * **Paramètres** → `Settings`
> * **Notifications** → `Bell`
> * **Aide** → `CircleHelp`

## 4) Entrées de menu (états)

* **Structure**: une liste d’items `{ id, label, icon }`.
* **Bouton**: `h-12 w-full grid place-items-center border-b border-[var(--border)] hover:bg-white/5`
* **Actif**: `bg-white/10` + `aria-current="page"`.
* **Focus clavier**: `ring-1 ring-[var(--ring-soft)]` (ajouter via `focus-visible:`).

```tsx
const items = [
  { id:'dashboard', label:'Dashboard', icon: Activity },
  { id:'roadmap', label:'Roadmap', icon: CalendarRange },
  { id:'builder', label:'Gouvernance', icon: Layers },
  { id:'docdesk', label:'DocDesk', icon: FileText },
  { id:'observa', label:'Observabilité', icon: Gauge },
  { id:'roster', label:'Roster', icon: Users },
];

<button
  key={i.id}
  onClick={()=>onChange(i.id)}
  title={i.label}
  aria-label={i.label}
  aria-current={value===i.id ? 'page' : undefined}
  className={cn("h-12 w-full grid place-items-center border-b border-[var(--border)] hover:bg-white/5",
                value===i.id && "bg-white/10")}
>
  <i.icon className="w-5 h-5" />
</button>
```

## 5) Footer (Inbox + Avatar)

* **Inbox** (messages):

  * Bouton `title="Messages" aria-label="Messages"`.
  * Classe: `h-12 w-full rounded-[12px] border border-[var(--border)] grid place-items-center hover:bg-white/5`.
  * Icône: `Inbox` (24px).
  * **Badge non-lu** (optionnel): petit point vert en `absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--success)]`.

* **Avatar** (utilisateur):

  * Conteneur: `relative w-12 h-12 rounded-full bg-white/10 grid place-items-center border border-[var(--border)]`.
  * Initiales/visuel au centre (ex: “O”).
  * **Présence**: petit **dot** en bas droite: `absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--success)] border-2 border-[var(--surface)]`.
  * `aria-label="Utilisateur connecté"` + `title="Mon compte"`.

## 6) Accessibilité

* `<nav aria-label="Navigation principale" role="navigation">`.
* Chaque bouton a `aria-label` + `title`.
* L’item actif **doit** avoir `aria-current="page"`.
* Focus visible au clavier (`focus-visible:ring …`).

## 7) Tokens & couleurs

* Utiliser les variables déjà posées :

  * fond: `var(--surface)`
  * bordures: `var(--border)`
  * texte: `var(--fg)`
  * hover: `bg-white/5`
  * actif: `bg-white/10`
  * focus ring: `var(--ring-soft)`

## 8) API/Props

```ts
type NavId = 'dashboard'|'roadmap'|'builder'|'docdesk'|'observa'|'roster';

type LeftbarProps = {
  value: NavId;                        // item courant
  onChange: (id: NavId) => void;       // callback sélection
  unread?: number;                     // nb messages non-lus pour Inbox (optionnel)
  presence?: 'online'|'away'|'busy';   // état avatar (optionnel)
};
```

## 9) Interactions & télémétrie (facultatif)

* `sidebar.click.{id}`
* `inbox.open`
* `avatar.open`

## 10) Tests d’acceptation

* Largeur 72px fixe, fond/bordures conformes.
* Icônes correctes (voir mapping ci-dessus).
* Item actif visuellement distinct + `aria-current`.
* Hover & focus visibles.
* Inbox et avatar **en bas** de la barre.
* Navigation au clavier possible (Tab → boutons).

---



# Arka Console — — Spécification ultra‑détaillée (v1.0)


> **Scope figé :** page **Dashboard** (accueil), **Topbar**, **Leftbar (sidebar)** et **Chat** persistant. Style sombre, back‑office, full‑page, scroll **par section** uniquement.

---

## 1) Layout général (figé)

* **Grid principale**: `Leftbar (72px)` + `Chat (380px)` + `Content (flex-1)` sous la **Topbar (56px)**.
* **Dashboard content** (3 colonnes) :

  * **Col 1–2 (2/3)** = **pile**: Roadmap preview *(40% hauteur)* au‑dessus, Runs *(60%)* en dessous.
  * **Col 3 (1/3)** = **Roster** scrollable.
* **Scroll**:

  * Body = `overflow: hidden`.
  * Sections `scroller` uniquement (Chat feed, Runs, Roster).
* **Breakpoints**: >=1280px optimisé. Entre 1024–1279px: Chat bascule à 320px ; en‑dessous, prévoir *collapse* Chat (v13).

---

## 2) Topbar (validée)

* **Placement**: logo **Arka** à gauche, **Search** centré, **Role badge** & actions à droite.
* **Actions**: `Share`, `Run` (CTA neutres pour démo).
* **Props suggérés**:

  * `role: 'viewer'|'operator'|'owner'` *(affiche la pastille et la couleur)*
  * `onSearch(query)`, `onShare()`, `onRun()`
* **A11y**: champ `aria-label="Rechercher"`, focus visible, tab order: Logo → Search → Role → Share → Run.

---

## 3) Leftbar / Sidebar (validée)

* **Items** (icônes seules): Dashboard, Roadmap, Gouvernance, DocDesk, Observabilité, Roster.
* **Foot**: bouton **Messages (Inbox)** au‑dessus, **Avatar** en bas avec statut.
* **Props suggérés**:

  * `view: string`, `setView(view: string)`
  * `items?: {id,label,icon}[]` *(extensible marketplace)*
* **A11y**: `aria-label` par bouton, tooltips courts.

---

## 4) Chat — Handoff (ultra‑détaillé)

**But**: chat persistant, toujours visible, lié à une *squad* et à un *agent* (non humain). Doit rester au‑dessus de la ligne de flottaison, avec scroll uniquement dans son *feed*.

### 4.1 Anatomy

* **Header** (56px):

  * `MessageSquare` + titre **Chat**.
  * **ThreadSelect** (long titre → retour à la ligne automatique).
  * **SquadChip** (ex: *Alpha*).
    **Icônes**: `MessageSquare`, `ChevronDown`.
* **Agent header** (compact):

  * Label "Agent du fil" + `Link2`.
  * **AgentSelect** (multi‑ligne, valeur = `AGP – Arka v2.5 · AGP`).
  * Mini‑fiche: avatar, nom, rôle, **barre de charge** en **dégradé brand**, `missions[]` (2 max), `risk` (⚠ perf), `doc` (📄 POL‑12), KPIs mini (`TTFT 1,2j · Gate 92% · 8/sem`).
  * Statut point vert/jaune/rouge + fuseau `UTC±`.
    **Icônes**: `Link2`, `Users`.
* **Feed** (scroll section only):

  * **Owner** (humain) → bulle à **droite** (`--bubble`, arrondi 12px).
  * Interlocuteurs (agents) → **texte clair** à **gauche** (pas de bulle, `border-left` doux).
  * Mise en évidence **automatique**: `Action:` et `9 fichiers lus` en **bleu primaire**. Détection via RegExp.
  * Groupement date + méta (`from`, `hh:mm`). État local: `queued` → `sending` (animer trois points) → `delivered` | `failed` (bouton **Resend**).
    **Icônes**: `AlertTriangle` (failed), `CheckCircle2` (delivered).
* **Composer** (96px): textarea large **identique** à la maquette (voir screenshot),

  * Bouton **Ajouter** (`Plus`), switch **Auto** (`SquareDashedMousePointer`), bouton **Envoyer** rond (`ArrowUp`).
  * Placeholders: *« Message à squad alpha… »*.
  * Raccourcis: `Enter` → envoyer, `Shift+Enter` → nouvelle ligne.
    **Icônes**: `Plus`, `SquareDashedMousePointer`, `ArrowUp`, optionnels: `Paperclip`, `Smile`.
* **Footer leftbar** (persistant): `Inbox` (messages) **au‑dessus** de l’avatar; Avatar en **bas** avec pastille *online*.

### 4.2 Composants & Props

```
<ChatPanel
  threads: {id:string; title:string; squad:string; last_msg_at:string}[]
  messagesByThread: Record<string, ChatMsg[]>
  agents: AgentCardProps[]
  activeThreadId: string
  onSelectThread(id:string): void
  onSelectAgent(id:string): void
  onSend(threadId:string, payload:{text:string; attachments?:File[]}): Promise<void>
/>

type ChatMsg = {
  id: string; from: string; role?: 'human'|'agent'|'system'; at: string; text: string;
  status?: 'queued'|'sending'|'delivered'|'failed';
};
```

### 4.3 Styles (tokens)

* Bulle droite: `background: var(--bubble); color: var(--text.primary); border-radius: 12px;`
* Message gauche: `border-left: 2px solid var(--border); padding-left: 12px; color: var(--text.primary) / 0.9;`
* Barre de charge: `background: var(--brand-grad); height: 8px; border-radius: 8px;`
* Scrollbar: invisible par défaut, visible au *hover* (`--bubble`).

### 4.4 Accessibilité

* `role="log" aria-live="polite"` pour le feed, annonce des nouveaux messages.
* Labels `aria-label` pour *ThreadSelect* et *AgentSelect*.
* Focus visible, navigation clavier complète; `Esc` sort du *Composer*.

### 4.5 API (contrats)

* `GET /api/chat/threads` → `[ { id, title, squad, last_msg_at } ]`
* `GET /api/chat/messages?thread_id=…` → `ChatMsg[]` triés ASC.
* `POST /api/chat/send` → `{ id, status: 'queued'|'sending'|'delivered' }`.
* Normalisation **timestamp** ISO, fuseau appliqué côté UI (`meta.tz`).

### 4.6 Rendu vide & états

* **Empty**: illustration discrète + CTA *« Démarrer une conversation »*.
* **Loading**: skeleton lignes; **Error**: bandeau rouge (`--danger`), bouton *Réessayer*.
* **Long feeds**: virtualisation (v13) au‑delà de 200 messages.

### 4.7 Tests (QA)

* Mise en évidence RegExp **Action/9 fichiers lus**.
* Bulle droite pour *Owner*, texte gauche pour agents.
* Scroll uniquement dans la zone feed; composer toujours visible.
* Multi‑ligne OK sur *ThreadSelect* et *AgentSelect* (pas de troncature).
* A11y: lecture screen‑reader des nouveaux messages.

**Jeu d’icônes (lucide-react)**: `MessageSquare`, `ChevronDown`, `Link2`, `Users`, `Plus`, `SquareDashedMousePointer`, `ArrowUp`, `AlertTriangle`, `CheckCircle2`, `Inbox`, *(optionnels)* `Paperclip`, `Smile`.

---

## 5) KPIs (cards)

* **Trois tuiles**: `TTFT p95`, `RTT p95`, `Errors p95`.
* Valeur **centrée**, **min/max** en coin, sparkline **arrondie** (pas de pics) + **remplissage dégradé**.
* **Props**: `{ label, value, unit, trend[] }`.

---

## 6) Roadmap (preview dans Dashboard)

* **12 mois** en header, **5 lanes** avec **colonne gauche compacte** (titre, tag, owner).
* Barres par lane avec palette discrète, *chip* id à droite.
* Ratio **40% Roadmap / 60% Runs** dans la pile centrale.

---

## 7) Runs (table)

* **Entêtes collants**, 20 / page (prévu pagination v13), lien `trace_id` cliquable.
* Pastilles **PASS (vert)**, **FAIL (rouge)**, **WARN (orange)** *(sans dégradé pour PASS – signal positif clair).*

---

## 8) Roster (cartes)

* Mini‑fiche **ultra‑compacte** : avatar, nom (ex: *AGP – Arka v2.5*), rôle, charge avec **barre dégradée brand**, badges missions, risques/doc, KPIs mini.
* **Scroll section only**.

---

## 9) Design system — tokens (dark)

```css
--bg:#0C1117; --surface:#10161D; --elevated:#141B23; --border:#1F2A33; /* border.soft */
--ring-soft: rgb(51 65 85 / 0.60);
--text.primary:#FFFFFF; --text.secondary:#CBD5E1; --text.muted:#94A3B8;
--success:#10B981; --danger:#E11D48; --warning:#F59E0B;
--grad-start:#FAB652; --grad-mid:#F25636; --grad-end:#E0026D; --brand-grad: linear-gradient(135deg,var(--grad-start),var(--grad-mid) 50%,var(--grad-end));
--bubble:#18212B; --r-xs:6px; --r-md:12px; --r-xl:16px;
```

**Scrollbar**: cachée par défaut, visible au *hover* (couleur `--bubble`).

---

## 10) Contrats & oracles (lecture seule UI)

* `GET /api/metrics/kpis` → `{ p95:{ttft_ms,rtt_ms}, error_rate_percent }` *(arrondi 1 décimale)*
* `GET /api/metrics/runs?page=1&limit=20` → table 20/l, tri stable, **trace\_id** visible.
* `GET /api/documents?page=1&page_size=20` → DocDesk (à venir) 20/l tri `created_at DESC, id ASC`.

---

## 11) A11y & Perf

* **WCAG 2.1 AA** min. Contrastes ≥ 4.5:1, focus visibles, navigation clavier complète.
* **Perf budgets**: `/` LCP ≤ 2.5s, `/console` TTI ≤ 2s, CLS < 0.1.

---

## 12) Structure de fichiers (KIT)

```
/app/console/page.tsx                 # AppShell + Dashboard par défaut
/components/topbar.tsx                # Topbar (role, onSearch, onShare, onRun)
/components/leftbar.tsx               # Sidebar (view, setView)
/components/chat/ChatPanel.tsx        # Chat persistant (props ci-dessus)
/components/kpis/KpiCard.tsx          # KPI tuile
/components/roadmap/RoadmapCard.tsx   # Roadmap preview
/components/runs/RunsTable.tsx        # Table runs
/components/roster/AgentCard.tsx      # Carte agent
/design-system/tokens.css             # Variables CSS ci-dessus
```

---

## 13) QA — scénarios clés

* **Chat**:

  * Given thread actif, When message Owner, Then bulle droite.
  * Given message interlocuteur contenant "Action:" ou "9 fichiers lus", Then motif bleu.
* **KPIs**: valeurs centrées, sparkline lisse.
* **Roadmap**: 12 colonnes mois, 5 lanes, colonne gauche visible.
* **Runs**: entête sticky, 20 lignes visibles, liens `trace_id`.
* **Roster**: scroll interne seulement, barres charge en dégradé brand.

---

## 14) Étapes suivantes

1. Geler composants dans `/components/*` (export par défaut).
2. Ajouter pagination runs + filtres (v13).
3. DocDesk (board) et Builder (éditeur) — brancher APIs.
4. Intégrer **RBAC** réel (viewer/operator/owner) côté routes.

---

## 15) Micro‑CR

* **Dashboard figé** (Topbar, Leftbar, Chat persistant).
* KPIs lissés + valeurs centrées ; Roadmap preview + colonne gauche ; Runs 20/l sticky ; Roster scroll section.
* A11y/Perf/Scroll par section OK.
* Prochaine itération : pagination runs, DocDesk & Builder branchés.

# Roadmap — Spécification ultra‑détaillée (v1.0)

> **Scope** : Vue **Roadmap** 3/6/12 mois, lanes horizontales **délimitées**, colonne gauche compacte (titre, tag, owner, statut) + timeline à droite. **Pas de scroll global** ; scroll **uniquement** au sein de la vue si nécessaire (vertical); horizontal **auto‑fit** sur ≥1280px, sinon scroll horizontal interne de la timeline.

---

## 1) Objectifs & UX

* Donner une vision 3–12 mois : Thème/Epic/Feature/Story, états (Planned/Active/Gated/Review/Done), risques et propriétaires.
* **Lecture gauche → droite** : colonne **infos** à gauche, **timeline** à droite (12 colonnes mois).
* **Repères visuels** :

  * Lanes **horizontales** séparées (fond clair + bordure douce).
  * **Header des mois** collant (sticky) en haut de la timeline.
  * **Items** colorés (pastilles/puces à droite) ; **chip** mono‑ligne en fin d’item.
* **Contrôles** : fenêtres **3m / 6m / 12m**, **Zoom −/+**, filtres (owner, état, risques).

## 2) Layout & dimensions

* Conteneur vue : `grid grid-rows-[auto_1fr] gap-12px h-100vh`.
* Barre de section (titre + contrôles) : 48px.
* **Carte Roadmap** : `grid grid-cols-[180px_1fr] gap-12px h-full min-h-0`.

  * **Colonne gauche** (180px) : 5 lignes compactes (configurable) listant `title`, `tag`, `owner`.
  * **Timeline** (droite) :

    * **Header** mois : `grid grid-cols-12` (Jan → Dec) ; sticky top de la carte.
    * **Lanes** : 5 lignes de **8px** de hauteur minimum par lane (ici `h-32` → `h-8` par item), avec fond `bg-white/2%` + `border` doux.
* **Scroll** :

  * Vertical : sur la **carte** si le contenu dépasse (classe `.scroller`).
  * Horizontal : sur la **timeline** seulement quand `width < 1200px` (grille 12 colonnes gardée).

## 3) Thème & tokens

* Utiliser les variables déjà posées :

  * Surfaces : `--surface`, `--bg` ; bordures `--border` ; texte `--fg`, `--fgdim` ; bulles `--bubble`.
  * État : `--success`, `--warn`, `--danger` ; **dégradé brand** `--brand-grad` autorisé pour **barres de charge/badges**, **pas** sur les pastilles PASS.
* Palette items (ex) : `#22D3EE, #38BDF8, #14B8A6, #A78BFA, #F472B6, #34D399` (déjà en preview).

## 4) Icônes (lucide‑react)

* **Vue** : `CalendarRange` (titre Roadmap).
* **Zoom** : `ZoomOut`, `ZoomIn`.
* **Filtres** : `Filter`.
* **Owner** : `Users` (ou `UserCircle2` si personne unique).
* **Milestone** : `Flag`.
* **Dépendance** : `Link2`.
* **Risque** : `AlertTriangle` (jaune/orange).

## 5) Données & mapping DEMO → UI

* **Source** : `DEMO.roadmap` (déjà fournie).

  * `months: string[12]` → header.
  * `lanes[]` → items : `{ id, name, tags[], start, end, chip? }`.
* **Projection** :

  * `startIdx = months.indexOf(l.start)` ; `endIdx = months.indexOf(l.end) + 1` ;
  * `span = endIdx − startIdx` ; `gridColumn: startIdx+1 / span`.
  * `row = (idx % laneCount) + 1` ; collisions simples tolérées (stack 1 par ligne dans v1 ; multi‑ligne **v1.1**).
* **Colonne gauche** : table `[{row, title, tag, owner, status}]` dérivée du plan produit : voir preview (Console App, Builder v1, Policies, ADR set, Process lib).

## 6) Composants & Props

```ts
export type RoadmapItem = {
  id: string;                    // ex: EPIC-42 (ou tag principal)
  title: string;                 // ex: "Console core"
  start: number; end: number;    // index mois 0..11 (inclus), end exclusif
  row: number;                   // lane index 1..N
  color: string;                 // hexa ou var CSS
  owner?: string;                // AGP, PMO, QA-ARC, UX/UI…
  state?: 'Planned'|'Active'|'Gated'|'Review'|'Done';
  risk?: 'low'|'med'|'high';
  chip?: string;                 // EPIC-42… affiché en fin d’item
  deps?: string[];               // IDs d’items parents
  milestones?: {m:number; label:string}[]; // m = idx mois
};

export type RoadmapViewProps = {
  window: 3|6|12;                 // fenêtre d’affichage
  zoom: number;                   // 0.75..1.5 (échelle cols)
  months: string[];               // 12 libellés
  items: RoadmapItem[];           // items positionnés
  rows: number;                   // nb de lanes visibles
  onZoom?: (z:number)=>void;
  onWindow?: (w:3|6|12)=>void;
  onFilter?: (f:Partial<{owner:string; state:string; risk:string}>)=>void;
  onSelectItem?: (id:string)=>void; // clic item
};
```

### Composition (arbre)

```
<RoadmapView>
  <SectionTitle icon=CalendarRange>Roadmap — 12 mois</SectionTitle>
  <RoadmapCard>
    <SideLaneMeta rows=5 />    // colonne gauche (180px)
    <Timeline months=12>
      <MonthsHeader sticky />
      <Lanes n=5>
        <RoadmapItemBar />     // barres positionnées (gridColumn)
        <MilestoneDot />       // pastilles Flag optionnelles
        <DependencyLink />     // v1.1 (calque SVG)
      </Lanes>
    </Timeline>
  </RoadmapCard>
</RoadmapView>
```

## 7) Règles de rendu des items

* **Barre** : `rounded-full border px-3 h-8` ; `bg: color 20%` ; `border: color 45%` ; texte `--fg` 90%.
* **Contenu** : `title` (truncate) à gauche ; `chip` (mono, font‑mono) à droite.
* **Pastille** à droite (position absolue `-right-2`, `w-4 h-4`, `bg: color`).
* **État** (optionnel) :

  * `Planned` → opacité 70% ;
  * `Active` → 100% ;
  * `Gated` → bordure `--warn` ;
  * `Review` → bordure `--primary` ;
  * `Done` → damier léger en fond (ou coin check discret `BadgeCheck`).
* **Milestones** : `Flag` petite **puce** `w-3 h-3` positionnée au mois `m` ; tooltip (label + date).
* **Dépendances** (v1.1) : courbe SVG `Link2` entre fin → début ; couleur `--muted`.

## 8) Interactions

* **Hover item** : halo léger + curseur `pointer` ; tooltip **above** avec : `title`, `window (start–end)`, `owner`, `state`, `risque` (si présent).
* **Click item** : sélection (bordure +1px) + déclenche `onSelectItem(id)` ; option *drawer latéral* (v1.1).
* **Zoom** : `ZoomIn`/`ZoomOut` affectent `gap` inter‑colonnes ou `transform: scaleX` du conteneur timeline (préférer recalcul grid cols).
* **Fenêtre (3/6/12m)** :

  * 3m → colonnes = `now..+2` ; 6m → `now..+5` ; 12m → 12 mois fixes (Jan..Dec) comme dans DEMO.
* **Filtres** (option v1.1) : owner/état/risque ; affichage d’un **legend** en pied.

## 9) Accessibilité (A11y)

* Timeline : `role="table"` ; lignes = `role="row"` ; mois = `role="columnheader"` ; items = `role="gridcell"` + `aria-colspan` correspondant au **span**.
* Focus par Tab : items **focusables** (`tabindex=0`) ; **Enter** = `onSelectItem`.
* Contraste AA ≥ 4.5:1 ; textes tronqués ont `title` attribut.
* Sticky header mois **non** recouvert par d’autres éléments (z‑index 1).

## 10) API & Contrats (Roadmap Planner)

* **Modèle** (extrait) :

```ts
// /api/roadmap (GET)
{
  months: ["Jan","Feb",...],
  items: [
    { id:"EPIC-42", title:"Console core", start:"Jan", end:"Mar", owner:"AGP", state:"Active", risk:"med" },
    { id:"EPIC-7",  title:"Builder v1",  start:"Feb", end:"May", owner:"UX/UI", state:"Planned" },
    // ...
  ]
}
```

* **Contrat mapping** : `start/end` → indices sur le tableau `months` ; `owner`/`state`/`risk` → styles/badges.
* **Brique "Roadmap Planner"** (référence V12): props horizons, capacités, dépendances (voir cadrage R2.5). Les calculs WSJF/RICE se font dans la brique (v1.1 : badge **Prioritization** dans le chip).

## 11) Performance & budgets

* **TTI ≤ 2s** (vue Roadmap) ; **CLS < 0.1** ;
* Calcul positions **O(n)** ; rendu par **grid** (pas de canvas);
* 200+ items : activer **windowing** vertical et *culling* des tooltips.

## 12) Styles (extraits Tailwind/CSS)

* **Carte** : `Card p-3 h-full overflow-hidden`.
* **Grille** : `grid grid-cols-[180px_1fr] gap-3 h-full min-h-0`.
* **Header mois** : `grid grid-cols-12 gap-1 sticky top-0 bg-[var(--surface)]`.
* **Lane** : `relative grid grid-cols-12 gap-1 h-8` + calque : `absolute inset-0 rounded border border-[var(--border)]/60 bg-white/2%`.
* **Item** : `relative rounded-full border px-3 flex items-center justify-between text-xs` + `style={ gridColumn: `\${start+1} / span \${span}` }`.

## 13) Tests d’acceptation (QA)

* Colonne gauche **visible** ; 5 lignes **alignées** avec 5 lanes timeline.
* Mois (12) **alignés** et sticky.
* Chaque item a le **span correct** (start/end conformes aux données DEMO) ; la puce **droite** colorée est visible.
* Les **contrôles** 3m/6m/12m et Zoom réagissent et n’induisent aucun scroll global.
* Contraste AA OK ; tooltip lisible.
* Sur largeur réduite (<1200px), **scroll horizontal** interne uniquement dans la timeline.

## 14) Exemple JSON (complété)

```jsonc
{
  "months": ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  "items": [
    {"id":"EPIC-42","title":"Console core","start":"Jan","end":"Mar","owner":"AGP","state":"Active","chip":"EPIC-42","color":"#22D3EE","row":1},
    {"id":"EPIC-7","title":"Builder v1","start":"Feb","end":"May","owner":"UX/UI","state":"Planned","chip":"EPIC-7","color":"#38BDF8","row":2},
    {"id":"POL-12","title":"Policies","start":"May","end":"Jun","owner":"PMO","state":"Gated","chip":"POL-12","color":"#14B8A6","row":3,"milestones":[{"m":5,"label":"Gate ready"}]},
    {"id":"ADR-9","title":"ADR set","start":"Jun","end":"Jul","owner":"AGP","state":"Review","chip":"ADR-9","color":"#A78BFA","row":4},
    {"id":"PROC-7","title":"Process lib","start":"May","end":"Sep","owner":"QA-ARC","state":"Active","chip":"PROC-7","color":"#F472B6","row":5}
  ]
}
```

## 15) Pseudo‑code — positionnement

```ts
const monthIdx = (m:string)=> months.indexOf(m);
for (const it of items) {
  const s = monthIdx(it.start); const e = monthIdx(it.end)+1;
  it._gridColumn = `${s+1} / span ${e-s}`;
}
```

## 16) i18n & strings

```ts
strings = {
  title: 'Roadmap — 12 mois',
  months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  filter: 'Filtres', zoomIn: 'Zoom +', zoomOut: 'Zoom −',
  window3: '3m', window6: '6m', window12: '12m',
  owner: 'Propriétaire', state: 'État', risk: 'Risque'
}
```

---

**Note** : Cette spec est strictement *UI/front*. Aucune logique back. Respecter les budgets perf/a11y (WCAG 2.1 AA). La version **v1.1** pourra ajouter : multi‑niveaux (Thème/Epic/Feature), calque de dépendances, drawer détail item, export SVG/PNG (`roadmap_view.svg`).

# AgentCard — Spécification ultra‑détaillée (v1.0)

> **Scope** : carte **ultra‑compacte** d’un *agent* (non humain) pour grilles 4×3 sur écran 13”, max 4 lignes de texte + 1 barre de charge + 6 icônes d’action. Utilisée dans **Roster — à risque**, dans les **sélecteurs du Chat**, et dans les **rooms DocDesk**.

---

## 1) Objectifs & principes

* D’un coup d’œil : **identité** (titre, rôle), **état** (présence, charge, risques), **contexte** (missions, doc), **mini‑KPIs**.
* **Densité contrôlée** : 4 lignes max (hors chips) ; police lisible ; numéros en *tabular*.
* **Codes UI communs** : barre de charge **dégradé brand**, pastille statut **vert/orange/rouge**, puce ⚠ pour risque.
* **Agents ≠ humains** : pas de prénom/nom ; format `ROLE – contexte` (ex : **AGP – Arka v2.5**).

## 2) Anatomy & layout

* **Carte** : `Card p-3` ; coins `--r-md`, bordure `--border`, fond `--surface`.
* **Header (ligne 1)**

  * Avatar **20px** (cercle), lettre **initiale** du titre (ex: “A” d’AGP).
  * **Titre** (fort) + **rôle** en petit (• séparateur `·`).
  * **Pastille statut** (right) : `green|orange|red` (présence ou santé).
* **Charge (ligne 2)**

  * Barre **8px** pleine largeur ; **dégradé brand** ; valeur **%** à droite.
* **Chips (ligne 3)**

  * 2 chips max : `mission` (#ID type EPIC‑42), `⚠ perf` si risque, `📄 POL‑12` si doc lié.
* **Mini‑KPIs (ligne 4)**

  * Format : `TTFT 1,2j · Gate 92% · 8/sem` (tabular, `text-xs`, `--fgdim`).
* **Actions (footer flottant / hover)**

  * 6 icônes compactes (24px) : Assigner, Ping, Déléguer, Escalader, Substituer, Ouvrir.

Représentation :

```
╔════════════════════════════════════╗
║ ● A  AGP – Arka v2.5  · AGP     ⬤ ║  <-- pastille statut
║ [███████████████———]        65%    ║  <-- barre (dégradé brand)
║ [EPIC-42] [⚠ perf] [📄 POL-12]     ║  <-- 2–3 chips max (wrap autorisé)
║ TTFT 1,2j · Gate 92% · 8/sem       ║
║ ○ ⎍ ⇄ ▲ ⤿ ↗                         ║  <-- actions (affichées au hover)
╚════════════════════════════════════╝
```

## 3) Thème & tokens

* Surfaces : `--surface`, `--bg` ; bordures : `--border` ; bulles : `--bubble`.
* Texte : `--fg` (primaire), `--fgdim`, `--muted` ; numéros en `tabular-nums`.
* États : `--success`, `--warn`, `--danger` pour pastille et
  badges (⚠ ne **pas** utiliser le dégradé brand sur PASS/OK).
* Barre charge : **`--brand-grad`** (linear‑gradient), arrondis **8px**.

## 4) Icônes (lucide‑react)

* **Header** : `Users` (optionnel à gauche du titre si besoin de type).
* **Actions** :

  * **Assigner** → `UserPlus`
  * **Ping** → `Bell`
  * **Déléguer** → `Share`
  * **Escalader** → `ArrowUpRight`
  * **Substituer** → `Shuffle`
  * **Ouvrir (fiche)** → `ExternalLink`
* **Contexte** : puce risque ⚠ (glyph texte), **doc** `FileText` (si besoin d’icône au lieu d’emoji).

## 5) Données & mapping DEMO → UI

Source : `DEMO.roster.cards[]`.

* `title` → **name** (ex: "AGP – Arka v2.5").
* `role` → **role** (ex: `AGP`).
* `charge_pct` → **load** (0..1).
* `chips[]` →

  * `missions` = tags `EPIC‑NN`, `PROC‑NN`… (2 max)
  * `risk = 'perf'` si puce `⚠ perf`
  * `doc = 'POL‑12' | 'ADR‑9' | 'PROC‑7'` si présent
* `confiance` → **conf** (A/B/C) et **rbac** (V/O/OW)
* `tz` → **tz** (affiché `UTC±`)
* `oncall` → booléen `oui|non`
* `mini_kpis` → rendu brut si fourni ; sinon calcul à partir du modèle `kpis`.

## 6) Props (API composant)

```ts
export type Agent = {
  id: string;
  name: string;       // ex: "AGP – Arka v2.5"
  role: string;       // ex: "AGP"
  tz: string;         // "UTC+01"
  status: 'green'|'orange'|'red';
  load: number;       // 0..1
  missions: string[]; // 0..N (UI affiche 2)
  risk?: 'perf'|null;
  doc?: string|null;  // "POL-12"/"ADR-9"/...
  kpis: { ttft: number; pass: number; commits: number };
  meta?: { dispo?: string; oncall?: boolean; conf?: 'A'|'B'|'C'; rbac?: 'V'|'O'|'OW' };
};

export type AgentCardProps = {
  a: Agent;
  dense?: boolean;                    // version étroite pour grilles denses
  selectable?: boolean;               // affiche un état sélectionné
  onAssign?: (id:string)=>void;
  onPing?: (id:string)=>void;
  onDelegate?: (id:string)=>void;
  onEscalate?: (id:string)=>void;
  onSubstitute?: (id:string)=>void;
  onOpen?: (id:string)=>void;
};
```

## 7) Variantes

* **Compact (par défaut)** : hauteur \~**112–128px**.
* **Dense** : réduit espaces verticaux (–2px marges), chips en une seule ligne **scrollable** horizontale.
* **Sélectionnable** : bordure active + case (ou halo) ; `aria-pressed` si bouton toggle.

## 8) Interactions

* **Hover carte** : afficher la rangée d’icônes d’actions (sinon cachées).
* **Click carte** : `onOpen(id)` (drawer latéral *v1.1*).
* **Actions** :

  * `Assigner` → ouvre menu agents / input user.
  * `Ping` → envoie mention @agent sur canal squad.
  * `Déléguer` → réassigne la tâche/fiche.
  * `Escalader` → alerte PMO/Owner.
  * `Substituer` → propose agent alternatif (via *Load Balancer*).

## 9) Accessibilité (A11y)

* Carte : `role="group"` + `aria-label="{name} — {role}"`.
* Pastille statut : `aria-label="status green|orange|red"`.
* Barre charge : texte `%` lisible ; **contraste AA**.
* Icônes d’action : `aria-label` + `title` ; focus visibles (ring `--ring-soft`).
* Numéros **tabular** ; wrapping des chips autorisé.

## 10) Performance

* Rendu d’une grille **4×3 (12 cartes)** : ≤ 4 ms script + ≤ 2 ms layout.
* Pas d’ombre portée lourde ; privilégier bordure + arrière‑plan.
* Aucune image distante : avatar généré (initiales).

## 11) Styles (Tailwind/CSS — extrait)

```tsx
<Card className="p-3 relative group" aria-label={`${a.name} — ${a.role}`}>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="relative w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[10px]">{a.name.at(0)}</div>
      <div className="text-[var(--fg)]">{a.name}</div>
      <div className="text-xs text-[var(--fgdim)]">· {a.role}</div>
    </div>
    <span className={cn('w-2 h-2 rounded-full', a.status==='green' && 'bg-[var(--success)]', a.status==='orange' && 'bg-[var(--warn)]', a.status==='red' && 'bg-[var(--danger)]')} />
  </div>
  <div className="mt-2 flex items-center gap-2">
    <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
      <div className="h-2" style={{ backgroundImage: 'var(--brand-grad)', width: `${Math.round(a.load*100)}%` }} />
    </div>
    <span className="tabular-nums text-[var(--fg)]/90 text-xs">{Math.round(a.load*100)}%</span>
  </div>
  <div className="mt-2 flex items-center gap-1 text-xs">
    {a.missions.slice(0,2).map(m => <span key={m} className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90 font-mono">{m}</span>)}
    {a.risk && <span className="px-1.5 py-0.5 rounded bg-[var(--warn)]/10 text-[var(--warn)]">⚠ perf</span>}
    {a.doc && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90">📄 {a.doc}</span>}
  </div>
  <div className="mt-1 text-xs text-[var(--fgdim)]">TTFT {a.kpis.ttft}j · Gate {a.kpis.pass}% · {a.kpis.commits}/sem</div>
  {/* Actions */}
  <div className="mt-2 invisible group-hover:visible flex items-center gap-2">
    <button title="Assigner" aria-label="Assigner" className="w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)]"><UserPlus className="w-3 h-3"/></button>
    <button title="Ping" aria-label="Ping" className="w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)]"><Bell className="w-3 h-3"/></button>
    <button title="Déléguer" aria-label="Déléguer" className="w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)]"><Share className="w-3 h-3"/></button>
    <button title="Escalader" aria-label="Escalader" className="w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)]"><ArrowUpRight className="w-3 h-3"/></button>
    <button title="Substituer" aria-label="Substituer" className="w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)]"><Shuffle className="w-3 h-3"/></button>
    <button title="Ouvrir" aria-label="Ouvrir" className="ml-auto w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)]"><ExternalLink className="w-3 h-3"/></button>
  </div>
</Card>
```

## 12) QA — Tests d’acceptation

* **Hauteur** compacte (≤ 128px) ; 4 lignes de contenu lisibles.
* **Barre** de charge avec **dégradé brand**, valeur % exacte.
* **2 chips max** affichées ; wrap OK si plus long.
* **Pastille statut** correcte (`green|orange|red`).
* **Risque** (⚠) et **doc** (📄 ID) rendus si présents.
* **Mini‑KPIs** visibles et en `tabular-nums`.
* **Actions** visibles au **hover**, focus clavier OK ; a11y labels présents.

## 13) Exemple JSON — (DEMO → Agent)

```jsonc
{
  "id":"agp",
  "name":"AGP – Arka v2.5",
  "role":"AGP",
  "tz":"UTC+01",
  "status":"green",
  "load":0.65,
  "missions":["EPIC-42","EPIC-7"],
  "risk":"perf",
  "doc":"POL-12",
  "kpis": {"ttft":1.2, "pass":92, "commits":8},
  "meta": {"dispo":"3j","oncall":true, "conf":"A", "rbac":"OW"}
}
```

## 14) Pseudo‑code — mapping DEMO → Agent

```ts
const agents = DEMO.roster.cards.map(c => ({
  id: (c.id||'').toLowerCase(),
  name: c.title,
  role: c.role,
  tz: c.tz,
  status: 'green',
  load: (c.charge_pct||0)/100,
  missions: (c.chips||[]).filter(x=>/^[A-Z]+-\d+$/.test(x)).slice(0,2),
  risk: (c.chips||[]).includes('⚠ perf') ? 'perf' : null,
  doc: (c.chips||[]).find(x=>/^(POL|ADR|PROC)-\d+/.test(x))||null,
  kpis: { ttft: 1.2, pass: 92, commits: 8 },
  meta: { dispo: c.dispo, oncall: c.oncall==='oui', conf: (c.confiance||'A').charAt(0), rbac: (c.confiance||'').includes('OW')?'OW':'O' }
}));
```

---

**Note** : Spécification strictement *UI/front* (pas de back). Respecter AA (contrastes ≥ 4.5:1). Ne pas faire défiler la page globale : scroller les **conteneurs** (Roster, sélecteurs Chat).

Arg, l’injection auto a **échoué** (le moteur a rejeté un gros bloc JSX dans un seul remplacement). Du coup je te file un patch propre, en 5 mini-étapes sûres à coller **tel quel** dans ton fichier `Console-arka-preview-v12` (je n’écrase rien d’existant).

---

# **RunsList** — Spécification ultra‑détaillée (v1.0)

### 1) Imports — ajoute les icônes manquantes

Cherche la ligne d’import `lucide-react` et remplace-la par celle-ci (on ajoute `ChevronLeft`, `ChevronUp`, `ArrowUpDown`) :

```ts
import { Activity, BadgeCheck, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, ArrowUpDown, FileText, Gauge, GitCommit, Menu, MessageSquare, Play, Save, Share2, Shield, SquareDashedMousePointer, Users, ZoomIn, ZoomOut, Plus, Search, Filter, Settings, Layers, Link2, FileSearch, Eye, UploadCloud, XCircle, CheckCircle2, AlertTriangle, Circle, ArrowUp } from "lucide-react";
```

---

### 2) Nouveau composant **RunsList** (tri + pagination + copier `trace_id`)

Colle ce bloc **juste après** le bloc `// --- Runs table` (avant `// --- Agent card`), ou à la fin du fichier si tu préfères :

```tsx
// --- RunsList (full page) ---------------------------------------------------
type RunRow = {
  run_id: string;
  status: 'PASS'|'FAIL'|'WARN';
  p95_ms: number;
  error_pct: number;
  sprint: string;
  trace_id: string;
  created_at?: string;
};

const ORDER: Record<RunRow['status'], number> = { FAIL: 0, WARN: 1, PASS: 2 };

const sortStable = (by: keyof RunRow, dir: 'asc'|'desc') => (a: RunRow, b: RunRow) => {
  const m = dir === 'asc' ? 1 : -1;
  if (by === 'status') {
    if (ORDER[a.status] !== ORDER[b.status]) return (ORDER[a.status] - ORDER[b.status]) * m;
    return a.run_id.localeCompare(b.run_id);
  }
  if (by === 'sprint') {
    const na = parseInt(a.sprint.replace(/\D+/g,'')) || 0;
    const nb = parseInt(b.sprint.replace(/\D+/g,'')) || 0;
    if (na !== nb) return (na - nb) * m;
    return a.run_id.localeCompare(b.run_id);
  }
  const va = (a as any)[by]; const vb = (b as any)[by];
  if (va < vb) return -1 * m; if (va > vb) return 1 * m; return a.run_id.localeCompare(b.run_id);
};

const SortIcon: React.FC<{ active: boolean; dir: 'asc'|'desc' }> = ({ active, dir }) =>
  active ? (dir === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ArrowUpDown className="w-3 h-3"/>;

const RunsList: React.FC<{ data?: RunRow[] }> = ({ data }) => {
  const PAGE_SIZE = 20;
  const base = (data && data.length ? data : runs) as RunRow[];

  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<{ by: keyof RunRow; dir: 'asc'|'desc' }>({ by: 'run_id', dir: 'desc' });
  const [copied, setCopied] = React.useState<string|null>(null);

  const total = base.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageRows = React.useMemo(() => {
    const sorted = [...base].sort(sortStable(sort.by, sort.dir));
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [base, page, sort]);

  const setSortCol = (by: keyof RunRow) =>
    setSort(s => ({ by, dir: s.by === by ? (s.dir === 'asc' ? 'desc' : 'asc') : 'desc' }));

  const onCopy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); setCopied(t); setTimeout(() => setCopied(null), 1200); } catch {}
  };

  return (
    <Card className="p-3 h-full overflow-hidden"
      onKeyDown={(e)=>{ if(e.altKey && e.key==='ArrowLeft'){ e.preventDefault(); setPage(p=>Math.max(1,p-1)); }
                        if(e.altKey && e.key==='ArrowRight'){ e.preventDefault(); setPage(p=>Math.min(pages,p+1)); } }}>
      <div className="flex items-center justify-between mb-2">
        <SectionTitle icon={<GitCommit className="w-4 h-4"/>}>DERNIERS RUNS (20/L)</SectionTitle>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 rounded bg-white/5 border border-[var(--border)] text-xs flex items-center gap-1" title="Filtres">
            <Filter className="w-3 h-3"/> Filtres
          </button>
        </div>
      </div>

      <div className="h-full min-h-0 overflow-auto scroller">
        <table className="w-full text-sm" role="table">
          <thead className="sticky top-0 bg-[var(--surface)] text-[var(--fgdim)]" role="rowgroup">
            <tr className="text-left" role="row">
              {([
                ['run_id','run_id'],
                ['status','status'],
                ['p95_ms','p95 (ms)'],
                ['error_pct','error %'],
                ['sprint','sprint'],
                ['trace_id','trace_id'],
              ] as [keyof RunRow, string][]).map(([key, label]) => (
                <th key={key as string} scope="col" className="px-3 py-2 select-none">
                  <button onClick={() => key!=='trace_id' && setSortCol(key)}
                          className="inline-flex items-center gap-1 text-[var(--fgdim)] hover:text-[var(--fg)]">
                    <span>{label}</span>
                    {key!=='trace_id' && <SortIcon active={sort.by === key} dir={sort.dir}/>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {pageRows.map(r => (
              <tr key={r.run_id} className="border-t border-[var(--border)]/60 hover:bg-white/5" role="row">
                <td className="px-3 py-2 font-mono text-[var(--fg)]/90" role="cell">#{r.run_id}</td>
                <td className="px-3 py-2" role="cell"><StatusPill s={r.status as any}/></td>
                <td className="px-3 py-2 tabular-nums" role="cell">{r.p95_ms}</td>
                <td className="px-3 py-2 tabular-nums" role="cell">{r.error_pct}</td>
                <td className="px-3 py-2" role="cell">{r.sprint}</td>
                <td className="px-3 py-2" role="cell">
                  <button onClick={()=>onCopy(r.trace_id)} className="text-[var(--primary)] hover:underline"
                          aria-label={`Copier le trace_id ${r.trace_id}`} title="Copier le trace_id">
                    {r.trace_id}
                  </button>
                  {copied===r.trace_id && <span className="ml-2 text-[10px] text-[var(--fgdim)]">Copié</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button aria-label="Page précédente" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
                className="px-2 py-1 rounded bg-white/5 border border-[var(--border)] disabled:opacity-50">
          <ChevronLeft className="w-3 h-3"/>
        </button>
        <span className="text-xs text-[var(--fgdim)]">page {page} / {pages}</span>
        <button aria-label="Page suivante" onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page>=pages}
                className="px-2 py-1 rounded bg-white/5 border border-[var(--border)] disabled:opacity-50">
          <ChevronRight className="w-3 h-3"/>
        </button>
      </div>
    </Card>
  );
};
```

> Note : on garde **RunsTable** pour le Dashboard, et on utilise **RunsList** pour l’onglet dédié.

---

### 3) Observabilité sans runs + nouvelle vue **Runs**

Remplace **uniquement** le composant `ObservaView` par ceci **et ajoute** `RunsView` juste en dessous :

```tsx
const ObservaView: React.FC = () => (
  <div className="p-4 h-full min-h-0 overflow-hidden grid grid-rows-[auto_1fr] gap-4">
    <div className="grid grid-cols-3 gap-4">
      {kpis.map((k,i) => (
        <KpiCard key={k.key} colorIdx={i} label={`${k.key} (p95)`} value={k.value} unit={k.unit} trend={DEMO.kpis.tiles[i]?.trend}/>
      ))}
    </div>
    <Card className="p-8 text-[var(--fgdim)]">
      Sélectionnez l’onglet <span className="text-[var(--fg)]">Runs</span> pour la liste détaillée paginée (20/l).
    </Card>
  </div>
);

const RunsView: React.FC = () => (
  <div className="p-4 h-full min-h-0 overflow-hidden">
    <RunsList data={runs as any}/>
  </div>
);
```

---

### 4) Sidebar — ajoute l’entrée **Runs**

Dans le tableau des boutons du `Sidebar`, insère la ligne ci-dessous **après** l’entrée Observabilité :

```tsx
{ id:'runs', label:'Runs', icon: <GitCommit className="w-5 h-5"/> },
```

---

### 5) Router d’app — ajoute l’état `runs`

* Modifie la ligne du state :

```ts
const [view, setView] = useState<'dashboard'|'roadmap'|'builder'|'docdesk'|'observa'|'runs'|'roster'>('dashboard');
```

* Et ajoute le rendu :

```tsx
{view==='observa' && <ObservaView/>}
{view==='runs' && <RunsView/>}
{view==='roster' && <RosterView/>}
```

---

### Attendu

* **Tri** par colonne (clic sur l’entête, icône `ArrowUpDown` ↔ `ChevronUp/Down`).
* **Pagination** 20/l avec boutons et **Alt+←/→**.
* **Copie `trace_id`** avec feedback “Copié”.
* **Header sticky** + scroll **dans** le tableau uniquement.
* Observa = **KPIs uniquement**.

# Scrollbar — Spécification UI (Arka Dark) v1.0

> **Objectif** : une barre de défilement **discrète**, **cohérente** avec le thème Arka (bulle du chat), **visible uniquement à l’interaction**, et **cantonnée aux sections** (pas de scroll global). Couverture Chrome/Edge/Safari (WebKit) + Firefox.

---

## 1) Principes

* **Pas de scroll global** : `html, body { overflow: hidden; }` ; chaque zone scrollable est un **conteneur** avec la classe `.scroller`.
* **Look & feel** : même teinte que la **bulle du chat** ; invisible au repos, **apparaît au survol** / à l’usage.
* **Finesse** : 8px (desktop), 6px (dense). Rayon 8px.
* **Performances** : uniquement sur `.scroller` (pas de styles lourds en global) ; pas d’ombres.
* **A11y** : contraste suffisant sur hover ; respect de `prefers-reduced-motion` et `forced-colors`.

---

## 2) Tokens

Utiliser/ajouter ces variables (déjà partiellement présentes dans `Tokens`):

```css
:root {
  --bubble: #18212B;           /* bulle du chat */
  --border: #1F2A33;           /* border.soft */
  --ring-soft: rgb(51 65 85 / .60);
  --scroll-thumb: var(--bubble);                 /* normal */
  --scroll-thumb-hover: color-mix(in oklab, var(--bubble) 88%, white); /* léger éclaircissement */
  --scroll-track: transparent;
}
```

> **Note** : `color-mix()` est supporté par Chrome/Edge/Firefox/Safari modernes. Si indisponible, fallback → même couleur que `--scroll-thumb`.

---

## 3) Styles de base

À placer **une fois** (ex. dans le `<style>` du composant `Tokens` ou dans `globals.css`).

```css
/* Global — neutralise le scroll body */
html, body { height: 100%; overflow: hidden; }

/* Conteneur scrollable */
.scroller {
  overflow: auto;                 /* vertical/horizontal selon contenu */
  scrollbar-gutter: stable both-edges; /* évite CLS quand la barre apparaît */
  overscroll-behavior: contain;   /* pas de propagation */
  -webkit-overflow-scrolling: touch; /* inertie iOS */

  /* Firefox */
  scrollbar-width: thin;          /* ~8px */
  scrollbar-color: transparent transparent; /* idle invisible */
}
.scroller:hover { scrollbar-color: var(--scroll-thumb) var(--scroll-track); }

/* WebKit (Chrome/Edge/Safari) */
.scroller::-webkit-scrollbar { width: 8px; height: 8px; }
.scroller.dense::-webkit-scrollbar { width: 6px; height: 6px; }
.scroller::-webkit-scrollbar-track { background: var(--scroll-track); }
.scroller::-webkit-scrollbar-thumb {
  background: transparent;              /* idle invisible */
  border-radius: 8px;
  border: 2px solid transparent;        /* poignée fine (4px) */
}
.scroller:hover::-webkit-scrollbar-thumb { background: var(--scroll-thumb); }
.scroller:hover::-webkit-scrollbar-thumb:active { background: var(--scroll-thumb-hover); }

/* Coins & doubles barres */
.scroller::-webkit-scrollbar-corner { background: var(--scroll-track); }

/* Motion / A11y */
@media (prefers-reduced-motion: reduce) {
  .scroller { scroll-behavior: auto; }
}
@media (forced-colors: active) {
  .scroller { scrollbar-color: auto; }
}
```

### Option : mode "quasi invisible" global

> À n’utiliser **que si le besoin d’uniformiser la barre dans tout le shell** se confirme.

```css
/* Niv. global (hors .scroller) — affiche la barre uniquement au survol */
*::-webkit-scrollbar { width: 8px; height: 8px; }
*::-webkit-scrollbar-thumb { background: transparent; border-radius: 8px; }
*:hover::-webkit-scrollbar-thumb { background: var(--scroll-thumb); }
```

---

## 4) Règles d’usage (où appliquer `.scroller`)

* **Chat** : feed des messages + liste compactée si présente (sélecteurs restent fixes).
* **Dashboard** : colonne **Roster — à risque**, tableau **Derniers runs**, zone **Roadmap** si overflow.
* **Observabilité** : sections graphiques si empilement vertical > viewport.
* **DocDesk** : colonnes Kanban (scroll indépendant par colonne 🡒 `.scroller` sur chaque colonne) + zone content.
* **Builder** : canvas (pan/zoom) dans un wrapper avec `.scroller` horizontal+vertical.

> **Ne pas** mettre `.scroller` sur le `<main>` global, uniquement sur des **panneaux** dédiés.

---

## 5) Variantes & états

* `.scroller.dense` : largeur 6px (tables denses, petits écrans).
* `.scroller.xonly` / `.scroller.yonly` : si besoin d’un contrôle :

  ```css
  .scroller.xonly { overflow-x: auto; overflow-y: hidden; }
  .scroller.yonly { overflow-y: auto; overflow-x: hidden; }
  ```
* `.scroll-stable` : utilise `scrollbar-gutter: stable both-edges;` pour garder la mise en page **stable** lorsque la barre apparaît.

---

## 6) Intégration Tailwind (optionnelle)

Si vous préférez des utilitaires Tailwind personnalisés :

```js
// tailwind.config.js
module.exports = {
  theme: { extend: {} },
  plugins: [function({ addUtilities }) {
    addUtilities({
      '.scroller': {
        overflow: 'auto',
        'scrollbar-gutter': 'stable both-edges',
        'overscroll-behavior': 'contain'
      },
      '.scroller-dense': { },
    })
  }]
}
```

> Les pseudo-éléments `::-webkit-scrollbar*` restent à poser dans un CSS global (limitation CSS‑in‑JS).

---

## 7) QA — critères d’acceptation

1. **Visibilité** : la barre est **transparente au repos**, devient visible **uniquement** au **survol** du conteneur (Chrome/Edge/Safari) ou par `scrollbar-color` (Firefox).
2. **Couleur** : le **thumb** correspond à `--bubble` (#18212B) ; en `:active`, léger éclaircissement (mix). Le **track** est transparent.
3. **Confinement** : le scroll de **chaque section** n’impacte pas la page (pas de double barre globale).
4. **Stabilité** : pas de **CLS** quand le scroll apparaît/disparaît (grâce à `scrollbar-gutter: stable`).
5. **Accessibilité** : en **mode contrasté** (`forced-colors`), la barre demeure lisible/fonctionnelle.
6. **Mobile** : inertie iOS OK (`-webkit-overflow-scrolling: touch`).

---

## 8) Patch minimal à appliquer dans `Tokens` (si besoin)

Remplacer/compléter le bloc `<style>` existant par :

```css
html, body { height: 100%; overflow: hidden; }
.scroller { overflow: auto; scrollbar-gutter: stable both-edges; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: transparent transparent; }
.scroller:hover { scrollbar-color: var(--scroll-thumb) transparent; }
.scroller::-webkit-scrollbar { width: 8px; height: 8px; }
.scroller::-webkit-scrollbar-track { background: transparent; }
.scroller::-webkit-scrollbar-thumb { background: transparent; border-radius: 8px; border: 2px solid transparent; }
.scroller:hover::-webkit-scrollbar-thumb { background: var(--scroll-thumb); }
.scroller:hover::-webkit-scrollbar-thumb:active { background: var(--scroll-thumb-hover); }
```

> **Déjà en place** dans la preview : base global + `.scroller` (presque complet). Cette spec **aligne** les noms de tokens et ajoute `scrollbar-gutter` + `:active` + color‑mix.

---

## 9) Do / Don’t

**Do**

* Appliquer `.scroller` **uniquement** aux panneaux overflow (Chat feed, Runs table body, Roster, Kanban columns…).
* Conserver `min-h-0` sur les **panneaux parents** (Grid/Flex) pour que le scroll s’active correctement.
* Tester macOS (overlay), Windows (classique), Linux (varié) ; Firefox spécifique.

**Don’t**

* Mettre `overflow: auto` sur le `<body>` / `<main>` global.
* Utiliser des ombres ou des couleurs vives sur le thumb (hors état actif).
* Forcer des largeurs < 6px (difficile à saisir).

---

## 10) Mapping composants Arka

* **ChatPanel** : `.scroller` sur le **feed** (déjà OK) ; textarea non scrollable.
* **Dashboard** : `.scroller` sur **Roster** et **RunsTable** ; **Roadmap** selon contenu.
* **DocDesk** : `.scroller` par **colonne** du Kanban et sur le conteneur global.
* **Observabilité** : `.scroller` sur zone listes si overflow (graphiques généralement sans scroll vertical).

---

### Fin — v1.0

Si tu veux, je prépare un **diff exact** pour remplacer le bloc `<style>` de `Tokens` afin d’être 1:1 avec cette spec.
