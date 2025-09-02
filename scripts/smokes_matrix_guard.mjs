#!/usr/bin/env node
import process from 'node:process';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : def;
};

// --- NET GUARD (offline skip) ---
const HOST = getArg('host', process.env.HOST || 'https://arka-squad.app');
const ok = await fetch(`${HOST}/api/health`, {
  method: 'GET',
  redirect: 'manual',
  cache: 'no-store',
  signal: AbortSignal.timeout(5000),
})
  .then((r) => r.ok)
  .catch(() => false);
if (!ok) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      status: 'SKIPPED(host_unreachable)',
      host: HOST,
    }),
  );
  process.exit(0);
}
// --- suite du runner ---

const MODE = getArg('mode', process.env.RBAC_SMOKES_MODE || 'fail');
const roles = [
  { role: 'viewer', methods: ['GET'] },
  { role: 'editor', methods: ['GET', 'POST'] },
  { role: 'admin', methods: ['POST'] },
];

const results = [];
for (const { role, methods } of roles) {
  const token = process.env[`RBAC_TOKEN_${role.toUpperCase()}`] || '';
  for (const method of methods) {
    const ts = new Date().toISOString();
    let code = 0;
    let error;
    try {
      const res = await fetch(`${HOST}/api/agents`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10000),
      });
      code = res.status;
    } catch (e) {
      error = String(e).replace(/"/g, '\\"');
    }
    const entry = { ts, host: HOST, route: '/api/agents', method, role, code };
    if (error) entry.error = error;
    console.log(JSON.stringify(entry));
    results.push({ role, code });
  }
}

if (MODE === 'fail') {
  const hasFail = results.some((r) => r.code >= 400 || r.code === 0);
  if (hasFail) process.exit(1);
}
