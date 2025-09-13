#!/usr/bin/env node
const { Pool } = require('pg');

async function createAgentTemplatesTable() {
  const connectionString = process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
  
  const pool = new Pool({ connectionString });
  
  try {
    console.log('📝 Création de la table agent_templates...\n');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        role VARCHAR(100),
        domaine VARCHAR(50),
        prompt_system TEXT,
        prompt_reveil TEXT,
        instructions_speciales TEXT,
        temperature DECIMAL(3,2) DEFAULT 0.7,
        max_tokens INTEGER DEFAULT 1000,
        tools JSONB DEFAULT '[]',
        policies JSONB DEFAULT '[]',
        provider_preference VARCHAR(50) DEFAULT 'auto',
        tags TEXT[] DEFAULT '{}',
        version VARCHAR(20) DEFAULT '1.0',
        is_active BOOLEAN DEFAULT true,
        is_template BOOLEAN DEFAULT true,
        created_by VARCHAR(255) NOT NULL DEFAULT 'system',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    console.log('✅ Table agent_templates créée');
    
    // Ajouter quelques templates de base
    console.log('📄 Ajout de templates de base...');
    await pool.query(`
      INSERT INTO agent_templates (name, description, role, domaine, prompt_system) VALUES
      ('Template RH Généraliste', 'Template pour agents RH polyvalents', 'assistant', 'RH', 'Tu es un expert en ressources humaines, spécialisé dans le recrutement et la gestion des talents.'),
      ('Template Tech Support', 'Template pour agents de support technique', 'assistant', 'Tech', 'Tu es un expert technique capable d''aider sur divers problèmes informatiques et de développement.'),
      ('Template Marketing Digital', 'Template pour agents marketing', 'assistant', 'Marketing', 'Tu es un expert en marketing digital, spécialisé dans les stratégies de communication et de croissance.')
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Créer les indexes
    console.log('📊 Création des indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_templates_domaine ON agent_templates(domaine) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_agent_templates_active ON agent_templates(is_active) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_agent_templates_template ON agent_templates(is_template) WHERE deleted_at IS NULL;
    `);
    
    console.log('✅ Templates et indexes créés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création :', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAgentTemplatesTable();