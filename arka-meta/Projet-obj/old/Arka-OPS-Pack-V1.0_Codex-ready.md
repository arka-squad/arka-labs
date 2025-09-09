# Arka — **B13 · Chat Kernel v1** — User Stories & Acceptance (MD)

> **North Star demo**: *TTW ≤ 30 s*, 3 “Aha!” en 5 min, chat cœur d’orchestration (multi‑agents), **BYOK** + **multi‑gate** providers (style n8n), intents (/gate,/test,/assign), contexte, RBAC, observabilité.

---

## 0) Personas & Contexte

* **Owner** (acheteur / démonstrateur) — veut une démo « wow » *fiable* et sans friction.
* **Editor** (chef de projet / AGP) — agit via le chat pour déclencher gates, tester contrats, assigner.
* **Viewer** (stakeholder) — assiste, lit les threads, rejoue le scénario (reset), pas d’actions risquées.

**Contraintes clés**

* **BYOK** (*Bring Your Own Key*): l’utilisateur amène sa clé (OpenAI/Anthropic/OpenRouter/… ou via Vercel AI SDK), **jamais** stockée durablement.
* **Multi‑Gate Provider**: mapping *Agent → Provider → Modèle* configurable (comme n8n), testable et révocable à chaud.
* **Stream SSE** stateless; **TTFT < 2 s** en démo; logs NDJSON.
* **RBAC**: viewer/editor/owner; viewer = lecture + intents simulées; owner = toutes commandes.
* **Offline‑safe**: lecture seule + watermark DEMO si /health≠ok.

---

## 1) Story Map (B13 → B20)

* **B13 · Chat Kernel v1 (cœur)** ✅ *ce document — détaillé*
* B14 · Gate Aggregator + Recettes *(branchable depuis Chat)*
* B15 · DocGraph + Contract‑Test RO *(actions « /test » du Chat)*
* B16 · Roster Lite + Quick Assign *(drag & /assign)*
* B17 · Roadmap v1 + Freeze Window *(toggle & alertes)*
* B18 · Observability v2 *(SLO + traces côté Chat & actions)*
* B19 · Evidence Export (ZIP/PDF) *(clé freemium)*
* B20 · Demo Packs verticaux *(switch instant)*

---

## 2) **Epic B13 — Chat Kernel v1** (cœur)

### 2.1 User Story — **BYOK: connexion par token**

**En tant que** user (viewer+), **je veux** connecter *mon* fournisseur d’IA via un token, **afin de** discuter avec les agents sans partager ma clé durablement.

**AC**

1. Bouton **« Connecter une IA »** ouvre un modal *TokenModal* avec: Provider (OpenAI/Anthropic/OpenRouter/Vercel AI), Token (password), Modèle (liste), **Tester**, **Enregistrer**.
2. `POST /api/keys/exchange` renvoie un **session\_token** opaque (TTL configurable, défaut 3600 s). Jamais de clé brute dans logs/UI.
3. Révocation: `DELETE /api/keys/session/:id` → la session devient invalide; prochain stream → 401.
4. UI affiche **TTL restant** (ex: « expire dans 59 min ») + **Masquage** du token (sk‑…\*\*\*\*…abcd).
5. Logs NDJSON (dev/preview) **sans PII**: provider, modèle, `hash(key)`, ttl, *pas* la clé.

**Scénarios (Gherkin)**

* *Given* TokenModal *When* je saisis un token *And* clique « Tester » *Then* j’obtiens `{ ok:true, latency_ms<1200 }`.
* *Given* session active *When* j’ouvre un stream *Then* les headers X‑Provider / X‑Model / X‑Provider‑Session sont requis *And* le flux s’ouvre.
* *Given* révocation *When* je relance un stream *Then* 401 + bandeau « reconnecter ».

---

### 2.2 User Story — **Multi‑Gate: routing Agent→Provider→Model**

**En tant que** owner/editor, **je veux** choisir **par agent** (AGP/PMO/QA‑ARC) le provider et le modèle, **afin de** composer une équipe hybride.

