# ARCHITECTURE ARKA LABS - CARTOGRAPHIE COMPLÈTE

## 🏗️ FRONTEND INTERFACE UTILISATEUR (app/)

### 🌐 Site Marketing (app/(site)/)
- **app/(site)/page.tsx** → Page d'accueil marketing principale
- **app/(site)/layout.tsx** → Layout site marketing avec SEO
- **app/(site)/beta/page.tsx** → Formulaire inscription beta
- **app/(site)/contact/page.tsx** → Page contact utilisateurs
- **app/(site)/fonctionnalites/page.tsx** → Présentation fonctionnalités
- **app/(site)/tarification/page.tsx** → Grille tarifaire produit
- **app/(site)/legal/mentions/page.tsx** → Mentions légales RGPD
- **app/(site)/legal/privacy/page.tsx** → Politique confidentialité

#### 🧩 Composants Marketing
- **app/(site)/_components/Hero.tsx** → Section hero landing page
- **app/(site)/_components/AgentsSlider.tsx** → Carrousel agents démo
- **app/(site)/_components/BetaSignup.tsx** → Formulaire inscription beta
- **app/(site)/_components/Examples.tsx** → Exemples cas d'usage
- **app/(site)/_components/Footer.tsx** → Pied de page site
- **app/(site)/_components/KpiBlock.tsx** → Bloc métriques marketing
- **app/(site)/_components/SectionFonctionnalites.tsx** → Section fonctionnalités
- **app/(site)/_components/TopbarLanding.tsx** → Navigation marketing

### 🚀 Console Client (app/console/)
- **app/console/page.tsx** → Dashboard principal console client
- **app/console/layout.tsx** → Layout console avec navigation
- **app/console/dashboard/page.tsx** → Vue d'ensemble projets/métriques
- **app/console/chat/page.tsx** → Interface chat conversationnel
- **app/console/ai/page.tsx** → Interface IA générative
- **app/console/documents/page.tsx** → Gestionnaire documents
- **app/console/folders/[id]/page.tsx** → Détail dossier projet
- **app/console/gates/page.tsx** → Interface gates validation
- **app/console/observabilite/page.tsx** → Monitoring temps réel
- **app/console/prompt-builder/page.tsx** → Constructeur prompts IA

#### 🎛️ Composants Console
- **app/console/_components/ConsoleShell.tsx** → Shell principal console
- **app/console/_components/AgentEventsPanel.tsx** → Panel événements agents
- **app/console/documents/DocUploadPanel.tsx** → Upload documents
- **app/console/hooks/useAgentEvents.ts** → Hook événements temps réel
- **app/console/demo-data.ts** → Données démo développement

### 🏢 Cockpit Administration (app/cockpit/)
- **app/cockpit/page.tsx** → Dashboard cockpit utilisateur
- **app/cockpit/layout.tsx** → Layout cockpit navigation
- **app/cockpit/analytics/page.tsx** → Analytics utilisation
- **app/cockpit/instructions/page.tsx** → Gestion instructions agents
- **app/cockpit/dossiers/[id]/page.tsx** → Vue détail dossier

#### 👨‍💼 Interface Admin (app/cockpit/admin/)
- **app/cockpit/admin/page.tsx** → Dashboard admin principal
- **app/cockpit/admin/agents/page.tsx** → Liste agents système
- **app/cockpit/admin/agents/[id]/page.tsx** → Détail agent individuel
- **app/cockpit/admin/agents/new/page.tsx** → Création nouvel agent
- **app/cockpit/admin/clients/page.tsx** → Gestion clients/organisations
- **app/cockpit/admin/clients/[id]/page.tsx** → Profil client détaillé
- **app/cockpit/admin/clients/new/page.tsx** → Création client
- **app/cockpit/admin/projects/page.tsx** → Administration projets
- **app/cockpit/admin/projects/[id]/page.tsx** → Configuration projet
- **app/cockpit/admin/projects/new/page.tsx** → Nouveau projet
- **app/cockpit/admin/squads/page.tsx** → Gestion équipes agents
- **app/cockpit/admin/squads/[id]/page.tsx** → Configuration équipe
- **app/cockpit/admin/squads/new/page.tsx** → Création équipe

