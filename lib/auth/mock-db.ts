import bcrypt from 'bcryptjs';

// Mock database for development when PostgreSQL is not available
export interface MockUser {
  id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  full_name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  failed_login_attempts: number;
  locked_until?: Date;
  metadata: Record<string, any>;
}

// Initialize with demo users
const mockUsers: Map<string, MockUser> = new Map();

// Pre-computed hash for 'demo123' using bcrypt with 10 rounds
const DEMO_PASSWORD_HASH = '$2a$10$.5.ZhFr8IBsrKBjOL.6HDu6PSfNYQgK4WMBtj/2yzd6s9a8RMbFxW';

// Create demo users synchronously
const demoUsers = [
  { id: 1, email: 'admin@arka.com', role: 'admin' as const, full_name: 'Admin User' },
  { id: 2, email: 'manager@arka.com', role: 'manager' as const, full_name: 'Manager User' },
  { id: 3, email: 'operator@arka.com', role: 'operator' as const, full_name: 'Operator User' },
  { id: 4, email: 'viewer@arka.com', role: 'viewer' as const, full_name: 'Viewer User' }
];

// Initialize users synchronously on module load
for (const user of demoUsers) {
  mockUsers.set(user.email, {
    ...user,
    password_hash: DEMO_PASSWORD_HASH,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    failed_login_attempts: 0,
    metadata: {}
  });
}

// Mock revoked tokens
const revokedTokens: Set<string> = new Set();

// Mock audit logs
interface AuditLog {
  id: number;
  timestamp: Date;
  trace_id?: string;
  user_id?: number;
  user_email_hash?: string;
  ip_hash?: string;
  action: string;
  resource?: string;
  method?: string;
  status_code?: number;
  response_time_ms?: number;
  error_message?: string;
  metadata?: Record<string, any>;
}

const auditLogs: AuditLog[] = [];
let auditLogIdCounter = 1;

// Mock database functions
export const mockDb = {
  // User operations
  async getUserByEmail(email: string): Promise<MockUser | null> {
    return mockUsers.get(email) || null;
  },

  async getUserById(id: number): Promise<MockUser | null> {
    for (const user of mockUsers.values()) {
      if (user.id === id) return user;
    }
    return null;
  },

  async updateUserLoginInfo(email: string, success: boolean): Promise<void> {
    const user = mockUsers.get(email);
    if (!user) return;

    if (success) {
      user.last_login_at = new Date();
      user.failed_login_attempts = 0;
    } else {
      user.failed_login_attempts++;
      // Lock account after 5 failed attempts for 15 minutes
      if (user.failed_login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000);
      }
    }
    user.updated_at = new Date();
  },

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = mockUsers.get(email);
    if (!user) return false;
    return bcrypt.compare(password, user.password_hash);
  },

  // Token operations
  async revokeToken(jti: string, userId: number, expiresAt: Date, reason: string): Promise<void> {
    revokedTokens.add(jti);
    // Auto-cleanup after expiry
    const ttl = expiresAt.getTime() - Date.now();
    if (ttl > 0) {
      setTimeout(() => revokedTokens.delete(jti), ttl);
    }
  },

  async isTokenRevoked(jti: string): Promise<boolean> {
    return revokedTokens.has(jti);
  },

  // Audit operations
  async logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    auditLogs.push({
      id: auditLogIdCounter++,
      timestamp: new Date(),
      ...entry
    });

    // Keep only last 1000 logs in memory
    if (auditLogs.length > 1000) {
      auditLogs.shift();
    }
  },

  async getFailedLoginAttempts(ipHash: string, emailHash: string, since: Date): Promise<number> {
    return auditLogs.filter(log =>
      log.action === 'login_failed' &&
      log.timestamp >= since &&
      (log.ip_hash === ipHash || log.user_email_hash === emailHash)
    ).length;
  },

  // Project assignment operations
  async getUserProjectAssignments(userId: number): Promise<number[]> {
    // Return mock project IDs for testing
    const user = await this.getUserById(userId);
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return [1, 2, 3, 4, 5]; // Admin sees all projects
      case 'manager':
        return [1, 2, 3]; // Manager sees some projects
      case 'operator':
        return [1, 2]; // Operator sees assigned projects
      case 'viewer':
        return [1]; // Viewer sees limited projects
      default:
        return [];
    }
  }
};

// Helper to check if mock DB should be used
export function shouldUseMockDb(): boolean {
  // Use mock DB if DATABASE_URL is not set or if explicitly requested
  return !process.env.DATABASE_URL || process.env.USE_MOCK_DB === 'true';
}