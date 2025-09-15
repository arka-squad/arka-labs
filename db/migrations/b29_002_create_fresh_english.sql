-- B29 Migration 002: Create Fresh English Structure
-- Create all tables with English column names from scratch

BEGIN;

-- Create ENUMS first
CREATE TYPE client_size AS ENUM ('small', 'medium', 'large', 'enterprise');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE project_status AS ENUM ('active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE squad_status AS ENUM ('active', 'suspended', 'archived');

-- CLIENTS TABLE (English)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  sector VARCHAR(100),
  size client_size DEFAULT 'medium',
  primary_contact JSONB DEFAULT '{}',
  specific_context TEXT,
  status client_status DEFAULT 'active',
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- PROJECTS TABLE (English)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID,
  budget NUMERIC,
  deadline DATE,
  priority VARCHAR(20) DEFAULT 'normal',
  status project_status DEFAULT 'active',
  tags JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '[]',
  squad_count INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  CONSTRAINT fk_project_client
    FOREIGN KEY (client_id)
    REFERENCES clients(id)
    ON DELETE SET NULL
);

-- SQUADS TABLE (English - already was in English)
CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status squad_status DEFAULT 'active',
  agents_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID,

  CONSTRAINT fk_squad_project
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_squad_client
    FOREIGN KEY (client_id)
    REFERENCES clients(id)
    ON DELETE CASCADE,

  CONSTRAINT unique_squad_name_per_project
    UNIQUE(project_id, name, deleted_at)
);

-- Create indexes for performance
CREATE INDEX idx_clients_status ON clients(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_size ON clients(size) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_sector ON clients USING gin(to_tsvector('english', sector)) WHERE deleted_at IS NULL;

CREATE INDEX idx_projects_client_id ON projects(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX idx_squads_project_id ON squads(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_squads_client_id ON squads(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_squads_status ON squads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_squads_created_at ON squads(created_at DESC);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_squads_updated_at
  BEFORE UPDATE ON squads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function for updating squad_count in projects
CREATE OR REPLACE FUNCTION update_project_squad_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects
    SET squad_count = squad_count + 1
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects
    SET squad_count = squad_count - 1
    WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_squad_count_trigger
  AFTER INSERT OR DELETE ON squads
  FOR EACH ROW
  EXECUTE FUNCTION update_project_squad_count();

-- Insert sample data for testing
INSERT INTO clients (name, sector, size, status, primary_contact, specific_context) VALUES
('Acme Corp', 'Technology', 'large', 'active', '{"name": "John Doe", "email": "john@acme.com", "phone": "+33123456789"}', 'Leading tech company focusing on AI solutions'),
('StartupX', 'Finance', 'small', 'active', '{"name": "Jane Smith", "email": "jane@startupx.com"}', 'Fintech startup disrupting traditional banking'),
('MegaIndustries', 'Manufacturing', 'enterprise', 'active', '{"name": "Bob Wilson", "email": "bob@megaindustries.com"}', 'Global manufacturing conglomerate'),
('LocalBiz', 'Retail', 'medium', 'pending', '{"name": "Alice Brown", "email": "alice@localbiz.com"}', 'Regional retail chain expanding online'),
('InnovateLab', 'Research', 'small', 'inactive', '{"name": "Charlie Davis", "email": "charlie@innovate.com"}', 'R&D lab for emerging technologies');

INSERT INTO projects (name, description, client_id, budget, status, created_by) VALUES
('AI Integration Platform', 'Develop comprehensive AI integration platform for enterprise clients', (SELECT id FROM clients WHERE name = 'Acme Corp'), 500000, 'active', 'system'),
('Mobile Banking App', 'Create secure mobile banking application with biometric authentication', (SELECT id FROM clients WHERE name = 'StartupX'), 150000, 'active', 'system'),
('Supply Chain Optimization', 'Optimize global supply chain using IoT and analytics', (SELECT id FROM clients WHERE name = 'MegaIndustries'), 750000, 'on_hold', 'system'),
('E-commerce Website', 'Build modern e-commerce platform with inventory management', (SELECT id FROM clients WHERE name = 'LocalBiz'), 80000, 'active', 'system'),
('Research Data Portal', 'Centralized data portal for research collaboration', (SELECT id FROM clients WHERE name = 'InnovateLab'), 120000, 'completed', 'system');

INSERT INTO squads (project_id, client_id, name, description, status) VALUES
((SELECT id FROM projects WHERE name = 'AI Integration Platform'), (SELECT id FROM clients WHERE name = 'Acme Corp'), 'AI Core Team', 'Core AI development team', 'active'),
((SELECT id FROM projects WHERE name = 'Mobile Banking App'), (SELECT id FROM clients WHERE name = 'StartupX'), 'Mobile Dev Squad', 'Mobile application development team', 'active'),
((SELECT id FROM projects WHERE name = 'Supply Chain Optimization'), (SELECT id FROM clients WHERE name = 'MegaIndustries'), 'IoT Analytics Team', 'IoT and analytics specialists', 'suspended'),
((SELECT id FROM projects WHERE name = 'E-commerce Website'), (SELECT id FROM clients WHERE name = 'LocalBiz'), 'Web Development Team', 'Full-stack web development team', 'active');

COMMIT;

-- Display summary
SELECT
  'STRUCTURE CREATED' as status,
  (SELECT COUNT(*) FROM clients) as clients_count,
  (SELECT COUNT(*) FROM projects) as projects_count,
  (SELECT COUNT(*) FROM squads) as squads_count;