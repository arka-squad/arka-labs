import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/rbac';
import { getJob } from '../../../../../services/gates/runner';
import fs from 'node:fs/promises';
import path from 'node:path';
import Ajv from 'ajv/dist/2020';
import jobSchema from '../../../../../api/schemas/JobStatus.schema.json';
import gateResultSchema from '../../../../../api/schemas/GateResult.schema.json';
import recipeResultSchema from '../../../../../api/schemas/RecipeResult.schema.json';
import evidenceSchema from '../../../../../api/schemas/EvidenceRef.schema.json';

const ajv = new Ajv({ strict: false });
ajv.addSchema(evidenceSchema as any, 'EvidenceRef.schema.json');
ajv.addSchema(gateResultSchema as any, 'GateResult.schema.json');
ajv.addSchema(recipeResultSchema as any, 'RecipeResult.schema.json');
const validateJob = ajv.compile(jobSchema as any);
const validateGate = ajv.getSchema('GateResult.schema.json')!;
const validateRecipe = ajv.getSchema('RecipeResult.schema.json')!;

export const GET = withAuth(
  ['viewer', 'editor', 'admin', 'owner'],
  async (_req: NextRequest, _user, { params }: { params: { id: string } }) => {
    const job = getJob(params.id);
    if (!job) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const jobStatus = {
      job_id: job.id,
      type: job.type,
      status: job.status,
      started_at: job.started_at,
      finished_at: job.finished_at,
      progress: { total: 1, done: job.status === 'running' ? 0 : 1 },
      trace_id: job.trace_id,
    };
    if (!validateJob(jobStatus)) {
      return NextResponse.json({ error: 'invalid_job' }, { status: 500 });
    }
    let result: any = undefined;
    try {
      const dir = job.type === 'gate' ? 'gates' : 'recipes';
      const p = path.join(process.cwd(), 'results', dir, `${job.id}.json`);
      const data = JSON.parse(await fs.readFile(p, 'utf8'));
      if (job.type === 'gate') {
        if (!validateGate(data)) throw new Error('invalid');
      } else {
        if (!validateRecipe(data)) throw new Error('invalid');
      }
      result = data;
    } catch {}
    return NextResponse.json({ job: jobStatus, result });
  }
);
