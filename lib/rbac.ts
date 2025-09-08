import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { verifyToken, JwtUser as User, Role } from './auth';
import { log } from './logger';
import { sql } from './db';
import { TRACE_HEADER, generateTraceId } from './trace';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const RBAC_MATRIX: Record<string, Partial<Record<Method, Role[]>>> = {
  '/api/projects': {
    GET: ['viewer', 'editor', 'admin', 'owner'],
    POST: ['editor', 'admin', 'owner'],
  },
  '/api/metrics': {
    GET: ['admin', 'owner'],
  },
  '/api/prompt-blocks': {
    GET: ['viewer', 'editor', 'admin', 'owner'],
    POST: ['editor', 'admin', 'owner'],
  },
};

export function canAccess(route: string, method: Method, role: Role): boolean {
  const perms = RBAC_MATRIX[route];
  if (!perms) return false;
  const allowed = perms[method];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function withRole<P>(Component: React.ComponentType<P>, roles: Role[]) {
  const WithRole = (props: P & { role: Role }) =>
    roles.includes(props.role) ? React.createElement(Component as any, props) : null;
  WithRole.displayName = `withRole(${(Component as any).displayName || Component.name || 'Component'})`;
  return WithRole;
}

export function Guard({ role, roles, children }: { role: Role; roles: Role[]; children: React.ReactNode }) {
  return roles.includes(role) ? React.createElement(React.Fragment, null, children) : null;
}

export function hasScope(role: Role, scope: 'safe' | 'owner-only') {
  if (scope === 'owner-only') return role === 'owner';
  return role === 'editor' || role === 'admin' || role === 'owner';
}

export function withAuth(
  allowed: (Role | 'public' | 'github-webhook')[],
  handler: (req: NextRequest, user: User | null, context: any) => Promise<NextResponse> | NextResponse,
  opts: { scope?: 'safe' | 'owner-only' } = {}
) {
  return async (req: NextRequest, context: any = {}): Promise<NextResponse> => {
    const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
    const start = Date.now();
    let res: NextResponse;
    let user: User | null = null;

    if (allowed.includes('public') || allowed.includes('github-webhook')) {

      res = await handler(req, null, context);
    } else {
      const auth = req.headers.get('authorization');
      if (!auth || !auth.startsWith('Bearer ')) {
        res = NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      } else {
        const token = auth.slice(7);
        user = verifyToken(token);
        if (!user || !allowed.includes(user.role) || (opts.scope && !hasScope(user.role, opts.scope))) {
          res = NextResponse.json({ error: 'forbidden' }, { status: 403 });
        } else {
          (req as any).user = user;
          res = await handler(req, user, context);
        }
      }
    }

    const duration_ms = Date.now() - start;
    const route = req.nextUrl.pathname;
    const method = req.method as Method;
    const actor = user?.sub || 'anonymous';
    const role = user?.role || 'public';
    const decision = res.status < 400 ? 'allow' : 'deny';
    log('debug', 'rbac', { route, status: res.status, trace_id: traceId, method, role, decision });
    log('info', 'api', { route, status: res.status, trace_id: traceId, actor, role });
    try {
      if (process.env.POSTGRES_URL) {
        await sql`insert into metrics_raw (trace_id, route, status, duration_ms) values (${traceId}, ${route}, ${res.status}, ${duration_ms})`;
        const buf = (globalThis as any).__TRACE_BUFFER__;
        if (Array.isArray(buf)) buf.push(traceId);
      }
    } catch (e) {
      // degrade gracefully in local/dev without DB
      if (process.env.NODE_ENV === 'production') {
        console.error('metrics_raw_insert_fail', e);
      }
    }
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  };
}
