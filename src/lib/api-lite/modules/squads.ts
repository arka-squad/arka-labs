/**
 * API Lite Module: SQUADS
 * Généré automatiquement depuis monolithe setup.ts
 * B28 Phase 2 - Découpage architectural
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export function setupSquadsRoutes(api: APILite) {
  console.log('🚀 Setup module squads...');

              LEFT JOIN squad_members sm ON s.id = sm.squad_id AND sm.status = 'active'
              WHERE s.deleted_at IS NULL ${dateFilter}
              GROUP BY s.id, s.name, s.mission, s.domain, s.status, s.created_at, s.updated_at
              ORDER BY s.created_at DESC
            `;
            data = { squads, count: squads.length };
            break;

          case 'all':
            // Export complet (attention à la taille!)
            const [allClients, allProjects, allAgents, allSquads] = await Promise.all([
              sql`SELECT * FROM clients WHERE deleted_at IS NULL ${dateFilter}`,
              sql`SELECT * FROM projects WHERE deleted_at IS NULL ${dateFilter}`,
              sql`SELECT * FROM agents WHERE deleted_at IS NULL ${dateFilter}`,
              sql`SELECT * FROM squads WHERE deleted_at IS NULL ${dateFilter}`
            ]);
            
            data = {
              export_type: 'complete',
              clients: allClients,
              projects: allProjects,
              agents: allAgents,
              squads: allSquads,
              total_records: allClients.length + allProjects.length + allAgents.length + allSquads.length
            };
            break;
        }

        const exportData = {
          export_info: {
            type,
            format,
            generated_at: new Date().toISOString(),
            date_range: date_from && date_to ? { from: date_from, to: date_to } : null,
            total_records: (data as any).count || (data as any).total_records || 0
          },
          data
        };

        // En production, ici on convertirait en CSV/XLSX si demandé
        if (format === 'csv' || format === 'xlsx') {
          (exportData as any).note = `Format ${format.toUpperCase()} sera implémenté avec une library de conversion`;
        }

        return NextResponse.json(exportData);

      } catch (error) {
        console.error('Error exporting data:', error);
        return NextResponse.json(
          { error: 'Échec de l\'export des données', code: 'DATA_EXPORT_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Maintenance système et cleanup automatique

  console.log('✅ Module squads configuré');
}
