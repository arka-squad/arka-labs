import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function GET() {
  try {
    // Test database connection
    const dbConfig = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    };
    
    // Try to connect and test the database
    let dbStatus = {
      connected: false,
      tablesExist: false,
      clientsTable: false,
      error: null as any
    };
    
    try {
      const db = getDb();
      
      // Test connection with a simple query
      const testResult = await db.query('SELECT 1 as test');
      dbStatus.connected = true;
      
      // Check if clients table exists
      const tablesResult = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `);
      
      dbStatus.tablesExist = tablesResult.rows.length > 0;
      dbStatus.clientsTable = tablesResult.rows.some((row: any) => row.table_name === 'clients');
      
      // Check columns of clients table if it exists
      let clientsSchema = null;
      if (dbStatus.clientsTable) {
        const columnsResult = await db.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'clients'
        `);
        clientsSchema = columnsResult.rows;
      }
      
      return NextResponse.json({
        success: true,
        config: dbConfig,
        database: dbStatus,
        tables: tablesResult.rows.map((r: any) => r.table_name),
        clientsSchema
      });
      
    } catch (dbError: any) {
      dbStatus.error = dbError.message;
      
      return NextResponse.json({
        success: false,
        config: dbConfig,
        database: dbStatus,
        error: dbError.message
      });
    }
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}