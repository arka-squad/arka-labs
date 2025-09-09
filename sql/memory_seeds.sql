-- B22 Memory Sovereign Seeds
-- Demo data for coworking-q4 project

-- Update existing project with slug
UPDATE projects SET slug = 'coworking-q4' WHERE id = 1001;

-- Insert memory blocks for demo project
INSERT INTO memory_blocks (id, project_id, thread_id, block_type, content, agent_source, importance, tags, hash, created_at) VALUES 
-- Vision block
('mem_20250908_001', 1001, NULL, 'vision', '{
    "objectif": "Organiser journée coworking + plan formation Q4",
    "contraintes": ["Budget ≤ 1k€", "Salle J-7", "15 participants max"],
    "livrables": ["Synthèse écrite", "Planning validé", "Support formation"],
    "criteres_succes": ["Satisfaction > 8/10", "100% participation", "Budget respecté"],
    "missions": ["Coordination logistique", "Animation formation", "Suivi post-événement"]
}', 'PMO', 9, '{"strategie", "vision", "contraintes"}', 'sha256:a8f3c2b1e4d7f9a2b3c8e5f1a7b9d4c6e2f8a3b7c9e1f4a6b2d8c5e7f9a1b3c4', '2025-09-08T10:00:00Z'),

-- Decisions
('mem_20250908_002', 1001, NULL, 'decision', '{
    "decision": "Salle côté est confirmée",
    "rationale": "Meilleur accès handicapés + sortie secours conforme",
    "impact": ["Planning logistique validé", "Budget salle confirmé"],
    "responsable": "agp-gate",
    "alternatives_rejetees": ["Salle ouest (accès difficile)", "Salle centre (trop chère)"],
    "date_execution": "2025-09-15"
}', 'agp-gate', 8, '{"decision", "logistique", "validation"}', 'sha256:b9e4d3c2f5a8b1c7e9f2a4b6c8d1e5f9a3b7c2e4f8a6b9d3c5e1f7a2b4c8d6e9', '2025-09-08T11:30:00Z'),

('mem_20250908_003', 1001, NULL, 'decision', '{
    "decision": "Catering simple validé - formule sandwich",
    "rationale": "Budget contraint 1k€ impose solution économique",
    "impact": ["Budget restauration: 200€", "Satisfaction attendue: 7/10"],
    "responsable": "heloise-rh",
    "details": {"fournisseur": "Local Bio", "menu": "Sandwichs + fruits + boissons"}
}', 'heloise-rh', 7, '{"decision", "budget", "catering"}', 'sha256:c1f5a8b2e9f3c6a7b4d8e1f9c3a6b2e5f8c7a4b9d6e3f1c8a5b7e2f9c4a6b3d8', '2025-09-08T12:15:00Z'),

-- Context evolution
('mem_20250908_004', 1001, NULL, 'context_evolution', '{
    "previous_state": "Budget flexible, salle indéterminée",
    "new_state": "Budget max 1k€, salle est confirmée",
    "reason": "Contrainte budgétaire imposée par direction + validation technique salle",
    "agents_impacted": ["heloise-rh", "PMO"],
    "decisions_triggered": ["Catering simplifié", "Réduction participants si besoin"],
    "impact_analysis": "Planning serré mais réalisable, qualité préservée"
}', 'heloise-rh', 7, '{"contexte", "evolution", "budget"}', 'sha256:d2a6b9c3f7e1a4c8b5f2d9a6c3e7b1f4c9a2b8d5e1f6c4a9b3c7e2f8a5b1d4c6', '2025-09-08T14:30:00Z'),

-- Agent interactions
('mem_20250908_005', 1001, NULL, 'agents_interaction', '{
    "summary": "Coordination PMO-Héloïse pour planning détaillé",
    "participants": ["PMO", "heloise-rh"],
    "decisions_prises": ["Créneaux formation 9h-17h", "Pause déj 12h-13h30"],
    "actions_suivies": ["Réservation matériel AV", "Confirmation intervenant"],
    "blockers_identifies": [],
    "satisfaction": 8
}', 'PMO', 6, '{"coordination", "agents", "planning"}', 'sha256:e3b7c1f8a5d2c9b6f4a8c2e7b3f9c6a1b5d8c4f1a7b2c9e6f3a4b8c1d5f7a9b2', '2025-09-08T15:45:00Z'),

-- Governance
('mem_20250908_006', 1001, NULL, 'governance', '{
    "gate_passed": "AGP-PASS",
    "validation_details": "Salle validée techniquement, budget approuvé, planning cohérent",
    "validateur": "agp-gate",
    "criteres_respectes": ["Sécurité", "Accessibilité", "Budget", "Planning"],
    "next_milestone": "Validation finale budget direction",
    "date_target": "2025-09-20",
    "risk_assessment": "Faible - tous critères OK"
}', 'agp-gate', 9, '{"gouvernance", "validation", "gates"}', 'sha256:f4c8d1a7b3e9f2c5a8b1d6c9f3a5b2e8c4f7a1b9d3c6e2f5a8b4c7d1e9f2a6b3', '2025-09-08T16:00:00Z');

-- Insert context links between blocks
INSERT INTO memory_context_links (id, source_block_id, target_block_id, relation_type, strength) VALUES
('link_001', 'mem_20250908_004', 'mem_20250908_001', 'relates_to', 0.9), -- Context evolution relates to vision
('link_002', 'mem_20250908_002', 'mem_20250908_001', 'derives_from', 0.8), -- Room decision derives from vision
('link_003', 'mem_20250908_003', 'mem_20250908_004', 'derives_from', 0.9), -- Catering decision derives from budget context
('link_004', 'mem_20250908_006', 'mem_20250908_002', 'relates_to', 0.7), -- Governance validates room decision
('link_005', 'mem_20250908_005', 'mem_20250908_002', 'relates_to', 0.6); -- Coordination relates to decisions

-- Create initial snapshot
INSERT INTO memory_snapshots (id, project_id, snapshot_type, content_hash, size_mb, blocks_count, created_by, metadata) VALUES
('snap_20250908_001', 1001, 'manual', 'sha256:1a2b3c4d5e6f7890abcdef1234567890fedcba0987654321', 2.3, 6, 'PMO', '{
    "completion_percentage": 75,
    "active_agents": 3,
    "critical_decisions": ["Budget 1k€", "Salle est", "15 participants", "Catering simple"],
    "gates_passed": ["DoR", "AGP-PASS"],
    "next_milestones": ["Validation finale budget", "Confirmation intervenant"]
}');