import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';

// GET /api/folders/:id/roadmap
export const GET = withAuth(['viewer', 'editor', 'admin', 'owner'], async (req, user, { params }) => {
  const { id } = params;
  
  try {
    // Validate folder exists
    const folder = await sql`SELECT id FROM folders WHERE id = ${id}`;
    if (folder.length === 0) {
      return Response.json({ error: 'folder not found' }, { status: 404 });
    }
    
    // Get milestones for this folder
    const milestones = await sql`
      SELECT 
        id,
        title,
        date,
        status,
        dependencies,
        created_at
      FROM folder_milestones 
      WHERE folder_id = ${id}
      ORDER BY date ASC
    `;
    
    // Calculate progress
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'done').length;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    
    // Determine critical path (simple implementation - all milestones in sequence)
    const criticalPath = milestones.map(m => m.id);
    
    return Response.json({
      folder_id: id,
      milestones: milestones.map(m => ({
        ...m,
        dependencies: typeof m.dependencies === 'string' ? JSON.parse(m.dependencies || '[]') : m.dependencies
      })),
      progress,
      critical_path: criticalPath
    });
  } catch (error) {
    console.error('GET /api/folders/:id/roadmap error:', error);
    return Response.json({ error: 'internal server error' }, { status: 500 });
  }
});