**AC**

1. Composant **ProviderSelect** dans le Dock: chips `AGP • OpenAI gpt‑4.1‑mini`, `PMO • Anthropic claude‑3.5`, etc.; menu pour changer provider/modèle *à chaud*.
2. `GET /api/providers` liste les providers & modèles (live ou seed si offline), cache 5 min.
3. **Test provider**: `POST /api/providers/test { provider, model, session_token }` → `{ ok, latency_ms }`.
4. **Persistance légère**: mapping en mémoire / session (preview), aucun write prod par défaut.

**Scénarios**

* *Given* mapping `AGP→Anthropic` *When* j’envoie un message *Then* les logs indiquent `provider=anthropic, model=claude‑3.5` *And* le stream répond.

---

### 2.3 User Story — **SSE Stream & TTFT**

**En tant que** user, **je veux** une réponse *en streaming* token‑par‑token avec un **TTFT visible**, **afin de** ressentir la réactivité.

**AC**

1. `GET /api/chat/stream?thread_id&agent=AGP&ctx=…` (SSE). Événements NDJSON: `open`, `token`, `done`, `error`.
2. **TTFT < 2 s (démo)**; chunks ≤ 1 000 chars; keep‑alive 20 s; abort client supporté.
3. Dock affiche `TTFT 0.68 s` + bouton « Copier trace ».
4. Logs `chat_gateway.ndjson`: `{ts,user,agent,provider,model,ttft_ms,tokens,trace_id}`.

**Scénarios**

* *Given* stream *When* premier token *Then* TTFT mesuré *And* affiché *And* journalisé.

---

### 2.4 User Story — **Intents (/gate, /test, /assign, /link)**

**En tant que** editor/owner, **je veux** déclencher des **intentions** depuis le chat, **afin de** agir sur Builder/Docs/Roadmap sans quitter la conversation.

**AC**

1. Parser commandes: `/gate <perf|security|contracts>`, `/test <docId>`, `/assign @<agent> <docId>`, `/link <id>`.
2. `POST /api/chat/intents` → `202 Accepted`; côté client **bus** émet `chat:intent` avec payload.
3. **Idempotence**: répéter la même commande n’ajoute pas d’effet doublon.
4. Toast de confirmation + écho agent dans le chat.

**Scénarios**

* *Given* `/gate perf` *When* envoyé *Then* le badge **Perf Budget** passe à PASS *And* Panel Evidence reçoit une ligne.
* *Given* `/test D‑203` *When* envoyé *Then* Doc D‑203.gates=PASS *And* chip « Contrat ok ».
* *Given* `/assign @Nora D‑203` *Then* chip « R • Nora ».

---

### 2.5 User Story — **Context Binder**

**En tant que** user, **je veux** que chaque message soit lié à un **contexte** (doc/epic/run), **afin de** reprendre un thread au bon endroit.

**AC**

1. Les messages portent `{ctx_type, ctx_id}`.
2. Chips contextuelles dans le Dock: `Doc D‑203`, `Epic EP‑12`.
3. `/link <id>` met le focus sur l’objet (surlignage UI) sans navigation dure.

**Scénarios**

* *Given* une DocCard *When* j’ouvre le Dock *Then* l’input affiche « Parler sur **D‑203**… ».

---

### 2.6 User Story — **RBAC, Sécurité, Offline**

**En tant que** org, **je veux** un noyau sécurisé, **afin de** démo‑er sans fuite de secrets ni actions non autorisées.

**AC**

1. **JWT** requis; viewer = lecture + intents simulées; owner = toutes commandes.
2. **Rate‑limit**: 60 req/min/IP, 10 streams concurrents/user; 429 si dépassement.
3. **Offline**: si `/health` ≠ ok → Dock lecture‑seule + watermark DEMO.
4. **CSP** stricte; pas de clé brute dans logs/console.

**Scénarios**

* *Given* viewer *When* `POST /threads` en prod *Then* 403.
* *Given* host down *When* naviguer *Then* bannière offline + chat RO.

---

