-- =====================================
-- B23 v2.5 Backend Foundation - Complete Schema
-- Migration: 2025-09-09_b23_v25_backend_schema
-- =====================================

BEGIN;

-- =====================================
-- CLIENTS TABLE (référentiel central)
-- =====================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(200) NOT NULL CHECK (LENGTH(nom) >= 2),
    secteur VARCHAR(100), -- "PME Industrie", "Grande distribution", etc.
    taille VARCHAR(10) CHECK (taille IN ('TPE', 'PME', 'ETI', 'GE')) DEFAULT 'PME',
    contact_principal JSONB, -- {"nom": "...", "email": "...", "telephone": "..."}
    contexte_specifique TEXT, -- Infos client pour adaptation agents
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'archive')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================
-- AGENTS TABLE (avec versioning + metadata)
-- =====================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    domaine VARCHAR(50) CHECK (domaine IN ('RH', 'Tech', 'Marketing', 'Finance', 'Ops')) DEFAULT 'Tech',
    version VARCHAR(10) DEFAULT '1.0',
    description TEXT,
    tags JSONB DEFAULT '[]',
    prompt_system TEXT NOT NULL,
    temperature DECIMAL(2,1) DEFAULT 0.7 CHECK (temperature >= 0.0 AND temperature <= 2.0),
    max_tokens INTEGER DEFAULT 2048 CHECK (max_tokens > 0),
    is_template BOOLEAN DEFAULT false,
    original_agent_id UUID REFERENCES agents(id), -- Pour duplications
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================
-- PROJECTS TABLE (entité centrale avec client_id)
-- =====================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(200) NOT NULL CHECK (LENGTH(nom) >= 3),
    description TEXT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    budget DECIMAL(10,2), -- en euros avec décimales
    deadline DATE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'archived')),
    tags JSONB DEFAULT '[]',
    requirements JSONB DEFAULT '[]',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================
-- PROJECT ASSIGNMENTS (Projects ↔ Agents)
-- =====================================
CREATE TABLE IF NOT EXISTS project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, agent_id) -- Un agent max 1 fois par projet
);

-- =====================================
-- SQUADS TABLE (si nécessaire pour l'existant)
-- =====================================
CREATE TABLE IF NOT EXISTS squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 3),
    slug VARCHAR(64) NOT NULL UNIQUE,
    mission TEXT CHECK (LENGTH(mission) <= 800),
    domain VARCHAR(50) NOT NULL CHECK (domain IN ('RH', 'Tech', 'Marketing', 'Finance', 'Ops')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================
-- INDEXES PERFORMANCE CRITIQUES
-- =====================================

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_secteur ON clients(secteur) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom) WHERE deleted_at IS NULL;

-- Agents
CREATE INDEX IF NOT EXISTS idx_agents_domaine_status ON agents(domaine, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agents_template ON agents(is_template, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agents_original ON agents(original_agent_id) WHERE original_agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents(created_by) WHERE deleted_at IS NULL;

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_client_status ON projects(client_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline) WHERE deadline IS NOT NULL AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_projects_priority_status ON projects(priority, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by) WHERE deleted_at IS NULL;

-- Project Assignments
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id, status);
CREATE INDEX IF NOT EXISTS idx_project_assignments_agent ON project_assignments(agent_id, status);

-- Squads (si utilisé)
CREATE INDEX IF NOT EXISTS idx_squads_status_domain ON squads(status, domain) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_squads_created_by ON squads(created_by) WHERE deleted_at IS NULL;

-- =====================================
-- TRIGGERS POUR MISE À JOUR AUTO
-- =====================================

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer les triggers updated_at
DROP TRIGGER IF EXISTS trigger_update_updated_at_clients ON clients;
CREATE TRIGGER trigger_update_updated_at_clients
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_updated_at_agents ON agents;
CREATE TRIGGER trigger_update_updated_at_agents
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_updated_at_projects ON projects;
CREATE TRIGGER trigger_update_updated_at_projects
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_updated_at_project_assignments ON project_assignments;
CREATE TRIGGER trigger_update_updated_at_project_assignments
    BEFORE UPDATE ON project_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;