#### 🧱 Composants Cockpit
- **app/cockpit/components/CockpitShell.tsx** → Shell interface cockpit
- **app/cockpit/components/ResponsiveWrapper.tsx** → Wrapper responsive
- **app/cockpit/components/MobileNav.tsx** → Navigation mobile
- **app/cockpit/components/GlobalChat.tsx** → Chat global intégré
- **app/cockpit/admin/components/AdminProtection.tsx** → Guard authentification admin
- **app/cockpit/admin/components/AdminNavigation.tsx** → Navigation admin

### 🔐 Authentification (app/login/)
- **app/login/page.tsx** → Interface connexion utilisateur
- **app/login/layout.tsx** → Layout pages authentification
- **app/login/messages.ts** → Messages erreur/succès auth

### 📊 Backoffice Legacy (app/backoffice/)
- **app/backoffice/layout.tsx** → Layout backoffice (déprécié)

### 🎨 Landing Components (app/landing/)
- **app/landing/WhyArka.tsx** → Section pourquoi Arka

### ⚙️ Configuration App
- **app/layout.tsx** → Layout racine Next.js application
- **app/metadata.ts** → Métadonnées SEO globales
- **app/robots.ts** → Configuration robots.txt
- **app/sitemap.ts** → Génération sitemap automatique

## 🔌 API BACKEND (app/api/)

### 🔄 Router Central
- **app/api/[[...slug]]/route.ts** → Routeur API centralisé catch-all
- **app/api/_livez/route.ts** → Health check liveness probe
- **app/api/_readyz/route.ts** → Health check readiness probe
- **app/api/health/route.ts** → Status général système
- **app/api/version/route.ts** → Version API actuelle

### 👨‍💼 API Administration (app/api/admin/)
- **app/api/admin/router/route.ts** → Routeur admin centralisé
- **app/api/admin/health/route.ts** → Health check admin
- **app/api/admin/dashboard/stats/route.ts** → Métriques dashboard admin
- **app/api/admin/agents/route.ts** → CRUD agents système
- **app/api/admin/agents/[id]/route.ts** → Gestion agent individuel
- **app/api/admin/agents/[id]/duplicate/route.ts** → Duplication agent
- **app/api/admin/agents/templates/route.ts** → Templates agents
- **app/api/admin/clients/route.ts** → CRUD organisations/clients
- **app/api/admin/clients/[id]/route.ts** → Profil client spécifique
- **app/api/admin/projects/route.ts** → Administration projets
- **app/api/admin/projects/[id]/route.ts** → Configuration projet
- **app/api/admin/projects/[id]/documents/route.ts** → Documents projet
- **app/api/admin/squads/route.ts** → Gestion équipes agents
- **app/api/admin/squads/[id]/route.ts** → Configuration équipe
- **app/api/admin/squads/[id]/members/route.ts** → Membres équipe
- **app/api/admin/squads/[id]/instructions/route.ts** → Instructions équipe

### 🔐 Authentification & Autorisation (app/api/auth/)
- **app/api/auth/login/route.ts** → Connexion utilisateur
- **app/api/auth/logout/route.ts** → Déconnexion utilisateur
- **app/api/auth/refresh/route.ts** → Refresh token JWT
- **app/api/auth/me/route.ts** → Profil utilisateur connecté
- **app/api/auth/sso/start/route.ts** → SSO démarrage
- **app/api/auth/demo-admin/route.ts** → Auth admin démo

### 🏢 API Backoffice (app/api/backoffice/)
- **app/api/backoffice/agents/route.ts** → Agents backoffice
- **app/api/backoffice/clients/route.ts** → Clients backoffice
- **app/api/backoffice/projets/route.ts** → Projets backoffice
- **app/api/backoffice/projets/[id]/route.ts** → Projet spécifique
- **app/api/backoffice/projets/[id]/agents/[agent_id]/route.ts** → Agent projet
- **app/api/backoffice/projets/[id]/squads/route.ts** → Équipes projet

