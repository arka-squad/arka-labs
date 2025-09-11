import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, jwtManager } from '../../../../lib/auth/jwt';
import { isTokenRevoked } from '../../../../lib/auth/token-revocation';
import { getUserPermissions, getUserAssignedProjects } from '../../../../lib/auth/rbac';
import { getDb } from '../../../../lib/db';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();
  
  try {
    // Extraire le token du header ou des cookies
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || '') || 
                 req.cookies.get('arka_access_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Token d\'authentification requis',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Verifier et decoder le token
    let payload;
    try {
      payload = jwtManager.verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Token invalide ou expire',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Verifier si le token est revoque
    if (payload.jti && await isTokenRevoked(payload.jti)) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Token revoque',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Recuperer les informations utilisateur de la base de donnees
    const db = getDb();
    const result = await db.query(
      `SELECT id, email, role, full_name, is_active, created_at, last_login_at
       FROM users 
       WHERE id = $1`,
      [payload.sub]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'user_not_found',
          message: 'Utilisateur non trouve',
          trace_id: traceId
        },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    // Verifier si l'utilisateur est actif
    if (!user.is_active) {
      return NextResponse.json(
        {
          error: 'account_disabled',
          message: 'Compte desactive',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Recuperer les permissions et projets assignes
    const permissions = getUserPermissions(user.role);
    const assignedProjects = await getUserAssignedProjects(user.id);
    
    // Retourner les informations utilisateur
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        created_at: user.created_at,
        last_login_at: user.last_login_at,
        permissions,
        assigned_projects: assignedProjects
      },
      token_expires_at: payload.exp ? new Date(payload.exp * 1000).toISOString() : undefined
    });
    
  } catch (error) {
    console.error('Get user info error:', error);
    
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Erreur lors de la recuperation des informations',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
}