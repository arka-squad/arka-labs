# Plan global B13 → B20 (production‐oriented).

**Action**: on déroule par “valeur utilisateur”, avec un **signal de sortie** clair par brique.

**B13 — Chat Kernel v1 (cœur)**

* But: BYOK + multi-gate + SSE, TTFT/Trace dans le chat.
* Valeur: conversation orchestrée, prête pour les démos.
* Exit: stream token-par-token + TTL clé + trace visible.

**B14 — Agent Focus (dans le chat)**

* But: sélectionner l’agent du fil, commandes **/about /test-métier /recettes**, header simplifié.
* Valeur: tester “niveau discussion” de chaque agent sans quitter le chat.
* Exit: switch d’agent = message d’accueil, commandes actives, BYOK intégré.

**B15 — DocGraph + Contract-Test (RO)**

* But: voir les docs & contrats appelables depuis le chat (tests lecture-seule d’abord).
* Valeur: auditabilité et preuve de conformité à portée de main.
* Exit: depuis **/recettes**, exécuter un “contract-test (RO)” et afficher le résultat dans le fil.

**B16 — Roster Lite + Quick /assign**

* But: assignations rapides (bouton/commande) et retour d’état dans le fil.
* Valeur: coordination “opération chef d’orchestre” depuis le chat.
* Exit: **/assign @agent tâche** journalisé + confirmation inline.

**B17 — Roadmap v1 + Freeze Window**

* But: consulter/poser un gel de livraison (freeze) et notifier dans le fil.
* Valeur: gouvernance produit lisible, évite les dérives.
* Exit: **/freeze on|off** affiche bannière d’état + bloque actions à risque.

**B18 — Observability v2**

* But: SLO + traces côté chat/actions; corrélation trace\_id UI→API.
* Valeur: transparence et contrôle en prod.
* Exit: vue observabilité enrichie + lien “voir trace” depuis chaque message d’action.

**B19 — Evidence Export**

* But: export ZIP/PDF (captures, logs NDJSON, checksums) en un clic/commande.
* Valeur: partage investisseur/clients, confiance.
* Exit: **/export evidence** crée un paquet signé (sha256sums).

**B20 — Demo Packs verticaux**

* But: presets RH/Éducation/Compta (prompts, recettes, métriques).
* Valeur: “aha moment” par secteur, prêt à vendre.
* Exit: **/switch pack\:RH** recharge l’agent set + 3 recettes métiers.

# Cadence & dépendances

* Tronc commun déjà en place (RBAC, KPIs, Observabilité v1, Threads/Docs RO).
* **Chemin critique**: B13 → B14 → (B15|B16) → B17 → B18 → B19 → B20.

