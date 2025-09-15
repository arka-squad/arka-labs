import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { withAuth } from '../../../middleware/auth';

export interface CrudOptions<T> {
  tableName: string;
  createSchema: z.ZodSchema<T>;
  updateSchema: z.ZodSchema<Partial<T>>;
  allowedRoles: {
    list: string[];
    create: string[];
    read: string[];
    update: string[];
    delete: string[];
  };
}

interface AuthRequest extends Request {
  user?: { id: string; role: string };
  validatedBody?: any;
}

export function createCrudRouter<T>(options: CrudOptions<T>): Router {
  const router = Router();

  // GET / - Liste avec pagination et filtres
  router.get('/', withAuth(options.allowedRoles.list), async (req: any, res: any) => {
    try {
      const { page = 1, limit = 10, search, status } = req.query;

      let query = db(options.tableName)
        .where('deleted_at', null)
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      if (search) {
        query = query.where('name', 'ilike', `%${search}%`);
      }

      if (status) {
        query = query.where('status', status);
      }

      const [items, count] = await Promise.all([
        query,
        db(options.tableName).where('deleted_at', null).count()
      ]);

      res.json({
        success: true,
        data: items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(count[0].count),
          pages: Math.ceil(Number(count[0].count) / Number(limit))
        }
      });
    } catch (error) {
      console.error('CRUD List Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch items'
      });
    }
  });

  // POST / - Création
  router.post('/', withAuth(options.allowedRoles.create), async (req: any, res: any) => {
    try {
      const validated = await options.createSchema.parseAsync(req.body);

      const [item] = await db(options.tableName)
        .insert({
          ...validated,
          created_by: req.user?.id || 'system'
        })
        .returning('*');

      res.status(201).json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('CRUD Create Error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to create item'
      });
    }
  });

  // GET /:id - Lecture d'un élément
  router.get('/:id', withAuth(options.allowedRoles.read), async (req: any, res: any) => {
    try {
      const item = await db(options.tableName)
        .where('id', req.params.id)
        .where('deleted_at', null)
        .first();

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('CRUD Read Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch item'
      });
    }
  });

  // PATCH /:id - Mise à jour
  router.patch('/:id', withAuth(options.allowedRoles.update), async (req: any, res: any) => {
    try {
      const validated = await options.updateSchema.parseAsync(req.body);

      const [updated] = await db(options.tableName)
        .where('id', req.params.id)
        .where('deleted_at', null)
        .update({
          ...validated,
          updated_at: new Date()
        })
        .returning('*');

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      console.error('CRUD Update Error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to update item'
      });
    }
  });

  // DELETE /:id - Suppression logique
  router.delete('/:id', withAuth(options.allowedRoles.delete), async (req: any, res: any) => {
    try {
      const [deleted] = await db(options.tableName)
        .where('id', req.params.id)
        .where('deleted_at', null)
        .update({
          deleted_at: new Date()
        })
        .returning('id');

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error('CRUD Delete Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete item'
      });
    }
  });

  return router;
}