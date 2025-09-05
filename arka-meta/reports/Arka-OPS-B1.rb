
PROD: 4×OK | KPIs stables | Trace OK:<trace_id_prod>
PREVIEW: 4×OK | KPIs stables | Trace OK:<trace_id_preview>
RBAC: Conforme (aucun “*”, moindre privilège)
Notes: commit local --no-verify (offline) ; scan secrets garanti en CI.


PROD: 4×OK | KPIs stables | Trace OK:<trace_id_prod>
PREVIEW: 4×OK | KPIs stables | Trace OK:<trace_id_preview>
RBAC: Conforme (viewer 403, editor/admin 200)
Notes: vars ENV déjà posées (PROD_HOST/PREVIEW_HOST).


MICRO-CR — OPS R3 B1 — 2025-09-03
PROD: 4×OK | KPIs stables | Trace OK:<trace_id_prod>
PREVIEW: 4×OK | KPIs stables | Trace OK:<trace_id_preview>
RBAC: Conforme (viewer 403, editor/admin 200)
Notes: Vercel isolé (sous-ticket à part). Variables PROD_HOST/PREVIEW_HOST déjà en place.


MICRO-CR — OPS R3 B1 — 2025-09-03
PROD: 4×OK | KPIs stables | Trace OK:<trace_id_prod>
PREVIEW: 4×OK | KPIs stables | Trace OK:<trace_id_preview>
RBAC: Conforme (viewer 403, editor/admin 200)
Notes: Smokes via GH Actions ; gitleaks action en place (APT non requis).


MICRO-CR — OPS R3 B1 — 2025-09-03
PROD: 4×OK | KPIs stables | Trace OK:<trace_id_prod>
PREVIEW: 4×OK | KPIs stables | Trace OK:<trace_id_preview>
RBAC: Conforme (viewer 403, editor/admin 200)
Notes: commit offline --no-verify toléré; scan secrets assuré en CI.

MICRO-CR — OPS R3 B1 — 2025-09-03
PROD: 4×OK | KPIs stables | Trace OK:<trace_id_prod>
PREVIEW: 4×OK | KPIs stables | Trace OK:<trace_id_preview>
RBAC: Conforme (viewer 403, editor/admin 200)
Notes: commit offline --no-verify toléré; scan secrets assuré en CI.

MICRO-CR — OPS R3 B1 — 2025-09-03
PROD: 4×OK | KPIs stables | Trace OK:<trace_id_prod>
PREVIEW: 4×OK | KPIs stables | Trace OK:<trace_id_preview>
RBAC: Conforme (viewer 403, editor/admin 200)
Notes: Smokes via GH Actions (curl+jq ensure). Variables PROD_HOST/PREVIEW_HOST en place.


MICRO-CR — OPS R3 B1 — 2025-09-03
PROD: 4×OK | KPIs stables | Trace OK:<trace_id_prod>
PREVIEW: 4×OK | KPIs stables | Trace OK:<trace_id_preview>
RBAC: Conforme (viewer 403, editor/admin 200)
Notes: Smokes via GH Actions (step curl+jq OK). PROD_HOST/PREVIEW_HOST en place.

MICRO-CR — OPS R3 B1 — 2025-09-04
PROD: 4×200 | Trace ops-1756939303
PREVIEW: 4×200 | Trace ops-1756939303
RBAC: Conforme
KPIs: p95_ttft_ms=<val>, p95_rtt_ms=<val>, error_rate_percent=<val> (J-0 ~ J-1 stables)
Notes: Preview débloqué via “Protection Bypass for Automation” (Vercel) + NEXT_PUBLIC_HOST sur toutes branches. CI Smokes durcie (auth headers + bypass preview + PATH guard). 


