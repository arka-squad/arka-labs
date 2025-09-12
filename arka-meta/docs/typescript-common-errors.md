# Guide TypeScript - Erreurs Communes et Solutions Arka

## 📋 Vue d'Ensemble

Ce document catalogue les patterns d'erreurs TypeScript récurrents identifiés lors du déploiement du système B24 Auth/RBAC et propose des solutions standardisées pour l'équipe Arka.

**Contexte :** 100+ erreurs TypeScript corrigées en cycles multiples révèlent des patterns systémiques nécessitant documentation et prévention.

**Objectif :** Réduire de 80% les erreurs TypeScript récurrentes via patterns standardisés et quality gate strict.

---

## 🚨 Pattern 1 - LogFields Interface Violations

### 🔍 Description du Problème

**Fréquence :** 30% des erreurs TypeScript (30+ occurrences)
**Impact :** Monitoring incohérent, audit trails incomplets
**Root Cause :** Interface LogFields non respectée systématiquement

### ❌ Erreur Type

```typescript
// INCORRECT - Manque champs obligatoires
log('warn', 'Database connection failed', { error: 'Connection timeout' });

// INCORRECT - Type incompatible
log('error', message, { status: '500', route: '/api' }); // status doit être number

// INCORRECT - Champs manquants
log('info', 'User action', { user_id: 'uuid' }); // Manque route, status
```

### ✅ Solution Correcte

```typescript
// CORRECT - Interface LogFields respectée
interface LogFields {
  route: string;
  status: number;
  error?: string;
  user_id?: string;
  duration_ms?: number;
  [key: string]: unknown;
}

// Usage correct
log('warn', 'Database connection failed', {
  route: '/api/auth/login',
  status: 500,
  error: 'Connection timeout',
  duration_ms: 5000
});

log('info', 'User logged in', {
  route: '/api/auth/login',
  status: 200,
  user_id: 'uuid-user-123',
  duration_ms: 150
});
```

### 🛠️ Utility Type-Safe

```typescript
// Créer lib/logging/safe-logger.ts
type LogLevel = 'info' | 'warn' | 'error';

type RequiredLogContext = {
  route: string;
  status: number;
};

type OptionalLogContext = {
  error?: string;
  user_id?: string;
  duration_ms?: number;
  trace_id?: string;
  [key: string]: unknown;
};

type LogContext = RequiredLogContext & OptionalLogContext;

export function logSafe(
  level: LogLevel,
  message: string,
  context: LogContext
): void {
  // Validation runtime des champs obligatoires
  if (!context.route || typeof context.status !== 'number') {
    throw new Error('LogContext missing required fields: route, status');
  }
  
  log(level, message, context);
}

// Usage type-safe
logSafe('error', 'Auth failed', {
  route: '/api/auth/login',
  status: 401,
  error: 'Invalid credentials'
}); // ✅ Compile et runtime safe
```

### 🔧 ESLint Rule Custom

```javascript
// .eslintrc.js - Rule personnalisée
module.exports = {
  rules: {
    'arka/require-log-context': {
      create(context) {
        return {
          CallExpression(node) {
            if (node.callee.name === 'log' && node.arguments.length === 3) {
              const contextArg = node.arguments[2];
              // Vérifier présence route et status
              // Implementation détaillée dans eslint-plugin-arka
            }
          }
        };
      }
    }
  }
};
```

---

## 🚨 Pattern 2 - Unsafe Error Handling

### 🔍 Description du Problème

**Fréquence :** 25% des erreurs TypeScript (25+ occurrences)
**Impact :** Runtime errors, debugging complexe, logs incomplets
**Root Cause :** Configuration TypeScript permissive, `error as unknown` non géré

### ❌ Erreur Type

```typescript
// INCORRECT - error type unknown non géré
try {
  await risky_operation();
} catch (error) {
  log('error', error.message); // ❌ error.message n'existe pas sur unknown
  return { success: false, error: error.code }; // ❌ error.code undefined
}

// INCORRECT - Cast unsafe
try {
  await api_call();
} catch (error) {
  const err = error as Error; // ❌ Cast non-vérifié
  throw new Error(err.message);
}

// INCORRECT - Assumptions error type
try {
  JSON.parse(invalidJson);
} catch (error) {
  console.log(error.name); // ❌ Assumes Error type
}
```

