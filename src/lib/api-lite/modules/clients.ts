/**
 * API Lite Module: CLIENTS
 * Généré automatiquement depuis monolithe setup.ts
 * B28 Phase 2 - Découpage architectural
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export function setupClientsRoutes(api: APILite) {
  console.log('🚀 Setup module clients...');

          LEFT JOIN projects p ON p.client_id = c.id
          WHERE c.deleted_at IS NULL
          GROUP BY c.id
          ORDER BY c.nom ASC 
          LIMIT 100
        `;

        // Apply filters in memory for now
        let filteredResult = result;

        if (search) {
          const searchLower = search.toLowerCase();
          filteredResult = filteredResult.filter((row: any) =>
            row.nom?.toLowerCase().includes(searchLower) ||
            row.contact_principal?.email?.toLowerCase().includes(searchLower)
          );
        }

        if (statut && statut !== '') {
          filteredResult = filteredResult.filter((row: any) => row.statut === statut);
        }

        if (taille && taille !== '') {
          filteredResult = filteredResult.filter((row: any) => row.taille === taille);
        }

        if (secteur && secteur !== '') {
          const secteurLower = secteur.toLowerCase();
          filteredResult = filteredResult.filter((row: any) =>
            row.secteur?.toLowerCase().includes(secteurLower)
          );
        }

        const items = filteredResult.map((row: any) => ({
          id: row.id,
          nom: row.nom,
          email: row.contact_principal?.email || '',
          secteur: row.secteur || '',
          taille: row.taille || 'PME',
          contact_principal: row.contact_principal || null,
          contact_nom: row.contact_principal?.nom || '',
          contexte_specifique: row.contexte_specifique || '',
          statut: row.statut || 'actif',
          projets_count: parseInt(row.projets_count) || 0,
          projets_actifs: parseInt(row.projets_actifs) || 0,
          created_at: row.created_at,
          updated_at: row.updated_at,
          created_by: row.created_by || 'system'
        }));

        return NextResponse.json({
          success: true,
          items,
          total: items.length,
          page: 1,
          limit: 100,
          totalPages: 1
        });

      } catch (error) {
        console.error('Error listing clients:', error);
        return NextResponse.json(
          { error: 'Failed to list clients', code: 'CLIENTS_LIST_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Détail d'un client

  console.log('✅ Module clients configuré');
}
