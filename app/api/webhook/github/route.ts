// app/api/webhook/github/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, parseAllowlist, hashCanonical } from '../../../../lib/github';
import { sql } from '../../../../lib/db';

export const runtime = 'nodejs';

const SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';
const ALLOWLIST = parseAllowlist(process.env.ALLOWLIST_REPOS || '');
const MAX_BODY = 1_000_000; // 1 MB

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-hub-signature-256') || '';
    const delivery  = req.headers.get('x-github-delivery') || '';
    const ghEvent   = req.headers.get('x-github-event') || '';

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

    // Ping short-circuit (no repo, just prove liveness)
    if (ghEvent === 'ping') {
      return NextResponse.json({ ok: true, pong: true }, { status: 200 });
    }

    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'payload invalid' }, { status: 400 });
    }

    const repo = payload?.repository?.full_name || '';
    if (!repo || !ALLOWLIST.has(repo)) {
      return NextResponse.json({ error: 'repo not allowed' }, { status: 403 });
    }

    const sender = payload?.sender?.login || 'unknown';
    const action = payload?.action || '';

    // Normalize event data for agent_events
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
      number   = pr?.number;
      title    = `[PR] ${repo}#${pr?.number}: ${pr?.title}`;
      labels   = pr?.labels?.map((l: any) => l?.name).filter(Boolean) || [];
      url      = pr?.html_url;
      merged   = Boolean(pr?.merged);
      state    = pr?.state;
      pr_ref   = `pr#${number}`;
    } else if (ghEvent === 'issues') {
      const issue = payload.issue;
      number    = issue?.number;
      title     = `[Issue] ${repo}#${issue?.number}: ${issue?.title}`;
      labels    = issue?.labels?.map((l: any) => l?.name).filter(Boolean) || [];
      url       = issue?.html_url;
      state     = issue?.state;
      issue_ref = `issue#${number}`;
    } else if (ghEvent === 'issue_comment') {
      const issue = payload.issue;
      number    = issue?.number;
      title     = `[Comment] ${repo}#${issue?.number}`;
      labels    = issue?.labels?.map((l: any) => l?.name).filter(Boolean) || [];
      url       = payload.comment?.html_url;
      state     = issue?.state;
      issue_ref = `issue#${number}`;
    } else if (ghEvent === 'push') {
      title   = `[Push] ${repo}@${payload?.after?.slice?.(0,7) || ''}`;
      labels  = [];
      url     = payload?.compare;
    }

    const eventType = ghEvent === 'issue_comment' ? 'dialogue' : 'report'; // fits event_t enum
    const summary   = `${ghEvent}${action ? ':'+action : ''} by ${sender}`;
    const links     = url ? [url] : [];
    const kpis      = { action, merged, state, sender, event: ghEvent };

    // Hash for idempotency (unique index on agent_events.hash)
    const hash = hashCanonical({
      delivery_id: delivery,
      repo,
      event: eventType,
      action,
      number,
      ts: payload?.repository?.pushed_at || new Date().toISOString(),
    });

    // Insert into agent_events (matching our robust schema)
    const inserted = await sql/* sql */`
      INSERT INTO agent_events
        (agent, event, title, summary, labels, links, kpis, decisions, author, source, repo, issue_ref, pr_ref, delivery_id, hash)
      VALUES
        ('AGP', ${eventType}::event_t, ${title || ''}, ${summary},
         ${labels}::text[], ${links}::text[], ${sql.json(kpis)}, '{}'::text[],
         ${sender}, 'webhook', ${repo}, ${issue_ref || null}, ${pr_ref || null}, ${delivery}, ${hash})
      ON CONFLICT (hash) DO NOTHING
      RETURNING id
    `;

    if (inserted.rowCount === 0) {
      // Already processed
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
    }

    const eventId = inserted.rows[0].id as string;

    // Update lot state if a "lot:XYZ" label is present
    const lotLabel = labels.find((l) => typeof l === 'string' && l.startsWith('lot:'));
    if (lotLabel) {
      const lotKey = `${repo}:${lotLabel.slice(4)}`;
      const status = action === 'closed' ? 'done' : 'in-progress';
      await sql/* sql */`
        INSERT INTO lots_state (lot_key, status, kpis, last_event_id)
        VALUES (${lotKey}, ${status}, ${sql.json({ state, merged })}, ${eventId})
        ON CONFLICT (lot_key) DO UPDATE
          SET status = EXCLUDED.status,
              kpis   = EXCLUDED.kpis,
              last_event_id = EXCLUDED.last_event_id,
              updated_at = now()
      `;
    }

    // Queue a follow-up action for PRs
    if (ghEvent === 'pull_request' && typeof number === 'number') {
      const payloadJson = { kind: 'run_checks', repo, number, url, delivery_id: delivery };
      const dedupe = `run_checks:${repo}#${number}`;
      await sql/* sql */`
        INSERT INTO action_queue (kind, payload, status, attempts, dedupe_key)
        VALUES ('run_checks', ${sql.json(payloadJson)}, 'queued', 0, ${dedupe})
        ON CONFLICT (dedupe_key) DO NOTHING
      `;
    }

    return NextResponse.json({ ok: true, id: eventId }, { status: 200 });
  } catch (err) {
    console.error('webhook error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
