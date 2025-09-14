/**
 * ARKA API ROUTER - Système centralisé de routing avec switch de méthodes
 * 
 * Permet de:
 * 1. Centraliser toutes les routes API
 * 2. Switcher entre différentes implémentations (dynamic vs query params)
 * 3. Tester sans casser l'existant
 * 4. Monitoring centralisé
 */

import { NextRequest, NextResponse } from 'next/server';

// Types pour les routes
// Import types
import { 
  HttpMethod, 
  RouteStrategy, 
  RouterConfig, 
  RouteDefinition, 
  RouteHandler, 
  RouteParams,
  RouterStats,
  RouteMeta
} from './types';

// Re-export types for convenience
export type { 
  HttpMethod, 
  RouteStrategy, 
  RouterConfig, 
  RouteDefinition, 
  RouteHandler, 
  RouteParams,
  RouterStats,
  RouteMeta
};

// Configuration par défaut
const DEFAULT_CONFIG = {
  strategy: 'query', // Utiliser query par défaut (résout le problème Vercel)
  debug: process.env.NODE_ENV === 'development',
  fallback: true,
  monitoring: true
};

// Registry centralisé des routes
class APIRouter {
  private routes = new Map<string, RouteDefinition>();
  private config = DEFAULT_CONFIG;
  
  constructor(config?: Partial<typeof DEFAULT_CONFIG>) {
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
    }
  }

  // Enregistrer une route
  register(route: RouteDefinition) {
    const key = `${route.method}:${route.path}`;
    this.routes.set(key, route);
    
    if (this.config.debug) {
      console.log(`[API Router] Registered: ${key}`);
    }
  }

  // Créer le handler Next.js
  createHandler(path: string, method: HttpMethod) {
    return async (req: NextRequest, context?: any) => {
      const startTime = Date.now();
      const key = `${method}:${path}`;
      const route = this.routes.get(key);

      if (!route) {
        return NextResponse.json(
          { error: 'Route not found', path, method },
          { status: 404 }
        );
      }

      try {
        // Extraire les paramètres
        const params = this.extractParams(req, context);
        
        // Choisir la stratégie
        const strategy = this.config.strategy;
        let handler = route.strategies[strategy as keyof typeof route.strategies];
        
        // Fallback si pas d'implémentation pour cette stratégie
        if (!handler && this.config.fallback) {
          handler = route.strategies.dynamic || 
                   route.strategies.query || 
                   route.strategies.hybrid;
        }

        if (!handler) {
          throw new Error(`No handler available for strategy: ${strategy}`);
        }

        // Monitoring
        if (this.config.monitoring) {
          console.log(`[API Router] ${method} ${path} - Strategy: ${strategy}`);
        }

        // Exécuter le handler
        const response = await handler(req, params);
        
        // Log de performance
        if (this.config.debug) {
          const duration = Date.now() - startTime;
          console.log(`[API Router] ${key} completed in ${duration}ms`);
        }

        return response;

      } catch (error) {
        console.error(`[API Router] Error in ${key}:`, error);
        return NextResponse.json(
          { error: 'Internal Server Error', code: 'ROUTER_ERROR' },
          { status: 500 }
        );
      }
    };
  }

  // Extraire paramètres URL et query
  private extractParams(req: NextRequest, context?: any): RouteParams {
    const url = new URL(req.url);
    const query: Record<string, string> = {};
    
    // Query parameters
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    // Path parameters (de Next.js context)
    const path: Record<string, string> = context?.params || {};

    return { path, query };
  }

  // Changer la stratégie à chaud
  setStrategy(strategy: RouteStrategy) {
    this.config.strategy = strategy;
    console.log(`[API Router] Strategy switched to: ${strategy}`);
  }

  // Lister toutes les routes enregistrées
  listRoutes() {
    return Array.from(this.routes.entries()).map(([key, route]) => ({
      key,
      path: route.path,
      method: route.method,
      strategies: Object.keys(route.strategies),
      description: route.description
    }));
  }

  // Stats d'utilisation
  getStats() {
    return {
      totalRoutes: this.routes.size,
      config: this.config,
      strategies: Array.from(this.routes.values()).reduce((acc, route) => {
        Object.keys(route.strategies).forEach(strategy => {
          acc[strategy] = (acc[strategy] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Instance globale
const apiRouter = new APIRouter();

// Helper pour créer des routes facilement
export const createRoute = (definition: RouteDefinition) => {
  apiRouter.register(definition);
  return apiRouter.createHandler(definition.path, definition.method);
};

// Export de l'instance
export { apiRouter };