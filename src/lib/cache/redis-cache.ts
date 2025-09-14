/**
 * Cache Manager - B28 Phase 3 Performance Optimization
 * Redis + Local fallback pour performance < 100ms P95
 */

// Note: Redis optionnel, fallback local pour développement
type Redis = any;

interface CacheEntry {
  value: any;
  expires: number;
}

class CacheManager {
  private redis: Redis | null = null;
  private localCache: Map<string, CacheEntry>;
  private isRedisAvailable = false;

  constructor() {
    // Local cache toujours disponible
    this.localCache = new Map();

    // Redis optionnel (production)
    this.initializeRedis();

    // Cleanup des entrées expirées toutes les minutes
    setInterval(() => this.cleanup(), 60000);
  }

  private async initializeRedis() {
    try {
      if (process.env.REDIS_URL && typeof window === 'undefined') {
        // Dynamically import Redis only on server side
        const { Redis } = await import('ioredis');
        this.redis = new Redis(process.env.REDIS_URL);
        this.isRedisAvailable = true;
        console.log('✅ Redis cache initialized');
      } else {
        console.log('🔄 Redis not available, using local cache');
      }
    } catch (error) {
      console.log('⚠️ Redis initialization failed, using local cache:', error.message);
      this.isRedisAvailable = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      // Try Redis first if available
      if (this.redis && this.isRedisAvailable) {
        try {
          const value = await this.redis.get(key);
          if (value) {
            console.log(`📊 Cache HIT (Redis): ${key} - ${Date.now() - startTime}ms`);
            return JSON.parse(value);
          }
        } catch (error) {
          console.log('⚠️ Redis get error:', error.message);
          this.isRedisAvailable = false;
        }
      }

      // Fallback to local cache
      const cached = this.localCache.get(key);
      if (cached && cached.expires > Date.now()) {
        console.log(`📊 Cache HIT (Local): ${key} - ${Date.now() - startTime}ms`);
        return cached.value;
      }

      console.log(`📊 Cache MISS: ${key} - ${Date.now() - startTime}ms`);
      return null;

    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    const startTime = Date.now();

    try {
      const serialized = JSON.stringify(value);

      // Set in Redis if available
      if (this.redis && this.isRedisAvailable) {
        try {
          await this.redis.setex(key, ttl, serialized);
          console.log(`📊 Cache SET (Redis): ${key} - ${Date.now() - startTime}ms`);
        } catch (error) {
          console.log('⚠️ Redis set error:', error.message);
          this.isRedisAvailable = false;
        }
      }

      // Always set in local cache
      this.localCache.set(key, {
        value,
        expires: Date.now() + (ttl * 1000)
      });

      if (!this.isRedisAvailable) {
        console.log(`📊 Cache SET (Local): ${key} - ${Date.now() - startTime}ms`);
      }

    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Invalidate Redis keys
      if (this.redis && this.isRedisAvailable) {
        try {
          const keys = await this.redis.keys(pattern);
          if (keys.length > 0) {
            await this.redis.del(...keys);
            console.log(`📊 Cache INVALIDATE (Redis): ${keys.length} keys - ${Date.now() - startTime}ms`);
          }
        } catch (error) {
          console.log('⚠️ Redis invalidate error:', error.message);
          this.isRedisAvailable = false;
        }
      }

      // Invalidate local cache
      const patternRegex = new RegExp(pattern.replace('*', '.*'));
      let invalidatedCount = 0;

      for (const key of this.localCache.keys()) {
        if (patternRegex.test(key)) {
          this.localCache.delete(key);
          invalidatedCount++;
        }
      }

      if (!this.isRedisAvailable && invalidatedCount > 0) {
        console.log(`📊 Cache INVALIDATE (Local): ${invalidatedCount} keys - ${Date.now() - startTime}ms`);
      }

    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.localCache.entries()) {
      if (entry.expires < now) {
        this.localCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cache cleanup: ${cleanedCount} expired entries removed`);
    }
  }

  // Métriques pour monitoring
  getStats() {
    return {
      localCacheSize: this.localCache.size,
      redisAvailable: this.isRedisAvailable,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const cache = new CacheManager();

/**
 * Decorator pour cache automatique sur les fonctions
 * Usage: @Cacheable(3600) // TTL en secondes
 */
export function Cacheable(ttl: number = 3600) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const className = target.constructor.name;
      const cacheKey = `${className}:${propertyName}:${JSON.stringify(args)}`;

      // Try cache first
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute and cache
      const result = await originalMethod.apply(this, args);
      await cache.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Hook pour invalidation automatique de cache
 */
export function InvalidateCache(pattern: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // Invalidate cache après modification
      await cache.invalidate(pattern);

      return result;
    };

    return descriptor;
  };
}

export default cache;