### ✅ Solution Correcte

```typescript
// CORRECT - Type guard pour Error
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

function isErrorWithCode(error: unknown): error is Error & { code: string } {
  return error instanceof Error && 'code' in error && typeof error.code === 'string';
}

// Usage type-safe
try {
  await risky_operation();
} catch (error) {
  const message = isError(error) ? error.message : 'Unknown error occurred';
  const errorCode = isErrorWithCode(error) ? error.code : 'UNKNOWN_ERROR';
  
  logSafe('error', 'Operation failed', {
    route: '/api/operation',
    status: 500,
    error: message,
    error_code: errorCode
  });
  
  return { 
    success: false, 
    error: message,
    code: errorCode
  };
}
```

### 🛠️ Utility Error Handling

```typescript
// Créer lib/errors/safe-error-handler.ts
export type SafeError = {
  message: string;
  code: string;
  stack?: string;
  cause?: unknown;
};

export function extractSafeError(error: unknown): SafeError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.name || 'ERROR',
      stack: error.stack,
      cause: error.cause
    };
  }
  
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR'
    };
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: String(error.message),
      code: 'OBJECT_ERROR'
    };
  }
  
  return {
    message: 'Unknown error occurred',
    code: 'UNKNOWN_ERROR',
    cause: error
  };
}

// Usage standardisé
try {
  await dangerous_operation();
} catch (error) {
  const safeError = extractSafeError(error);
  
  logSafe('error', 'Operation failed', {
    route: '/api/dangerous',
    status: 500,
    error: safeError.message,
    error_code: safeError.code
  });
  
  return NextResponse.json({
    error: 'internal_error',
    message: safeError.message,
    code: safeError.code
  }, { status: 500 });
}
```

---

## 🚨 Pattern 3 - Role Type Inconsistencies

### 🔍 Description du Problème

**Fréquence :** 20% des erreurs TypeScript (20+ occurrences)
**Impact :** RBAC fragile, permissions incohérentes, runtime errors
**Root Cause :** Types Role non synchronisés backend/frontend, enum usage inconsistant

### ❌ Erreur Type

```typescript
// INCORRECT - String literal inconsistant
const userRole = 'operator'; // Pas d'enum
if (userRole === 'editor') { } // ❌ 'editor' n'existe pas

// INCORRECT - Type any implicit
function checkPermission(role) { // ❌ role type any
  return role === 'admin';
}

// INCORRECT - Enum partiel
type Role = 'admin' | 'manager'; // ❌ Manque operator, viewer
const roles: Role[] = ['admin', 'manager', 'operator']; // ❌ operator non assignable
```

### ✅ Solution Correcte

```typescript
// CORRECT - Enum centralisé strict
export enum RoleEnum {
  ADMIN = 'admin',
  MANAGER = 'manager', 
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

export type Role = keyof typeof RoleEnum | `${RoleEnum}`;
// Équivalent à: 'admin' | 'manager' | 'operator' | 'viewer'

// Validation runtime type-safe
export function isValidRole(role: string): role is Role {
  return Object.values(RoleEnum).includes(role as RoleEnum);
}

export function assertRole(role: string): Role {
  if (!isValidRole(role)) {
    throw new Error(`Invalid role: ${role}. Must be one of: ${Object.values(RoleEnum).join(', ')}`);
  }
  return role;
}

// Usage type-safe
function checkPermission(role: Role): boolean {
  switch (role) {
    case RoleEnum.ADMIN:
      return true;
    case RoleEnum.MANAGER:
      return true;
    case RoleEnum.OPERATOR:
      return false;
    case RoleEnum.VIEWER:
      return false;
    default:
      // TypeScript vérifie exhaustivité
      const _exhaustive: never = role;
      return false;
  }
}
```

### 🛠️ RBAC Type-Safe Integration