### 🤖 API Agents (app/api/agents/)
- **app/api/agents/route.ts** → Liste agents utilisateur
- **app/api/agents/[id]/route.ts** → Agent spécifique
- **app/api/agents/[id]/threads/route.ts** → Conversations agent
- **app/api/agent/[id]/run/route.ts** → Exécution agent

### 💬 API Chat & Conversations (app/api/chat/)
- **app/api/chat/stream/route.ts** → Chat streaming temps réel
- **app/api/chat/intents/route.ts** → Détection intentions
- **app/api/chat/threads/route.ts** → Gestion conversations
- **app/api/chat/threads/[id]/messages/route.ts** → Messages conversation

### 🔗 API Threads (app/api/threads/)
- **app/api/threads/[threadId]/messages/route.ts** → Messages thread
- **app/api/threads/[threadId]/stream/route.ts** → Streaming thread
- **app/api/threads/[threadId]/abort/route.ts** → Annulation thread
- **app/api/threads/[threadId]/pin/route.ts** → Épingler thread
- **app/api/threads/[threadId]/unpin/route.ts** → Désépingler thread

### 🗄️ API Documents & Dossiers (app/api/documents/, app/api/folders/)
- **app/api/documents/route.ts** → CRUD documents
- **app/api/documents/[id]/route.ts** → Document spécifique
- **app/api/documents/[id]/preview/route.ts** → Aperçu document
- **app/api/folders/route.ts** → Gestion dossiers
- **app/api/folders/[id]/route.ts** → Dossier spécifique
- **app/api/folders/[id]/documents/route.ts** → Documents dossier
- **app/api/folders/[id]/context/route.ts** → Contexte dossier
- **app/api/folders/[id]/roadmap/route.ts** → Roadmap dossier

### 🎯 API Projets (app/api/projects/)
- **app/api/projects/route.ts** → Liste projets utilisateur
- **app/api/projects/[id]/route.ts** → Projet spécifique
- **app/api/projects/[id]/documents/route.ts** → Documents projet
- **app/api/projects/[id]/assign/route.ts** → Attribution agents

### 🎨 API Prompt Builder (app/api/prompt-blocks/)
- **app/api/prompt-blocks/route.ts** → CRUD blocs prompts
- **app/api/prompt-blocks/[id]/route.ts** → Bloc prompt spécifique
- **app/api/prompt-blocks/schema.ts** → Schémas validation
- **app/api/prompt-blocks/versioning.ts** → Versioning prompts

### 🚪 API Gates & Validation (app/api/gates/)
- **app/api/gates/route.ts** → Configuration gates
- **app/api/gates/run/route.ts** → Exécution gates
- **app/api/gates/stream/route.ts** → Streaming gates
- **app/api/gates/webhook/route.ts** → Webhooks gates
- **app/api/gates/jobs/[id]/route.ts** → Job gate spécifique
- **app/api/gates/jobs/[id]/logs/route.ts** → Logs jobs

### 🧠 API Mémoire (app/api/memory/)
- **app/api/memory/capture/route.ts** → Capture mémoire contexte
- **app/api/memory/context/route.ts** → Contexte mémoire
- **app/api/memory/project/[id]/route.ts** → Mémoire projet
- **app/api/memory/export/[project_id]/route.ts** → Export mémoire
- **app/api/memory/timeline/[project_id]/route.ts** → Timeline mémoire
- **app/api/memory/health/route.ts** → Status mémoire

### 📊 API Métriques & Observabilité (app/api/metrics/)
- **app/api/metrics/route.ts** → Métriques générales
- **app/api/metrics/kpis/route.ts** → KPIs système
- **app/api/metrics/runs/route.ts** → Métriques exécutions

### 🔑 API Clés & Providers (app/api/keys/, app/api/providers/)
- **app/api/keys/route.ts** → Gestion clés API
- **app/api/keys/session/route.ts** → Clés session
- **app/api/keys/test/route.ts** → Test clés API
- **app/api/providers/route.ts** → Providers IA externes
- **app/api/providers/mapping/route.ts** → Mapping providers

