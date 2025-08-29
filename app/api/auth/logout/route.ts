import { NextResponse } from 'next/server';

export const POST = async () => {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('arka_auth', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
};
