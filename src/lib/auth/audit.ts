import { getDb } from '../db';
import { hashIP, hashEmail, hashUserAgent, getClientIP } from './crypto';
import { User } from './rbac';

export interface AuditLogEntry {
  timestamp: Date;
  user_id?: string;
  email_hash?: string;
  role?: string;
  route: string;
  method: string;
  status_code: number;
  trace_id: string;
  jti?: string;
  ip_hash: string;
  user_agent_hash?: string;
  error_code?: string;
  duration_ms?: number;
}

/**
 * Service d'audit logging pour l'authentification
 */
class AuditService {
  private queue: AuditLogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isEnabled: boolean = process.env.AUTH_AUDIT_ENABLED !== 'false';
  
  constructor() {
    // Démarrer le flush automatique toutes les 5 secondes
    if (this.isEnabled) {
      this.startAutoFlush();
    }
  }
  
  /**
   * Enregistre un événement d'audit
   */
  async log(entry: AuditLogEntry): Promise<void> {
    if (!this.isEnabled) return;
    
    // Ajouter à la queue
    this.queue.push(entry);
    
    // Flush si la queue est trop grande
    if (this.queue.length >= 10) {
      await this.flush();
    }
  }
  
  /**
   * Enregistre un événement d'authentification
   */
  async logAuthEvent(
    req: any,
    statusCode: number,
    errorCode?: string,
    errorMessage?: string
  ): Promise<void> {
    const startTime = req._startTime || Date.now();
    const duration = Date.now() - startTime;
    
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      user_id: req.user?.id,
      email_hash: req.user?.email ? hashEmail(req.user.email) : undefined,
      role: req.user?.role,
      route: req.originalUrl || req.url,
      method: req.method,
      status_code: statusCode,
      trace_id: req.trace_id || req.headers['x-trace-id'] || 'unknown',
      jti: req.user?.jti,
      ip_hash: hashIP(getClientIP(req)),
      user_agent_hash: req.headers['user-agent'] ? hashUserAgent(req.headers['user-agent']) : undefined,
      error_code: errorCode,
      duration_ms: duration
    };
    
    await this.log(entry);
  }
  
  /**
   * Enregistre une tentative de connexion
   */
  async logLoginAttempt(
    email: string,
    success: boolean,
    ip: string,
    userAgent?: string,
    errorCode?: string
  ): Promise<void> {
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      email_hash: hashEmail(email),
      route: '/api/auth/login',
      method: 'POST',
      status_code: success ? 200 : 401,
      trace_id: crypto.randomUUID(),
      ip_hash: hashIP(ip),
      user_agent_hash: userAgent ? hashUserAgent(userAgent) : undefined,
      error_code: errorCode
    };
    
    await this.log(entry);
  }
  
  /**
   * Vide la queue dans la base de données
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    
    const toFlush = [...this.queue];
    this.queue = [];
    
    try {
      const db = getDb();
      
      // Préparer les valeurs pour l'insertion en batch
      const values = toFlush.map(entry => [
        entry.timestamp,
        entry.user_id,
        entry.email_hash,
        entry.role,
        entry.route,
        entry.method,
        entry.status_code,
        entry.trace_id,
        entry.jti,
        entry.ip_hash,
        entry.user_agent_hash,
        entry.error_code,
        entry.duration_ms
      ]);
      
      // Construire la requête d'insertion batch
      const placeholders = values.map((_, i) => {
        const base = i * 13;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13})`;
      }).join(', ');
      
      const flatValues = values.flat();
      
      await db.query(
        `INSERT INTO auth_audit_logs 
         (timestamp, user_id, email_hash, role, route, method, status_code, trace_id, jti, ip_hash, user_agent_hash, error_code, duration_ms)
         VALUES ${placeholders}`,
        flatValues
      );
      
      console.log(`✅ Flushed ${toFlush.length} audit log entries`);
    } catch (error) {
      console.error('Error flushing audit logs:', error);
      // Remettre les entrées dans la queue en cas d'erreur
      this.queue = [...toFlush, ...this.queue];
    }
  }
  
  /**
   * Démarre le flush automatique
   */
  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush().catch(console.error);
    }, 5000); // Flush toutes les 5 secondes
  }
  
  /**
   * Arrête le flush automatique
   */
  stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
  
  /**
   * Récupère les logs d'audit pour un utilisateur
   */
  async getUserAuditLogs(userId: string, limit: number = 100): Promise<any[]> {
    try {
      const db = getDb();
      const result = await db.query(
        `SELECT timestamp, route, method, status_code, error_code, duration_ms
         FROM auth_audit_logs
         WHERE user_id = $1
         ORDER BY timestamp DESC
         LIMIT $2`,
        [userId, limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      return [];
    }
  }
  
  /**
   * Récupère les tentatives de connexion échouées pour une IP
   */
  async getFailedLoginAttempts(ip: string, windowMinutes: number = 15): Promise<number> {
    try {
      const db = getDb();
      const ipHash = hashIP(ip);
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
      
      const result = await db.query(
        `SELECT COUNT(*) as count
         FROM auth_audit_logs
         WHERE ip_hash = $1
           AND route = '/api/auth/login'
           AND status_code = 401
           AND timestamp > $2`,
        [ipHash, windowStart]
      );
      
      return parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error counting failed login attempts:', error);
      return 0;
    }
  }
  
  /**
   * Nettoie les vieux logs (à appeler via un cron job)
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const db = getDb();
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const result = await db.query(
        `DELETE FROM auth_audit_logs WHERE timestamp < $1`,
        [cutoffDate]
      );
      
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
      return 0;
    }
  }
}

// Export singleton
export const auditService = new AuditService();

// Helper functions
export async function logAuditEvent(
  req: any,
  statusCode: number,
  eventType: string,
  errorMessage?: string
): Promise<void> {
  return auditService.logAuthEvent(req, statusCode, eventType, errorMessage);
}

export async function logLoginAttempt(
  email: string,
  success: boolean,
  req: any
): Promise<void> {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'];
  const errorCode = success ? undefined : 'invalid_credentials';
  
  return auditService.logLoginAttempt(email, success, ip, userAgent, errorCode);
}

// Cleanup à l'arrêt de l'application
process.on('beforeExit', () => {
  auditService.flush().catch(console.error);
  auditService.stopAutoFlush();
});