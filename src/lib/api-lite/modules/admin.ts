/**
 * API Lite Module: ADMIN
 * Généré automatiquement depuis monolithe setup.ts
 * B28 Phase 2 - Découpage architectural
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export function setupAdminRoutes(api: APILite) {
  console.log('🚀 Setup module admin...');

      rbacMiddleware({ required: true, roles: ['admin'] }) // Seuls les admins peuvent modifier les paramètres
    )
    .handler(async (context) => {
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

      const { category, key, value, description } = body;

      try {
        const settingId = crypto.randomUUID();

        // Check if setting already exists
        const [existingSetting] = await sql`
          SELECT id FROM system_settings 
          WHERE category = ${category} AND key = ${key} AND deleted_at IS NULL
        `;

        if (existingSetting) {
          // Update existing setting
          const result = await sql`
            UPDATE system_settings 
            SET value = ${value}, 
                description = ${description || ''}, 
                updated_by = ${user?.id || 'system'},
                updated_at = NOW()
            WHERE category = ${category} AND key = ${key} AND deleted_at IS NULL
            RETURNING *
          `;

          const updatedSetting = result[0];

          return NextResponse.json({
            success: true,
            message: `Paramètre "${key}" mis à jour`,
            setting: {
              id: updatedSetting.id,
              category: updatedSetting.category,
              key: updatedSetting.key,
              value: updatedSetting.value,
              description: updatedSetting.description,
              updated_by: updatedSetting.updated_by,
              updated_at: updatedSetting.updated_at,
              action: 'updated'
            }
          });

        } else {
          // Create new setting
          const result = await sql`
            INSERT INTO system_settings (
              id, category, key, value, description, created_by, created_at, updated_at
            ) VALUES (
              ${settingId}, ${category}, ${key}, ${value}, ${description || ''}, 
              ${user?.id || 'system'}, NOW(), NOW()
            )
            RETURNING *
          `;

          const newSetting = result[0];

          return NextResponse.json({
            success: true,
            message: `Paramètre "${key}" créé`,
            setting: {
              id: newSetting.id,
              category: newSetting.category,
              key: newSetting.key,
              value: newSetting.value,
              description: newSetting.description,
              created_by: newSetting.created_by,
              created_at: newSetting.created_at,
              action: 'created'
            }
          }, { status: 201 });
        }

      } catch (error) {
        console.error('Error managing system setting:', error);
        return NextResponse.json(
          { error: 'Échec de la gestion du paramètre', code: 'BACKOFFICE_SETTINGS_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Consultation des logs système

  console.log('✅ Module admin configuré');
}
