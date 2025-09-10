import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../../lib/rbac-admin';
import { sql } from '../../../../../lib/db';
import { log } from '../../../../../lib/logger';
import { TRACE_HEADER } from '../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Dashboard stats interface for real-time updates
interface DashboardStats {
  squads: {
    total: number;
    active: number;
    inactive: number;
  };
  projects: {
    total: number;
    active: number;
    disabled: number;
    urgent: number;
    deadline_alerts: number;
  };
  agents: {
    total: number;
    active: number;
    mobilized: number;
    available: number;
  };
  instructions: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
  };
  performance: {
    avg_completion_hours: number;
    success_rate: number;
    response_time_ms: number;
  };
  alerts: {
    total: number;
    deadline_critical: number;
    budget_exceeded: number;
    squad_overload: number;
  };
}

// GET /api/admin/dashboard/stats - Dashboard statistics with real-time data
export const GET = withAdminAuth(['dashboard:read'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    // Execute statistics queries in parallel for better performance (simplified for B23 v2.5)
    const [
      clientStats,
      projectStats, 
      agentStats
    ] = await Promise.all([
      // Client statistics (instead of squads)
      sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE statut = 'actif') as active,
          COUNT(*) FILTER (WHERE statut = 'inactif') as inactive
        FROM clients 
        WHERE deleted_at IS NULL
      `,
      
      // Project statistics
      sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'disabled') as disabled,
          COUNT(*) FILTER (WHERE priority = 'urgent') as urgent,
          COUNT(*) FILTER (
            WHERE status = 'active' 
            AND deadline IS NOT NULL 
            AND deadline <= date('now', '+7 days')
          ) as deadline_alerts
        FROM projects 
        WHERE deleted_at IS NULL
      `,
      
      // Agent statistics
      sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          (
            SELECT COUNT(DISTINCT agent_id) 
            FROM project_assignments pa
            JOIN projects p ON pa.project_id = p.id
            WHERE pa.status = 'active' AND p.status = 'active'
          ) as mobilized,
          COUNT(*) FILTER (
            WHERE status = 'active' 
            AND id NOT IN (
              SELECT DISTINCT agent_id 
              FROM project_assignments pa
              JOIN projects p ON pa.project_id = p.id
              WHERE pa.status = 'active' AND p.status = 'active'
            )
          ) as available
        FROM agents 
        WHERE deleted_at IS NULL
      `
    ]);

    // Format response according to interface (simplified)
    const response: DashboardStats = {
      squads: {
        total: clientStats[0]?.total || 0, // Use clients as squads for now
        active: clientStats[0]?.active || 0,
        inactive: clientStats[0]?.inactive || 0
      },
      projects: {
        total: projectStats[0]?.total || 0,
        active: projectStats[0]?.active || 0,
        disabled: projectStats[0]?.disabled || 0,
        urgent: projectStats[0]?.urgent || 0,
        deadline_alerts: projectStats[0]?.deadline_alerts || 0
      },
      agents: {
        total: agentStats[0]?.total || 0,
        active: agentStats[0]?.active || 0,
        mobilized: agentStats[0]?.mobilized || 0,
        available: agentStats[0]?.available || 0
      },
      instructions: {
        total: 0, // No instructions table yet
        pending: 0,
        completed: 0,
        failed: 0
      },
      performance: {
        avg_completion_hours: 0, // No performance data yet
        success_rate: 0,
        response_time_ms: 0
      },
      alerts: {
        total: projectStats[0]?.deadline_alerts || 0,
        deadline_critical: projectStats[0]?.deadline_alerts || 0,
        budget_exceeded: 0, // No complex budget alerts yet
        squad_overload: 0  // No squad overload alerts yet
      }
    };

    // Log success with performance metrics
    log('info', 'dashboard_stats_success', {
      route: '/api/admin/dashboard/stats',
      method: 'GET',
      status: 200,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      stats: {
        clients: response.squads.total,
        projects: response.projects.total,
        agents: response.agents.total,
        alerts: response.alerts.total
      }
    });

    // Set caching headers for real-time updates (15 seconds)
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('Cache-Control', 'public, max-age=15, s-maxage=15');
    nextResponse.headers.set('CDN-Cache-Control', 'public, max-age=15');
    
    return nextResponse;

  } catch (error) {
    log('error', 'dashboard_stats_error', {
      route: '/api/admin/dashboard/stats',
      method: 'GET',
      error: error.message,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to load dashboard statistics',
        code: 'DASHBOARD_STATS_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// POST /api/admin/dashboard/stats - Subscribe to real-time updates via WebSocket
export const POST = withAdminAuth(['dashboard:read'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    const body = await req.json();
    const { subscribe = false } = body;

    if (subscribe) {
      // Return WebSocket endpoint for real-time updates (future implementation)
      return NextResponse.json({
        websocket_endpoint: '/api/admin/dashboard/ws',
        message: 'WebSocket subscription not yet implemented - use polling',
        polling_interval: 15000 // 15 seconds
      });
    }

    return NextResponse.json({ 
      error: 'Invalid request',
      code: 'INVALID_REQUEST',
      trace_id: traceId
    }, { status: 400 });

  } catch (error) {
    log('error', 'dashboard_subscribe_error', {
      route: '/api/admin/dashboard/stats',
      method: 'POST',
      error: error.message,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to process subscription request',
        code: 'DASHBOARD_SUBSCRIBE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});