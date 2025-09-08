export type MetricLabels = Record<string, any>;

function emit(name: string, value: number, labels: MetricLabels = {}) {
  const rec = { ts: new Date().toISOString(), metric: name, value, ...labels };
  console.log(JSON.stringify(rec));
}

export function recordJob(
  type: 'gate' | 'recipe',
  status: string,
  ids: { gate_id?: string; recipe_id?: string }
) {
  emit('gates_jobs_total', 1, { type, status, ...ids });
}

export function recordGateDuration(gate_id: string, duration_ms: number) {
  emit('gates_duration_ms', duration_ms, { gate_id });
}

export function recordRecipeDuration(recipe_id: string, duration_ms: number) {
  emit('recipes_duration_ms', duration_ms, { recipe_id });
}

export function recordGateError(gate_id: string) {
  emit('gates_errors_total', 1, { gate_id });
}

const sseCounts: Record<string, number> = {};
export function trackSse(route: string, delta: number) {
  sseCounts[route] = (sseCounts[route] || 0) + delta;
  emit('sse_clients', sseCounts[route], { route });
}
