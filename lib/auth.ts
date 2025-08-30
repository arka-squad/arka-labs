import jwt from 'jsonwebtoken';

export type Role = 'viewer' | 'operator' | 'owner';
export interface User {
  id: string;
  email: string;
  role: Role;
}

const SECRET = process.env.JWT_SECRET || process.env.AUTH_JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT secret missing');
}

export function signToken(user: User) {
  return jwt.sign(user, SECRET, { expiresIn: '1h' });
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, SECRET) as User;
  } catch {
    return null;
  }
}
