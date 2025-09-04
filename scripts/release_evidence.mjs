#!/usr/bin/env node
/*
  Collects text-only evidences for R3 and writes JSON files under arka-meta/reports/codex/R3.
  Env:
    HOST (required) e.g. https://arka-squad.app
    RBAC_TOKEN (optional) Bearer token for protected endpoints
*/
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const HOST = process.env.HOST || process.env.PROD_HOST;
if (!HOST) {
  console.error('ERROR: HOST env required (e.g. https://arka-squad.app)');
  process.exit(2);
}
const OUT_DIR = join('arka-meta', 'reports', 'codex', 'R3');
mkdirSync(OUT_DIR, { recursive: true });

const headers = {};
if (process.env.RBAC_TOKEN) headers['Authorization'] = `Bearer ${process.env.RBAC_TOKEN}`;
headers['X-Trace-Id'] = crypto.randomUUID();

async function getJson(path) {
  const res = await fetch(`${HOST}${path}`, { headers });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { status: res.status, raw: text }; }
}

function write(name, data) {
  const p = join(OUT_DIR, name);
  const s = JSON.stringify(data, null, 2);
  writeFileSync(p, s);
  return { path: p, data: s };
}

async function main() {
  const artifacts = [];
  const health = await getJson('/api/health');
  artifacts.push(write('health.json', health));

  const kpis = await getJson('/api/metrics/kpis');
  artifacts.push(write('kpis.json', kpis));

  const runs = await getJson('/api/metrics/runs?page=1&limit=20');
  artifacts.push(write('runs.json', runs));

  const sums = artifacts.map(({ path, data }) => {
    const h = createHash('sha256').update(data).digest('hex');
    return `${h}  ${path}`;
  }).join('\n') + '\n';
  writeFileSync(join(OUT_DIR, 'sha256sums.txt'), sums);

  // Print summary for CR
  console.log('\nEvidence summary (R3)');
  console.log(`HOST=${HOST}`);
  const p95 = kpis?.p95 || kpis?.p95_ms || {};
  console.log(`- p95 TTFT: ${p95.ttft_ms ?? 'n/a'} ms`);
  console.log(`- p95 RTT : ${p95.rtt_ms ?? 'n/a'} ms`);
  console.log(`- Error rate: ${kpis?.error_rate_percent ?? 'n/a'} %`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
