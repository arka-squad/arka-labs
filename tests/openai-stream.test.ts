import test from 'node:test';
import assert from 'node:assert/strict';
import { stream } from '../lib/openai';

const encoder = new TextEncoder();

function sseResponse(lines: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line));
      }
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

test('simulate 429 → retry', async () => {
  let calls = 0;
  const fetcher = async () => {
    calls++;
    if (calls === 1) {
      return new Response('too many', { status: 429 });
    }
    return sseResponse([
      'data: {"choices":[{"delta":{"content":"hi"}}]}\n\n',
      'data: [DONE]\n\n',
    ]);
  };

  const chunks: string[] = [];
  for await (const c of stream('hello', { fetch: fetcher as any })) {
    chunks.push(c);
  }
  assert.equal(chunks.join(''), 'hi');
  assert.equal(calls, 2);
});

test('client abort → arrêt flux', async () => {
  const fetcher = async (_url: string, opts: any) => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode('data: {"choices":[{"delta":{"content":"hello"}}]}\n\n')
        );
        // keep stream open until abort
        opts.signal?.addEventListener('abort', () => {
          controller.error(new DOMException('aborted', 'AbortError'));
        });
      },
    });
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };

  const ac = new AbortController();
  const iter = stream('hello', { fetch: fetcher as any, signal: ac.signal })[Symbol.asyncIterator]();
  const first = await iter.next();
  assert.equal(first.value, 'hello');
  ac.abort();
  await assert.rejects(() => iter.next(), /AbortError/);
});
