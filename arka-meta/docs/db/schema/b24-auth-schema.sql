-- =================================================================
-- B24 Auth Schema - Authentification et RBAC pour Arka
-- Version: 1.0
-- Date: 2025-09-11
-- =================================================================

-- Extension des users existants ou création si nécessaire
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table révocation tokens (remplace sessions_blacklist)
CREATE TABLE IF NOT EXISTS revoked_tokens (
    jti UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(100) DEFAULT 'logout'
);

-- Index pour performance + TTL cleanup
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_exp ON revoked_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email) WHERE is_active = true;

-- Table assignations utilisateurs aux projets (pour RBAC ownership)
CREATE TABLE IF NOT EXISTS user_project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('manager', 'operator')),
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- Audit logs sécurisés
CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    email_hash VARCHAR(64), -- SHA256 de l'email pour privacy
    role VARCHAR(20),
    route VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    trace_id UUID NOT NULL,
    jti UUID,
    ip_hash VARCHAR(64) NOT NULL, -- SHA256 de l'IP
    user_agent_hash VARCHAR(64), -- SHA256 du user agent
    error_code VARCHAR(50),
    duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_timestamp ON auth_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_auth_audit_user ON auth_audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_auth_audit_trace ON auth_audit_logs(trace_id);

-- Ajout de la colonne created_by aux projets si elle n'existe pas
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Fonction pour nettoyer automatiquement les tokens expirés
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM revoked_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();