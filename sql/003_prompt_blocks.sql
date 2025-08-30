CREATE TABLE prompt_blocks (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  title TEXT NOT NULL,
  value TEXT NOT NULL,
  trigger TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE prompt_block_versions (
  id SERIAL PRIMARY KEY,
  block_id INTEGER REFERENCES prompt_blocks(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  value TEXT NOT NULL,
  trigger TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
