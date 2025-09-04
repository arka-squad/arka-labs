#!/usr/bin/env node
/*
  Collects text-only evidences for R3 and writes JSON files under arka-meta/reports/codex/R3.
  Env:
    HOST (required) e.g. https://arka-squad.app
    RBAC_TOKEN (optional) Bearer token for protected endpoints
*/
import { mkdirSync, writeFileSync, createHash } from 'node:fs';
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
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

async function main() {
  const artifacts = [];
  const write = (name, data) => {
    const p = join(OUT_DIR, name);
    const s = JSON.stringify(data, null, 2);
    writeFileSync(p, s);
    artifacts.push({ path: p, data: s });
  };

  const health = await getJson('/api/health').catch((e) => ({ error: String(e) }));
  write('health.json', health);

  const kpis = await getJson('/api/metrics/kpis').catch((e) => ({ error: String(e) }));
  write('kpis.json', kpis);

  const runs = await getJson('/api/metrics/runs?page=1&limit=20').catch((e) => ({ error: String(e) }));
  write('runs.json', runs);

  // sha256sums
  const lines = artifacts.map(({ path, data }) => {
    const h = createHash('sha256').update(data).digest('hex');
    return `${h}  ${path}`;
  });
  writeFileSync(join(OUT_DIR, 'sha256sums.txt'), lines.join('\n') + '\n');

  // Print summary for CR
  console.log('\nEvidence summary (R3)');
  console.log(`HOST=${HOST}`);
  try {
    const p95 = kpis?.p95 || kpis?.p95_ms || {};
    console.log(`- p95 TTFT: ${p95.ttft_ms ?? 'n/a'} ms`);
    console.log(`- p95 RTT : ${p95.rtt_ms ?? 'n/a'} ms`);
    console.log(`- Error rate: ${kpis?.error_rate_percent ?? 'n/a'} %`);
  } catch {}
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

