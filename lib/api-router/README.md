# 🎯 ARKA API ROUTER - Système de Routing Centralisé

## 🚀 **Vue d'ensemble**

Le **ARKA API Router** est un système centralisé qui permet de :
- ✅ **Switch entre différentes stratégies** de routing (dynamic vs query params)
- ✅ **Tester sans casser** l'existant avec fallback automatique
- ✅ **Monitorer et contrôler** toutes les routes depuis un dashboard
- ✅ **Résoudre les problèmes Vercel** de routes dynamiques

---

## 📋 **Stratégies disponibles**

### 🔀 **QUERY Strategy** (Recommandée production)
```typescript
// Client détail via query parameter
GET /api/admin/clients?id=b35321bd-7ebd-4910-9dcc-f33e707d6417

// ✅ Avantages: Fonctionne toujours sur Vercel
// ❌ Inconvénients: URLs moins RESTful
```

### 🔀 **DYNAMIC Strategy** (Idéal mais problématique Vercel)
```typescript
// Client détail via path parameter  
GET /api/admin/clients/b35321bd-7ebd-4910-9dcc-f33e707d6417

// ✅ Avantages: RESTful, propre
// ❌ Inconvénients: Ne fonctionne pas sur Vercel
```

### 🔀 **HYBRID Strategy** (Auto-détection)
```typescript
// Accepte les deux formats et route automatiquement
GET /api/admin/clients?id=UUID     → Query logic
GET /api/admin/clients/UUID        → Dynamic logic

// ✅ Avantages: Maximum compatibilité  
// ❌ Inconvénients: Plus complexe
```

---

## 🛠️ **Installation et Setup**

### 1. **Importer le router**
```typescript
import { createRoute, apiRouter } from '@/lib/api-router';
import { getRouterConfig } from '@/lib/api-router/config';
```

### 2. **Définir une route**
```typescript
export const myRouteGET = createRoute({
  path: '/api/admin/clients',
  method: 'GET',
  description: 'Get clients with strategy switching',
  auth: ['admin', 'manager'],
  strategies: {
    query: async (req, params) => {
      // Logique query params
      const clientId = params.query.id;
      if (clientId) return getSingleClient(clientId);
      return getClientsList(params.query);
    },
    
    dynamic: async (req, params) => {
      // Logique dynamic routes  
      return getClientsList(params.query);
    },
    
    hybrid: async (req, params) => {
      // Auto-détection
      const id = params.path.id || params.query.id;
      if (id) return getSingleClient(id);
      return getClientsList(params.query);
    }
  }
});
```

### 3. **Utiliser dans route.ts**
```typescript
// app/api/admin/clients/route.ts
import { myRouteGET } from '@/lib/api-router/admin-routes';

export const dynamic = 'force-dynamic';
export const GET = myRouteGET;
```

---

## 🎛️ **Configuration et Contrôle**

### **Dashboard de monitoring**
```bash
# Voir statut global
GET /api/admin/router

# Réponse:
{
  "success": true,
  "config": {
    "global": { "strategy": "query", "debug": true },
    "overrides": [...]
  },
  "routes": [
    {
      "path": "/api/admin/clients",
      "method": "GET", 
      "strategies": ["query", "dynamic", "hybrid"],
      "currentStrategy": "query"
    }
  ]
}
```

### **Changer stratégie globale**
```bash
# Passer tout en mode query (urgence Vercel)
POST /api/admin/router
{
  "action": "setGlobalStrategy",
  "strategy": "query"
}

# Raccourci d'urgence
PATCH /api/admin/router?action=emergency-query
```

### **Override route spécifique**
```bash
# Forcer une route en dynamic pour test
POST /api/admin/router
{
  "action": "setRouteStrategy",
  "path": "/api/admin/clients",
  "method": "GET",
  "strategy": "dynamic"
}
```

---

## 🧪 **Workflow de Test**

