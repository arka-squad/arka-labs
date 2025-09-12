

```markdown
# Configuration Claude Code - Projet Arka

- Parler Français dans les prompt, dans les raisonnement

## ⚠️ PRIORITÉ CRITIQUE : TypeScript & Déploiement

### Validation TypeScript OBLIGATOIRE avant tout commit :
- ✅ Vérifier TOUS les imports (NextResponse, NextRequest)
- ✅ Pas de Response directe → toujours NextResponse.json()
- ✅ postgres.js retourne arrays directement (pas {rows})
- ✅ error instanceof Error avant error.message
- ✅ Pas de sql.begin() → utiliser transactions postgres.js natives
- ✅ Types stricts : jamais de any implicite

### Patterns SQL Corrects :
```typescript
// ❌ INCORRECT
const { rows } = await sql`SELECT * FROM users`;

// ✅ CORRECT
const users = await sql`SELECT * FROM users`;
```

### Response Pattern :
```typescript
// ❌ INCORRECT
return new Response(JSON.stringify(data));

// ✅ CORRECT
import { NextResponse } from 'next/server';
return NextResponse.json(data);
```

## 📚 CONTEXTE PROJET (à lire AVANT tout développement)

### Architecture à respecter :
```
local/grim/
├── specs/          # Lire B21-B25 pour comprendre l'architecture
├── Agent/          # Vision produit & méthodologie
└── CR/             # Compte-rendus avec décisions prises
```

### Routes STRICTES :
- `/cockpit/*` → Interface utilisateur client
- `/cockpit/admin/*` → Interface admin/staff UNIQUEMENT
- `/api/backoffice/*` → APIs admin (RBAC requis)
- `/api/*` → APIs publiques/client

## 🔍 CHECKLIST avant push :

1. **TypeScript compile** : `npm run type-check` ✅
2. **Imports corrects** : NextResponse/NextRequest présents
3. **SQL sans {rows}** : Arrays directs de postgres.js
4. **Error handling** : instanceof Error partout
5. **Status codes** : Utiliser constantes de lib/errors.ts
6. **RBAC** : withAuth sur toutes routes admin
7. **Logs** : trace_id propagé partout

## 🚨 Erreurs Fréquentes Corrigées :

- 32 erreurs SQL {rows} → array direct
- 91 imports NextResponse manquants
- 85 duplicate imports nettoyés
- 16 Response → NextResponse
- 12 ErrorCodes ajoutés (ERR_INVALID_CONTENT_BLOCKS, etc.)

## 💡 Commande Rapide Debug :
```bash
# Vérifier TypeScript
npm run type-check

# Fix auto imports
node scripts/fix-nextresponse-imports.js

# Vérifier routes
grep -r "new Response" --include="*.ts" --include="*.tsx"
```

TOUJOURS tester localement avant push. Un build qui échoue = blocage déploiement.
```

### 🎯 **Instructions d'utilisation**

Copier ce prompt en début de session Claude Code avec :

```
@Claude Code - Utilise ce contexte pour TOUS les développements Arka. 
Lis d'abord les specs B21-B25 dans local/grim/specs/ avant toute modification.
```