```typescript
// Créer lib/rbac/role-types.ts
export interface UserWithRole {
  id: string;
  email: string;
  role: Role;
  full_name?: string;
}

export interface RolePermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canAssign: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  [RoleEnum.ADMIN]: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canAssign: true
  },
  [RoleEnum.MANAGER]: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canAssign: true
  },
  [RoleEnum.OPERATOR]: {
    canCreate: false,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canAssign: false
  },
  [RoleEnum.VIEWER]: {
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canAssign: false
  }
};

export function getRolePermissions(role: Role): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(user: UserWithRole, action: keyof RolePermissions): boolean {
  const permissions = getRolePermissions(user.role);
  return permissions[action];
}
```

---

## 🚨 Pattern 4 - SQL Result Unsafe Access

### 🔍 Description du Problème

**Fréquence :** 15% des erreurs TypeScript (15+ occurrences)
**Impact :** Runtime errors, data corruption, security vulnerabilities
**Root Cause :** Data layer non-sécurisé, SQL results non typés

### ❌ Erreur Type

```typescript
// INCORRECT - Accès unsafe index
const users = await sql`SELECT * FROM users WHERE active = true`;
const firstUser = users[0]; // ❌ Peut être undefined
return firstUser.name; // ❌ Runtime error si pas d'users

// INCORRECT - Assumptions type
const result = await sql`SELECT COUNT(*) as count FROM projects`;
return result[0].count + 1; // ❌ count peut être string

// INCORRECT - No validation
async function getUser(id: string) {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`;
  return result[0]; // ❌ Peut retourner undefined
}
```

### ✅ Solution Correcte

```typescript
// CORRECT - Type-safe SQL result handling
interface User {
  id: string;
  email: string;
  role: Role;
  full_name?: string;
  created_at: Date;
}

interface CountResult {
  count: number;
}

// Helper validation SQL results
function validateSQLResult<T>(result: unknown[], expectedLength?: number): T[] {
  if (!Array.isArray(result)) {
    throw new Error('SQL result is not an array');
  }
  
  if (expectedLength !== undefined && result.length !== expectedLength) {
    throw new Error(`Expected ${expectedLength} results, got ${result.length}`);
  }
  
  return result as T[];
}

function assertSingleResult<T>(result: T[]): T {
  if (result.length === 0) {
    throw new Error('No results found');
  }
  if (result.length > 1) {
    throw new Error('Multiple results found, expected single result');
  }
  return result[0];
}

// Usage type-safe
async function getUsers(): Promise<User[]> {
  const result = await sql`SELECT id, email, role, full_name, created_at FROM users WHERE active = true`;
  return validateSQLResult<User>(result);
}

async function getUserById(id: string): Promise<User | null> {
  const result = await sql`SELECT id, email, role, full_name, created_at FROM users WHERE id = ${id}`;
  const validatedResult = validateSQLResult<User>(result);
  return validatedResult.length > 0 ? validatedResult[0] : null;
}

async function getUserByIdStrict(id: string): Promise<User> {
  const result = await sql`SELECT id, email, role, full_name, created_at FROM users WHERE id = ${id}`;
  const validatedResult = validateSQLResult<User>(result);
  return assertSingleResult(validatedResult);
}

async function countProjects(): Promise<number> {
  const result = await sql`SELECT COUNT(*) as count FROM projects`;
  const validatedResult = validateSQLResult<CountResult>(result, 1);
  const countResult = assertSingleResult(validatedResult);
  
  // Ensure count is number (PostgreSQL returns string)
  const count = parseInt(String(countResult.count), 10);
  if (isNaN(count)) {
    throw new Error('Invalid count result');
  }
  
  return count;
}
```

### 🛠️ SQL Safe Utilities

```typescript
// Créer lib/db/safe-sql.ts
export type SQLResult<T> = T[];

export class SQLResultError extends Error {
  constructor(message: string, public readonly query?: string) {
    super(message);
    this.name = 'SQLResultError';
  }
}

