Règle : ces blocs sont collés tels quels par l’Owner (aucun commentaire entre BEGIN; et COMMIT;).

## migrations
```sql
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS public.projects (id serial PRIMARY KEY, name text NOT NULL, created_by text NOT NULL DEFAULT 'system', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.project_docs (id serial PRIMARY KEY, project_id text NOT NULL, name text NOT NULL, mime text NOT NULL, size integer NOT NULL, storage_url text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE OR REPLACE VIEW public.documents AS SELECT id, project_id, name, size, mime, storage_url, created_at FROM public.project_docs;
COMMIT;


BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO public.users (id,email,role,password_hash) VALUES (gen_random_uuid(),'owner.r3.demo@arka.local','owner',crypt('Arka#R3!2025', gen_salt('bf',12))) ON CONFLICT (email) DO UPDATE SET role='owner', password_hash=EXCLUDED.password_hash;
INSERT INTO public.projects (name) SELECT 'R3 Demo Project' WHERE NOT EXISTS (SELECT 1 FROM public.projects);
INSERT INTO public.project_docs (project_id,name,size,mime,storage_url) SELECT id,'hello-demo.txt',14,'text/plain','demo/hello-demo.txt' FROM public.projects ORDER BY id ASC LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO public.agents (name,role,mode,prompt_system) VALUES ('demo_agent_r3','assistant','shadow','You are the Arka demo agent.') ON CONFLICT (name) DO UPDATE SET role=EXCLUDED.role, prompt_system=EXCLUDED.prompt_system;
INSERT INTO public.threads (id,agent_id,title,created_by,project_id,created_at) SELECT gen_random_uuid(),a.id,'R3 Demo Thread','owner.r3.demo@arka.local',p.id,now() FROM (SELECT id FROM public.agents WHERE name='demo_agent_r3' LIMIT 1) a,(SELECT id FROM public.projects ORDER BY id ASC LIMIT 1) p WHERE NOT EXISTS (SELECT 1 FROM public.threads WHERE title='R3 Demo Thread');
WITH th AS (SELECT id FROM public.threads WHERE title='R3 Demo Thread' ORDER BY created_at DESC LIMIT 1)
INSERT INTO public.messages (thread_id,role,content,created_at) SELECT th.id,'user','Hello from demo user',now() FROM th WHERE NOT EXISTS (SELECT 1 FROM public.messages WHERE thread_id=th.id AND content='Hello from demo user');
WITH th AS (SELECT id FROM public.threads WHERE title='R3 Demo Thread' ORDER BY created_at DESC LIMIT 1)
INSERT INTO public.messages (thread_id,role,content,created_at) SELECT th.id,'assistant','Hi, this is demo assistant',now() FROM th WHERE NOT EXISTS (SELECT 1 FROM public.messages WHERE thread_id=th.id AND content='Hi, this is demo assistant');
WITH s AS (SELECT generate_series(1,25) AS g)
INSERT INTO public.agent_events (agent,event,title,summary,hash,kpis) SELECT 'demo_agent_r3','metrics_run','E2E metrics run','seed',gen_random_uuid()::text, jsonb_build_object('run_id','run'||g,'trace_id','trace'||g,'ttft_ms',600+(g*37)%1200,'rtt_ms',1200+(g*53)%1800,'status','200') FROM s WHERE NOT EXISTS (SELECT 1 FROM public.agent_events WHERE event='metrics_run');
COMMIT;
