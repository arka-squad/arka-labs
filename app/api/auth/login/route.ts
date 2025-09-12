import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, isValidEmail, getClientIP } from '../../../../lib/auth/crypto';
import { generateTokenPair } from '../../../../lib/auth/jwt';
import { logLoginAttempt, auditService } from '../../../../lib/auth/audit';
import { getUserPermissions } from '../../../../lib/auth/rbac';
import { mockDb, shouldUseMockDb } from '../../../../lib/auth/mock-db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

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
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Format email invalide',
          trace_id: traceId
        },
        { status: 422 }
      );
    }
    
    // Use mock database when PostgreSQL is not available
    const useMock = shouldUseMockDb();
    console.log(`Using ${useMock ? 'mock' : 'real'} database for authentication`);
    
    let user: any;
    let isPasswordValid = false;
    
    if (useMock) {
      // Use mock database
      user = await mockDb.getUserByEmail(email.toLowerCase());
      
      if (!user) {
        await mockDb.logAudit({
          action: 'login_failed',
          user_email_hash: crypto.createHash('sha256').update(email).digest('hex'),
          ip_hash: crypto.createHash('sha256').update(getClientIP(req)).digest('hex'),
          status_code: 401,
          trace_id: traceId
        });
        
        return NextResponse.json(
          {
            error: 'invalid_credentials',
            message: 'Email ou mot de passe incorrect',
            trace_id: traceId
          },
          { status: 401 }
        );
      }
      
      // Check if account is locked
      if (user.locked_until && user.locked_until > new Date()) {
        return NextResponse.json(
          {
            error: 'account_locked',
            message: 'Compte temporairement verrouillé',
            retry_after: Math.ceil((user.locked_until.getTime() - Date.now()) / 1000),
            trace_id: traceId
          },
          { status: 429 }
        );
      }
      
      // Verify password
      isPasswordValid = await mockDb.verifyPassword(email, password);
      
    } else {
      // Use real database - keeping original logic
      try {
        const { getDb } = await import('../../../../lib/db');
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
        
        user = result.rows[0];
        isPasswordValid = await verifyPassword(password, user.password_hash);
        
      } catch (dbError) {
        console.error('Database error, falling back to mock:', dbError);
        // Fallback to mock if database fails
        user = await mockDb.getUserByEmail(email.toLowerCase());
        if (user) {
          isPasswordValid = await mockDb.verifyPassword(email, password);
        }
      }
    }
    
    // Check if user exists and is active
    if (!user || !user.is_active) {
      if (useMock) {
        await mockDb.updateUserLoginInfo(email, false);
        await mockDb.logAudit({
          action: 'login_failed',
          user_email_hash: crypto.createHash('sha256').update(email).digest('hex'),
          ip_hash: crypto.createHash('sha256').update(getClientIP(req)).digest('hex'),
          status_code: 401,
          trace_id: traceId,
          error_message: !user ? 'User not found' : 'Account disabled'
        });
      }
      
      return NextResponse.json(
        {
          error: !user ? 'invalid_credentials' : 'account_disabled',
          message: !user ? 'Email ou mot de passe incorrect' : 'Compte désactivé',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Check password
    if (!isPasswordValid) {
      if (useMock) {
        await mockDb.updateUserLoginInfo(email, false);
        await mockDb.logAudit({
          action: 'login_failed',
          user_id: user.id,
          user_email_hash: crypto.createHash('sha256').update(email).digest('hex'),
          ip_hash: crypto.createHash('sha256').update(getClientIP(req)).digest('hex'),
          status_code: 401,
          trace_id: traceId,
          error_message: 'Invalid password'
        });
      }
      
      return NextResponse.json(
        {
          error: 'invalid_credentials',
          message: 'Email ou mot de passe incorrect',
          trace_id: traceId
        },
        { status: 401 }
      );
    }
    
    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Update login info
    if (useMock) {
      await mockDb.updateUserLoginInfo(email, true);
      await mockDb.logAudit({
        action: 'login_success',
        user_id: user.id,
        user_email_hash: crypto.createHash('sha256').update(email).digest('hex'),
        ip_hash: crypto.createHash('sha256').update(getClientIP(req)).digest('hex'),
        status_code: 200,
        trace_id: traceId,
        response_time_ms: Date.now() - startTime
      });
    } else {
      try {
        const { getDb } = await import('../../../../lib/db');
        const db = getDb();
        await db.query(
          `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
          [user.id]
        );
        await logLoginAttempt(email, true, req);
      } catch (err) {
        console.error('Failed to update login info:', err);
      }
    }
    
    // Get user permissions
    const permissions = getUserPermissions(user.role);
    
    // Create response
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
    
    // Set secure cookies
    response.cookies.set('arka_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 // 2 hours
    });
    
    // Cookie alternatif pour compatibilité
    response.cookies.set('arka_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 // 2 hours
    });
    
    // Cookie user pour le frontend
    response.cookies.set('arka_user', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    }), {
      httpOnly: false, // Accessible au JS frontend
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 // 2 hours
    });
    
    response.cookies.set('arka_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
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