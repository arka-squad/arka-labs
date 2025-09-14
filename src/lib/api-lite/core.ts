// ============================================
// lib/api-lite/core.ts
// API Manager léger optimisé pour Vercel
// ZERO dépendances externes coûteuses
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================
// Types de base
// ============================================

export interface RouteContext {
  request: NextRequest;
  params: Record<string, any>;
  query: Record<string, any>;
  headers: Headers;
  method: string;
  path: string;
  metadata: Map<string, any>;
  startTime: number;
}

export interface RouteConfig {
  path: string;
  method: string;
  handler: RouteHandler;
  middleware?: Middleware[];
  cache?: SimpleCacheConfig;
  rateLimit?: SimpleRateLimitConfig;
  auth?: SimpleAuthConfig;
}

export interface SimpleCacheConfig {
  ttl: number; // secondes
  key?: string;
}

export interface SimpleRateLimitConfig {
  windowMs: number;
  max: number;
}

export interface SimpleAuthConfig {
  required: boolean;
  apiKey?: boolean;
}

export type RouteHandler = (context: RouteContext) => Promise<NextResponse>;
export type Middleware = (context: RouteContext, next: () => Promise<NextResponse>) => Promise<NextResponse>;

// ============================================
// Système de routing ultra-léger
// ============================================

class SimpleMatcher {
  private staticRoutes = new Map<string, RouteConfig>();
  private dynamicRoutes: Array<{
    pattern: RegExp;
    keys: string[];
    route: RouteConfig;
  }> = [];

  add(path: string, route: RouteConfig) {
    // Routes statiques (plus rapides)
    if (!path.includes(':') && !path.includes('*')) {
      const key = `${route.method}:${path}`;
      this.staticRoutes.set(key, route);
      return;
    }

    // Routes dynamiques simples (sans regex complexe)
    const keys: string[] = [];
    const pattern = path
      .split('/')
      .map(segment => {
        if (segment.startsWith(':')) {
          const key = segment.slice(1);
          keys.push(key);
          return '([^/]+)'; // Simple capture, pas de regex complexe
        }
        if (segment === '*') {
          keys.push('wildcard');
          return '(.*)';
        }
        return segment;
      })
      .join('/');

    this.dynamicRoutes.push({
      pattern: new RegExp(`^${pattern}$`),
      keys,
      route
    });
  }

  match(method: string, path: string): { route: RouteConfig; params: Record<string, string> } | null {
    // Check static routes first (O(1))
    const staticKey = `${method}:${path}`;
    const staticRoute = this.staticRoutes.get(staticKey);
    if (staticRoute) {
      return { route: staticRoute, params: {} };
    }

    // Check dynamic routes (O(n))
    for (const dynamicRoute of this.dynamicRoutes) {
      if (dynamicRoute.route.method !== method) continue;
      
      const match = path.match(dynamicRoute.pattern);
      if (match) {
        const params: Record<string, string> = {};
        dynamicRoute.keys.forEach((key, index) => {
          params[key] = match[index + 1];
        });
        return { route: dynamicRoute.route, params };
      }
    }

    return null;
  }

  getAllRoutes() {
    const routes: RouteConfig[] = [];
    routes.push(...this.staticRoutes.values());
    routes.push(...this.dynamicRoutes.map(dr => dr.route));
    return routes;
  }
}

// ============================================
// Cache mémoire simple
// ============================================

interface CacheEntry {
  data: any;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup automatique toutes les 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any, ttlSeconds: number): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// ============================================
// Rate Limiting simple
// ============================================

interface ClientData {
  requests: number[];
}

class RateLimiter {
  private clients = new Map<string, ClientData>();

  isAllowed(clientId: string, windowMs: number, max: number): boolean {
    const now = Date.now();
    const client = this.clients.get(clientId) || { requests: [] };

    // Filter out requests outside the window
    client.requests = client.requests.filter(timestamp => 
      timestamp > now - windowMs
    );

    if (client.requests.length >= max) {
      return false;
    }

    // Add current request
    client.requests.push(now);
    this.clients.set(clientId, client);

    return true;
  }

  getStats(): { clientCount: number; totalRequests: number } {
    let totalRequests = 0;
    for (const client of this.clients.values()) {
      totalRequests += client.requests.length;
    }
    return {
      clientCount: this.clients.size,
      totalRequests
    };
  }

  clear(): void {
    this.clients.clear();
  }
}

// ============================================
// Route Builder Pattern
// ============================================

export class RouteBuilder {
  private config: Partial<RouteConfig> = {};
  
  constructor(private api: APILite, private path: string) {
    this.config.path = path;
  }

  get(): RouteBuilder {
    this.config.method = 'GET';
    return this;
  }

  post(): RouteBuilder {
    this.config.method = 'POST';
    return this;
  }

  put(): RouteBuilder {
    this.config.method = 'PUT';
    return this;
  }

  patch(): RouteBuilder {
    this.config.method = 'PATCH';
    return this;
  }

  delete(): RouteBuilder {
    this.config.method = 'DELETE';
    return this;
  }

  cache(ttlSeconds: number, key?: string): RouteBuilder {
    this.config.cache = { ttl: ttlSeconds, key };
    return this;
  }

  rateLimit(windowMs: number, max: number): RouteBuilder {
    this.config.rateLimit = { windowMs, max };
    return this;
  }

