import { NextResponse } from 'next/server';
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
    // Execute all queries in parallel for performance
    const [
      squadStats,
      projectStats,
      agentStats,
      instructionStats,
      performanceStats,
      alertStats
    ] = await Promise.all([
      // Squad statistics
      sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'inactive') as inactive
        FROM squads 
        WHERE deleted_at IS NULL
      `,
      
      // Project statistics with priority and deadline analysis
      sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'disabled') as disabled,
          COUNT(*) FILTER (WHERE priority = 'urgent') as urgent,
          COUNT(*) FILTER (
            WHERE status = 'active' 
            AND deadline IS NOT NULL 
            AND deadline <= CURRENT_DATE + INTERVAL '7 days'
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
      `,
      
      // Instruction statistics  
      sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM squad_instructions 
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      `,
      
      // Performance metrics
      sql`
        SELECT 
          COALESCE(AVG(
            EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600
          ) FILTER (WHERE completed_at IS NOT NULL), 0) as avg_completion_hours,
          COALESCE(
            COUNT(*) FILTER (WHERE status = 'completed')::float / 
            NULLIF(COUNT(*) FILTER (WHERE status IN ('completed', 'failed')), 0) * 100,
            0
          ) as success_rate,
          COALESCE(AVG(response_time_ms) FILTER (WHERE response_time_ms IS NOT NULL), 0) as response_time_ms
        FROM squad_instructions 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      `,
      
      // Alert statistics
      sql`
        SELECT 
          (
            SELECT COUNT(*) 
            FROM projects 
            WHERE status = 'active' 
            AND deadline IS NOT NULL 
            AND deadline <= CURRENT_DATE + INTERVAL '3 days'
          ) as deadline_critical,
          (
            SELECT COUNT(*) 
            FROM projects p
            JOIN (
              SELECT project_id, COUNT(*) as agent_count
              FROM project_assignments 
              WHERE status = 'active'
              GROUP BY project_id
            ) pa ON p.id = pa.project_id
            WHERE p.status = 'active' 
            AND p.budget IS NOT NULL
            AND (pa.agent_count * 400) > p.budget * 0.9
          ) as budget_exceeded,
          (
            SELECT COUNT(*)
            FROM squads s
            JOIN (
              SELECT squad_id, COUNT(*) as active_projects
              FROM project_squads ps
              JOIN projects p ON ps.project_id = p.id
              WHERE ps.status = 'active' AND p.status = 'active'
              GROUP BY squad_id
            ) ps ON s.id = ps.squad_id
            WHERE s.status = 'active' 
            AND ps.active_projects > 5
          ) as squad_overload
      `
    ]);

    // Format the response according to expected interface
    const stats: DashboardStats = {
      squads: {
        total: parseInt(squadStats[0]?.total || '0'),
        active: parseInt(squadStats[0]?.active || '0'),
        inactive: parseInt(squadStats[0]?.inactive || '0')
      },
      projects: {
        total: parseInt(projectStats[0]?.total || '0'),
        active: parseInt(projectStats[0]?.active || '0'),
        disabled: parseInt(projectStats[0]?.disabled || '0'),
        urgent: parseInt(projectStats[0]?.urgent || '0'),
        deadline_alerts: parseInt(projectStats[0]?.deadline_alerts || '0')
      },
      agents: {
        total: parseInt(agentStats[0]?.total || '0'),
        active: parseInt(agentStats[0]?.active || '0'),
        mobilized: parseInt(agentStats[0]?.mobilized || '0'),
        available: parseInt(agentStats[0]?.available || '0')
      },
      instructions: {
        total: parseInt(instructionStats[0]?.total || '0'),
        pending: parseInt(instructionStats[0]?.pending || '0'),
        completed: parseInt(instructionStats[0]?.completed || '0'),
        failed: parseInt(instructionStats[0]?.failed || '0')
      },
      performance: {
        avg_completion_hours: parseFloat(performanceStats[0]?.avg_completion_hours || '0'),
        success_rate: parseFloat(performanceStats[0]?.success_rate || '0'),
        response_time_ms: parseFloat(performanceStats[0]?.response_time_ms || '0')
      },
      alerts: {
        total: (alertStats[0]?.deadline_critical || 0) + 
               (alertStats[0]?.budget_exceeded || 0) + 
               (alertStats[0]?.squad_overload || 0),
        deadline_critical: parseInt(alertStats[0]?.deadline_critical || '0'),
        budget_exceeded: parseInt(alertStats[0]?.budget_exceeded || '0'),
        squad_overload: parseInt(alertStats[0]?.squad_overload || '0')
      }
    };

    const response = NextResponse.json(stats);
    
    log('info', 'dashboard_stats_success', {
      route: '/api/admin/dashboard/stats',
      method: 'GET',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      stats_overview: {
        squads_active: stats.squads.active,
        projects_active: stats.projects.active,
        agents_mobilized: stats.agents.mobilized,
        alerts_total: stats.alerts.total
      }
    });

    // Add cache headers for real-time updates (15 seconds)
    response.headers.set('Cache-Control', 'no-cache, must-revalidate');
    response.headers.set('X-Dashboard-Refresh', '15000');
    
    return response;

  } catch (error) {
    log('error', 'dashboard_stats_error', {
      route: '/api/admin/dashboard/stats',
      method: 'GET',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
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

// Real-time dashboard updates endpoint for WebSocket compatibility
export const POST = withAdminAuth(['dashboard:read'])(async (req, user) => {
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    const body = await req.json();
    const { subscribe_to } = body;

    // In a real implementation, this would set up WebSocket subscriptions
    // For now, we return the current stats with subscription confirmation
    const statsResponse = await GET(req, user);
    const stats = await statsResponse.json();

    return NextResponse.json({
      subscribed: true,
      subscription_id: `dashboard_${Date.now()}`,
      channels: subscribe_to || ['all'],
      current_stats: stats,
      update_interval_ms: 15000
    });

  } catch (error) {
    log('error', 'dashboard_subscription_error', {
      route: '/api/admin/dashboard/stats',
      method: 'POST',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to subscribe to dashboard updates',
        code: 'DASHBOARD_SUBSCRIPTION_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});