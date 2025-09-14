/**
 * Route directe projets admin - HOTFIX Session Expired
 * Contourne le problème du router centralisé
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function handleProjectsGET(req: NextRequest) {
  console.log('🔍 Direct Projects GET - Début');

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Projet spécifique avec client
      const project = await sql`
        SELECT
          p.*,
          c.nom as client_nom,
          c.secteur_activite as client_secteur
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.id = ${id}
        LIMIT 1
      `;

      if (project.length === 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      console.log('✅ Direct Projects GET - Projet trouvé');
      return NextResponse.json(project[0]);
    } else {
      // Liste projets avec clients
      const projects = await sql`
        SELECT
          p.*,
          c.nom as client_nom,
          c.secteur_activite as client_secteur
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 50
      `;

      console.log(`✅ Direct Projects GET - ${projects.length} projets`);
      return NextResponse.json(projects);
    }

  } catch (error) {
    console.error('❌ Direct Projects GET Error:', error);
    return NextResponse.json({
      error: 'Database error',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function handleProjectsPOST(req: NextRequest) {
  console.log('🔍 Direct Projects POST - Début');

  try {
    const body = await req.json();
    console.log('📝 Project data:', {
      nom: body.nom,
      client_id: body.client_id
    });

    // Validation
    if (!body.nom) {
      return NextResponse.json({
        error: 'Nom du projet requis'
      }, { status: 400 });
    }

    if (!body.client_id) {
      return NextResponse.json({
        error: 'Client requis pour créer un projet'
      }, { status: 400 });
    }

    // Vérifier que le client existe
    const clientExists = await sql`
      SELECT id FROM clients WHERE id = ${body.client_id} LIMIT 1
    `;

    if (clientExists.length === 0) {
      return NextResponse.json({
        error: 'Client non trouvé'
      }, { status: 404 });
    }

    // Créer projet
    const project = await sql`
      INSERT INTO projects (
        id,
        nom,
        description,
        client_id,
        statut,
        priorite,
        budget,
        date_debut,
        date_fin_prevue,
        objectifs,
        contexte,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${body.nom},
        ${body.description || ''},
        ${body.client_id},
        ${body.statut || 'draft'},
        ${body.priorite || 'medium'},
        ${body.budget || null},
        ${body.date_debut ? new Date(body.date_debut) : null},
        ${body.date_fin_prevue ? new Date(body.date_fin_prevue) : null},
        ${body.objectifs || ''},
        ${body.contexte || ''},
        NOW(),
        NOW()
      ) RETURNING *
    `;

    console.log('✅ Direct Projects POST - Projet créé:', project[0].id);

    return NextResponse.json({
      success: true,
      project: project[0],
      message: 'Projet créé avec succès'
    });

  } catch (error) {
    console.error('❌ Direct Projects POST Error:', error);
    return NextResponse.json({
      error: 'Erreur création projet',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function handleProjectsPUT(req: NextRequest) {
  console.log('🔍 Direct Projects PUT - Début');

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID projet requis' }, { status: 400 });
    }

    const project = await sql`
      UPDATE projects SET
        nom = ${body.nom},
        description = ${body.description || ''},
        statut = ${body.statut || 'draft'},
        priorite = ${body.priorite || 'medium'},
        budget = ${body.budget || null},
        date_debut = ${body.date_debut ? new Date(body.date_debut) : null},
        date_fin_prevue = ${body.date_fin_prevue ? new Date(body.date_fin_prevue) : null},
        objectifs = ${body.objectifs || ''},
        contexte = ${body.contexte || ''},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log('✅ Direct Projects PUT - Projet modifié');
    return NextResponse.json({
      success: true,
      project: project[0],
      message: 'Projet modifié avec succès'
    });

  } catch (error) {
    console.error('❌ Direct Projects PUT Error:', error);
    return NextResponse.json({
      error: 'Erreur modification projet',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function handleProjectsDELETE(req: NextRequest) {
  console.log('🔍 Direct Projects DELETE - Début');

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID projet requis' }, { status: 400 });
    }

    const project = await sql`
      DELETE FROM projects WHERE id = ${id} RETURNING id
    `;

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log('✅ Direct Projects DELETE - Projet supprimé');
    return NextResponse.json({
      success: true,
      message: 'Projet supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Direct Projects DELETE Error:', error);
    return NextResponse.json({
      error: 'Erreur suppression projet',
      details: (error as Error).message
    }, { status: 500 });
  }
}