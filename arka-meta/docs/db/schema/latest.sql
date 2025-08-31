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
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  thread_id UUID REFERENCES threads(id),
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  tokens INTEGER,
  meta JSONB
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  project_id TEXT DEFAULT 'arka',
  name TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  tags TEXT[],
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
  agent TEXT,
  event TEXT,
  title TEXT,
  summary TEXT,
  labels TEXT[],
  links JSONB,
  kpis JSONB,
  decisions JSONB,
  author TEXT,
  source TEXT,
  repo TEXT,
  issue_ref TEXT,
  pr_ref TEXT,
  delivery_id TEXT,
  hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lots_state (
  lot_key TEXT PRIMARY KEY,
  state JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lots_history (
  id SERIAL PRIMARY KEY,
  lot_key TEXT,
  event JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE action_queue (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  dedupe_key TEXT UNIQUE,
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
alter table documents add column if not exists tags text[] not null default '{}';
alter table documents alter column tags set default '{}';
alter table documents alter column tags set not null;
create index if not exists idx_documents_tags on documents using gin (tags);
create index if not exists idx_documents_created_at on documents (created_at desc);
CREATE TABLE metrics_raw (
  id SERIAL PRIMARY KEY,
  trace_id TEXT,
  route TEXT,
  status INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
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
CREATE TABLE webhook_deliveries (
  delivery_id TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'processed'
);
BEGIN;
delete from agent_events where agent='demo_agent_r3' and event='metrics_run';
delete from messages where thread_id in (select id from threads where title='R3 Demo Thread');
delete from threads where title='R3 Demo Thread';
delete from agents where name='demo_agent_r3';
delete from project_docs where name='hello-demo.txt';
delete from projects where name='R3 Demo Project';
delete from users where email='owner.r3.demo@arka.local';
COMMIT;
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS public.projects (id serial PRIMARY KEY, name text NOT NULL, created_by text NOT NULL DEFAULT 'system', created_at timestamptz NOT NULL DEFAULT now());
CREATE OR REPLACE VIEW public.documents AS SELECT id, project_id, name, size, mime, storage_url, created_at FROM public.project_docs;
INSERT INTO public.users (id,email,role,password_hash) VALUES (gen_random_uuid(),'owner.r3.demo@arka.local','owner',crypt('Arka#R3!2025', gen_salt('bf',12))) ON CONFLICT (email) DO UPDATE SET role='owner', password_hash=EXCLUDED.password_hash;
INSERT INTO public.projects (name) SELECT 'R3 Demo Project' WHERE NOT EXISTS (SELECT 1 FROM public.projects);
INSERT INTO public.project_docs (project_id,name,size,mime,storage_url) SELECT id,'hello-demo.txt',14,'text/plain','demo/hello-demo.txt' FROM public.projects ORDER BY id ASC LIMIT 1 ON CONFLICT DO NOTHING;
DO DECLARE t regtype; v text; BEGIN SELECT a.atttypid::regtype INTO t FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid WHERE c.relnamespace='public'::regnamespace AND c.relname='agents' AND a.attname='role'; SELECT enumlabel INTO v FROM pg_enum WHERE enumtypid=t::oid ORDER BY enumsortorder LIMIT 1; EXECUTE format('INSERT INTO public.agents (id,name,role,prompt_system,mode,policies,tools,repos_allow) VALUES (gen_random_uuid(),$1,$2::%s,$3,''shadow'',''{}'',''[]'',''{}'') ON CONFLICT (name) DO UPDATE SET role=EXCLUDED.role, prompt_system=EXCLUDED.prompt_system', t::text) USING 'demo_agent_r3', v, 'You are the Arka demo agent.'; END;
INSERT INTO public.threads (id,agent_id,title,created_by,project_id,last_msg_at,created_at) SELECT gen_random_uuid(),a.id,'R3 Demo Thread','owner.r3.demo@arka.local',p.id,now(),now() FROM (SELECT id FROM public.agents WHERE name='demo_agent_r3' LIMIT 1) a,(SELECT id FROM public.projects ORDER BY id ASC LIMIT 1) p WHERE NOT EXISTS (SELECT 1 FROM public.threads WHERE title='R3 Demo Thread');
DO DECLARE t regtype; v_user text; v_asst text; th uuid; q text; BEGIN SELECT id INTO th FROM public.threads WHERE title='R3 Demo Thread' ORDER BY created_at DESC LIMIT 1; SELECT a.atttypid::regtype INTO t FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid WHERE c.relnamespace='public'::regnamespace AND c.relname='messages' AND a.attname='role'; SELECT enumlabel INTO v_user FROM pg_enum WHERE enumtypid=t::oid AND lower(enumlabel) IN ('user','human','client') ORDER BY enumsortorder LIMIT 1; IF v_user IS NULL THEN SELECT enumlabel INTO v_user FROM pg_enum WHERE enumtypid=t::oid ORDER BY enumsortorder LIMIT 1; END IF; SELECT enumlabel INTO v_asst FROM pg_enum WHERE enumtypid=t::oid AND lower(enumlabel) IN ('assistant','ai','bot') ORDER BY enumsortorder LIMIT 1; IF v_asst IS NULL THEN SELECT enumlabel INTO v_asst FROM pg_enum WHERE enumtypid=t::oid ORDER BY enumsortorder OFFSET 1 LIMIT 1; END IF; q := format('INSERT INTO public.messages (thread_id,role,content,ts) SELECT $1,$2::%s,$3,now() WHERE NOT EXISTS (SELECT 1 FROM public.messages WHERE thread_id=$1 AND content=$3)', t::text); EXECUTE q USING th, v_user, 'Hello from demo user'; EXECUTE q USING th, v_asst, 'Hi, this is demo assistant'; UPDATE public.threads SET last_msg_at=now() WHERE id=th; END;
WITH s AS (SELECT generate_series(1,25) AS g) INSERT INTO public.agent_events (agent,event,title,summary,hash,payload_json) SELECT 'demo_agent_r3','metrics_run','E2E metrics run','seed',gen_random_uuid()::text, jsonb_build_object('run_id','run'||g,'trace_id','trace'||g,'ttft_ms',600+(g*37)%1200,'rtt_ms',1200+(g*53)%1800,'status','200') FROM s WHERE NOT EXISTS (SELECT 1 FROM public.agent_events WHERE event='metrics_run');
COMMIT;
