import { z } from 'zod';
import { createCrudRouter } from './base-crud';

// Schéma de validation pour structure ANGLAISE
const ClientSchema = z.object({
  name: z.string().min(1).max(255),
  sector: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  primary_contact: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional()
  }).optional(),
  specific_context: z.string().optional()
});

// Création du router CRUD pour clients avec structure anglaise
export const clientsRouter = createCrudRouter({
  tableName: 'clients',
  createSchema: ClientSchema,
  updateSchema: ClientSchema.partial(),
  allowedRoles: {
    list: ['admin', 'manager', 'operator', 'viewer'],
    create: ['admin', 'manager'],
    read: ['admin', 'manager', 'operator', 'viewer'],
    update: ['admin', 'manager'],
    delete: ['admin']
  }
});

// Routes additionnelles spécifiques aux clients (avec structure anglaise)
clientsRouter.get('/:id/projects', async (req: any, res: any) => {
  try {
    const { db } = await import('../../../lib/db');

    const projects = await db('projects')
      .where('client_id', req.params.id)
      .where('deleted_at', null)
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Client Projects Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
});

clientsRouter.get('/:id/squads', async (req: any, res: any) => {
  try {
    const { db } = await import('../../../lib/db');

    const squads = await db('squads')
      .where('client_id', req.params.id)
      .where('deleted_at', null)
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: squads
    });
  } catch (error) {
    console.error('Client Squads Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch squads'
    });
  }
});