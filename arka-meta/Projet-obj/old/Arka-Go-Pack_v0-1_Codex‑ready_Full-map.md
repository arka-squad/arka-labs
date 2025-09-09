# `Arka-Go-Pack_v0-1_Codex‑ready_Full-map.md`

# 📦 Arka — Go Pack v0.1 - Plan complet - Road Map (Codex Ready)


# 1 - Sommaire détaillé / 📦 Arka — Go Pack v0.1 • Découpage en 12 briques (Codex‑ready)

## `codex/gopack_v_0_1/b1_base_env.md`

# B1 — Base & Environnement (Vercel + GitHub)

## But
Relier le dépôt à Vercel (Pro), poser domaines/secrets, protections de branche, sans toucher à l’app.

## Livrables
- Projet Vercel connecté au repo `arka-squad/arka-labs` (Preview/Prod).
- Domaines : `arka-squad.app` (apex) + `www.arka-squad.app` (redir → apex).
- Secrets Vercel (Preview/Prod) : `NEXT_PUBLIC_HOST`, `RBAC_TOKEN` (staging), `AI_*` (réservé), `POSTGRES_*` (réservé), `KV_REST_API_URL/TOKEN` (réservé).
- GitHub Branch protection : `Require status checks` → `network-gate`, `rbac-smokes`, `secret-scan`; `Require branches to be up to date`.

## Tâches (haut niveau)
1) Connecter repo → Vercel, sélectionner le scope d’équipe.
2) DNS : CNAME `www` → Vercel, A/ALIAS apex → Vercel (ou CNAME flattening).
3) Secrets Vercel : poser clés nécessaires (sans mettre de secrets front dans le client).
4) GitHub → Branch protection + permissions min.

## Acceptation
- Preview auto par PR opérationnelle.
- `curl -I https://arka-squad.app` renvoie 200/301 attendu.
- Branch protection active et visible dans la PR.

## Hors‑périmètre
- Pas d’implémentation LLM/DB (reportée B9/B10).

---

## `codex/gopack_v_0_1/b2_ci_gates.md`

# B2 — Garde réseau & CI Gates

## But
Éliminer les faux rouges réseau via un garde, fiabiliser smokes RBAC et scan secrets.

## Livrables
- Workflows : `.github/workflows/{network-gate.yml, rbac-smokes.yml, secret-scan.yml}` (concurrency, timeout, permissions min).
- Artefacts : `logs/net_self_check.ndjson`, `logs/rbac_smokes.ndjson` (artefacts CI), `R2_5/sha256sums.txt`.

## Tâches
1) `network-gate` : probe `HOST_PRIMARY=/api/health` (200) sinon fallback Vercel.
2) `rbac-smokes` : step `pick-host + net-guard`; runner Node matrice si présent, sinon fallback bash.
3) `secret-scan` : gitleaks action + `.github/.gitleaks.toml` (allowlist SHA/logs).

## Acceptation
- Deux exécutions consécutives sans 403 réseau parasitaire.
- Artefacts présents sur le run et téléchargeables.

## Hors‑périmètre
- Tests end‑to‑end UI (lighthouse/axe hors CI ici).

---

## `codex/gopack_v_0_1/b3_auth_rbac_ui.md`

# B3 — Auth & RBAC (coquille UI)

## But
Fournir `/login` (coller JWT), badge de rôle et wrapper `apiFetch` (401 → /login).

## Livrables
- Page `/login` (textarea token + bouton "Se connecter").
- `apiFetch` : injecte `Authorization: Bearer <RBAC_TOKEN>` ; gère 401.
- `RoleBadge` global (viewer/operator/owner) en topbar.

## Tâches
1) LocalStorage pour `RBAC_TOKEN`; logout = clear + redirect.
2) Middleware côté client : route guard min.

## Acceptation
- 401 depuis API → redirect `/login`.
- Badge reflète le rôle décodé (sans exposer le JWT).

## Hors‑périmètre
- Édition serveur ou création de comptes.

---

## `codex/gopack_v_0_1/b4_console_kpis_health.md`

# B4 — Console : KPIs & Health

## But
Afficher 3 KPIs et une puce Health branchés.

## Livrables
- `/console` avec cartes : `p95.ttft_ms`, `p95.rtt_ms`, `error_rate_percent` (arrondi 1 déc.).
- `HealthChip` (vert si `GET /api/health` = 200, sinon KO).

## Tâches
1) Appels `GET /api/metrics/kpis` + `GET /api/health` via `apiFetch`.
2) Formatage unités (ms, %). A11y : `aria-live` pour Health.

## Acceptation
- Valeurs non vides, formats corrects.
- Health bascule à l’état correct en live.

## Hors‑périmètre
- Graphe historique (B8).

---

## `codex/gopack_v_0_1/b5_documents_ro.md`

# B5 — Documents (lecture seule)

## But
Lister 20 docs par page, tri stable, états vide/erreur.

## Livrables
- Vue `/console/documents` : table 20/l, `page=1&page_size=20`.
- Tri UI stable : `created_at DESC, id ASC`.
- Empty state + error state.

## Acceptation
- Page 1 = 20 lignes max (si dispo).
- Tri visuellement stable entre refresh.

## Hors‑périmètre
- Upload/DELETE (reporté v1.x).

---

## `codex/gopack_v_0_1/b6_threads_ro.md`

# B6 — Threads (lecture seule)

## But
Montrer les 5 derniers threads (titre + date lisible).

## Livrables
- Widget dans `/console` ou page dédiée (RO) s’appuyant sur `GET /api/chat/threads`.

## Acceptation
- 5 éléments max, `last_msg_at` lisible.

## Hors‑périmètre
- Envoi de messages (reporté).

---

## `codex/gopack_v_0_1/b7_prompt_builder_local.md`

# B7 — Prompt Builder v1 (local‑only)

## But
Éditer des blocs localement (owner/operator), export/import JSON.

## Livrables
- `/console/prompt-builder` : liste ordonnable + boutons Export/Import.
- Badge `LOCAL • non persisté • v1`.

## Acceptation
- Export → Import = round‑trip identique (deep‑equal).
- Viewer = lecture seule.

## Hors‑périmètre
- Persistance serveur des prompts.

---

## `codex/gopack_v_0_1/b8_observabilite_v1.md`

# B8 — Observabilité v1

## But
Graphe simple + filtres Lot/Sprint, cohérent avec KPIs.

## Livrables
- `/console/observabilite` : graphe (ligne/barre), filtres UI (Lot/Sprint).

## Acceptation
- Graphe visible, filtres fonctionnels.
- Cohérence visuelle avec cartes KPIs.

## Hors‑périmètre
- Corrélation avancée traces/runs (v2).

---

## `codex/gopack_v_0_1/b9_ai_gateway_pilot.md`

# B9 — Gateway IA (pilote AGP)

## But

Brancher le Vercel AI SDK sur `/ai/stream` (serveur), journalisé.

## Livrables

* Route `app/api/ai/stream/route.ts` (ou pages/api) avec modèle par rôle.
* Logs NDJSON : `{model, role, ttft_ms, tokens_total}`.

## Acceptation

* Streaming token‑par‑token visible en UI (AGP pilote).
* Logs présents en local/dev (masqués prod si besoin).

## Hors‑périmètre

* Orchestration multi‑agents complète (v2).


---

## `codex/gopack_v_0_1/b10_memory_substrate.md`

# B10 — Substrat mémoire (squelette)

## But
Préparer la structure mémoire (court/long terme) sans la brancher à l’UI.

## Livrables
- KV (sessions/flags) — variables d’environnement posées.
- Postgres + pgvector (schéma graines) — tables `notes`, `embeddings`.
- Blob (exports/artefacts) — bucket configuré.

## Acceptation
- Migrations/dotenv prêts; aucun appel de prod tant que non activé.

## Hors‑périmètre
- RAG complet / Indexation automatique (v2).

---

## `codex/gopack_v_0_1/b11_demo_offline.md`

# B11 — Mode Démo & Offline

## But
Bascule DEMO (watermark + seeds), bannière offline non bloquante.

## Livrables
- Toggle DEMO (UI) → seeds réalistes, watermark `DEMO`.
- Bannières offline : "Service indisponible — lecture seule".

## Acceptation
- Bascules sans erreur; aucune action d’édition permise offline.

## Hors‑périmètre
- Simulation réseau avancée.

---

## `codex/gopack_v_0_1/b12_evidence_cut.md`

# B12 — Evidence & Cut v0.1

## But
Emballer les preuves et publier un tag.

## Livrables
- Captures : `login.png`, `console_nav.png`, `documents.png`, `observabilite.png`.
- `logs/ui_network.json` + `logs/rbac_smokes.ndjson` (artefacts CI).
- `arka-meta/reports/codex/R2_5/sha256sums.txt`.
- Tag `v0.1.0-demo`.

## Acceptation
- Evidence pack complet en PR; CI verte.

## Hors‑périmètre
- Changelog détaillé produit (optionnel).






# 2 - Livrable par briques (codex ready) / 📦 Arka — Go Pack v0.1 • Découpage en 12 briques (Codex‑ready)


# TCK‑ARKA‑B2 — Auth/RBAC baseline (Codex‑ready)

> **But** : permettre la connexion par **token collé** (JWT), afficher le **badge de rôle** global et **protéger** les routes `/console/**` (redirect vers `/login` si non-auth). Zéro binaire dans la PR, uniquement fichiers texte.

---

## 0) Contexte & règles
- **Dépôt** : `arka-labs` (projet console Next.js).
- **Rôles UI cibles** : `viewer | operator | owner`.
- **Compat** (tokens existants) : `editor → operator`, `admin → owner`.
- **HOST** : `NEXT_PUBLIC_HOST` (défaut `https://arka-squad.app`), utilisé par l’UI pour les appels.
- **Contrats réseau** : aucun changement côté API ; l’UI ajoute `Authorization: Bearer <token>` si présent.
- **Garde** : 401 → **clear token** + redirect `/login`.
- **A11y** : champs labellisés, `:focus-visible`, aria-live pour messages d’erreur.
- **CI existante** : *ne rien casser* (network‑gate / rbac‑smokes / secret‑scan).
- **PR** : **zéro image** (PNG/JPG) – uniquement JSON/NDJSON/MD.

---

## 1) Portée (IN/OUT)
**IN**
- Page `/login` (coller un JWT, bouton « Se connecter »).
- Lecture des **claims** du JWT côté client (décodage payload Base64URL, pas de vérif cryptographique côté UI).
- Persistance **localStorage** (`RBAC_TOKEN`).
- **Topbar** : badge rôle visible en permanence.
- **Logout** : bouton dans topbar → clear token + redirect `/login`.
- **Middleware guard** : protection des routes `/console` et sous‑routes.
- **Wrapper `apiFetch`** : injecte `Authorization` et gère 401.

**OUT**
- Aucune écriture API ; pas de refresh token ; pas d’OAuth.
- Pas de vérification HMAC/HS256 côté front (le serveur reste la source d’autorité).

---

## 2) Acceptance Criteria (Go/No‑Go)
- **A1 — Login/Redirect** :
  - *Given* pas de token, *When* je visite `/console`, *Then* je suis redirigé vers `/login`.
  - *Given* je colle un JWT (3 segments) et clique **Se connecter**, *Then* token stocké et redirect vers `/console`.
- **A2 — Badge rôle** :
  - *Given* token avec claim `role`, *Then* badge affiche `viewer|operator|owner` (mapping : `editor→operator`, `admin→owner`, sinon `viewer`).
- **A3 — Headers & 401** :
  - *Given* token présent, *When* un appel API part, *Then* `Authorization: Bearer <token>` est envoyé.
  - *Given* l’API renvoie **401**, *Then* token supprimé et redirect `/login` + message.
- **A4 — A11y** :
  - Focus visible sur `/login`, champs annoncés, messages d’erreur dans une zone `aria-live="polite"`.
- **A5 — Evidence pack (texte only)** :
  - `logs/ui_network.json` (au moins 1 appel avec `Authorization`),
  - `arka-meta/reports/codex/R2_5/sha256sums.txt` mis à jour.

---

## 3) Fichiers à ajouter / modifier
- `app/login/page.tsx` — UI login (textarea + bouton ; erreurs ; liens utiles).
- `app/_components/RoleBadge.tsx` — badge rôle (couleurs/states, aria‑label).
- `app/_components/Topbar.tsx` — exporte le **RoleBadge** + bouton **Logout**.
- `app/_lib/auth.ts` — utilitaires :
  - `getToken() / setToken(t) / clearToken()` (localStorage),
  - `parseJwtPayload(t)` (Base64URL → JSON),
  - `mapRole(claimRole)` (`editor→operator`, `admin→owner`, fallback `viewer`),
  - `getUiRoleFromToken(t)` (retourne `viewer|operator|owner`).
- `app/_lib/apiFetch.ts` — wrapper `fetch` (ajout header `Authorization`, gestion **401** → clear + redirect).
- `middleware.ts` — guard Next.js : routes `/console/:path*` → redirect `/login` si token absent.
- `app/layout.tsx` — inclure `Topbar` partout sauf `/login` (ou topbar léger sans logout/badge).
- `app/console/layout.tsx` — s’assurer que le guard s’applique et que le badge est visible.
- `tests/e2e/auth.spec.ts` — Playwright : redirect, login, badge visible, 401→logout.
- `tests/unit/auth.spec.ts` — tests unitaires `parseJwtPayload` + `mapRole`.
- `logs/ui_network.json` — (généré par un mini hook/trace côté dev ; ne pas commit si vide).
- `arka-meta/reports/codex/R2_5/sha256sums.txt` — recalculer (CI/locaux).

> **Note** : `NEXT_PUBLIC_HOST` peut déjà exister ; sinon, ajouter une valeur par défaut dans le code (fallback `https://arka-squad.app`).

---

## 4) Spécifs d’implémentation (guides)
**JWT côté UI**
- Lecture **payload** uniquement : `JSON.parse(atob(b64url))` (sécurité serveur = source de vérité).
- Claims attendus **si présents** : `role`, `iss`, `aud`.
  - Si `iss!="arka"` ou `aud!="arka-squad"` → message « Token incompatible », mais **autoriser** la connexion si le backend acceptera quand même ; la vraie autorité reste l’API (qui renverra 401 si invalide).

**Mapping du rôle**
- `viewer|operator|owner` **direct** si claim `role` ∈ set.
- Compat : `editor→operator`, `admin→owner`.
- Sinon : `viewer`.

**Wrapper `apiFetch`**
- `export async function apiFetch(path, init?)` → construit URL `${NEXT_PUBLIC_HOST}${path}`.
- Injecte `Authorization` si token.
- Si réponse **401** → `clearToken()` + `window.location.assign('/login')`.
- Journalise (dev only) `{ts, route, method, status, duration_ms}` vers `logs/ui_network.json` (si dispo en local ; ne pas casser prod).

**Middleware guard**
- Next middleware sur `/console/:path*`.
- Si **pas** de cookie/token **côté middleware** : redirect 307 `/login`.
  - NB : localStorage non accessible côté middleware → utiliser un cookie **miroir** du token lors de `setToken()` (valeur **vide** côté serveur ; ou flag booléen `auth=1`) strictement pour le **guard**. **Ne jamais** exploiter ce cookie comme source d’auth (le vrai token reste en localStorage + header).

**Topbar & Logout**
- Bouton « Se déconnecter » → `clearToken()` + redirect `/login`.
- **RoleBadge** lisible (couleur + texte + `aria-label="Rôle : owner"`).

**A11y**
- `/login` : label pour le textarea (`for=id`), aide courte, message d’erreur en `aria-live="polite"`.

---

## 5) Tests
**E2E (Playwright)**
1. `/console` sans token → redirect `/login`.
2. Coller token (payload `{ role:"viewer" }`) → redirect `/console` + badge « viewer ».
3. Simuler 401 (mock de réponse) → retour `/login` et token nettoyé.

**Unit**
- `parseJwtPayload` : 3 cas (OK, mal formé, non‑JSON).
- `mapRole` : `viewer|operator|owner|editor|admin|autre`.

**Evidence (texte)**
- `logs/ui_network.json` : au moins un appel avec `Authorization` (token **non loggé**).
- SHA256 des fichiers modifiés.

---

## 6) Tâches
- [ ] `app/_lib/auth.ts` (token store + parsing + mapping).
- [ ] `app/_lib/apiFetch.ts` (headers + 401 handler + trace dev).
- [ ] `app/_components/RoleBadge.tsx`.
- [ ] `app/_components/Topbar.tsx` + bouton Logout.
- [ ] `app/login/page.tsx` (UI + a11y + erreurs basiques).
- [ ] `middleware.ts` (guard `/console/**` via cookie indicateur `auth=1`).
- [ ] Intégration dans `app/layout.tsx` / `app/console/layout.tsx`.
- [ ] Tests unitaires + Playwright.
- [ ] Evidence pack (texte) + `sha256sums.txt`.

---

## 7) Environnement & secrets
- **UI** : aucun secret nouveau (token **collé** par l’utilisateur sur `/login`).
- **Env Vercel** : `NEXT_PUBLIC_HOST` recommandé.
- **CI** : inchangé pour B2.

