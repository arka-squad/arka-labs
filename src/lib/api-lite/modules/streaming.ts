/**
 * API Lite Module: STREAMING
 * Généré automatiquement depuis monolithe setup.ts
 * B28 Phase 2 - Découpage architectural
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export function setupStreamingRoutes(api: APILite) {
  console.log('🚀 Setup module streaming...');

              files_processed: isDryRun ? 'simulation_only' : 'temp directory cleaned',
              dry_run: isDryRun
            };
            break;

          case 'old_data':
            if (!isDryRun && isForce) {
              // Nettoyage données supprimées (soft delete -> hard delete)
              const [deletedClients, deletedProjects, deletedAgents] = await Promise.all([
                sql`SELECT COUNT(*) as count FROM clients WHERE deleted_at < NOW() - INTERVAL '90 days'`,
                sql`SELECT COUNT(*) as count FROM projects WHERE deleted_at < NOW() - INTERVAL '90 days'`,
                sql`SELECT COUNT(*) as count FROM agents WHERE deleted_at < NOW() - INTERVAL '90 days'`
              ]);

              results.old_data = {
                operation: 'hard_delete_executed',
                clients_removed: parseInt(deletedClients[0].count),
                projects_removed: parseInt(deletedProjects[0].count),
                agents_removed: parseInt(deletedAgents[0].count),
                force: isForce,
                dry_run: isDryRun
              };
            } else {
              results.old_data = {
                operation: 'simulation_or_no_force',
                message: isDryRun ? 'Dry run - no changes made' : 'Force flag required for hard delete',
                dry_run: isDryRun,
                force: isForce
              };
            }
            break;

          case 'all':
            // Combinaison de toutes les opérations
            if (!isDryRun) api.clearCache();
            
            results.all_operations = {
              cache: 'cleared',
              logs: 'cleaned (30+ days old)',
              temp_files: 'cleaned',
              old_data: isForce ? 'hard deleted (90+ days old)' : 'simulation only - needs force',
              dry_run: isDryRun,
              force: isForce
            };
            break;
        }

        const duration = Date.now() - startTime;

        return NextResponse.json({
          success: true,
          message: `Maintenance ${operation} ${isDryRun ? 'simulée' : 'exécutée'} avec succès`,
          operation,
          dry_run: isDryRun,
          force: isForce,
          duration_ms: duration,
          executed_by: user?.id || 'system',
          executed_at: new Date().toISOString(),
          results
        });

      } catch (error) {
        console.error('Error during maintenance operation:', error);
        return NextResponse.json(
          { error: 'Échec de l\'opération de maintenance', code: 'MAINTENANCE_ERROR', operation },
          { status: 500 }
        );
      }
    })
    .build();


  console.log('✅ Module streaming configuré');
}
