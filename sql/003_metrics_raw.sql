CREATE TABLE metrics_raw (
  id SERIAL PRIMARY KEY,
  trace_id TEXT,
  route TEXT,
  status INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
