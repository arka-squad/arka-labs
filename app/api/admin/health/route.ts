import { NextResponse } from 'next/server';
import { withAdminAuth } from '../../../../lib/rbac-admin-b24';
import { log } from '../../../../lib/logger';
import { TRACE_HEADER } from '../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/health - Health check for admin APIs
export const GET = withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      user: {
        sub: user.id,
        role: user.role
      },
      apis: {
        agents: 'ready',
        clients: 'ready', 
        projects: 'ready',
        dashboard: 'ready'
      },
      version: 'B23 v2.5',
      environment: process.env.NODE_ENV || 'development'
    };

    const response = NextResponse.json(healthInfo);

    log('info', 'admin_health_check', {
      route: '/api/admin/health',
      method: 'GET',
      status: 200,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id
    });

    return response;

  } catch (error) {
    log('error', 'admin_health_error', {
      route: '/api/admin/health',
      method: 'GET',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id
    });

    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Health check failed',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});