---

## 8) Branch & MR
- Branche : `feat/b2-auth-rbac-baseline`.
- PR : titre « B2 — Auth/RBAC baseline » ; description incluant :
  - Contexte & scope,
  - Liste des fichiers,
  - Résultats tests (unit/E2E),
  - Evidence pack (liens artefacts texte),
  - **Assumptions** (⚠️ seulement si vraiment nécessaire, sinon vide).

---

## 9) Risques & mitigations
- **Token invalide / expiré** → message clair ; l’API renvoie 401 → reset + redirect.
- **Cookie guard** : cookie indicateur `auth=1` **non sensible** (pas le token) ; Strict & HttpOnly.
- **Traçage** : ne jamais logguer le token.

---

## 10) Done = Definition of Done
- ✅ A1…A5 validés.
- ✅ Tests unitaires + E2E verts.
- ✅ Evidence pack **texte only** livré + SHA256 recalculé.
- ✅ Pas de régression sur CI existante (workflows passent).



# TCK-B3 — Console KPIs + Health + Threads (Codex‑ready)

> **But**: livrer la vue **Console** (lecture seule) avec 3 **KPIs** arrondis à 1 décimale, un **HealthChip** calé sur `GET /api/health` et un encart **Threads (5 derniers)**. Aucune capture PNG dans la PR (preuves **texte uniquement**).

---

## 0) Contexte & règles projet (rappel minimal)
- **UI lecture only** (RBAC masque ou désactive, pas d’écriture).
- **Rôles UI**: `viewer` (RO), `operator` (RO ici), `owner` (RO ici). Compat CI: `editor→operator`, `admin→owner`.
- **HOST**: `NEXT_PUBLIC_HOST` (défaut `https://arka-squad.app`) avec fallback Vercel côté UI **uniquement pour le HealthChip** (ne pas auto‑router les autres requêtes pour éviter la dérive).
- **Pas de binaire** en repo: preuves en **JSON/NDJSON/MD**.

---

## 1) Contrats API (lecture v0.1)
- **Health** — `GET /api/health` → `200 {"status":"ok"}`.
- **KPIs** — `GET /api/metrics/kpis` → `200 { "p95": { "ttft_ms": int, "rtt_ms": int }, "error_rate_percent": number }` (arrondi **1 décimale** en UI).
- **Threads** — `GET /api/chat/threads` → `200 { "items": [{ "id": string, "title": string, "last_msg_at": iso8601 }] }`.
  - Rappel côté BE: `last_msg_at = COALESCE(MAX(messages.created_at), threads.created_at)` (informationnel; l’UI consomme tel quel).

---

## 2) Spéc UI (Console)
### Layout
- **Topbar**: titre "Console", **RoleBadge**, bouton Logout.
- **Grille KPIs** (3 cartes): `TTFT p95 (ms)`, `RTT p95 (ms)`, `Error rate (%)`.
- **HealthChip**: états `ok|ko|unknown` avec `aria-live="polite"`.
- **Encart Threads (RO)**: liste limitée à **5** éléments `{title, last_msg_at}`; format date lisible locale.

### Comportements
- **apiFetch**: injecte `Authorization: Bearer <RBAC_TOKEN>` si présent (localStorage); 401 ⇒ `/login`.
- **Arrondis**: TTFT/RTT **ms** (1 décimale), Error rate **%** (1 décimale). Exemple: `123.4 ms`, `2.7 %`.
- **HealthChip**:
  - Interroge `GET /api/health` au **montage** puis toutes les **30 s**.
  - `ok` si `200`, `ko` sinon, `unknown` pendant le chargement.
  - **Net‑guard UI**: si `ko`, afficher **bannière non bloquante**: « *Service API indisponible — affichage des dernières données mises en cache si disponible.* » (⚠️ **ne jamais** afficher `SKIPPED` en UI).
- **Threads**: afficher au plus 5, tri tel que fourni. Si vide → *placeholder* "Aucun fil récent"; si erreur → bandeau discret "Impossible de charger les fils".

### A11y/Perf
- Focus visible, tab order complet; contrastes AA.
- LCP ≤ 2.5 s sur `/console` (budget indicatif), TTI ≤ 2 s.

---

## 3) Tâches Codex (à livrer)
1) **Composants**
   - `RoleBadge.tsx` — `{ role: 'viewer'|'operator'|'owner' }`.
   - `KpiCard.tsx` — `{ label:string, value:number|null, unit?:'ms'|'%', help?:string }` (gère `null` → skeleton/NA).
   - `HealthChip.tsx` — `{ state:'ok'|'ko'|'unknown' }` + polling 30 s; `aria-live`.
   - `ThreadsPanel.tsx` — `{ items:Array<{id,title,last_msg_at}> }` (limite 5; states vide/erreur).
2) **Service API**
   - `lib/apiFetch.ts` — wrapper fetch (Authorization, 401→/login, json/error)
   - `services/kpis.ts` — `getKpis()`
   - `services/health.ts` — `getHealth()`
   - `services/threads.ts` — `getThreads(limit=5)` (le `limit` est **UI**; l’API retourne tout).
3) **Page**
   - `app/console/page.tsx` — assemble Topbar + grille KPIs + HealthChip + ThreadsPanel.
4) **Rounding util**
   - `lib/number.ts` — `round1(n:number):number` + formatters `fmtMs`, `fmtPercent`.
5) **Logs UI réseau (texte)**
   - `lib/netlog.ts` — append NDJSON `{ts, route, status, dur_ms, trace_id}` (trace_id généré côté UI et passé en header `x-trace-id`).
   - Export fichier **texte** `logs/ui_network.json` via bouton *Copier* (met le JSON en clipboard) **sans** committer de binaire.
6) **Env/Config**
   - `NEXT_PUBLIC_HOST` (fallback Vercel **uniquement** pour le HealthChip si l’apex est KO; les autres calls restent sur HOST choisi).
7) **Tests rapides**
   - Composants purs (render + states vide/erreur).
   - Utilitaires d’arrondi.

> **Interdits**: images/PNGs dans la PR; `test.skip`; mocks pour routes branchées; secrets en clair.

---

## 4) Critères d’acceptation (Go/No‑Go)
- **A1 KPIs**: les 3 cartes s’affichent; valeurs correctement arrondies à **1 décimale** avec unités (`ms`, `%`).
- **A2 Health**: `ok` si `/api/health`=200; `ko` si ≠200; `unknown` lors du chargement; `aria-live` opérationnel.
- **A3 Threads**: 5 éléments max; `title` + `last_msg_at` lisible; placeholders présents.
- **A4 RBAC**: appels réseau portent `Authorization` si token; 401 redirige `/login`.
- **A5 Logs**: `x-trace-id` émis et consigné dans `logs/ui_network.json` (texte seulement).
- **A6 A11y/Perf**: focus visibles; LCP≤2.5 s / TTI≤2 s (mesures indicatives en local/preview).

---

## 5) Oracles (copier/coller)
```bash
# KPIs
curl -s "$HOST/api/metrics/kpis" | jq .
# Threads
curl -s "$HOST/api/chat/threads" | jq '.items[:5]'
# Health
curl -s -o /dev/null -w "%{http_code}\n" "$HOST/api/health"
```

---

## 6) CI & Evidences (texte)
- **CI existante**: `network-gate` + `rbac-smokes` (pas de changement requis ici).
- **Evidences PR (texte)**:
  - `logs/ui_network.json` (ou `ndjson` équivalent) — **pas d’images**.
  - `arka-meta/reports/codex/R2_5/sha256sums.txt` mis à jour.
  - Court **README Console.md** (diff/choix, points ouverts) si besoin.

---

## 7) Risques & garde‑fous
- **Santé KO**: UI non bloquante; bannière d’indisponibilité + valeurs `NA`.
- **Dérive arrondis**: utilitaire unique `round1` consommé partout.
- **Binaire accidentel**: `.gitignore` couvre `*.png *.jpg *.zip`; review PR refuse binaires.

---

## 8) Fichiers à créer/modifier
- `app/console/page.tsx`
- `components/RoleBadge.tsx`
- `components/KpiCard.tsx`
- `components/HealthChip.tsx`
- `components/ThreadsPanel.tsx`
- `lib/apiFetch.ts`
- `lib/number.ts`
- `lib/netlog.ts`
- `logs/.gitkeep` (pour structure, vide)
- `README-Console.md` (facultatif, texte)

---

## 9) Done = ✅
- Toutes les **acceptance** A1→A6 vérifiées en preview.
- Preuves **texte uniquement** déposées.
- Aucune régression sur `network-gate` / `rbac-smokes`.



# TCK-ARKA-B4-DOCS-RO — Documents (lecture seule) 20/l & tri stable · Codex‑ready

> **But**: livrer `/console/documents` en **lecture seule**, paginée **20 par page**, tri **stable** `created_at DESC, id ASC`, avec états *empty/error*, RBAC appliqué, oracles & CI smokes en place. **Aucun binaire requis** (captures facultatives, non bloquantes).

---

## 1) Enoncé compact
- **Pages concernées**: `/console/documents` (+ liens dans SideNav/Topbar).  
- **Contrat API**: `GET /api/documents?page=1&page_size=20` → `200 { items:[{id,project_id,name,mime,size,storage_url,created_at}], page, page_size, count }`.  
- **Tri UI**: `created_at DESC, id ASC` (déterministe, pas d’effet « sautillant »).  
- **États**: `empty` (items=[]), `error` (non‑200) ; messages sobres, a11y OK.  
- **RBAC**: viewer/operator/owner **voient** la liste (RO). Aucune écriture.  
- **Net‑guard**: si `/api/health` != 200 ⇒ bannière RO + désactivation des contrôles interactifs.

---

## 2) Acceptance Criteria
- **A1 – Requête explicite** : la liste déclenche `GET /api/documents?page=1&page_size=20` (pas d’implicite).  
- **A2 – Pagination** : affiche **≤20** lignes sur page 1 ; si `count > 20`, contrôle de pagination visible (suivant/précédent).  
- **A3 – Tri stable** : ordre **visuel** conforme à `created_at DESC, id ASC` ; pas de ré‑ordre inattendu lors des re‑renders.  
- **A4 – États** : `empty`: placeholder informatif (a11y) ; `error`: message discret + bouton *Réessayer*.  
- **A5 – RBAC** : aucun bouton d’écriture ; la route utilise `Authorization: Bearer <RBAC_TOKEN>` si présent.  
- **A6 – A11y/Perf** : navigation clavier complète ; focus visible ; contrastes ≥ 4.5:1 ; LCP/TTI conformes budgets globaux.  
- **A7 – Oracles** : cURL ci‑dessous passent (online).  
- **A8 – CI** : smokes `rbac-smokes` journalisent le code de `GET /api/documents` pour viewer/operator/owner.

---

## 3) Fichiers à créer/modifier
- `app/console/documents/page.tsx` — Vue Documents (liste 20/l, états, tri visuel).  
- `app/console/documents/_components/DataTable.tsx` — table stateless (props: rows, page, pageSize, total, onPageChange).  
- `lib/apiFetch.ts` — wrapper fetch (injecte `Authorization`, gère 401→/login).  
- `lib/sort.ts` — util tri stable : `(a,b) => byCreatedDescThenIdAsc(a,b)`.  
- `lib/netGuard.ts` — helper health→état réseau.  
- `styles/tokens.css` (si manquant) — variables de couleur/espaces pour contrasts AA.  
- `tests/e2e/documents.spec.ts` — e2e minimal (smoke UI : 20/l, états).  
- `arka-meta/reports/staging/rbac_matrix.json` — **ajouter** oracles `GET /api/documents` (codes attendus 200 pour tous rôles).  
- `README.md` — section « Documents RO (20/l) » : contrat, oracles, limites.

> **Interdits**: mocks réseau en mode online ; `test.skip`; binaire dans la PR obligatoire.  
> **Optionnel (non bloquant)**: captures PNG → **ne pas inclure** en PR si la CI les refuse.

---

## 4) Contrats & Oracles (copier/coller)
**Contrat**  
`GET /api/documents?page=1&page_size=20` → `200 { items:[{ id, project_id, name, mime, size, storage_url, created_at }], page, page_size, count }`

**Oracles cURL**
```bash
HOST=${HOST:-https://arka-squad.app}
# Health
curl -s -o /dev/null -w "%{http_code}\n" "$HOST/api/health"
# Documents (page 1)
curl -s "$HOST/api/documents?page=1&page_size=20" | jq '.items | length, .page, .page_size, .count'
```

**Règle de tri UI**
```ts
export function byCreatedDescThenIdAsc(a:{created_at:string,id:string}, b:{created_at:string,id:string}){
  const da = Date.parse(a.created_at); const db = Date.parse(b.created_at);
  if (db!==da) return db-da; // DESC
  return a.id.localeCompare(b.id); // ASC
}
```

---

## 5) Implémentation (guidelines rapides)
- **State**: `useEffect` → fetch documents avec query explicite ; `loading/ok/empty/error`.  
- **Tri**: **ne** pas muter props ; trier en **copie** mémorisée (`useMemo`).  
- **Pagination**: afficher contrôles si `count > page_size`.  
- **A11y**: `table` sémantique, entêtes `th scope="col"`, focus management, aria‑live pour messages.  
- **RBAC**: wrapper `apiFetch` lit `RBAC_TOKEN` (localStorage) et ajoute l’entête ; gère 401→/login.

---

## 6) Tests
- **Unit**: `lib/sort.ts` (tri stable).  
- **E2E (smoke)**: charge `/console/documents` (online), attend ≤20 lignes, vérifie présence pagination si `count>20`, vérifie ordre stable (par inspection basique `created_at`).  
- **A11y**: tab‑order traversable, focus visible.

---

## 7) CI & Smokes (intégration)
- **rbac-smokes.yml**: étendre le runner (Node/Bash) pour appeler `GET /api/documents` avec les 3 rôles et consigner les codes.  
- **network-gate.yml**: inchangé (probe health).  
- **Artefacts**: NDJSON uniquement (`logs/rbac_smokes.ndjson`, `logs/net_self_check.ndjson`).

**RBAC Matrix – ajout suggéré** (`arka-meta/reports/staging/rbac_matrix.json`)
```json
{
  "documents": {
    "GET /api/documents?page=1&page_size=20": {
      "viewer": [200], "operator": [200], "owner": [200]
    }
  }
}
```

---

## 8) Checklists PR
**UI**
- [ ] Requête explicite `?page=1&page_size=20`.
- [ ] ≤20 lignes affichées ; pagination si `count>20`.
- [ ] Tri visuel stable `created_at DESC, id ASC`.
- [ ] États `empty`/`error` avec a11y (aria‑live, focus).
- [ ] Aucune action d’écriture exposée.

**CI**
- [ ] rbac-smokes journalise codes `GET /api/documents` pour 3 rôles.
- [ ] Artefacts NDJSON présents ; **aucun binaire** requis.

---

## 9) Risques & mitigations
- **Host down** → net‑guard UI + bannière RO.  
- **Jitter tri** (ré‑order au re‑render) → **memo** + clé stable.  
- **401** → wrapper redirige `/login`.

---

## 10) Branchement & Navigation
- SideNav : entrée « Documents » (active state focus/hover AA).  
- Topbar : titre de page clair, rôle badge visible.

---

## 11) Branch & Commit
- **Branche**: `feat/b4-docs-ro`  
- **Commits**: atomiques (UI, lib, tests, CI) ; messages clairs.

---

## 12) Done
- [ ] AC A1..A8 validés (preuve via oracles & e2e).  
- [ ] CI verte (`network-gate`, `rbac-smokes`, `secret-scan`).  
- [ ] Evidence NDJSON attachées (artefacts).



# B5 — Observabilité v0.1 (KPIs + Runs) — Codex‑ready

> **But**: livrer la vue **/console/observabilite** avec 3 **KPIs** (p95 TTFT, p95 RTT, % erreurs), un **graphe simple** (TTFT/RTT dans le temps) et un **tableau paginé** des runs (20/l). **Lecture seule**, alignée RBAC, compatible **offline/DEMO**, et outillée CI (smokes + artefacts). **Zéro binaire** dans la PR (évidences texte/JSON uniquement).

---

## 0) Métadonnées
- **Ticket ID**: B5-OBSERVABILITE-V0_1
- **Repo**: `arka-labs`
- **Pages**: `/console/observabilite`
- **RBAC UI**: `viewer|operator|owner` → **RO identique** (pas d’écriture)
- **HOST défaut**: `https://arka-squad.app` (fallback: `https://arka-liard.vercel.app`)
- **Contrat**: "branché ou rien" (anti-mock hors DEMO/offline)

---

## 1) Scope & objectifs
**IN**
- 3 KPI cards (arrondi **1 décimale**):
  - `p95.ttft_ms` (Time‑to‑First‑Token)
  - `p95.rtt_ms` (Response‑Roundtrip)
  - `error_rate_percent`
