BEGIN;
CREATE INDEX IF NOT EXISTS agent_events_event_ts_idx ON agent_events (event, ts DESC);
COMMIT;
