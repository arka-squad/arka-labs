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
      return NextResponse.json({
        items: projects,
        total: projects.length
      });
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
    console.log('📝 Project data reçu:', body);

    // Validation format formulaire
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

    // Adapter format formulaire vers DB RÉEL
    const projectData = {
      name: body.nom, // nom -> name
      description: body.description || '',
      client_id: body.client_id,
      status: body.status || 'draft', // garder status
      priority: body.priority || 'normal', // garder priority
      budget: body.budget || null,
      deadline: body.deadline ? new Date(body.deadline) : null, // garder deadline
      tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : '[]',
      requirements: Array.isArray(body.requirements) ? JSON.stringify(body.requirements) : '[]',
      created_by: 'admin_user' // obligatoire
    };

    // Créer projet avec schéma DB réel
    const project = await sql`
      INSERT INTO projects (
        id,
        name,
        description,
        client_id,
        status,
        priority,
        budget,
        deadline,
        tags,
        requirements,
        created_by,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${projectData.name},
        ${projectData.description},
        ${projectData.client_id},
        ${projectData.status},
        ${projectData.priority},
        ${projectData.budget},
        ${projectData.deadline},
        ${projectData.tags},
        ${projectData.requirements},
        ${projectData.created_by},
        NOW(),
        NOW()
      ) RETURNING *
    `;

    console.log('✅ Direct Projects POST - Projet créé:', project[0].id);

    return NextResponse.json({
      success: true,
      project: project[0],
      id: project[0].id, // pour compatibilité frontend
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