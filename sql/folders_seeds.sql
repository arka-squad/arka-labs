-- Seed data for B15 DocDesk folders feature
-- Test case: Journée Coworking Q4

-- Insert agents first
INSERT INTO agents (id, name, type, status, load_percent, capabilities, metadata) VALUES
('heloise-rh', 'Héloïse RH', 'hr_specialist', 'active', 65, '["coworking", "event_management", "hr_processes"]', '{"expertise": "PMO RH", "availability": "3j/sem"}'),
('agp-gate', 'AGP Gate', 'validator', 'available', 20, '["testing", "compliance", "validation"]', '{"expertise": "tests de conformité"}'),
('analyste-redac', 'Analyste/Redac', 'analyst', 'available', 40, '["analysis", "documentation", "synthesis"]', '{"expertise": "rédaction synthèses"}'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    load_percent = EXCLUDED.load_percent,
    updated_at = NOW();

-- Insert documents
INSERT INTO documents (id, title, type, owner, status, content, metadata) VALUES
('doc.coworking.proc', 'Procédure Journée Coworking', 'procedure', 'RH', 'pass', 'Procédure détaillée pour organiser une journée coworking...', '{"version": "1.0", "last_reviewed": "2025-09-01"}'),
('doc.checklist.materiel', 'Checklist Matériel', 'checklist', 'RH', 'warn', 'Liste du matériel nécessaire pour l''événement...', '{"items_count": 15, "completion": 0.8}'),
('doc.budget.previsionnel', 'Budget Prévisionnel', 'budget', 'Finance', 'untested', 'Budget détaillé pour la journée coworking Q4...', '{"budget_limit": 1000, "currency": "EUR"}'),
('doc.convocation.modele', 'Modèle Convocation', 'template', 'Com', 'pass', 'Modèle de convocation pour les participants...', '{"template_type": "email"}'),
('doc.synthese.q3', 'Synthèse Q3', 'report', 'RH', 'fail', 'Synthèse des activités Q3...', '{"quarter": "Q3", "status": "needs_update"}'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Insert main folder
INSERT INTO folders (id, title, status, vision, context, agents, stats, created_by) VALUES (
    'coworking-q4',
    'Journée Coworking Q4',
    'active',
    '{
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
                "agent": "heloise-rh"
            },
            {
                "id": "ctx2",
                "type": "user_note",
                "content": "Attention sécurité incendie - sortie de secours côté est"
            }
        ],
        "completion": 75
    }',
    '[
        {
            "id": "heloise-rh",
            "name": "Héloïse RH",
            "role": "A",
            "load": 65,
            "status": "active"
        },
        {
            "id": "agp-gate",
            "name": "AGP Gate",
            "role": "R",
            "load": 20,
            "status": "available"
        }
    ]',
    '{
        "docs_total": 5,
        "docs_tested": 3,
        "agents_assigned": 2,
        "roadmap_progress": 60
    }',
    'system'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    vision = EXCLUDED.vision,
    context = EXCLUDED.context,
    agents = EXCLUDED.agents,
    stats = EXCLUDED.stats,
    updated_at = NOW();

-- Link documents to folder with assignments
INSERT INTO folder_documents (folder_id, document_id, assigned_to, raci_role, assigned_at) VALUES
('coworking-q4', 'doc.coworking.proc', 'heloise-rh', 'A', NOW()),
('coworking-q4', 'doc.checklist.materiel', 'heloise-rh', 'A', NOW()),
('coworking-q4', 'doc.budget.previsionnel', NULL, NULL, NULL),
('coworking-q4', 'doc.convocation.modele', 'analyste-redac', 'R', NOW()),
('coworking-q4', 'doc.synthese.q3', 'analyste-redac', 'C', NOW())
ON CONFLICT (folder_id, document_id) DO UPDATE SET
    assigned_to = EXCLUDED.assigned_to,
    raci_role = EXCLUDED.raci_role,
    assigned_at = EXCLUDED.assigned_at,
    updated_at = NOW();

-- Insert context entries
INSERT INTO folder_context (id, folder_id, type, content, agent, created_by) VALUES
('ctx1', 'coworking-q4', 'agent_question', 'Quel est le nombre de participants attendu?', 'heloise-rh', 'system'),
('ctx2', 'coworking-q4', 'user_note', 'Attention sécurité incendie - sortie de secours côté est', NULL, 'user_demo')
ON CONFLICT (id) DO NOTHING;

-- Insert roadmap milestones
INSERT INTO folder_milestones (id, folder_id, title, date, status, dependencies) VALUES
('m1_coworking', 'coworking-q4', 'Salle réservée', '2025-09-15', 'done', '[]'),
('m2_coworking', 'coworking-q4', 'Atelier coworking', '2025-09-22', 'pending', '["m1_coworking"]'),
('m3_coworking', 'coworking-q4', 'Synthèse livrée', '2025-09-23', 'pending', '["m2_coworking"]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    date = EXCLUDED.date,
    status = EXCLUDED.status,
    dependencies = EXCLUDED.dependencies,
    updated_at = NOW();

-- Insert some activity entries
INSERT INTO folder_activity (folder_id, actor, action, details) VALUES
('coworking-q4', 'user_demo', 'create_folder', '{"title": "Journée Coworking Q4"}'),
('coworking-q4', 'user_demo', 'assign_agent', '{"agent_id": "heloise-rh", "role": "A", "doc_ids": ["doc.coworking.proc"]}'),
('coworking-q4', 'user_demo', 'add_context', '{"context_id": "ctx2", "type": "user_note"}');