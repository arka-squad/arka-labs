// Routes system - B28 Phase 2
import { Router } from '../../core/router';
import { NextRequest, NextResponse } from 'next/server';

export function registerSystemRoutes(router: Router) {
  // TODO: Migrer routes system depuis app/api/

  // Exemple route
  router.get('/system/health', async (req: NextRequest) => {
    return NextResponse.json({
      module: 'system',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // D'autres routes à ajouter durant migration...

  // GET /_readyz
  router.get('/_readyz', async (req: NextRequest) => {
    try {
      const ok = !!process.env.GITHUB_WEBHOOK_SECRET &&
                 !!process.env.GITHUB_APP_ID &&
                 !!process.env.GITHUB_PRIVATE_KEY;
      return ok
        ? new NextResponse('ready', { status: 200 })
        : new NextResponse('not ready', { status: 503 });
    } catch (error) {
      console.error('Erreur /_readyz:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  // GET /_livez
  router.get('/_livez', async (req: NextRequest) => {
    try {
      return new NextResponse('ok', { status: 200 });
    } catch (error) {
      console.error('Erreur /_livez:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  // GET /version
  router.get('/version', async (req: NextRequest) => {
    try {
      // Commit/Env fournis par Vercel si disponibles
      const commit_sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || '';
      const env = process.env.VERCEL_ENV || process.env.NODE_ENV || '';
      let version = '';
      try {
        const pkg = require('../../../package.json');
        version = pkg.version || '';
      } catch {}

      return NextResponse.json({
        version,
        commit_sha,
        env,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur /version:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  // GET /health
  router.get('/health', async (req: NextRequest) => {
    try {
      
      // TODO: Implémenter la logique métier de /health
      return NextResponse.json({
        endpoint: '/health',
        method: 'GET',
        status: 'ok',
        message: 'Migré depuis app/api/health/route.ts',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur /health:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  // GET /metrics
  router.get('/metrics', async (req: NextRequest) => {
    try {
      
      // TODO: Implémenter la logique métier de /metrics
      return NextResponse.json({
        endpoint: '/metrics',
        method: 'GET',
        status: 'ok',
        message: 'Migré depuis app/api/metrics/route.ts',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur /metrics:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  // GET /providers
  router.get('/providers', async (req: NextRequest) => {
    try {
      // Allow public providers list in dev for UI integration
      if (process.env.NEXT_PUBLIC_COCKPIT_PREFILL !== '1') {
        const auth = req.headers.get('authorization') || '';
        if (!auth.startsWith('Bearer ')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }

      return NextResponse.json({
        endpoint: '/providers',
        method: 'GET',
        status: 'ok',
        message: 'Migré depuis app/api/providers/route.ts',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur /providers:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