### 2.7 User Story — **Dock UI persistant (A11y)**

**En tant que** user, **je veux** un Dock accessible sur *toutes* les pages, **afin de** piloter sans friction.

**AC**

1. Dock repliable, toujours présent; switch d’agent en 1 clic.
2. **A11y**: focus visible, `aria-live=polite`, navigation clavier.
3. **HUD Démo** (si DEMO\_MODE): `TTFT · trace_id · DEMO` + bouton **Reset/Replay**.

**Scénarios**

* *Given* /roadmap *When* j’ouvre Dock *Then* le contexte affiche l’epic sélectionné.

---

### 2.8 User Story — **Observabilité & Evidence**

**En tant que** démonstrateur, **je veux** mesurer et prouver, **afin de** crédibiliser la démo.

**AC**

1. NDJSON `logs/chat_gateway.ndjson` (dev/preview) non‑PII.
2. KPIs: `ttft_ms`, `tokens_total`, `stream_drop_rate`, `err_rate`, **Aha rate** (intent → effet < 1 s).
3. Export JSON d’un thread + **sha256** (texte‑only).

**Scénarios**

* *Given* 3 runs de chat *When* exporter *Then* j’obtiens {thread.json, chat\_gateway.ndjson, sha256sums.txt}.

---

## 3) Spécifications techniques (contract‑first)

### 3.1 Endpoints & Événements

```http
GET  /api/chat/stream?thread_id&agent&ctx&role    ; SSE: open|token|done|error
POST /api/chat/threads                             ; {id, created_at, title?, ctx?}
GET  /api/chat/threads?limit=20                    ; pagination 20
POST /api/chat/threads/:id/messages                ; {role, text, ctx?}
POST /api/chat/intents                             ; {t, payload, trace_id} -> 202
GET  /api/chat/health                              ; { sse, mem, rate_limit }

POST /api/keys/exchange                            ; { provider, key } -> { session_token, ttl_sec }
DELETE /api/keys/session/:id                       ; revoke
GET  /api/providers                                ; { providers:[{id,name,models[]}] }
POST /api/providers/test                           ; { provider, model, session_token|key } -> { ok, latency_ms }
```

**SSE NDJSON**

```json
{"t":"open","trace_id":"tr_x"}
{"t":"token","v":"…","at":124}
{"t":"done","ttft_ms":680,"tokens":245}
{"t":"error","code":"provider.unavailable","msg":"…"}
```

### 3.2 Bus d’intentions (client)

Événements émis: `chat:intent`, `chat:ctx`, `chat:reply`, `chat:toast`.
Payloads:

```ts
{ t:"gate", gate:"perf"|"security"|"contracts" }
{ t:"test", docId:string }
{ t:"assign", agentId:string, docId:string }
{ t:"link", target:"doc"|"epic"|"run", id:string }
```

### 3.3 Flags & Sécurité

* `AI_ENABLED`, `MEM_WRITE_ENABLED`, `CHAT_RATE_LIMIT`, `DEMO_MODE`, `BYOK_EXCHANGE_TTL_SEC`.
* **Aucune clé brute** loggée; masking UI `sk-…****…abcd`; hash côté serveur.

---

## 4) Non‑fonctionnels (NFR) & Budgets

* **Perf**: TTFT < 2 s (démo), rendu Dock < 50 ms, intents → effet visuel < 1 s.
* **A11y**: WCAG AA (focus, contrastes, aria‑live), clavier complet.
* **Sécu**: JWT, rate‑limit, CSP; pas de secrets persistés par défaut; révocation immédiate.
* **Fiabilité**: streams stables (keep‑alive 20 s), abort client, retries backoff.
* **Observabilité**: logs NDJSON horodatés; métriques clés exposées.

---

## 5) DoR / DoD

**DoR**: contrats figés, messages d’erreurs, textes UI, icônes, seeds DEMO (runs,kpis,docs,roster).

**DoD**:

* AC & scénarios verts, smokes streams OK, *lint/CI* verts.
* Evidence pack démo: captures Dock, NDJSON, thread.json, `sha256sums.txt`.
* Guide d’exploitation: `docs/chat/README.md` + `docs/chat/BYOK.md`.

