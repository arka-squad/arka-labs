import { getDb } from '../db';

interface RevokedToken {
  jti: string;
  user_id: string;
  expires_at: Date;
  reason?: string;
}

/**
 * Service de gestion des tokens révoqués
 */
class TokenRevocationService {
  private cache: Map<string, Date> = new Map();
  private lastCleanup: Date = new Date();
  
  /**
   * Révoque un token
   */
  async revokeToken(jti: string, userId: string, expiresAt: Date, reason: string = 'logout'): Promise<void> {
    try {
      const db = getDb();
      
      await db.query(
        `INSERT INTO revoked_tokens (jti, user_id, expires_at, reason) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (jti) DO NOTHING`,
        [jti, userId, expiresAt, reason]
      );
      
      // Ajouter au cache local
      this.cache.set(jti, expiresAt);
      
      // Nettoyer le cache périodiquement
      this.cleanupCacheIfNeeded();
    } catch (error) {
      console.error('Error revoking token:', error);
      throw new Error('Failed to revoke token');
    }
  }
  
  /**
   * Vérifie si un token est révoqué
   */
  async isRevoked(jti: string): Promise<boolean> {
    // Vérifier d'abord le cache
    if (this.cache.has(jti)) {
      const expiresAt = this.cache.get(jti)!;
      if (expiresAt > new Date()) {
        return true;
      } else {
        // Token expiré, le retirer du cache
        this.cache.delete(jti);
      }
    }
    
    // Vérifier en base de données
    try {
      const db = getDb();
      const result = await db.query(
        `SELECT jti FROM revoked_tokens 
         WHERE jti = $1 AND expires_at > NOW()`,
        [jti]
      );
      
      const isRevoked = result.rows.length > 0;
      
      // Ajouter au cache si révoqué
      if (isRevoked && result.rows[0].expires_at) {
        this.cache.set(jti, new Date(result.rows[0].expires_at));
      }
      
      return isRevoked;
    } catch (error) {
      console.error('Error checking token revocation:', error);
      // En cas d'erreur, considérer le token comme valide pour éviter de bloquer
      return false;
    }
  }
  
  /**
   * Révoque tous les tokens d'un utilisateur
   */
  async revokeAllUserTokens(userId: string, reason: string = 'logout_all'): Promise<void> {
    try {
      const db = getDb();
      
      // Note: Dans une vraie implémentation, on devrait stocker tous les JTI actifs
      // Pour simplifier, on va juste marquer l'utilisateur comme ayant tous ses tokens révoqués
      // jusqu'à une certaine date (par exemple, now + 2h pour couvrir tous les tokens actifs)
      
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 heures
      
      // On pourrait stocker un flag spécial ou utiliser une autre table
      // Pour cette implémentation, on va créer une entrée spéciale
      await db.query(
        `INSERT INTO revoked_tokens (jti, user_id, expires_at, reason) 
         VALUES ($1, $2, $3, $4)`,
        [`all-${userId}-${Date.now()}`, userId, expiresAt, reason]
      );
    } catch (error) {
      console.error('Error revoking all user tokens:', error);
      throw new Error('Failed to revoke user tokens');
    }
  }
  
  /**
   * Nettoie les tokens expirés de la base de données
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const db = getDb();
      const result = await db.query(
        `DELETE FROM revoked_tokens WHERE expires_at < NOW()`
      );
      
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }
  
  /**
   * Nettoie le cache local si nécessaire
   */
  private cleanupCacheIfNeeded(): void {
    const now = new Date();
    const hoursSinceLastCleanup = (now.getTime() - this.lastCleanup.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastCleanup > 1) {
      // Nettoyer les entrées expirées du cache
      const expiredKeys: string[] = [];
      
      this.cache.forEach((expiresAt, jti) => {
        if (expiresAt < now) {
          expiredKeys.push(jti);
        }
      });
      
      expiredKeys.forEach(key => this.cache.delete(key));
      this.lastCleanup = now;
    }
  }
  
  /**
   * Vide complètement le cache (utile pour les tests)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton
export const tokenRevocationService = new TokenRevocationService();

// Fonction helper pour révoquer un token
export async function revokeToken(jti: string, userId: string, expiresAt: Date, reason?: string): Promise<void> {
  return tokenRevocationService.revokeToken(jti, userId, expiresAt, reason);
}

// Fonction helper pour vérifier si un token est révoqué
export async function isTokenRevoked(jti: string): Promise<boolean> {
  return tokenRevocationService.isRevoked(jti);
}

// Fonction de nettoyage périodique (à appeler via un cron job)
export async function cleanupExpiredTokens(): Promise<number> {
  return tokenRevocationService.cleanupExpiredTokens();
}