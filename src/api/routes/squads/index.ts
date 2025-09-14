// Routes squads - B28 Phase 2
import { Router } from '../core/router';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth/middleware';

export function registerSquadsRoutes(router: Router) {
  // TODO: Migrer routes squads depuis app/api/

  // Exemple route
  router.get('/squads/health', async (req: NextRequest) => {
    return NextResponse.json({
      module: 'squads',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // D'autres routes à ajouter durant migration...
}