- **HealthChip** (vert si `GET /api/health` = 200)
- **Graphe** TTFT/RTT (ligne ou aires) sur la fenêtre des runs chargés
- **Table des runs** paginée 20/l, tri **stable** (`created_at DESC, id ASC`)
- **Filtres** (UI‑only): `Lot`, `Sprint` (sélecteurs facultatifs, sans write)
- **Offline/DEMO**: watermark DEMO + seeds locales pour peupler la vue

**OUT**
- Toute écriture/édition back‑office
- Export image/PNG (banni)

---

## 2) Contrats API (lecture)
- **Health** — `GET /api/health` → `200 {"status":"ok"}`
- **KPIs** — `GET /api/metrics/kpis` → `200 { "p95": { "ttft_ms": int, "rtt_ms": int }, "error_rate_percent": number }`
- **Runs** — `GET /api/metrics/runs?page=1&limit=20[&lot=Lot_X][&sprint=S1]`
  → `200 { items:[{ ts:string(ISO), run_id:string, trace_id:string, ttft_ms:int, rtt_ms:int, status:string }], page:int, limit:int, count:int }`
  - **Tri** côté serveur recommandé `created_at DESC, id ASC` (UI respecte l’ordre reçu)
  - **Codes**: `200` OK; `401` → guard UI (redir login à l’échelle app)

**Wrapper**: `apiFetch` ajoute `Authorization: Bearer <token>` si présent; propage `X-Trace-Id` (UUID) pour corrélation (UI→API→logs)

---

## 3) UX/Composants
- **KpiCard**: `{ label, value, unit }` – arrondi 1 décimale
- **HealthChip**: `{ state: 'ok'|'ko'|'unknown' }` (`aria-live="polite"`)
- **ObsFilters**: `{ lot?:string, sprint?:string, onChange(...) }` (UI‑only)
- **ObsChart**: props `{ points:[{ts, ttft_ms, rtt_ms}], loading:boolean }` – rendu simple (ligne)
- **RunsTable**: `{ rows, page, limit, total, onPageChange }` – 20/l par défaut
- **OfflineBanner**: message figé quand host down; désactive interactions
- **DemoWatermark**: overlay `DEMO`

A11y: focus-visible, ordre tabbable complet, contrastes AA ≥ 4.5:1

Perf: LCP ≤ 2.5s (/, /login), TTI ≤ 2s (/console), CLS < 0.1

---

## 4) Acceptance Criteria
- **A1 KPIs**: les 3 valeurs s’affichent (1 décimale), **sans NaN**; Health = vert si `/api/health`=200
- **A2 Graphe**: TTFT/RTT visibles, axe temps lisible (format court), pas de blocage hors données
- **A3 Runs**: table 20/l, pagination stable; colonnes `{ts, run_id, trace_id, ttft_ms, rtt_ms, status}`; tri non‑sautillant
- **A4 Filtres**: Lot/Sprint modifient la requête si fournis (querystring), UI robuste si vides/non supportés
- **A5 Offline/DEMO**: host down → bannière; **DEMO** seeds préremplissent KPIs+graphe+table; watermark visible
- **A6 A11y/Perf**: critères de budgets respectés; axe‑core clean
- **A7 Logs**: `logs/ui_network.json` contient les requêtes (route, code, durées, **trace_id**)

---

## 5) Tâches (Dev)
1) **Data layer**
   - Étendre `apiFetch` pour générer `X-Trace-Id` (UUID v4) et le propager
   - Ajout des appels: `GET /api/metrics/kpis`, `GET /api/metrics/runs`
2) **UI**
   - Page `/console/observabilite`
   - Sections: KPI cards, HealthChip, Filtres, Graph, Table
   - Mode `DEMO` (seeds locales)
3) **States**
   - `loading/error/offline` gérés séparément pour KPIs et Runs
   - Bascule DEMO/offline via net‑guard UI
4) **Logs UI**
   - Capturer requêtes + `trace_id` dans `logs/ui_network.json`
5) **A11y/Perf**
   - Focus, aria‑live, contrastes; audit axe + budgets Lighthouse

---

## 6) Tâches (CI/QA)
- **rbac_matrix.json**: ajouter oracles:
  ```json
  {
    "oracles": {
      "health": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}},
      "metrics/kpis": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}},
      "metrics/runs": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}}
    }
  }
  ```
- **scripts/smokes_matrix_guard.mjs**: couvrir `GET /api/metrics/runs?page=1&limit=20`
- **rbac-smokes.yml**: pas de changement structurel (hérite du net‑guard + artefacts)
- **Artefacts**:
  - `logs/net_self_check.ndjson`
  - `logs/rbac_smokes.ndjson`
  - `logs/ui_network.json`
  - `evidence/observabilite_snapshot.md` (résumé texte)
  - `evidence/observabilite_graph_data.json`
  - `arka-meta/reports/codex/R2_5/sha256sums.txt`

> **Note**: **aucun** PNG/JPEG en PR; preuves **texte/JSON** uniquement.

---

## 7) Évidences (modèles à produire)
- `evidence/observabilite_snapshot.md`
  ```md
  # Snapshot Observabilité (v0.1)
  KPIs: ttft_p95=XXX ms · rtt_p95=YYY ms · err%=Z.Z

  ## Runs (page 1/…)
  | ts                        | run_id         | trace_id       | ttft | rtt | status |
  |---------------------------|----------------|----------------|------|-----|--------|
  | 2025-09-02T10:00:00Z      | run_abc        | tr_123         | 180  | 950 | OK     |
  …
  ```
- `evidence/observabilite_graph_data.json`
  ```json
  { "points": [{"ts":"2025-09-02T10:00:00Z","ttft_ms":180,"rtt_ms":950}, …] }
  ```

---

## 8) Definition of Done (MR)
- [ ] UI `/console/observabilite` livrée, fonctionnelle online et en DEMO
- [ ] KPIs + Graphe + Table OK, filtres UI opérants
- [ ] `apiFetch` propage `X-Trace-Id`; `logs/ui_network.json` présent
- [ ] CI: matrice + smokes couvrent `metrics/kpis` et `metrics/runs`
- [ ] Evidence pack texte/JSON joint + `sha256sums.txt` mis à jour
- [ ] A11y (axe) et Perf (Lighthouse budgets) ≥ seuils

---

## 9) Hypothèses (journaliser en PR)
- `metrics/runs` supporte `page` et `limit` (défaut 20)
- `lot`/`sprint` acceptés en query, ignorés si non supportés (pas d’erreur 4xx)
- Données TTFT/RTT en **ms**; `status` string compacte (ex: OK/ERR)

---

## 10) Risques & mitigations
- **Host down** → net‑guard UI + DEMO seeds
- **Variabilité backend** (filtres non pris en compte) → UI‑only fallback, pas d’erreur bloquante
- **Perf chart** → limiter points (page courante uniquement)

---

## 11) Fichiers à créer/éditer
- `app/console/observabilite/page.tsx` (ou équivalent)
- `components/observabilite/{KpiCard,ObsChart,ObsFilters,RunsTable}.tsx`
- `lib/apiFetch.ts` (X-Trace-Id)
- `evidence/{observabilite_snapshot.md,observabilite_graph_data.json}`
- `arka-meta/reports/staging/rbac_matrix.json` (oracles ajoutés)
- `scripts/smokes_matrix_guard.mjs` (extension runs)
- `arka-meta/reports/codex/R2_5/sha256sums.txt`

---

## 12) Oracles cURL (copier/coller)
```bash
curl -s "$HOST/api/health"
curl -s "$HOST/api/metrics/kpis" | jq .
curl -s "$HOST/api/metrics/runs?page=1&limit=20" | jq .
```

---

## 13) Checklists MR (coller dans la PR)
**MR‑UI**
- [ ] Page et composants créés; A11y/Perf pass
- [ ] Logs réseau + trace_id OK
- [ ] DEMO seeds/ban. DEMO fonctionnels

**MR‑CI**
- [ ] Matrice mise à jour (kpis+runs)
- [ ] Smokes NDJSON générés
- [ ] SHA256 recalculés

---

**Go/No‑Go Gate**
```yaml
Design-Review: PASS
actions_required: []
ts: 2025-09-02T00:00:00Z
```


# B6 — Threads RO (encart + page) — Codex‑ready (Arka R2.5 v0.1)

**But**
Mettre en place l’affichage **lecture seule** des threads de chat : encart (top 5) sur `/console` et page dédiée (option P1) `/console/chat` avec liste + panneau messages. RBAC en lecture pour tous les rôles, **sans** envoi de message.

---

## 1) Ticket JSON (pour Codex)
```json
{
  "id": "B6-THREADS-RO-V0_1",
  "version": "R2.5 v0.1",
  "title": "Threads RO — encart top 5 + page /console/chat (RO)",
  "status": "ready-for-codex",
  "labels": ["ui","rbac","ci/smokes","lot:R2.5","priority:P0"],
  "repository": "arka-labs",
  "component": "app/",
  "description": "Affichage lecture seule des threads: encart top 5 sur /console et page /console/chat (liste + messages RO). Oracles réseau gelés, RBAC lecture pour viewer/operator/owner, evidence pack sans binaire.",
  "env": {
    "required": [
      "NEXT_PUBLIC_HOST (defaut=https://arka-squad.app)",
      "RBAC_TOKEN (collé via /login pour l’UI)",
      "RBAC_TOKEN_VIEWER|OPERATOR|OWNER (CI)"
    ],
    "notes": [
      "Fallback Vercel si health primaire ≠ 200",
      "Propager X-Trace-Id via apiFetch"
    ]
  },
  "acceptance": [
    "A1 Encarts: sur /console, un encart 'Threads' liste jusqu’à 5 éléments issus de GET /api/chat/threads (tri serveur), avec title + date lisible (relative ou yyyy-mm-dd hh:mm).",
    "A2 Page RO: /console/chat (P1) affiche une liste paginée (20/l par défaut) de threads; clic → panneau messages (DERNIERS messages) sans champ d’envoi.",
    "A3 API Calls: l’UI utilise apiFetch et envoie Authorization si RBAC_TOKEN présent; en 401 → redirect /login.",
    "A4 États: Empty state clair si 0 thread; Error state non bloquant si appel échoue; skeleton au chargement.",
    "A5 Tri & champs: la date affichée correspond à 'last_msg_at' du contrat (server rule), liste stable (créé côté BE).",
    "A6 A11y: liste navigable au clavier; focus-visible; rôles ARIA appropriés; contrastes ≥ 4.5:1.",
    "A7 Perf: pas de jank sur encart (≤5 items); /console garde TTI ≤ 2s; pas de dépendance image.",
    "A8 Evidence: logs/ui_network.json capture les fetch threads + codes + durées; artefacts NDJSON CI publiés (pas de PNG)."
  ],
  "files_to_add_or_edit": [
    {"path":"app/console/components/ThreadsCard.tsx","purpose":"encart top 5 sur /console"},
    {"path":"app/console/chat/page.tsx","purpose":"page RO (liste + panneau messages) — P1"},
    {"path":"lib/apiFetch.ts","purpose":"injection Authorization + X-Trace-Id (si non présent)"},
    {"path":"arka-meta/reports/staging/rbac_matrix.json","purpose":"ajouter oracles threads (GET /api/chat/threads)"},
    {"path":"scripts/smokes_matrix_guard.mjs","purpose":"tester /api/chat/threads via tokens CI"},
    {"path":"README.md","purpose":"section Threads RO (contrats, oracles, evidence)"}
  ],
  "evidence": [
    "logs/ui_network.json",
    "logs/rbac_smokes.ndjson (artefact CI)",
    "arka-meta/reports/codex/R2_5/sha256sums.txt"
  ],
  "notes": [
    "UI **RO**: aucun input de message; pas d’upload; zero binaire dans la PR",
    "Respecter le Net‑Guard: si /api/health ≠ 200 → UI affiche un encart d’indisponibilité et ne tente pas d’envoi"
  ]
}
```

---

## 2) Contrats API (lecture) & oracles

### Threads (liste)
- **GET `/api/chat/threads`** → `200 { items:[{ id, title, last_msg_at }] }`
- **Règle serveur**: `last_msg_at = COALESCE(MAX(messages.created_at), threads.created_at)`.
- **Tri**: laissé au serveur; l’UI n’impose pas de tri client sur l’encart top 5.

### Messages d’un thread (P1)
- **GET `/api/chat/threads/:id/messages`** → `200 { items:[{ role, content, ts }] }`
- **Tri**: `created_at ASC, id ASC` (affiché dans l’ordre chronologique). `ts = created_at`.

### Oracles cURL (copier/coller)
```bash
# liste threads
curl -s "$HOST/api/chat/threads" | jq .

# messages d’un thread (ex. id=uuid)
curl -s "$HOST/api/chat/threads/<id>/messages" | jq .
```

---

## 3) UI — Composants & comportements

### `ThreadsCard.tsx`
- **Props**: none (fetch interne via `apiFetch`) ou `host?:string` si besoin.
- **Affichage**: liste ≤ 5 items: `title`, `formatted(last_msg_at)`; skeleton en chargement; empty/error states.
- **A11y**: liste `<ul>`; chaque élément bouton/lien focusable; `aria-busy` pendant fetch; `aria-live` pour erreur.
- **RBAC**: lecture seule pour tous; pas d’actions.

### `/console/chat/page.tsx` (P1)
- **Liste** des threads (paginée 20/l *côté serveur si dispo*, sinon client côté UI), colonne `title`, `last_msg_at`.
- **Panneau messages**: affiche les messages du thread sélectionné; **pas d’input**; scroll vers le bas.
- **A11y**: navigation clavier liste ↔ panneau.

### `apiFetch.ts`
- Ajoute `Authorization: Bearer <RBAC_TOKEN>` si présent (LocalStorage/session).
- Génère `X-Trace-Id` unique par requête (UUID v4) si absent; consigne la valeur dans `logs/ui_network.json`.
- 401 → redirect `/login`.

---

## 4) CI — Matrix & smokes

### `arka-meta/reports/staging/rbac_matrix.json` (ajouts)
```json
{
  "oracles": {
    "health": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}},
    "metrics/kpis": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}},
    "chat/threads": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}}
  }
}
```

### `scripts/smokes_matrix_guard.mjs` (exécution)
- Lire et tester `"chat/threads"` dans `matrix.oracles`.
- Emettre NDJSON `{ts, role, route, code}` dans `logs/rbac_smokes.ndjson`.

### Workflow `rbac-smokes.yml`
- Inchangé: le **pick-host + net‑guard** décide d’exécuter ou de **skip** selon `/api/health`.

---

## 5) Evidence (texte uniquement)
- `logs/ui_network.json` (captures Fetch: route, method, code, durées, `x-trace-id`).
- `logs/rbac_smokes.ndjson` (artefact CI).
- `arka-meta/reports/codex/R2_5/sha256sums.txt` (MAJ avec les fichiers texte ajoutés/modifiés).

---

## 6) Tests & A11y/Perf
- **Unit**: formatage de `last_msg_at`; rendu Empty/Error; cap `max 5`.
- **E2E léger**: présence des éléments après fetch; redirection 401.
- **A11y**: tab-order complet; `:focus-visible`; `aria-live` pour erreurs.
- **Perf**: pas d’images; pas de fonts bloquantes; encart ne dégrade pas `/console`.

---

## 7) Risques & mitigations
- **Endpoint lent/KO** → skeleton + error state non-bloquant; bannière d’indispo si health KO.
- **Tokens expirés** → 401 redirige `/login`.
- **Dérive contrat** → Matrice CI détecte via oracles; job en `warn` au début.

---

## 8) Checklists MR
**MR‑UI (Threads RO)**
- [ ] `ThreadsCard.tsx` présent et branché sur `/console`.
- [ ] `/console/chat` opérationnel (P1) sans input.
- [ ] `apiFetch` ajoute `Authorization` + `X-Trace-Id`, gère 401.
- [ ] `logs/ui_network.json` fourni (texte).

**MR‑CI (Matrice)**
- [ ] `rbac_matrix.json` inclut `chat/threads`.
- [ ] `smokes_matrix_guard.mjs` émet les NDJSON attendus.
- [ ] Artefacts CI publiés; checksums MAJ.



# B7 — Evidence Pack & Trace‑Id (Codex‑ready)

> **Objectif** : fournir un **pack d’évidences 100 % textuel** et **corrélé** (UI → API) pour chaque incrément, sans fichiers binaires. Ajouter un **Trace‑Id** de bout‑en‑bout, des exports **NDJSON/JSON** et l’intégration CI (artefacts + SHA256).

---

## Portée
- **IN** : Frontend (Next App Router) — wrapper `apiFetch` côté client, capture réseau UI, export **`logs/ui_network.json`** et **`rbac_smokes.ndjson`** (déjà en CI), script SHA256, workflows Actions (upload artefacts).  
- **OUT** : modification serveur/back (on n’exige pas d’écho‐header serveur). Si le serveur renvoie un `x-request-id`, on le loggue **en plus**.

