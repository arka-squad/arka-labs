'use client';

// Chat intents parser and executor for /gate and /test commands

export type ParsedIntent =
  | { type: 'gate'; gateId: string }
  | { type: 'test'; docId: string };

const gateAliases: Record<string, string> = {
  'conformité': 'contracts.schema.documents',
  conformite: 'contracts.schema.documents',
};

export function parseIntent(text: string): ParsedIntent | null {
  const parts = text.trim().split(/\s+/);
  const cmd = parts[0];
  if (cmd === '/gate' && parts[1]) {
    const key = parts[1].toLowerCase();
    const gateId = gateAliases[key] || parts[1];
    return { type: 'gate', gateId };
  }
  if (cmd === '/test' && parts[1]) {
    return { type: 'test', docId: parts[1] };
  }
  return null;
}

async function streamJob(jobId: string, threadId: string, agentId: string) {
  try {
    const res = await fetch(`/api/gates/stream?job_id=${encodeURIComponent(jobId)}`);
    if (!res.ok || !res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';
      for (const frame of frames) {
        const line = frame.trim();
        if (!line.startsWith('data: ')) continue;
        try {
          const evt = JSON.parse(line.slice(6));
          const msg = formatEvent(evt);
          if (msg) {
            window.dispatchEvent(
              new CustomEvent('chat:agentReply', {
                detail: { threadId, agentId, text: msg },
              })
            );
          }
        } catch {}
      }
    }
  } catch {
    window.dispatchEvent(
      new CustomEvent('chat:agentReply', {
        detail: { threadId, agentId, text: 'Erreur de flux' },
      })
    );
  }
}

function formatEvent(evt: any): string | null {
  switch (evt.event) {
    case 'start':
      return 'Job démarré';
    case 'done':
      return `Job terminé (${evt.status})`;
    case 'gate:start':
      return `Gate ${evt.gate_id} démarré`;
    case 'gate:pass':
      return `Gate ${evt.gate_id} PASS`;
    case 'gate:fail':
      return `Gate ${evt.gate_id} FAIL`;
    case 'gate:retry':
      return `Gate ${evt.gate_id} tentative ${evt.attempt}`;
    default:
      return null;
  }
}

export async function handleIntent(
  text: string,
  opts: { threadId: string; agentId: string; jwt?: string }
): Promise<boolean> {
  const parsed = parseIntent(text);
  if (!parsed) return false;
  const jwt = opts.jwt;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  const trace = crypto.randomUUID();
  try {
    await fetch('/api/chat/intents', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        t: text.split(' ')[0],
        payload: { text, threadId: opts.threadId },
        trace_id: trace,
      }),
    });
  } catch {}
  if (parsed.type === 'gate') {
    const key = crypto.randomUUID();
    const res = await fetch('/api/gates/run', {
      method: 'POST',
      headers: { ...headers, 'x-idempotency-key': key },
      body: JSON.stringify({ gate_id: parsed.gateId }),
    });
    if (!res.ok) {
      window.dispatchEvent(
        new CustomEvent('chat:agentReply', {
          detail: {
            threadId: opts.threadId,
            agentId: opts.agentId,
            text: `Gate erreur (${res.status})`,
          },
        })
      );
      return true;
    }
    const body = await res.json().catch(() => null);
    const jobId = body?.job_id;
    if (jobId) await streamJob(jobId, opts.threadId, opts.agentId);
    return true;
  }
  if (parsed.type === 'test') {
    const key = crypto.randomUUID();
    const res = await fetch('/api/recipes/run', {
      method: 'POST',
      headers: { ...headers, 'x-idempotency-key': key },
      body: JSON.stringify({
        recipe_id: 'contracts.basic',
        inputs: { doc_ids: [parsed.docId] },
      }),
    });
    if (!res.ok) {
      window.dispatchEvent(
        new CustomEvent('chat:agentReply', {
          detail: {
            threadId: opts.threadId,
            agentId: opts.agentId,
            text: `Test erreur (${res.status})`,
          },
        })
      );
      return true;
    }
    const body = await res.json().catch(() => null);
    const jobId = body?.job_id;
    if (jobId) await streamJob(jobId, opts.threadId, opts.agentId);
    return true;
  }
  return false;
}

