-- B29 Migration 003: Add missing auth tables
-- Add users and auth_audit_logs tables that were missing from the fresh English migration

BEGIN;

-- Create sequence for auth_audit_logs
CREATE SEQUENCE IF NOT EXISTS auth_audit_logs_id_seq;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Create indexes for users
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users USING btree (role);

-- Create auth_audit_logs table
CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id INTEGER NOT NULL DEFAULT nextval('auth_audit_logs_id_seq'::regclass),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id VARCHAR(255),
  email_hash VARCHAR(64),
  role VARCHAR(50),
  route VARCHAR(255),
  method VARCHAR(10),
  status_code INTEGER,
  trace_id VARCHAR(255),
  jti VARCHAR(255),
  ip_hash VARCHAR(64),
  user_agent_hash VARCHAR(64),
  error_code VARCHAR(100),
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT auth_audit_logs_pkey PRIMARY KEY (id)
);

-- Create indexes for auth_audit_logs
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_timestamp ON auth_audit_logs USING btree (timestamp);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_route ON auth_audit_logs USING btree (route);

-- Insert default admin user if not exists
INSERT INTO users (email, role, password_hash)
VALUES ('admin@demo.local', 'admin', '$2a$12$demoHashForDevelopmentOnly')
ON CONFLICT (email) DO NOTHING;

COMMIT;

-- Display summary
SELECT
  'AUTH TABLES CREATED' as status,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM auth_audit_logs) as audit_logs_count;