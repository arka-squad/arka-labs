import express from 'express';
import cors from 'cors';
import { adminRouter } from './routes/admin';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes API admin complètes avec structure anglaise
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { testConnection } = await import('../lib/db');
    const dbHealthy = await testConnection();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
      structure: 'english_b29'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

// Route de test structure anglaise
app.get('/api/test/structure', async (req, res) => {
  try {
    const { db } = await import('../lib/db');

    const testQuery = await db.raw(`
      SELECT
        'clients' as table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_name IN ('clients', 'projects', 'squads')
      AND column_name IN ('name', 'status', 'sector', 'size')
      ORDER BY table_name, column_name
    `);

    res.json({
      success: true,
      message: 'Structure anglaise B29 confirmée',
      columns: testQuery.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Structure test failed'
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API B29 running on port ${PORT}`);
  console.log(`📊 Structure: English (name, status, sector, size)`);
});