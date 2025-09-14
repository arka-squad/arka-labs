/**
 * Script B28 Phase 2 - Restructuration Dossiers
 * Crée la structure src/ moderne et migre les fichiers existants
 */

const fs = require('fs');
const path = require('path');

function restructureFolders() {
  console.log('🏗️ Restructuration vers architecture src/ moderne...');

  // 1. Créer la nouvelle structure src/
  console.log('📁 Création structure src/...');

  const structure = {
    'src': {
      'api': {
        'routes': {
          'admin': {},
          'agents': {},
          'auth': {},
          'clients': {},
          'projects': {},
          'squads': {},
          'system': {} // health, version, metrics
        },
        'middleware': {},
        'validators': {}
      },
      'lib': {
        'auth': {},
        'db': {},
        'cache': {},
        'utils': {}
      },
      'components': {
        'ui': {},
        'admin': {},
        'shared': {}
      },
      'types': {}
    }
  };

  function createStructure(obj, basePath = '.') {
    Object.keys(obj).forEach(dir => {
      const dirPath = path.join(basePath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  ✅ ${dirPath}/`);
      }

      if (typeof obj[dir] === 'object' && Object.keys(obj[dir]).length > 0) {
        createStructure(obj[dir], dirPath);
      }
    });
  }

  createStructure(structure);

  // 2. Créer le point d'entrée API unique
  console.log('📄 Création point d\'entrée API...');

  const apiIndexContent = `// B28 Phase 2 - Point d'entrée API unifié
// Remplace les 97 routes directes par un système centralisé

import { createRouter } from './core/router';
import { registerAdminRoutes } from './routes/admin';
import { registerAgentsRoutes } from './routes/agents';
import { registerAuthRoutes } from './routes/auth';
import { registerClientsRoutes } from './routes/clients';
import { registerProjectsRoutes } from './routes/projects';
import { registerSquadsRoutes } from './routes/squads';
import { registerSystemRoutes } from './routes/system';

export function createAPI() {
  const router = createRouter();

  // Enregistrer tous les modules
  registerSystemRoutes(router);    // health, version, metrics
  registerAuthRoutes(router);      // auth, login, tokens
  registerAdminRoutes(router);     // backoffice admin
  registerClientsRoutes(router);   // gestion clients
  registerProjectsRoutes(router);  // gestion projets
  registerAgentsRoutes(router);    // gestion agents
  registerSquadsRoutes(router);    // gestion squads

  return router;
}

export async function apiHandler(req: Request, context: any) {
  const api = createAPI();
  return api.handle(req, context);
}

// Stats pour monitoring
export const API_STATS = {
  version: '2.0.0',
  architecture: 'unified',
  totalRoutes: 97,
  migratedFrom: 'direct-routes + api-lite',
  created: new Date().toISOString()
};
`;

  fs.writeFileSync(path.join('src', 'api', 'index.ts'), apiIndexContent);

  // 3. Créer le router core
  const routerCoreContent = `// Router Core - B28 Phase 2
import { NextRequest, NextResponse } from 'next/server';

export interface Route {
  method: string;
  path: string;
  handler: (req: NextRequest, context: any) => Promise<NextResponse>;
  middleware?: Function[];
}

export class Router {
  private routes: Route[] = [];

  get(path: string, handler: Function, middleware?: Function[]) {
    this.routes.push({ method: 'GET', path, handler, middleware });
    return this;
  }

  post(path: string, handler: Function, middleware?: Function[]) {
    this.routes.push({ method: 'POST', path, handler, middleware });
    return this;
  }

  put(path: string, handler: Function, middleware?: Function[]) {
    this.routes.push({ method: 'PUT', path, handler, middleware });
    return this;
  }

  delete(path: string, handler: Function, middleware?: Function[]) {
    this.routes.push({ method: 'DELETE', path, handler, middleware });
    return this;
  }

  patch(path: string, handler: Function, middleware?: Function[]) {
    this.routes.push({ method: 'PATCH', path, handler, middleware });
    return this;
  }

  async handle(req: NextRequest, context: any): Promise<NextResponse> {
    const { method } = req;
    const pathname = new URL(req.url).pathname.replace('/api', '');

    // Trouver la route correspondante
    const route = this.routes.find(r =>
      r.method === method && this.matchPath(r.path, pathname)
    );

    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    try {
      // Appliquer middlewares
      if (route.middleware) {
        for (const middleware of route.middleware) {
          const result = await middleware(req, context);
          if (result) return result; // Middleware a retourné une réponse
        }
      }

      // Exécuter handler
      return await route.handler(req, context);
    } catch (error) {
      console.error('Route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  private matchPath(routePath: string, requestPath: string): boolean {
    // Simple path matching - peut être amélioré
    const routeRegex = routePath.replace(/:[^/]+/g, '([^/]+)');
    const regex = new RegExp(\`^\${routeRegex}$\`);
    return regex.test(requestPath);
  }

  getRoutes() {
    return this.routes;
  }
}

export function createRouter(): Router {
  return new Router();
}
`;

  fs.mkdirSync(path.join('src', 'api', 'core'), { recursive: true });
  fs.writeFileSync(path.join('src', 'api', 'core', 'router.ts'), routerCoreContent);

  // 4. Créer catch-all route
  console.log('🎯 Création catch-all route...');

  const catchAllContent = `// Catch-all API route - B28 Phase 2
// Redirige TOUTES les requêtes API vers src/api
import { apiHandler } from '@/src/api';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, context: any) {
  return apiHandler(req, context);
}

export async function POST(req: NextRequest, context: any) {
  return apiHandler(req, context);
}

export async function PUT(req: NextRequest, context: any) {
  return apiHandler(req, context);
}

export async function DELETE(req: NextRequest, context: any) {
  return apiHandler(req, context);
}

export async function PATCH(req: NextRequest, context: any) {
  return apiHandler(req, context);
}

// Métadonnées pour Next.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
`;

  const catchAllDir = path.join('app', 'api', '[[...slug]]');
  fs.mkdirSync(catchAllDir, { recursive: true });
  fs.writeFileSync(path.join(catchAllDir, 'route.ts'), catchAllContent);

  // 5. Migrer lib/ existante
  console.log('📦 Migration lib/ → src/lib/...');

  if (fs.existsSync('lib')) {
    const libFiles = fs.readdirSync('lib', { recursive: true });

    libFiles.forEach(file => {
      if (typeof file === 'string' && file.endsWith('.ts')) {
        const sourcePath = path.join('lib', file);
        const destPath = path.join('src', 'lib', file);

        // Créer dossier destination si nécessaire
        fs.mkdirSync(path.dirname(destPath), { recursive: true });

        try {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`  ✅ lib/${file} → src/lib/${file}`);
        } catch (error) {
          console.log(`  ⚠️  Erreur ${file}: ${error.message}`);
        }
      }
    });
  }

  // 6. Créer templates routes modules
  console.log('📝 Création templates modules...');

  const moduleTemplate = (moduleName) => `// Routes ${moduleName} - B28 Phase 2
import { Router } from '../core/router';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth/middleware';

export function register${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Routes(router: Router) {
  // TODO: Migrer routes ${moduleName} depuis app/api/

  // Exemple route
  router.get('/${moduleName}/health', async (req: NextRequest) => {
    return NextResponse.json({
      module: '${moduleName}',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // D'autres routes à ajouter durant migration...
}
`;

  const modules = ['admin', 'agents', 'auth', 'clients', 'projects', 'squads', 'system'];
  modules.forEach(module => {
    const moduleDir = path.join('src', 'api', 'routes', module);
    fs.writeFileSync(path.join(moduleDir, 'index.ts'), moduleTemplate(module));
    console.log(`  ✅ Template ${module} créé`);
  });

  // 7. Créer tsconfig paths
  console.log('⚙️ Configuration TypeScript paths...');

  const tsconfigPath = 'tsconfig.json';
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

    if (!tsconfig.compilerOptions.paths) {
      tsconfig.compilerOptions.paths = {};
    }

    // Ajouter paths pour nouvelle structure
    tsconfig.compilerOptions.paths['@/src/*'] = ['./src/*'];
    tsconfig.compilerOptions.paths['@/components/*'] = ['./src/components/*'];
    tsconfig.compilerOptions.paths['@/lib/*'] = ['./src/lib/*'];
    tsconfig.compilerOptions.paths['@/types/*'] = ['./src/types/*'];

    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log('  ✅ Paths TypeScript configurés');
  }

  console.log('✅ Restructuration terminée !');
  console.log('📊 Structure créée :');
  console.log('   📁 src/ - Architecture moderne');
  console.log('   🎯 app/api/[[...slug]]/ - Catch-all unique');
  console.log('   📦 Templates modules - 7 domaines');
  console.log('   ⚙️ TypeScript paths - Configurés');

  return {
    srcCreated: true,
    catchAllCreated: true,
    modulesCount: modules.length,
    libMigrated: fs.existsSync('lib')
  };
}

// Exécution si lancé directement
if (require.main === module) {
  restructureFolders();
}

module.exports = { restructureFolders };