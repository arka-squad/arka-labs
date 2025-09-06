import { randomBytes, createHash } from 'crypto';

interface Session { provider: string; keyHash: string; createdAt: number; }

export class SessionVault {
  private sessions: Map<string, Session>;
  public ttlSeconds: number;

  constructor(ttlSeconds = Number(process.env.BYOK_EXCHANGE_TTL_SEC) || 3600) {
    this.sessions = new Map();
    this.ttlSeconds = ttlSeconds;
  }

  createSession(provider: string, key: string): string {
    const id = randomBytes(16).toString('hex');
    const keyHash = createHash('sha256').update(key + process.env.SESSION_SALT).digest('hex');
    this.sessions.set(id, { provider, keyHash, createdAt: Date.now() });
    return id;
  }

  revokeSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  getSession(id: string): Session | null {
    const session = this.sessions.get(id);
    if (!session) return null;
    if ((Date.now() - session.createdAt) / 1000 > this.ttlSeconds) {
      this.sessions.delete(id);
      return null;
    }
    return session;
  }
}

let vault: SessionVault;
export function getSessionVault(): SessionVault {
  if (!vault) {
    vault = new SessionVault();
  }
  return vault;
}
