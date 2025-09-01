#!/usr/bin/env bash
set -euo pipefail

HOST_PRIMARY="${1:-${HOST:-https://www.arka-team.app}}"
FALLBACK_HOST="https://arka-liard.vercel.app"

LOG_DIR="logs"
mkdir -p "$LOG_DIR"
NETWORK_LOG="$LOG_DIR/ui_network.json"
: > "$NETWORK_LOG"

OFFLINE_REPORT="rapport_offline.md"
ORACLES_REPORT="rapport_oracles.json"
: > "$OFFLINE_REPORT"
: > "$ORACLES_REPORT"

curl_common=(-k -sS -w "%{http_code}" --connect-timeout 5 --max-time 10)

check_host() {
  local host="$1"
  local tmp out code err="" ts body
  tmp=$(mktemp)
  out=$(curl "${curl_common[@]}" "$host/api/health" -o "$tmp" 2>&1) || true
  code="${out: -3}"
  if [[ ! "$code" =~ ^[0-9]{3}$ ]]; then
    err=$(echo "$out" | tr '\n' ' ')
    code=000
  fi
  ts=$(date -Is)
  if [[ "$code" == "000" ]]; then
    printf '{"ts":"%s","host":"%s","route":"/api/health","code":%s,"error":"%s"}\n' "$ts" "$host" "$code" "$err" >> "$NETWORK_LOG"
    rm -f "$tmp"
    return 1
  else
    body=$(cat "$tmp")
    printf '{"ts":"%s","host":"%s","route":"/api/health","code":%s,"body":%s}\n' "$ts" "$host" "$code" "$(printf '%s' "$body" | jq -Rs '.')" >> "$NETWORK_LOG"
    rm -f "$tmp"
    return 0
  fi
}

HOST="$HOST_PRIMARY"
if ! check_host "$HOST"; then
  if [[ "$HOST_PRIMARY" == "https://www.arka-team.app" ]]; then
    HOST="$FALLBACK_HOST"
    if ! check_host "$HOST"; then
      echo "SKIPPED(host_unreachable)" | tee "$OFFLINE_REPORT"
      jq -n --arg status "SKIPPED(host_unreachable)" '{"status":$status}' > "$ORACLES_REPORT"
      exit 0
    fi
  else
    echo "SKIPPED(host_unreachable)" | tee "$OFFLINE_REPORT"
    jq -n --arg status "SKIPPED(host_unreachable)" '{"status":$status}' > "$ORACLES_REPORT"
    exit 0
  fi
fi

results=()

call_json() {
  local path="$1"
  local tmp out code err="" body ts
  tmp=$(mktemp)
  out=$(curl "${curl_common[@]}" "$HOST$path" -o "$tmp" 2>&1) || true
  code="${out: -3}"
  if [[ ! "$code" =~ ^[0-9]{3}$ ]]; then
    err=$(echo "$out" | tr '\n' ' ')
    code=000
  fi
  body=$(cat "$tmp")
  rm -f "$tmp"
  ts=$(date -Is)
  if [[ -n "${err:-}" ]]; then
    printf '{"ts":"%s","host":"%s","route":"%s","code":%s,"error":"%s"}\n' "$ts" "$HOST" "$path" "$code" "$err" >> "$NETWORK_LOG"
  else
    printf '{"ts":"%s","host":"%s","route":"%s","code":%s,"body":%s}\n' "$ts" "$HOST" "$path" "$code" "$(printf '%s' "$body" | jq -Rs '.')" >> "$NETWORK_LOG"
  fi
  results+=("$(jq -n --arg route "$path" --argjson code "$code" '{route:$route,code:$code}')")
}

call_code() {
  local path="$1" out code err="" ts
  out=$(curl -k -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$HOST$path" 2>&1) || true
  code="${out: -3}"
  if [[ ! "$code" =~ ^[0-9]{3}$ ]]; then
    err=$(echo "$out" | tr '\n' ' ')
    code=000
  fi
  ts=$(date -Is)
  if [[ -n "${err:-}" ]]; then
    printf '{"ts":"%s","host":"%s","route":"%s","code":%s,"error":"%s"}\n' "$ts" "$HOST" "$path" "$code" "$err" >> "$NETWORK_LOG"
  else
    printf '{"ts":"%s","host":"%s","route":"%s","code":%s}\n' "$ts" "$HOST" "$path" "$code" >> "$NETWORK_LOG"
  fi
  results+=("$(jq -n --arg route "$path" --argjson code "$code" '{route:$route,code:$code}')")
}

call_json "/api/documents?page=1&page_size=20"
call_code "/api/documents/1/preview"
call_json "/api/chat/threads"
call_json "/api/metrics/kpis"

printf '%s\n' "${results[@]}" | jq -s '.' > "$ORACLES_REPORT"
exit 0