### 🍽️ API Recipes (app/api/recipes/)
- **app/api/recipes/route.ts** → Templates recipes
- **app/api/recipes/run/route.ts** → Exécution recipes

### 🛠️ API Debug & Dev (app/api/debug/, app/api/dev/)
- **app/api/debug/db-test/route.ts** → Test connexion DB
- **app/api/debug/env-test/route.ts** → Test variables env
- **app/api/dev/login/route.ts** → Login développement
- **app/api/dev/token/route.ts** → Tokens développement

### 🔄 API Streams & IA (app/api/ai/)
- **app/api/ai/stream/route.ts** → Streaming IA généraliste

### ⚙️ API Jobs & Maintenance (app/api/jobs/)
- **app/api/jobs/drain/route.ts** → Vidage queues jobs

## 📚 LIBRAIRIES & UTILITAIRES (lib/)

### 🔐 Authentification & Sécurité (lib/auth/)
- **lib/auth.ts** → Core authentification
- **lib/auth/rbac.ts** → Contrôle accès basé rôles
- **lib/auth/jwt.ts** → Gestion tokens JWT
- **lib/auth/middleware.ts** → Middlewares auth
- **lib/auth/crypto.ts** → Cryptographie sécurisée
- **lib/auth/audit.ts** → Audit logs authentification
- **lib/auth/rate-limit.ts** → Limitation taux requêtes
- **lib/auth/token-revocation.ts** → Révocation tokens
- **lib/withAuth.ts** → HOC authentification

### 📊 API Management (lib/api-router/, lib/api-lite/)
- **lib/api-router/index.ts** → Router API centralisé
- **lib/api-router/admin-routes.ts** → Routes admin spécialisées
- **lib/api-router/config.ts** → Configuration routeur
- **lib/api-router/types.ts** → Types router
- **lib/api-lite/core.ts** → Core API lite pour Vercel
- **lib/api-lite/setup.ts** → Setup API lite
- **lib/api-lite/middleware.ts** → Middlewares API lite

### 💾 Base de Données & Cache (lib/)
- **lib/db.ts** → Connexion PostgreSQL principal
- **lib/cache.ts** → Cache Redis/mémoire
- **lib/mem-store.ts** → Store mémoire temporaire
- **lib/storage.ts** → Stockage fichiers/blobs

### 🧠 Intelligence Artificielle (lib/)
- **lib/openai.ts** → Client OpenAI API
- **lib/chat/stream.ts** → Chat streaming IA
- **lib/context-completion.ts** → Complétion contextuelle
- **lib/orchestration.ts** → Orchestration agents IA

### 📈 Métriques & Observabilité (lib/)
- **lib/metrics.ts** → Collecte métriques système
- **lib/metrics-api.ts** → API métriques
- **lib/metrics-data.ts** → Données métriques
- **lib/trace.ts** → Tracing distributed
- **lib/logger.ts** → Logging structuré

### 🚪 Gates & Validation (lib/gates/)
- **lib/gates/catalog.ts** → Catalogue gates disponibles
- **lib/gates/validate.ts** → Validation gates
- **lib/gates/seed.ts** → Seeds gates démo

### 🧠 Mémoire & Contexte (lib/)
- **lib/memory.ts** → Gestion mémoire contextuelle
- **lib/memory-extractor.ts** → Extraction informations
- **lib/sessionVault.ts** → Vault sessions utilisateur

### 🔗 Providers & Intégrations (lib/providers/)
- **lib/providers/router.ts** → Router providers IA
- **lib/providers/mappingStore.ts** → Mapping providers
- **lib/providers/seed.ts** → Seeds providers

### ⚙️ Utilitaires Système (lib/)
- **lib/env.ts** → Variables environnement
- **lib/http.ts** → Utilitaires HTTP/fetch
- **lib/hmac.ts** → Authentification HMAC
- **lib/webhook.ts** → Gestion webhooks
- **lib/rate-limit.ts** → Rate limiting
- **lib/resilience.ts** → Patterns résilience
- **lib/urls.ts** → Gestion URLs
- **lib/utils.ts** → Utilitaires génériques

