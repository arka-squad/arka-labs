BEGIN;
CREATE TABLE IF NOT EXISTS public.projects (
  id serial PRIMARY KEY,
  name text NOT NULL,
  created_by text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.projects (name)
SELECT 'R3 Demo Project'
WHERE NOT EXISTS (SELECT 1 FROM public.projects);
COMMIT;
