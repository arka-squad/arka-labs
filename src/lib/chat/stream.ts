'use client';

// Simple SSE reader for /api/chat/stream (NDJSON events)
// Emits window events:
// - 'chat:trace' { traceId }
// - 'chat:ttft' { ms }
// Calls optional callbacks for token/open/done

type StreamOpts = {
  agentId: string;
  threadId?: string;
  providerId: string;
  modelId: string;
  sessionId?: string | null;
  role?: string;
  signal?: AbortSignal;
  onOpen?: (ev: { trace_id: string }) => void;
  onToken?: (chunk: string) => void;
  onDone?: (ev: { ttft_ms: number; tokens: number }) => void;
};

export async function streamChat(opts: StreamOpts) {
  const { agentId, threadId, providerId, modelId, sessionId, signal, onOpen, onToken, onDone } = opts;
  const t0 = Date.now();
  let ttftSent = false;
  const headers: Record<string, string> = {
    'X-Provider': providerId,
    'X-Model': modelId,
  };
  if (sessionId) headers['X-Provider-Session'] = sessionId;

  const url = `/api/chat/stream?agent=${encodeURIComponent(agentId)}${threadId ? `&thread_id=${encodeURIComponent(threadId)}` : ''}${opts.role ? `&role=${encodeURIComponent(opts.role)}` : ''}`;
  const res = await fetch(url, { headers, signal });
  if (!res.ok || !res.body) {
    throw new Error(`chat_stream_bad_response:${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Split on double newline separator (SSE frame)
    const frames = buffer.split('\n\n');
    buffer = frames.pop() || '';
    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);
      try {
        const evt = JSON.parse(payload);
        if (evt.t === 'open') {
          const traceId = evt.trace_id as string;
          window.dispatchEvent(new CustomEvent('chat:trace', { detail: { traceId } }));
          onOpen?.(evt);
        } else if (evt.t === 'token') {
          if (!ttftSent) {
            ttftSent = true;
            const ms = Date.now() - t0;
            window.dispatchEvent(new CustomEvent('chat:ttft', { detail: { ms } }));
          }
          onToken?.(evt.v as string);
        } else if (evt.t === 'done') {
          const ms = typeof evt.ttft_ms === 'number' ? evt.ttft_ms : (ttftSent ? Date.now() - t0 : 0);
          window.dispatchEvent(new CustomEvent('chat:ttft', { detail: { ms } }));
          onDone?.(evt);
        }
      } catch {
        // ignore JSON parse errors
      }
    }
  }
}