## Livrables (fichiers à créer/éditer)
- `app/(lib)/apiFetch.ts` (ou `lib/apiFetch.ts`) : **injection `X-Trace-Id`** + capture (méthode, url, statut, durée, rôle, host, trace_id) + **masquage** headers sensibles.
- `app/(providers)/evidence/EvidenceProvider.tsx` : **contexte** pour bufferiser les événements réseau + bouton **Exporter** (JSON texte).  
- `app/console/_components/ExportEvidenceButton.tsx` : bouton UI pour télécharger `logs/ui_network.json`.
- `scripts/sha256_evidence.sh` : calcule SHA256 des fichiers texte d’évidence et génère `arka-meta/reports/codex/R2_5/sha256sums.txt`.
- `.gitignore` : ignorer `logs/**`, `*.ndjson`, `*.zip`.
- `.github/workflows/rbac-smokes.yml` : **garantir** upload artefacts `logs/*.ndjson` (déjà présent), **rétention 7 jours**.
- `README.md` (ou `docs/evidence.md`) : **mode d’emploi** (où cliquer pour exporter, où se trouvent les artefacts CI).

> ⚠️ **Interdit** : images/PNGs/PDFs dans la PR. Le pack reste **texte** : `.json`, `.ndjson`, `.txt`.

---

## Contrat de log (UI → `ui_network.json`)
Chaque entrée **JSONL** (ou tableau JSON) doit contenir :
```json
{
  "ts": "ISO-8601",
  "method": "GET|POST|...",
  "url": "/api/...",        
  "status": 200,
  "dur_ms": 123,
  "trace_id": "uuid-v4",
  "role": "viewer|operator|owner",
  "host": "arka-squad.app",
  "server_request_id": "optional-if-present"
}
```
Règles :
- **Masquer** `Authorization`, cookies, et query sensibles (`token=…` → `REDACTED`).
- **Trace‑Id** : UUID v4 **par requête**; injecté dans header `X-Trace-Id`.
- **Durée** : mesure fetch start → response end.

---

## Critères d’acceptation
1. **Injection Trace‑Id** : toute requête `apiFetch` contient `X-Trace-Id: <uuid>`.
2. **Export UI** : depuis `/console`, clic sur **Exporter les évidences** → téléchargement **`logs/ui_network.json`** (min. 1 appel `/api/metrics/kpis` + 1 appel `/api/health`).
3. **Corrélation** : la même valeur `trace_id` apparaît dans `ui_network.json` et (si présent) dans les artefacts smokes CI `rbac_smokes.ndjson` pour les mêmes routes.
4. **CI artefacts** : `rbac-smokes` publie `logs/net_self_check.ndjson` et `logs/rbac_smokes.ndjson` (rétention 7 jours).
5. **SHA256** : exécuter `scripts/sha256_evidence.sh` produit/actualise `arka-meta/reports/codex/R2_5/sha256sums.txt` avec les empreintes des fichiers texte d’évidence.
6. **Zéro binaire** : aucune image/PDF dans le pack.

---

## Tâches (implémentation)
1. **Wrapper `apiFetch`**
   - Générer un `traceId` (uuid v4) par appel.
   - `headers['X-Trace-Id']=traceId`; `headers['Authorization']` si token (RBAC_TOKEN) est présent.
   - Mesurer la durée ; pousser un event vers `EvidenceProvider.add({ ts, method, urlPath, status, dur_ms, trace_id, role, host, server_request_id? })`.
   - **Masquage** : ne jamais sérialiser `Authorization`/cookies. Si l’URL contient `token=` → remplacer par `token=REDACTED` dans les logs.

2. **Provider + Export**
   - Stocker en mémoire (React context) un **buffer circulaire** (par ex. 200 événements).
   - Exposer `<ExportEvidenceButton/>` qui sérialise le buffer au format JSON (ou JSONL) et déclenche un `download` nommé `ui_network.json`.

3. **Script SHA256**
   - Bash portable : calcule sha256 des fichiers s’il existent :
```bash
#!/usr/bin/env bash
set -euo pipefail
mkdir -p arka-meta/reports/codex/R2_5
{
  for f in logs/*.ndjson logs/*.json 2>/dev/null; do [ -f "$f" ] && sha256sum "$f"; done
} > arka-meta/reports/codex/R2_5/sha256sums.txt
```

4. **CI**
   - Vérifier que `rbac-smokes.yml` upload bien `logs/*.ndjson`. Ajouter `retention-days: 7`.
   - (Optionnel) Step final `run: bash scripts/sha256_evidence.sh || true` pour joindre l’empreinte aux artefacts.

5. **Docs**
   - `README.md` : section **Evidence Pack** (où cliquer, où récupérer les artefacts, comment lire `trace_id`).
   - Mentionner que la **corrélation serveur** est opportuniste : si le back expose `x-request-id`, on le renseigne en `server_request_id`.

---

## Notes d’implémentation (extraits)
**Génération UUID v4 (sans lib)** :
```ts
function uuidv4() {
  // RFC4122 v4 simple pour navigateur
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

**Wrapper minimal** :
```ts
export async function apiFetch(path: string, init: RequestInit = {}) {
  const t0 = performance.now();
  const traceId = uuidv4();
  const url = new URL(path, process.env.NEXT_PUBLIC_HOST || window.location.origin);
  if (url.searchParams.has('token')) url.searchParams.set('token', 'REDACTED');

  const headers = new Headers(init.headers || {});
  headers.set('X-Trace-Id', traceId);
  const token = localStorage.getItem('RBAC_TOKEN');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url.toString(), { ...init, headers });
  const dur = Math.round(performance.now() - t0);
  const serverReqId = res.headers.get('x-request-id') || undefined;

  Evidence.add({
    ts: new Date().toISOString(),
    method: (init.method || 'GET').toUpperCase(),
    url: url.pathname + url.search,
    status: res.status,
    dur_ms: dur,
    trace_id: traceId,
    role: getCurrentRole(),
    host: url.host,
    server_request_id: serverReqId
  });

  return res;
}
```

**Export bouton** :
```tsx
function ExportEvidenceButton() {
  const data = Evidence.useBuffer();
  const onClick = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ui_network.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return <button className="rounded-xl px-3 py-2 border">Exporter les évidences</button>;
}
```

---

## QA — Scénarios de validation
- Ouvrir `/console` (token Viewer) → **Exporter** → vérifier présence de deux entrées min. : `/api/metrics/kpis` et `/api/health`, avec `trace_id`, `status`, `dur_ms`.
- Changer de rôle (Owner) → **Exporter** → vérifier `role:"owner"` dans les nouvelles entrées.
- Lancer `rbac-smokes` → télécharger l’artefact `rbac_smokes.ndjson` → vérifier qu’au moins une route chevauche les appels UI et que les `trace_id` y figurent.
- Exécuter `scripts/sha256_evidence.sh` localement → vérifier contenu de `arka-meta/reports/codex/R2_5/sha256sums.txt`.

---

## Risques & Mitigations
- **Absence d’écho serveur** du `X-Trace-Id` : on conserve la corrélation côté UI/CI via `trace_id` commun aux smokes; si le BE expose `x-request-id`, on le journalise aussi.
- **Fuite de secrets** : masquage systématique, logs côté client **sans headers sensibles**.
- **Binaries accidentels** : PR check manuel + rappel dans README; CI n’archive que des **textes**.

---

## Done‑Definition
- [ ] `apiFetch` injecte `X-Trace-Id` et loggue les sorties.
- [ ] Export **`ui_network.json`** opérationnel en Console.
- [ ] Artefacts CI présents (NDJSON, rétention 7 jours).
- [ ] SHA256 généré dans `arka-meta/reports/codex/R2_5/sha256sums.txt`.
- [ ] README mis à jour (mode d’emploi Evidence Pack).


# B8 — RBAC Matrix & Smokes CI (Codex‑ready)

> **But**: geler une **matrice RBAC** (viewer/operator/owner) et exécuter des **smokes déterministes** en CI, avec garde réseau, artefacts NDJSON et checksums. Aucun binaire.

---

## 1) Résultat attendu (Go/No‑Go)

- **Matrice** versionnée: codes attendus par (endpoint, méthode, rôle).
- **Runner Node**: lit la matrice, appelle l’API avec les 3 JWT, **compare** et sort **NDJSON + synthèse**.
- **Workflow CI**: pick‑host + net‑guard → runner (ou fallback bash) → artefacts → statut **fail|warn** selon `RBAC_SMOKES_MODE`.
- **Artefacts**: `logs/net_self_check.ndjson`, `logs/rbac_smokes.ndjson`, `arka-meta/reports/codex/R2_5/sha256sums.txt`.

---

## 2) Fichiers à créer/éditer

- `arka-meta/reports/staging/rbac_matrix.json` (matrice attendus)
- `arka-meta/reports/staging/payloads/agents.create.example.json` (payload POST)
- `scripts/smokes_matrix_guard.mjs` (runner Node)
- `scripts/smoke_agents.sh` (fallback Bash, minimal)
- `.github/workflows/rbac-smokes.yml` (workflow CI)
- (optionnel) `.github/workflows/network-gate.yml` (sanity réseau en amont)
- `README.md` (section CI Smokes RBAC)
- `.gitignore` (ignorer `logs/**`, `*.ndjson`)

---

## 3) Matrice RBAC (staging, **figée v0.1**)

`arka-meta/reports/staging/rbac_matrix.json`

```json
{
  "oracles": {
    "health": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}}
  },
  "agents": {
    "GET /api/agents": {"viewer": [403], "operator": [200], "owner": [200]},
    "POST /api/agents": {"operator": [403], "owner": [200, 201]}
  }
}
```

Payload POST d’exemple — `arka-meta/reports/staging/payloads/agents.create.example.json`

```json
{ "name": "smoke-agent" }
```

> **Compat rôles**: si des secrets `RBAC_TOKEN_EDITOR`/`RBAC_TOKEN_ADMIN` existent, ils sont acceptés comme alias de `operator`/`owner`.

---

## 4) Runner (Node) — `scripts/smokes_matrix_guard.mjs`

```js
#!/usr/bin/env node
import fs from 'node:fs/promises';
import process from 'node:process';

const args = Object.fromEntries(
  process.argv.slice(2).map((a,i,arr)=> a.startsWith('--') ? [a.slice(2), arr[i+1]] : [] ).filter(Boolean)
);
const host = args.host || process.env.HOST;
const mode = (args.mode || process.env.RBAC_SMOKES_MODE || 'warn').toLowerCase();

// Tokens (accept aliases)
const TOK = {
  viewer:   process.env.RBAC_TOKEN_VIEWER   || '',
  operator: process.env.RBAC_TOKEN_OPERATOR || process.env.RBAC_TOKEN_EDITOR || '',
  owner:    process.env.RBAC_TOKEN_OWNER    || process.env.RBAC_TOKEN_ADMIN  || ''
};

const matrix = JSON.parse(await fs.readFile('arka-meta/reports/staging/rbac_matrix.json','utf8'));
const out = [];

async function call(method, path, role, body){
  const res = await fetch(host + path, {
    method,
    headers: {
      'Authorization': `Bearer ${TOK[role] || ''}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.status;
}

function ok(expected, code){ return Array.isArray(expected) && expected.includes(code); }

// Oracles simples (ex: /api/health)
for (const [name, cfg] of Object.entries(matrix.oracles || {})) {
  for (const [method, roles] of Object.entries(cfg)) {
    for (const [role, expected] of Object.entries(roles)) {
      const code = await call(method, `/api/${name}`, role);
      out.push({ ts:new Date().toISOString(), role, route:`/api/${name}`, code });
      if (!ok(expected, code) && mode==='fail') process.exitCode = 1;
    }
  }
}

// Domain: agents
const payload = JSON.parse(await fs.readFile('arka-meta/reports/staging/payloads/agents.create.example.json','utf8'));
for (const [route, roles] of Object.entries(matrix.agents || {})) {
  const [method, path] = route.split(' ');
  for (const [role, expected] of Object.entries(roles)) {
    const body = method === 'POST' ? payload : undefined;
    const code = await call(method, path, role, body);
    out.push({ ts:new Date().toISOString(), role, route: path, code });
    if (!ok(expected, code) && mode==='fail') process.exitCode = 1;
  }
}

await fs.mkdir('logs', { recursive: true });
await fs.writeFile('logs/rbac_smokes.ndjson', out.map(x=>JSON.stringify(x)).join('\n'));
console.log(out.map(x=>JSON.stringify(x)).join('\n'));
```

---

## 5) Fallback minimal (Bash) — `scripts/smoke_agents.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
HOST=${HOST:-https://arka-squad.app}
mkdir -p logs
for role in viewer operator owner; do
  tok_var="RBAC_TOKEN_${role^^}"
  token="${!tok_var:-}"
  code=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 \
    -H "Authorization: Bearer $token" "$HOST/api/agents" || echo 000)
  echo "{\"ts\":\"$(date -Ins)\",\"role\":\"$role\",\"route\":\"/api/agents\",\"code\":$code}" | tee -a logs/rbac_smokes.ndjson
done
```

---

## 6) Workflow CI — `.github/workflows/rbac-smokes.yml`

```yaml
name: rbac-smokes
on:
  workflow_dispatch:
  pull_request:
    paths: ['**/*']

concurrency:
  group: rbac-smokes-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  actions: read

jobs:
  smokes:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    env:
      HOST_PRIMARY: https://arka-squad.app
      HOST_FALLBACK: https://arka-liard.vercel.app
      RBAC_SMOKES_MODE: warn
      HTTP_PROXY: ""
      HTTPS_PROXY: ""
      ALL_PROXY: ""
      NO_PROXY: "localhost,127.0.0.1,.vercel.app,.vercel.dev,vercel.com,arka-squad.app,www.arka-squad.app,arka-liard.vercel.app"
    steps:
      - uses: actions/checkout@v4

      - name: pick-host + net-guard
        id: guard
        shell: bash
        run: |
          set -euo pipefail
          mkdir -p logs
          p=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "$HOST_PRIMARY/api/health" || echo 000)
          if [ "$p" = "200" ]; then
            echo "HOST=$HOST_PRIMARY" >> $GITHUB_ENV; echo "STATE=online" >> $GITHUB_ENV;
          else
            echo "HOST=$HOST_FALLBACK" >> $GITHUB_ENV;
            f=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "$HOST_FALLBACK/api/health" || echo 000)
            if [ "$f" = "200" ]; then echo "STATE=online" >> $GITHUB_ENV; else echo "STATE=offline" >> $GITHUB_ENV; fi
          fi
          echo "{\"ts\":\"$(date -Ins)\",\"primary\":\"$p\",\"host\":\"${HOST:-unset}\",\"state\":\"${STATE:-unset}\"}" | tee logs/net_self_check.ndjson

      - name: run matrix smokes (if present)
        if: ${{ hashFiles('scripts/smokes_matrix_guard.mjs') != '' && env.STATE == 'online' }}
        shell: bash
        env:
          RBAC_TOKEN_VIEWER: ${{ secrets.RBAC_TOKEN_VIEWER }}
          RBAC_TOKEN_OPERATOR: ${{ secrets.RBAC_TOKEN_OPERATOR }}
          RBAC_TOKEN_OWNER: ${{ secrets.RBAC_TOKEN_OWNER }}
          RBAC_TOKEN_EDITOR: ${{ secrets.RBAC_TOKEN_EDITOR }}
          RBAC_TOKEN_ADMIN:  ${{ secrets.RBAC_TOKEN_ADMIN }}
        run: |
          set -euo pipefail
          node --version
          mkdir -p logs
          node scripts/smokes_matrix_guard.mjs --host "$HOST" --mode "$RBAC_SMOKES_MODE" | tee -a logs/rbac_smokes.ndjson

      - name: run minimal smokes (fallback)
        if: ${{ hashFiles('scripts/smokes_matrix_guard.mjs') == '' && env.STATE == 'online' }}
        shell: bash
        env:
          RBAC_TOKEN_VIEWER: ${{ secrets.RBAC_TOKEN_VIEWER }}
          RBAC_TOKEN_OPERATOR: ${{ secrets.RBAC_TOKEN_OPERATOR }}
          RBAC_TOKEN_OWNER: ${{ secrets.RBAC_TOKEN_OWNER }}
        run: |
          set -euo pipefail
          bash scripts/smoke_agents.sh

      - name: upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: rbac-smokes
          path: |
            logs/net_self_check.ndjson
            logs/rbac_smokes.ndjson
