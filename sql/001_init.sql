CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  mode TEXT DEFAULT 'shadow',
  repository TEXT,
  last_run TIMESTAMPTZ,
  health JSONB
);

CREATE TABLE agent_credentials (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  agent_id INTEGER REFERENCES agents(id),
  type TEXT,
  credential JSONB
);

CREATE TABLE agent_runs (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  agent_id INTEGER REFERENCES agents(id),
  run_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT
);

CREATE TABLE threads (
  id UUID PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  agent_id INTEGER REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  thread_id UUID REFERENCES threads(id),
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE thread_pins (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  thread_id UUID REFERENCES threads(id),
  message_id INTEGER REFERENCES messages(id)
);

CREATE TABLE thread_state (
  thread_id UUID PRIMARY KEY REFERENCES threads(id),
  project_id TEXT DEFAULT 'arka',
  state JSONB
);

CREATE TABLE agent_events (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  agent_id INTEGER REFERENCES agents(id),
  thread_id UUID,
  type TEXT,
  payload JSONB,
  hash TEXT UNIQUE,
  delivery_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lots_state (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  ref TEXT,
  state JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lots_history (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  ref TEXT,
  event JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE action_queue (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  action JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);