---

## 6) Risques & Parades

* **Désync bus↔UI** → *single source* `demoStore` + reducers purs + idempotence intents.
* **Débordement tokens** → chunk 200–400 « token‑eq », limite taille sortie.
* **Abus API** → rate‑limit, quotas session, `429` + backoff.
* **Confusion UX (providers)** → presets « Recommandés » + *Test* avant Save.

---

## 7) Backlog B13 (Stories → Issues)

* **B13‑01** BYOK Exchange API + SessionVault (TTL, revoke, masking)
* **B13‑02** Providers Catalog + Test endpoint
* **B13‑03** Router Provider→Client (OpenAI/Anthropic/OpenRouter, Vercel AI compat.)
* **B13‑04** SSE Stream + TTFT métrique + logs NDJSON
* **B13‑05** Dock v1 (TokenModal, ProviderSelect, TTFT, trace)
* **B13‑06** Intent Engine (parse, dispatch, idempotence)
* **B13‑07** Context Binder (ctx chips, /link)
* **B13‑08** RBAC + Rate‑limit + Offline safe
* **B13‑09** Evidence pack + Docs (README, BYOK)

---

## 8) Textes UI (FR) — prêtes à coller

* **Bouton**: « Connecter une IA » · **Tester** · **Enregistrer** · **Révoquer** · **Réessayer** · **Reset démo**
* **Feedback**: « Clé stockée en session (59 min) — révocable à tout moment. »
* **Erreur**: « Session expirée — reconnectez votre fournisseur. »
* **Dock placeholder**: « Parler avec **AGP**… »
* **Chips**: `AGP • OpenAI gpt‑4.1‑mini` · `PMO • Anthropic claude‑3.5` · `QA‑ARC • OpenRouter llama‑3.1‑70b`

---

## 9) Exemples **JSON** (Schemas figés)

```json
// /api/providers
{ "providers": [
  {"id":"openai","name":"OpenAI","models":[{"id":"gpt-4.1-mini","label":"GPT‑4.1 mini"}]},
  {"id":"anthropic","name":"Anthropic","models":[{"id":"claude-3.5-sonnet","label":"Claude 3.5 Sonnet"}]},
  {"id":"openrouter","name":"OpenRouter","models":[{"id":"meta-llama-3.1-70b-instruct","label":"Llama 3.1 70B"}]}
]}
```

```json
// SSE events (NDJSON)
{"t":"open","trace_id":"tr_demo_9fz2"}
{"t":"token","v":"Bonjour","at":124}
{"t":"token","v":", je","at":186}
{"t":"done","ttft_ms":680,"tokens":245}
```

---

## 10) Parking Lot (à trancher plus tard)

* WebTransport vs SSE (périmètre v2).
* Persistance threads en prod (B10→B13 Pro/Team tiers).
* Webhooks d’intents signés (Slack/Jira) — B19+.

---

**Fin — B13 Chat Kernel v1 (cœur)**

# Arka · **B13 — Chat Kernel v1** · Issues prêtes à coller (GitHub)

> Portée B13: Chat cœur (BYOK + multi‑gate fournisseurs, SSE stream, intents, contexte, RBAC, observabilité). **Sans code ici**, uniquement cadrage « issue » actionnable.

Meta

* **Epic**: B13 — Chat Kernel v1
* **Branch cible**: `feat/b13-chat-kernel-v1`
* **Labels par défaut**: `epic:B13`, `area:chat`, `type:feature`, `release:R3`, `taskforce:Arka`
* **Budgets**: TTFT < 2s (démo), A11y AA, 0 secret persisté.

---

## B13-01 — BYOK Exchange API + SessionVault (TTL, revoke, masking)

**But**: accueillir un token *utilisateur* (OpenAI/Anthropic/OpenRouter/« Vercel AI ») et le convertir en **session\_token opaque** stocké **en mémoire serveur** (TTL), jamais en clair ni durable.

**Scope**

