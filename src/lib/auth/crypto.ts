import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Configuration
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_COST || '12');
const HASH_SECRET = process.env.IP_HASH_SECRET || 'arka-hash-secret-dev';

/**
 * Hash un mot de passe avec bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Vérifie un mot de passe contre son hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Hash une donnée sensible avec SHA256 (pour IP, email, etc.)
 */
export function hashSensitiveData(data: string, salt?: string): string {
  const secret = salt || HASH_SECRET;
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * Génère un token aléatoire sécurisé
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash une adresse IP pour l'audit (privacy)
 */
export function hashIP(ip: string): string {
  return hashSensitiveData(ip, 'ip-salt');
}

/**
 * Hash un email pour l'audit (privacy)
 */
export function hashEmail(email: string): string {
  return hashSensitiveData(email.toLowerCase(), 'email-salt');
}

/**
 * Hash un user agent pour l'audit
 */
export function hashUserAgent(userAgent: string): string {
  return hashSensitiveData(userAgent, 'ua-salt');
}

/**
 * Extrait l'IP cliente d'une requête (gère les proxies)
 */
export function getClientIP(req: any): string {
  // Check for common proxy headers
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for peut contenir plusieurs IPs, on prend la première
    return forwarded.split(',')[0].trim();
  }
  
  // Autres headers de proxy
  return req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         '0.0.0.0';
}

/**
 * Valide le format d'un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide la force d'un mot de passe
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Génère un UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}