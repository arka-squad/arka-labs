/**
 * Cache Middleware - B28 Phase 3
 * Middleware pour caching automatique des réponses API
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache } from '../cache/redis-cache';
import crypto from 'crypto';

interface CacheConfig {
  ttl?: number;
  keyPrefix?: string;
  skipConditions?: {
    methods?: string[];
    paths?: string[];
    headers?: string[];
  };
  varyBy?: ('url' | 'method' | 'user' | 'query')[];
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 300, // 5 minutes par défaut
  keyPrefix: 'api_cache',
  skipConditions: {
    methods: ['POST', 'PUT', 'DELETE', 'PATCH'], // Pas de cache pour mutations
    paths: ['/api/auth', '/api/admin'], // Pas de cache pour auth/admin
    headers: ['authorization'] // Skip si header auth présent (données personnalisées)
  },
  varyBy: ['url', 'method', 'query']
};

export function createCacheMiddleware(config: CacheConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async function cacheMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now();

    try {
      // 1. Vérifier si on doit skip le cache
      if (shouldSkipCache(req, finalConfig)) {
        console.log(`🔄 Cache SKIP: ${req.method} ${req.url}`);
        return await handler(req);
      }

      // 2. Générer clé de cache
      const cacheKey = generateCacheKey(req, finalConfig);

      // 3. Essayer de récupérer depuis le cache
      const cached = await cache.get<{
        status: number;
        headers: Record<string, string>;
        body: any;
      }>(cacheKey);

      if (cached) {
        console.log(`⚡ Cache HIT: ${req.method} ${req.url} - ${Date.now() - startTime}ms`);

        // Retourner réponse cachée
        const response = NextResponse.json(cached.body, {
          status: cached.status,
          headers: {
            ...cached.headers,
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey.substring(0, 16) + '...',
            'X-Response-Time': `${Date.now() - startTime}ms`
          }
        });

        return response;
      }

      // 4. Cache MISS - Exécuter handler original
      console.log(`📊 Cache MISS: ${req.method} ${req.url}`);
      const response = await handler(req);

      // 5. Mettre en cache si réponse cacheable
      if (isCacheableResponse(response)) {
        const responseBody = await response.clone().json();

        await cache.set(cacheKey, {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody
        }, finalConfig.ttl);

        console.log(`💾 Cache SET: ${cacheKey} (TTL: ${finalConfig.ttl}s) - ${Date.now() - startTime}ms`);
      }

      // 6. Ajouter headers de cache info
      response.headers.set('X-Cache', 'MISS');
      response.headers.set('X-Cache-Key', cacheKey.substring(0, 16) + '...');
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

      return response;

    } catch (error) {
      console.error('Cache middleware error:', error);
      // En cas d'erreur cache, exécuter handler normal
      return await handler(req);
    }
  };
}

function shouldSkipCache(req: NextRequest, config: CacheConfig): boolean {
  const { skipConditions } = config;

  // Skip par méthode HTTP
  if (skipConditions?.methods?.includes(req.method)) {
    return true;
  }

  // Skip par path
  const pathname = new URL(req.url).pathname;
  if (skipConditions?.paths?.some(path => pathname.startsWith(path))) {
    return true;
  }

  // Skip si headers spécifiques présents
  if (skipConditions?.headers?.some(header => req.headers.has(header))) {
    return true;
  }

  return false;
}

function generateCacheKey(req: NextRequest, config: CacheConfig): string {
  const url = new URL(req.url);
  const keyParts: string[] = [config.keyPrefix || 'cache'];

  config.varyBy?.forEach(varyBy => {
    switch (varyBy) {
      case 'url':
        keyParts.push(url.pathname);
        break;
      case 'method':
        keyParts.push(req.method);
        break;
      case 'query':
        const sortedParams = Array.from(url.searchParams.entries())
          .sort(([a], [b]) => a.localeCompare(b));
        if (sortedParams.length > 0) {
          keyParts.push(JSON.stringify(sortedParams));
        }
        break;
      case 'user':
        // Extraire user ID depuis auth header si possible
        const auth = req.headers.get('authorization');
        if (auth) {
          const hash = crypto.createHash('md5').update(auth).digest('hex');
          keyParts.push(hash.substring(0, 8));
        }
        break;
    }
  });

  // Générer hash final pour éviter clés trop longues
  const keyString = keyParts.join(':');
  const hash = crypto.createHash('sha256').update(keyString).digest('hex');

  return `${config.keyPrefix}:${hash.substring(0, 16)}`;
}

function isCacheableResponse(response: NextResponse): boolean {
  // Cache seulement les réponses 200 OK
  if (response.status !== 200) {
    return false;
  }

  // Cache seulement les réponses JSON
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return false;
  }

  // Ne pas cacher si header no-cache
  const cacheControl = response.headers.get('cache-control');
  if (cacheControl?.includes('no-cache') || cacheControl?.includes('no-store')) {
    return false;
  }

  return true;
}

/**
 * Cache middleware pré-configuré pour différents types d'endpoints
 */
export const cacheMiddleware = {
  // Cache standard (5 min)
  standard: createCacheMiddleware({
    ttl: 300,
    keyPrefix: 'api_standard'
  }),

  // Cache long pour données statiques (1 heure)
  longTerm: createCacheMiddleware({
    ttl: 3600,
    keyPrefix: 'api_long',
    varyBy: ['url', 'method']
  }),

  // Cache court pour données fréquentes (1 min)
  shortTerm: createCacheMiddleware({
    ttl: 60,
    keyPrefix: 'api_short'
  }),

  // Cache pour listes paginées
  paginated: createCacheMiddleware({
    ttl: 180, // 3 minutes
    keyPrefix: 'api_paginated',
    varyBy: ['url', 'method', 'query'] // Include pagination params
  }),

  // Cache pour données utilisateur (varie par user)
  userSpecific: createCacheMiddleware({
    ttl: 300,
    keyPrefix: 'api_user',
    varyBy: ['url', 'method', 'user', 'query'],
    skipConditions: {
      methods: ['POST', 'PUT', 'DELETE', 'PATCH']
    }
  })
};

export default cacheMiddleware;