-- =====================================
-- B23 · Backoffice Admin v2 - Données de démonstration
-- Seed: b23_demo_data.sql
-- =====================================

-- =====================================
-- CLIENTS DEMO
-- =====================================
INSERT INTO clients (id, nom, secteur, taille, contact_principal, contexte_specifique, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Entreprise Alpha', 'PME Industrie', 'PME', 
 '{"nom": "Marie Dubois", "email": "marie.dubois@alpha.com", "telephone": "+33 1 42 86 12 34"}',
 'Culture collaborative, budget serré, équipe technique junior. Priorité sécurité et formation continue.',
 'admin@arka.com'),

('550e8400-e29b-41d4-a716-446655440012', 'Corp Beta', 'Grande distribution', 'GE',
 '{"nom": "Jean Martin", "email": "jean.martin@corpbeta.fr", "telephone": "+33 1 45 23 67 89"}',
 'Processus rigides, conformité stricte, équipes expérimentées. Validation hiérarchique obligatoire.',
 'admin@arka.com'),

('550e8400-e29b-41d4-a716-446655440013', 'Startup Gamma', 'Tech SaaS', 'TPE',
 '{"nom": "Sarah Chen", "email": "sarah@gamma-tech.io", "telephone": "+33 6 78 90 12 34"}',
 'Agilité maximale, budget limité, croissance rapide. Besoin de solutions scalables et efficaces.',
 'manager@arka.com'),

('550e8400-e29b-41d4-a716-446655440014', 'Consulting Delta', 'Services B2B', 'PME',
 '{"nom": "Pierre Rousseau", "email": "pierre.r@delta-consulting.fr", "telephone": "+33 1 56 78 90 12"}',
 'Cabinet de conseil traditionnel, clientèle exigeante. Besoin d''excellence et de personnalisation.',
 'manager@arka.com'),

('550e8400-e29b-41d4-a716-446655440015', 'GreenTech Solutions', 'Environnement', 'ETI',
 '{"nom": "Lisa Moreau", "email": "l.moreau@greentech-sol.com", "telephone": "+33 4 67 89 01 23"}',
 'Entreprise engagée développement durable. Communication orientée impact environnemental.',
 'admin@arka.com');

-- =====================================
-- PROJETS DEMO
-- =====================================
INSERT INTO projets (nom, client_id, statut, priorite, budget, deadline, description, contexte_mission, created_by) VALUES
('Journée Coworking Q4', '550e8400-e29b-41d4-a716-446655440011', 'actif', 'haute', 5000, '2025-12-31',
 'Organisation journée coworking + plan formation Q4 pour équipes',
 'Première expérience coworking pour l''équipe RH junior. Focus collaboration et team building.',
 'manager@arka.com'),

('Migration ERP v2', '550e8400-e29b-41d4-a716-446655440012', 'actif', 'normale', 25000, '2026-06-30',
 'Migration complète du système ERP vers nouvelle version avec formation équipes',
 'Système critique, migration par phases obligatoire. Équipes expérimentées mais résistance au changement.',
 'admin@arka.com'),

('Refonte Site Web', '550e8400-e29b-41d4-a716-446655440013', 'inactif', 'basse', 8000, '2025-11-15',
 'Refonte complète du site vitrine avec optimisation SEO',
 'Startup en croissance, besoin SEO + mobile-first. Budget serré mais ambitions élevées.',
 'manager@arka.com'),

('Stratégie Digitale 2025', '550e8400-e29b-41d4-a716-446655440014', 'actif', 'haute', 15000, '2025-10-31',
 'Définition stratégie digitale complète et roadmap 2025-2026',
 'Client traditionnel, transformation digitale nécessaire. Besoin accompagnement change management.',
 'manager@arka.com'),

('Audit Carbone Entreprise', '550e8400-e29b-41d4-a716-446655440015', 'actif', 'urgente', 12000, '2025-09-30',
 'Audit complet empreinte carbone + plan d''action réduction',
 'Entreprise engagée, deadline réglementaire proche. Besoin expertise technique et communication RSE.',
 'admin@arka.com'),

('Formation Management', '550e8400-e29b-41d4-a716-446655440011', 'archive', 'normale', 3500, '2025-06-15',
 'Programme de formation management pour superviseurs',
 'Formation réalisée avec succès. Équipe management junior formée aux bonnes pratiques.',
 'manager@arka.com');

-- =====================================
-- ASSIGNATIONS SQUADS (si les squads existent)
-- =====================================

