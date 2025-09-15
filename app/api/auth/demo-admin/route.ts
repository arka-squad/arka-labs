import { NextResponse } from 'next/server';
import { generateTokenPair } from '../../../../lib/auth/jwt';
import { log } from '../../../../lib/logger';

// DEMO endpoint for admin token generation - REMOVE IN PRODUCTION
export async function GET() {
  const start = Date.now();
  
  try {
    const adminUser = {
      id: 'demo-admin-user-id',
      email: 'admin@demo.local',
      role: 'admin' as const
    };

    const tokenPair = generateTokenPair(adminUser);
    
    log('info', 'demo_admin_token_generated', {
      route: '/api/auth/demo-admin',
      method: 'GET',
      status: 200,
      duration_ms: Date.now() - start,
      user_id: adminUser.id
    });

    return NextResponse.json({
      message: 'Demo admin token generated - REMOVE IN PRODUCTION',
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      jti: tokenPair.jti,
      accessExpiry: tokenPair.accessExpiry,
      refreshExpiry: tokenPair.refreshExpiry,
      user: adminUser,
      usage: 'Add accessToken as Bearer authorization header'
    });

  } catch (error) {
    log('error', 'demo_admin_token_error', {
      route: '/api/auth/demo-admin',
      method: 'GET',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
      duration_ms: Date.now() - start
    });

    return NextResponse.json(
      { error: 'Failed to generate demo token' },
      { status: 500 }
    );
  }
}