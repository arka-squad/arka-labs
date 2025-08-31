#!/bin/bash
set -euo pipefail
OUT="arka-meta/docs/db/schema/latest.sql"
mkdir -p "$(dirname "$OUT")"
: "${POSTGRES_URL:?POSTGRES_URL manquant}"
if command -v pg_dump >/dev/null 2>&1; then
  pg_dump --schema-only --no-owner "$POSTGRES_URL" > "$OUT"
else
  cat sql/*.sql > "$OUT"
fi
