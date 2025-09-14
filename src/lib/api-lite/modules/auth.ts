/**
 * API Lite Module: AUTH
 * Extrait du module misc - B28 Phase 2
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';

export function setupAuthRoutes(api: APILite) {
  console.log('🚀 Setup module auth (115 lignes)...');

import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export function setupMiscRoutes(api: APILite) {
  console.log('🚀 Setup module misc...');

// ============================================
// lib/api-lite/setup.ts
// Configuration et enregistrement des routes
// ============================================

import { APILite } from './core';
import { corsMiddleware, validationMiddleware, rbacMiddleware, loggingMiddleware } from './middleware';
import { withAdminAuth } from '../rbac-admin-b24';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================
// Configuration des environnements
// ============================================

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// ============================================
// Setup principal des routes
// ============================================

export function setupAPIRoutes(): APILite {
  const api = new APILite();

  // Middlewares globaux
  api.use(corsMiddleware({
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  }));

  // Logging en développement uniquement
  if (isDevelopment) {
    api.use(loggingMiddleware({ logBody: false, logHeaders: false }));
  }

  // ============================================
  // ROUTES SYSTÈME
  // ============================================

    .auth(true, true) // Require API key
    .handler(async (context) => {
      const stats = api.getStats();
      return NextResponse.json({
        ...stats,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV
      });
    })
    .build();

  // Clear cache (admin uniquement)
  api.route('/api/admin/router/cache')
    .delete()
    .auth(true, true) // Require API key
    .handler(async (context) => {
      api.clearCache();
      return NextResponse.json({ message: 'Cache cleared' });
    })
    .build();

  // ============================================
  // ROUTES CLIENTS
  // ============================================

  // Liste des clients
  api.route('/api/admin/clients')
    .get()
    .middleware(rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] }))
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
            a.max_tokens,
            a.created_at,
          max_tokens: row.max_tokens || 2000,
          projets_actifs: parseInt(row.projets_actifs) || 0,
          projets_total: parseInt(row.projets_total) || 0,
          squads_count: parseInt(row.squads_count) || 0,
          created_at: row.created_at,
          max_tokens: { type: 'number', min: 100, max: 8000 },
        max_tokens = 2000,
            max_tokens,
            ${max_tokens},
          max_tokens: { type: 'number', min: 100, max: 8000 },
        if (body.max_tokens !== undefined) updateData.max_tokens = body.max_tokens;
            max_tokens,
            ${config.max_tokens || 2000},
            'active',
            ${template_id},
            ${user?.id || 'system'},
            NOW(),
            NOW()
          )
          RETURNING *
        `;

            max_tokens: newAgent.max_tokens,
            max_tokens,
            ${originalAgent.max_tokens},
            'active',
            max_tokens: newAgent.max_tokens,
              WHEN random() < 0.6 THEN 'auth'
              WHEN random() < 0.8 THEN 'cache'
              ELSE 'system'
            END as component,
            CASE 
              WHEN random() < 0.2 THEN 'User authentication successful'
              SELECT id, name, prompt, config, tags, temperature, max_tokens, 
      max_tokens: row.max_tokens || 2000,

  console.log('✅ Module auth configuré');
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