* Route `POST /api/keys/exchange { provider, key } -> { session_token, ttl_sec }`
* Route `DELETE /api/keys/session/:id` (révocation immédiate)
* **SessionVault** in‑memory (LRU + TTL) + masking UI `sk-…****…abcd`
* Logs NDJSON (dev/preview) **sans clé brute** (hash seulement)

**AC**

* `POST /api/keys/exchange` → 201 + `{session_token, ttl_sec}`; 401 si JWT absent.
* Session expirée → stream renvoie 401 + bannière « reconnecter ».
* Aucun log/console avec clé brute; masking systématique côté UI.

**Evidence**

* `logs/keys.ndjson` (extraits), captures TokenModal, test de connexion OK/KO.

**OOS**: stockage durable, rotation KMS (Team+).

**Checklist**

* [ ] Schemas Zod/TS inputs/outputs
* [ ] Vault avec TTL (env `BYOK_EXCHANGE_TTL_SEC`)
* [ ] Tests curl + unit vault
* [ ] Docs `docs/chat/BYOK.md`

**Estimation**: 3 pts

---

## B13-02 — Providers Catalog + Test endpoint

**But**: exposer la liste des providers/modèles + tester une connexion.

**Scope**

* `GET /api/providers` → `{ providers:[{id,name,models[]}] }` (seed si offline)
* `POST /api/providers/test { provider, model, session_token|key } -> { ok, latency_ms }`
* Cache 5 min, fallback offline‐seed.

**AC**

* Liste visible dans TokenModal/ProviderSelect; Test OK affiche latence < 1200 ms (démo) ou message d’erreur.

**Evidence**: capture ProviderSelect + réponse JSON providers.

**Checklist**

* [ ] Seed providers (OpenAI, Anthropic, OpenRouter, VercelAI)
* [ ] Endpoint test avec timeouts
* [ ] Cache 5 min
* [ ] Docs `docs/chat/providers.md`

**Estimation**: 2 pts

---

## B13-03 — Router Provider→Client (proxy SSE)

**But**: router les streams vers le bon SDK/provider à partir des headers et du **session\_token**.

**Scope**

* Module `providers/router.ts` (resolveClient)
* Gestion modèles, timeouts, erreurs homogènes `error.code`
* Pas de clé en clair hors mémoire process.

**AC**

* Pour chaque agent (AGP/PMO/QA‑ARC), le stream part bien vers le provider/model mappé (écho dans logs).

**Evidence**: NDJSON `chat_gateway` montrant `{provider, model, ttft_ms}`.

**Checklist**

* [ ] Resolve client by provider
* [ ] Map erreurs → codes normalisés
* [ ] Tests faux provider → 400
* [ ] Notes de sécurité

**Estimation**: 3 pts

---

## B13-04 — SSE Stream + TTFT métrique + logs NDJSON

**But**: servir le flux token‑par‑token + mesurer TTFT.

**Scope**

* `GET /api/chat/stream?thread_id&agent&ctx&role`
* Events NDJSON: `open|token|done|error`
* Keep‑alive 20s, abort/timeout, **rate‑limit** (60 req/min/IP), 10 streams/user.

**AC**

* `curl -N` → open/token/done; **TTFT < 2s (démo)**; tokens comptés.
* Logs `chat_gateway.ndjson` complets (sans PII).

**Evidence**: extrait NDJSON, capture Dock (TTFT affiché).

**Checklist**

* [ ] Mesure TTFT côté serveur
* [ ] Keep‑alive + abort
* [ ] Rate‑limit configuré (`CHAT_RATE_LIMIT`)
* [ ] Test de charge léger

**Estimation**: 3 pts

---

## B13-05 — Dock v1 (TokenModal, ProviderSelect, TTFT, trace)

**But**: livrer l’UI cœur persistante.

**Scope**

* Composants: `ChatDock`, `TokenModal`, `ProviderSelect`
* Badges rôle/ctx, **TTFT**, `Copier trace`, **Reset/Replay** si DEMO\_MODE.

**AC**

