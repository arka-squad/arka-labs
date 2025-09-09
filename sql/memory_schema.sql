-- B22 Memory Sovereign Schema
-- Extension to existing projects table for ArkaMeta Core

-- Add slug to projects for API compatibility
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Memory blocks linked to existing projects
CREATE TABLE memory_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
    block_type TEXT NOT NULL CHECK (block_type IN ('vision', 'context_evolution', 'agents_interaction', 'decision', 'blocker', 'insight', 'governance')),
    content JSONB NOT NULL,
    agent_source TEXT,
    importance INTEGER DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
    tags TEXT[] DEFAULT '{}',
    hash TEXT NOT NULL, -- SHA-256 content integrity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- retention policy
    
    -- Content size constraint (256KB max)
    CONSTRAINT content_size_limit CHECK (pg_column_size(content) < 262144)
);

-- Context propagation between memory blocks
CREATE TABLE memory_context_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_block_id UUID NOT NULL REFERENCES memory_blocks(id) ON DELETE CASCADE,
    target_block_id UUID NOT NULL REFERENCES memory_blocks(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('derives_from', 'relates_to', 'conflicts_with', 'supersedes')),
    strength REAL DEFAULT 1.0 CHECK (strength BETWEEN 0.0 AND 1.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-reference
    CONSTRAINT no_self_reference CHECK (source_block_id != target_block_id)
);

-- Snapshots for evidence export
CREATE TABLE memory_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('milestone', 'daily', 'manual', 'archive')),
    content_hash TEXT NOT NULL,
    size_mb REAL NOT NULL,
    blocks_count INTEGER NOT NULL,
    created_by TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    storage_url TEXT, -- external archival
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_memory_blocks_project_type ON memory_blocks(project_id, block_type);
CREATE INDEX idx_memory_blocks_thread ON memory_blocks(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX idx_memory_blocks_expiry ON memory_blocks(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_memory_blocks_created ON memory_blocks(project_id, created_at DESC);
CREATE INDEX idx_memory_blocks_importance ON memory_blocks(project_id, importance DESC);
CREATE INDEX idx_memory_context_source ON memory_context_links(source_block_id);
CREATE INDEX idx_memory_context_target ON memory_context_links(target_block_id);
CREATE INDEX idx_memory_snapshots_project ON memory_snapshots(project_id, created_at DESC);

-- Full-text search index on content
CREATE INDEX idx_memory_blocks_content_gin ON memory_blocks USING GIN(content jsonb_path_ops);
CREATE INDEX idx_memory_blocks_tags_gin ON memory_blocks USING GIN(tags);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_memory_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_memory_blocks_updated_at
    BEFORE UPDATE ON memory_blocks
    FOR EACH ROW
    EXECUTE PROCEDURE update_memory_blocks_updated_at();