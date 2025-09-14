/**
 * ARKA API ROUTER - Configuration centralisée
 */

import { RouteStrategy } from './index';

// Configuration des stratégies par environnement
interface EnvironmentConfig {
  strategy: RouteStrategy;
  debug: boolean;
  monitoring: boolean;
  fallback: boolean;
}

// Configurations prédéfinies
const ENVIRONMENT_CONFIGS: Record<string, EnvironmentConfig> = {
  development: {
    strategy: 'hybrid', // Test les deux en local
    debug: true,
    monitoring: true,
    fallback: true
  },
  
  production: {
    strategy: 'query', // Query params en prod (résout Vercel)
    debug: false,
    monitoring: true,
    fallback: true
  },
  
  staging: {
    strategy: 'dynamic', // Test dynamic en staging
    debug: true,
    monitoring: true,
    fallback: true
  },
  
  testing: {
    strategy: 'hybrid', // Test toutes stratégies
    debug: true,
    monitoring: false,
    fallback: true
  }
};

// Configuration par route spécifique
interface RouteConfig {
  path: string;
  method: string;
  strategy?: RouteStrategy;
  disabled?: boolean;
  rateLimit?: number;
  cacheTTL?: number;
}

// Overrides spécifiques par route
const ROUTE_OVERRIDES: RouteConfig[] = [
  {
    path: '/api/admin/clients',
    method: 'GET',
    strategy: 'query', // Force query pour cette route critique
    cacheTTL: 60 // 1 minute de cache
  },
  {
    path: '/api/admin/agents',
    method: 'GET', 
    strategy: 'dynamic', // Test dynamic sur agents
    cacheTTL: 300 // 5 minutes de cache
  }
];

// Configuration globale
export class RouterConfig {
  private static instance: RouterConfig;
  private config: EnvironmentConfig;
  private overrides: Map<string, RouteConfig>;
  
  private constructor() {
    const env = process.env.NODE_ENV || 'development';
    this.config = ENVIRONMENT_CONFIGS[env] || ENVIRONMENT_CONFIGS.development;
    this.overrides = new Map();
    
    // Charger les overrides
    ROUTE_OVERRIDES.forEach(override => {
      const key = `${override.method}:${override.path}`;
      this.overrides.set(key, override);
    });
    
    console.log(`[Router Config] Loaded config for ${env}:`, this.config);
  }
  
  static getInstance(): RouterConfig {
    if (!RouterConfig.instance) {
      RouterConfig.instance = new RouterConfig();
    }
    return RouterConfig.instance;
  }
  
  // Obtenir la stratégie pour une route
  getStrategy(path: string, method: string): RouteStrategy {
    const key = `${method}:${path}`;
    const override = this.overrides.get(key);
    
    if (override?.strategy) {
      return override.strategy;
    }
    
    return this.config.strategy;
  }
  
  // Changer stratégie globale à chaud
  setGlobalStrategy(strategy: RouteStrategy) {
    this.config.strategy = strategy;
    console.log(`[Router Config] Global strategy changed to: ${strategy}`);
  }
  
  // Override stratégie pour une route spécifique
  setRouteStrategy(path: string, method: string, strategy: RouteStrategy) {
    const key = `${method}:${path}`;
    const existing = this.overrides.get(key) || { path, method };
    existing.strategy = strategy;
    this.overrides.set(key, existing);
    
    console.log(`[Router Config] Route ${key} strategy set to: ${strategy}`);
  }
  
  // Configuration complète
  getConfig() {
    return {
      global: this.config,
      overrides: Array.from(this.overrides.entries()).map(([key, config]) => ({
        key,
        ...config
      }))
    };
  }
  
  // Activer/désactiver debug
  setDebug(enabled: boolean) {
    this.config.debug = enabled;
    console.log(`[Router Config] Debug ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  // Réinitialiser aux defaults
  reset() {
    const env = process.env.NODE_ENV || 'development';
    this.config = ENVIRONMENT_CONFIGS[env] || ENVIRONMENT_CONFIGS.development;
    this.overrides.clear();
    
    ROUTE_OVERRIDES.forEach(override => {
      const key = `${override.method}:${override.path}`;
      this.overrides.set(key, override);
    });
    
    console.log(`[Router Config] Reset to defaults for ${env}`);
  }
  
  // Export config pour monitoring
  exportConfig() {
    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      global: this.config,
      routeOverrides: Array.from(this.overrides.values()),
      availableStrategies: ['dynamic', 'query', 'hybrid'] as RouteStrategy[]
    };
  }
}

// Helper pour obtenir la config
export const getRouterConfig = () => RouterConfig.getInstance();

// Variables d'environnement pour override à chaud
export const ENV_OVERRIDES = {
  // ARKA_ROUTER_STRATEGY=query npm run dev
  strategy: process.env.ARKA_ROUTER_STRATEGY as RouteStrategy,
  // ARKA_ROUTER_DEBUG=true npm run dev  
  debug: process.env.ARKA_ROUTER_DEBUG === 'true',
  // ARKA_ROUTER_MONITORING=false npm run dev
  monitoring: process.env.ARKA_ROUTER_MONITORING !== 'false'
};

// Appliquer les overrides d'environnement au démarrage
if (ENV_OVERRIDES.strategy) {
  getRouterConfig().setGlobalStrategy(ENV_OVERRIDES.strategy);
}

if (ENV_OVERRIDES.debug !== undefined) {
  getRouterConfig().setDebug(ENV_OVERRIDES.debug);
}