* Dock présent sur toutes les pages, repliable; connexion BYOK **sans fuite**; mapping par agent fonctionnel.
* TTFT s’affiche à chaque stream; Reset remet l’état seed.

**Evidence**: vidéo courte (30–40s), captures TokenModal + ProviderSelect.

**Checklist**

* [ ] A11y (focus, aria‑live)
* [ ] i18n micro‑copy FR
* [ ] Tests clavier
* [ ] HUD démo

**Estimation**: 5 pts

---

## B13-06 — Intent Engine (parse, dispatch, idempotence)

**But**: interpréter `/gate|/test|/assign|/link` et émettre des événements idempotents.

**Scope**

* `useChatCommands.ts` (parse + validate)
* `bus.ts` (EventTarget singleton) → `chat:intent`
* Idempotence (clé d’intent), toasts de confirmation

**AC**

* 3 commandes + `/link` → effets visuels < 1 s; répéter une même commande ne duplique rien.

**Evidence**: gif « /gate perf → PASS » + log intent local (debug on).

**Checklist**

* [ ] Parser robuste (args manquants → help)
* [ ] Idempotence via key
* [ ] Tests unit parse/dispatch
* [ ] Doc mini‑help `/help`

**Estimation**: 3 pts

---

## B13-07 — Context Binder (ctx chips, /link)

**But**: lier chaque message à un contexte (doc/epic/run) et naviguer en **focus non destructif**.

**Scope**

* Chips contexte Dock (`Doc D‑203`, `Epic EP‑12`)
* `/link <id>` → focus/surlignage d’élément existant
* Store `demoStore` pour source unique

**AC**

* L’ouverture du Dock sur une carte affiche le bon ctx; `/link` sur un id inconnu → feedback clair.

**Evidence**: capture Dock avec ctx + highlight côté écran.

**Checklist**

* [ ] Binder uni‑directionnel (store → UI)
* [ ] Tests sur ids inexistants
* [ ] A11y (annonce de focus)

**Estimation**: 2 pts

---

## B13-08 — RBAC + Rate‑limit + Offline safe

**But**: sécuriser les routes et comportements dégradés.

**Scope**

* JWT (viewer/editor/owner) appliqué
* Offline → chat RO + watermark DEMO
* Rate‑limit (global + user), erreurs 401/403/429 homogènes

**AC**

* viewer: `/threads POST` interdit en prod; owner OK.
* Host down: bannière + aucune mutation.

**Evidence**: captures offline/online; tests 401/403/429.

**Checklist**

* [ ] Guards middleware
* [ ] Messages d’erreur i18n
* [ ] Smokes sécurité

**Estimation**: 2 pts

---

## B13-09 — Evidence pack + Docs (README, BYOK)

**But**: prouver, tracer, documenter.

**Scope**

* Export `thread.json`, `chat_gateway.ndjson`, `sha256sums.txt`
* Docs: `docs/chat/README.md`, `docs/chat/BYOK.md` (flux, RGPD note)

**AC**

* Script génère les artefacts (texte‑only) + hashes; CR inclut TTFT moyen et tokens moyens.

**Evidence**: artefacts sous `arka-meta/reports/codex/R3/chat/`.

**Checklist**

* [ ] Script node (collecte + hash)
* [ ] Section CR
* [ ] Lien depuis Dock « Exporter thread »

**Estimation**: 2 pts

---

## Dépendances & Ordonnancement

1. B13-01 → B13-02 → B13-03 (BYOK + router)
2. B13-04 (SSE)
3. B13-05 (Dock)
4. B13-06/07 (Intents + Contexte)
5. B13-08 (Sécurité/Offline)
6. B13-09 (Evidence/Docs)

---

## Definition of Done (Epic B13)

* Tous AC verts (issues B13‑01→B13‑09), smokes stream OK.
* **Evidence pack**: NDJSON + thread.json + sha256sums.
* Docs à jour (README, BYOK), A11y AA vérifiée.
* **Demo check**: TTW ≤ 30s, 3 Aha! ≤ 5 min avec le Chat.
