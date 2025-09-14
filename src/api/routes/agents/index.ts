// Routes agents - B28 Phase 2
import { Router } from '../../core/router';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth/middleware';

export function registerAgentsRoutes(router: Router) {
  // TODO: Migrer routes agents depuis app/api/

  // Exemple route
  router.get('/agents/health', async (req: NextRequest) => {
    return NextResponse.json({
      module: 'agents',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // D'autres routes à ajouter durant migration...
}
