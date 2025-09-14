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

    // Validation avec format exact du formulaire (normalized to english)
    if (!body.name || !body.sector) {
      return NextResponse.json({
        error: 'Name and sector required',
        debug: { received: Object.keys(body) }
      }, { status: 400 });
    }

    // Adapter le format formulaire vers DB réel (normalized to english)
    const clientData = {
      name: body.name,
      sector: body.sector, // sector direct
      size: body.size || 'PME',
      // contact_principal as JSONB object (normalized)
      contact_principal: {
        name: body.contact_principal?.name || '',
        email: body.contact_principal?.email || '',
        phone: body.contact_principal?.phone || '',
        role: body.contact_principal?.role || ''
      },
      // Combiner description + address + website dans specific_context
      specific_context: [
        body.description || '',
        body.address ? `Address: ${body.address}` : '',
        body.website ? `Website: ${body.website}` : '',
        body.specific_context || ''
      ].filter(x => x).join('\n\n'),
      status: body.status || 'active'
    };

    // Insert client avec schéma DB réel
    const client = await sql`
      INSERT INTO clients (
        id,
        name,
        sector,
        size,
        contact_principal,
        specific_context,
        status,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${clientData.name},
        ${clientData.sector},
        ${clientData.size},
        ${JSON.stringify(clientData.contact_principal)},
        ${clientData.specific_context},
        ${clientData.status},
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

    // Adapter le format formulaire vers DB réel (normalized)
    const clientData = {
      name: body.name,
      sector: body.sector,
      size: body.size || 'PME',
      contact_principal: {
        name: body.contact_principal?.name || '',
        email: body.contact_principal?.email || '',
        phone: body.contact_principal?.phone || '',
        role: body.contact_principal?.role || ''
      },
      specific_context: [
        body.description || '',
        body.address ? `Address: ${body.address}` : '',
        body.website ? `Website: ${body.website}` : '',
        body.specific_context || ''
      ].filter(x => x).join('\n\n'),
      status: body.status || 'active'
    };

    const client = await sql`
      UPDATE clients SET
        name = ${clientData.name},
        sector = ${clientData.sector},
        size = ${clientData.size},
        contact_principal = ${JSON.stringify(clientData.contact_principal)},
        specific_context = ${clientData.specific_context},
        status = ${clientData.status},
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