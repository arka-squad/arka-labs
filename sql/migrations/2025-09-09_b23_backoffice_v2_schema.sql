-- =====================================
-- B23 · Backoffice Admin v2 - Schema Database (Architecture projet-centrée)
-- Migration: 2025-09-09_b23_backoffice_v2_schema
-- =====================================

-- Créer les types ENUM requis
CREATE TYPE projet_statut AS ENUM ('actif', 'inactif', 'archive', 'termine');
CREATE TYPE projet_priorite AS ENUM ('basse', 'normale', 'haute', 'urgente');

-- =====================================
-- NOUVELLES TABLES (architecture projet-centrée)
-- =====================================

-- Clients (référentiel)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(200) NOT NULL CHECK (LENGTH(nom) >= 2),
    secteur VARCHAR(100), -- "PME Industrie", "Grande distribution", etc.
    taille VARCHAR(50) CHECK (taille IN ('TPE', 'PME', 'ETI', 'GE')), -- Taille entreprise
    contact_principal JSONB, -- {"nom": "...", "email": "...", "telephone": "..."}
    contexte_specifique TEXT, -- Infos client pour adaptation agents
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'archive')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Projets (entité centrale)
CREATE TABLE projets (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL CHECK (LENGTH(nom) >= 3),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    statut projet_statut DEFAULT 'actif',
    priorite projet_priorite DEFAULT 'normale',
    budget INTEGER, -- en euros
    deadline DATE,
    description TEXT,
    contexte_mission TEXT, -- Contexte spécifique pour adaptation agents
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Assignations squads à projets (relation Many-to-Many)
CREATE TABLE project_squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    attached_by VARCHAR(255) NOT NULL,
    attached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, squad_id) -- Une squad max 1 fois par projet
);

-- Assignations agents à projets (relation Many-to-Many avec adaptation)
CREATE TABLE projet_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projet_id INTEGER NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    source VARCHAR(20) NOT NULL CHECK (source IN ('direct', 'squad')), -- Comment l'agent est arrivé
    squad_id UUID REFERENCES squads(id) ON DELETE SET NULL, -- Si via squad
    prompt_adaptation TEXT, -- Adaptation contexte client/mission
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif')),
    assigned_by VARCHAR(255) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(projet_id, agent_id) -- Un agent max 1 fois par projet
);

-- Table de gestion des permissions/ownership sur les projets
CREATE TABLE project_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'manager', 'operator')),
    granted_by VARCHAR(255) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id) -- Un utilisateur max 1 rôle par projet
);

-- =====================================
-- EXTENSIONS TABLES EXISTANTES
-- =====================================

-- Extension squads (simplifiée pour backoffice)
ALTER TABLE squads ADD COLUMN IF NOT EXISTS domaine VARCHAR(50) NOT NULL DEFAULT 'General';
ALTER TABLE squads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE squads ADD COLUMN IF NOT EXISTS agents_count INTEGER DEFAULT 0;

-- Extension agents (versioning + metadata)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS domaine VARCHAR(50) NOT NULL DEFAULT 'General';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS original_agent_id UUID REFERENCES agents(id); -- Pour duplications
ALTER TABLE agents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false; -- Agent modèle vs instance

-- =====================================
-- INDEXES PERFORMANCE OPTIMISÉS
-- =====================================

-- Clients
CREATE INDEX idx_clients_statut ON clients(statut) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_secteur ON clients(secteur) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_created_by ON clients(created_by) WHERE deleted_at IS NULL;

