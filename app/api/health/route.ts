import { NextResponse } from 'next/server';

export const GET = async () => NextResponse.json({ status: 'ok' }, { status: 200 });