  auth(required: boolean = true, apiKey: boolean = false): RouteBuilder {
    this.config.auth = { required, apiKey };
    return this;
  }

  middleware(...middleware: Middleware[]): RouteBuilder {
    this.config.middleware = [...(this.config.middleware || []), ...middleware];
    return this;
  }

  handler(handler: RouteHandler): RouteBuilder {
    this.config.handler = handler;
    return this;
  }

  build(): void {
    if (!this.config.method) {
      throw new Error(`Method is required for route ${this.path}`);
    }
    if (!this.config.handler) {
      throw new Error(`Handler is required for route ${this.path}`);
    }

    this.api.addRoute(this.config as RouteConfig);
  }
}

// ============================================
// API Manager principal
// ============================================

export class APILite {
  private matcher = new SimpleMatcher();
  private cache = new MemoryCache();
  private rateLimiter = new RateLimiter();
  private globalMiddleware: Middleware[] = [];

  constructor() {
    this.setupDefaultMiddleware();
  }

  private setupDefaultMiddleware() {
    // Security headers par défaut
    this.use(async (context, next) => {
      const response = await next();
      
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      
      return response;
    });

    // Request ID pour debugging
    this.use(async (context, next) => {
      const requestId = crypto.randomUUID().substring(0, 8);
      context.metadata.set('requestId', requestId);
      
      console.log(`→ ${requestId} ${context.method} ${context.path}`);
      const start = Date.now();
      
      const response = await next();
      
      const duration = Date.now() - start;
      console.log(`← ${requestId} ${response.status} ${duration}ms`);
      
      response.headers.set('X-Request-ID', requestId);
      return response;
    });
  }

  route(path: string): RouteBuilder {
    return new RouteBuilder(this, path);
  }

  use(middleware: Middleware): void {
    this.globalMiddleware.push(middleware);
  }

  addRoute(config: RouteConfig): void {
    this.matcher.add(config.path, config);
  }

  async handleRequest(request: NextRequest): Promise<NextResponse> {
    const url = new URL(request.url);
    const match = this.matcher.match(request.method, url.pathname);

    if (!match) {
      return NextResponse.json(
        { error: 'Route not found', path: url.pathname, method: request.method },
        { status: 404 }
      );
    }

    // Create context
    const context: RouteContext = {
      request,
      params: match.params,
      query: Object.fromEntries(url.searchParams),
      headers: request.headers,
      method: request.method,
      path: url.pathname,
      metadata: new Map(),
      startTime: Date.now()
    };

    // Build middleware chain
    const middlewares = [
      ...this.globalMiddleware,
      ...(match.route.middleware || [])
    ];

    // Add built-in middleware
    if (match.route.rateLimit) {
      middlewares.push(this.createRateLimitMiddleware(match.route.rateLimit));
    }

    if (match.route.auth) {
      middlewares.push(this.createAuthMiddleware(match.route.auth));
    }

    if (match.route.cache) {
      middlewares.push(this.createCacheMiddleware(match.route.cache));
    }

    // Execute middleware chain
    let index = 0;
    
    const next = async (): Promise<NextResponse> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        return await middleware(context, next);
      } else {
        return await match.route.handler(context);
      }
    };

    try {
      return await next();
    } catch (error) {
      console.error('Route error:', error);
      return NextResponse.json(
        { 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        },
        { status: 500 }
      );
    }
  }

  private createRateLimitMiddleware(config: SimpleRateLimitConfig): Middleware {
    return async (context, next) => {
      const clientId = this.getClientId(context);
      
      if (!this.rateLimiter.isAllowed(clientId, config.windowMs, config.max)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }

      return await next();
    };
  }

  private createAuthMiddleware(config: SimpleAuthConfig): Middleware {
    return async (context, next) => {
      if (!config.required) {
        return await next();
      }

      if (config.apiKey) {
        const apiKey = context.headers.get('x-api-key');
        const validKeys = process.env.API_KEYS?.split(',') || [];
        
        if (!apiKey || !validKeys.includes(apiKey)) {
          return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
          );
        }
      }

      return await next();
    };
  }

  private createCacheMiddleware(config: SimpleCacheConfig): Middleware {
    return async (context, next) => {
      if (context.method !== 'GET') {
        return await next();
      }

      const cacheKey = config.key || `${context.path}?${new URLSearchParams(context.query).toString()}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        const response = NextResponse.json(cached);
        response.headers.set('X-Cache', 'HIT');
        return response;
      }

      const response = await next();
      
      if (response.status === 200) {
        const data = await response.json();
        this.cache.set(cacheKey, data, config.ttl);
        
        const newResponse = NextResponse.json(data);
        newResponse.headers.set('X-Cache', 'MISS');
        
        // Copy other headers
        response.headers.forEach((value, key) => {
          if (!newResponse.headers.has(key)) {
            newResponse.headers.set(key, value);
          }
        });
        
        return newResponse;
      }

      return response;
    };
  }

  private getClientId(context: RouteContext): string {
    // Use IP address as client identifier
    const forwarded = context.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'localhost';
    return ip;
  }

  // Stats and debugging
  getStats() {
    return {
      routes: this.matcher.getAllRoutes().length,
      cache: this.cache.size(),
      rateLimit: this.rateLimiter.getStats()
    };
  }

  clearCache() {
    this.cache.clear();
  }

  clearRateLimit() {
    this.rateLimiter.clear();
  }
}