-- B28 Phase 3 - Performance Optimization Indexes
-- Objectif: Réduire temps réponse API < 100ms P95

-- ============================================
-- INDEXES POUR REQUÊTES FRÉQUENTES
-- ============================================

-- Projects - Requêtes par client et status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_client_status
  ON projects(client_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status_updated
  ON projects(status, updated_at DESC)
  WHERE deleted_at IS NULL;

-- Agents - Recherche par domaine et status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_domain_status
  ON agents(domaine, status)
  WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_status_created
  ON agents(status, created_at DESC)
  WHERE deleted_at IS NULL;

-- Clients - Recherche et tri
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_secteur_status
  ON clients(secteur, status)
  WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_created
  ON clients(created_at DESC)
  WHERE deleted_at IS NULL;

-- Squads - Domaine et status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_squads_domain_status
  ON squads(domain, status)
  WHERE deleted_at IS NULL;

-- ============================================
-- INDEXES POUR JOINTURES (Relations)
-- ============================================

-- Project assignments
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_assignments_project_agent
  ON project_assignments(project_id, agent_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_assignments_agent_active
  ON project_assignments(agent_id, status)
  WHERE status = 'active';

-- Squad members
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_squad_members_squad_agent
  ON squad_members(squad_id, agent_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_squad_members_agent_active
  ON squad_members(agent_id, status)
  WHERE status = 'active';

-- Client projects
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_client_active
  ON projects(client_id, created_at DESC)
  WHERE status IN ('active', 'pending');

-- ============================================
-- INDEXES POUR RECHERCHE TEXTE
-- ============================================

-- Extension pour recherche textuelle optimisée
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Projects - Recherche par nom
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_name_trgm
  ON projects USING gin(name gin_trgm_ops)
  WHERE deleted_at IS NULL;

-- Clients - Recherche par nom
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_nom_trgm
  ON clients USING gin(nom gin_trgm_ops)
  WHERE deleted_at IS NULL;

-- Agents - Recherche par nom
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_name_trgm
  ON agents USING gin(name gin_trgm_ops)
  WHERE deleted_at IS NULL;

-- ============================================
-- INDEXES POUR AUDIT ET LOGGING
-- ============================================

-- System logs - Pour debugging et monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logs_timestamp_level
  ON logs(created_at DESC, level)
  WHERE created_at > NOW() - INTERVAL '30 days';

-- User sessions - Pour auth rapide
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_token_active
  ON user_sessions(token_hash, expires_at)
  WHERE status = 'active' AND expires_at > NOW();

-- ============================================
-- INDEXES COMPOSITESS SPÉCIALISÉS
-- ============================================

-- Dashboard queries - Projets actifs par client
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_active_projects
  ON projects(client_id, status, updated_at DESC)
  WHERE status IN ('active', 'pending', 'review') AND deleted_at IS NULL;

-- Admin queries - Vue globale
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_overview
  ON projects(status, priority, created_at DESC)
  WHERE deleted_at IS NULL;

-- Performance monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_perf_monitoring
  ON agent_metrics(agent_id, metric_date DESC)
  WHERE metric_date > NOW() - INTERVAL '7 days';

-- ============================================
-- OPTIMIZATIONS AVANCÉES
-- ============================================

-- Partial indexes pour données récentes (plus rapides)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recent_projects
  ON projects(client_id, updated_at DESC)
  WHERE updated_at > NOW() - INTERVAL '90 days' AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recent_agents
  ON agents(status, last_seen DESC)
  WHERE last_seen > NOW() - INTERVAL '30 days';

-- Index pour pagination efficace
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_pagination
  ON projects(id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_pagination
  ON clients(id, created_at DESC)
  WHERE deleted_at IS NULL;

-- ============================================
-- MAINTENANCE ET STATISTIQUES
-- ============================================

-- Analyser les tables pour optimiser le query planner
ANALYZE projects;
ANALYZE agents;
ANALYZE clients;
ANALYZE squads;
ANALYZE project_assignments;
ANALYZE squad_members;

-- Vacuum pour récupérer l'espace et optimiser
VACUUM ANALYZE projects;
VACUUM ANALYZE agents;
VACUUM ANALYZE clients;
VACUUM ANALYZE squads;

-- ============================================
-- MONITORING DES PERFORMANCES
-- ============================================

-- Vue pour monitorer les requêtes lentes
CREATE OR REPLACE VIEW slow_queries AS
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100  -- Requêtes > 100ms
ORDER BY mean_time DESC
LIMIT 20;

-- Fonction pour monitorer l'utilisation des index
CREATE OR REPLACE FUNCTION index_usage_stats()
RETURNS TABLE(
  table_name text,
  index_name text,
  index_scans bigint,
  table_scans bigint,
  usage_ratio numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname||'.'||tablename as table_name,
    indexname as index_name,
    idx_scan as index_scans,
    seq_scan as table_scans,
    CASE WHEN (idx_scan + seq_scan) > 0
      THEN round(100.0 * idx_scan / (idx_scan + seq_scan), 2)
      ELSE 0
    END as usage_ratio
  FROM pg_stat_user_indexes ui
  JOIN pg_stat_user_tables ut ON ui.relid = ut.relid
  ORDER BY usage_ratio DESC;
END;
$$ LANGUAGE plpgsql;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ B28 Phase 3 - Performance indexes created successfully';
  RAISE NOTICE '📊 Tables analyzed and optimized';
  RAISE NOTICE '🎯 Expected improvement: API response time < 100ms P95';
END $$;