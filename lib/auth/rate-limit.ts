import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from './crypto';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: NextRequest) => string;
  message?: string | object;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  hits: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitStore> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    // Nettoyer les entrées expirées toutes les minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }
  
  /**
   * Vérifie et incrémente le compteur pour une clé donnée
   */
  check(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    let entry = this.store.get(key);
    
    // Si l'entrée n'existe pas ou a expiré, créer une nouvelle
    if (!entry || entry.resetTime <= now) {
      entry = {
        hits: 0,
        resetTime: now + config.windowMs
      };
      this.store.set(key, entry);
    }
    
    // Incrémenter le compteur
    entry.hits++;
    
    // Calculer les requêtes restantes
    const remaining = Math.max(0, config.maxRequests - entry.hits);
    const allowed = entry.hits <= config.maxRequests;
    
    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    };
  }
  
  /**
   * Réinitialise le compteur pour une clé
   */
  reset(key: string): void {
    this.store.delete(key);
  }
  
  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.store.forEach((entry, key) => {
      if (entry.resetTime <= now) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.store.delete(key));
  }
  
  /**
   * Arrête le nettoyage automatique
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Instance globale du rate limiter
const globalRateLimiter = new RateLimiter();

/**
 * Middleware de rate limiting pour Next.js App Router
 */
export function rateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    return async function rateLimitedHandler(
      req: NextRequest,
      context?: any
    ): Promise<NextResponse> {
      // Générer la clé pour ce client
      const key = config.keyGenerator ? config.keyGenerator(req) : getClientIP(req);
      
      // Vérifier le rate limit
      const { allowed, remaining, resetTime } = globalRateLimiter.check(key, config);
      
      if (!allowed) {
        // Calculer le temps restant avant reset
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        
        // Créer le message d'erreur
        const message = config.message || {
          error: 'rate_limited',
          message: 'Trop de requêtes',
          retry_after: retryAfter
        };
        
        // Créer la réponse d'erreur
        const response = NextResponse.json(message, { status: 429 });
        
        // Ajouter les headers de rate limiting
        response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
        response.headers.set('Retry-After', retryAfter.toString());
        
        return response;
      }
      
      // Exécuter le handler
      const response = await handler(req, context);
      
      // Ajouter les headers de rate limiting à la réponse
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
      
      // Si configuré, ne pas compter les requêtes réussies/échouées
      if (
        (config.skipSuccessfulRequests && response.status < 400) ||
        (config.skipFailedRequests && response.status >= 400)
      ) {
        // Décrémenter le compteur
        const entry = globalRateLimiter['store'].get(key);
        if (entry) {
          entry.hits--;
        }
      }
      
      return response;
    };
  };
}

/**
 * Configuration prédéfinies pour différents types de rate limiting
 */
export const rateLimiters = {
  // Rate limit global par IP
  global: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: {
      error: 'rate_limited',
      message: 'Trop de requêtes depuis cette IP',
      retry_after: 60
    }
  },
  
  // Rate limit pour les tentatives de connexion
  authAttempts: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req: NextRequest) => {
      // Combiner IP et email pour le rate limiting
      const ip = getClientIP(req);
      const body = req.body as any;
      const email = body?.email || 'no-email';
      return `${ip}:${email}`;
    },
    message: {
      error: 'rate_limited',
      message: 'Trop de tentatives de connexion',
      retry_after: 900
    },
    skipSuccessfulRequests: true // Ne pas compter les connexions réussies
  },
  
  // Rate limit pour les appels API sensibles
  apiStrict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: {
      error: 'rate_limited',
      message: 'Limite d\'API atteinte',
      retry_after: 60
    }
  },
  
  // Rate limit pour les créations de ressources
  createResource: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: {
      error: 'rate_limited',
      message: 'Trop de créations de ressources',
      retry_after: 60
    }
  }
};

/**
 * Helper pour appliquer un rate limiter prédéfini
 */
export function applyRateLimit(type: keyof typeof rateLimiters) {
  return rateLimit(rateLimiters[type]);
}

/**
 * Rate limiter avec backoff exponentiel pour les erreurs répétées
 */
export class ExponentialBackoffRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number; backoffUntil: number }> = new Map();
  private maxAttempts: number;
  private baseDelayMs: number;
  private maxDelayMs: number;
  
  constructor(maxAttempts: number = 5, baseDelayMs: number = 1000, maxDelayMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
  }
  
  /**
   * Vérifie si une tentative est autorisée
   */
  checkAttempt(key: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt) {
      // Première tentative
      this.attempts.set(key, { count: 1, lastAttempt: now, backoffUntil: 0 });
      return { allowed: true };
    }
    
    // Vérifier si on est toujours en backoff
    if (attempt.backoffUntil > now) {
      return {
        allowed: false,
        retryAfter: Math.ceil((attempt.backoffUntil - now) / 1000)
      };
    }
    
    // Réinitialiser si trop de temps s'est écoulé (5 minutes)
    if (now - attempt.lastAttempt > 5 * 60 * 1000) {
      this.attempts.set(key, { count: 1, lastAttempt: now, backoffUntil: 0 });
      return { allowed: true };
    }
    
    // Incrémenter le compteur
    attempt.count++;
    attempt.lastAttempt = now;
    
    // Vérifier si on a atteint la limite
    if (attempt.count > this.maxAttempts) {
      // Calculer le délai avec backoff exponentiel
      const delay = Math.min(
        this.baseDelayMs * Math.pow(2, attempt.count - this.maxAttempts),
        this.maxDelayMs
      );
      
      attempt.backoffUntil = now + delay;
      
      return {
        allowed: false,
        retryAfter: Math.ceil(delay / 1000)
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Réinitialise les tentatives pour une clé
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  /**
   * Nettoie les vieilles entrées
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.attempts.forEach((attempt, key) => {
      // Supprimer les entrées de plus de 1 heure
      if (now - attempt.lastAttempt > 60 * 60 * 1000) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.attempts.delete(key));
  }
}

// Instance globale pour le backoff exponentiel
export const authBackoff = new ExponentialBackoffRateLimiter(5, 1000, 60000);

// Nettoyer périodiquement
setInterval(() => {
  authBackoff.cleanup();
}, 5 * 60 * 1000); // Toutes les 5 minutes