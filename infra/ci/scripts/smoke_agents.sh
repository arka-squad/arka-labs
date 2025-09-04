#!/usr/bin/env bash
set -uo pipefail

: "${HOST:?HOST not set}"
: "${TOKEN_VIEWER:?TOKEN_VIEWER not set}"
: "${TOKEN_EDITOR:?TOKEN_EDITOR not set}"
: "${TOKEN_ADMIN:?TOKEN_ADMIN not set}"

LOG="arka-meta/reports/codex/rbac_qa_logs.ndjson"
: > "$LOG"

declare -A COUNTS

curl_common=(
  -k -sS -v
  --connect-timeout 5
  --max-time 10
  -o /dev/null
  -w "%{http_code}"
)

if [ -n "${NO_PROXY:-}" ]; then
  curl_common+=(--noproxy "$NO_PROXY")
fi

call() {
  local role="$1" method="$2" token="$3"
  local ts code err
  ts=$(date -Is)
  local out
  out=$(curl "${curl_common[@]}" -X "$method" -H "Authorization: Bearer $token" "$HOST/api/agents" 2>&1) || true
  code=$(tail -n1 <<<"$out")
  if [[ ! "$code" =~ ^[0-9]{3}$ ]]; then
    err=$(echo "$out" | tr '\n' ' ' | sed 's/"/\\"/g')
    code=000
  fi
  printf '{"ts":"%s","host":"%s","route":"/api/agents","method":"%s","role":"%s","code":%s%s}\n' \
    "$ts" "$HOST" "$method" "$role" "$code" "${err:+,\"error\":\"$err\"}" >> "$LOG"
  COUNTS["$role|$code"]=$(( ${COUNTS["$role|$code"]:-0} + 1 ))
}

call viewer GET "$TOKEN_VIEWER"
call editor GET "$TOKEN_EDITOR"
call editor POST "$TOKEN_EDITOR"
call admin POST "$TOKEN_ADMIN"

echo "Summary:" >&2
for k in "${!COUNTS[@]}"; do
  role=${k%%|*}; code=${k##*|}
  echo "$role $code ${COUNTS[$k]}" >&2
done

# Network oracles (run after smoke)
"$(dirname "$0")/net/oracles.sh"
