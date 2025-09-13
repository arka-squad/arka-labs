// ============================================
// app/api/[[...slug]]/route.ts
// Point d'entrée unique optimisé pour Vercel
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { setupAPIRoutes } from '@/lib/api-lite/setup';

// Configuration Vercel optimisée
export const runtime = 'nodejs'; // Utiliser nodejs runtime, pas edge
export const dynamic = 'force-dynamic'; // Éviter le cache statique
export const maxDuration = 5; // Limite Vercel free tier

// ============================================
// Initialisation unique (singleton pattern)
// ============================================

let apiManager: ReturnType<typeof setupAPIRoutes> | null = null;

function getAPIManager() {
  // Initialisation lazy pour réduire cold start
  if (!apiManager) {
    console.log('🚀 Initializing API Manager Lite...');
    const start = Date.now();
    apiManager = setupAPIRoutes();
    const duration = Date.now() - start;
    console.log(`✅ API Manager Lite ready in ${duration}ms`);
  }
  return apiManager;
}

// ============================================
// Handler universel
// ============================================

async function handler(
  req: NextRequest,
  context: { params?: { slug?: string[] } }
): Promise<NextResponse> {
  try {
    // Récupération du manager (singleton)
    const api = getAPIManager();
    
    // Reconstruction du path depuis le slug
    const slug = context.params?.slug || [];
    const path = `/api/${slug.join('/')}`;
    
    // Création d'une nouvelle requête avec le bon path
    // Nécessaire car Vercel passe le path complet dans req.url
    const url = new URL(req.url);
    url.pathname = path;
    
    const modifiedReq = new NextRequest(url, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      duplex: 'half'
    } as any);

    // Délégation au manager
    return await api.handleRequest(modifiedReq);
    
  } catch (error) {
    // Erreur critique non gérée
    console.error('💥 Critical error in route handler:', error);
    
    // Response d'urgence
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'An unexpected error occurred',
        path: context.params?.slug?.join('/') || 'unknown'
      },
      { status: 500 }
    );
  }
}

// ============================================
// Export des méthodes HTTP
// ============================================

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;