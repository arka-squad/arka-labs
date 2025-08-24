import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, parseAllowlist, hashCanonical } from '../../../../lib/github';
import { sql } from '../../../../lib/db';

const SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';
const ALLOWLIST = parseAllowlist(process.env.ALLOWLIST_REPOS);
const MAX_BODY = 1_000_000; // 1 MB

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-hub-signature-256') || '';
  const delivery = req.headers.get('x-github-delivery') || '';
  const ghEvent = req.headers.get('x-github-event') || '';

  if (!signature.startsWith('sha256=')) {
    return NextResponse.json({ error: 'missing signature' }, { status: 401 });
  }

  const raw = await req.text();
  if (Buffer.byteLength(raw) > MAX_BODY) {
    return NextResponse.json({ error: 'payload too large' }, { status: 400 });
  }

  if (!verifySignature(SECRET, raw, signature)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'payload invalid' }, { status: 400 });
  }

  const repo = payload?.repository?.full_name || '';
  if (!ALLOWLIST.has(repo)) {
    return NextResponse.json({ error: 'repo not allowed' }, { status: 403 });
  }

  const sender = payload?.sender?.login || '';
  const action = payload.action || '';

  let number: number | undefined;
  let title: string | undefined;
  let labels: string[] = [];
  let url: string | undefined;
  let merged = false;
  let state: string | undefined;
  let pr_ref: string | undefined;
  let issue_ref: string | undefined;

  if (ghEvent === 'pull_request') {
    const pr = payload.pull_request;
    number = pr?.number;
    title = `[PR] ${repo}#${pr?.number}: ${pr?.title}`;
    labels = pr?.labels?.map((l: any) => l.name) || [];
    url = pr?.html_url;
    merged = Boolean(pr?.merged);
    state = pr?.state;
    pr_ref = `pr#${number}`;
  } else if (ghEvent === 'issues') {
    const issue = payload.issue;
    number = issue?.number;
    title = `[Issue] ${repo}#${issue?.number}: ${issue?.title}`;
    labels = issue?.labels?.map((l: any) => l.name) || [];
    url = issue?.html_url;
    state = issue?.state;
    issue_ref = `issue#${number}`;
  } else if (ghEvent === 'issue_comment') {
    const issue = payload.issue;
    number = issue?.number;
    title = `[Comment] ${repo}#${issue?.number}`;
    labels = issue?.labels?.map((l: any) => l.name) || [];
    url = payload.comment?.html_url;
    state = issue?.state;
    issue_ref = `issue#${number}`;
  }

  const eventType = ghEvent === 'issue_comment' ? 'dialogue' : 'report';
  const summary = `${action} by ${sender}`;
  const links = url ? [url] : [];
  const kpis = { action, merged, state, sender };

  const hash = hashCanonical({
    delivery_id: delivery,
    repo,
    event: eventType,
    action,
    number,
    timestamp: payload?.repository?.pushed_at || new Date().toISOString(),
  });

  const eventPayload = {
    agent: 'AGP',
    event: eventType,
    title,
    summary,
    labels,
    links,
    kpis,
    author: sender,
    repo,
    issue_ref,
    pr_ref,
  };

  const inserted = await sql`
    INSERT INTO agent_events (type, payload, hash, delivery_id)
    VALUES (${eventType}, ${JSON.stringify(eventPayload)}, ${hash}, ${delivery})
    ON CONFLICT (delivery_id) DO NOTHING
    RETURNING id
  `;

  if (inserted.rowCount === 0) {
    return NextResponse.json({ error: 'duplicate delivery id' }, { status: 409 });
  }

  const eventId = inserted.rows[0].id as number;

  const lotLabel = labels.find((l) => l.startsWith('lot:'));
  if (lotLabel) {
    const lotKey = `${repo}:${lotLabel.slice(4)}`;
    const status = action === 'closed' ? 'done' : 'in-progress';
    await sql`
      INSERT INTO lots_state (ref, state)
      VALUES (${lotKey}, ${JSON.stringify({ status, last_event_id: eventId })})
      ON CONFLICT (ref) DO UPDATE SET state = EXCLUDED.state, updated_at = now()
    `;
  }

  if (ghEvent === 'pull_request') {
    await sql`
      INSERT INTO action_queue (action)
      VALUES (${JSON.stringify({ kind: 'run_checks', repo, number, url, delivery_id: delivery })})
    `;
  }

  return NextResponse.json({ ok: true });
}