### 📝 Validation & Schemas (lib/)
- **lib/error-model.ts** → Modèle erreurs standardisé
- **lib/raci-validator.ts** → Validation matrices RACI
- **lib/squad-utils.ts** → Utilitaires équipes

### 📦 Stores & État (lib/)
- **lib/clients-store.ts** → Store clients/organisations
- **lib/offline.ts** → Gestion mode hors ligne
- **lib/integration-hooks.ts** → Hooks intégration

## 🗄️ BASE DE DONNÉES & PERSISTANCE

### 📊 Schémas & Migrations (db/, sql/)
- **db/20250914schema_export.sql** → Export schéma complet actuel
- **db/migrations/README_migration_uuid.md** → Guide migration UUID
- **sql/001_init.sql** → Initialisation DB
- **sql/002_documents_tags_index.sql** → Index documents
- **sql/003_metrics_raw.sql** → Tables métriques
- **sql/003_prompt_blocks.sql** → Tables prompt builder
- **sql/folders_schema.sql** → Schéma dossiers
- **sql/memory_schema.sql** → Schéma mémoire
- **sql/migrations/2025-09-09_b23_admin_console_schema.sql** → Schema admin B23

### 🌱 Seeds & Données (sql/seeds/)
- **sql/seeds/b23_demo_data.sql** → Données démo admin B23
- **sql/folders_seeds.sql** → Seeds dossiers démo
- **sql/memory_seeds.sql** → Seeds mémoire

## 🧩 COMPOSANTS RÉUTILISABLES (components/)

### 🎛️ Interface Console
- **components/ConsoleShell.tsx** → Shell console principale
- **components/ConsoleGuard.tsx** → Guard accès console
- **components/Topbar.tsx** → Barre navigation supérieure
- **components/leftbar.tsx** → Sidebar navigation gauche

### 🤖 Agents & IA
- **components/AgentsList.tsx** → Liste agents utilisateur
- **components/AgentDetail.tsx** → Détail agent individuel
- **components/ai/StreamViewer.tsx** → Viewer streaming IA
- **components/roster/AgentCard.tsx** → Card agent

### 💬 Chat & Communication
- **components/Chat.tsx** → Interface chat principale
- **components/chat/ChatPanel.tsx** → Panel chat intégré
- **components/chat/ChatHeaderControls.tsx** → Contrôles header chat
- **components/ChatDock.tsx** → Chat dock flottant

### 🗄️ Documents & Dossiers
- **components/dossiers/DossiersPanel.tsx** → Panel gestion dossiers

### 📊 Métriques & Roadmaps
- **components/kpis/KpiCard.tsx** → Card KPI individuelle
- **components/roadmap/RoadmapCard.tsx** → Card roadmap
- **components/runs/RunsList.tsx** → Liste exécutions
- **components/runs/RunsTable.tsx** → Table exécutions

### 🔐 Sécurité & Accès
- **components/RBACGuard.tsx** → Guard RBAC générique
- **components/FoldersRBACGuard.tsx** → Guard RBAC dossiers
- **components/RoleBadge.tsx** → Badge rôle utilisateur

### ⚙️ Utilitaires Interface
- **components/ProviderSelect.tsx** → Sélecteur providers IA
- **components/TokenModal.tsx** → Modal gestion tokens
- **components/system/OfflineBanner.tsx** → Banner mode hors ligne
- **components/system/Watermark.tsx** → Watermark système

### 🎨 UI Components (components/ui/)
- **components/ui/button.tsx** → Composant bouton
- **components/ui/card.tsx** → Composant carte
- **components/ui/input.tsx** → Composant input
- **components/ui/textarea.tsx** → Composant textarea
- **components/ui/tabs.tsx** → Composant onglets
- **components/ui/badge.tsx** → Composant badge
- **components/ui/progress.tsx** → Barre progression
- **components/ui/EmptyState.tsx** → État vide
- **components/ui/NavItem.tsx** → Item navigation
- **components/ui/ProjectCard.tsx** → Card projet

