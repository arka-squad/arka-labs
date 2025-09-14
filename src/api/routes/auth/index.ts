// Routes auth - B28 Phase 2
import { Router } from '../../core/router';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth/middleware';

export function registerAuthRoutes(router: Router) {
  // TODO: Migrer routes auth depuis app/api/

  // Exemple route
  router.get('/auth/health', async (req: NextRequest) => {
    return NextResponse.json({
      module: 'auth',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // D'autres routes à ajouter durant migration...
}
