/**
 * ARKA API ROUTER - Dashboard de monitoring et contrôle
 * 
 * GET /api/admin/router - Statut et configuration
 * POST /api/admin/router - Changer configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '../../../../lib/rbac-admin-b24';
import { apiRouter, RouteStrategy } from '../../../../lib/api-router';
import { getRouterConfig } from '../../../../lib/api-router/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Dashboard de monitoring
export const GET = withAdminAuth(['admin', 'manager'])(async (req: NextRequest) => {
  try {
    const config = getRouterConfig();
    const stats = apiRouter.getStats();
    const routes = apiRouter.listRoutes();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        totalRoutes: stats.totalRoutes,
        environment: process.env.NODE_ENV,
        version: '1.0.0'
      },
      config: config.getConfig(),
      strategies: stats.strategies,
      routes: routes.map(route => ({
        ...route,
        currentStrategy: config.getStrategy(route.path, route.method)
      })),
      health: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    });
  } catch (error) {
    console.error('[Router Dashboard] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get router status' },
      { status: 500 }
    );
  }
});

// POST - Contrôle de configuration
export const POST = withAdminAuth(['admin'])(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const config = getRouterConfig();
    const { action, ...params } = body;
    
    switch (action) {
      case 'setGlobalStrategy':
        if (!params.strategy || !['dynamic', 'query', 'hybrid'].includes(params.strategy)) {
          return NextResponse.json(
            { error: 'Invalid strategy. Must be: dynamic, query, or hybrid' },
            { status: 400 }
          );
        }
        config.setGlobalStrategy(params.strategy as RouteStrategy);
        break;
        
      case 'setRouteStrategy':
        if (!params.path || !params.method || !params.strategy) {
          return NextResponse.json(
            { error: 'Missing required params: path, method, strategy' },
            { status: 400 }
          );
        }
        config.setRouteStrategy(params.path, params.method, params.strategy);
        break;
        
      case 'setDebug':
        if (typeof params.enabled !== 'boolean') {
          return NextResponse.json(
            { error: 'enabled must be boolean' },
            { status: 400 }
          );
        }
        config.setDebug(params.enabled);
        break;
        
      case 'reset':
        config.reset();
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Available: setGlobalStrategy, setRouteStrategy, setDebug, reset' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      action,
      message: 'Configuration updated successfully',
      newConfig: config.getConfig()
    });
    
  } catch (error) {
    console.error('[Router Control] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
});

// PATCH - Actions rapides
export const PATCH = withAdminAuth(['admin'])(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const strategy = url.searchParams.get('strategy') as RouteStrategy;
    
    const config = getRouterConfig();
    
    switch (action) {
      case 'emergency-query':
        // Basculer tout en mode query (fix Vercel)
        config.setGlobalStrategy('query');
        return NextResponse.json({
          success: true,
          message: 'Emergency: All routes switched to query strategy',
          strategy: 'query'
        });
        
      case 'test-dynamic':
        // Tester dynamic sur routes spécifiques
        config.setGlobalStrategy('dynamic');
        return NextResponse.json({
          success: true,
          message: 'Testing: All routes switched to dynamic strategy',
          strategy: 'dynamic'
        });
        
      case 'hybrid-mode':
        // Mode hybride pour test
        config.setGlobalStrategy('hybrid');
        return NextResponse.json({
          success: true,
          message: 'Hybrid mode enabled',
          strategy: 'hybrid'
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid quick action. Available: emergency-query, test-dynamic, hybrid-mode' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('[Router Quick Action] Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute quick action' },
      { status: 500 }
    );
  }
});