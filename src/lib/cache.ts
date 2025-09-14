// lib/cache.ts - Redis-like caching layer for B23 performance optimization

import { log } from './logger';

// In-memory cache fallback when Redis is not available
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>();
  private maxSize = 1000; // Prevent memory leaks

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key: string, value: any, ttlSeconds: number = 300): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  del(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  keys(pattern?: string): string[] {
    const keys = Array.from(this.cache.keys());
    if (!pattern) return keys;
    
    // Simple pattern matching (* wildcard)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }
}

// Global cache instance
let cacheInstance: MemoryCache;

// Redis connection (if available)
let redis: any = null;

export async function initCache(): Promise<void> {
  if (!cacheInstance) {
    cacheInstance = new MemoryCache();
  }

  // Try to connect to Redis if configured
  if (process.env.REDIS_URL) {
    try {
      const Redis = require('ioredis');
      redis = new Redis(process.env.REDIS_URL, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });
      
      await redis.ping();
      log('info', 'cache_redis_connected', { route: 'cache', status: 200, redis_url: process.env.REDIS_URL });
    } catch (error) {
      log('warn', 'cache_redis_failed_fallback_memory', { route: 'cache', status: 500, error: error instanceof Error ? error.message : 'Unknown error' });
      redis = null;
    }
  }
}

export async function get(key: string): Promise<any | null> {
  try {
    if (redis) {
      const value = await redis.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } else {
      return cacheInstance?.get(key) || null;
    }
  } catch (error) {
    log('warn', 'cache_get_failed', { route: 'cache', status: 500, key, error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
}

export async function set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    
    if (redis) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      cacheInstance?.set(key, value, ttlSeconds);
    }
    
    log('debug', 'cache_set', { route: 'cache', status: 200, key, ttl: ttlSeconds });
  } catch (error) {
    log('warn', 'cache_set_failed', { route: 'cache', status: 500, key, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export async function del(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key);
    } else {
      cacheInstance?.del(key);
    }
    
    log('debug', 'cache_del', { route: 'cache', status: 200, key });
  } catch (error) {
    log('warn', 'cache_del_failed', { route: 'cache', status: 500, key, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    let keys: string[] = [];
    
    if (redis) {
      keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      keys = cacheInstance?.keys(pattern) || [];
      keys.forEach(key => cacheInstance?.del(key));
    }
    
    log('debug', 'cache_pattern_invalidated', { route: 'cache', status: 200, pattern, keys_count: keys.length });
  } catch (error) {
    log('warn', 'cache_pattern_invalidation_failed', { route: 'cache', status: 500, pattern, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// Specific cache helpers for B23 entities
export const SquadCache = {
  async getList(filters: string): Promise<any[] | null> {
    return await get(`squads:list:${filters}`);
  },

  async setList(filters: string, squads: any[], ttl: number = 300): Promise<void> {
    await set(`squads:list:${filters}`, squads, ttl);
  },

  async getDetail(squadId: string): Promise<any | null> {
    return await get(`squad:${squadId}`);
  },

  async setDetail(squadId: string, squad: any, ttl: number = 600): Promise<void> {
    await set(`squad:${squadId}`, squad, ttl);
  },

  async getPerformance(squadId: string): Promise<any | null> {
    return await get(`squad:${squadId}:performance`);
  },

  async setPerformance(squadId: string, performance: any, ttl: number = 300): Promise<void> {
    await set(`squad:${squadId}:performance`, performance, ttl);
  },

  async invalidate(squadId?: string): Promise<void> {
    if (squadId) {
      await Promise.all([
        del(`squad:${squadId}`),
        del(`squad:${squadId}:performance`),
        invalidatePattern('squads:list:*')
      ]);
    } else {
      await invalidatePattern('squad*');
    }
  }
};

export const ProjectCache = {
  async getList(): Promise<any[] | null> {
    return await get('projects:list');
  },

  async setList(projects: any[], ttl: number = 300): Promise<void> {
    await set('projects:list', projects, ttl);
  },

  async getDetail(projectId: number): Promise<any | null> {
    return await get(`project:${projectId}`);
  },

  async setDetail(projectId: number, project: any, ttl: number = 600): Promise<void> {
    await set(`project:${projectId}`, project, ttl);
  },

  async invalidate(projectId?: number): Promise<void> {
    if (projectId) {
      await Promise.all([
        del(`project:${projectId}`),
        del('projects:list')
      ]);
    } else {
      await invalidatePattern('project*');
    }
  }
};

export const InstructionCache = {
  async getQueue(): Promise<any[] | null> {
    return await get('instructions:queue');
  },

  async setQueue(instructions: any[], ttl: number = 60): Promise<void> {
    await set('instructions:queue', instructions, ttl);
  },

  async invalidateQueue(): Promise<void> {
    await del('instructions:queue');
  }
};

// Cache warming functions
export async function warmupCache(): Promise<void> {
  try {
    log('info', 'cache_warmup_started', { route: 'cache', status: 200 });
    
    // Warm up commonly accessed data
    const start = Date.now();
    
    // This would typically fetch and cache frequently accessed data
    // For now, we just initialize the cache
    await initCache();
    
    const duration = Date.now() - start;
    log('info', 'cache_warmup_completed', { route: 'cache', status: 200, duration_ms: duration });
  } catch (error) {
    log('error', 'cache_warmup_failed', { route: 'cache', status: 500, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// Health check for cache
export async function checkCacheHealth(): Promise<{ healthy: boolean; type: string; latency?: number; error?: string }> {
  const start = Date.now();
  
  try {
    const testKey = 'health_check_' + Date.now();
    const testValue = { test: true };
    
    await set(testKey, testValue, 10);
    const retrieved = await get(testKey);
    await del(testKey);
    
    const latency = Date.now() - start;
    
    if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
      return {
        healthy: true,
        type: redis ? 'redis' : 'memory',
        latency
      };
    } else {
      return {
        healthy: false,
        type: redis ? 'redis' : 'memory',
        error: 'Value mismatch'
      };
    }
  } catch (error) {
    return {
      healthy: false,
      type: redis ? 'redis' : 'memory',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Initialize cache on module load
if (typeof globalThis !== 'undefined' && !(globalThis as any).__CACHE_INITIALIZED__) {
  (globalThis as any).__CACHE_INITIALIZED__ = true;
  initCache().catch(error => {
    log('error', 'cache_init_failed', { route: 'cache', status: 500, error: error instanceof Error ? error.message : 'Unknown error' });
  });
}