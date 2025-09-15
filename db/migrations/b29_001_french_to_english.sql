-- B29 Migration 001: French to English
-- Migrate French column names to English for consistency

BEGIN;

-- Sauvegarder l'état actuel dans une table temporaire
CREATE TABLE IF NOT EXISTS migration_b29_backup AS
SELECT 'clients' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('clients', 'projects');

-- CLIENTS: Migration des colonnes FR → EN
DO $$
BEGIN
  -- Renommer les colonnes si elles existent en français
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='clients' AND column_name='nom') THEN
    ALTER TABLE clients RENAME COLUMN nom TO name;
    RAISE NOTICE 'Renamed clients.nom to clients.name';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='clients' AND column_name='secteur') THEN
    ALTER TABLE clients RENAME COLUMN secteur TO sector;
    RAISE NOTICE 'Renamed clients.secteur to clients.sector';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='clients' AND column_name='taille') THEN
    ALTER TABLE clients RENAME COLUMN taille TO size;
    RAISE NOTICE 'Renamed clients.taille to clients.size';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='clients' AND column_name='statut') THEN
    ALTER TABLE clients RENAME COLUMN statut TO status;
    RAISE NOTICE 'Renamed clients.statut to clients.status';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='clients' AND column_name='contact_principal') THEN
    ALTER TABLE clients RENAME COLUMN contact_principal TO primary_contact;
    RAISE NOTICE 'Renamed clients.contact_principal to clients.primary_contact';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='clients' AND column_name='contexte_specifique') THEN
    ALTER TABLE clients RENAME COLUMN contexte_specifique TO specific_context;
    RAISE NOTICE 'Renamed clients.contexte_specifique to clients.specific_context';
  END IF;
END $$;

-- PROJECTS: Migration des colonnes FR → EN
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='projects' AND column_name='nom') THEN
    ALTER TABLE projects RENAME COLUMN nom TO name;
    RAISE NOTICE 'Renamed projects.nom to projects.name';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='projects' AND column_name='statut') THEN
    ALTER TABLE projects RENAME COLUMN statut TO status;
    RAISE NOTICE 'Renamed projects.statut to projects.status';
  END IF;
END $$;

-- Ajouter les colonnes manquantes pour projects si nécessaire
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS squad_count INTEGER DEFAULT 0;

-- Créer les enums s'ils n'existent pas
DO $$
BEGIN
  -- Client size enum (migration depuis client_size existant)
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_size_en') THEN
    CREATE TYPE client_size_en AS ENUM ('small', 'medium', 'large', 'enterprise');
  END IF;

  -- Client status enum (migration depuis client_status existant)
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_status_en') THEN
    CREATE TYPE client_status_en AS ENUM ('active', 'inactive', 'pending');
  END IF;

  -- Project status enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM ('active', 'on_hold', 'completed', 'cancelled');
  END IF;

  -- Squad status enum (déjà existant normalement)
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'squad_status') THEN
    CREATE TYPE squad_status AS ENUM ('active', 'suspended', 'archived');
  END IF;
END $$;

-- Mettre à jour les types de colonnes status pour clients
DO $$
BEGIN
  -- Migration du type client_size vers client_size_en
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='size') THEN
    ALTER TABLE clients
    ALTER COLUMN size TYPE client_size_en
    USING CASE
      WHEN size::text IN ('TPE', 'small') THEN 'small'::client_size_en
      WHEN size::text IN ('PME', 'medium') THEN 'medium'::client_size_en
      WHEN size::text IN ('ETI', 'large') THEN 'large'::client_size_en
      WHEN size::text IN ('GE', 'enterprise') THEN 'enterprise'::client_size_en
      ELSE 'medium'::client_size_en
    END;
    RAISE NOTICE 'Updated clients.size to use client_size_en enum';
  END IF;

  -- Migration du type client_status vers client_status_en
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='status') THEN
    ALTER TABLE clients
    ALTER COLUMN status TYPE client_status_en
    USING CASE
      WHEN status::text IN ('actif', 'active') THEN 'active'::client_status_en
      WHEN status::text IN ('inactif', 'inactive') THEN 'inactive'::client_status_en
      WHEN status::text IN ('prospect', 'pending') THEN 'pending'::client_status_en
      ELSE 'active'::client_status_en
    END;
    RAISE NOTICE 'Updated clients.status to use client_status_en enum';
  END IF;
END $$;

-- Mettre à jour les types de colonnes status pour projects
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='status') THEN
    ALTER TABLE projects
    ALTER COLUMN status TYPE project_status
    USING CASE
      WHEN status IN ('actif', 'active', 'draft') THEN 'active'::project_status
      WHEN status IN ('en_attente', 'on_hold') THEN 'on_hold'::project_status
      WHEN status IN ('termine', 'completed') THEN 'completed'::project_status
      WHEN status = 'cancelled' THEN 'cancelled'::project_status
      ELSE 'active'::project_status
    END;
    RAISE NOTICE 'Updated projects.status to use project_status enum';
  END IF;
END $$;

-- Créer des index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_clients_status_en ON clients(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_size_en ON clients(size) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status_en ON projects(status) WHERE deleted_at IS NULL;

COMMIT;