import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { verifyPassword, isValidEmail, getClientIP } from '../../../../lib/auth/crypto';
import { generateTokenPair } from '../../../../lib/auth/jwt';
import { logLoginAttempt, auditService } from '../../../../lib/auth/audit';
import { getUserPermissions } from '../../../../lib/auth/rbac';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();
  
  try {
    // Parse le body
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'Corps de requête invalide',
          trace_id: traceId
        },
        { status: 400 }
      );
    }
    
    const { email, password } = body;
    
    // Validation des entrées
    if (!email || !password) {
      await logLoginAttempt(email || 'unknown', false, req);
      
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Email et mot de passe requis',
          trace_id: traceId
        },
        { status: 422 }
      );
    }
    
    if (!isValidEmail(email)) {
      await logLoginAttempt(email, false, req);
      
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Format email invalide',
          trace_id: traceId
        },
        { status: 422 }
      );
    }
    
    // Vérifier le rate limiting manuel (nombre de tentatives échouées)
    const failedAttempts = await auditService.getFailedLoginAttempts(
      getClientIP(req),
      15 // fenêtre de 15 minutes
    );
    
    if (failedAttempts >= 5) {
      await logLoginAttempt(email, false, req);
      
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
          retry_after: 900
        },
        { status: 429 }
      );
    }
    
    // Rechercher l'utilisateur
    const db = getDb();
    const result = await db.query(
      `SELECT id, email, password_hash, role, full_name, is_active 
       FROM users 
       WHERE email = $1`,
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      await logLoginAttempt(email, false, req);
      
      return NextResponse.json(
        {
          error: 'invalid_credentials',
          message: 'Email ou mot de passe incorrect',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    const user = result.rows[0];
    
    // Vérifier si l'utilisateur est actif
    if (!user.is_active) {
      await logLoginAttempt(email, false, req);
      
      return NextResponse.json(
        {
          error: 'account_disabled',
          message: 'Compte désactivé',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      await logLoginAttempt(email, false, req);
      
      return NextResponse.json(
        {
          error: 'invalid_credentials',
          message: 'Email ou mot de passe incorrect',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Générer les tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Mettre à jour last_login_at
    await db.query(
      `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
      [user.id]
    );
    
    // Log de succès
    await logLoginAttempt(email, true, req);
    
    // Récupérer les permissions de l'utilisateur
    const permissions = getUserPermissions(user.role);
    
    // Créer la réponse
    const response = NextResponse.json({
      token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        permissions
      },
      expires_at: tokens.accessExpiry.toISOString(),
      refresh_expires_at: tokens.refreshExpiry.toISOString()
    });
    
    // Ajouter le cookie sécurisé
    response.cookies.set('arka_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 // 2 heures
    });
    
    response.cookies.set('arka_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 jours
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Erreur lors de la connexion',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
}