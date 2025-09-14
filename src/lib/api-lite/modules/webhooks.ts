/**
 * API Lite Module: WEBHOOKS
 * Généré automatiquement depuis monolithe setup.ts
 * B28 Phase 2 - Découpage architectural
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export function setupWebhooksRoutes(api: APILite) {
  console.log('🚀 Setup module webhooks...');

          INSERT INTO integrations_webhooks (
            id,
            name,
            url,
            events,
            secret,
            active,
            created_by,
            created_at,
            updated_at
          ) VALUES (
            ${webhookId},
            ${name},
            ${url},
            ${JSON.stringify(parsedEvents)},
            ${webhookSecret},
            ${active === 'true'},
            ${user?.id || 'system'},
            NOW(),
            NOW()
          )
          RETURNING id, name, url, events, active, created_at
        `;

        const webhook = result[0];

        return NextResponse.json({
          success: true,
          message: `Webhook "${name}" créé avec succès`,
          webhook: {
            id: webhook.id,
            name: webhook.name,
            url: webhook.url,
            events: JSON.parse(webhook.events),
            active: webhook.active,
            secret: webhookSecret, // Return secret once for storage
            created_at: webhook.created_at
          }
        }, { status: 201 });

      } catch (error) {
        console.error('Error creating webhook:', error);
        
        // Handle unique constraint violations
        if ((error instanceof Error && error.message?.includes('unique')) || 
            (error as any)?.code === '23505') {
          return NextResponse.json({ 
            error: 'Un webhook avec ce nom existe déjà',
            code: 'WEBHOOK_NAME_TAKEN'
          }, { status: 409 });
        }

        return NextResponse.json(
          { error: 'Échec de la création du webhook', code: 'WEBHOOK_CREATE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Export de données système en différents formats

  console.log('✅ Module webhooks configuré');
}
