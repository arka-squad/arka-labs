#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-https://www.arka-team.app}"
LOG_FILE="logs/ui_network.json"
mkdir -p "$(dirname "$LOG_FILE")"

TMP_BODY=$(mktemp)
TMP_LOG=$(mktemp)
HTTP_CODE=$(curl -s -o "$TMP_BODY" -w '%{http_code}' -v --noproxy "*" "$HOST/api/health" 2>"$TMP_LOG" || true)
if grep -q 'CONNECT.*403' "$TMP_LOG"; then
  CONNECT_403=true
else
  CONNECT_403=false
fi
printf '{"ts":"%s","host":"%s","step":"curl","http_code":%s,"connect_403":%s}\n' \
  "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$HOST" "$HTTP_CODE" "$CONNECT_403" >> "$LOG_FILE"
rm -f "$TMP_BODY" "$TMP_LOG"
