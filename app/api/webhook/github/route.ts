import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, parseAllowlist, hashCanonical } from '../../../../lib/github';
import { sql } from '../../../../lib/db';

export const runtime = 'nodejs';

const requiredSecret = process.env.GITHUB_WEBHOOK_SECRET || '';
const allowlisted = parseAllowlist(process.env.ALLOWLIST_REPOS);

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-hub-signature-256') || '';
  const delivery = req.headers.get('x-github-delivery') || '';
  const eventName = req.headers.get('x-github-event') || '';

  const raw = await req.text();
  if (!verifySignature(requiredSecret, raw, signature)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  if (eventName === 'ping') {
    return NextResponse.json({ ok: true });
  }

  const payload: any = JSON.parse(raw || '{}');
  const repo = payload?.repository?.full_name || '';
  if (!allowlisted.has(repo)) {
    return NextResponse.json({ error: 'repo not allowed' }, { status: 403 });
  }

  const title = payload.pull_request?.title || payload.issue?.title || '';
  const summary = payload.pull_request?.body || payload.issue?.body || payload.head_commit?.message || '';
  const labels = (payload.pull_request?.labels || payload.issue?.labels || []).map((l: any) => l.name);
  const links = { html: payload.pull_request?.html_url || payload.issue?.html_url || payload.repository?.html_url };
  const kpis: any = {};
  const eventRecord = {
    agent: 'github',
    event: eventName,
    title,
    summary,
    labels,
    links,
    kpis,
    decisions: [],
    author: payload.sender?.login || '',
    source: 'webhook',
    repo,
    issue_ref: payload.issue?.number ? String(payload.issue.number) : null,
    pr_ref: payload.pull_request?.number ? String(payload.pull_request.number) : null,
    delivery_id: delivery,
  };
  const hash = hashCanonical(eventRecord);

  await sql`INSERT INTO agent_events
    (agent, event, title, summary, labels, links, kpis, decisions, author, source, repo, issue_ref, pr_ref, delivery_id, hash)
    VALUES (${eventRecord.agent}, ${eventRecord.event}, ${eventRecord.title}, ${eventRecord.summary}, ${eventRecord.labels}, ${sql.json(eventRecord.links)}, ${sql.json(eventRecord.kpis)}, ${sql.json(eventRecord.decisions)}, ${eventRecord.author}, ${eventRecord.source}, ${eventRecord.repo}, ${eventRecord.issue_ref}, ${eventRecord.pr_ref}, ${eventRecord.delivery_id}, ${hash})
    ON CONFLICT (hash) DO NOTHING;`;

  const lotLabel = labels.find((l: string) => l.startsWith('lot:'));
  if (lotLabel) {
    const lotKey = lotLabel.split(':')[1];
    await sql`INSERT INTO lots_state (lot_key, state)
      VALUES (${lotKey}, ${sql.json(payload)})
      ON CONFLICT (lot_key) DO UPDATE SET state = EXCLUDED.state, updated_at = now();`;
  }

  if (eventName === 'pull_request' && payload.pull_request?.number) {
    const dedupe = `run_checks:${repo}#${payload.pull_request.number}`;
    const jobPayload = { repo, number: payload.pull_request.number, url: payload.pull_request.html_url, delivery_id: delivery };
    await sql`INSERT INTO action_queue (kind, payload, status, attempts, dedupe_key)
      VALUES ('run_checks', ${sql.json(jobPayload)}, 'queued', 0, ${dedupe})
      ON CONFLICT (dedupe_key) DO NOTHING;`;
  }

  return NextResponse.json({ ok: true });
}
