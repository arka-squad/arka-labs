#!/usr/bin/env node
const { Client } = require('pg');

async function createAgentTables() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Tables clients and projects already exist with INTEGER IDs
    console.log('Using existing clients and projects tables...');

    // Drop existing agent tables if needed (for development)
    console.log('Dropping existing agent tables if they exist...');
    await client.query(`
      DROP TABLE IF EXISTS context_hierarchy CASCADE;
      DROP TABLE IF EXISTS agent_instances CASCADE;
      DROP TABLE IF EXISTS agent_templates CASCADE;
    `);

    // Create agent_templates table
    console.log('Creating agent_templates table...');
    await client.query(`
      CREATE TABLE agent_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('RH', 'Finance', 'Marketing', 'Operations', 'Support')),
        description TEXT,
        base_prompt TEXT NOT NULL,
        default_config JSONB NOT NULL DEFAULT '{}',
        capabilities JSONB DEFAULT '{}',
        required_integrations TEXT[] DEFAULT '{}',
        preview_tasks TEXT[] DEFAULT '{}',
        difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
        estimated_setup_minutes INTEGER DEFAULT 30,
        version VARCHAR(20) DEFAULT '1.0',
        is_active BOOLEAN DEFAULT true,
        tags TEXT[] DEFAULT '{}',
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create agent_instances table
    console.log('Creating agent_instances table...');
    await client.query(`
      CREATE TABLE agent_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES agent_templates(id),
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        domaine VARCHAR(50) NOT NULL,
        configuration JSONB DEFAULT '{}',
        context_config JSONB DEFAULT '{}',
        performance_thresholds JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'configuring', 'error', 'archived')),
        metrics JSONB DEFAULT '{}',
        wake_prompt TEXT,
        last_wake_at TIMESTAMP WITH TIME ZONE,
        wake_count INTEGER DEFAULT 0,
        avg_response_time_ms INTEGER,
        success_rate DECIMAL(5,2),
        parent_agent_id UUID REFERENCES agent_instances(id),
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // Create context_hierarchy table
    console.log('Creating context_hierarchy table...');
    await client.query(`
      CREATE TABLE context_hierarchy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        level VARCHAR(20) NOT NULL CHECK (level IN ('arka', 'client', 'project', 'agent')),
        entity_id VARCHAR(255) NOT NULL,
        configuration JSONB NOT NULL DEFAULT '{}',
        overrides JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        parent_level VARCHAR(20),
        parent_entity_id VARCHAR(255),
        cache_key VARCHAR(255) GENERATED ALWAYS AS (level || ':' || entity_id) STORED,
        cache_ttl_seconds INTEGER DEFAULT 300,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(level, entity_id)
      );
    `);

    // Create indexes
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX idx_agent_instances_project ON agent_instances(project_id, status) WHERE deleted_at IS NULL;
      CREATE INDEX idx_agent_instances_client ON agent_instances(client_id, status) WHERE deleted_at IS NULL;
      CREATE INDEX idx_agent_instances_template ON agent_instances(template_id) WHERE template_id IS NOT NULL;
      CREATE INDEX idx_agent_instances_performance ON agent_instances(success_rate DESC, avg_response_time_ms ASC) WHERE deleted_at IS NULL;
      CREATE INDEX idx_context_hierarchy_lookup ON context_hierarchy(level, entity_id);
      CREATE INDEX idx_context_hierarchy_cache ON context_hierarchy(cache_key);
    `);

    // Insert sample templates
    console.log('Inserting sample agent templates...');
    await client.query(`
      INSERT INTO agent_templates (
        name, slug, category, description, base_prompt, 
        default_config, capabilities, difficulty_level, created_by
      ) VALUES 
      (
        'Assistant RH Généraliste',
        'rh-generaliste',
        'RH',
        'Assistant pour la gestion des ressources humaines, congés, onboarding et reporting social',
        'Tu es un assistant RH expert pour PME française. Tu aides à la gestion des congés, l''onboarding des nouveaux employés, et la création de rapports sociaux. Tu es précis, bienveillant et respectueux de la confidentialité.',
        '{"temperature": 0.7, "max_tokens": 2000, "tools": ["calendar", "document_generator", "email_sender"], "policies": ["gdpr_compliant", "confidential"]}',
        '["gestion_conges", "onboarding", "reporting_social", "reponse_questions_rh"]',
        'intermediate',
        'admin@arka.com'
      ),
      (
        'Assistant Comptable PME',
        'compta-pme',
        'Finance',
        'Assistant comptable pour saisie, rapprochement bancaire et reporting financier',
        'Tu es un assistant comptable rigoureux et précis. Tu aides à la saisie comptable, au rapprochement bancaire et à la création de rapports financiers. Tu respectes les normes comptables françaises.',
        '{"temperature": 0.3, "max_tokens": 3000, "tools": ["calculator", "excel_reader", "invoice_generator"], "policies": ["financial_compliance", "accuracy_first"]}',
        '["saisie_comptable", "rapprochement", "reporting", "analyse_financiere"]',
        'advanced',
        'admin@arka.com'
      ),
      (
        'Assistant Marketing Digital',
        'marketing-digital',
        'Marketing',
        'Assistant pour la création de contenu, gestion des réseaux sociaux et campagnes marketing',
        'Tu es un assistant marketing créatif et orienté résultats. Tu aides à créer du contenu engageant, gérer les réseaux sociaux et optimiser les campagnes marketing.',
        '{"temperature": 0.8, "max_tokens": 2500, "tools": ["content_generator", "image_analyzer", "social_scheduler"], "policies": ["brand_voice", "engagement_focused"]}',
        '["creation_contenu", "social_media", "analyse_performance", "strategie_digitale"]',
        'intermediate',
        'admin@arka.com'
      ),
      (
        'Assistant Support Client',
        'support-client',
        'Support',
        'Assistant pour la gestion des tickets, FAQ et satisfaction client',
        'Tu es un assistant support client empathique et solution-oriented. Tu aides à résoudre les problèmes clients rapidement et efficacement.',
        '{"temperature": 0.6, "max_tokens": 1500, "tools": ["ticket_system", "knowledge_base", "email_sender"], "policies": ["customer_first", "escalation_rules"]}',
        '["resolution_tickets", "faq_management", "satisfaction_tracking", "escalation"]',
        'beginner',
        'admin@arka.com'
      );
    `);

    // Insert sample context hierarchy (Arka global config)
    console.log('Setting up global context...');
    await client.query(`
      INSERT INTO context_hierarchy (
        level, entity_id, configuration, metadata
      ) VALUES (
        'arka',
        'global',
        '{"language": "fr", "timezone": "Europe/Paris", "default_temperature": 0.7, "security_level": "high"}',
        '{"description": "Configuration globale Arka"}'
      );
    `);

    console.log('✅ Agent tables created successfully!');

  } catch (error) {
    console.error('Error creating agent tables:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the setup
createAgentTables().catch(console.error);