### **1. Développement local**
```bash
# Mode hybrid pour tester les deux
ARKA_ROUTER_STRATEGY=hybrid npm run dev

# Debug activé
ARKA_ROUTER_DEBUG=true npm run dev
```

### **2. Test staging**
```bash
# Tester dynamic en staging
curl -X POST https://staging.arka.com/api/admin/router \
  -d '{"action":"setGlobalStrategy","strategy":"dynamic"}'
  
# Si ça marche, déployer en prod
curl -X POST https://prod.arka.com/api/admin/router \
  -d '{"action":"setGlobalStrategy","strategy":"dynamic"}'
```

### **3. Rollback d'urgence**
```bash
# Revenir en query si problème
curl -X PATCH https://prod.arka.com/api/admin/router?action=emergency-query
```

---

## 📊 **Monitoring et Debug**

### **Logs automatiques**
```typescript
// Debug activé
[API Router] GET /api/admin/clients - Strategy: query
[API Router] Getting single client: b35321bd-7ebd-4910-9dcc-f33e707d6417
[API Router] GET:/api/admin/clients completed in 145ms
```

### **Métriques disponibles**
```javascript
// Depuis le dashboard
{
  "strategies": {
    "query": 15,    // 15 routes avec query
    "dynamic": 3,   // 3 routes avec dynamic  
    "hybrid": 8     // 8 routes avec hybrid
  },
  "health": {
    "uptime": 3600,
    "memory": {...}
  }
}
```

---

## ⚡ **Exemples Concrets**

### **Migration progressive**
```typescript
// Étape 1: Créer route-v2.ts avec router
// app/api/admin/clients/route-v2.ts
export const GET = createRoute({...});

// Étape 2: Tester en parallèle
// GET /api/admin/clients/route-v2?id=123

// Étape 3: Basculer route.ts principal
// mv route.ts route-old.ts && mv route-v2.ts route.ts

// Étape 4: Rollback instantané si problème
// mv route.ts route-v2.ts && mv route-old.ts route.ts
```

### **Résolution problème Vercel**
```bash
# Problème détecté
curl https://arka.com/api/admin/clients/123 → 404

# Switch immédiat en query
curl -X PATCH https://arka.com/api/admin/router?action=emergency-query
→ "Emergency: All routes switched to query strategy"

# Test correction
curl https://arka.com/api/admin/clients?id=123 → 200 OK ✅
```

---

## 🔧 **Maintenance**

### **Ajouter nouvelles routes**
```typescript
// Dans admin-routes.ts
export const adminAgentsGET = createRoute({
  path: '/api/admin/agents',
  method: 'GET',
  strategies: {
    query: async (req, params) => { /* logic */ },
    dynamic: async (req, params) => { /* logic */ }
  }
});
```

### **Configuration par environnement**
```typescript
// config.ts
const ENVIRONMENT_CONFIGS = {
  development: { strategy: 'hybrid' },
  production: { strategy: 'query' },    // Sûr pour Vercel
  staging: { strategy: 'dynamic' }      // Test dynamic
};
```

---

## 🎯 **Avantages vs Inconvénients**

### ✅ **Avantages**
- **Résout le problème Vercel** immédiatement
- **Zero downtime** lors des switchs
- **Monitoring centralisé** de toute l'API
- **Testing sécurisé** sans casser la prod
- **Rollback instantané** en cas de problème

### ⚠️ **Inconvénients**
- **Complexité ajoutée** au système
- **Plus de code** à maintenir
- **Courbe d'apprentissage** pour l'équipe

---

## 🚀 **Migration Plan**

1. **Phase 1** : Router installé, routes clients migrées
2. **Phase 2** : Migration agents, projets, squads  
3. **Phase 3** : Monitoring avancé, métriques
4. **Phase 4** : Auto-scaling strategies par usage

---

*Système conçu pour résoudre définitivement les problèmes de routing Vercel tout en gardant la flexibilité* 🎯