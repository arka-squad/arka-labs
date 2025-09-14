type LogFields = {
  route: string;
  status: number;
  duration_ms?: number;
  trace_id?: string;
  [key: string]: any;
};

export function log(level: string, msg: string, fields: LogFields) {
  const base = { ts: new Date().toISOString(), level, msg };
  console.log(JSON.stringify({ ...base, ...fields }));
}
