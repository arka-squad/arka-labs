-- Migration 001: Normalisation complète vers l'anglais
-- Site en construction - Migration brutale autorisée

-- 1. Normalisation table clients (français → anglais)
ALTER TABLE clients RENAME COLUMN nom TO name;
ALTER TABLE clients RENAME COLUMN statut TO status;

-- 2. Ajout colonnes manquantes pour cohérence
ALTER TABLE clients ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS domain VARCHAR(100);

-- 3. Normalisation agents (mixte → anglais pur)
ALTER TABLE agents RENAME COLUMN domaine TO domain;

-- 4. Mise à jour indexes si existants
DROP INDEX IF EXISTS idx_clients_nom;
DROP INDEX IF EXISTS idx_clients_statut;
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- 5. Update contraintes
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_statut_check;
ALTER TABLE clients ADD CONSTRAINT clients_status_check
  CHECK (status IN ('active', 'inactive', 'archived'));

-- 6. Normalisation données existantes si nécessaire
UPDATE clients SET status = 'active' WHERE status IS NULL;
UPDATE agents SET domain = 'Tech' WHERE domain IS NULL;

COMMENT ON COLUMN clients.name IS 'Nom du client (normalisé anglais)';
COMMENT ON COLUMN clients.status IS 'Statut du client (normalisé anglais)';