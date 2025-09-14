-- ARKA LABS DATABASE SCHEMA
-- Generated: 2025-09-13T22:24:08.893Z

-- Table: action_queue
CREATE TABLE action_queue (
  id bigint NOT NULL DEFAULT nextval('action_queue_id_seq'::regclass),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  scheduled_at timestamp with time zone,
  kind text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'queued'::text,
  attempts integer NOT NULL DEFAULT 0,
  dedupe_key text
);

-- Constraints for action_queue
ALTER TABLE action_queue ADD CONSTRAINT action_queue_pkey PRIMARY KEY (id);

-- Indexes for action_queue
CREATE UNIQUE INDEX ux_action_queue_dedupe ON public.action_queue USING btree (dedupe_key) WHERE (dedupe_key IS NOT NULL);
CREATE INDEX idx_action_queue_pick ON public.action_queue USING btree (status, scheduled_at NULLS FIRST, id);

-- Table: agent_credentials
CREATE TABLE agent_credentials (
  agent_id uuid NOT NULL,
  kind text NOT NULL,
  ref_key text NOT NULL
);

-- Constraints for agent_credentials
ALTER TABLE agent_credentials ADD CONSTRAINT agent_credentials_pkey PRIMARY KEY (agent_id);
ALTER TABLE agent_credentials ADD CONSTRAINT agent_credentials_pkey PRIMARY KEY (agent_id);
ALTER TABLE agent_credentials ADD CONSTRAINT agent_credentials_pkey PRIMARY KEY (kind);
ALTER TABLE agent_credentials ADD CONSTRAINT agent_credentials_pkey PRIMARY KEY (kind);
ALTER TABLE agent_credentials ADD CONSTRAINT agent_credentials_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id);

-- Table: agent_events
CREATE TABLE agent_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ts timestamp with time zone NOT NULL DEFAULT now(),
  project_id uuid,
  agent text NOT NULL,
  event text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  labels ARRAY NOT NULL DEFAULT '{}'::text[],
  links ARRAY NOT NULL DEFAULT '{}'::text[],
  kpis jsonb NOT NULL DEFAULT '{}'::jsonb,
  decisions ARRAY NOT NULL DEFAULT '{}'::text[],
  author text NOT NULL DEFAULT 'system'::text,
  source text NOT NULL DEFAULT 'console'::text,
  repo text,
  issue_ref text,
  pr_ref text,
  delivery_id text,
  hash text NOT NULL,
  agent_id integer,
  type character varying(100),
  payload_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now()
);

-- Constraints for agent_events
ALTER TABLE agent_events ADD CONSTRAINT agent_events_pkey PRIMARY KEY (id);

-- Indexes for agent_events
CREATE UNIQUE INDEX ux_agent_events_hash ON public.agent_events USING btree (hash);
CREATE INDEX idx_agent_events_ts ON public.agent_events USING btree (ts DESC);
CREATE INDEX idx_agent_events_agent ON public.agent_events USING btree (agent);
CREATE UNIQUE INDEX ux_agent_events_webhook_delivery ON public.agent_events USING btree (source, delivery_id) WHERE ((delivery_id IS NOT NULL) AND (source = 'webhook'::text));
CREATE INDEX idx_agent_events_project_created ON public.agent_events USING btree (project_id, created_at);
CREATE INDEX idx_agent_events_type ON public.agent_events USING btree (type);
CREATE INDEX idx_agent_events_payload_gin ON public.agent_events USING gin (payload_json);

-- Table: agent_instances
CREATE TABLE agent_instances (
  id integer NOT NULL DEFAULT nextval('agent_instances_id_seq'::regclass),
  agent_id integer,
  instance_name character varying(255),
  status character varying(50) DEFAULT 'inactive'::character varying,
  config jsonb DEFAULT '{}'::jsonb,
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  last_activity_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Constraints for agent_instances
ALTER TABLE agent_instances ADD CONSTRAINT agent_instances_pkey PRIMARY KEY (id);

-- Indexes for agent_instances
CREATE INDEX idx_agent_instances_agent_id ON public.agent_instances USING btree (agent_id);
CREATE INDEX idx_agent_instances_status ON public.agent_instances USING btree (status);

-- Table: agent_runs
CREATE TABLE agent_runs (
  id bigint NOT NULL DEFAULT nextval('agent_runs_id_seq'::regclass),
  agent_id uuid,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  trigger text NOT NULL,
  input_ref text,
  outcome text,
  error text
);

-- Constraints for agent_runs
ALTER TABLE agent_runs ADD CONSTRAINT agent_runs_pkey PRIMARY KEY (id);
ALTER TABLE agent_runs ADD CONSTRAINT agent_runs_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id);

