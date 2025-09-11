import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, jwtManager } from '../../../../lib/auth/jwt';
import { revokeToken } from '../../../../lib/auth/token-revocation';
import { logAuditEvent } from '../../../../lib/auth/audit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();
  
  try {
    // Extraire le token du header ou des cookies
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || '') || 
                 req.cookies.get('arka_access_token')?.value;
    
    if (token) {
      try {
        // Décoder le token pour obtenir le JTI et l'expiration
        const payload = jwtManager.verifyToken(token);
        
        if (payload.jti && payload.exp) {
          // Révoquer le token
          await revokeToken(
            payload.jti,
            payload.sub,
            new Date(payload.exp * 1000),
            'logout'
          );
        }
        
        // Log de l'événement
        await logAuditEvent(
          Object.assign(req, { user: payload }),
          204,
          'logout_success'
        );
      } catch (error) {
        // Même si le token est invalide, on continue le logout
        console.error('Error decoding token during logout:', error);
      }
    }
    
    // Créer la réponse
    const response = new NextResponse(null, { status: 204 });
    
    // Supprimer les cookies avec les bonnes options
    const cookieOptions = { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax' as const, 
      path: '/', 
      maxAge: 0 
    };
    
    response.cookies.set('arka_access_token', '', cookieOptions);
    response.cookies.set('arka_refresh_token', '', cookieOptions);
    response.cookies.set('arka_auth', '', cookieOptions); // Compatibilité avec l'ancien système
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    
    // Même en cas d'erreur, on supprime les cookies
    const response = NextResponse.json(
      {
        error: 'internal_error',
        message: 'Erreur lors de la déconnexion',
        trace_id: traceId
      },
      { status: 500 }
    );
    
    const cookieOptions = { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax' as const, 
      path: '/', 
      maxAge: 0 
    };
    
    response.cookies.set('arka_access_token', '', cookieOptions);
    response.cookies.set('arka_refresh_token', '', cookieOptions);
    response.cookies.set('arka_auth', '', cookieOptions);
    
    return response;
  }
}