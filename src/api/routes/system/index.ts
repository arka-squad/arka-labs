// Routes system - B28 Phase 2
import { Router } from '../core/router';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth/middleware';

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
}
