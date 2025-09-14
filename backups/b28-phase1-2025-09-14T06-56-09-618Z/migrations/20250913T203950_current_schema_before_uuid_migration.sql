-- ===============================================
-- SCHÉMA ARKA DATABASE - État actuel
-- Date: 2025-09-13T20:39:48.179Z
-- Purpose: État avant migration UUID projects
-- ===============================================


-- Table: action_queue
CREATE TABLE action_queue (
    id BIGINT NOT NULL DEFAULT nextval('action_queue_id_seq'::regclass),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    kind TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued'::text,
    attempts INTEGER NOT NULL DEFAULT 0,
    dedupe_key TEXT
,
    PRIMARY KEY (id)
);
-- Données actuelles: 0 enregistrements

-- Table: agent_credentials
CREATE TABLE agent_credentials (
    agent_id UUID NOT NULL,
    kind TEXT NOT NULL,
    ref_key TEXT NOT NULL
,
    PRIMARY KEY (agent_id, kind),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
-- Données actuelles: 0 enregistrements

-- Table: agent_events
CREATE TABLE agent_events (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    project_id UUID,
    agent TEXT NOT NULL,
    event TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    labels ARRAY NOT NULL DEFAULT '{}'::text[],
    links ARRAY NOT NULL DEFAULT '{}'::text[],
    kpis JSONB NOT NULL DEFAULT '{}'::jsonb,
    decisions ARRAY NOT NULL DEFAULT '{}'::text[],
    author TEXT NOT NULL DEFAULT 'system'::text,
    source TEXT NOT NULL DEFAULT 'console'::text,
    repo TEXT,
    issue_ref TEXT,
    pr_ref TEXT,
    delivery_id TEXT,
    hash TEXT NOT NULL,
    agent_id INTEGER,
    type CHARACTER VARYING(100),
    payload_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
,
    PRIMARY KEY (id)
);
-- Données actuelles: 25 enregistrements

-- Table: agent_instances
CREATE TABLE agent_instances (
    id INTEGER NOT NULL DEFAULT nextval('agent_instances_id_seq'::regclass),
    agent_id INTEGER,
    instance_name CHARACTER VARYING(255),
    status CHARACTER VARYING(50) DEFAULT 'inactive'::character varying,
    config JSONB DEFAULT '{}'::jsonb,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
,
    PRIMARY KEY (id)
);
-- Données actuelles: 0 enregistrements

-- Table: agent_runs
CREATE TABLE agent_runs (
    id BIGINT NOT NULL DEFAULT nextval('agent_runs_id_seq'::regclass),
    agent_id UUID,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    trigger TEXT NOT NULL,
    input_ref TEXT,
    outcome TEXT,
    error TEXT
,
    PRIMARY KEY (id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
-- Données actuelles: 0 enregistrements

-- Table: agent_templates
CREATE TABLE agent_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name CHARACTER VARYING(255) NOT NULL,
    description TEXT,
    role CHARACTER VARYING(100),
    domaine CHARACTER VARYING(50),
    prompt_system TEXT,
    prompt_reveil TEXT,
    instructions_speciales TEXT,
    temperature NUMERIC DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    tools JSONB DEFAULT '[]'::jsonb,
    policies JSONB DEFAULT '[]'::jsonb,
    provider_preference CHARACTER VARYING(50) DEFAULT 'auto'::character varying,
    tags ARRAY DEFAULT '{}'::text[],
    version CHARACTER VARYING(20) DEFAULT '1.0'::character varying,
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT true,
    created_by CHARACTER VARYING(255) NOT NULL DEFAULT 'system'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
,
    PRIMARY KEY (id)
);
-- Données actuelles: 3 enregistrements

-- Table: agents
CREATE TABLE agents (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role USER-DEFINED NOT NULL,
    mode TEXT NOT NULL DEFAULT 'shadow'::text,
    prompt_system TEXT NOT NULL,
    policies JSONB NOT NULL DEFAULT '{}'::jsonb,
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    repos_allow ARRAY NOT NULL DEFAULT '{}'::text[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT,
    domaine CHARACTER VARYING(50),
    version CHARACTER VARYING(20),
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    temperature NUMERIC,
    max_tokens INTEGER,
    deleted_at TIMESTAMP WITH TIME ZONE
,
    PRIMARY KEY (id)
);
-- Données actuelles: 2 enregistrements

-- Table: auth_audit_logs
CREATE TABLE auth_audit_logs (
    id INTEGER NOT NULL DEFAULT nextval('auth_audit_logs_id_seq'::regclass),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id CHARACTER VARYING(255),
    email_hash CHARACTER VARYING(64),
    role CHARACTER VARYING(50),
    route CHARACTER VARYING(255),
    method CHARACTER VARYING(10),
    status_code INTEGER,
    trace_id CHARACTER VARYING(255),
    jti CHARACTER VARYING(255),
    ip_hash CHARACTER VARYING(64),
    user_agent_hash CHARACTER VARYING(64),
    error_code CHARACTER VARYING(100),
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
,
    PRIMARY KEY (id)
);
-- Données actuelles: 4363 enregistrements

-- Table: clients
CREATE TABLE clients (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    nom CHARACTER VARYING(200) NOT NULL,
    secteur CHARACTER VARYING(100),
    taille USER-DEFINED DEFAULT 'PME'::client_size,
    contact_principal JSONB DEFAULT '{}'::jsonb,
    contexte_specifique TEXT,
    statut USER-DEFINED DEFAULT 'actif'::client_status,
    created_by CHARACTER VARYING(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
,
    PRIMARY KEY (id)
);
-- Données actuelles: 17 enregistrements

-- Table: documents
CREATE TABLE documents (
    id INTEGER,
    project_id INTEGER,
    name CHARACTER VARYING(255),
    size INTEGER,
    mime CHARACTER VARYING(100),
    storage_url TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE

);
-- Données actuelles: 5 enregistrements

-- Table: lots_history
CREATE TABLE lots_history (
    id BIGINT NOT NULL DEFAULT nextval('lots_history_id_seq'::regclass),
    lot_key TEXT NOT NULL,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    by_event_id UUID
,
    PRIMARY KEY (id),
    FOREIGN KEY (by_event_id) REFERENCES agent_events(id)
);
-- Données actuelles: 0 enregistrements

-- Table: lots_state
CREATE TABLE lots_state (
    lot_key TEXT NOT NULL,
    status TEXT NOT NULL,
    kpis JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_event_id UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
,
    PRIMARY KEY (lot_key),
    FOREIGN KEY (last_event_id) REFERENCES agent_events(id)
);
-- Données actuelles: 0 enregistrements

-- Table: messages
CREATE TABLE messages (
    id BIGINT NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
    thread_id UUID NOT NULL,
    ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    role USER-DEFINED NOT NULL,
    content TEXT NOT NULL,
    tokens_in INTEGER,
    tokens_out INTEGER,
    tokens INTEGER,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
,
    PRIMARY KEY (id),
    FOREIGN KEY (thread_id) REFERENCES threads(id)
);
-- Données actuelles: 6 enregistrements

-- Table: project_agents
CREATE TABLE project_agents (
    id INTEGER NOT NULL DEFAULT nextval('project_agents_id_seq'::regclass),
    project_id INTEGER,
    agent_id INTEGER,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    role CHARACTER VARYING(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
,
    PRIMARY KEY (id)
);
-- Données actuelles: 0 enregistrements

-- Table: project_assignments
CREATE TABLE project_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL,
    agent_id UUID NOT NULL,
    status CHARACTER VARYING(20) DEFAULT 'active'::character varying,
    assigned_by CHARACTER VARYING(255),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
,
    PRIMARY KEY (id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
-- Données actuelles: 0 enregistrements

-- Table: project_docs
CREATE TABLE project_docs (
    id INTEGER NOT NULL DEFAULT nextval('project_docs_id_seq'::regclass),
    project_id INTEGER NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    size INTEGER NOT NULL,
    mime CHARACTER VARYING(100) NOT NULL,
    storage_url TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
,
    PRIMARY KEY (id)
);
-- Données actuelles: 5 enregistrements

-- Table: project_squads
CREATE TABLE project_squads (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL,
    squad_id UUID NOT NULL,
    status CHARACTER VARYING(20) DEFAULT 'active'::character varying,
    attached_by CHARACTER VARYING(255) NOT NULL,
    attached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    detached_at TIMESTAMP WITH TIME ZONE
,
    PRIMARY KEY (id),
    FOREIGN KEY (squad_id) REFERENCES squads(id)
);
-- Données actuelles: 0 enregistrements

-- Table: projects
CREATE TABLE projects (
    id INTEGER NOT NULL DEFAULT nextval('projects_new_id_seq'::regclass),
    name TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    client_id UUID,
    description TEXT,
    budget NUMERIC,
    deadline DATE,
    priority CHARACTER VARYING(20) DEFAULT 'normal'::character varying,
    status CHARACTER VARYING(20) DEFAULT 'active'::character varying,
    tags JSONB DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
-- Données actuelles: 0 enregistrements

-- Table: revoked_tokens
CREATE TABLE revoked_tokens (
    id INTEGER NOT NULL DEFAULT nextval('revoked_tokens_id_seq'::regclass),
    jti CHARACTER VARYING(255) NOT NULL,
    token_hash CHARACTER VARYING(64),
    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    user_id CHARACTER VARYING(255),
    reason CHARACTER VARYING(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
,
    PRIMARY KEY (id)
);
-- Données actuelles: 0 enregistrements

-- Table: squad_instructions
CREATE TABLE squad_instructions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    squad_id UUID NOT NULL,
    project_id INTEGER,
    content TEXT NOT NULL,
    priority CHARACTER VARYING(20) DEFAULT 'normal'::character varying,
    status USER-DEFINED DEFAULT 'pending'::instruction_status,
    routing_provider CHARACTER VARYING(50),
    response_time_ms INTEGER,
    created_by CHARACTER VARYING(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
,
    PRIMARY KEY (id),
    FOREIGN KEY (squad_id) REFERENCES squads(id)
);
-- Données actuelles: 0 enregistrements

-- Table: squad_members
CREATE TABLE squad_members (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    squad_id UUID NOT NULL,
    agent_id UUID NOT NULL,
    role CHARACTER VARYING(50) NOT NULL,
    specializations ARRAY DEFAULT '{}'::text[],
    permissions JSONB DEFAULT '{}'::jsonb,
    status CHARACTER VARYING(20) DEFAULT 'active'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
,
    PRIMARY KEY (id),
    FOREIGN KEY (squad_id) REFERENCES squads(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
-- Données actuelles: 0 enregistrements

-- Table: squads
CREATE TABLE squads (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name CHARACTER VARYING(100) NOT NULL,
    slug CHARACTER VARYING(64) NOT NULL,
    mission TEXT,
    domain CHARACTER VARYING(50) NOT NULL,
    status USER-DEFINED NOT NULL DEFAULT 'active'::squad_status,
    created_by CHARACTER VARYING(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
,
    PRIMARY KEY (id)
);
-- Données actuelles: 1 enregistrements

-- Table: thread_pins
CREATE TABLE thread_pins (
    thread_id UUID NOT NULL,
    kind TEXT NOT NULL,
    ref TEXT NOT NULL,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb
,
    PRIMARY KEY (thread_id, kind, ref),
    FOREIGN KEY (thread_id) REFERENCES threads(id)
);
-- Données actuelles: 0 enregistrements

-- Table: thread_state
CREATE TABLE thread_state (
    thread_id UUID NOT NULL,
    last_event_id UUID,
    lot_key TEXT,
    context_hint JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
,
    PRIMARY KEY (thread_id),
    FOREIGN KEY (thread_id) REFERENCES threads(id),
    FOREIGN KEY (last_event_id) REFERENCES agent_events(id)
);
-- Données actuelles: 2 enregistrements

-- Table: threads
CREATE TABLE threads (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    title TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_msg_at TIMESTAMP WITH TIME ZONE,
    project_id INTEGER
,
    PRIMARY KEY (id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
-- Données actuelles: 2 enregistrements

-- Table: users
CREATE TABLE users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL
,
    PRIMARY KEY (id)
);
-- Données actuelles: 3 enregistrements

-- Table: webhook_dedup
CREATE TABLE webhook_dedup (
    delivery_id TEXT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    payload_hash TEXT NOT NULL
,
    PRIMARY KEY (delivery_id)
);
-- Données actuelles: 0 enregistrements

-- Table: zz_proof
CREATE TABLE zz_proof (
    id INTEGER NOT NULL DEFAULT nextval('zz_proof_id_seq'::regclass),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
,
    PRIMARY KEY (id)
);
-- Données actuelles: 1 enregistrements


-- ===============================================
-- ANALYSE MIGRATION UUID PROJECTS
-- ===============================================

-- ❌ PROBLÈME ACTUEL:
-- Table 'projects' utilise INTEGER pour id (sécurité faible)
-- Autres tables (clients, agents, squads) utilisent UUID

-- 🎯 OBJECTIF:
-- Migrer projects.id INTEGER → UUID
-- Maintenir l'intégrité référentielle

-- 📊 TABLES IMPACTÉES:
-- - agent_events.project_id (uuid)
-- - documents.project_id (integer)
-- - project_agents.project_id (integer)
-- - project_assignments.project_id (integer)
-- - project_docs.project_id (integer)
-- - project_squads.project_id (integer)
-- - squad_instructions.project_id (integer)
-- - threads.project_id (integer)
