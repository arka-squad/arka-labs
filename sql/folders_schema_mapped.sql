-- B15 DocDesk schema mapped to existing database structure
-- Uses existing 'projects' table as base instead of creating 'folders'

-- Extend existing projects table with folders-specific fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vision JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agents JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Document assignments with RACI roles (maps to project_docs)
CREATE TABLE IF NOT EXISTS project_assignments (
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES project_docs(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    raci_role CHAR(1) CHECK (raci_role IN ('A', 'R', 'C', 'I')),
    assigned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, document_id)
);

-- Project context entries (guided questions and user responses)
CREATE TABLE IF NOT EXISTS project_context (
    id VARCHAR(255) PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('note', 'constraint', 'objective', 'agent_question', 'user_note')),
    content TEXT NOT NULL,
    agent_id UUID REFERENCES agents(id), -- agent who created this (if agent_question)
    created_by TEXT, -- user who created this
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project milestones for roadmap
CREATE TABLE IF NOT EXISTS project_milestones (
    id VARCHAR(255) PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('done', 'pending', 'blocked')),
    dependencies JSONB DEFAULT '[]', -- Array of milestone IDs
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project activity log (complement existing agent_events)
CREATE TABLE IF NOT EXISTS project_activity (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    actor TEXT NOT NULL, -- user ID
    action VARCHAR(100) NOT NULL, -- assign_agent, add_context, update_milestone, etc.
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idempotency keys table for POST operations
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(255) PRIMARY KEY,
    request_hash VARCHAR(64) NOT NULL,
    response_status INTEGER NOT NULL,
    response_body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_agent ON project_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_project_context_project ON project_context(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_project ON project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_actor ON project_activity(actor);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);

-- Comments
COMMENT ON TABLE project_assignments IS 'RACI assignments for project documents';
COMMENT ON TABLE project_context IS 'Guided context entries (agent questions and user responses)';
COMMENT ON TABLE project_milestones IS 'Roadmap milestones for projects';
COMMENT ON TABLE project_activity IS 'Activity log for project operations';
COMMENT ON TABLE idempotency_keys IS 'Idempotency keys for POST operations';