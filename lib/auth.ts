import jwt, { JwtPayload } from 'jsonwebtoken';
import { getEnv } from './env';

export type Role = 'viewer' | 'editor' | 'admin' | 'owner';

export interface JwtUser {
  sub: string;
  role: Role;
}

const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = getEnv();

export function signToken(user: JwtUser) {
  return jwt.sign(
    { sub: user.sub, role: user.role },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '1h',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }
  );
}

export function verifyToken(token: string): JwtUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as any;
    if (typeof decoded.sub !== 'string' || typeof decoded.role !== 'string') return null;
    return { sub: decoded.sub, role: decoded.role as Role };
  } catch {
    return null;
  }
}
