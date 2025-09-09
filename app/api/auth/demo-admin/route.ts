import { NextResponse } from 'next/server';
import { signToken } from '../../../../lib/auth';
import { log } from '../../../../lib/logger';

// DEMO endpoint for admin token generation - REMOVE IN PRODUCTION
export async function GET() {
  const start = Date.now();
  
  try {
    const adminUser = {
      sub: 'demo-admin-user-id',
      role: 'admin' as const
    };
    
    const token = signToken(adminUser);
    
    log('info', 'demo_admin_token_generated', {
      route: '/api/auth/demo-admin',
      method: 'GET',
      status: 200,
      duration_ms: Date.now() - start,
      user_id: adminUser.sub
    });

    return NextResponse.json({
      message: 'Demo admin token generated - REMOVE IN PRODUCTION',
      token,
      user: adminUser,
      usage: 'Add this token as Bearer authorization header'
    });

  } catch (error) {
    log('error', 'demo_admin_token_error', {
      route: '/api/auth/demo-admin',
      method: 'GET',
      error: error.message,
      status: 500,
      duration_ms: Date.now() - start
    });

    return NextResponse.json(
      { error: 'Failed to generate demo token' },
      { status: 500 }
    );
  }
}