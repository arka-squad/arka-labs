const { Client } = require('pg');

async function addRevokedTokensTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const createTableSql = `
-- Create sequence for revoked_tokens
CREATE SEQUENCE IF NOT EXISTS revoked_tokens_id_seq;

-- Create revoked_tokens table
CREATE TABLE IF NOT EXISTS revoked_tokens (
  id INTEGER NOT NULL DEFAULT nextval('revoked_tokens_id_seq'::regclass),
  jti VARCHAR(255) NOT NULL,
  token_hash VARCHAR(64),
  revoked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  user_id VARCHAR(255),
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT revoked_tokens_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS revoked_tokens_jti_key ON revoked_tokens USING btree (jti);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON revoked_tokens USING btree (expires_at);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_user_id ON revoked_tokens USING btree (user_id);
`;

    console.log('🚀 Adding revoked_tokens table...');
    await client.query(createTableSql);

    const result = await client.query(`
      SELECT
        'REVOKED_TOKENS TABLE ADDED' as status,
        (SELECT COUNT(*) FROM revoked_tokens) as revoked_tokens_count;
    `);

    console.log('✅ Table created successfully');
    console.log('📊 Results:', result.rows[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addRevokedTokensTable();