-- Assigner Squad RH Alpha au projet Journée Coworking
INSERT INTO project_squads (project_id, squad_id, status, attached_by)
SELECT 1, s.id, 'active', 'manager@arka.com'
FROM squads s WHERE s.name = 'Squad RH Alpha' LIMIT 1;

-- Assigner Squad Tech Core au projet Migration ERP
INSERT INTO project_squads (project_id, squad_id, status, attached_by)
SELECT 2, s.id, 'active', 'admin@arka.com'
FROM squads s WHERE s.name = 'Squad Tech Core' LIMIT 1;

-- Assigner Squad Marketing Beta au projet Stratégie Digitale
INSERT INTO project_squads (project_id, squad_id, status, attached_by)
SELECT 4, s.id, 'active', 'manager@arka.com'
FROM squads s WHERE s.name = 'Squad Marketing Beta' LIMIT 1;

-- =====================================
-- ASSIGNATIONS AGENTS DIRECTS (si les agents existent)
-- =====================================

-- Agent Marketing direct pour le projet Refonte Site Web
INSERT INTO projet_agents (projet_id, agent_id, source, prompt_adaptation, assigned_by)
SELECT 3, a.id, 'direct', 
       'Startup tech en croissance rapide, budget limité. Adapter communication pour audience B2B SaaS. Priorité conversion et SEO.',
       'manager@arka.com'
FROM agents a WHERE a.name ILIKE '%Marketing%' LIMIT 1;

-- Agent Consultant pour le projet Audit Carbone
INSERT INTO projet_agents (projet_id, agent_id, source, prompt_adaptation, assigned_by)
SELECT 5, a.id, 'direct',
       'Secteur environnement, expertise RSE requise. Langage technique précis, communication impact mesurable. Deadline réglementaire urgente.',
       'admin@arka.com'
FROM agents a WHERE a.name ILIKE '%Consultant%' OR a.name ILIKE '%Expert%' LIMIT 1;

-- =====================================
-- PERMISSIONS PROJETS
-- =====================================

-- Permissions pour les créateurs de projets
INSERT INTO project_permissions (project_id, user_id, role, granted_by) VALUES
(1, 'manager@arka.com', 'owner', 'manager@arka.com'),
(2, 'admin@arka.com', 'owner', 'admin@arka.com'),
(3, 'manager@arka.com', 'owner', 'manager@arka.com'),
(4, 'manager@arka.com', 'owner', 'manager@arka.com'),
(5, 'admin@arka.com', 'owner', 'admin@arka.com'),
(6, 'manager@arka.com', 'owner', 'manager@arka.com');

-- Permissions additionnelles - operators assignés
INSERT INTO project_permissions (project_id, user_id, role, granted_by) VALUES
(1, 'operator1@arka.com', 'operator', 'manager@arka.com'),
(2, 'operator2@arka.com', 'operator', 'admin@arka.com'),
(4, 'operator1@arka.com', 'operator', 'manager@arka.com'),
(5, 'operator3@arka.com', 'operator', 'admin@arka.com');

-- Permissions managers partagés
INSERT INTO project_permissions (project_id, user_id, role, granted_by) VALUES
(2, 'manager2@arka.com', 'manager', 'admin@arka.com'),
(4, 'manager3@arka.com', 'manager', 'manager@arka.com');

-- =====================================
-- MISE À JOUR COMPTEURS AGENTS SQUADS
-- =====================================

-- Mettre à jour le compteur d'agents dans les squads (si la table squad_agents existe)
UPDATE squads SET agents_count = (
    SELECT COUNT(DISTINCT sa.agent_id)
    FROM squad_agents sa
    WHERE sa.squad_id = squads.id
    AND sa.status = 'active'
) WHERE EXISTS (SELECT 1 FROM squad_agents);

-- =====================================
-- VALIDATION DES DONNÉES
-- =====================================

-- Vérifier que les données ont été insérées correctement
DO $$
DECLARE
    clients_count INTEGER;
    projets_count INTEGER;
    assignments_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO clients_count FROM clients WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO projets_count FROM projets WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO assignments_count FROM projet_agents;
    
    RAISE NOTICE 'Seed data inserted successfully:';
    RAISE NOTICE '- Clients: %', clients_count;
    RAISE NOTICE '- Projets: %', projets_count;
    RAISE NOTICE '- Agent assignments: %', assignments_count;
    
    IF clients_count < 5 OR projets_count < 5 THEN
        RAISE WARNING 'Some demo data may not have been inserted correctly';
    END IF;
END $$;