-- Table: agent_templates
CREATE TABLE agent_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(255) NOT NULL,
  description text,
  role character varying(100),
  domaine character varying(50),
  prompt_system text,
  prompt_reveil text,
  instructions_speciales text,
  temperature numeric DEFAULT 0.7,
  max_tokens integer DEFAULT 1000,
  tools jsonb DEFAULT '[]'::jsonb,
  policies jsonb DEFAULT '[]'::jsonb,
  provider_preference character varying(50) DEFAULT 'auto'::character varying,
  tags ARRAY DEFAULT '{}'::text[],
  version character varying(20) DEFAULT '1.0'::character varying,
  is_active boolean DEFAULT true,
  is_template boolean DEFAULT true,
  created_by character varying(255) NOT NULL DEFAULT 'system'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Constraints for agent_templates
ALTER TABLE agent_templates ADD CONSTRAINT agent_templates_pkey PRIMARY KEY (id);

-- Indexes for agent_templates
CREATE INDEX idx_agent_templates_domaine ON public.agent_templates USING btree (domaine) WHERE (deleted_at IS NULL);
CREATE INDEX idx_agent_templates_active ON public.agent_templates USING btree (is_active) WHERE (deleted_at IS NULL);
CREATE INDEX idx_agent_templates_template ON public.agent_templates USING btree (is_template) WHERE (deleted_at IS NULL);

-- Table: agents
CREATE TABLE agents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role USER-DEFINED NOT NULL,
  mode text NOT NULL DEFAULT 'shadow'::text,
  prompt_system text NOT NULL,
  policies jsonb NOT NULL DEFAULT '{}'::jsonb,
  tools jsonb NOT NULL DEFAULT '[]'::jsonb,
  repos_allow ARRAY NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status text,
  domaine character varying(50),
  version character varying(20),
  description text,
  tags jsonb DEFAULT '[]'::jsonb,
  temperature numeric,
  max_tokens integer,
  deleted_at timestamp with time zone
);

-- Constraints for agents
ALTER TABLE agents ADD CONSTRAINT agents_pkey PRIMARY KEY (id);

-- Indexes for agents
CREATE UNIQUE INDEX agents_name_key ON public.agents USING btree (name);
CREATE INDEX idx_agents_status ON public.agents USING btree (status) WHERE (deleted_at IS NULL);
CREATE INDEX idx_agents_domaine ON public.agents USING btree (domaine) WHERE (deleted_at IS NULL);

-- Table: auth_audit_logs
CREATE TABLE auth_audit_logs (
  id integer NOT NULL DEFAULT nextval('auth_audit_logs_id_seq'::regclass),
  timestamp timestamp with time zone DEFAULT now(),
  user_id character varying(255),
  email_hash character varying(64),
  role character varying(50),
  route character varying(255),
  method character varying(10),
  status_code integer,
  trace_id character varying(255),
  jti character varying(255),
  ip_hash character varying(64),
  user_agent_hash character varying(64),
  error_code character varying(100),
  duration_ms integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Constraints for auth_audit_logs
ALTER TABLE auth_audit_logs ADD CONSTRAINT auth_audit_logs_pkey PRIMARY KEY (id);

-- Indexes for auth_audit_logs
CREATE INDEX idx_auth_audit_logs_user_id ON public.auth_audit_logs USING btree (user_id);
CREATE INDEX idx_auth_audit_logs_timestamp ON public.auth_audit_logs USING btree ("timestamp");
CREATE INDEX idx_auth_audit_logs_ip_hash ON public.auth_audit_logs USING btree (ip_hash);
CREATE INDEX idx_auth_audit_logs_route ON public.auth_audit_logs USING btree (route);
CREATE INDEX idx_auth_audit_logs_trace_id ON public.auth_audit_logs USING btree (trace_id);
CREATE INDEX idx_auth_audit_logs_status_code ON public.auth_audit_logs USING btree (status_code);

-- Table: clients
CREATE TABLE clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nom character varying(200) NOT NULL,
  secteur character varying(100),
  taille USER-DEFINED DEFAULT 'PME'::client_size,
  contact_principal jsonb DEFAULT '{}'::jsonb,
  contexte_specifique text,
  statut USER-DEFINED DEFAULT 'actif'::client_status,
  created_by character varying(255),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Constraints for clients
ALTER TABLE clients ADD CONSTRAINT clients_pkey PRIMARY KEY (id);

-- Indexes for clients
CREATE INDEX idx_clients_statut ON public.clients USING btree (statut) WHERE (deleted_at IS NULL);
CREATE INDEX idx_clients_taille ON public.clients USING btree (taille) WHERE (deleted_at IS NULL);
CREATE INDEX idx_clients_secteur ON public.clients USING gin (to_tsvector('french'::regconfig, (secteur)::text)) WHERE (deleted_at IS NULL);

-- Table: documents
CREATE TABLE documents (
  id integer NOT NULL DEFAULT nextval('documents_id_seq'::regclass),
  project_id uuid,
  name character varying(255),
  size integer,
  mime character varying(100),
  storage_url text,
  created_at timestamp without time zone DEFAULT now()
);

-- Constraints for documents
ALTER TABLE documents ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
ALTER TABLE documents ADD CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);