export class SafeSQL {
  static validateResult<T>(result: unknown[], context?: string): SQLResult<T> {
    if (!Array.isArray(result)) {
      throw new SQLResultError(`SQL result is not an array${context ? ` (${context})` : ''}`);
    }
    return result as T[];
  }
  
  static requireSingle<T>(result: SQLResult<T>, context?: string): T {
    if (result.length === 0) {
      throw new SQLResultError(`No results found${context ? ` (${context})` : ''}`);
    }
    if (result.length > 1) {
      throw new SQLResultError(`Multiple results found, expected single${context ? ` (${context})` : ''}`);
    }
    return result[0];
  }
  
  static optionalSingle<T>(result: SQLResult<T>): T | null {
    return result.length > 0 ? result[0] : null;
  }
  
  static requireExact<T>(result: SQLResult<T>, count: number, context?: string): T[] {
    if (result.length !== count) {
      throw new SQLResultError(`Expected exactly ${count} results, got ${result.length}${context ? ` (${context})` : ''}`);
    }
    return result;
  }
}

// Usage type-safe avec context
async function getUserProjects(userId: string): Promise<Project[]> {
  const result = await sql`
    SELECT p.* FROM projects p 
    JOIN user_project_assignments upa ON p.id = upa.project_id 
    WHERE upa.user_id = ${userId}
  `;
  
  return SafeSQL.validateResult<Project>(result, `getUserProjects(${userId})`);
}

async function getProjectOwner(projectId: number): Promise<User> {
  const result = await sql`
    SELECT u.* FROM users u 
    JOIN projects p ON u.email = p.created_by 
    WHERE p.id = ${projectId}
  `;
  
  const validatedResult = SafeSQL.validateResult<User>(result, `getProjectOwner(${projectId})`);
  return SafeSQL.requireSingle(validatedResult, `getProjectOwner(${projectId})`);
}
```

---

## 🚨 Pattern 5 - NextResponse/Response Mismatches

### 🔍 Description du Problème

**Fréquence :** 10% des erreurs TypeScript (10+ occurrences)  
**Impact :** Build errors, API inconsistencies, development friction
**Root Cause :** Import confusion Next.js API vs Web API Response

### ❌ Erreur Type

```typescript
// INCORRECT - Web API Response dans Next.js API route
import { Response } from 'node-fetch'; // ❌ Mauvais import

export async function POST(request: Request) {
  return Response.json({ success: true }); // ❌ Manque NextResponse
}

// INCORRECT - Mélange imports
import { NextResponse } from 'next/server';
import { Response } from '@types/node'; // ❌ Conflit types

export async function GET() {
  return Response.json(data); // ❌ Utilise mauvais Response
}

// INCORRECT - Headers incompatibles
export async function PUT(request: Request) {
  const response = new Response(JSON.stringify(data));
  response.headers.set('Authorization', token); // ❌ Peut ne pas fonctionner
  return response;
}
```

### ✅ Solution Correcte

```typescript
// CORRECT - Import NextResponse uniquement
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation, processing...
    
    return NextResponse.json(
      { success: true, data },
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'value'
        }
      }
    );
  } catch (error) {
    const safeError = extractSafeError(error);
    
    return NextResponse.json(
      {
        error: 'validation_error',
        message: safeError.message
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  
  try {
    const data = await fetchData(page);
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 }
    );
  }
}
```

### 🛠️ API Response Utilities

```typescript
// Créer lib/api/response-utils.ts
import { NextResponse } from 'next/server';

export type APISuccess<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export type APIError = {
  success: false;
  error: string;
  message: string;
  details?: unknown;
};

export type APIResponse<T = unknown> = APISuccess<T> | APIError;

// Response builders type-safe
export class APIResponseBuilder {
  static success<T>(data: T, message?: string, status: number = 200): NextResponse {
    const response: APISuccess<T> = {
      success: true,
      data,
      ...(message && { message })
    };
    
    return NextResponse.json(response, { status });
  }
  
  static error(
    error: string, 
    message: string, 
    status: number = 400,
    details?: unknown
  ): NextResponse {
    const response: APIError = {
      success: false,
      error,
      message,
      ...(details && { details })
    };
    
    return NextResponse.json(response, { status });
  }
  
