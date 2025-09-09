import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';

// Mock data for development when PostgreSQL is not available
const mockFolders = [
  {
    id: 'coworking-q4',
    title: 'Journée Coworking Q4',
    status: 'active',
    vision: {
      objectif: 'Organiser journée coworking RH + plan formation Q4',
      livrable: 'Synthèse écrite, planning validé, décisions actées',
      contraintes: ['Budget ≤ 1k€', 'Salle J-7', 'Docs Q3 disponibles'],
      succes: ['3 décisions actées', 'Planning assigné', 'Feedback collecté']
    },
    context: {
      guided_notes: [
        {
          id: 'ctx1',
          type: 'agent_question',
          content: 'Quel est le nombre de participants attendu?',
          agent: 'heloise-rh'
        },
        {
          id: 'ctx2',
          type: 'user_note',
          content: 'Attention sécurité incendie - sortie de secours côté est'
        }
      ],
      completion: 75
    },
    agents: [
      {
        id: 'heloise-rh',
        name: 'Héloïse RH',
        role: 'A',
        load: 65,
        status: 'active'
      },
      {
        id: 'agp-gate',
        name: 'AGP Gate',
        role: 'R',
        load: 20,
        status: 'available'
      }
    ],
    stats: {
      docs_total: 5,
      docs_tested: 3,
      agents_assigned: 2,
      roadmap_progress: 60
    },
    updated_at: '2025-09-08T10:00:00Z'
  }
];

// GET /api/folders - List folders
export const GET = withAuth(['viewer', 'editor', 'admin', 'owner'], 
  async (req: NextRequest) => {
    const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
    
    try {
      // Check if PostgreSQL is configured
      if (!process.env.POSTGRES_URL) {
        console.log('PostgreSQL not configured, using mock data');
        return NextResponse.json({ 
          items: mockFolders,
          total: mockFolders.length,
          trace_id: traceId 
        });
      }

      // Try to load PostgreSQL module and query database
      const { sql } = await import('@/lib/db');
      const folders = await sql`
        SELECT 
          f.id,
          f.title,
          f.status,
          f.vision,
          f.context,
          f.agents,
          f.stats,
          f.updated_at
        FROM folders f
        ORDER BY f.updated_at DESC
      `;

      return NextResponse.json({ 
        items: folders,
        total: folders.length,
        trace_id: traceId 
      });
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      
      // Fallback to mock data if database fails
      console.log('Database failed, falling back to mock data');
      return NextResponse.json({ 
        items: mockFolders,
        total: mockFolders.length,
        trace_id: traceId 
      });
    }
  }
);

// POST /api/folders - Create new folder
export const POST = withAuth(['editor', 'admin', 'owner'],
  async (req: NextRequest) => {
    const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
    let title = 'New Folder';
    let vision = { objectif: 'À définir', livrable: 'À définir', contraintes: [], succes: [] };
    let context = { guided_notes: [], completion: 0 };
    
    try {
      const body = await req.json();
      ({ title, vision, context } = body);

      if (!title || !vision) {
        return NextResponse.json({
          code: 'ERR_VALIDATION_FAILED',
          message: 'Title and vision are required',
          details: { required_fields: ['title', 'vision'] },
          trace_id: traceId
        }, { status: 400 });
      }

      // Check if PostgreSQL is configured
      if (!process.env.POSTGRES_URL) {
        console.log('PostgreSQL not configured, simulating folder creation');
        const newFolder = {
          id: `folder-${Date.now()}`,
          title,
          status: 'pending',
          vision,
          context: context || { guided_notes: [], completion: 0 },
          agents: [],
          stats: { docs_total: 0, docs_tested: 0, agents_assigned: 0, roadmap_progress: 0 },
          updated_at: new Date().toISOString()
        };

        // Add to mock data (in-memory only)
        mockFolders.push(newFolder);
        
        return NextResponse.json({
          folder: newFolder,
          trace_id: traceId
        }, { status: 201 });
      }

      // Try database creation
      const { sql } = await import('@/lib/db');
      const [folder] = await sql`
        INSERT INTO folders (title, status, vision, context, agents, stats, created_at, updated_at)
        VALUES (
          ${title},
          'pending',
          ${JSON.stringify(vision)},
          ${JSON.stringify(context || { guided_notes: [], completion: 0 })},
          ${JSON.stringify([])},
          ${JSON.stringify({ docs_total: 0, docs_tested: 0, agents_assigned: 0, roadmap_progress: 0 })},
          NOW(),
          NOW()
        )
        RETURNING *
      `;

      return NextResponse.json({
        folder,
        trace_id: traceId
      }, { status: 201 });
    } catch (error) {
      console.error('Failed to create folder:', error);
      
      // Fallback to mock creation
      const newFolder = {
        id: `folder-${Date.now()}`,
        title,
        status: 'pending',
        vision,
        context,
        agents: [],
        stats: { docs_total: 0, docs_tested: 0, agents_assigned: 0, roadmap_progress: 0 },
        updated_at: new Date().toISOString()
      };
      
      return NextResponse.json({
        folder: newFolder,
        trace_id: traceId
      }, { status: 201 });
    }
  }
);