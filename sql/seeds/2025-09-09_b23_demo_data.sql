-- =====================================
-- B23 · Console Admin v2 — Demo Data Seeds
-- =====================================

BEGIN;

-- =====================================
-- AGENTS DEMO
-- =====================================

INSERT INTO agents (id, name, role) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Héloïse RH', 'specialist'),
('550e8400-e29b-41d4-a716-446655440102', 'AGP Gate', 'validator'),
('550e8400-e29b-41d4-a716-446655440103', 'Tech Lead AI', 'lead'),
('550e8400-e29b-41d4-a716-446655440104', 'Marketing Pro', 'specialist'),
('550e8400-e29b-41d4-a716-446655440105', 'Developer Alpha', 'contributor')
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- SQUADS DEMO
-- =====================================

INSERT INTO squads (id, name, slug, mission, domain, status, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Squad RH Alpha', 'squad-rh-alpha', 'Ateliers coworking et livrables RH', 'RH', 'active', 'admin@arka.com'),
('550e8400-e29b-41d4-a716-446655440002', 'Squad Tech Core', 'squad-tech-core', 'Développement et architecture technique', 'Tech', 'active', 'admin@arka.com'),
('550e8400-e29b-41d4-a716-446655440003', 'Squad Marketing', 'squad-marketing', 'Campagnes et contenu marketing', 'Marketing', 'inactive', 'admin@arka.com')
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- SQUAD MEMBERS
-- =====================================

INSERT INTO squad_members (squad_id, agent_id, role, specializations) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 'lead', '["onboarding", "formation"]'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'specialist', '["validation", "audit"]'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440103', 'lead', '["architecture", "review"]'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440105', 'contributor', '["development", "testing"]'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440104', 'lead', '["content", "campaigns"]')
ON CONFLICT (squad_id, agent_id) DO NOTHING;

-- =====================================
-- PROJECTS AVEC STATUS
-- =====================================

-- Mise à jour des projets existants avec statuts
UPDATE projects SET 
    status = 'active', 
    created_by = 'owner@client.com',
    metadata = '{"client": "Demo Client", "priority": "high"}'
WHERE id = 1;

-- Ajouter des projets de demo si nécessaire
INSERT INTO projects (id, name, status, created_by, metadata) VALUES
(2, 'Projet Formation Q4', 'disabled', 'owner@client.com', '{"client": "Formation Corp", "priority": "medium"}'),
(3, 'Système Marketing Automation', 'active', 'admin@arka.com', '{"client": "Internal", "priority": "low"}')
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- PROJECT SQUADS ATTACHMENTS
-- =====================================

INSERT INTO project_squads (project_id, squad_id, attached_by) VALUES
(1, '550e8400-e29b-41d4-a716-446655440001', 'owner@client.com'),
(3, '550e8400-e29b-41d4-a716-446655440002', 'admin@arka.com'),
(3, '550e8400-e29b-41d4-a716-446655440003', 'admin@arka.com')
ON CONFLICT (project_id, squad_id, status) DO NOTHING;

-- =====================================
-- INSTRUCTIONS EXAMPLES
-- =====================================

INSERT INTO squad_instructions (id, squad_id, project_id, content, priority, status, created_by, completed_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 1, 'Préparer agenda atelier coworking 2h avec liste participants', 'normal', 'completed', 'owner@client.com', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 1, 'Valider liste participants et matériel requis', 'high', 'processing', 'owner@client.com', NULL),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440002', 3, 'Analyser architecture existante et proposer optimisations', 'normal', 'queued', 'admin@arka.com', NULL),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440003', 3, 'Créer campagne de lancement produit', 'urgent', 'pending', 'admin@arka.com', NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- PROJECT DOCS EXAMPLES
-- =====================================

INSERT INTO project_docs (id, project_id, name, content_type, file_size, status, visibility, source, tags, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440301', 1, 'Cahier des charges atelier.pdf', 'application/pdf', 1024000, 'active', 'client', 'client', '["requirements", "workshop"]', '{"version": "1.0", "approved": true}'),
('550e8400-e29b-41d4-a716-446655440302', 1, 'Liste participants.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 45000, 'active', 'squad', 'client', '["participants", "contact"]', '{"version": "2.1", "last_updated": "2025-09-08"}'),
('550e8400-e29b-41d4-a716-446655440303', 3, 'Spécifications techniques.md', 'text/markdown', 15000, 'active', 'squad', 'admin', '["specs", "technical"]', '{"version": "1.2", "reviewed": true}'),
('550e8400-e29b-41d4-a716-446655440304', 3, 'Guide utilisateur.pdf', 'application/pdf', 890000, 'inactive', 'client', 'squad', '["documentation", "user-guide"]', '{"version": "0.9", "draft": true}')
ON CONFLICT (id) DO NOTHING;

COMMIT;