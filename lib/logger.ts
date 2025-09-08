type LogFields = {
  route?: string | null;
  job_id?: string | null;
  gate_id?: string | null;
  recipe_id?: string | null;
  status?: number | null;
  duration_ms?: number | null;
  trace_id?: string | null;
  user_role?: string | null;
  [key: string]: any;
};

export function log(level: string, msg: string, fields: LogFields) {
  const base = {
    ts: new Date().toISOString(),
    level,
    msg,
    route: null,
    job_id: null,
    gate_id: null,
    recipe_id: null,
    status: null,
    duration_ms: null,
    trace_id: null,
    user_role: null,
  };
  console.log(JSON.stringify({ ...base, ...fields }));
}
