-- Seed data for B15 DocDesk using existing database schema
-- Maps to projects, project_docs, agents tables

-- Insert or update agents (using existing agents table)
INSERT INTO agents (id, name, role, mode, prompt_system, policies, tools, repos_allow, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Héloïse RH', 'specialist', 'active', 'Tu es un spécialiste RH expert en coworking et gestion d''événements.', '{"max_tokens": 4000}', '["web_search", "document_analysis", "event_planning"]', '{}', 'available', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'AGP Gate', 'validator', 'active', 'Tu es un validateur de conformité et de qualité pour les projets.', '{"strict_validation": true}', '["document_validation", "compliance_check"]', '{}', 'available', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Analyste/Redac', 'analyst', 'active', 'Tu es un analyste expert en rédaction de synthèses et documentation.', '{"analysis_depth": "detailed"}', '["text_analysis", "report_generation", "synthesis"]', '{}', 'available', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Insert main project (using existing projects table)
INSERT INTO projects (id, name, created_by, created_at, vision, context, agents, stats, status, updated_at) VALUES (
    1001,
    'Journée Coworking Q4',
    'system',
    NOW(),
    '{
        "type": "event",
        "objectif": "Organiser journée coworking RH + plan formation Q4",
        "livrable": "Synthèse écrite, planning validé, décisions actées",
        "contraintes": ["Budget ≤ 1k€", "Salle J-7", "Docs Q3 disponibles"],
        "succes": ["3 décisions actées", "Planning assigné", "Feedback collecté"]
    }',
    '{
        "guided_notes": [
            {
                "id": "ctx1",
                "type": "agent_question",
                "content": "Quel est le nombre de participants attendu?",
                "agent": "550e8400-e29b-41d4-a716-446655440001"
            },
            {
                "id": "ctx2",
                "type": "user_note",
                "content": "Attention sécurité incendie - sortie de secours côté est"
            }
        ],
        "completion": 75,
        "completion_breakdown": {
            "objective": 1,
            "constraints": 1, 
            "participants": 1,
            "docs_ref": 0,
            "risks": 1
        }
    }',
    '[
        {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "name": "Héloïse RH",
            "role": "A",
            "load": 65,
            "status": "active"
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "name": "AGP Gate", 
            "role": "R",
            "load": 20,
            "status": "available"
        }
    ]',
    '{
        "docs_total": 5,
        "docs_assigned": 3,
        "agents_assigned": 2,
        "roadmap_progress": 60
    }',
    'active',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    vision = EXCLUDED.vision,
    context = EXCLUDED.context,
    agents = EXCLUDED.agents,
    stats = EXCLUDED.stats,
    updated_at = NOW();

-- Insert project documents (using existing project_docs table)
INSERT INTO project_docs (id, project_id, name, size, mime, storage_url, created_at) VALUES
(2001, 1001, 'Procédure Journée Coworking', 15420, 'text/markdown', '/storage/docs/coworking_procedure.md', NOW()),
(2002, 1001, 'Checklist Matériel', 8750, 'text/markdown', '/storage/docs/checklist_materiel.md', NOW()),
(2003, 1001, 'Budget Prévisionnel', 12300, 'application/pdf', '/storage/docs/budget_previsionnel.pdf', NOW()),
(2004, 1001, 'Modèle Convocation', 5680, 'text/html', '/storage/docs/convocation_modele.html', NOW()),
(2005, 1001, 'Synthèse Q3', 22100, 'text/markdown', '/storage/docs/synthese_q3.md', NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    size = EXCLUDED.size,
    created_at = EXCLUDED.created_at;

-- Insert document assignments (new table)
INSERT INTO project_assignments (project_id, document_id, agent_id, raci_role, assigned_at, created_at, updated_at) VALUES
(1001, 2001, '550e8400-e29b-41d4-a716-446655440001', 'A', NOW(), NOW(), NOW()),
(1001, 2002, '550e8400-e29b-41d4-a716-446655440001', 'A', NOW(), NOW(), NOW()),
(1001, 2003, NULL, NULL, NULL, NOW(), NOW()),
(1001, 2004, '550e8400-e29b-41d4-a716-446655440003', 'R', NOW(), NOW(), NOW()),
(1001, 2005, '550e8400-e29b-41d4-a716-446655440003', 'C', NOW(), NOW(), NOW())
ON CONFLICT (project_id, document_id) DO UPDATE SET
    agent_id = EXCLUDED.agent_id,
    raci_role = EXCLUDED.raci_role,
    assigned_at = EXCLUDED.assigned_at,
    updated_at = NOW();

-- Insert context entries (new table)
INSERT INTO project_context (id, project_id, type, content, agent_id, created_by, created_at) VALUES
('ctx1_proj1001', 1001, 'agent_question', 'Quel est le nombre de participants attendu?', '550e8400-e29b-41d4-a716-446655440001', 'system', NOW()),
('ctx2_proj1001', 1001, 'user_note', 'Attention sécurité incendie - sortie de secours côté est', NULL, 'user_demo', NOW()),
('ctx3_proj1001', 1001, 'constraint', 'Budget maximum 1000€', NULL, 'user_demo', NOW()),
('ctx4_proj1001', 1001, 'objective', 'Organiser événement coworking pour équipe RH', NULL, 'user_demo', NOW())
ON CONFLICT (id) DO UPDATE SET
    content = EXCLUDED.content,
    created_at = EXCLUDED.created_at;

-- Insert roadmap milestones (new table)
INSERT INTO project_milestones (id, project_id, title, date, status, dependencies, created_at, updated_at) VALUES
('m1_proj1001', 1001, 'Salle réservée', '2025-09-15', 'done', '[]', NOW(), NOW()),
('m2_proj1001', 1001, 'Atelier coworking', '2025-09-22', 'pending', '["m1_proj1001"]', NOW(), NOW()),
('m3_proj1001', 1001, 'Synthèse livrée', '2025-09-23', 'pending', '["m2_proj1001"]', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    date = EXCLUDED.date,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Insert some activity entries (new table)
INSERT INTO project_activity (project_id, actor, action, details, created_at) VALUES
(1001, 'user_demo', 'create_project', '{"title": "Journée Coworking Q4"}', NOW()),
(1001, 'user_demo', 'assign_agent', '{"agent_id": "550e8400-e29b-41d4-a716-446655440001", "role": "A", "doc_ids": ["doc.project.2001"]}', NOW()),
(1001, 'user_demo', 'add_context', '{"context_id": "ctx2_proj1001", "type": "user_note"}', NOW()),
(1001, 'system', 'update_stats', '{"docs_assigned": 3, "agents_assigned": 2}', NOW());