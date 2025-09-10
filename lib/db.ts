import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'arka_dev.db');
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize database with tables if they don't exist
    initializeTables();
  }
  return db;
}

function initializeTables() {
  const database = getDb();
  
  // Create tables for B23 v2.5 backend
  database.exec(`
    -- Clients table
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      nom TEXT NOT NULL CHECK (length(nom) >= 2),
      secteur TEXT,
      taille TEXT CHECK (taille IN ('TPE', 'PME', 'ETI', 'GE')) DEFAULT 'PME',
      contact_principal TEXT, -- JSON string
      contexte_specifique TEXT,
      statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'archive')),
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME
    );

    -- Agents table
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      domaine TEXT CHECK (domaine IN ('RH', 'Tech', 'Marketing', 'Finance', 'Ops')) DEFAULT 'Tech',
      version TEXT DEFAULT '1.0',
      description TEXT,
      tags TEXT DEFAULT '[]', -- JSON string
      prompt_system TEXT NOT NULL,
      temperature REAL DEFAULT 0.7 CHECK (temperature >= 0.0 AND temperature <= 2.0),
      max_tokens INTEGER DEFAULT 2048 CHECK (max_tokens > 0),
      is_template INTEGER DEFAULT 0, -- SQLite boolean
      original_agent_id TEXT REFERENCES agents(id),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME
    );

    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      nom TEXT NOT NULL CHECK (length(nom) >= 3),
      description TEXT,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      budget REAL,
      deadline DATE,
      priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'archived')),
      tags TEXT DEFAULT '[]', -- JSON string
      requirements TEXT DEFAULT '[]', -- JSON string
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME
    );

    -- Project assignments table
    CREATE TABLE IF NOT EXISTS project_assignments (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_id, agent_id)
    );

    -- Squads table (if needed for existing functionality)
    CREATE TABLE IF NOT EXISTS squads (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      name TEXT NOT NULL CHECK (length(name) >= 3),
      slug TEXT NOT NULL UNIQUE,
      mission TEXT CHECK (length(mission) <= 800),
      domain TEXT NOT NULL CHECK (domain IN ('RH', 'Tech', 'Marketing', 'Finance', 'Ops')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME
    );

    -- Squad members table (for compatibility with existing interface)
    CREATE TABLE IF NOT EXISTS squad_members (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      squad_id TEXT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(squad_id, agent_id)
    );

    -- Project squads table (for compatibility with existing interface)
    CREATE TABLE IF NOT EXISTS project_squads (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      squad_id TEXT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_id, squad_id)
    );

    -- Squad instructions table (for compatibility with existing interface)
    CREATE TABLE IF NOT EXISTS squad_instructions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      squad_id TEXT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      created_by TEXT
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_agents_domaine_status ON agents(domaine, status) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_projects_client_status ON projects(client_id, status) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id, status);
    CREATE INDEX IF NOT EXISTS idx_project_assignments_agent ON project_assignments(agent_id, status);
    CREATE INDEX IF NOT EXISTS idx_squad_members_squad ON squad_members(squad_id, status);
    CREATE INDEX IF NOT EXISTS idx_project_squads_project ON project_squads(project_id, status);
    CREATE INDEX IF NOT EXISTS idx_squad_instructions_squad ON squad_instructions(squad_id, status);
  `);
}

// Custom SQL template tag that works with SQLite
export function sql(strings: TemplateStringsArray, ...values: any[]) {
  const database = getDb();
  
  // Build the query string for SQLite (uses ? placeholders)
  let query = '';
  const params: any[] = [];
  
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    
    if (i < values.length) {
      const value = values[i];
      
      // Handle raw SQL fragments (for dynamic WHERE clauses)
      if (value && typeof value === 'object' && value.type === 'raw') {
        query += value.text;
      } else {
        query += '?';
        params.push(value);
      }
    }
  }
  
  try {
    const stmt = database.prepare(query);
    const result = stmt.all(...params);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
}

// Helper for raw SQL fragments
sql.raw = (text: string) => ({ type: 'raw', text });
