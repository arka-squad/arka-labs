import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { log } from '../../../../lib/logger';
import { runRecipe } from '../../../../services/gates/runner';
import { randomUUID } from 'crypto';
import path from 'node:path';
import Ajv from 'ajv/dist/2020';
import recipeResultSchema from '../../../../api/schemas/RecipeResult.schema.json';
import gateResultSchema from '../../../../api/schemas/GateResult.schema.json';
import evidenceSchema from '../../../../api/schemas/EvidenceRef.schema.json';

const ajv = new Ajv({ strict: false });
ajv.addSchema(evidenceSchema as any, 'EvidenceRef.schema.json');
ajv.addSchema(gateResultSchema as any, 'GateResult.schema.json');
const validateResult = ajv.compile(recipeResultSchema as any);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth(
  ['editor', 'admin', 'owner'],
  async (req: NextRequest, user) => {
    const start = Date.now();
    const trace = req.headers.get('x-trace-id') || randomUUID();
    const key = req.headers.get('x-idempotency-key');
    if (!key) {
      const res = NextResponse.json({ error: 'idempotency-key-required' }, { status: 400 });
      return res;
    }
    const body = await req.json().catch(() => null);
    if (!body || typeof body.recipe_id !== 'string' || typeof body.inputs !== 'object') {
      const res = NextResponse.json({ error: 'invalid_input' }, { status: 400 });
      res.headers.set('x-idempotency-key', key);
      return res;
    }
    const modulePath = path.join(process.cwd(), 'gates', 'catalog', `${body.recipe_id}.mjs`);
    let mod: any;
    try {
      mod = await import(modulePath);
    } catch {
      const res = NextResponse.json({ error: 'not_found' }, { status: 404 });
      res.headers.set('x-idempotency-key', key);
      return res;
    }
    if (mod.meta?.scope === 'owner-only' && user?.role !== 'owner') {
      const res = NextResponse.json({ error: 'forbidden' }, { status: 403 });
      res.headers.set('x-idempotency-key', key);
      return res;
    }
    try {
      if (typeof mod.validate === 'function') mod.validate(body.inputs);
    } catch {
      const res = NextResponse.json({ error: 'invalid_input' }, { status: 422 });
      res.headers.set('x-idempotency-key', key);
      return res;
    }
    const job = await runRecipe(body.recipe_id, body.inputs, {
      userId: user!.sub,
      idempotencyKey: key,
      traceId: trace,
    });
    if (job.result && !validateResult(job.result)) {
      const res = NextResponse.json({ error: 'invalid_output' }, { status: 500 });
      res.headers.set('x-idempotency-key', key);
      return res;
    }
    const res = NextResponse.json(
      {
        job_id: job.id,
        recipe_id: body.recipe_id,
        inputs: body.inputs,
        accepted_at: new Date().toISOString(),
        trace_id: job.trace_id,
      },
      { status: 202 }
    );
    res.headers.set('x-idempotency-key', key);
    log('info', 'recipes_run', {
      route: '/api/recipes/run',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: job.trace_id,
      job_id: job.id,
    });
    return res;
  }
);
