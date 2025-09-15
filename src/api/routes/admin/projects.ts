import { z } from 'zod';
import { Router } from 'express';
import { createCrudRouter } from './base-crud';
import { withAuth } from '../../../middleware/auth';

// Schéma de validation pour PROJECTS (structure anglaise)
const ProjectSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['active', 'on_hold', 'completed', 'cancelled']).default('active'),
  deadline: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional()
});

// Création du router CRUD pour projects avec structure anglaise
export const projectsRouter = createCrudRouter({
  tableName: 'projects',
  createSchema: ProjectSchema,
  updateSchema: ProjectSchema.partial(),
  allowedRoles: {
    list: ['admin', 'manager', 'operator', 'viewer'],
    create: ['admin', 'manager'],
    read: ['admin', 'manager', 'operator', 'viewer'],
    update: ['admin', 'manager', 'operator'],
    delete: ['admin']
  }
});

// Middleware pour vérifier que le client existe
projectsRouter.use('/', async (req: any, res: any, next: any) => {
  if (req.method === 'POST' && req.body.client_id) {
    const { db } = await import('../../../lib/db');

    const clientExists = await db('clients')
      .where('id', req.body.client_id)
      .where('deleted_at', null)
      .first();

    if (!clientExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid client_id: client does not exist'
      });
    }
  }
  next();
});

// GET /:id/squads - Récupérer les squads d'un projet (structure anglaise)
projectsRouter.get('/:id/squads', withAuth(['admin', 'manager', 'operator', 'viewer']), async (req: any, res: any) => {
  try {
    const { db } = await import('../../../lib/db');

    const squads = await db('squads')
      .where('project_id', req.params.id)
      .where('deleted_at', null)
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: squads,
      count: squads.length
    });
  } catch (error) {
    console.error('Project Squads Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch squads'
    });
  }
});

// GET /:id/with-client - Récupérer projet avec informations client (structure anglaise)
projectsRouter.get('/:id/with-client', withAuth(['admin', 'manager', 'operator', 'viewer']), async (req: any, res: any) => {
  try {
    const { db } = await import('../../../lib/db');

    const project = await db('projects as p')
      .select(
        'p.*',
        'c.name as client_name',
        'c.sector as client_sector',
        'c.size as client_size',
        'c.status as client_status'
      )
      .leftJoin('clients as c', 'p.client_id', 'c.id')
      .where('p.id', req.params.id)
      .where('p.deleted_at', null)
      .first();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Project With Client Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project with client info'
    });
  }
});

// POST /:id/change-status - Changer le statut d'un projet (structure anglaise)
projectsRouter.post('/:id/change-status', withAuth(['admin', 'manager']), async (req: any, res: any) => {
  try {
    const { status, reason } = req.body;

    if (!['active', 'on_hold', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const { db } = await import('../../../lib/db');

    const [updated] = await db('projects')
      .where('id', req.params.id)
      .where('deleted_at', null)
      .update({
        status,
        updated_at: new Date(),
        ...(status === 'completed' && { completed_at: new Date() })
      })
      .returning('*');

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: updated,
      message: `Project status changed to ${status}`
    });
  } catch (error) {
    console.error('Change Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change status'
    });
  }
});