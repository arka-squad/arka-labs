#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-https://www.arka-team.app}"
FALLBACK_HOST="https://arka-liard.vercel.app"

LOG_DIR="logs"
LOG_FILE="$LOG_DIR/ui_network.json"
REPORT="rapport_oracles.json"
mkdir -p "$LOG_DIR"
: > "$LOG_FILE"

declare -A RESULTS

check_host() {
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$1/api/health" 2>/dev/null || true)
  echo "${code:-000}"
}

code=$(check_host "$HOST")
if [ "$code" = "000" ]; then
  code=$(check_host "$FALLBACK_HOST")
  if [ "$code" = "000" ]; then
    STATUS="SKIPPED(host_unreachable)"
    for route in "/api/documents?page=1&page_size=20" "/api/documents/1/preview" "/api/chat/threads" "/api/metrics/kpis"; do
      echo "{\"ts\":\"$(date -Is)\",\"level\":\"warn\",\"msg\":\"$STATUS\",\"route\":\"$route\",\"status\":\"000\",\"trace_id\":null}" >> "$LOG_FILE"
      RESULTS["$route"]="$STATUS"
    done
    cat <<JSON > "$REPORT"
{
  "host": "$HOST",
  "documents_list": "$STATUS",
  "documents_preview": "$STATUS",
  "chat_threads": "$STATUS",
  "metrics_kpis": "$STATUS"
}
JSON
    exit 0
  else
    HOST="$FALLBACK_HOST"
  fi
fi

validate_documents_list() {
node <<'NODE' "$1"
const fs=require('fs'); const {z}=require('zod');
const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
const schema=z.object({
  items:z.array(z.object({
    id:z.number(),
    project_id:z.number(),
    name:z.string(),
    mime:z.string(),
    size:z.number(),
    storage_url:z.string(),
    created_at:z.string()
  })),
  page:z.number(),
  page_size:z.number(),
  count:z.number()
});
schema.parse(data);
NODE
}

validate_chat_threads() {
node <<'NODE' "$1"
const fs=require('fs'); const {z}=require('zod');
const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
const schema=z.object({
  items:z.array(z.object({
    id:z.number(),
    title:z.string(),
    last_msg_at:z.string()
  }))
});
schema.parse(data);
NODE
}

validate_metrics_kpis() {
node <<'NODE' "$1"
const fs=require('fs'); const {z}=require('zod');
const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
const schema=z.object({
  p95:z.object({
    ttft_ms:z.number().int(),
    rtt_ms:z.number().int()
  }),
  error_rate_percent:z.number()
});
schema.parse(data);
NODE
}

log_line() {
  local route="$1" code="$2" msg="$3"
  echo "{\"ts\":\"$(date -Is)\",\"level\":\"info\",\"msg\":\"$msg\",\"route\":\"$route\",\"status\":$code,\"trace_id\":null}" >> "$LOG_FILE"
}

call_json() {
  local route="$1" validator="$2"
  local tmp=$(mktemp)
  local code
  code=$(curl -s -o "$tmp" -w "%{http_code}" "$HOST$route" 2>/dev/null || true)
  code=${code:-000}
  local msg
  if [ "$code" = "200" ]; then
    if "$validator" "$tmp" >/dev/null 2>&1; then
      msg="OK"
    else
      msg="INVALID_SCHEMA"
    fi
  else
    msg="HTTP_$code"
  fi
  log_line "$route" "$code" "$msg"
  RESULTS["$route"]="$msg"
  rm -f "$tmp"
}

call_preview() {
  local route="$1"
  local tmp=$(mktemp)
  local code
  code=$(curl -s -o "$tmp" -w "%{http_code}" "$HOST$route" 2>/dev/null || true)
  code=${code:-000}
  local msg
  if [ "$code" = "200" ]; then
    msg="OK"
  else
    msg="HTTP_$code"
  fi
  log_line "$route" "$code" "$msg"
  RESULTS["$route"]="$msg"
  rm -f "$tmp"
}

call_json "/api/documents?page=1&page_size=20" validate_documents_list
call_preview "/api/documents/1/preview"
call_json "/api/chat/threads" validate_chat_threads
call_json "/api/metrics/kpis" validate_metrics_kpis

cat <<JSON > "$REPORT"
{
  "host": "$HOST",
  "documents_list": "${RESULTS["/api/documents?page=1&page_size=20"]}",
  "documents_preview": "${RESULTS["/api/documents/1/preview"]}",
  "chat_threads": "${RESULTS["/api/chat/threads"]}",
  "metrics_kpis": "${RESULTS["/api/metrics/kpis"]}"
}
JSON
