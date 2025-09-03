# Capsule r3-e2e — DoR exécutable
definition_of_ready:
  oracles:
    curl_examples:
      - name: documents_list
        cmd: curl -s "https://<host>/api/documents?page=1&page_size=20"
        expect_json_keys: ["items","page","page_size","count"]
        expect_sort: { by: ["created_at","id"], order: ["DESC","ASC"] }
      - name: chat_threads
        cmd: curl -s "https://<host>/api/chat/threads"
        expect_json_shape: { items: [{ id: "uuid", title: "string", last_msg_at: "iso8601" }] }
      - name: metrics_kpis
        cmd: curl -s "https://<host>/api/metrics/kpis"
        expect_json_shape: { p95: { ttft_ms: "int", rtt_ms: "int" }, error_rate_percent: "number(1dec)" }
    fixtures:
      migrations: ["CAPSULES/r3-e2e/SQLPACK.md::migrations"]
      seed_files: ["CAPSULES/r3-e2e/SQLPACK.md::seed"]
    no_mocks: true
  env_clauses:
    owner_executes: ["Migration SQL", "Seed SQL"]    # Owner colle les blocs SQL
    codex_executes: ["Code+Tests+Evidences"]
    fallbacks:
      - if: "pg_dump absent"
        then: "export schéma = concat des .sql dans latest.sql"
  evidence_expected:
    - "screenshots/{login.png,console_nav.png,projects.png,documents.png,documents_preview.png,chat.png,observabilite.png}"
    - "logs/ui_network.json"
    - "arka-meta/reports/codex/R3-e2e/sha256sums.txt"
success_route:
  - "/login → /console → (Projects|Documents|Chat|Observabilité) sans erreur"
contracts_api:
  documents: "GET /api/documents?page=1&page_size=20 → {items[],page,page_size,count}; tri created_at DESC, id ASC"
  documents_preview: "GET /api/documents/:id/preview → octets Content-Type=mime"
  chat_threads: "GET /api/chat/threads → {items:[{id,title,last_msg_at}]}; last_msg_at = MAX(messages.created_at)∨threads.created_at"
  chat_messages: "GET /api/chat/threads/:id/messages → {items:[{role,content,ts=created_at}]} tri asc"
  metrics_kpis: "GET /api/metrics/kpis → {p95:{ttft_ms:int,rtt_ms:int}, error_rate_percent:number(1dec)}"
  metrics_runs: "GET /api/metrics/runs?page=1&limit=20 → {items[],page,limit,count}"