-- Projets  
CREATE INDEX idx_projets_client_statut ON projets(client_id, statut) WHERE deleted_at IS NULL;
CREATE INDEX idx_projets_deadline ON projets(deadline) WHERE deadline IS NOT NULL AND statut = 'actif';
CREATE INDEX idx_projets_created_by ON projets(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_projets_statut ON projets(statut) WHERE deleted_at IS NULL;

-- Project squads
CREATE INDEX idx_project_squads_project ON project_squads(project_id, status);
CREATE INDEX idx_project_squads_squad ON project_squads(squad_id, status);

-- Projet agents
CREATE INDEX idx_projet_agents_projet ON projet_agents(projet_id, statut);
CREATE INDEX idx_projet_agents_agent ON projet_agents(agent_id, statut);
CREATE INDEX idx_projet_agents_squad ON projet_agents(squad_id) WHERE squad_id IS NOT NULL;

-- Project permissions
CREATE INDEX idx_project_permissions_project ON project_permissions(project_id, role);
CREATE INDEX idx_project_permissions_user ON project_permissions(user_id, role);

-- Agents enrichis
CREATE INDEX idx_agents_domaine_template ON agents(domaine, is_template) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_original ON agents(original_agent_id) WHERE original_agent_id IS NOT NULL;

-- =====================================
-- TRIGGERS POUR MISE À JOUR AUTO
-- =====================================

-- Trigger pour mettre à jour agents_count dans squads
CREATE OR REPLACE FUNCTION update_squad_agents_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE squads SET agents_count = (
        SELECT COUNT(DISTINCT sa.agent_id)
        FROM squad_agents sa
        WHERE sa.squad_id = COALESCE(NEW.squad_id, OLD.squad_id)
        AND sa.status = 'active'
    ) WHERE id = COALESCE(NEW.squad_id, OLD.squad_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer les triggers
CREATE TRIGGER trigger_update_updated_at_clients
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_updated_at_projets
    BEFORE UPDATE ON projets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- FONCTIONS UTILITAIRES
-- =====================================

-- Fonction pour calculer les alertes watchdog d'un projet
CREATE OR REPLACE FUNCTION calculate_project_watchdog(project_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    projet_row projets%ROWTYPE;
    days_to_deadline INTEGER;
    agents_count INTEGER;
    estimated_budget_usage INTEGER;
    alerts JSONB := '{}';
BEGIN
    -- Récupérer le projet
    SELECT * INTO projet_row FROM projets WHERE id = project_id;
    IF NOT FOUND THEN
        RETURN '{"error": "Project not found"}';
    END IF;
    
    -- Calculer les jours jusqu'à la deadline
    IF projet_row.deadline IS NOT NULL THEN
        days_to_deadline := projet_row.deadline - CURRENT_DATE;
        IF days_to_deadline < 0 THEN
            alerts := alerts || '{"deadline_alert": "depassee"}';
        ELSIF days_to_deadline <= 7 THEN
            alerts := alerts || '{"deadline_alert": "proche"}';
        ELSE
            alerts := alerts || '{"deadline_alert": "ok"}';
        END IF;
    ELSE
        alerts := alerts || '{"deadline_alert": "ok"}';
    END IF;
    
    -- Compter les agents assignés
    SELECT COUNT(*) INTO agents_count
    FROM projet_agents
    WHERE projet_id = project_id AND statut = 'actif';
    
    IF agents_count = 0 THEN
        alerts := alerts || '{"agents_alert": "insuffisant"}';
    ELSIF agents_count > 15 THEN
        alerts := alerts || '{"agents_alert": "excessif"}';
    ELSE
        alerts := alerts || '{"agents_alert": "ok"}';
    END IF;
    
    -- Estimation budget (simplifiée pour le moment)
    estimated_budget_usage := agents_count * 400; -- 400€ par agent estimé
    
    IF projet_row.budget IS NOT NULL AND estimated_budget_usage > projet_row.budget * 0.9 THEN
        alerts := alerts || '{"budget_alert": "attention"}';
    ELSE
        alerts := alerts || '{"budget_alert": "ok"}';
    END IF;
    
    -- Ajouter les totaux
    alerts := alerts || jsonb_build_object(
        'agents_count', agents_count,
        'estimated_budget_usage', estimated_budget_usage,
        'days_to_deadline', days_to_deadline
    );
    
    RETURN alerts;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les agents disponibles pour un projet
CREATE OR REPLACE FUNCTION get_available_agents_for_project(project_id INTEGER)
RETURNS TABLE(
    agent_id UUID,
    agent_name VARCHAR,
    domaine VARCHAR,
    version VARCHAR,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.name,
        a.domaine,
        a.version,
        NOT EXISTS(
            SELECT 1 FROM projet_agents pa 
            WHERE pa.agent_id = a.id 
            AND pa.projet_id = project_id 
            AND pa.statut = 'actif'
        ) as is_available
    FROM agents a
    WHERE a.deleted_at IS NULL
    ORDER BY a.domaine, a.name;
END;
$$ LANGUAGE plpgsql;