-- Table: lots_history
CREATE TABLE lots_history (
  id bigint NOT NULL DEFAULT nextval('lots_history_id_seq'::regclass),
  lot_key text NOT NULL,
  from_status text NOT NULL,
  to_status text NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  by_event_id uuid
);

-- Constraints for lots_history
ALTER TABLE lots_history ADD CONSTRAINT lots_history_pkey PRIMARY KEY (id);
ALTER TABLE lots_history ADD CONSTRAINT lots_history_by_event_id_fkey FOREIGN KEY (by_event_id) REFERENCES agent_events(id);

-- Indexes for lots_history
CREATE INDEX idx_lots_history_lot ON public.lots_history USING btree (lot_key, changed_at DESC);

-- Table: lots_state
CREATE TABLE lots_state (
  lot_key text NOT NULL,
  status text NOT NULL,
  kpis jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_event_id uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Constraints for lots_state
ALTER TABLE lots_state ADD CONSTRAINT lots_state_pkey PRIMARY KEY (lot_key);
ALTER TABLE lots_state ADD CONSTRAINT lots_state_last_event_id_fkey FOREIGN KEY (last_event_id) REFERENCES agent_events(id);

-- Table: messages
CREATE TABLE messages (
  id bigint NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
  thread_id uuid NOT NULL,
  ts timestamp with time zone NOT NULL DEFAULT now(),
  role USER-DEFINED NOT NULL,
  content text NOT NULL,
  tokens_in integer,
  tokens_out integer,
  tokens integer,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now()
);

-- Constraints for messages
ALTER TABLE messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
ALTER TABLE messages ADD CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES threads(id);

-- Indexes for messages
CREATE INDEX idx_messages_thread ON public.messages USING btree (thread_id, ts);
CREATE INDEX idx_messages_thread_created ON public.messages USING btree (thread_id, created_at);

-- Table: project_agents
CREATE TABLE project_agents (
  id integer NOT NULL DEFAULT nextval('project_agents_id_seq'::regclass),
  project_id uuid,
  agent_id integer,
  assigned_at timestamp with time zone DEFAULT now(),
  role character varying(100),
  created_at timestamp with time zone DEFAULT now()
);

-- Constraints for project_agents
ALTER TABLE project_agents ADD CONSTRAINT project_agents_pkey PRIMARY KEY (id);
ALTER TABLE project_agents ADD CONSTRAINT project_agents_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);

-- Table: project_assignments
CREATE TABLE project_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  agent_id uuid NOT NULL,
  status character varying(20) DEFAULT 'active'::character varying,
  assigned_by character varying(255),
  assigned_at timestamp with time zone DEFAULT now()
);

-- Constraints for project_assignments
ALTER TABLE project_assignments ADD CONSTRAINT project_assignments_pkey PRIMARY KEY (id);
ALTER TABLE project_assignments ADD CONSTRAINT project_assignments_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id);
ALTER TABLE project_assignments ADD CONSTRAINT project_assignments_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);

-- Indexes for project_assignments
CREATE INDEX idx_project_assignments_agent ON public.project_assignments USING btree (agent_id, status);
CREATE UNIQUE INDEX project_assignments_project_id_agent_id_status_key ON public.project_assignments USING btree (project_id, agent_id, status);
CREATE INDEX idx_project_assignments_project ON public.project_assignments USING btree (project_id, status);

-- Table: project_docs
CREATE TABLE project_docs (
  id integer NOT NULL DEFAULT nextval('project_docs_id_seq'::regclass),
  project_id uuid NOT NULL,
  name character varying(255) NOT NULL,
  size integer NOT NULL,
  mime character varying(100) NOT NULL,
  storage_url text NOT NULL,
  created_at timestamp without time zone DEFAULT now()
);

