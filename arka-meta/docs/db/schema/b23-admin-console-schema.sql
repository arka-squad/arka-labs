-- =====================================
-- B23 · Console Admin v2 — Database Schema Migration  
-- =====================================

BEGIN;

-- =====================================
-- ENUMS (create first for table constraints)
-- =====================================

CREATE TYPE squad_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE instruction_status AS ENUM ('pending', 'queued', 'routing', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE project_status AS ENUM ('active', 'disabled', 'archived');
CREATE TYPE doc_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE doc_visibility AS ENUM ('client', 'squad', 'admin');

-- =====================================
-- NOUVELLES TABLES (architecture simplifiée)
-- =====================================

-- Squads avec états simples
CREATE TABLE squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 3),
    slug VARCHAR(64) NOT NULL UNIQUE,
    mission TEXT CHECK (LENGTH(mission) <= 800),
    domain VARCHAR(50) NOT NULL CHECK (domain IN ('RH', 'Tech', 'Marketing', 'Finance', 'Ops')),
    status squad_status NOT NULL DEFAULT 'active',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE -- soft delete
);

-- Membres squad (relation Many-to-Many normalisée)
CREATE TABLE squad_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL, -- References agents(id) but agents table may not exist yet
    role VARCHAR(50) NOT NULL CHECK (role IN ('lead', 'specialist', 'contributor')),
    specializations TEXT[] DEFAULT '{}', -- ["onboarding", "formation", "audit"]
    permissions JSONB DEFAULT '{}', -- permissions spécifiques par squad
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(squad_id, agent_id)
);

-- Liaison projets ↔ squads (relation Many-to-Many)
CREATE TABLE project_squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'detached')),
    attached_by VARCHAR(255) NOT NULL,
    attached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    detached_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, squad_id, status) -- Évite doublons actifs
);

-- Instructions simplifiées
CREATE TABLE squad_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (LENGTH(content) BETWEEN 10 AND 2000),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status instruction_status DEFAULT 'pending',
    routing_provider VARCHAR(50), -- claude, gpt, gemini (B21)
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- =====================================
-- EXTENSIONS TABLES EXISTANTES 
-- =====================================

-- Extension projects (états simplifiés)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status project_status DEFAULT 'active';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Créer la table project_docs si elle n'existe pas
CREATE TABLE IF NOT EXISTS project_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extension project_docs (visibilité & contrôle)
ALTER TABLE project_docs ADD COLUMN IF NOT EXISTS status doc_status DEFAULT 'active';
ALTER TABLE project_docs ADD COLUMN IF NOT EXISTS visibility doc_visibility DEFAULT 'client';
ALTER TABLE project_docs ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'client';
ALTER TABLE project_docs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE project_docs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Créer la table agents si elle n'existe pas (pour les FK)
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la FK constraint pour squad_members vers agents maintenant que la table existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'squad_members_agent_id_fkey'
    ) THEN
        ALTER TABLE squad_members ADD CONSTRAINT squad_members_agent_id_fkey 
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================
-- INDEXES PERFORMANCE CRITIQUES
-- =====================================

-- Squads
CREATE INDEX idx_squads_status_domain ON squads(status, domain) WHERE deleted_at IS NULL;
CREATE INDEX idx_squads_created_by ON squads(created_by) WHERE deleted_at IS NULL;

-- Squad members  
CREATE INDEX idx_squad_members_squad ON squad_members(squad_id, status);
CREATE INDEX idx_squad_members_agent ON squad_members(agent_id, status);

-- Project squads
CREATE INDEX idx_project_squads_project ON project_squads(project_id, status);
CREATE INDEX idx_project_squads_squad ON project_squads(squad_id, status);

-- Instructions
CREATE INDEX idx_squad_instructions_squad_status ON squad_instructions(squad_id, status);
CREATE INDEX idx_squad_instructions_project ON squad_instructions(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_squad_instructions_priority ON squad_instructions(priority, created_at) WHERE status IN ('pending', 'queued');

-- Project docs enrichis
CREATE INDEX idx_project_docs_project_status ON project_docs(project_id, status);
CREATE INDEX idx_project_docs_visibility ON project_docs(visibility, status);

COMMIT;