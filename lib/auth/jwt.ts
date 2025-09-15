import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface JWTPayload {
  sub: string; // user id
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  jti: string; // unique token id
  iat?: number;
  exp?: number;
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'arka-jwt-secret-dev-2025-09';
const JWT_KID = process.env.JWT_KID || 'arka-2025-09';
const JWT_SECRET_PREVIOUS = process.env.JWT_SECRET_PREVIOUS;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '2h';
const REFRESH_EXPIRY = process.env.REFRESH_EXPIRY || '7d';

// Manager pour rotation des secrets
class JWTSecretManager {
  private keys: Map<string, { current: string; previous?: string }> = new Map();
  
  constructor() {
    this.loadKeys();
  }
  
  private loadKeys() {
    this.keys.set(JWT_KID, {
      current: JWT_SECRET,
      previous: JWT_SECRET_PREVIOUS
    });
  }
  
  signToken(payload: JWTPayload): string {
    const keyManager = this.keys.get(JWT_KID);
    if (!keyManager) {
      throw new Error('JWT key not configured');
    }
    
    // Ajouter JTI si pas présent
    if (!payload.jti) {
      payload.jti = crypto.randomUUID();
    }
    
    return jwt.sign(payload, keyManager.current, {
      algorithm: 'HS256',
      expiresIn: JWT_EXPIRY,
      keyid: JWT_KID  // Ajouter le kid dans l'en-tête
    } as jwt.SignOptions);
  }
  
  signRefreshToken(userId: string): string {
    const keyManager = this.keys.get(JWT_KID);
    if (!keyManager) {
      throw new Error('JWT key not configured');
    }
    
    const payload: RefreshTokenPayload = {
      sub: userId,
      jti: crypto.randomUUID(),
      type: 'refresh'
    };
    
    return jwt.sign(payload, keyManager.current, {
      algorithm: 'HS256',
      expiresIn: REFRESH_EXPIRY,
      keyid: JWT_KID  // Ajouter le kid dans l'en-tête
    } as jwt.SignOptions);
  }
  
  verifyToken(token: string): JWTPayload {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      throw new Error('Invalid token format');
    }
    
    const kid = decoded.header.kid as string;
    const keyManager = this.keys.get(kid);
    
    if (!keyManager) {
      throw new Error('Unknown key ID');
    }
    
    // Try current secret first, then previous for grace period
    try {
      return jwt.verify(token, keyManager.current, {
        algorithms: ['HS256'],
        clockTolerance: 60 // 60 seconds clock skew tolerance
      }) as JWTPayload;
    } catch (error) {
      if (keyManager.previous) {
        try {
          return jwt.verify(token, keyManager.previous, {
            algorithms: ['HS256'],
            clockTolerance: 60
          }) as JWTPayload;
        } catch {
          throw error; // Throw original error
        }
      }
      throw error;
    }
  }
  
  verifyRefreshToken(token: string): RefreshTokenPayload {
    const payload = this.verifyToken(token) as any;
    if (payload.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }
    return payload as RefreshTokenPayload;
  }
  
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const jwtManager = new JWTSecretManager();

// Helper functions
export function generateTokenPair(user: {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
}) {
  const jti = crypto.randomUUID();
  
  const accessToken = jwtManager.signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    jti
  });
  
  const refreshToken = jwtManager.signRefreshToken(user.id);
  
  // Calculate expiry times
  const now = new Date();
  const accessExpiry = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
  const refreshExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return {
    accessToken,
    refreshToken,
    jti,
    accessExpiry,
    refreshExpiry
  };
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}