```

> **Branch protection**: ajouter `rbac-smokes` (et `network-gate`, `secret-scan`) aux *required status checks*.

---

## 7) Variables & secrets requis

- **Secrets**: `RBAC_TOKEN_VIEWER`, `RBAC_TOKEN_OPERATOR` (ou `RBAC_TOKEN_EDITOR`), `RBAC_TOKEN_OWNER` (ou `RBAC_TOKEN_ADMIN`).
- **Env CI** (défaut): `HOST_PRIMARY`, `HOST_FALLBACK`, `RBAC_SMOKES_MODE=warn`, `NO_PROXY` (incluant domaines Arka/Vercel).

**JWT HS256 (staging)**: `iss="arka"`, `aud="arka-squad"`, `iat`, `exp` ≥ 24h, tolérance `clock_skew_s ≤ 60`.

---

## 8) Critères d’acceptation (Given/When/Then)

- **Matrix load**: Given la matrice JSON, When le runner s’exécute, Then chaque couple (endpoint, méthode, rôle) est testé et comparé.
- **Mode fail**: Given `RBAC_SMOKES_MODE=fail`, When un code ∉ attentes, Then le job échoue avec synthèse explicite (diff attendu/obtenu).
- **Mode warn**: Given `RBAC_SMOKES_MODE=warn`, When un code ∉ attentes, Then le job passe en *warning* (succès CI) avec synthèse jointe.
- **Artefacts**: Given exécution, Then les 2 NDJSON sont uploadés + `sha256sums.txt` mis à jour dans une MR ultérieure.

---

## 9) Notes d’implémentation

- Le runner Node fonctionne sans dépendances (Node 18+ / fetch natif).
- Le Bash fallback ne couvre **que** `/api/agents` (GET) — utile si Node indispo.
- `NO_PROXY` neutralise les proxys réseau GitHub Actions qui provoquaient `CONNECT 403`.
- **Pas d’images**: tous les artefacts sont **texte** (NDJSON, checksums).

---

## 10) DoD

- [ ] Fichiers créés/édités (liste §2) présents et valides.
- [ ] Secrets configurés dans GitHub (`RBAC_TOKEN_*`).
- [ ] Workflow `rbac-smokes` **vert** en mode `warn`.
- [ ] Passage en mode `fail` validé après stabilisation.
- [ ] Artefacts présents sur un run CI de PR.



B9 — Gateway IA (pilote AGP)

## But

Brancher le Vercel AI SDK sur `/ai/stream` (serveur), journalisé.

## Livrables

* Route `app/api/ai/stream/route.ts` (ou pages/api) avec modèle par rôle.
* Logs NDJSON : `{model, role, ttft_ms, tokens_total}`.

## Acceptation

* Streaming token‑par‑token visible en UI (AGP pilote).
* Logs présents en local/dev (masqués prod si besoin).

## Hors‑périmètre

* Orchestration multi‑agents complète (v2).

Détails :

# B9 — Observabilité v0.1 (Codex‑ready)

> **But**: livrer la vue **Observabilité** en **lecture seule** avec graphe simple (historique) + table Runs paginée (20/l), filtres **Lot/Sprint** (UI‑only), net‑guard UI, a11y AA, et **évidences sans PNG**.

---

## 1) Scope & règles

* **Lecture only** (aucune écriture).
* **Sources**: `GET /api/metrics/kpis` (métriques agrégées) et `GET /api/metrics/runs?page=1&limit=20` (historique runs).
* **Tri Runs**: `created_at DESC, id ASC` (si `created_at` indisponible: `ts DESC, run_id ASC`).
* **Filtres**: `Lot` et `Sprint` côté UI (pas d’API param pour v0.1).
* **Net‑guard UI**: si `/api/health` ≠ 200 → bannière **Service indisponible — lecture seule** ; la page reste navigable.
* **A11y**: WCAG 2.1 **AA**, focus‑visible, graph lisible au clavier, descriptions textuelles (sr‑only).

> **No binaries**: **pas d’images** dans la MR (PNG/JPG). Les évidences sont **JSON/NDJSON** uniquement.

---

## 2) Contrats API (v0.1 gelés)

### KPIs (agrégat courant)

`GET /api/metrics/kpis` → `200 {
  "p95": { "ttft_ms": int, "rtt_ms": int },
  "error_rate_percent": number  // 1 déc.
}`

### Runs (historique)

`GET /api/metrics/runs?page=1&limit=20` → `200 {
  "items": [
    { "ts": iso8601, "run_id": string, "trace_id": string,
      "ttft_ms": int, "rtt_ms": int, "status": "ok"|"err" },
  ],
  "page": int, "limit": int, "count": int
}`

* **Tri** attendu: `ts DESC, run_id ASC` (ou `created_at DESC` si exposé), stable.
* **Codes**: `200` OK, `401` → redirect login géré globalement, `5xx` → état erreur UI.

**cURL oracles** (README/QA):

```bash
curl -s "$HOST/api/metrics/kpis" | jq .
curl -s "$HOST/api/metrics/runs?page=1&limit=20" | jq .
```

---

## 3) Fichiers à créer / modifier

* **Page**: `app/console/observabilite/page.tsx`
* **Composants**:

  * `components/obs/HealthChip.tsx` (réutilisable, aria‑live)
  * `components/obs/KpiCards.tsx`
  * `components/obs/RunsChart.tsx` (Line/Area – **sans** capture PNG)
  * `components/obs/RunsTable.tsx` (20/l, pagination contrôlée)
  * `components/obs/Filters.tsx` (Lot/Sprint; state UI; querystring `?lot=&sprint=`)
* **Utils**:

  * `lib/apiFetch.ts` (déjà) – ajoute `X-Trace-Id` (uuid v4) et collecte timings (pour `logs/ui_network.json`)
  * `lib/format.ts` (arrondis 1 déc., format pourcent/ms, date lisible)
* **Styles**: `styles/obs.css` (si besoin)
* **Évidences** (créées au build/preview ou script UI):

  * `logs/ui_network.json` (requests + codes + latences + `trace_id`)
  * `reports/obs_kpis.json` (dump JSON des KPIs affichés)
  * `reports/obs_runs_page1.json` (dump JSON runs p1 – 20 éléments)
  * `arka-meta/reports/codex/R2_5/sha256sums.txt` (mise à jour)

> **Note**: **aucun** fichier image ne doit être commité. Les JSON/NDJSON sont acceptés.

---

## 4) UX de la page

* **Header**: Titre *Observabilité* + **HealthChip** (vert si `/api/health` 200, sinon gris/état KO).
* **Fil d’Ariane**: Console / Observabilité.
* **Barre filtres**: `Lot` (ex: R2.5, R3.0 …) et `Sprint` (ex: S1, S2…) – sélecteurs UI, persistés dans l’URL (`?lot=R2.5&sprint=S1`).
* **Graphe RunsChart**:

  * Courbe `ttft_ms` & `rtt_ms` (moyenne glissante simple à partir de `items` de `/metrics/runs`).
  * **Zoom**/fenêtre: 50 derniers points (si >50, UI propose “voir plus”).
  * Axe Y en ms, X en date/heure lisible.
  * État *empty* si `items.length===0` (texte : *Aucune exécution disponible*).
* **Table RunsTable**:

  * Colonnes: `ts`, `run_id` (copiable), `trace_id` (copiable), `ttft_ms`, `rtt_ms`, `status`.
  * Pagination contrôlée (`page`, `limit=20`).
  * Tri stable (`ts DESC`, puis `run_id ASC`), *no-jitter* entre rafraîchissements.
* **Bannière Net‑guard**: si health≠200 → *Service indisponible — lecture seule* (actions grisées).
* **A11y**:

  * Focus visible sur filtres et pagination.
  * Descriptions pour le graphe (sr‑only: *Évolution ttft/rtt en millisecondes*).
  * Contrastes AA.

---

## 5) Implémentation (lignes directrices)

* **Data‑fetching**: côté serveur (RSC) pour SEO/perf si possible; fallback client ok.
* **apiFetch**: inclut `Authorization` si token présent + `X-Trace-Id`; journalise `{ts, route, status, tt, trace_id}` dans `logs/ui_network.json` (dev/preview).
* **Debounce** filtres (250 ms) et synchro querystring.
* **Loading**: skeleton pour graphe & table.
* **Errors**: message non bloquant + lien *Réessayer* (re‑fetch).

---

## 6) Tests & oracles

### Acceptation (Given/When/Then)

1. **KPIs visibles** — Given API up, When j’ouvre `/console/observabilite`, Then KPIs (p95.ttft\_ms, p95.rtt\_ms, error\_rate\_percent) s’affichent avec **1 décimale**.
2. **HealthChip** — Given `/api/health` 200, Then chip = *OK* (aria‑live).
3. **RunsTable** — Given `GET /api/metrics/runs?page=1&limit=20`, Then la table montre ≤20 lignes, tri stable (`ts DESC, run_id ASC`).
4. **RunsChart** — Given items≥1, Then graphe visible; else état *empty*.
5. **Filtres** — When je change Lot/Sprint, Then l’URL est mise à jour et l’UI reflète la sélection (même si l’API ne filtre pas).
6. **Net‑guard** — Given health≠200, Then bannière visible, **aucune action bloquante** (lecture ok).
7. **A11y** — Tab/Shift+Tab naviguent l’ensemble; contrastes ≥4.5:1.

### Oracles cURL (README/CI)

```bash
curl -s -o /dev/null -w '%{http_code}\n' "$HOST/api/metrics/kpis"
curl -s -o /dev/null -w '%{http_code}\n' "$HOST/api/metrics/runs?page=1&limit=20"
```

---

## 7) CI & Smokes (ajouts)

* **rbac\_matrix.json** — ajouter:

```json
{
  "oracles": {
    "metrics/kpis": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}},
    "metrics/runs?page=1&limit=20": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}}
  }
}
```

> Si la matrice est éclatée par ressource, dupliquer le pattern existant (agents/health) et ajouter `metrics`.

* **smokes\_matrix\_guard.mjs** — inclure les 2 endpoints ci‑dessus dans la boucle oracles.
* **Artefacts CI** — uploader `reports/obs_kpis.json` et `reports/obs_runs_page1.json` **uniquement** (pas d’images).
* **NO\_PROXY** workflows — veiller à inclure `arka-team.app` si bascule d’apex décidée.

---

## 8) DoD (Definition of Done)

* [ ] Page `/console/observabilite` accessible depuis la sidenav.
* [ ] KPIs affichés (1 déc.) + HealthChip en aria‑live.
* [ ] RunsChart opérationnel (empty/loaded/errored).
* [ ] RunsTable paginée 20/l, tri stable.
* [ ] Filtres Lot/Sprint persistés en querystring.
* [ ] Net‑guard UI actif (health check).
* [ ] A11y AA vérifiée (tab order, contrastes).
* [ ] **Évidences**: `reports/obs_kpis.json`, `reports/obs_runs_page1.json`, `logs/ui_network.json`, `sha256sums.txt` mis à jour.
* [ ] **CI**: smokes incluent `metrics/kpis` et `metrics/runs` (matrice + runner).

---

## 9) Risques & parades

* **API `metrics/runs` instable** → fallback UI: message *Données historiques indisponibles* + table vide; graphe en empty‑state.
* **Variations schéma** → valider shape côté UI (guards) + journaliser diff dans `ui_network.json`.
* **Perf** (gros `items`) → limite 20/l, slice côté UI, virtualisation table si besoin.
* **Accessibilité graphe** → fournir résumé textuel des KPIs et dernières valeurs (sr‑only).

---

## 10) Notes d’intégration

* **Pas d’images** dans la MR. Toute capture doit être remplacée par une **sauvegarde JSON** des données affichées.
* **Trace**: propager `X-Trace-Id` depuis l’UI vers l’API (si support) et consigner dans `logs/ui_network.json`.
* **Demo/Offline**: si un *mode DEMO* existe, il peut injecter un échantillon d’`items` pour RunsChart **mais jamais** en mode normal.


# B10 — Offline & Démo Guard (UI + Seeds) — Codex‑ready

## Objet
Mettre en place **le mode Hors‑ligne/Démo** dans l’UI Arka :
- Détection réseau (healthcheck) et **garde UI** non bloquante.
- Bascule **DEMO** manuelle (toggle) qui injecte des **seeds locales** réalistes.
- **Désactivation d’édition** quand l’API est indisponible (lecture‑seule propre, sans erreurs console).
- **Watermark DEMO** visible et **bouton Copier métriques**.
- Zéro binaire dans les évidences (JSON/NDJSON uniquement).

---

## Portée
- Pages concernées: `/`, `/login`, `/console`, `/console/{documents,prompt-builder,observabilite}`.
- Couverture des data en DEMO: `metrics/kpis`, `documents` (liste), `chat/threads` (5), et **séries historiques** simplifiées pour Observabilité.
- **Pas** d’écriture serveur en DEMO. Prompt Builder reste **local‑only**.

Hors‑portée: persistance serveur, replay vers API, upload de fichiers, auth serveur.

---

## Comportement attendu
1) **Net‑guard auto** (au mount et à l’intervalle) :
   - Ping `GET $HOST/api/health`.
   - Si `200` → **online**: UI normale.
   - Si `!=200` → **offline**: UI passe en lecture‑seule + bannière.

2) **Bannière offline** (collée en haut, non modale, `aria-live="polite"`):
> « Service indisponible — authentifié, mais l’API ne répond pas. La console passe en lecture seule. »

3) **Toggle DEMO** (header overflow menu) :
   - Active `DEMO` **même si online** (pour démo contrôlée).
   - Injecte seeds **déterministes** (voir schéma ci‑dessous) + affiche **watermark DEMO**.
   - Un badge `LOCAL • DEMO` s’affiche sur Prompt Builder.

4) **Surfaces d’édition** (owner/operator) :
   - En **offline ou DEMO** → désactivées (disabled), tooltips d’explication.

5) **Watermark** DEMO (overlay discret, non binaire):
   - Composant CSS textuel « DEMO » (pas d’image / pas de PNG).

6) **Bouton Copier métriques** :
   - Copie dans le presse‑papier un JSON compact des KPIs/dernières valeurs (pour partage rapide).

---

## Contrats (UI + Seeds)
### Env/Config
- `NEXT_PUBLIC_HOST` (par défaut `https://arka-squad.app`).
- `NEXT_PUBLIC_DEMO_ENABLED` (bool, défaut `false`).
- `NEXT_PUBLIC_NET_GUARD_INTERVAL_MS` (défaut `15000`).

### Stockage client
- `localStorage.ARKA_DEMO = "1|0"` (prioritaire sur env, bascule instantanée).
- `localStorage.RBAC_TOKEN` (collé via /login, inchangé par DEMO).

### Seeds (format JSON)
```json
{
  "kpis": { "p95": { "ttft_ms": 320, "rtt_ms": 860 }, "error_rate_percent": 0.7 },
  "kpis_history": [
    { "ts": "2025-09-02T08:00:00Z", "ttft_ms": 340, "rtt_ms": 900, "err": 0.9 },
    { "ts": "2025-09-02T08:05:00Z", "ttft_ms": 330, "rtt_ms": 870, "err": 0.7 }
  ],
  "documents": {
    "page": 1, "page_size": 20, "count": 42,
    "items": [
      { "id": 1, "project_id": "demo", "name": "Spec v0.1.md", "mime": "text/markdown", "size": 20480, "storage_url": "blob://demo/spec-v0-1", "created_at": "2025-09-01T10:00:00Z" }
    ]
  },
  "threads": {
    "items": [
      { "id": "t1", "title": "Cadrage v0.1", "last_msg_at": "2025-09-02T07:50:00Z" }
    ]
  }
}
```

- **Tri UI** documents: `created_at DESC, id ASC` (conserver l’ordre en DEMO).
- Observabilité: utiliser `kpis_history` pour une ligne simple.

---

## Composants à livrer
- `<NetGuard />` hook + provider (contexte `{ state: 'online'|'offline', lastProbeTs }`).
- `<OfflineBanner />` (`aria-live`, fermable localement mais revient si offline persiste).
- `<DemoWatermark />` (overlay CSS, z-index haut, `pointer-events: none`).
- `<DemoToggle />` (dans le header menu → commute `localStorage.ARKA_DEMO`).
- Helpers seeds: `demo/seeds.ts` (chargement JSON statique importable) + `demo/selectors.ts`.
- API client: `apiFetch.ts` applique **read‑only** et évite throw bruyant en offline/DEMO.

---

## Pseudo‑code (extraits)
```ts
// useNetGuard.ts
export function useNetGuard(intervalMs=15000){
  const [state,setState] = useState<'online'|'offline'>('online');
  useEffect(()=>{
    let t:number|undefined;
    async function probe(){
      try{
        const r = await fetch(`${HOST}/api/health`, { cache:'no-store' });
        setState(r.ok? 'online':'offline');
      }catch{ setState('offline'); }
    }
    probe();
    t = window.setInterval(probe, intervalMs);
    return ()=> t && clearInterval(t);
  },[intervalMs]);
  return { state };
}

// apiFetch.ts (lecture-only en offline/DEMO)
export async function apiFetch(path:string, init:RequestInit = {}){
  const demo = localStorage.getItem('ARKA_DEMO') === '1';
  const offline = window.__netState === 'offline';
  if (demo || offline) return demoAdapter(path); // renvoie depuis seeds
  const token = localStorage.getItem('RBAC_TOKEN');
  const headers = { ...(init.headers||{}), ...(token? { Authorization:`Bearer ${token}` }: {}) };
  return fetch(`${HOST}${path}`, { ...init, headers });
}
```

---

## Acceptance Criteria
- **A1** Health non‑200 → `state=offline` en < 2s, bannière visible, UI **sans crash**.
- **A2** DEMO toggle → watermark + data issues de seeds, surfaces d’édition **disabled** (owner/operator), tooltips explicatifs.
- **A3** Documents DEMO → `page=1&page_size=20` respectés, tri stable côté UI.
- **A4** KPIs/Observabilité DEMO → valeurs cohérentes (arrondi 1 déc.).
- **A5** **Zéro PNG** dans la MR; évidences **texte** uniquement (JSON/NDJSON).

