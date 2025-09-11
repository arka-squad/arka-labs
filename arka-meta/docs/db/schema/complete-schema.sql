-- =====================================
-- Schema complet pour la base de données PostgreSQL locale
-- =====================================

BEGIN;

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- TABLES DE BASE (clients, projects)
-- =====================================

CREATE TABLE clients (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nom VARCHAR(200) NOT NULL,
    email VARCHAR(320),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE projects (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    client_id INTEGER REFERENCES clients(id),
    budget DECIMAL(10,2),
    deadline DATE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    tags JSONB DEFAULT '[]',
    requirements JSONB DEFAULT '[]',
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================
-- ENUMS pour les tables avancées
-- =====================================

CREATE TYPE squad_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE instruction_status AS ENUM ('pending', 'queued', 'routing', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE project_status AS ENUM ('active', 'disabled', 'archived');
CREATE TYPE doc_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE doc_visibility AS ENUM ('client', 'squad', 'admin');

-- =====================================
-- TABLES SQUADS & AGENTS
-- =====================================

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE squad_members (
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

-- =====================================
-- DOCUMENTS PROJET
-- =====================================

CREATE TABLE project_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    status doc_status DEFAULT 'active',
    visibility doc_visibility DEFAULT 'client',
    source VARCHAR(50) DEFAULT 'client',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- DATA DE TEST
-- =====================================

INSERT INTO clients (nom, email) VALUES 
    ('Client Test', 'test@example.com'),
    ('Arka Labs', 'contact@arka-labs.com')
ON CONFLICT DO NOTHING;

INSERT INTO agents (name, role) VALUES 
    ('Agent Test', 'default'),
    ('Claude Code', 'lead')
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- INDEX PERFORMANCE
-- =====================================

CREATE INDEX idx_projects_client_status ON projects(client_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_docs_project_status ON project_docs(project_id, status);
CREATE INDEX idx_squads_status_domain ON squads(status, domain) WHERE deleted_at IS NULL;

COMMIT;