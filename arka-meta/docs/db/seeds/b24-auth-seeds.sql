-- =================================================================
-- B24 Auth Seeds - Données de démonstration
-- Version: 1.0
-- Date: 2025-09-11
-- =================================================================

-- Users demo avec passwords pre-hash (bcrypt cost 12)
-- Password pour tous: demo123
INSERT INTO users (id, email, password_hash, role, full_name, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440051', 'admin@arka.com', '$2b$12$LQv3c1yqBwLFdpRyqghjuO.1sSG9Vdj.4ycfC5kWvxY1QQA1rZrVK', 'admin', 'Admin Arka', true),
('550e8400-e29b-41d4-a716-446655440052', 'manager@arka.com', '$2b$12$LQv3c1yqBwLFdpRyqghjuO.1sSG9Vdj.4ycfC5kWvxY1QQA1rZrVK', 'manager', 'Manager Demo', true),
('550e8400-e29b-41d4-a716-446655440053', 'operator@arka.com', '$2b$12$LQv3c1yqBwLFdpRyqghjuO.1sSG9Vdj.4ycfC5kWvxY1QQA1rZrVK', 'operator', 'Operator Demo', true),
('550e8400-e29b-41d4-a716-446655440054', 'viewer@arka.com', '$2b$12$LQv3c1yqBwLFdpRyqghjuO.1sSG9Vdj.4ycfC5kWvxY1QQA1rZrVK', 'viewer', 'Viewer Demo', true)
ON CONFLICT (email) DO NOTHING;

-- Assignations projets pour demo ownership
-- Note: Ces assignations utilisent les IDs de projets existants dans la base
INSERT INTO user_project_assignments (user_id, project_id, role, assigned_by) VALUES
('550e8400-e29b-41d4-a716-446655440052', 1, 'manager', '550e8400-e29b-41d4-a716-446655440051'), -- Manager → Projet 1
('550e8400-e29b-41d4-a716-446655440052', 5, 'manager', '550e8400-e29b-41d4-a716-446655440051'), -- Manager → Projet 5
('550e8400-e29b-41d4-a716-446655440053', 1, 'operator', '550e8400-e29b-41d4-a716-446655440052'), -- Operator → Projet 1
('550e8400-e29b-41d4-a716-446655440053', 4, 'operator', '550e8400-e29b-41d4-a716-446655440051')  -- Operator → Projet 4
ON CONFLICT (user_id, project_id) DO NOTHING;

-- Update projets avec created_by pour ownership (si les projets existent)
UPDATE projects SET created_by = 'manager@arka.com' WHERE id IN (1, 5);
UPDATE projects SET created_by = 'admin@arka.com' WHERE id IN (2, 3, 4, 6, 7);