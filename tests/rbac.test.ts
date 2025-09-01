import test from 'node:test';
import assert from 'node:assert/strict';

process.env.AUTH_SECRET = 'test-secret';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { canAccess } = require('../lib/rbac') as typeof import('../lib/rbac');
import type { Role } from '../lib/auth';

interface Case { route: string; method: string; role: Role; allowed: boolean }

const cases: Case[] = [
  { route: '/api/projects', method: 'GET', role: 'viewer', allowed: true },
  { route: '/api/projects', method: 'POST', role: 'viewer', allowed: false },
  { route: '/api/metrics', method: 'GET', role: 'viewer', allowed: false },
  { route: '/api/metrics', method: 'GET', role: 'admin', allowed: true },
];

for (const c of cases) {
  test(`${c.role} ${c.method} ${c.route}`, () => {
    assert.equal(canAccess(c.route, c.method as any, c.role), c.allowed);
  });
}
