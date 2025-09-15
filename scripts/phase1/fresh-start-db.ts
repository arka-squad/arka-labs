import { Client } from 'pg';

async function freshStartDatabase() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connexion base de données établie');

    console.log('🗑️  FRESH START - Suppression de toutes les tables...');

    // Drop toutes les tables dans l'ordre correct (contraintes FK)
    const dropQueries = [
      'DROP TABLE IF EXISTS migration_b29_backup CASCADE;',
      'DROP TABLE IF EXISTS project_squads CASCADE;',
      'DROP TABLE IF EXISTS project_assignments CASCADE;',
      'DROP TABLE IF EXISTS squad_members CASCADE;',
      'DROP TABLE IF EXISTS squad_instructions CASCADE;',
      'DROP TABLE IF EXISTS project_agents CASCADE;',
      'DROP TABLE IF EXISTS project_docs CASCADE;',
      'DROP TABLE IF EXISTS documents CASCADE;',
      'DROP TABLE IF EXISTS squads CASCADE;',
      'DROP TABLE IF EXISTS projects CASCADE;',
      'DROP TABLE IF EXISTS clients CASCADE;',
      'DROP TABLE IF EXISTS threads CASCADE;',
      'DROP TABLE IF EXISTS messages CASCADE;',
      'DROP TABLE IF EXISTS thread_pins CASCADE;',
      'DROP TABLE IF EXISTS thread_state CASCADE;',
      'DROP TABLE IF EXISTS agent_events CASCADE;',
      'DROP TABLE IF EXISTS agent_runs CASCADE;',
      'DROP TABLE IF EXISTS agent_credentials CASCADE;',
      'DROP TABLE IF EXISTS agent_instances CASCADE;',
      'DROP TABLE IF EXISTS agent_templates CASCADE;',
      'DROP TABLE IF EXISTS agents CASCADE;',
      'DROP TABLE IF EXISTS lots_history CASCADE;',
      'DROP TABLE IF EXISTS lots_state CASCADE;',
      'DROP TABLE IF EXISTS auth_audit_logs CASCADE;',
      'DROP TABLE IF EXISTS revoked_tokens CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',
      'DROP TABLE IF EXISTS webhook_dedup CASCADE;',
      'DROP TABLE IF EXISTS action_queue CASCADE;',
      'DROP TABLE IF EXISTS zz_proof CASCADE;'
    ];

    for (const query of dropQueries) {
      try {
        await client.query(query);
        console.log(`✅ ${query}`);
      } catch (error) {
        console.log(`⚠️  ${query} - table n'existait pas`);
      }
    }

    // Drop les types/enums
    const dropTypes = [
      'DROP TYPE IF EXISTS client_size CASCADE;',
      'DROP TYPE IF EXISTS client_status CASCADE;',
      'DROP TYPE IF EXISTS client_size_en CASCADE;',
      'DROP TYPE IF EXISTS client_status_en CASCADE;',
      'DROP TYPE IF EXISTS project_status CASCADE;',
      'DROP TYPE IF EXISTS squad_status CASCADE;',
      'DROP TYPE IF EXISTS instruction_status CASCADE;',
      'DROP TYPE IF EXISTS agent_role CASCADE;',
      'DROP TYPE IF EXISTS message_role CASCADE;'
    ];

    for (const query of dropTypes) {
      try {
        await client.query(query);
        console.log(`✅ ${query}`);
      } catch (error) {
        console.log(`⚠️  ${query} - type n'existait pas`);
      }
    }

    // Drop les fonctions
    const dropFunctions = [
      'DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;',
      'DROP FUNCTION IF EXISTS update_project_squad_count() CASCADE;'
    ];

    for (const query of dropFunctions) {
      try {
        await client.query(query);
        console.log(`✅ ${query}`);
      } catch (error) {
        console.log(`⚠️  ${query} - fonction n'existait pas`);
      }
    }

    console.log('\n🧹 Base de données complètement nettoyée!');
    console.log('🚀 Prêt pour création structure anglaise B29...');

  } catch (error) {
    console.error('❌ Erreur fresh start:', error);
    throw error;
  } finally {
    await client.end();
  }
}

freshStartDatabase().catch(console.error);