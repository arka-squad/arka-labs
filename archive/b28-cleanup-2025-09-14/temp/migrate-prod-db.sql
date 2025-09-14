BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'squad_status') THEN
        CREATE TYPE squad_status AS ENUM ('active', 'inactive', 'archived');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'instruction_status') THEN
        CREATE TYPE instruction_status AS ENUM ('pending', 'queued', 'routing', 'processing', 'completed', 'failed', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('active', 'disabled', 'archived');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_status') THEN
        CREATE TYPE doc_status AS ENUM ('active', 'inactive', 'archived');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_visibility') THEN
        CREATE TYPE doc_visibility AS ENUM ('client', 'squad', 'admin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_size') THEN
        CREATE TYPE client_size AS ENUM ('TPE', 'PME', 'ETI', 'GE');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_status') THEN
        CREATE TYPE client_status AS ENUM ('actif', 'inactif', 'archive');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_priority') THEN
        CREATE TYPE project_priority AS ENUM ('low', 'normal', 'high', 'urgent');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(200) NOT NULL CHECK (LENGTH(nom) >= 2),
    secteur VARCHAR(100),
    taille client_size DEFAULT 'PME',
    contact_principal JSONB DEFAULT '{}',
    contexte_specifique TEXT CHECK (LENGTH(contexte_specifique) <= 2000),
    statut client_status DEFAULT 'actif',
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 3),
    slug VARCHAR(64) NOT NULL UNIQUE,
    mission TEXT CHECK (LENGTH(mission) <= 800),
    domain VARCHAR(50) NOT NULL CHECK (domain IN ('RH', 'Tech', 'Marketing', 'Finance', 'Ops')),
    status squad_status NOT NULL DEFAULT 'active',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS squad_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('lead', 'specialist', 'contributor')),
    specializations TEXT[] DEFAULT '{}',
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(squad_id, agent_id)
);

CREATE TABLE IF NOT EXISTS project_squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'detached')),
    attached_by VARCHAR(255) NOT NULL,
    attached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    detached_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, squad_id, status)
);

CREATE TABLE IF NOT EXISTS project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    assigned_by VARCHAR(255),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, agent_id, status)
);

CREATE TABLE IF NOT EXISTS squad_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (LENGTH(content) BETWEEN 10 AND 2000),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status instruction_status DEFAULT 'pending',
    routing_provider VARCHAR(50),
    response_time_ms INTEGER,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_id') THEN
        ALTER TABLE projects ADD COLUMN client_id UUID REFERENCES clients(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'description') THEN
        ALTER TABLE projects ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'budget') THEN
        ALTER TABLE projects ADD COLUMN budget DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deadline') THEN
        ALTER TABLE projects ADD COLUMN deadline DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'priority') THEN
        ALTER TABLE projects ADD COLUMN priority project_priority DEFAULT 'normal';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status') THEN
        ALTER TABLE projects ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'tags') THEN
        ALTER TABLE projects ADD COLUMN tags JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'requirements') THEN
        ALTER TABLE projects ADD COLUMN requirements JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deleted_at') THEN
        ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'domaine') THEN
        ALTER TABLE agents ADD COLUMN domaine VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'version') THEN
        ALTER TABLE agents ADD COLUMN version VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'description') THEN
        ALTER TABLE agents ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'tags') THEN
        ALTER TABLE agents ADD COLUMN tags JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'temperature') THEN
        ALTER TABLE agents ADD COLUMN temperature DECIMAL(3,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'max_tokens') THEN
        ALTER TABLE agents ADD COLUMN max_tokens INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'deleted_at') THEN
        ALTER TABLE agents ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_taille ON clients(taille) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_secteur ON clients USING gin(to_tsvector('french', secteur)) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority, created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline) WHERE deadline IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_squads_status_domain ON squads(status, domain) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_squads_created_by ON squads(created_by) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_squad_members_squad ON squad_members(squad_id, status);
CREATE INDEX IF NOT EXISTS idx_squad_members_agent ON squad_members(agent_id, status);

CREATE INDEX IF NOT EXISTS idx_project_squads_project ON project_squads(project_id, status);
CREATE INDEX IF NOT EXISTS idx_project_squads_squad ON project_squads(squad_id, status);

CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id, status);
CREATE INDEX IF NOT EXISTS idx_project_assignments_agent ON project_assignments(agent_id, status);

CREATE INDEX IF NOT EXISTS idx_squad_instructions_squad_status ON squad_instructions(squad_id, status);
CREATE INDEX IF NOT EXISTS idx_squad_instructions_project ON squad_instructions(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_squad_instructions_priority ON squad_instructions(priority, created_at) WHERE status IN ('pending', 'queued');

CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agents_domaine ON agents(domaine) WHERE deleted_at IS NULL;

COMMIT;