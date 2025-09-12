import { NextRequest, NextResponse } from 'next/server';
import { requireViewer } from '@/lib/rbac-admin-b24';
import { sql, getDb } from '@/lib/db';
import { log } from '@/lib/logger';

// GET /api/admin/agents/templates - List all agent templates
export const GET = requireViewer()(
  async (req: NextRequest, user: any) => {
    try {
      const url = new URL(req.url);
      const category = url.searchParams.get('category');
      const difficulty = url.searchParams.get('difficulty');
      const active_only = url.searchParams.get('active_only') !== 'false';

      let query = `
        SELECT 
          id,
          name,
          slug,
          category,
          description,
          base_prompt,
          default_config,
          capabilities,
          required_integrations,
          preview_tasks,
          difficulty_level,
          estimated_setup_minutes,
          version,
          is_active,
          tags,
          created_at,
          (
            SELECT COUNT(*) FROM agent_instances 
            WHERE template_id = agent_templates.id
          ) as usage_count
        FROM agent_templates
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (active_only) {
        query += ` AND is_active = true`;
      }

      if (category) {
        query += ` AND category = $${paramIndex++}`;
        params.push(category);
      }

      if (difficulty) {
        query += ` AND difficulty_level = $${paramIndex++}`;
        params.push(difficulty);
      }

      query += ` ORDER BY category, name`;

      const db = getDb();
      const result = await db.query(query, params);
      const templates = result.rows;

      // Group templates by category for better UI presentation
      const groupedTemplates = templates.reduce((acc: any, template: any) => {
        if (!acc[template.category]) {
          acc[template.category] = [];
        }
        acc[template.category].push({
          ...template,
          capabilities: template.capabilities || [],
          required_integrations: template.required_integrations || [],
          preview_tasks: template.preview_tasks || [],
          tags: template.tags || [],
          usage_count: parseInt(template.usage_count || 0)
        });
        return acc;
      }, {});

      log('info', 'templates_listed', { 
        route: '/api/admin/agents/templates', 
        status: 200,
        user: user.email,
        count: templates.length,
        filters: { category, difficulty, active_only }
      });

      return NextResponse.json({
        templates: groupedTemplates,
        total: templates.length,
        categories: Object.keys(groupedTemplates)
      });

    } catch (error) {
      log('error', 'templates_list_failed', { 
        route: '/api/admin/agents/templates', 
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }
  }
);