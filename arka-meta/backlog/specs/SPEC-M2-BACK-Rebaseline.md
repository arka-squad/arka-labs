Spec-Tech:
  id: SPEC-M2-BACK-REBASELINE
  linked_tickets: ["BACK-09-SSE-Streaming","BACK-10-Documents-API","BACK-11-Agent-Events","BACK-12-Export-Memoire","BACK-13-Metrics-API","BACK-00-Contracts-And-Docs"]
  api:
    - "GET /api/threads/:id/stream (SSE)"
    - "POST/GET/DELETE /api/documents"
    - "GET /api/agents/events"
    - "GET /api/threads/:id/export"
    - "GET /api/metrics"
  perf_budget:
    - "SSE: propagation msg < 500ms P95"
    - "Metrics: latency < 300ms P95 (50k rows)"
  security:
    - "RBAC enforced (viewer/operator/owner)"
    - "Rate limit SSE (100/10m/ip) ; upload (30/10m/ip)"
  observability:
    - "Logs server JSON {ts,cat:'api',event,route,status,duration_ms,session_id?}"
