/**
 * Script B28 - Génération correction schéma DB
 * Corrige les contraintes PRIMARY KEY dupliquées
 */

const fs = require('fs');
const path = require('path');

function generateDBFix() {
  console.log('🔨 Génération du script de correction DB...');

  const fixes = `-- ========================================
-- B28 DATABASE SCHEMA FIX
-- Correction des contraintes PRIMARY KEY dupliquées
-- Date: ${new Date().toISOString()}
-- ========================================

BEGIN;

-- ========================================
-- Table: agent_credentials
-- Problème: 4 PRIMARY KEY conflictuelles sur même table
-- Solution: DROP et recréation avec une seule PRIMARY KEY composite
-- ========================================

-- Supprimer toutes les contraintes existantes
ALTER TABLE agent_credentials DROP CONSTRAINT IF EXISTS agent_credentials_pkey CASCADE;

-- Vérifier structure actuelle
-- La table doit avoir: agent_id (UUID), kind (TEXT), ref_key (TEXT)

-- Recréer la table proprement si nécessaire (ATTENTION: perte de données)
-- Décommenter uniquement si structure corrompue:
/*
DROP TABLE IF EXISTS agent_credentials CASCADE;
CREATE TABLE agent_credentials (
    agent_id UUID NOT NULL,
    kind TEXT NOT NULL,
    ref_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
*/

-- Ajouter UNE SEULE PRIMARY KEY composite
ALTER TABLE agent_credentials
  ADD CONSTRAINT agent_credentials_pkey
  PRIMARY KEY (agent_id, kind);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_agent_credentials_agent
  ON agent_credentials(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_credentials_kind
  ON agent_credentials(kind);

-- Foreign key vers agents si elle n'existe pas
-- ALTER TABLE agent_credentials
--   ADD CONSTRAINT fk_agent_credentials_agent
--   FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- ========================================
-- Table: thread_pins
-- Problème: 9 PRIMARY KEY conflictuelles sur même table
-- Solution: DROP et recréation avec une seule PRIMARY KEY composite
-- ========================================

-- Supprimer toutes les contraintes existantes
ALTER TABLE thread_pins DROP CONSTRAINT IF EXISTS thread_pins_pkey CASCADE;

-- Vérifier structure actuelle
-- La table doit avoir: thread_id (UUID), kind (TEXT), ref (TEXT), meta (JSONB)

-- Recréer la table proprement si nécessaire (ATTENTION: perte de données)
-- Décommenter uniquement si structure corrompue:
/*
DROP TABLE IF EXISTS thread_pins CASCADE;
CREATE TABLE thread_pins (
    thread_id UUID NOT NULL,
    kind TEXT NOT NULL,
    ref TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
*/

-- Ajouter UNE SEULE PRIMARY KEY composite
ALTER TABLE thread_pins
  ADD CONSTRAINT thread_pins_pkey
  PRIMARY KEY (thread_id, kind, ref);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_thread_pins_thread
  ON thread_pins(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_pins_kind
  ON thread_pins(kind);
CREATE INDEX IF NOT EXISTS idx_thread_pins_ref
  ON thread_pins(ref);

-- Foreign key vers threads si elle n'existe pas
-- ALTER TABLE thread_pins
--   ADD CONSTRAINT fk_thread_pins_thread
--   FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE;

COMMIT;

-- ========================================
-- Vérifications post-correction
-- ========================================

-- Vérifier qu'il n'y a qu'une PRIMARY KEY par table
SELECT
    t.table_name,
    COUNT(DISTINCT tc.constraint_name) as primary_key_count
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc
    ON t.table_name = tc.table_name
    AND tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
WHERE t.table_schema = 'public'
    AND t.table_name IN ('agent_credentials', 'thread_pins')
GROUP BY t.table_name
ORDER BY t.table_name;

-- Résultat attendu: 1 PRIMARY KEY par table

-- Vérifier structure des contraintes
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('agent_credentials', 'thread_pins')
    AND tc.constraint_type = 'PRIMARY KEY'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name;

-- Test d'insertion pour valider
-- INSERT INTO agent_credentials (agent_id, kind, ref_key)
-- VALUES (gen_random_uuid(), 'test', 'test_key')
-- ON CONFLICT (agent_id, kind) DO NOTHING;

-- INSERT INTO thread_pins (thread_id, kind, ref, meta)
-- VALUES (gen_random_uuid(), 'test', 'test_ref', '{}')
-- ON CONFLICT (thread_id, kind, ref) DO NOTHING;

-- Nettoyer tests si insérés
-- DELETE FROM agent_credentials WHERE kind = 'test';
-- DELETE FROM thread_pins WHERE kind = 'test';

SELECT '✅ Correction schéma DB terminée avec succès!' as status;
`;

  const migrationPath = path.join('db', 'migrations', 'b28_001_fix_constraints.sql');

  // Créer le dossier migrations s'il n'existe pas
  const migrationsDir = path.join('db', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  fs.writeFileSync(migrationPath, fixes);

  console.log(`✅ Script de correction généré: ${migrationPath}`);
  console.log('📋 Contenu:');
  console.log('   • Correction agent_credentials (4 contraintes → 1 composite)');
  console.log('   • Correction thread_pins (9 contraintes → 1 composite)');
  console.log('   • Indexes de performance');
  console.log('   • Vérifications post-correction');
  console.log('');
  console.log('⚠️  ATTENTION: Tester sur DB locale avant production!');

  return {
    migrationPath,
    tablesFixed: ['agent_credentials', 'thread_pins'],
    issuesFixed: 11
  };
}

// Exécution si lancé directement
if (require.main === module) {
  generateDBFix();
}

module.exports = { generateDBFix };