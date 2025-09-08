#!/usr/bin/env node
/**
 * Verifies key API contracts against one or more hosts and writes JSON evidence.
 * Usage: HOSTS="https://arka-squad.app,https://arka-liard.vercel.app" node scripts/verify_contracts.mjs
 * Env: RBAC_TOKEN (optional)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HOSTS = (process.env.HOSTS || '').split(',').map((s) => s.trim()).filter(Boolean);
if (HOSTS.length === 0) {
  console.error('Set HOSTS env, e.g. HOSTS="https://arka-squad.app,https://arka-liard.vercel.app"');
  process.exit(2);
}

const OUT_DIR = join('arka-meta', 'reports', 'codex', 'R3');
mkdirSync(OUT_DIR, { recursive: true });

const headers = { 'X-Trace-Id': crypto.randomUUID() };
if (process.env.RBAC_TOKEN) headers['Authorization'] = `Bearer ${process.env.RBAC_TOKEN}`;

function expectKeys(obj, keys) {
  return keys.every((k) => Object.prototype.hasOwnProperty.call(obj, k));
}

async function fetchJson(host, path) {
  const url = `${host}${path}`;
  const res = await fetch(url, { headers });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, url, json, raw: text };
}

async function runForHost(host) {
  const result = { host, ts: new Date().toISOString(), checks: [] };
  // Health
  const health = await fetchJson(host, '/api/health');
  result.checks.push({ name: 'health', pass: health.ok, status: health.status });

  // Version (optional)
  const ver = await fetchJson(host, '/api/version');
  const vpass = ver.ok && ver.json && typeof (ver.json.version || ver.json.commit_sha || ver.json.env) !== 'undefined';
  result.checks.push({ name: 'version_optional', pass: !!vpass, status: ver.status });

  // KPIs
  const kpis = await fetchJson(host, '/api/metrics/kpis');
  const kpass = kpis.ok && kpis.json && expectKeys(kpis.json, ['p95', 'error_rate_percent']);
  result.checks.push({ name: 'kpis', pass: !!kpass, status: kpis.status });

  // Runs
  const runs = await fetchJson(host, '/api/metrics/runs?page=1&limit=20');
  const hasLimit = runs.json && (Object.prototype.hasOwnProperty.call(runs.json, 'limit') || Object.prototype.hasOwnProperty.call(runs.json, 'page_size'));
  const rpass = runs.ok && runs.json && expectKeys(runs.json, ['items', 'page', 'count']) && hasLimit;
  result.checks.push({ name: 'runs', pass: !!rpass, status: runs.status });

  // Memory health (B10)
  const mem = await fetchJson(host, '/api/memory/health');
  const mpass = mem.ok && mem.json && expectKeys(mem.json, ['kv', 'db', 'blob', 'write_enabled']);
  result.checks.push({ name: 'memory_health', pass: !!mpass, status: mem.status });

  // AI stream (optional)
  const ai = await fetch(`${host}/api/ai/stream?format=txt`, { headers }).catch(() => null);
  const aistatus = ai ? ai.status : 0;
  result.checks.push({ name: 'ai_stream_optional', pass: aistatus === 200 || aistatus === 404 || aistatus === 405, status: aistatus });

  // Documents (optional, may require RBAC)
  const docs = await fetchJson(host, '/api/documents?page=1&page_size=20');
  const docOk = docs.status === 200 || docs.status === 401 || docs.status === 403;
  result.checks.push({ name: 'documents_optional', pass: docOk, status: docs.status });

  // Threads (optional)
  const thr = await fetchJson(host, '/api/chat/threads');
  const thrOk = thr.status === 200 || thr.status === 401 || thr.status === 403;
  result.checks.push({ name: 'threads_optional', pass: thrOk, status: thr.status });

  const outPath = join(OUT_DIR, `verify_${host.replace(/https?:\/\//,'').replace(/[^a-zA-Z0-9_.-]/g,'_')}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  return result;
}

const results = [];
for (const host of HOSTS) {
  // eslint-disable-next-line no-await-in-loop
  const r = await runForHost(host);
  results.push(r);
}

const summary = results.map((r) => ({ host: r.host, pass: r.checks.every((c) => c.pass), checks: r.checks }));
console.log(JSON.stringify({ ts: new Date().toISOString(), summary }, null, 2));
const allPass = summary.every((s) => s.pass);
process.exit(allPass ? 0 : 1);