-- Constraints for project_docs
ALTER TABLE project_docs ADD CONSTRAINT project_docs_pkey PRIMARY KEY (id);
ALTER TABLE project_docs ADD CONSTRAINT project_docs_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);

-- Indexes for project_docs
CREATE INDEX idx_project_docs_project_created ON public.project_docs USING btree (project_id, created_at);

-- Table: project_squads
CREATE TABLE project_squads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  squad_id uuid NOT NULL,
  status character varying(20) DEFAULT 'active'::character varying,
  attached_by character varying(255) NOT NULL,
  attached_at timestamp with time zone DEFAULT now(),
  detached_at timestamp with time zone
);

-- Constraints for project_squads
ALTER TABLE project_squads ADD CONSTRAINT project_squads_pkey PRIMARY KEY (id);
ALTER TABLE project_squads ADD CONSTRAINT project_squads_squad_id_fkey FOREIGN KEY (squad_id) REFERENCES squads(id);
ALTER TABLE project_squads ADD CONSTRAINT project_squads_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);

-- Indexes for project_squads
CREATE INDEX idx_project_squads_squad ON public.project_squads USING btree (squad_id, status);
CREATE UNIQUE INDEX project_squads_project_id_squad_id_status_key ON public.project_squads USING btree (project_id, squad_id, status);
CREATE INDEX idx_project_squads_project ON public.project_squads USING btree (project_id, status);

-- Table: projects
CREATE TABLE projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  client_id uuid,
  description text,
  budget numeric,
  deadline date,
  priority character varying(20) DEFAULT 'normal'::character varying,
  status character varying(20) DEFAULT 'draft'::character varying,
  tags jsonb DEFAULT '[]'::jsonb,
  requirements jsonb DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- Constraints for projects
ALTER TABLE projects ADD CONSTRAINT projects_pkey PRIMARY KEY (id);

-- Table: revoked_tokens
CREATE TABLE revoked_tokens (
  id integer NOT NULL DEFAULT nextval('revoked_tokens_id_seq'::regclass),
  jti character varying(255) NOT NULL,
  token_hash character varying(64),
  revoked_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  user_id character varying(255),
  reason character varying(255),
  created_at timestamp with time zone DEFAULT now()
);

-- Constraints for revoked_tokens
ALTER TABLE revoked_tokens ADD CONSTRAINT revoked_tokens_pkey PRIMARY KEY (id);

-- Indexes for revoked_tokens
CREATE UNIQUE INDEX revoked_tokens_jti_key ON public.revoked_tokens USING btree (jti);
CREATE INDEX idx_revoked_tokens_jti ON public.revoked_tokens USING btree (jti);
CREATE INDEX idx_revoked_tokens_user_id ON public.revoked_tokens USING btree (user_id);

-- Table: squad_instructions
CREATE TABLE squad_instructions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  squad_id uuid NOT NULL,
  project_id uuid,
  content text NOT NULL,
  priority character varying(20) DEFAULT 'normal'::character varying,
  status USER-DEFINED DEFAULT 'pending'::instruction_status,
  routing_provider character varying(50),
  response_time_ms integer,
  created_by character varying(255) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Constraints for squad_instructions
ALTER TABLE squad_instructions ADD CONSTRAINT squad_instructions_pkey PRIMARY KEY (id);
ALTER TABLE squad_instructions ADD CONSTRAINT squad_instructions_squad_id_fkey FOREIGN KEY (squad_id) REFERENCES squads(id);
ALTER TABLE squad_instructions ADD CONSTRAINT squad_instructions_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);

-- Indexes for squad_instructions
CREATE INDEX idx_squad_instructions_squad_status ON public.squad_instructions USING btree (squad_id, status);
CREATE INDEX idx_squad_instructions_priority ON public.squad_instructions USING btree (priority, created_at) WHERE (status = ANY (ARRAY['pending'::instruction_status, 'queued'::instruction_status]));
CREATE INDEX idx_squad_instructions_project ON public.squad_instructions USING btree (project_id) WHERE (project_id IS NOT NULL);

-- Table: squad_members
CREATE TABLE squad_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  squad_id uuid NOT NULL,
  agent_id uuid NOT NULL,
  role character varying(50) NOT NULL,
  specializations ARRAY DEFAULT '{}'::text[],
  permissions jsonb DEFAULT '{}'::jsonb,
  status character varying(20) DEFAULT 'active'::character varying,
  created_at timestamp with time zone DEFAULT now()
);

-- Constraints for squad_members
ALTER TABLE squad_members ADD CONSTRAINT squad_members_pkey PRIMARY KEY (id);
ALTER TABLE squad_members ADD CONSTRAINT squad_members_squad_id_fkey FOREIGN KEY (squad_id) REFERENCES squads(id);
ALTER TABLE squad_members ADD CONSTRAINT squad_members_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id);

