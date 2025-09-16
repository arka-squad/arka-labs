// B30 - Database Connection Manager
// PostgreSQL connection pool and query utilities

import { Pool, PoolClient, QueryResult } from 'pg';

// Configuration de la connexion PostgreSQL
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Pool de connexions global
let pool: Pool | null = null;

// Fonction pour obtenir le pool de connexions
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);

    // Gestion des erreurs de pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

// Fonction pour exécuter une requête simple
export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log des requêtes lentes en développement
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log('Slow query detected:', {
        text,
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }

    return result;
  } catch (error) {
    console.error('Database query error:', {
      text,
      params,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
}

// Fonction pour exécuter une transaction
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Fonction pour obtenir un client de connexion
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

// Fonction pour fermer le pool (utile pour les tests)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Utilitaires pour les requêtes courantes

// Requête avec pagination cursor-based
export interface PaginationOptions {
  cursor?: string;
  limit: number;
  orderBy: string;
  orderDirection: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasNext: boolean;
  hasPrevious: boolean;
  totalCount: number;
}

export async function queryWithPagination<T>(
  baseQuery: string,
  countQuery: string,
  params: any[],
  options: PaginationOptions
): Promise<PaginatedResult<T>> {
  const { cursor, limit, orderBy, orderDirection } = options;

  // Construire la requête avec pagination
  let paginatedQuery = `${baseQuery} ORDER BY ${orderBy} ${orderDirection}`;

  if (cursor) {
    // TODO: Implémenter la logique de cursor-based pagination
    // Pour l'instant, utiliser OFFSET simple
    paginatedQuery += ` OFFSET ${parseInt(cursor, 10)}`;
  }

  paginatedQuery += ` LIMIT ${limit + 1}`; // +1 pour détecter s'il y a une page suivante

  // Exécuter les requêtes en parallèle
  const [dataResult, countResult] = await Promise.all([
    query<T>(paginatedQuery, params),
    query<{ count: string }>(countQuery, params)
  ]);

  const rows = dataResult.rows;
  const hasNext = rows.length > limit;
  const data = hasNext ? rows.slice(0, -1) : rows;
  const totalCount = parseInt(countResult.rows[0].count, 10);

  return {
    data,
    nextCursor: hasNext ? String((cursor ? parseInt(cursor, 10) : 0) + limit) : undefined,
    hasNext,
    hasPrevious: cursor ? parseInt(cursor, 10) > 0 : false,
    totalCount
  };
}

// Fonction pour construire des conditions WHERE dynamiques
export function buildWhereClause(
  conditions: Record<string, any>,
  startIndex = 1
): { clause: string; params: any[]; nextIndex: number } {
  const clauses: string[] = [];
  const params: any[] = [];
  let paramIndex = startIndex;

  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          clauses.push(`${key} = ANY($${paramIndex})`);
          params.push(value);
          paramIndex++;
        }
      } else {
        clauses.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }
  });

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
    nextIndex: paramIndex
  };
}

// Fonction pour l'insertion avec retour d'ID
export async function insertAndReturn<T>(
  table: string,
  data: Record<string, any>,
  returning = 'id'
): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, index) => `$${index + 1}`);

  const queryText = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING ${returning}
  `;

  const result = await query<T>(queryText, values);
  return result.rows[0];
}

// Fonction pour la mise à jour avec conditions
export async function updateWhere<T>(
  table: string,
  data: Record<string, any>,
  conditions: Record<string, any>,
  returning = 'id'
): Promise<T[]> {
  const updateKeys = Object.keys(data);
  const updateValues = Object.values(data);

  const setClause = updateKeys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  const { clause: whereClause, params: whereParams } = buildWhereClause(
    conditions,
    updateKeys.length + 1
  );

  const queryText = `
    UPDATE ${table}
    SET ${setClause}
    ${whereClause}
    RETURNING ${returning}
  `;

  const result = await query<T>(queryText, [...updateValues, ...whereParams]);
  return result.rows;
}

// Test de connexion
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Types utiles pour TypeScript
export interface DatabaseRow {
  [key: string]: any;
}

export interface QueryOptions {
  timeout?: number;
  retries?: number;
}

// TODO: Ajouter des fonctions spécifiques aux profils B30
export const ProfilQueries = {
  // Ces fonctions seront implémentées pour remplacer les mocks dans les APIs
  async findById(id: string) {
    // TODO: Implémenter la requête réelle
    return null;
  },

  async findMany(filters: any) {
    // TODO: Implémenter la requête avec filtres
    return { data: [], totalCount: 0 };
  },

  async create(profilData: any) {
    // TODO: Implémenter l'insertion avec transaction pour profil + sections
    return null;
  },

  async update(id: string, updates: any) {
    // TODO: Implémenter la mise à jour
    return null;
  },

  async delete(id: string) {
    // TODO: Implémenter la suppression (soft delete)
    return null;
  }
};