  static unauthorized(message: string = 'Authentication required'): NextResponse {
    return this.error('unauthorized', message, 401);
  }
  
  static forbidden(message: string = 'Access denied'): NextResponse {
    return this.error('forbidden', message, 403);
  }
  
  static notFound(message: string = 'Resource not found'): NextResponse {
    return this.error('not_found', message, 404);
  }
  
  static validation(message: string, details?: unknown): NextResponse {
    return this.error('validation_error', message, 422, details);
  }
  
  static internal(message: string = 'Internal server error'): NextResponse {
    return this.error('internal_error', message, 500);
  }
}

// Usage standardisé
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.email) {
      return APIResponseBuilder.validation('Email is required', { field: 'email' });
    }
    
    const result = await createUser(data);
    return APIResponseBuilder.success(result, 'User created successfully', 201);
    
  } catch (error) {
    const safeError = extractSafeError(error);
    
    logSafe('error', 'User creation failed', {
      route: '/api/users',
      status: 500,
      error: safeError.message
    });
    
    return APIResponseBuilder.internal('Failed to create user');
  }
}
```

---

## 🔧 Configuration Quality Gate

### tsconfig.json Strict

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### ESLint Configuration Arka

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {
    // Strict TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    
    // Error handling
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    
    // Import consistency
    'no-restricted-imports': [
      'error',
      {
        'patterns': [
          {
            'group': ['**/Response'],
            'message': 'Use NextResponse from next/server instead'
          }
        ]
      }
    ],
    
    // Custom Arka rules (à implémenter)
    'arka/require-log-context': 'error',
    'arka/safe-sql-access': 'error',
    'arka/valid-role-type': 'error'
  }
};
```

### Package.json Scripts

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint:typescript": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "pre-commit": "npm run typecheck && npm run lint:typescript",
    "quality-gate": "npm run pre-commit && npm run test:unit"
  }
}
```

### Pre-commit Hooks

```javascript
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running TypeScript quality gate..."
npm run typecheck

if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found. Please fix before committing."
  exit 1
fi

npm run lint:typescript

if [ $? -ne 0 ]; then
  echo "❌ ESLint errors found. Please fix before committing."
  exit 1
fi

echo "✅ Quality gate passed!"
```

---

## 📊 Monitoring et Métriques

### KPIs TypeScript Quality

```typescript
// types/quality-metrics.ts
export interface TypeScriptQualityMetrics {
  total_files: number;
  typed_files: number;
  type_coverage_percent: number;
  error_count: number;
  warning_count: number;
  pattern_violations: {
    log_fields: number;
    unsafe_errors: number;
    role_types: number;
    sql_access: number;
    response_types: number;
  };
  ci_failures: number;
  pre_commit_blocks: number;
  avg_fix_time_minutes: number;
}
```

### Targets Qualité

- **Erreurs TypeScript :** 0 permanent
- **Type coverage :** >95%
- **Pre-commit block rate :** >95% erreurs interceptées
- **CI failure rate :** <2% (emergency fixes only)
- **Time to fix :** <30 minutes détection → correction

---

## 🎯 Conclusion et Actions

### Impact Business
- **Crédibilité technique :** Quality gate strict = prérequis Kickstarter
- **Maintenance :** 80% réduction erreurs récurrentes
- **Developer experience :** Friction bénéfique court terme

### ROI Investment
- **Investment :** 5 jours configuration quality gate
- **Saving :** 50+ jours debugging évités sur 12 mois
- **Risk mitigation :** Prévention dette technique exponentielle

### Actions Immédiates
1. **Configuration strict tsconfig.json** - Bloquer erreurs futures
2. **Pre-commit hooks** - Quality gate local automatique
3. **Documentation patterns** - Formation équipe standards
4. **CI/CD integration** - Quality gate pipeline automatique

---

**Documentation TypeScript Common Errors Arka v1.0** ✅  
**Patterns identifiés et solutions standardisées** 🎯  
**Quality gate strategy opérationnelle** ⚡