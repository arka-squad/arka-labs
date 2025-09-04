#!/usr/bin/env bash
set -euo pipefail
rg -n --hidden -S -g '!node_modules/**' \
  '(sk-[A-Za-z0-9]{32,}|ghp_[A-Za-z0-9]{36,}|eyJhbGci|Bearer\s+[A-Za-z0-9\-._]+|AKIA[0-9A-Z]{16})' \
  public/ arka-meta/ runbook.md || exit 0
echo "TOKEN_PATTERN_FOUND in docs"; exit 1
