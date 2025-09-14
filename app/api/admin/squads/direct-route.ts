/**
 * Route directe squads admin - HOTFIX Session Expired
 * Contourne le problème du router centralisé
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function handleSquadsGET(req: NextRequest) {
  console.log('🔍 Direct Squads GET - Début');

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Squad spécifique avec projet et client (schéma DB réel)
      const squad = await sql`
        SELECT
          s.*,
          p.name as project_nom,
          c.nom as client_nom
        FROM squads s
        LEFT JOIN projects p ON s.project_id = p.id
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE s.id = ${id}
        LIMIT 1
      `;

      if (squad.length === 0) {
        return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
      }

      console.log('✅ Direct Squads GET - Squad trouvée');
      return NextResponse.json(squad[0]);
    } else {
      // Liste squads avec projets et clients (schéma DB réel)
      const squads = await sql`
        SELECT
          s.*,
          p.name as project_nom,
          c.nom as client_nom
        FROM squads s
        LEFT JOIN projects p ON s.project_id = p.id
        LEFT JOIN clients c ON p.client_id = c.id
        ORDER BY s.created_at DESC
        LIMIT 50
      `;

      console.log(`✅ Direct Squads GET - ${squads.length} squads`);
      return NextResponse.json({
        items: squads,
        total: squads.length
      });
    }

  } catch (error) {
    console.error('❌ Direct Squads GET Error:', error);
    return NextResponse.json({
      error: 'Database error',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function handleSquadsPOST(req: NextRequest) {
  console.log('🔍 Direct Squads POST - Début');

  try {
    const body = await req.json();
    console.log('📝 Squad data reçu:', body);

    // Validation format formulaire
    if (!body.name) {
      return NextResponse.json({
        error: 'Nom de la squad requis'
      }, { status: 400 });
    }

    // project_id est optionnel (squad peut être créée puis assignée)
    let projectExists = true;
    if (body.project_id) {
      const project = await sql`
        SELECT id FROM projects WHERE id = ${body.project_id} LIMIT 1
      `;
      if (project.length === 0) {
        return NextResponse.json({
          error: 'Projet non trouvé'
        }, { status: 404 });
      }
    }

    // Adapter format formulaire vers DB RÉEL
    const squadData = {
      name: body.name, // garder name
      slug: body.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), // générer slug
      mission: body.mission || '',
      domain: body.domain || 'Tech',
      status: 'active', // status pas statut
      created_by: 'admin_user' // obligatoire
    };

    // Créer squad avec schéma DB réel
    const squad = await sql`
      INSERT INTO squads (
        id,
        name,
        slug,
        mission,
        domain,
        status,
        created_by,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${squadData.name},
        ${squadData.slug},
        ${squadData.mission},
        ${squadData.domain},
        ${squadData.status},
        ${squadData.created_by},
        NOW(),
        NOW()
      ) RETURNING *
    `;

    console.log('✅ Direct Squads POST - Squad créée:', squad[0].id);

    return NextResponse.json({
      success: true,
      squad: squad[0],
      id: squad[0].id, // pour compatibilité frontend
      message: 'Squad créée avec succès'
    });

  } catch (error) {
    console.error('❌ Direct Squads POST Error:', error);
    return NextResponse.json({
      error: 'Erreur création squad',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function handleSquadsPUT(req: NextRequest) {
  console.log('🔍 Direct Squads PUT - Début');

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID squad requis' }, { status: 400 });
    }

    const squad = await sql`
      UPDATE squads SET
        nom = ${body.nom},
        description = ${body.description || ''},
        statut = ${body.statut || 'active'},
        objectif = ${body.objectif || ''},
        competences_requises = ${body.competences_requises || ''},
        budget_alloue = ${body.budget_alloue || null},
        date_fin_prevue = ${body.date_fin_prevue ? new Date(body.date_fin_prevue) : null},
        responsable = ${body.responsable || ''},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (squad.length === 0) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    console.log('✅ Direct Squads PUT - Squad modifiée');
    return NextResponse.json({
      success: true,
      squad: squad[0],
      message: 'Squad modifiée avec succès'
    });

  } catch (error) {
    console.error('❌ Direct Squads PUT Error:', error);
    return NextResponse.json({
      error: 'Erreur modification squad',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function handleSquadsDELETE(req: NextRequest) {
  console.log('🔍 Direct Squads DELETE - Début');

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID squad requis' }, { status: 400 });
    }

    const squad = await sql`
      DELETE FROM squads WHERE id = ${id} RETURNING id
    `;

    if (squad.length === 0) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    console.log('✅ Direct Squads DELETE - Squad supprimée');
    return NextResponse.json({
      success: true,
      message: 'Squad supprimée avec succès'
    });

  } catch (error) {
    console.error('❌ Direct Squads DELETE Error:', error);
    return NextResponse.json({
      error: 'Erreur suppression squad',
      details: (error as Error).message
    }, { status: 500 });
  }
}