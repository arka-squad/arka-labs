# Arka Console — Dashboard v12 · Handoff & Layout spec

> **Scope figé :** page **Dashboard** (accueil), **Topbar**, **Leftbar (sidebar)** et **Chat** persistant. Style sombre, back‑office, full‑page, scroll **par section** uniquement.

---

## 1) Layout général (figé)

- **Grid principale**: `Leftbar (72px)` + `Chat (380px)` + `Content (flex-1)` sous la **Topbar (56px)**.
- **Dashboard content** (3 colonnes) :
  - **Col 1–2 (2/3)** = **pile**: Roadmap preview *(40% hauteur)* au‑dessus, Runs *(60%)* en dessous.
  - **Col 3 (1/3)** = **Roster** scrollable.
- **Scroll**:
  - Body = `overflow: hidden`.
  - Sections `scroller` uniquement (Chat feed, Runs, Roster).
- **Breakpoints**: >=1280px optimisé. Entre 1024–1279px: Chat bascule à 320px ; en‑dessous, prévoir *collapse* Chat (v13).

---

## 2) Topbar (validée)

- **Placement**: logo **Arka** à gauche, **Search** centré, **Role badge** & actions à droite.
- **Actions**: `Share`, `Run` (CTA neutres pour démo).
- **Props suggérés**:
  - `role: 'viewer'|'operator'|'owner'` *(affiche la pastille et la couleur)*
  - `onSearch(query)`, `onShare()`, `onRun()`
- **A11y**: champ `aria-label="Rechercher"`, focus visible, tab order: Logo → Search → Role → Share → Run.

---

## 3) Leftbar / Sidebar (validée)

- **Items** (icônes seules): Dashboard, Roadmap, Gouvernance, DocDesk, Observabilité, Roster.
- **Foot**: bouton **Messages (Inbox)** au‑dessus, **Avatar** en bas avec statut.
- **Props suggérés**:
  - `view: string`, `setView(view: string)`
  - `items?: {id,label,icon}[]` *(extensible marketplace)*
- **A11y**: `aria-label` par bouton, tooltips courts.

---

## 4) Chat (persistant, validé)

- **Toujours visible** sur toutes les vues.
- **Header**:
  - Sélecteur **thread** (multi‑ligne si long) + badge *Squad*.
  - Bloc **Agent du fil** (sélecteur agent multi‑ligne + mini‑fiche : charge, missions, risques, doc, KPIs mini).
- **Feed**:
  - Auteur **Owner** → bulle à droite (fond `--bubble`).
  - Interlocuteur → texte en clair **sans bulle**, *border‑left* doux.
  - Motifs mis en évidence : **“Action:”** et **“9 fichiers lus”** en **bleu primaire**.
- **Composer**: textarea **hauteur 96px**, boutons *Ajouter*, *Auto*, *Envoyer* (flèche). Style identique à la maquette fournie.
- **Hooks / API suggérée**:
  - `threads: {id,title,squad,last_msg_at}[]`
  - `messagesByThread: Record<id, {id,from,text,at}[]>`
  - `agents: {id,name,role,load,skills,missions,doc,risk,kpis,tz,status}[]`
  - callbacks: `onSend(threadId, payload)`, `onAttach()`, `onAgentChange(id)`

---

## 5) KPIs (cards)

- **Trois tuiles**: `TTFT p95`, `RTT p95`, `Errors p95`.
- Valeur **centrée**, **min/max** en coin, sparkline **arrondie** (pas de pics) + **remplissage dégradé**.
- **Props**: `{ label, value, unit, trend[] }`.

---

## 6) Roadmap (preview dans Dashboard)

- **12 mois** en header, **5 lanes** avec **colonne gauche compacte** (titre, tag, owner).
- Barres par lane avec palette discrète, *chip* id à droite.
- Ratio **40% Roadmap / 60% Runs** dans la pile centrale.

---

## 7) Runs (table)

- **Entêtes collants**, 20 / page (prévu pagination v13), lien `trace_id` cliquable.
- Pastilles **PASS (vert)**, **FAIL (rouge)**, **WARN (orange)** *(sans dégradé pour PASS – signal positif clair).*

---

## 8) Roster (cartes)

- Mini‑fiche **ultra‑compacte** : avatar, nom (ex: *AGP – Arka v2.5*), rôle, charge avec **barre dégradée brand**, badges missions, risques/doc, KPIs mini.
- **Scroll section only**.

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

- `GET /api/metrics/kpis` → `{ p95:{ttft_ms,rtt_ms}, error_rate_percent }` *(arrondi 1 décimale)*
- `GET /api/metrics/runs?page=1&limit=20` → table 20/l, tri stable, **trace_id** visible.
- `GET /api/documents?page=1&page_size=20` → DocDesk (à venir) 20/l tri `created_at DESC, id ASC`.

---

## 11) A11y & Perf

- **WCAG 2.1 AA** min. Contrastes ≥ 4.5:1, focus visibles, navigation clavier complète.
- **Perf budgets**: `/` LCP ≤ 2.5s, `/console` TTI ≤ 2s, CLS < 0.1.

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

- **Chat**:
  - Given thread actif, When message Owner, Then bulle droite.
  - Given message interlocuteur contenant "Action:" ou "9 fichiers lus", Then motif bleu.
- **KPIs**: valeurs centrées, sparkline lisse.
- **Roadmap**: 12 colonnes mois, 5 lanes, colonne gauche visible.
- **Runs**: entête sticky, 20 lignes visibles, liens `trace_id`.
- **Roster**: scroll interne seulement, barres charge en dégradé brand.

---

## 14) Étapes suivantes

1. Geler composants dans `/components/*` (export par défaut).
2. Ajouter pagination runs + filtres (v13).
3. DocDesk (board) et Builder (éditeur) — brancher APIs.
4. Intégrer **RBAC** réel (viewer/operator/owner) côté routes.

---

## 15) Micro‑CR

- **Dashboard figé** (Topbar, Leftbar, Chat persistant).
- KPIs lissés + valeurs centrées ; Roadmap preview + colonne gauche ; Runs 20/l sticky ; Roster scroll section.
- A11y/Perf/Scroll par section OK.
- Prochaine itération : pagination runs, DocDesk & Builder branchés.

