import { NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { runLot } from '../../../../lib/orchestration';

export const runtime = 'nodejs';

export const POST = withAuth(['owner'], async (_req, user) => {
  await runLot(user?.id || 'system');
  return NextResponse.json({ processed: 1 });
});
