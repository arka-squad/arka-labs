import { Router } from 'express';
import { clientsRouter } from './clients';
import { projectsRouter } from './projects';
import { squadsRouter } from './squads';

const adminRouter = Router();

// Montage des routes métier avec structure anglaise
adminRouter.use('/clients', clientsRouter);
adminRouter.use('/projects', projectsRouter);
adminRouter.use('/squads', squadsRouter);

// Route de health check admin
adminRouter.get('/health', async (req, res) => {
  try {
    const { db } = await import('../../../lib/db');

    // Test des 3 tables principales avec structure anglaise
    const stats = await db.raw(`
      SELECT
        (SELECT COUNT(*) FROM clients WHERE deleted_at IS NULL) as total_clients,
        (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL) as total_projects,
        (SELECT COUNT(*) FROM squads WHERE deleted_at IS NULL) as total_squads,
        (SELECT COUNT(*) FROM clients WHERE deleted_at IS NULL AND status = 'active') as active_clients,
        (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL AND status = 'active') as active_projects,
        (SELECT COUNT(*) FROM squads WHERE deleted_at IS NULL AND status = 'active') as active_squads
    `);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      structure: 'english_b29',
      endpoints: {
        clients: '/api/admin/clients',
        projects: '/api/admin/projects',
        squads: '/api/admin/squads'
      },
      statistics: stats.rows[0]
    });
  } catch (error) {
    console.error('Admin Health Check Error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

// Route de test des relations avec structure anglaise
adminRouter.get('/test-relations', async (req, res) => {
  try {
    const { db } = await import('../../../lib/db');

    // Test de la jointure complète qui plantait avant avec structure FR
    const fullJoin = await db('clients as c')
      .select(
        'c.id as client_id',
        'c.name as client_name',          // ✅ Structure anglaise
        'c.sector as client_sector',      // ✅ Plus de confusion secteur/sector
        'c.status as client_status',      // ✅ Plus de confusion statut/status
        'p.id as project_id',
        'p.name as project_name',         // ✅ Plus de confusion nom/name
        'p.status as project_status',     // ✅ Cohérent
        's.id as squad_id',
        's.name as squad_name',           // ✅ Squads déjà en anglais
        's.status as squad_status'
      )
      .leftJoin('projects as p', 'p.client_id', 'c.id')
      .leftJoin('squads as s', 's.project_id', 'p.id')
      .where('c.deleted_at', null)
      .limit(5);

    res.json({
      success: true,
      message: 'Jointure complète réussie - plus de problème FR-EN!',
      data: fullJoin,
      count: fullJoin.length
    });
  } catch (error) {
    console.error('Relations Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'Relations test failed'
    });
  }
});

export { adminRouter };