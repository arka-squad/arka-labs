import { z } from 'zod';
import { Router } from 'express';
import { createCrudRouter } from './base-crud';
import { withAuth } from '../../../middleware/auth';

// Schéma de validation pour SQUADS (structure anglaise)
const SquadSchema = z.object({
  project_id: z.string().uuid(),
  client_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['active', 'suspended', 'archived']).default('active'),
  metadata: z.record(z.any()).optional()
});

// Création du router CRUD pour squads avec structure anglaise
export const squadsRouter = createCrudRouter({
  tableName: 'squads',
  createSchema: SquadSchema,
  updateSchema: SquadSchema.partial(),
  allowedRoles: {
    list: ['admin', 'manager', 'operator', 'viewer'],
    create: ['admin', 'manager'],
    read: ['admin', 'manager', 'operator', 'viewer'],
    update: ['admin', 'manager', 'operator'],
    delete: ['admin', 'manager']
  }
});

// Middleware de validation des relations
squadsRouter.use('/', async (req: any, res: any, next: any) => {
  if (req.method === 'POST') {
    const { db } = await import('../../../lib/db');

    // Vérifier que le projet et le client existent et correspondent
    const project = await db('projects')
      .where('id', req.body.project_id)
      .where('deleted_at', null)
      .first();

    if (!project) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project_id'
      });
    }

    if (project.client_id !== req.body.client_id) {
      return res.status(400).json({
        success: false,
        error: 'Client ID does not match project client'
      });
    }
  }
  next();
});

// GET /:id/with-relations - Récupérer une squad avec ses relations (structure anglaise)
squadsRouter.get('/:id/with-relations', withAuth(['admin', 'manager', 'operator']), async (req: any, res: any) => {
  try {
    const { db } = await import('../../../lib/db');

    const squad = await db('squads as s')
      .select(
        's.*',
        'p.name as project_name',
        'p.status as project_status',
        'c.name as client_name',
        'c.sector as client_sector'
      )
      .leftJoin('projects as p', 'p.id', 's.project_id')
      .leftJoin('clients as c', 'c.id', 's.client_id')
      .where('s.id', req.params.id)
      .where('s.deleted_at', null)
      .first();

    if (!squad) {
      return res.status(404).json({
        success: false,
        error: 'Squad not found'
      });
    }

    res.json({
      success: true,
      data: squad
    });
  } catch (error) {
    console.error('Squad With Relations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch squad'
    });
  }
});

// POST /:id/suspend - Suspendre une squad (structure anglaise)
squadsRouter.post('/:id/suspend', withAuth(['admin', 'manager']), async (req: any, res: any) => {
  try {
    const { reason, duration_days } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Reason is required'
      });
    }

    const { db } = await import('../../../lib/db');

    const suspensionData = {
      date: new Date().toISOString(),
      reason,
      duration_days: duration_days || null,
      expected_resume: duration_days ? new Date(Date.now() + duration_days * 86400000).toISOString() : null
    };

    const [updated] = await db('squads')
      .where('id', req.params.id)
      .where('deleted_at', null)
      .update({
        status: 'suspended',
        metadata: db.raw('COALESCE(metadata, \'{}\') || ?', [JSON.stringify({ suspension: suspensionData })]),
        updated_at: new Date()
      })
      .returning('*');

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Squad not found'
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Squad suspended successfully'
    });
  } catch (error) {
    console.error('Suspend Squad Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suspend squad'
    });
  }
});

// POST /:id/reactivate - Réactiver une squad (structure anglaise)
squadsRouter.post('/:id/reactivate', withAuth(['admin', 'manager']), async (req: any, res: any) => {
  try {
    const { db } = await import('../../../lib/db');

    const reactivationData = {
      date: new Date().toISOString()
    };

    const [updated] = await db('squads')
      .where('id', req.params.id)
      .where('deleted_at', null)
      .update({
        status: 'active',
        metadata: db.raw('COALESCE(metadata, \'{}\') || ?', [JSON.stringify({ reactivation: reactivationData })]),
        updated_at: new Date()
      })
      .returning('*');

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Squad not found'
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Squad reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate Squad Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate squad'
    });
  }
});

// GET /by-project/:projectId - Récupérer toutes les squads d'un projet (structure anglaise)
squadsRouter.get('/by-project/:projectId', withAuth(['admin', 'manager', 'operator', 'viewer']), async (req: any, res: any) => {
  try {
    const { db } = await import('../../../lib/db');

    const squads = await db('squads')
      .where('project_id', req.params.projectId)
      .where('deleted_at', null)
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: squads,
      count: squads.length
    });
  } catch (error) {
    console.error('Squads By Project Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch squads'
    });
  }
});