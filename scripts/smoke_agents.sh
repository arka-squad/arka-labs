#!/usr/bin/env bash
set -euo pipefail

: "${HOST:?HOST not set}"
: "${TOKEN_VIEWER:?TOKEN_VIEWER not set}"
: "${TOKEN_EDITOR:?TOKEN_EDITOR not set}"
: "${TOKEN_ADMIN:?TOKEN_ADMIN not set}"

curl -ksS -H "Authorization: Bearer $TOKEN_VIEWER" "$HOST/api/agents" -w "\n%{http_code}\n"
curl -ksS -H "Authorization: Bearer $TOKEN_EDITOR" "$HOST/api/agents" -w "\n%{http_code}\n"
curl -ksS -X POST -H "Authorization: Bearer $TOKEN_EDITOR" -H 'Content-Type: application/json' -d '{}' "$HOST/api/agents" -w "\n%{http_code}\n"
curl -ksS -X POST -H "Authorization: Bearer $TOKEN_ADMIN" -H 'Content-Type: application/json' -d '{}' "$HOST/api/agents" -w "\n%{http_code}\n"
