/**
 * Route directe clients admin - HOTFIX Session Expired
 * Contourne le problème du router centralisé
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Handler simple sans auth complexe - TEMPORAIRE pour test
export async function handleClientsGET(req: NextRequest) {
  console.log('🔍 Direct Clients GET - Début');

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Client spécifique
      const client = await sql`
        SELECT * FROM clients WHERE id = ${id} LIMIT 1
      `;

      if (client.length === 0) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }

      console.log('✅ Direct Clients GET - Client trouvé');
      return NextResponse.json(client[0]);
    } else {
      // Liste clients
      const clients = await sql`
        SELECT * FROM clients
        ORDER BY created_at DESC
        LIMIT 50
      `;

      console.log(`✅ Direct Clients GET - ${clients.length} clients`);
      return NextResponse.json(clients);
    }

  } catch (error) {
    console.error('❌ Direct Clients GET Error:', error);
    return NextResponse.json({
      error: 'Database error',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function handleClientsPOST(req: NextRequest) {
  console.log('🔍 Direct Clients POST - Début');

  try {
    const body = await req.json();
    console.log('📝 Client data:', {
      nom: body.nom,
      secteur: body.secteur_activite
    });

    // Validation basique
    if (!body.nom || !body.secteur_activite) {
      return NextResponse.json({
        error: 'Nom et secteur d\'activité requis'
      }, { status: 400 });
    }

    // Insert client
    const client = await sql`
      INSERT INTO clients (
        id,
        nom,
        secteur_activite,
        taille_entreprise,
        contact_principal,
        email_contact,
        telephone_contact,
        adresse,
        ville,
        contexte_specifique,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${body.nom},
        ${body.secteur_activite || ''},
        ${body.taille_entreprise || ''},
        ${body.contact_principal || ''},
        ${body.email_contact || ''},
        ${body.telephone_contact || ''},
        ${body.adresse || ''},
        ${body.ville || ''},
        ${body.contexte_specifique || ''},
        NOW(),
        NOW()
      ) RETURNING *
    `;

    console.log('✅ Direct Clients POST - Client créé:', client[0].id);

    return NextResponse.json({
      success: true,
      client: client[0],
      message: 'Client créé avec succès'
    });

  } catch (error) {
    console.error('❌ Direct Clients POST Error:', error);
    return NextResponse.json({
      error: 'Erreur création client',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function handleClientsPUT(req: NextRequest) {
  console.log('🔍 Direct Clients PUT - Début');

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID client requis' }, { status: 400 });
    }

    const client = await sql`
      UPDATE clients SET
        nom = ${body.nom},
        secteur_activite = ${body.secteur_activite},
        taille_entreprise = ${body.taille_entreprise || ''},
        contact_principal = ${body.contact_principal || ''},
        email_contact = ${body.email_contact || ''},
        telephone_contact = ${body.telephone_contact || ''},
        adresse = ${body.adresse || ''},
        ville = ${body.ville || ''},
        contexte_specifique = ${body.contexte_specifique || ''},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (client.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    console.log('✅ Direct Clients PUT - Client modifié');
    return NextResponse.json({
      success: true,
      client: client[0],
      message: 'Client modifié avec succès'
    });

  } catch (error) {
    console.error('❌ Direct Clients PUT Error:', error);
    return NextResponse.json({
      error: 'Erreur modification client',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function handleClientsDELETE(req: NextRequest) {
  console.log('🔍 Direct Clients DELETE - Début');

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID client requis' }, { status: 400 });
    }

    const client = await sql`
      DELETE FROM clients WHERE id = ${id} RETURNING id
    `;

    if (client.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    console.log('✅ Direct Clients DELETE - Client supprimé');
    return NextResponse.json({
      success: true,
      message: 'Client supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Direct Clients DELETE Error:', error);
    return NextResponse.json({
      error: 'Erreur suppression client',
      details: (error as Error).message
    }, { status: 500 });
  }
}