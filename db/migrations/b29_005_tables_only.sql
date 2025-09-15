-- B29 Migration 005: Add missing tables only
-- Only create missing tables for project_assignments, etc.

BEGIN;

-- PROJECT_ASSIGNMENTS table (if not exists)
CREATE TABLE IF NOT EXISTS project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT fk_project_assignment_project
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE
);

-- PROJECT_SQUADS table (if not exists)
CREATE TABLE IF NOT EXISTS project_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  squad_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  attached_at TIMESTAMPTZ DEFAULT NOW(),
  attached_by VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT fk_project_squad_project
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_project_squad_squad
    FOREIGN KEY (squad_id)
    REFERENCES squads(id)
    ON DELETE CASCADE
);

-- SQUAD_MEMBERS table (if not exists)
CREATE TABLE IF NOT EXISTS squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  role VARCHAR(100),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT fk_squad_member_squad
    FOREIGN KEY (squad_id)
    REFERENCES squads(id)
    ON DELETE CASCADE
);

-- AGENT_INSTANCES table (if not exists)
CREATE TABLE IF NOT EXISTS agent_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- SQUAD_INSTRUCTIONS table (if not exists)
CREATE TABLE IF NOT EXISTS squad_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(255),

  CONSTRAINT fk_squad_instruction_squad
    FOREIGN KEY (squad_id)
    REFERENCES squads(id)
    ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_agent_id ON project_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_status ON project_assignments(status);

CREATE INDEX IF NOT EXISTS idx_project_squads_project_id ON project_squads(project_id);
CREATE INDEX IF NOT EXISTS idx_project_squads_squad_id ON project_squads(squad_id);
CREATE INDEX IF NOT EXISTS idx_project_squads_status ON project_squads(status);

CREATE INDEX IF NOT EXISTS idx_squad_members_squad_id ON squad_members(squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_members_agent_id ON squad_members(agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_instances_agent_id ON agent_instances(agent_id);

COMMIT;

-- Display summary
SELECT
  'MISSING TABLES CREATED' as status,
  (SELECT COUNT(*) FROM project_assignments) as project_assignments_count,
  (SELECT COUNT(*) FROM project_squads) as project_squads_count,
  (SELECT COUNT(*) FROM squad_members) as squad_members_count,
  (SELECT COUNT(*) FROM agent_instances) as agent_instances_count;