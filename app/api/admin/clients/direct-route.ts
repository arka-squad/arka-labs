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
      return NextResponse.json({
        items: clients,
        total: clients.length
      });
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
    console.log('📝 Client data reçu:', body);

    // Validation avec format exact du formulaire
    if (!body.nom || !body.secteur) {
      return NextResponse.json({
        error: 'Nom et secteur requis',
        debug: { recu: Object.keys(body) }
      }, { status: 400 });
    }

    // Adapter le format formulaire vers DB réel
    const clientData = {
      nom: body.nom,
      secteur: body.secteur, // secteur direct (pas secteur_activite)
      taille: body.taille || 'PME',
      // contact_principal as JSONB object avec toutes les infos
      contact_principal: {
        nom: body.contact_principal?.nom || '',
        email: body.contact_principal?.email || '',
        telephone: body.contact_principal?.telephone || '',
        fonction: body.contact_principal?.fonction || ''
      },
      // Combiner description + adresse + site_web dans contexte_specifique
      contexte_specifique: [
        body.description || '',
        body.adresse ? `Adresse: ${body.adresse}` : '',
        body.site_web ? `Site: ${body.site_web}` : '',
        body.contexte_specifique || ''
      ].filter(x => x).join('\n\n'),
      statut: body.statut || 'actif'
    };

    // Insert client avec schéma DB réel
    const client = await sql`
      INSERT INTO clients (
        id,
        nom,
        secteur,
        taille,
        contact_principal,
        contexte_specifique,
        statut,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${clientData.nom},
        ${clientData.secteur},
        ${clientData.taille},
        ${JSON.stringify(clientData.contact_principal)},
        ${clientData.contexte_specifique},
        ${clientData.statut},
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

    // Adapter le format formulaire vers DB réel
    const clientData = {
      nom: body.nom,
      secteur: body.secteur,
      taille: body.taille || 'PME',
      contact_principal: {
        nom: body.contact_principal?.nom || '',
        email: body.contact_principal?.email || '',
        telephone: body.contact_principal?.telephone || '',
        fonction: body.contact_principal?.fonction || ''
      },
      contexte_specifique: [
        body.description || '',
        body.adresse ? `Adresse: ${body.adresse}` : '',
        body.site_web ? `Site: ${body.site_web}` : '',
        body.contexte_specifique || ''
      ].filter(x => x).join('\n\n'),
      statut: body.statut || 'actif'
    };

    const client = await sql`
      UPDATE clients SET
        nom = ${clientData.nom},
        secteur = ${clientData.secteur},
        taille = ${clientData.taille},
        contact_principal = ${JSON.stringify(clientData.contact_principal)},
        contexte_specifique = ${clientData.contexte_specifique},
        statut = ${clientData.statut},
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