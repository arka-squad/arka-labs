import { NextResponse } from 'next/server';

export const POST = async () => {
  const res = NextResponse.json({ ok: true });
  const opts = { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 } as const;
  res.cookies.set('arka_access_token', '', opts);
  res.cookies.set('arka_auth', '', opts);
  return res;
};
