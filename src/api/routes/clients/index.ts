// Routes clients - B28 Phase 2
import { Router } from '../../core/router';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth/middleware';

export function registerClientsRoutes(router: Router) {
  // TODO: Migrer routes clients depuis app/api/

  // Exemple route
  router.get('/clients/health', async (req: NextRequest) => {
    return NextResponse.json({
      module: 'clients',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // D'autres routes à ajouter durant migration...
}
