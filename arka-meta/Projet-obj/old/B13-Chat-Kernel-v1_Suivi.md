# B13 — Chat Kernel v1 · Suivi d’avancement

Dernière MAJ: 2025-09-06
Dossier: local/arka-codex/agent/Docs/Projet-obj/

## État Global
- Portée B13: BYOK + Multi‑gate (UI) + Stream SSE + TTFT/Trace + Dock de contrôle.
- Statut: socle utilisable en démo (OK). Quelques briques restent pour clôture complète US/AC.

## Priorités immédiates (P1)
- Brancher le rôle côté serveur dans `/api/chat/stream`:
  - Lire le JWT depuis `Authorization: Bearer <jwt>`
  - Déduire `role ∈ {viewer,operator,owner}` (admin→owner, editor→operator)
  - Ignorer/écraser la query `?role=` si présente (source de vérité = JWT)
  - Log `chat_gateway.role` et garantir cohérence avec `RoleBadge`

## Livré (OK)
- BYOK Exchange API: `POST /api/keys` (exchange), `DELETE /api/keys`, `GET /api/keys/session`.
- Test provider: `POST /api/keys/test` (latence), liste providers: `GET /api/providers` (seed/dev).
- SessionVault mémoire: session éphémère (clé en RAM), hash + TTL.
- SSE `GET /api/chat/stream`: événements NDJSON `open|token|done|error`.
- Gestion erreurs SSE: envoi `t:error` (au lieu d’échec pipe). Logs NDJSON `chat_gateway`.
- UI Dock: TokenModal, ProviderSelect, HeaderControls (TTFT/Trace), toasts.
- Auto‑scroll Chat: envoi/stream/fin → toujours calé en bas.
- Persistance de la réponse agent: à la fin du stream, ajout au fil (client‑side state).
- Rôle passé côté client au stream (`?role=`) via JWT (admin→owner, editor→operator, sinon viewer).
- Menu utilisateur (avatar sidebar) avec Logout (nettoie localStorage + redirect `/login`).

## Restant à faire (ordre proposé)
1) Stream · Rôle côté serveur (reco)
- Lire JWT `Authorization: Bearer` dans `/api/chat/stream` et dériver `role` (ignore la query).
- AC: alignement texte modèle ↔ `RoleBadge` pour owner/operator/viewer.

2) Multi‑gate · Persistance mapping
- Persister mapping `agent→provider→model` par session (mémoire/serveur) et restaurer au reload.
- AC: changement agent/model se reflète au prochain stream et au rechargement page.

3) Intents · /gate /test /assign /link
- Parser commandes dans l’input, `POST /api/chat/intents` → 202, toasts de confirmation.
- AC: écho agent, idempotence, bus `chat:intent`.

4) Context Binder
- Ajouter `{ctx_type, ctx_id}` aux messages; chips Dock; focus UI sur `/link <id>`.
- AC: placeholder « Parler sur <CTX>… », surlignage sans navigation dure.

5) Persistance des messages serveur (option B13.1)
- Today: append client‑side uniquement. Option: endpoint `/api/chat/threads/:id/messages` (mock) pour sauver l’historique (dev/preview).
- AC: rechargement conserve le thread courant.

6) E2E & Gates CI
- Scénarios: BYOK→stream (happy), 401 (session expirée), 429 (rate‑limit), autoscroll, copy trace, rôle.
- CI: typecheck/lint/unit/API/E2E; gate PREFILL=1 interdit en prod.

7) Sécu/Perf/Offline
- Rate‑limit (env DEV acceptable), `/api/chat/health`, Dock RO si offline; heartbeats SSE; abort/cleanup.
- TTL: source unique (serveur) pour le badge « Connecté (mm:ss) ».

8) Observabilité & Evidence
- KPIs: `ttft_ms`, `tokens_total`, `stream_drop_rate`, `err_rate` (dev/preview).
- Export thread JSON + `chat_gateway.ndjson` + `sha256sums.txt`.

9) UX/Docs
- Fallback « demo stream » si aucune clé valide (facilite les démos offline).
- Mise à jour docs US/AC & README cockpit.

## Risques & Mitigations
- Auth dev (JWT manquant) → mini‑login DEV et PREFILL=1 (déjà en place); bloquer en prod.
- Fuite streams SSE → abort/timeout/heartbeats + cap concurrents.
- Variantes erreurs providers (401/429/5xx) → normalisation + toasts.

## Décisions récentes
- Rôle envoyé côté client (fait); recommandé: contrôle serveur ultérieur.
- Réponse agent persistée dans l’historique (client‑state) à la fin du stream.

## Liens utiles
- CR courant: local/arka-codex/20250906-B13/CR-B13-Chat-Kernel-v1.md
- US: local/arka-codex/agent/Docs/Projet-obj/B13-Chat-Kernel-v1_US.md
- Cadrage: local/arka-codex/agent/Docs/Projet-obj/B13-Chat-Kernel-v1_Cadrage-technique.md

## Check rapide (QA)
- [ ] TokenModal → Test OK & Exchange 201 → TTL visible.
- [ ] Stream (OpenAI clé valide) → tokens, TTFT affiché, Trace copiée.
- [ ] Rôle (owner/operator/viewer) cohérent dans la réponse.
- [ ] Réponse agent apparaît et reste dans le fil.
- [ ] Logout (avatar) → clear tokens + redirect `/login`.
