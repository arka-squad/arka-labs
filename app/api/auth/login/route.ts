import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db';
import bcrypt from 'bcryptjs';
import { signToken, JwtUser } from '../../../../lib/auth';
import { withAuth } from '../../../../lib/rbac';
import { log } from '../../../../lib/logger';

export const POST = withAuth(['public'], async (req) => {
  const start = Date.now();
  const route = '/api/auth/login';
  const body = await req.json().catch(() => null);
  const bad = () => {
    log('warn', 'invalid body', { route, status: 400, duration_ms: Date.now() - start });
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  };
  if (!body || typeof body !== 'object' || Array.isArray(body)) return bad();
  const keys = Object.keys(body);
  if (!('email' in body) || !('password' in body)) return bad();
  if (keys.some((k) => k !== 'email' && k !== 'password')) return bad();
  if (
    typeof body.email !== 'string' ||
    body.email.length < 5 ||
    body.email.length > 254 ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)
  )
    return bad();
  if (
    typeof body.password !== 'string' ||
    body.password.length < 8 ||
    body.password.length > 128
  )
    return bad();

  const { email, password } = body;
  const { rows } = await sql`select id, email, role, password_hash from users where email=${email}`;
  const user = rows[0];
  if (!user) {
    log('info', 'invalid credentials', { route, status: 401, duration_ms: Date.now() - start });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    log('info', 'invalid credentials', { route, status: 401, duration_ms: Date.now() - start });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const u: JwtUser = { sub: String(user.id), role: user.role };
  const token = signToken(u);
  log('info', 'login', { route, status: 200, duration_ms: Date.now() - start });
  const res = NextResponse.json({ token, user: { id: u.sub, email: user.email, role: user.role } });
  res.cookies.set('arka_access_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 3600,
  });
  return res;
});
