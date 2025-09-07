// Seed des gates et recettes pour l'orchestrateur
export const GATES_SEED = [
  {
    id: 'perf.lighthouse.basic',
    version: '1.0.0',
    title: 'Lighthouse Basic',
    category: 'perf',
    inputs: { url: { type: 'string' } },
    outputs: {
      lcp_ms: { type: 'number' },
      tti_ms: { type: 'number' },
      cls: { type: 'number' },
      score_a11y: { type: 'number' }
    },
    risk: 'low',
    scope: 'safe',
    est_duration_ms: 15000,
    tags: ['perf', 'lighthouse'],
    module: () => import('../../gates/catalog/perf.lighthouse.basic.mjs')
  },
  {
    id: 'perf.api.ttft_p95',
    version: '1.0.0',
    title: 'API TTFT p95',
    category: 'perf',
    inputs: { window_minute: { type: 'number' } },
    outputs: { p95_ms: { type: 'number' } },
    risk: 'low',
    scope: 'safe',
    est_duration_ms: 5000,
    tags: ['perf', 'api'],
    module: () => import('../../gates/catalog/perf.api.ttft_p95.mjs')
  },
  {
    id: 'contracts.schema.documents',
    version: '1.0.0',
    title: 'Schema Documents',
    category: 'contracts',
    inputs: { doc_ids: { type: 'array', items: { type: 'string' } } },
    outputs: { schema_mismatch_count: { type: 'number' } },
    risk: 'med',
    scope: 'safe',
    est_duration_ms: 10000,
    tags: ['contracts'],
    module: () => import('../../gates/catalog/contracts.schema.documents.mjs')
  },
  {
    id: 'security.webhook.hmac',
    version: '1.0.0',
    title: 'Webhook HMAC',
    category: 'security',
    inputs: { payload: { type: 'string' }, secret: { type: 'string' } },
    outputs: { status: { type: 'string' } },
    risk: 'high',
    scope: 'owner-only',
    est_duration_ms: 3000,
    tags: ['security'],
    module: () => import('../../gates/catalog/security.webhook.hmac.mjs')
  },
  {
    id: 'ops.kpis.kpi_snapshot',
    version: '1.0.0',
    title: 'KPI Snapshot',
    category: 'kpis',
    inputs: {},
    outputs: {
      ttft_p95: { type: 'number' },
      rtt_p95: { type: 'number' },
      error_rate_percent: { type: 'number' }
    },
    risk: 'low',
    scope: 'safe',
    est_duration_ms: 2000,
    tags: ['kpis'],
    module: () => import('../../gates/catalog/ops.kpis.kpi_snapshot.mjs')
  }
];

export const RECIPES_SEED = [
  {
    id: 'perf.budget_demo',
    version: '1.0.0',
    title: 'Perf Budget Demo',
    steps: [
      { id: 'lighthouse', gate_id: 'perf.lighthouse.basic' },
      { id: 'ttft', gate_id: 'perf.api.ttft_p95' }
    ],
    inputs: { url: { type: 'string' }, window_minute: { type: 'number' } },
    outputs: {},
    scope: 'safe',
    tags: ['perf']
  },
  {
    id: 'contracts.basic',
    version: '1.0.0',
    title: 'Contracts Basic',
    steps: [
      { id: 'contracts', gate_id: 'contracts.schema.documents' }
    ],
    inputs: { doc_ids: { type: 'array', items: { type: 'string' } } },
    outputs: {},
    scope: 'safe',
    tags: ['contracts']
  },
  {
    id: 'release.preflight',
    version: '1.0.0',
    title: 'Release Preflight',
    steps: [
      { id: 'kpis', gate_id: 'ops.kpis.kpi_snapshot' },
      { id: 'ttft', gate_id: 'perf.api.ttft_p95' },
      { id: 'webhook', gate_id: 'security.webhook.hmac' }
    ],
    inputs: {
      window_minute: { type: 'number' },
      payload: { type: 'string' },
      secret: { type: 'string' }
    },
    outputs: {},
    scope: 'owner-only',
    tags: ['perf', 'security', 'ops']
  }
];