---

## Évidences (à joindre à la MR)
- `logs/ui_network.json` (sanity des appels réels **avant** bascule DEMO si online).
- `reports/lh_console.json` (Lighthouse console, desktop preset).
- `reports/net_guard.ndjson` (journal local des bascules online/offline/DEMO).
- `arka-meta/reports/codex/R2_5/sha256sums.txt` mis à jour.

> **Note**: pas de fichiers binaires (PNG, PDF). Captures d’écran **optionnelles** en dehors du dépôt.

---

## Tâches Codex (checklist)
1. Créer `hooks/useNetGuard.ts` + contexte global.
2. Intégrer `<OfflineBanner/>` et `<DemoToggle/>` dans le layout principal (Topbar).
3. Ajouter `<DemoWatermark/>` affiché si DEMO.
4. Implémenter `apiFetch.ts` (RBAC token + read‑only en offline/DEMO) + adaptateur seeds.
5. Créer `demo/seeds.ts` & `demo/seeds.json` (schéma ci‑dessus) + selectors pour mapping routes.
6. Brancher Console, Documents, Threads, Observabilité sur `apiFetch`/seeds.
7. Désactiver les boutons d’édition en offline/DEMO (owner/operator).
8. Ajouter bouton **Copier métriques** (JSON compact) dans Console.
9. Écrire journaux `reports/net_guard.ndjson` côté client (append in‑memory → download JSON via bouton).
10. Mettre à jour `README` (mode DEMO & Net‑Guard) et checksums.

---

## Tests rapides (Given/When/Then)
- **G1** Given API down, When ouvrir `/console`, Then bannière offline + pas d’erreur JS + valeurs figées.
- **G2** Given DEMO ON, When aller sur `/console/documents`, Then 20 items max triés (seeds).
- **G3** Given DEMO ON, When aller sur `/console/observabilite`, Then graphe s’affiche (séries seeds).
- **G4** Given DEMO ON, When owner sur `/console/prompt-builder`, Then édition permise **localement** mais marquée `LOCAL • DEMO`.

---

## Risques & Mitigations
- **Drift** seeds ↔ contrats API → garder un **mapping unique** `route→selector`.
- **Confusion UX** entre offline et DEMO → messages/badges distincts.
- **Fuites binaire** → pre‑commit hook pour refuser *.png/*.pdf.

---

## Done‑Definition (DoD)
- Net‑guard opérationnel, DEMO toggle, seeds servies.
- UI stable en offline (lecture‑seule) + watermark DEMO.
- Évidences JSON/NDJSON présentes; **aucun binaire**.
- MR verte (lint/typecheck) + checksums mis à jour.



# B11 — CI/Smokes & Net‑Guard (GitHub Actions) — Codex‑ready

> **But** : sécuriser les PR par des smokes réseau/RBAC déterministes, avec garde offline et artefacts. Zéro image binaire, tout en **NDJSON/JSON/TXT**.

---

## 1) Pré‑requis (secrets & env)

**Secrets repo (Actions → Secrets → *Repository secrets*)**
- `RBAC_TOKEN_VIEWER` (*JWT HS256, iss=arka, aud=arka-squad*)
- `RBAC_TOKEN_EDITOR` (*ou*) `RBAC_TOKEN_OPERATOR`
- `RBAC_TOKEN_ADMIN`  (*ou*) `RBAC_TOKEN_OWNER`
- `GITLEAKS_LICENSE` *(si organisation/licence)*

**Hôtes par défaut**
- `HOST_PRIMARY=https://arka-squad.app` *(note : pourra basculer vers `https://arka-team.app` quand décidé)*
- `HOST_FALLBACK=https://arka-liard.vercel.app`
- `NO_PROXY=localhost,127.0.0.1,.vercel.app,.vercel.dev,vercel.com,arka-squad.app,www.arka-squad.app,arka-team.app,www.arka-team.app,arka-liard.vercel.app`

**Rétention artefacts** : 7 jours (par défaut côté GitHub UI après upload).

---

## 2) Arborescence
```
.github/
  workflows/
    network-gate.yml
    rbac-smokes.yml
    secret-scan.yml
.github/.gitleaks.toml
scripts/
  smokes_matrix_guard.mjs
  smoke_agents.sh
arka-meta/reports/staging/
  rbac_matrix.json
  payloads/agents.create.example.json
.gitignore
```

---

## 3) Workflow — `network-gate.yml`

```yaml
name: network-gate
on:
  workflow_dispatch:
  pull_request:
    paths: ['**/*']

concurrency:
  group: network-gate-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  gate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    env:
      HOST_PRIMARY: https://arka-squad.app
      HOST_FALLBACK: https://arka-liard.vercel.app
      HTTP_PROXY: ""
      HTTPS_PROXY: ""
      ALL_PROXY: ""
      NO_PROXY: "localhost,127.0.0.1,.vercel.app,.vercel.dev,vercel.com,arka-squad.app,www.arka-squad.app,arka-team.app,www.arka-team.app,arka-liard.vercel.app"
    steps:
      - uses: actions/checkout@v4

      - name: net-dbg
        run: |
          echo "== proxy env =="; env | grep -iE 'http_proxy|https_proxy|all_proxy|no_proxy' || true
          echo "== resolv =="; cat /etc/resolv.conf || true
          echo "== DNS =="; getent hosts arka-squad.app || true; getent hosts arka-liard.vercel.app || true

      - name: curl primary
        run: |
          set -euxo pipefail
          t0=$(date -Ins)
          code=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "$HOST_PRIMARY/api/health" || echo 000)
          echo "PRIMARY $t0 -> $code"

      - name: curl fallback
        run: |
          set -euxo pipefail
          t0=$(date -Ins)
          code=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "$HOST_FALLBACK/api/health" || echo 000)
          echo "FALLBACK $t0 -> $code"
```

---

## 4) Workflow — `rbac-smokes.yml`

```yaml
name: rbac-smokes
on:
  workflow_dispatch:
  pull_request:
    paths: ['**/*']

concurrency:
  group: rbac-smokes-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  actions: read

jobs:
  smokes:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    env:
      HOST_PRIMARY: https://arka-squad.app
      HOST_FALLBACK: https://arka-liard.vercel.app
      RBAC_SMOKES_MODE: warn
      HTTP_PROXY: ""
      HTTPS_PROXY: ""
      ALL_PROXY: ""
      NO_PROXY: "localhost,127.0.0.1,.vercel.app,.vercel.dev,vercel.com,arka-squad.app,www.arka-squad.app,arka-team.app,www.arka-team.app,arka-liard.vercel.app"
    steps:
      - uses: actions/checkout@v4

      - name: pick-host + net-guard
        id: guard
        shell: bash
        run: |
          set -euo pipefail
          mkdir -p logs
          p=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "$HOST_PRIMARY/api/health" || echo 000)
          if [ "$p" = "200" ]; then
            echo "HOST=$HOST_PRIMARY" >> $GITHUB_ENV
            echo "STATE=online"       >> $GITHUB_ENV
          else
            echo "HOST=$HOST_FALLBACK" >> $GITHUB_ENV
            f=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "$HOST_FALLBACK/api/health" || echo 000)
            if [ "$f" = "200" ]; then echo "STATE=online" >> $GITHUB_ENV; else echo "STATE=offline" >> $GITHUB_ENV; fi
          fi
          echo "{\"ts\":\"$(date -Ins)\",\"primary\":\"$p\",\"host\":\"${HOST:-unset}\",\"state\":\"${STATE:-unset}\"}" | tee logs/net_self_check.ndjson

      - name: run matrix smokes (if present)
        if: ${{ hashFiles('scripts/smokes_matrix_guard.mjs') != '' && env.STATE == 'online' }}
        shell: bash
        env:
          # compat editor→operator, admin→owner
          RBAC_TOKEN_VIEWER:   ${{ secrets.RBAC_TOKEN_VIEWER }}
          RBAC_TOKEN_OPERATOR: ${{ secrets.RBAC_TOKEN_OPERATOR || secrets.RBAC_TOKEN_EDITOR }}
          RBAC_TOKEN_OWNER:    ${{ secrets.RBAC_TOKEN_OWNER   || secrets.RBAC_TOKEN_ADMIN  }}
        run: |
          set -euo pipefail
          node --version
          mkdir -p logs
          node scripts/smokes_matrix_guard.mjs --host "$HOST" --mode "$RBAC_SMOKES_MODE" | tee -a logs/rbac_smokes.ndjson

      - name: run minimal smokes (fallback)
        if: ${{ hashFiles('scripts/smokes_matrix_guard.mjs') == '' && env.STATE == 'online' }}
        shell: bash
        env:
          RBAC_TOKEN_VIEWER:   ${{ secrets.RBAC_TOKEN_VIEWER }}
          RBAC_TOKEN_OPERATOR: ${{ secrets.RBAC_TOKEN_OPERATOR || secrets.RBAC_TOKEN_EDITOR }}
          RBAC_TOKEN_OWNER:    ${{ secrets.RBAC_TOKEN_OWNER   || secrets.RBAC_TOKEN_ADMIN  }}
        run: |
          set -euo pipefail
          mkdir -p logs
          echo "Running smokes on $HOST"
          for role in viewer operator owner; do
            tok_var="RBAC_TOKEN_${role^^}"
            token="${!tok_var:-}"
            code=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 \
              -H "Authorization: Bearer $token" "$HOST/api/agents" || echo 000)
            echo "{\"ts\":\"$(date -Ins)\",\"role\":\"$role\",\"route\":\"/api/agents\",\"code\":$code}" | tee -a logs/rbac_smokes.ndjson
          done

      - name: upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: rbac-smokes
          path: |
            logs/net_self_check.ndjson
            logs/rbac_smokes.ndjson
```

---

## 5) Workflow — `secret-scan.yml` + config Gitleaks

```yaml
name: secret-scan
on:
  pull_request:
    paths: ['**/*']

concurrency:
  group: secret-scan-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Gitleaks scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN:     ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
        with:
          args: >
            detect --redact --no-banner --exit-code 1 --config .github/.gitleaks.toml
```

`.github/.gitleaks.toml`
```toml
title = "arka-labs gitleaks config"
[allowlist]
description = "Ignore faux positifs (sha256, fixtures RBAC, logs)"
paths = [
  "arka-meta/reports/codex/",
  "arka-meta/reports/staging/tokens_staging.json",
  "logs/"
]
regexes = [
  "<viewer-token>",
  "<operator-token>",
  "<owner-token>",
  "Bearer\\s+REDACTED"
]
```

---

## 6) Runner Node — `scripts/smokes_matrix_guard.mjs`

```js
#!/usr/bin/env node
import fs from 'node:fs/promises';
import process from 'node:process';

const kv = (arr) => Object.fromEntries(arr.map((a,i,x)=> a.startsWith('--') ? [a.slice(2), x[i+1]] : null).filter(Boolean));
const args = kv(process.argv.slice(2));
const host = args.host;
const mode = (args.mode||'warn').toLowerCase();

// compat secrets: operator/owner or editor/admin
const TOK = {
  viewer:   process.env.RBAC_TOKEN_VIEWER   || '',
  operator: process.env.RBAC_TOKEN_OPERATOR || process.env.RBAC_TOKEN_EDITOR || '',
  owner:    process.env.RBAC_TOKEN_OWNER    || process.env.RBAC_TOKEN_ADMIN  || ''
};

const matrix = JSON.parse(await fs.readFile('arka-meta/reports/staging/rbac_matrix.json','utf8'));
const out = [];

