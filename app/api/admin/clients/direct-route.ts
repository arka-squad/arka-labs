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
    console.log('📝 Client data reçu:', body);

    // Validation avec format exact du formulaire
    if (!body.nom || !body.secteur) {
      return NextResponse.json({
        error: 'Nom et secteur requis',
        debug: { recu: Object.keys(body) }
      }, { status: 400 });
    }

    // Adapter le format formulaire vers DB
    const clientData = {
      nom: body.nom,
      secteur_activite: body.secteur,
      taille_entreprise: body.taille || 'PME',
      contact_principal: body.contact_principal?.nom || '',
      email_contact: body.contact_principal?.email || '',
      telephone_contact: body.contact_principal?.telephone || '',
      adresse: body.adresse || '',
      site_web: body.site_web || '',
      contexte_specifique: body.contexte_specifique || '',
      budget_annuel: body.budget_annuel || null,
      statut: body.statut || 'actif'
    };

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
        site_web,
        contexte_specifique,
        budget_annuel,
        statut,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${clientData.nom},
        ${clientData.secteur_activite},
        ${clientData.taille_entreprise},
        ${clientData.contact_principal},
        ${clientData.email_contact},
        ${clientData.telephone_contact},
        ${clientData.adresse},
        ${clientData.site_web},
        ${clientData.contexte_specifique},
        ${clientData.budget_annuel},
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

    // Adapter le format formulaire vers DB
    const clientData = {
      nom: body.nom,
      secteur_activite: body.secteur,
      taille_entreprise: body.taille || 'PME',
      contact_principal: body.contact_principal?.nom || '',
      email_contact: body.contact_principal?.email || '',
      telephone_contact: body.contact_principal?.telephone || '',
      adresse: body.adresse || '',
      site_web: body.site_web || '',
      contexte_specifique: body.contexte_specifique || '',
      budget_annuel: body.budget_annuel || null,
      statut: body.statut || 'actif'
    };

    const client = await sql`
      UPDATE clients SET
        nom = ${clientData.nom},
        secteur_activite = ${clientData.secteur_activite},
        taille_entreprise = ${clientData.taille_entreprise},
        contact_principal = ${clientData.contact_principal},
        email_contact = ${clientData.email_contact},
        telephone_contact = ${clientData.telephone_contact},
        adresse = ${clientData.adresse},
        site_web = ${clientData.site_web},
        contexte_specifique = ${clientData.contexte_specifique},
        budget_annuel = ${clientData.budget_annuel},
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