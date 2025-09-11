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
    
    // V�rifier et d�coder le token
    let payload;
    try {
      payload = jwtManager.verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Token invalide ou expir�',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // V�rifier si le token est r�voqu�
    if (payload.jti && await isTokenRevoked(payload.jti)) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Token r�voqu�',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // R�cup�rer les informations compl�tes de l'utilisateur
    const db = getDb();
    const result = await db.query(
      `SELECT id, email, role, full_name, is_active, last_login_at, created_at
       FROM users 
       WHERE id = $1`,
      [payload.sub]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'user_not_found',
          message: 'Utilisateur non trouv�',
          trace_id: traceId
        },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    // V�rifier si l'utilisateur est actif
    if (!user.is_active) {
      return NextResponse.json(
        {
          error: 'account_disabled',
          message: 'Compte d�sactiv�',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // R�cup�rer les permissions
    const permissions = getUserPermissions(user.role);
    
    // R�cup�rer les projets assign�s (pour manager et operator)
    let assignedProjects: number[] = [];
    if (user.role === 'manager' || user.role === 'operator') {
      assignedProjects = await getUserAssignedProjects(user.id);
    }
    
    // Calculer l'expiration du token
    const tokenExpiry = payload.exp ? new Date(payload.exp * 1000) : null;
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        is_active: user.is_active,
        last_login_at: user.last_login_at,
        created_at: user.created_at
      },
      permissions,
      assigned_projects: assignedProjects,
      token_expires_at: tokenExpiry?.toISOString()
    });
    
  } catch (error) {
    console.error('Get user info error:', error);
    
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Erreur lors de la r�cup�ration des informations',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
}