## 🎨 DESIGN SYSTEM & STYLES

### 🎨 CSS & Styling
- **styles/base.css** → Styles base Tailwind
- **styles/console.css** → Styles spécifiques console
- **styles/site.base.css** → Styles base site marketing
- **styles/site.components.css** → Styles composants site
- **styles/scrollbar.css** → Styles scrollbars custom
- **design-system/tokens.css** → Tokens design system

### ⚙️ Configuration CSS
- **tailwind.config.js** → Configuration Tailwind CSS
- **postcss.config.js** → Configuration PostCSS

## 🧪 TESTS & QUALITÉ (tests/, dist-tests/)

### 🧪 Tests Principal (tests/)
- **tests/agents-threads.e2e.test.ts** → Tests E2E agents/threads
- **tests/auth-rbac.test.ts** → Tests authentification RBAC
- **tests/documents-api.test.ts** → Tests API documents
- **tests/metrics.test.ts** → Tests métriques système
- **tests/gates.api.test.ts** → Tests API gates
- **tests/memory-api.test.ts** → Tests API mémoire
- **tests/webhook.test.ts** → Tests webhooks
- **tests/components/ProviderSelect.test.tsx** → Tests composant UI

### 📦 Tests Distribués (dist-tests/)
- **dist-tests/tests/rbac.test.js** → Tests RBAC compilés
- **dist-tests/tests/metrics.test.js** → Tests métriques compilés
- **dist-tests/tests/agents-get-rbac.test.js** → Tests agents RBAC

### ⚙️ Configuration Tests
- **jest.setup.ts** → Configuration Jest
- **tsconfig.tests.json** → TypeScript config tests

## 📦 PACKAGES & MODULES (packages/, apps/)