-- Indexes for squad_members
CREATE UNIQUE INDEX squad_members_squad_id_agent_id_key ON public.squad_members USING btree (squad_id, agent_id);
CREATE INDEX idx_squad_members_squad ON public.squad_members USING btree (squad_id, status);
CREATE INDEX idx_squad_members_agent ON public.squad_members USING btree (agent_id, status);

-- Table: squads
CREATE TABLE squads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  slug character varying(64) NOT NULL,
  mission text,
  domain character varying(50) NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'active'::squad_status,
  created_by character varying(255) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Constraints for squads
ALTER TABLE squads ADD CONSTRAINT squads_pkey PRIMARY KEY (id);

-- Indexes for squads
CREATE UNIQUE INDEX squads_slug_key ON public.squads USING btree (slug);
CREATE INDEX idx_squads_status_domain ON public.squads USING btree (status, domain) WHERE (deleted_at IS NULL);
CREATE INDEX idx_squads_created_by ON public.squads USING btree (created_by) WHERE (deleted_at IS NULL);

-- Table: thread_pins
CREATE TABLE thread_pins (
  thread_id uuid NOT NULL,
  kind text NOT NULL,
  ref text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Constraints for thread_pins
ALTER TABLE thread_pins ADD CONSTRAINT thread_pins_pkey PRIMARY KEY (thread_id);
ALTER TABLE thread_pins ADD CONSTRAINT thread_pins_pkey PRIMARY KEY (thread_id);
ALTER TABLE thread_pins ADD CONSTRAINT thread_pins_pkey PRIMARY KEY (thread_id);
ALTER TABLE thread_pins ADD CONSTRAINT thread_pins_pkey PRIMARY KEY (kind);
ALTER TABLE thread_pins ADD CONSTRAINT thread_pins_pkey PRIMARY KEY (kind);
ALTER TABLE thread_pins ADD CONSTRAINT thread_pins_pkey PRIMARY KEY (kind);
ALTER TABLE thread_pins ADD CONSTRAINT thread_pins_pkey PRIMARY KEY (ref);
ALTER TABLE thread_pins ADD CONSTRAINT thread_pins_pkey PRIMARY KEY (ref);
ALTER TABLE thread_pins ADD CONSTRAINT thread_pins_pkey PRIMARY KEY (ref);
ALTER TABLE thread_pins ADD CONSTRAINT thread_pins_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES threads(id);

-- Table: thread_state
CREATE TABLE thread_state (
  thread_id uuid NOT NULL,
  last_event_id uuid,
  lot_key text,
  context_hint jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Constraints for thread_state
ALTER TABLE thread_state ADD CONSTRAINT thread_state_pkey PRIMARY KEY (thread_id);
ALTER TABLE thread_state ADD CONSTRAINT thread_state_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES threads(id);
ALTER TABLE thread_state ADD CONSTRAINT thread_state_last_event_id_fkey FOREIGN KEY (last_event_id) REFERENCES agent_events(id);

-- Table: threads
CREATE TABLE threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  title text,
  created_by text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_msg_at timestamp with time zone,
  project_id uuid
);

-- Constraints for threads
ALTER TABLE threads ADD CONSTRAINT threads_pkey PRIMARY KEY (id);
ALTER TABLE threads ADD CONSTRAINT threads_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id);
ALTER TABLE threads ADD CONSTRAINT threads_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);

-- Indexes for threads
CREATE INDEX idx_threads_agent ON public.threads USING btree (agent_id, last_msg_at DESC);
CREATE INDEX idx_threads_project_created ON public.threads USING btree (project_id, created_at);

-- Table: users
CREATE TABLE users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL,
  password_hash text NOT NULL
);

-- Constraints for users
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Indexes for users
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_role ON public.users USING btree (role);

-- Table: webhook_dedup
CREATE TABLE webhook_dedup (
  delivery_id text NOT NULL,
  received_at timestamp with time zone DEFAULT now(),
  payload_hash text NOT NULL
);

-- Constraints for webhook_dedup
ALTER TABLE webhook_dedup ADD CONSTRAINT webhook_dedup_pkey PRIMARY KEY (delivery_id);

-- Table: zz_proof
CREATE TABLE zz_proof (
  id integer NOT NULL DEFAULT nextval('zz_proof_id_seq'::regclass),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Constraints for zz_proof
ALTER TABLE zz_proof ADD CONSTRAINT zz_proof_pkey PRIMARY KEY (id);

