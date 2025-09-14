// Routes admin - B28 Phase 2
import { Router } from '../core/router';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth/middleware';

export function registerAdminRoutes(router: Router) {
  // TODO: Migrer routes admin depuis app/api/

  // Exemple route
  router.get('/admin/health', async (req: NextRequest) => {
    return NextResponse.json({
      module: 'admin',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // D'autres routes à ajouter durant migration...
}