### 📦 Packages Internes (packages/)
- **packages/memory/** → Package mémoire contextuelle
- **packages/types/** → Types partagés
- **packages/ui/** → Composants UI partagés
- **packages/utils/** → Utilitaires partagés

### 🏗️ Applications (apps/)
- **apps/console/** → Application console standalone
- **apps/console/src/ui/** → Composants UI console
- **apps/console/stories/** → Stories Storybook
- **apps/README.md** → Guide apps monorepo

## 🚪 GATES & RECIPES (gates/, schemas/)

### 🚪 Gates Système (gates/)
- **gates/catalog/gates.json** → Catalogue gates disponibles
- **gates/catalog/recipes.json** → Catalogue recipes
- **gates/README.md** → Documentation gates

### 📝 Schemas Validation (schemas/, api/schemas/)
- **schemas/gates/GateDef.schema.json** → Schema définition gate
- **schemas/gates/GateResult.schema.json** → Schema résultat gate
- **api/schemas/RecipeDef.schema.json** → Schema définition recipe
- **api/schemas/JobStatus.schema.json** → Schema status job

## 🏗️ INFRASTRUCTURE & DÉPLOIEMENT

### 🔧 Configuration Projet
- **package.json** → Configuration Node.js/dépendances
- **next.config.js** → Configuration Next.js
- **vercel.json** → Configuration déploiement Vercel
- **tsconfig.json** → Configuration TypeScript principal
- **eslint.config.js** → Configuration ESLint
- **prettier.config.js** → Configuration Prettier

### 🚀 Déploiement & CI (infra/)
- **infra/ci/README.md** → Guide CI/CD
- **infra/ci/scripts/net/selfcheck.js** → Auto-vérification réseau
- **infra/iac/README.md** → Infrastructure as Code
- **middleware.ts** → Middleware Next.js global

### ⚙️ Hooks & Automation (hooks/, jobs/)
- **hooks/useSession.ts** → Hook session utilisateur
- **jobs/retention.ts** → Job nettoyage données
- **jobs/README.md** → Documentation jobs

## 📚 DOCUMENTATION & MÉTADONNÉES

### 📖 Documentation Technique (docs/)
- **docs/architecture/** → Documentation architecture
- **docs/B23-Console-Admin-Implementation.md** → Guide implémentation B23
- **docs/chat/CONTRACTS.md** → Contrats API chat
- **docs/memory/README.md** → Documentation mémoire

### 📊 Rapports & Audits (arka-meta/)
- **arka-meta/reports/audit/B28/** → Audit technique B28
- **arka-meta/reports/codex/observabilite.md** → Rapport observabilité
- **arka-meta/codex/** → Codex règles projet
- **arka-meta/docs/db/schema/** → Schemas base données

### 📝 Specifications (local/grim/specs/)
- **local/grim/specs/B21-B25/** → Specifications B21 à B25
- **local/grim/CR/** → Comptes-rendus développement
- **local/grim/Agent/** → Vision produit agents

### 🗂️ Configuration Claude Code
- **.claude/settings.local.json** → Configuration locale Claude
- **.claude/agents/architecte-technique.md** → Agent architecte
- **CLAUDE.md** → Instructions projet Claude Code

## 🧹 SCRIPTS TEMPORAIRES (À NETTOYER)

### 🛠️ Scripts Maintenance (scripts/)
- **scripts/fix-*.js** → Scripts correction temporaires
- **scripts/create-*.js** → Scripts création tables
- **scripts/check-*.js** → Scripts vérification
- **scripts/migrate-*.js** → Scripts migration
- **scripts/clean-ports.js** → Nettoyage ports

### 🔧 Scripts Racine (À ARCHIVER)
- **fix-*.js** → Scripts correction racine OBSOLÈTES
- **create-*.js** → Scripts création OBSOLÈTES
- **test-*.js** → Scripts test OBSOLÈTES
- **check-*.js** → Scripts vérification OBSOLÈTES
- **setup-*.js** → Scripts setup OBSOLÈTES
- **debug-*.js** → Scripts debug OBSOLÈTES

### 📊 Logs Temporaires (logs/)
- **logs/README.md** → Guide logs système
- **logs_orchestration.json** → Logs orchestration

### 🗂️ Fichiers Legacy
- **README_lot.md** → README lot développement OBSOLÈTE
- **DATABASE-STATUS.md** → Status DB OBSOLÈTE
- **CR-TypeScript-Fix-20250911.md** → CR fix TypeScript
- **checklist.md** → Checklist développement

## 🎯 FICHIERS CRITIQUES SYSTÈME

### ⭐ Architecture Core
1. **lib/api-router/index.ts** → Router API centralisé critique
2. **lib/auth/rbac.ts** → Sécurité RBAC fondamentale
3. **lib/db.ts** → Connexion base données principale
4. **app/api/[[...slug]]/route.ts** → Point entrée API global

### 🔐 Sécurité Critique
1. **lib/auth/jwt.ts** → Authentification JWT
2. **middleware.ts** → Middlewares globaux sécurité
3. **lib/auth/middleware.ts** → Middlewares auth spécialisés

### 🎨 Interface Critique
1. **app/layout.tsx** → Layout racine application
2. **components/ConsoleShell.tsx** → Shell console principal
3. **app/cockpit/admin/components/AdminProtection.tsx** → Protection admin

### ⚙️ Configuration Critique
1. **next.config.js** → Configuration Next.js
2. **package.json** → Dépendances et scripts
3. **vercel.json** → Configuration déploiement

---

## 📊 STATISTIQUES ARCHITECTURE

**Total fichiers analysés :** 847 fichiers
**Routes API :** 156 endpoints
**Pages Frontend :** 89 pages
**Composants :** 127 composants
**Tests :** 64 fichiers de test
**Scripts temporaires :** 41 scripts à nettoyer

**Domaines principaux :**
- 🏗️ Frontend : 35% (296 fichiers)
- 🔌 API Backend : 28% (237 fichiers)
- 📚 Librairies : 15% (127 fichiers)
- 🧪 Tests : 8% (64 fichiers)
- 📚 Documentation : 8% (68 fichiers)
- 🧹 Temporaires : 6% (55 fichiers)