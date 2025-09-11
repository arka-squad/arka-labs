import { NextRequest, NextResponse } from 'next/server';
import { jwtManager, generateTokenPair } from '../../../../lib/auth/jwt';
import { isTokenRevoked, revokeToken } from '../../../../lib/auth/token-revocation';
import { getDb } from '../../../../lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();
  
  try {
    // Parse le body pour récupérer le refresh token
    const body = await req.json().catch(() => ({}));
    
    // Récupérer le refresh token du body ou des cookies
    const refreshToken = body.refresh_token || 
                        req.cookies.get('arka_refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'Refresh token requis',
          trace_id: traceId
        },
        { status: 422 }
      );
    }
    
    // Vérifier et décoder le refresh token
    let refreshPayload;
    try {
      refreshPayload = jwtManager.verifyRefreshToken(refreshToken);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'invalid_token',
          message: 'Refresh token invalide ou expiré',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Vérifier si le refresh token est révoqué
    if (refreshPayload.jti && await isTokenRevoked(refreshPayload.jti)) {
      return NextResponse.json(
        {
          error: 'revoked_token',
          message: 'Refresh token révoqué',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Récupérer l'utilisateur depuis la base de données
    const db = getDb();
    const result = await db.query(
      `SELECT id, email, role, full_name, is_active 
       FROM users 
       WHERE id = $1`,
      [refreshPayload.sub]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'user_not_found',
          message: 'Utilisateur non trouvé',
          trace_id: traceId
        },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    // Vérifier si l'utilisateur est actif
    if (!user.is_active) {
      return NextResponse.json(
        {
          error: 'account_disabled',
          message: 'Compte désactivé',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Révoquer l'ancien refresh token
    if (refreshPayload.jti && refreshPayload.exp) {
      await revokeToken(
        refreshPayload.jti,
        refreshPayload.sub,
        new Date(refreshPayload.exp * 1000),
        'refresh'
      );
    }
    
    // Générer une nouvelle paire de tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Créer la réponse
    const response = NextResponse.json({
      token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_at: tokens.accessExpiry.toISOString(),
      refresh_expires_at: tokens.refreshExpiry.toISOString()
    });
    
    // Mettre à jour les cookies
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
    console.error('Token refresh error:', error);
    
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Erreur lors du rafraîchissement du token',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
}