async function call(method, path, role, body) {
  const res = await fetch(host+path, {
    method,
    headers: { 'Authorization': `Bearer ${TOK[role]||''}`, 'Content-Type':'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.status;
}
const ok = (expected, code) => expected.includes(code);

// oracles (e.g. health, metrics/kpis)
for (const [name, cfg] of Object.entries(matrix.oracles||{})) {
  for (const [method, roles] of Object.entries(cfg)) {
    for (const [role, expected] of Object.entries(roles)) {
      const code = await call(method, `/api/${name}`, role);
      out.push({ ts:new Date().toISOString(), role, route:`/api/${name}`, code });
      if (!ok(expected, code) && mode==='fail') process.exitCode = 1;
    }
  }
}

// domain (agents)
let payload = {};
try {
  payload = JSON.parse(await fs.readFile('arka-meta/reports/staging/payloads/agents.create.example.json','utf8'));
} catch {}
for (const [route, roles] of Object.entries(matrix.agents||{})) {
  const [method, path] = route.split(' ');
  for (const [role, expected] of Object.entries(roles)) {
    const body = method==='POST' ? payload : undefined;
    const code = await call(method, path, role, body);
    out.push({ ts:new Date().toISOString(), role, route:path, code });
    if (!ok(expected, code) && mode==='fail') process.exitCode = 1;
  }
}

await fs.mkdir('logs', { recursive:true });
await fs.writeFile('logs/rbac_smokes.ndjson', out.map(x=>JSON.stringify(x)).join('\n'));
console.log(out.map(x=>JSON.stringify(x)).join('\n'));
```

---

## 7) Fallback Bash — `scripts/smoke_agents.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
HOST=${HOST:-https://arka-squad.app}
mkdir -p logs
for role in viewer operator owner; do
  tok_var="RBAC_TOKEN_${role^^}"
  token="${!tok_var:-}"
  code=$(curl -4sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 \
    -H "Authorization: Bearer $token" "$HOST/api/agents" || echo 000)
  echo "{\"ts\":\"$(date -Ins)\",\"role\":\"$role\",\"route\":\"/api/agents\",\"code\":$code}" | tee -a logs/rbac_smokes.ndjson
done
```

---

## 8) Matrice RBAC — `arka-meta/reports/staging/rbac_matrix.json`

```json
{
  "oracles": {
    "health": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}},
    "metrics/kpis": {"GET": {"viewer": [200], "operator": [200], "owner": [200]}}
  },
  "agents": {
    "GET /api/agents": {"viewer": [403], "operator": [200], "owner": [200]},
    "POST /api/agents": {"operator": [403], "owner": [200, 201]}
  }
}
```

**Payload POST** — `arka-meta/reports/staging/payloads/agents.create.example.json`
```json
{ "name": "smoke-agent" }
```

---

## 9) `.gitignore` (extraits)
```
logs/**
*.ndjson
*.zip
```

---

## 10) Acceptation (Given/When/Then)
- **Network gate** : *Given* CI PR, *When* job tourne, *Then* affiche codes `/api/health` pour primary & fallback.
- **Smokes online** : *Given* `STATE=online`, *When* runner Node présent, *Then* NDJSON produit et sortie **PASS** (mode `warn` ne casse pas la PR).
- **Smokes offline** : *Given* `STATE=offline`, *When* job tourne, *Then* saute proprement sans erreur, artefact `net_self_check.ndjson` présent.
- **Secrets manquants** : *Given* absence d’un token, *When* smokes, *Then* codes 401/403 tolérés mais notés (logs), à corriger via rotation.
- **No PNG** : aucun binaire d’image commité ; seulement artefacts NDJSON/JSON/TXT.

---

## 11) Runbook
1) **Rotation tokens** : regénérer `viewer|operator|owner` (ou `editor|admin`) et mettre à jour Secrets.
2) **Host change** : si domaine primaire bouge → éditer `HOST_PRIMARY` dans les 2 workflows.
3) **Debug réseau** : consulter artefact `rbac-smokes` → `logs/net_self_check.ndjson` ; vérifier `NO_PROXY` contient apex & vercel.
4) **Durcissement** : passer `RBAC_SMOKES_MODE=fail` une fois la matrice stabilisée.

---

## 12) Notes d’implémentation
- Le mapping **editor→operator**, **admin→owner** évite de casser la CI selon l’appellation des secrets déjà en place.
- Tous les `curl` sont forcés IPv4, timeouts courts, et neutralisent les variables proxy.
- Les artefacts restent hors repo (pas d’images), ce qui respecte ta contrainte et évite les échecs PR liés aux binaires.


# B12 — Déploiement & Vercel Pro Setup (Codex‑ready)

> **But** : déployer **arka‑labs** sur Vercel **Pro** avec domaines **apex canonique** + **www→apex 308**, variables d’env, garde réseau, **previews par PR**, garde‑fous coûts et **évidences textuelles** (pas d’images).

---

## 0) Résultat attendu (Go/No‑Go)
- **Prod** accessible sur **https://arka‑squad.app** (apex canonique).  
- **www.arka‑squad.app → 308 → apex**.
- **Preview** par PR : `https://<branch>‑arka‑labs.vercel.app` + checks CI verts.
- `GET /api/health → 200 {"status":"ok"}` depuis runner GitHub **et** poste local.
- **Aucun binaire** dans la PR (évidences = fichiers texte/JSON/NDJSON uniquement).

---

## 1) Branch mapping & Build
- **Prod** : `main` → environnement **Production**.  
- **Preview** : toute **PR** → environnement **Preview**.  
- Build command : `npm ci && npm run build`  
- Output (Next.js App Router) : `.vercel/output` géré par Vercel.

---

## 2) Domaines & DNS
**Canonique** : `arka‑squad.app` (apex).  
**Alias** : `www.arka‑squad.app` → redirigé **308** vers apex.

### DNS (chez le registrar)
- **Apex** : `A arka‑squad.app → 216.198.79.1` *(nouvelle plage Vercel, l’ancienne 76.76.21.21 reste compatible mais préférez la nouvelle)*
- **WWW** : `CNAME www → <cname fourni par Vercel dans l’onglet Domain>`  
*(Ne pas durcir à une IP pour www ; toujours un CNAME)*

> Après pointage, **ajouter les 2 domaines dans Vercel** (Project → Settings → Domains) puis **set canonical = apex**.

---

## 3) Redirects & Rewrites (vercel.json)
Créer `vercel.json` à la racine :

```json
{
  "redirects": [
    { "source": "https://www.arka-squad.app/:path*", "destination": "https://arka-squad.app/:path*", "permanent": true },
    { "source": "/securite", "destination": "/beta", "permanent": true }
  ]
}
```

> L’entrée `/securite → /beta` aligne la **Norme Pack IA**.

---

## 4) Variables d’environnement (Vercel)
**Scope** `Production` *et* `Preview` (sauf mention).

### Réseau / Hôtes
- `NEXT_PUBLIC_HOST` = `https://arka-squad.app` *(Prod/Preview identique pour l’instant)*
- `NO_PROXY` = `localhost,127.0.0.1,.vercel.app,.vercel.dev,vercel.com,arka-squad.app,www.arka-squad.app,arka-liard.vercel.app`

### RBAC (CI smokes / Console Login manual)
- **Secrets CI (GitHub)** : `RBAC_TOKEN_VIEWER`, `RBAC_TOKEN_EDITOR` (ou `OPERATOR`), `RBAC_TOKEN_ADMIN` (ou `OWNER`).
- **Facultatif Vercel** (si besoin de back‑office ultérieur, **pas requis** en v0.1) : `RBAC_TOKEN_*` (Server‑side only).

### Sécurité / Scans (option Team+Licence)
- `GITLEAKS_LICENSE` *(sur GitHub Secrets ; pas nécessaire sur Vercel)*

> **Note** : pas de `BLOB_READ_WRITE_TOKEN` tant que l’UI n’écrit rien côté Blob. On reste **lecture‑only**.

---

## 5) Protections coûts & limites (Vercel Pro)
- **Notifications d’usage** : Team → Usage → Alerts (courriel) : seuils **invocations** & **bandwidth**.
- **Fonctions** : Runtime **Node.js** (pas Edge pour l’instant) ; **Memory** et **Max Duration** par défaut (suffisant v0.1).  
- **Web Analytics / Speed Insights** : activer **Speed Insights** (utile perf), **Web Analytics** optionnel (surveiller coûts).  
- **Cron** : *désactivé* en v0.1 (évite invocations inutiles).  
- **Previews Access** : restreindre accès (Password/Team only) pour démos privées.

---

## 6) CI/CD intégration (GitHub ↔ Vercel)
- Connecter **repo** `arka‑squad/arka‑labs` au projet Vercel.  
- **Required checks** (Branch protection) : `network-gate`, `rbac-smokes`, `secret-scan`.  
- **Preview** : chaque PR → URL auto ; publier artefacts (`logs/*.ndjson`, `R2_5/sha256sums.txt`).

---

## 7) Évidences (texte uniquement)
À committer **ou** en artefact CI (pas d’images) :
- `evidence/deploy/urls.txt` (prod + preview)
- `evidence/deploy/curl_health.txt` (sortie des `curl -sv` principaux)
- `arka-meta/reports/codex/R2_5/sha256sums.txt` (mis à jour)

Exemple `scripts/evidence_deploy.sh` :
```bash
#!/usr/bin/env bash
set -euo pipefail
mkdir -p evidence/deploy
{
  echo "PROD=https://arka-squad.app";
  echo "WWW=https://www.arka-squad.app";
} > evidence/deploy/urls.txt
{
  echo "== apex ==";
  curl -sv https://arka-squad.app/api/health -o /dev/null 2>&1 | tail -n +1;
  echo "== www ==";
  curl -I https://www.arka-squad.app 2>&1 | sed -n '1p;/^location:/Ip';
} > evidence/deploy/curl_health.txt
sha256sum evidence/deploy/* >> arka-meta/reports/codex/R2_5/sha256sums.txt
```

---

## 8) Check‑list déploiement (pas à pas)
1) **Vercel Pro** : créer l’équipe / vérifier le plan.
2) **Importer** le repo GitHub `arka‑squad/arka‑labs` → projet **arka‑console**.
3) **Env vars** : ajouter `NEXT_PUBLIC_HOST` & `NO_PROXY` (Prod+Preview).
4) **Domains** : ajouter `arka‑squad.app` (set **Canonical**), puis `www.arka‑squad.app`.
5) **DNS** : apex `A 216.198.79.1`, www `CNAME` fourni par Vercel (copier/coller la cible exacte affichée).
6) **vercel.json** : ajouter redirects (www→apex, /securite→/beta) et **commit**.
7) **Déployer** :
   - Preview (ouvrir une PR) → vérifier URL ;
   - Puis **Production** (merge main) → vérifier apex + 308.
8) **CI** : checks `network-gate` (200), `rbac-smokes` (codes attendus), `secret-scan` (OK).
9) **Évidences** : générer fichiers texte, mettre à jour `sha256sums`.

---

## 9) Acceptation (Given/When/Then)
- **Apex** : *Given* DNS propagé, *When* `curl -s -w "%{http_code}" https://arka-squad.app/api/health`, *Then* **200**.
- **WWW→Apex** : *Given* redirect actif, *When* `curl -I https://www.arka-squad.app`, *Then* `HTTP/1.1 308` + `location: https://arka-squad.app/`.
- **Preview** : *Given* PR ouverte, *When* on charge l’URL preview, *Then* `GET /api/health` = 200 et UI opérationnelle en lecture.
- **CI** : *Given* PR, *When* workflows, *Then* 3 checks verts avant merge.

---

## 10) Risques & mitigations
- **DNS propagation lente** → laisser l’ancien A record en parallèle quelques heures ; ne pas dupliquer www en A record.
- **Proxy/egress runners** → `NO_PROXY` déjà défini, `--noproxy '*'` côté smokes si besoin.
- **Coûts inattendus** → Alerts Vercel + pas d’Edge ni Cron en v0.1 ; Web Analytics off par défaut.
- **Secrets manquants** → fail‑fast côté CI ; UI lecture‑only → pas d’actions destructrices.

---

## 11) Tâches Codex (à livrer dans la MR)
- [ ] Ajouter `vercel.json` (redirects).  
- [ ] Doc `docs/vercel_setup.md` (copier ce B12 en synthèse opérable).  
- [ ] Script `scripts/evidence_deploy.sh` + mise à jour de `sha256sums`.  
- [ ] `README.md` → section **Deployment** (Prod/Preview, domaines, checks).  
- [ ] Vérifier **NO_PROXY** dans **tous** les workflows (`arka-team.app` inclus si on le ré‑utilise plus tard).  
- [ ] Publier les 2 artefacts texte (`urls.txt`, `curl_health.txt`).

---

## 12) Go/No‑Go
```yaml
Deployment-Review: PASS
actions_required: []
ts: 2025-09-02T00:00:00Z
```



# 3 - Fonctionnalitées annexe / 📦 Arka — Go Pack v0.1


> **But** : offrir un **jeu de construction** (type LEGO) pour assembler rapidement **workflow**, **observabilité**, **gouvernance** et **rituels** selon le contexte (App Console, ArkaBox, QA/ARC, PMO…). Le document est **modulable** : piochez des briques, combinez, et validez avec des **gates** et un **evidence pack** commun.

---

## 0) Principes directeurs (invariables)
- **Propriété client** des artefacts (mémoire, logs, exports).  
- **Local‑first & mémoire biface** (DB + snapshots PR append‑only).  
- **RBAC multi‑clients** visible **UI+API**.  
- **Sécurité de base** : HMAC + idempotence + logs JSON.  
- **Budgets perf** (TTFT/RTT/LCP/TTI/CLS) & **observabilité** (metrics, traces, logs).  
- **Gates** DoR/DoD + **evidence pack** normalisé (screenshots, logs, checksums, rapports).

---

## 1) Catalogue des briques

### A. Briques **Workflow** (choisir/ordonner)
1. **Intake** : backlog trié, critères d’acceptation G/W/T, dépendances connues.  
2. **Design‑lite** : croquis, maquette cliquable minimaliste.  
3. **Build** : branche dédiée, PR petite, pair review.  
4. **Tests** : anti‑mocks, E2E fumée, schémas JSON validés.  
5. **Contrats** : oracles cURL (API/firmware) signés.  
6. **Security pass** : secrets scanning, HMAC, idempotence, RBAC.  
7. **Perf pass** : budgets perf (TTFT/RTT/LCP/TTI/CLS).  
8. **Observabilité** : KPIs `/metrics/kpis`, runs paginés, trace_id.  
9. **Release** : tag, changelog, artefacts versionnés.  
10. **Learn** : rétro + mise à jour du playbook.

### B. Briques **Observabilité**
- **Metrics‑Core** : p95.ttft_ms, p95.rtt_ms, error_rate_percent (arrondi 1 déc.).  
- **Runs** : `/metrics/runs` paginé (limite par défaut 20).  
- **Tracing** : `trace_id` UI→API→DB (ou firmware).  
- **Dashboards** : 1 vue **Ops**, 1 vue **Produit**, 1 vue **Qualité**.  
- **Alertes budgétaires** : dépassement budgets → label `risk:perf`.

### C. Briques **Gouvernance**
- **DoR** (Definition of Ready) : oracles spécifiés, environments connus, evidences attendues listées.  
- **DoD** (Definition of Done) : preuves jointes, schémas validés, logs/metrics disponibles.  
- **ADR** : une page par décision structurante.  
- **Risk labels** : `risk:contracts`, `risk:security`, `risk:perf`, `risk:rbac`, etc.  
- **RACI** : Owner / PMO / Codex / QA‑ARC / AGP.

### D. Briques **Sécurité**
- **HMAC & idempotence** (webhooks/POST sensibles).  
- **Secret scanning** (CI).  
- **RBAC + scopes** : viewer / operator / owner.  
- **Journaux JSON** : `{ts, level, route, status, trace_id}`.

### E. Briques **Mémoire & Connaissance**
- **Export JSONL** (threads, messages, évènements).  
- **Snapshots PR** (Markdown append‑only + `sha256sums.txt`).  
- **Playbooks** (runbooks incidents, checklist release).  
- **Glossaire** (termes, alias, conventions).

### F. Briques **Rituels**
- **Stand‑up 10’** (bloqueurs, risques).  
- **Démo courte** (évidences face aux critères).  
- **Retro** (3W : What went well / Wrong / Will change).  
- **Office hours** (décisions & ADR en direct).

---

## 2) Gouvernance Canvas (remplissable)
*Utiliser ce canevas comme page 1 de votre mission.*

**Mission** : _…_  
**Cadence** : _hebdo/quinzaine_  
**Rôles** : Owner / PMO / Codex / QA‑ARC / AGP  
**Briques sélectionnées** : Workflow[ … ], Observabilité[ … ], Gouvernance[ … ], Sécurité[ … ], Mémoire[ … ], Rituels[ … ]  
**Budgets** : TTFT _≤…ms_, RTT _≤…ms_, LCP _≤…s_, TTI _≤…s_, CLS _<…_  
**Contrats** : Oracles `[ … ]`  
**DoR** : _liste d’evidences attendues_  
**DoD** : _preuves requises_  
**Risques** : _labels + plan de mitigation_  
**Décisions (ADR)** : _liens_  
**Evidence pack** : _chemins de dépôts_  

---

## 3) Recettes (assemblages types)

### 3.1 Squad **Console App**
- Workflow : Intake → Build → Tests → Contrats → Perf → Observabilité → Release → Learn.  
- Observa : Metrics‑Core + Runs + Tracing.  
- Gouvernance : DoR/DoD + ADR + Risk labels.  
- Sécurité : HMAC, Secret scanning, RBAC UI+API.  
- Mémoire : JSONL + Snapshots PR.

### 3.2 Squad **ArkaBox (firmware)**
- Workflow : Intake → PINS‑Validation → Build → Oracles HTTP locaux → Audio/LEDs → OTA → Release.  
- Observa : `/metrics` (fw_version, uptime, wifi_rssi, heap_free…), journaux sérialisés.  
- Sécurité : HMAC POST, manifest OTA signé.  
- Mémoire : logs boot + vidéo démo + `sha256sums.txt`.

### 3.3 Squad **QA/ARC**
- Workflow : Oracles → Tests E2E anti‑mock → Rapport QA → Reco.  
- Observa : `rapport_oracles.json`, runs, anomalies.  
- Gouvernance : verdict PASS/FAIL + gates.

### 3.4 **PMO**
- Workflow : Kickoff → Suivi jalons → Collecte evidences → Synthèse hebdo → Go/No‑Go.  
- Observa : tableau de bord gates.  
- Gouvernance : RACI + labels + escalade.

---

## 4) Maturité (paliers) & triggers
- **M0 – Démarrage** : DoR défini, premiers oracles écrits, evidence pack listé.  
- **M1 – Preuve terrain** : oracles **verts**, metrics en ligne, RBAC effectif, 1 ADR.  
- **M2 – Durcissement** : budgets perf respectés, webhooks sécurisés, mémoire biface en place.  
- **M3 – Industrialisation** : CI complète, dashboards, playbooks incidents, audits périodiques.  
**Triggers montée de palier** : 3 derniers sprints **PASS** sur gates et KPIs stables.

---

## 5) Gates transverses (bloquants)
1) **Contrats** : oracles réseau (ou locaux pour firmware) **exécutés** avec preuves.  
2) **Observabilité** : KPIs et runs exposés (paginés) + trace_id.  
3) **Sécurité** : HMAC + idempotence + secret scanning **actifs**.  
4) **RBAC** : rôles visibles et testés (UI+API).  
5) **Mémoire** : JSONL + PR snapshots append‑only disponibles.  
6) **Perf/A11y** : rapports budgets joints (si app UI).

---

## 6) Evidence pack (gabarit)
- **Screenshots** : parcours fumée, observabilité, RBAC.  
- **Logs** : `logs/ui_network.json`, `logs_run_*.json` ou `logs/boot_*.txt` (firmware).  
- **Oracles** : `rapport_oracles.json`, codes HTTP, payloads.  
- **Perf** : `lighthouse_{home,login,console}.json` (si UI).  
- **Mémoire** : `export_threads.jsonl`, `PR_snapshot.md`, `sha256sums.txt`.  
- **Build/CI** : `*_build.log`, artefacts versionnés.

---

## 7) RACI (exemple par brique)
| Brique | Owner | PMO | Codex | QA‑ARC | AGP |
|---|---|---|---|---|---|
| Workflow | A | R | R | C | C |
| Observabilité | C | R | R | A | C |
| Gouvernance | A | R | C | C | A |
| Sécurité | A | R | R | C | C |
| Mémoire | A | R | R | C | A |

*A=Accountable, R=Responsible, C=Consulted*

---

## 8) Cartes de politique (pick & play)
- **Policy/Commits** : MR < 400 lignes, 1 feature ; pas de merge rouge ; labels de risque obligatoires.  
- **Policy/Tests** : pas de `test.skip`, seuil de couverture minimal critique.  
- **Policy/SLO** : rupture si p95.TTFT > budget 2 s (chat) ; escalade PMO.  
- **Policy/Docs** : 1 ADR par choix structurant, evidence pack attaché à la PR.

---

## 9) Manifeste d’assemblage (à copier‑coller et remplir)
```yaml
team:
  name: <squad-name>
  cadence: weekly
  roles: [owner, pmo, codex, qa_arc, agp]
workflow:
  bricks: [intake, build, tests, contracts, security_pass, perf_pass, observability, release, learn]
observability:
  metrics: [p95_ttft_ms, p95_rtt_ms, error_rate_percent]
  runs: { enabled: true, default_limit: 20 }
  tracing: { trace_id: true }
governance:
  gates: [contracts, observability, security, rbac, memory, perf]
  dor: [oracles_list, envs_ready, evidence_pack_listed]
  dod: [evidences_attached, schemas_valid, logs_available]
security:
  hmac: true
  idempotence: true
  secret_scanning: ci
memory:
  jsonl_export: true
  pr_snapshots: true
budgets:
  ttft_ms_p95: 1500
  rtt_ms_p95: 3000
  lcp_s: 2.5
  tti_s: 2.0
  cls: 0.1
risk_labels: [contracts, security, perf, rbac]
evidence_pack_paths:
  - arka-meta/reports/codex/...
```

---

## 10) Démarrage 72h (checklist)
**D0** : remplir le **Canvas**, choisir les briques, fixer budgets & gates.  
**D+1** : écrire les **oracles** (shell/cURL) et la **liste d’évidences**, créer dashboards vierges.  
**D+2** : activer **secret scanning**, **RBAC** visible, premiers **metrics** en ligne.  
**D+3** : tenue d’une **démo courte** + première **ADR** + tri des risques.

---

## 11) Idées bonus (à piocher)
- **Badges “Gate PASS”** automatiques sur PR.  
- **Mode “Examen”** : une semaine où tout passe par oracles & budgets (zéro intuition).  
- **Cartes “Joker”** : exception documentée (valable un sprint, ADR obligatoire).  
- **Pacte de sobriété UX** : limiter modales/latences ; budget interactions par écran.  
- **Brique “Éthique”** : privacy par design, audit nouveau dataset avant usage.

---

### Fin — Kit de briques (modulaire)



---

## Annexes — Pré‑remplissage par squad (R2.5)

### A) Manifeste d’assemblage **Console App** (pré‑rempli)
```yaml
team:
  name: console-app
  cadence: weekly
  roles: [owner, pmo, codex, qa_arc, agp]
workflow:
  bricks: [intake, build, tests, contracts, security_pass, perf_pass, observability, release, learn]
observability:
  metrics: [p95_ttft_ms, p95_rtt_ms, error_rate_percent]
  runs: { enabled: true, default_limit: 20 }
  tracing: { trace_id: true }
governance:
  gates: [contracts, observability, security, rbac, memory, perf]
  dor: [oracles_list, envs_ready, evidence_pack_listed]
  dod: [evidences_attached, schemas_valid, logs_available]
security:
  hmac: true
  idempotence: true
  secret_scanning: ci
memory:
  jsonl_export: true
  pr_snapshots: true
budgets:
  ttft_ms_p95: 1500
  rtt_ms_p95: 3000
  lcp_s: 2.5
  tti_s: 2.0
  cls: 0.1
risk_labels: [contracts, security, perf, rbac]
evidence_pack_paths:
  - arka-meta/reports/codex/R2_5
host:
  preferred: https://www.arka-team.app
  fallback: https://arka-liard.vercel.app
```

### B) Manifeste d’assemblage **ArkaBox (firmware)** (pré‑rempli)
```yaml
team:
  name: arkabox-fw
  cadence: weekly
  roles: [owner, pmo, codex, qa_arc, agp]
workflow:
  bricks: [intake, pins-validation, build, contracts, security_pass, observability, release, learn]
observability:
  metrics: [fw_version, uptime_s, wifi_rssi, heap_free]
  runs: { enabled: false }
  tracing: { trace_id: true }
governance:
  gates: [contracts, audio, leds, security, ci_ota]
  dor: [oracles_local_list, envs_ready, evidence_pack_listed]
  dod: [evidences_attached, logs_available]
security:
  hmac: true
  idempotence: true
  secret_scanning: ci
memory:
  jsonl_export: false
  pr_snapshots: true
budgets:
  audio_latency_ms_p95: 120
risk_labels: [hardware, contracts, security]
evidence_pack_paths:
  - arka-box/reports
```

### C) Manifeste d’assemblage **QA/ARC** (pré‑rempli)
```yaml
team:
  name: qa-arc
  cadence: twice-weekly
  roles: [owner, pmo, qa_arc, agp]
workflow:
  bricks: [contracts, tests, observability, learn]
observability:
  metrics: [error_rate_percent]
  runs: { enabled: true, default_limit: 20 }
  tracing: { trace_id: true }
governance:
  gates: [contracts]
  dor: [oracles_list, evidence_pack_listed]
  dod: [oracles_executed, report_published]
security:
  hmac: false
  idempotence: false
  secret_scanning: ci
memory:
  jsonl_export: false
  pr_snapshots: true
budgets: {}
risk_labels: [contracts, perf]
evidence_pack_paths:
  - arka-meta/reports/codex/R2_5
```

### D) Manifeste d’assemblage **PMO** (pré‑rempli)
```yaml
team:
  name: pmo
  cadence: weekly
  roles: [owner, pmo, codex, qa_arc, agp]
workflow:
  bricks: [intake, release, learn]
observability:
  metrics: [gates_pass_count, risks_open]
  runs: { enabled: false }
  tracing: { trace_id: false }
governance:
  gates: [evidence_pack_complete]
  dor: [orders_sent, labels_applied]
  dod: [weekly_report_published]
security:
  hmac: false
  idempotence: false
  secret_scanning: ci
memory:
  jsonl_export: false
  pr_snapshots: true
budgets: {}
risk_labels: [scope]
evidence_pack_paths:
  - arka-meta/reports
```

---

## Mapping **Gates & Labels** à appliquer (suivi R2.5)

### 1) Console App — **gates** & **labels**
- **Gates (bloquants)** : `contracts`, `observability`, `security`, `rbac`, `memory`, `perf`  
- **Labels (à ajouter)** : `Lot/R2.5`, `priority/P0`, `risk:contracts`, `risk:security`, `risk:perf`, `risk:rbac`, `status/triage`  
- **Gates trackers** : `gate_DoR:true`, `gate/qa-pass`, `gate/agp-pass`

### 2) ArkaBox (firmware) — **gates** & **labels**
- **Gates (bloquants)** : `contracts` (HTTP locaux), `audio` (p95≤120ms), `leds` (playbook), `security` (HMAC+logs), `ci_ota`  
- **Labels** : `Lot/R2.5`, `priority/P0`, `risk:hardware`, `risk:contracts`, `risk:power`, `status/triage`

### 3) QA/ARC — **gates** & **labels**
- **Gates** : `contracts` (oracles exécutés + rapport)  
- **Labels** : `Lot/R2.5`, `priority/P1`, `risk:contracts`, `risk:perf`, `status/triage`

### 4) PMO — **gates** & **labels**
- **Gates** : `evidence_pack_complete`  
- **Labels** : `Lot/R2.5`, `priority/P1`, `risk:scope`, `status/triage`

---

## Patch labels (copier‑coller — exemples)

### Tickets existants
```yaml
patch:
  TCK-000-AUDIT-REPO-R2_5:
    add_labels: [status/triage, Lot/R2.5, priority/P0, risk:contracts, risk:security, risk:perf, risk:rbac]
    gates: { gate_DoR: true, required: [contracts, observability, security, rbac, memory, perf] }
  TCK-REORG-R2_5:
    add_labels: [status/triage, Lot/R2.5, priority/P0, risk:repo, risk:build]
    gates: { gate_DoR: true, required: [] }
```

### Tickets ArkaBox (à créer)
```yaml
patch:
  TCK-BOX-FW-01:
    add_labels: [status/triage, Lot/R2.5, priority/P0, risk:hardware, risk:contracts]
    gates: { gate_DoR: true, required: [contracts] }
  TCK-BOX-AUDIO-02:
    add_labels: [status/triage, Lot/R2.5, priority/P0, risk:hardware]
    gates: { gate_DoR: true, required: [audio] }
  TCK-BOX-LEDS-03:
    add_labels: [status/triage, Lot/R2.5, priority/P1, risk:power]
    gates: { gate_DoR: true, required: [leds] }
  TCK-BOX-OTA-04:
    add_labels: [status/triage, Lot/R2.5, priority/P1, risk:security]
    gates: { gate_DoR: true, required: [ci_ota] }
  TCK-BOX-PINS-05:
    add_labels: [status/triage, Lot/R2.5, priority/P0, risk:hardware]
    gates: { gate_DoR: true, required: [] }
```

---

*(Ces manifests & patchs sont prêts à l’emploi ; adapte au besoin. Les parties **Console** et **ArkaBox** héritent de leurs gates spécifiques et de l’evidence pack R2.5.)*




# TCK-ARKA-B14 Gouvernance d’équipe modulaire — Kit de briques (R2.5)

API “Arka Workflow” v0 — Cadre & Spécifications

**But**  
Permettre aux clients d’intégrer Arka dans leur écosystème (dont n8n, Zapier, Temporal, etc.) **sans dépendance** imposée côté Arka : Arka émet des **événements** (webhooks sortants) et accepte des **commandes** (HTTP entrantes) avec sécurité, idempotence et versionnement clair.

---

## 1) Positionnement
- Arka = **équipe IA produit** (AGP/PMO/QA/UX/Codex) et **livrables** (cadrage, backlog, pseudo‑PR, UX/QA, KPIs).  
- n8n = **orchestrateur d’automations** du client.  
- Décision : **ne pas embarquer n8n dans Arka** ; fournir une **API standard** pour que le client branche son outil.

---

## 2) Portée (v0)
**IN**
- Webhooks **événements** (sortants) : backlog, UX, QA, Codex, previews, métriques IA.
- **Commandes HTTP** (entrantes) : appliquer backlog, lancer QA, attacher UX, proposer pseudo‑PR, exécuter un rôle IA (AGP/PMO).  
- Sécurité HMAC, idempotence, retries, **version de schéma**.

**OUT**
- Pack de “custom nodes” n8n (ultérieur).  
- Connecteurs propriétaires.

---

## 3) Contrats d’API (communs)
**Headers sortants (webhooks)**
- `X-Arka-Event` (ex: `backlog.item.created`)  
- `X-Arka-Delivery` (UUID v4)  
- `X-Arka-Timestamp` (ms ISO)  
- `X-Arka-Signature` (`sha256=<hmac>` sur `timestamp + '\n' + body`, clé partagée `ARKA_WEBHOOK_SECRET`)

**Headers entrants (commandes)**
- `X-Idempotency-Key` (UUID v4) — obligatoire pour les opérations **créatrices**.  
- Auth: Bearer token projet (scopes: `backlog`, `qa`, `ux`, `codex`, `ai:run`).

**Réponses standard**
- Succès : `200/202` + JSON (voir endpoints).  
- Erreurs: `4xx/5xx` au format `application/problem+json` (champ `detail`, `type`, `instance`).

**Idempotence**
- Stockage des clés par `project_id + X-Idempotency-Key` (TTL 24h).  
- Rejeu → `200` avec `idempotent: true` et ressource existante.

**Versionnement**
- Champ `schema_version` dans tous les payloads.  
- Breaking change → bump mineur/majeur (`1.0` → `1.1`/`2.0`).

**Retry & délais**
- Webhooks : retries exponentiels sur 24h si `5xx/timeout`; pas de retry sur `4xx`.  
- Anti‑replay : refuser signatures avec `timestamp` décalé de > **5 minutes**.

**Rate limit**
- `429` + en‑têtes `X-RateLimit-Remaining/Reset`.

---

## 4) Événements (v0)
| Événement | Quand | Utilité côté client |
|---|---|---|
| `project.created` | Création projet | Initialiser outils (n8n, Notion, Jira…). |
| `epic.created` | Epic validée par AGP/PMO | Créer Epic externe. |
| `userstory.created` | US prêtes | Créer US (Jira/Linear/Trello). |
| `userstory.updated` | Changement (prio/points/état) | Synchroniser backlog. |
| `ux.delivery.ready` | Livraison UX | Joindre assets, notifier. |
| `qa.run.started/passed/failed` | Lancement/résultat QA | Suivre la qualité. |
| `codex.pr.proposed/merged` | Pseudo‑PR proposée/merge | Piloter dev/outillage. |
| `preview.ready` | Preview Vercel prête | Lier à l’US/PR. |
| `ai.run.token_usage` | Fin d’un tour IA | Mesures TTFT/tokens/cost par rôle. |

**Exemple payload (sortant)**
```json
{
  "schema_version": "1.0",
  "event": "backlog.item.created",
  "project_id": "PRJ-123",
  "item": {
    "id": "US-101",
    "type": "user_story",
    "title": "En tant que…",
    "acceptance": ["Given … When … Then …"],
    "priority": "P2",
    "links": {"preview": "https://preview.example"}
  }
}
```

---

## 5) Commandes (entrantes) — endpoints & schémas
**Base**: `/api/workflow/*` (auth Bearer + `X-Idempotency-Key` si création)

1) `POST /workflow/backlog/apply`
- **But**: créer/mettre à jour Epics/US.  
- **Body** (extrait):
```json
{
  "schema_version": "1.0",
  "project_id": "PRJ-123",
  "epics": [{"key":"E-12","title":"Paiement"}],
  "stories": [{"epic":"E-12","title":"Carte","points":3}]
}
```
- **Réponse**: `{ "status": "ok", "created": n, "updated": m }`

2) `POST /workflow/qa/run`
- **But**: déclencher un jeu de tests QA (scénarios nommés).  
- **Body**: `{ "project_id": "PRJ-123", "suite": "rbac_smokes" }`  
- **Réponse**: `{ "status": "accepted", "run_id": "QA-20250902-001" }`

3) `POST /workflow/ux/attach`
- **But**: attacher des livrables UX (liens Blob/Notion/Figma).  
- **Body**: `{ "project_id":"PRJ-123", "artifact": {"type":"figma","url":"…"} }`

4) `POST /workflow/codex/propose`
- **But**: demander une pseudo‑PR (diff textuel, plan de change).  
- **Body**: `{ "project_id":"PRJ-123", "spec":"…" }`

5) `POST /ai/run`
- **But**: exécuter **AGP** ou **PMO** et obtenir un **output typé**.  
- **Body (extrait)**:
```json
{
  "schema_version": "1.0",
  "project_id": "PRJ-123",
  "role": "AGP",
  "task": "mini_cadrage",
  "inputs": {"objectif":"…","contraintes":["…"]},
  "output_schema": "mini_cadrage@1"
}
```
- **Réponse**:
```json
{ "status":"ok", "ttft_ms": 780, "output": {"but":"…","portee":"…","tests_plan":["…"]} }
```

---

## 6) Sécurité
- **Webhooks sortants** : signature **HMAC‑SHA256** (secret par environnement), horodatage strict (±5 min), replays rejetés.  
- **Entrants** : Auth **Bearer** (scopes), **idempotence** obligatoire si création, **quotas** par projet.  
- **Logs** : NDJSON (timestamp, event/command, status, ttft, tokens/cost si IA).  
- **RBAC** : clés/jetons par projet et par scope.

---

## 7) Observabilité & KPIs
- **Émissions** : taux de delivery (2xx), latences p50/p95, retries.  
- **Commandes** : taux de succès/erreur, p95, effets idempotents.  
- **IA** : `ttft_ms`, `tokens_total`, `provider/model`, `cost_est` par **rôle**.

---

## 8) Recettes n8n (exemples clients)
1) **Recevoir Arka** : Node **Webhook** (POST) → Function (vérif HMAC) → Router (par `X-Arka-Event`) → Notion/Jira/Slack.  
2) **Appeler Arka** : Node **HTTP Request** (POST) vers `/ai/run` (AGP/PMO) avec `X-Idempotency-Key`, gestion `429/5xx` par retry.

> Objectif : publier 3 workflows n8n “starter” (intake bêta, backlog sync, PR loop), **sans lock‑in**.

---

## 9) Tests (Given/When/Then)
- **Webhook** : *Given* endpoint client + secret, *When* Arka envoie `backlog.item.created`, *Then* client vérifie HMAC et répond `200` → Arka marque **DELIVERED** et stoppe les retries.
- **Idempotence** : *Given* `backlog.apply` avec `X-Idempotency-Key`, *When* re‑envoi, *Then* réponse `200` `idempotent:true`, sans doublon.
- **Anti‑replay** : *Given* horodatage > 5 min, *When* webhook reçu, *Then* 401 (signature expirée).
- **AI run** : *Given* `/ai/run` (AGP/PMO), *When* `output_schema` demandé, *Then* réponse **valide** vs schéma.

---

## 10) Variables d’environnement (exemple)
- `ARKA_WEBHOOK_SECRET` (sortants)  
- `ARKA_API_BEARER_TOKENS` (entrants : map projet→scopes)  
- `ARKA_IDEMP_TTL_HOURS=24`  
- `ARKA_RATE_LIMIT_QPS` / `ARKA_RATE_LIMIT_BURST`  
- `ARKA_WEBHOOK_RETRY_MAX_HOURS=24`

---

## 11) Roadmap & Next Steps
- **Semaine 0** : impl `POST /ai/run` (AGP + PMO), 6 événements, signature HMAC, idempotence, logs NDJSON.  
- **Semaine 1** : docs + exemples n8n (2 recettes), quotas/rate‑limit.  
- **Semaine 2** : `backlog.apply`, `qa.run`, `ux.attach`, `codex.propose` + schemas.  
- **Optionnel** : pack de nodes n8n (TS) une fois l’API stabilisée.

---

## 12) Checklists
**Côté Arka**
- [ ] Secret HMAC par environnement  
- [ ] Store idempotence (Postgres/KV)  
- [ ] Logs NDJSON + exports Blob  
- [ ] Tests unitaires HMAC/idempotence  
- [ ] Limites & quotas configurables

**Côté client**
- [ ] URL Webhook par projet  
- [ ] Secret partagé  
- [ ] Vérification HMAC (exemple fourni)  
- [ ] Gestion retries (2xx pour ack)  
- [ ] Mapping events → outils (Jira/Notion/Slack)

---

**Décision**  
On standardise l’API “Arka Workflow” (v0) et on publie 2 recettes n8n **optionnelles**. Pas de dépendance n8n côté Arka.

