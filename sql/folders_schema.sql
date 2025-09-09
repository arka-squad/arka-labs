-- Folders system schema for B15 DocDesk implementation

-- Main folders table
CREATE TABLE IF NOT EXISTS folders (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
    vision JSONB NOT NULL DEFAULT '{}', -- {objectif, livrable, contraintes[], succes[]}
    context JSONB NOT NULL DEFAULT '{}', -- {guided_notes[], completion}
    agents JSONB NOT NULL DEFAULT '[]', -- [{id, name, role, load, status}]
    stats JSONB NOT NULL DEFAULT '{}', -- {docs_total, docs_tested, agents_assigned, roadmap_progress}
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table (if not exists)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL, -- procedure, checklist, template, etc.
    owner VARCHAR(255),
    status VARCHAR(50) DEFAULT 'untested' CHECK (status IN ('pass', 'warn', 'fail', 'untested')),
    content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for folder-document relationships with assignments
CREATE TABLE IF NOT EXISTS folder_documents (
    folder_id VARCHAR(255) REFERENCES folders(id) ON DELETE CASCADE,
    document_id VARCHAR(255) REFERENCES documents(id) ON DELETE CASCADE,
    assigned_to VARCHAR(255), -- agent ID
    raci_role CHAR(1) CHECK (raci_role IN ('A', 'R', 'C', 'I')), -- RACI matrix
    assigned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (folder_id, document_id)
);

-- Agents table (if not exists)
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'specialist',
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'active', 'busy', 'offline')),
    load_percent INTEGER DEFAULT 0 CHECK (load_percent >= 0 AND load_percent <= 100),
    capabilities JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folder context entries (guided questions and user responses)
CREATE TABLE IF NOT EXISTS folder_context (
    id VARCHAR(255) PRIMARY KEY,
    folder_id VARCHAR(255) REFERENCES folders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('note', 'constraint', 'objective', 'agent_question', 'user_note')),
    content TEXT NOT NULL,
    agent VARCHAR(255), -- agent ID who created this (if agent_question)
    created_by VARCHAR(255), -- user who created this
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folder milestones for roadmap
CREATE TABLE IF NOT EXISTS folder_milestones (
    id VARCHAR(255) PRIMARY KEY,
    folder_id VARCHAR(255) REFERENCES folders(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('done', 'pending', 'blocked')),
    dependencies JSONB DEFAULT '[]', -- Array of milestone IDs
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log for folders
CREATE TABLE IF NOT EXISTS folder_activity (
    id SERIAL PRIMARY KEY,
    folder_id VARCHAR(255) REFERENCES folders(id) ON DELETE CASCADE,
    actor VARCHAR(255) NOT NULL, -- user ID
    action VARCHAR(100) NOT NULL, -- assign_agent, add_context, update_milestone, etc.
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_folders_status ON folders(status);
CREATE INDEX IF NOT EXISTS idx_folders_created_by ON folders(created_by);
CREATE INDEX IF NOT EXISTS idx_folder_documents_folder ON folder_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_documents_assigned ON folder_documents(assigned_to);
CREATE INDEX IF NOT EXISTS idx_folder_context_folder ON folder_context(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_milestones_folder ON folder_milestones(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_activity_folder ON folder_activity(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_activity_actor ON folder_activity(actor);

-- Comments
COMMENT ON TABLE folders IS 'Main folders/projects with vision, context and agent assignments';
COMMENT ON TABLE folder_documents IS 'Junction table linking folders to documents with RACI assignments';
COMMENT ON TABLE folder_context IS 'Guided context entries (agent questions and user responses)';
COMMENT ON TABLE folder_milestones IS 'Roadmap milestones for folders';
COMMENT ON TABLE folder_activity IS 'Activity log for folder operations';