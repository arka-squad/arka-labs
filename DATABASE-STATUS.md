# État de la Base de Données - Projet Arka

## 🔍 Audit Complet - 12/09/2025

### 📊 Configuration par Environnement

| Environnement | Base de Données | Status | Configuration |
|--------------|-----------------|---------|---------------|
| **Production** | Neon PostgreSQL | ✅ Configuré | Variables Vercel OK |
| **Preview** | Neon PostgreSQL | ✅ Configuré | Variables Vercel OK |
| **Local** | Neon PostgreSQL | ✅ Configuré | .env.local modifié |

### 🗄️ Structure des Tables Neon

| Table | Type ID | Status Routes | Adaptation Nécessaire |
|-------|---------|---------------|----------------------|
| **clients** | UUID | ✅ Adapté | Complété |
| **projects** | INTEGER | ❌ Non adapté | Fonctionne avec INT |
| **squads** | UUID | ❌ Non adapté | À modifier pour UUID |
| **agents** | UUID | ❌ Non adapté | À modifier pour UUID |
| **users** | INTEGER | ⚠️ Structure différente | Role = "owner" pas "admin" |

### 🚨 Problèmes Identifiés

1. **Types ID Mixtes**
   - `projects` utilise INTEGER
   - `squads`, `agents`, `clients` utilisent UUID
   - Incohérence dans le modèle de données

2. **Structure Users Différente**
   - Neon : role = "owner"
   - Code : role = "admin|manager|operator|viewer"
   - Nécessite adaptation ou migration

3. **Routes Non Adaptées**
   - ✅ `/api/admin/clients/*` - ADAPTÉ pour UUID
   - ❌ `/api/admin/projects/*` - Fonctionne avec INTEGER
   - ❌ `/api/admin/squads/*` - Non adapté pour UUID
   - ❌ `/api/admin/agents/*` - Non adapté pour UUID

### 📝 Routes à Modifier

#### Routes Squads (UUID requis)
- `/api/admin/squads/route.ts`
- `/api/admin/squads/[id]/route.ts`
- `/api/admin/squads/[id]/instructions/route.ts`
- `/api/admin/squads/[id]/members/route.ts`
- `/api/admin/squads/[id]/members/[agentId]/route.ts`

#### Routes Agents (UUID requis)
- `/api/admin/agents/route.ts`
- `/api/admin/agents/[id]/route.ts`
- `/api/admin/agents/[id]/duplicate/route.ts`
- `/api/admin/agents/from-template/route.ts`
- `/api/admin/agents/templates/route.ts`

#### Routes Projects (INTEGER - fonctionne déjà)
- `/api/admin/projects/route.ts` - OK avec INTEGER
- `/api/admin/projects/[id]/route.ts` - OK avec INTEGER
- `/api/admin/projects/[id]/documents/route.ts` - OK avec INTEGER
- `/api/admin/projects/[id]/squads/route.ts` - OK avec INTEGER

### ⚠️ Risques Actuels

1. **Création d'entités avec mauvais type ID**
   - Squads/Agents créés avec ID numérique au lieu d'UUID
   - Erreurs 404 lors de la récupération

2. **Authentification fragile**
   - Structure users différente entre mock et Neon
   - Roles incompatibles

3. **Incohérence de données**
   - Mix UUID/INTEGER complique les relations
   - JOINs complexes entre tables

### ✅ Actions Recommandées

#### Immédiat (Critique)
1. [ ] Adapter routes squads pour UUID
2. [ ] Adapter routes agents pour UUID
3. [ ] Créer mapping roles owner→admin

#### Court terme
1. [ ] Unifier types ID (tout en UUID ou tout en INTEGER)
2. [ ] Migration structure users
3. [ ] Tests end-to-end tous environnements

#### Long terme
1. [ ] Migration complète vers UUID
2. [ ] Schéma de base unifié
3. [ ] Documentation API avec types

### 🔧 Configuration Actuelle

```env
# Production/Preview (Vercel)
DATABASE_URL=postgresql://neondb_owner:***@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Local (.env.local)
DATABASE_URL=postgresql://neondb_owner:***@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### 📌 Notes Importantes

- **Neon en production** : Base partagée entre tous les environnements
- **Pas de base locale** : Tous pointent vers Neon
- **UUID vs INTEGER** : Incohérence critique à résoudre
- **Fallback supprimé** : Plus de stockage mémoire

---

**Dernière mise à jour** : 12/09/2025 08:45
**Par** : Claude Code
**Status Global** : ⚠️ PARTIELLEMENT FONCTIONNEL