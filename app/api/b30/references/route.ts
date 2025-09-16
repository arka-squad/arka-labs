// B30 API - Reference Data Management
// GET /api/b30/references - Get all reference types and their data
// POST /api/b30/references - Add new reference item

import { NextRequest, NextResponse } from 'next/server';

interface ReferenceItem {
  id: string;
  name: string;
  category: 'skills' | 'tools' | 'tasks' | 'tags' | 'rules' | 'specifications';
  description?: string;
  domain?: string;
  is_active: boolean;
  usage_count: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface ReferencesResponse {
  skills: ReferenceItem[];
  tools: ReferenceItem[];
  tasks: ReferenceItem[];
  tags: ReferenceItem[];
  rules: ReferenceItem[];
  specifications: ReferenceItem[];
}

interface AddReferenceRequest {
  name: string;
  category: 'skills' | 'tools' | 'tasks' | 'tags' | 'rules' | 'specifications';
  description?: string;
  domain?: string;
}

// Mock reference data with French content (multilingual: English schema + French data)
const mockReferences: ReferenceItem[] = [
  // Skills
  { id: 'sk_1', name: 'Analyse financière', category: 'skills', domain: 'Finance', is_active: true, usage_count: 125, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sk_2', name: 'Comptabilité PME', category: 'skills', domain: 'Finance', is_active: true, usage_count: 98, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sk_3', name: 'Audit interne', category: 'skills', domain: 'Finance', is_active: true, usage_count: 76, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sk_4', name: 'Fiscalité', category: 'skills', domain: 'Finance', is_active: true, usage_count: 89, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sk_5', name: 'Reporting financier', category: 'skills', domain: 'Finance', is_active: true, usage_count: 112, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },

  // Tools
  { id: 'tl_1', name: 'Excel Avancé', category: 'tools', is_active: true, usage_count: 234, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tl_2', name: 'SAP Finance', category: 'tools', is_active: true, usage_count: 145, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tl_3', name: 'Sage', category: 'tools', is_active: true, usage_count: 87, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tl_4', name: 'Power BI', category: 'tools', is_active: true, usage_count: 156, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tl_5', name: 'Python Finance', category: 'tools', is_active: true, usage_count: 67, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },

  // Tasks
  { id: 'tk_1', name: 'Établir bilan', category: 'tasks', domain: 'Finance', is_active: true, usage_count: 189, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tk_2', name: 'Analyser cashflow', category: 'tasks', domain: 'Finance', is_active: true, usage_count: 134, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tk_3', name: 'Optimiser fiscalité', category: 'tasks', domain: 'Finance', is_active: true, usage_count: 98, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tk_4', name: 'Contrôle gestion', category: 'tasks', domain: 'Finance', is_active: true, usage_count: 76, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },

  // Tags
  { id: 'tg_1', name: 'PME', category: 'tags', is_active: true, usage_count: 267, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tg_2', name: 'Manufacturing', category: 'tags', is_active: true, usage_count: 156, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tg_3', name: 'Retail', category: 'tags', is_active: true, usage_count: 123, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tg_4', name: 'Expert', category: 'tags', is_active: true, usage_count: 189, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'tg_5', name: '15+ ans exp', category: 'tags', is_active: true, usage_count: 87, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },

  // Rules
  { id: 'rl_1', name: 'Pas de conseil juridique', category: 'rules', is_active: true, usage_count: 234, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'rl_2', name: 'PME < 500 salariés', category: 'rules', is_active: true, usage_count: 156, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'rl_3', name: 'Pas audit externe certifié', category: 'rules', is_active: true, usage_count: 98, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'rl_4', name: 'Focus secteur industriel', category: 'rules', is_active: true, usage_count: 76, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },

  // Specifications
  { id: 'sp_1', name: 'Connaissance', category: 'specifications', is_active: true, usage_count: 345, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sp_2', name: 'Pertinence', category: 'specifications', is_active: true, usage_count: 298, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sp_3', name: 'Invitation', category: 'specifications', is_active: true, usage_count: 267, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sp_4', name: 'Faisabilité', category: 'specifications', is_active: true, usage_count: 234, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sp_5', name: 'Clarification', category: 'specifications', is_active: true, usage_count: 189, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sp_6', name: 'Cadrage', category: 'specifications', is_active: true, usage_count: 156, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sp_7', name: 'DoD', category: 'specifications', is_active: true, usage_count: 123, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
  { id: 'sp_8', name: 'Clarté', category: 'specifications', is_active: true, usage_count: 98, created_by: 'system', created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },
];

// ================================
// GET /api/b30/references
// ================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const domain = searchParams.get('domain');
    const active_only = searchParams.get('active') !== 'false';

    // Filter references
    let filteredReferences = mockReferences.filter(ref =>
      (!category || ref.category === category) &&
      (!domain || ref.domain === domain) &&
      (!active_only || ref.is_active)
    );

    // Group by category
    const groupedReferences: ReferencesResponse = {
      skills: filteredReferences.filter(r => r.category === 'skills').sort((a, b) => b.usage_count - a.usage_count),
      tools: filteredReferences.filter(r => r.category === 'tools').sort((a, b) => b.usage_count - a.usage_count),
      tasks: filteredReferences.filter(r => r.category === 'tasks').sort((a, b) => b.usage_count - a.usage_count),
      tags: filteredReferences.filter(r => r.category === 'tags').sort((a, b) => b.usage_count - a.usage_count),
      rules: filteredReferences.filter(r => r.category === 'rules').sort((a, b) => b.usage_count - a.usage_count),
      specifications: filteredReferences.filter(r => r.category === 'specifications').sort((a, b) => b.usage_count - a.usage_count),
    };

    return NextResponse.json(groupedReferences);

  } catch (error) {
    console.error('Error fetching references:', error);
    return NextResponse.json(
      { error: 'Failed to fetch references', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ================================
// POST /api/b30/references
// ================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AddReferenceRequest;

    // Validate request
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    if (!['skills', 'tools', 'tasks', 'tags', 'rules', 'specifications'].includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Check if already exists
    const exists = mockReferences.find(ref =>
      ref.name.toLowerCase() === body.name.toLowerCase() &&
      ref.category === body.category
    );

    if (exists) {
      return NextResponse.json(
        { error: 'Reference item already exists' },
        { status: 409 }
      );
    }

    // Create new reference item
    const newReference: ReferenceItem = {
      id: `${body.category.substring(0, 2)}_${Date.now()}`,
      name: body.name.trim(),
      category: body.category,
      description: body.description,
      domain: body.domain,
      is_active: true,
      usage_count: 1,
      created_by: 'current-user', // TODO: Get from auth context
      created_at: new Date(),
      updated_at: new Date()
    };

    // TODO: Save to database instead of pushing to mock array
    mockReferences.push(newReference);

    console.log('Created new reference:', newReference.name, 'in category:', newReference.category);

    return NextResponse.json({
      success: true,
      reference: newReference
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating reference:', error);
    return NextResponse.json(
      { error: 'Failed to create reference', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}