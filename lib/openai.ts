import OpenAI from 'openai';
import { log } from './logger';
import { generateTraceId } from './trace';

const baseConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
};

function getClient() {
  return new OpenAI(baseConfig);
}

export async function simpleChat(prompt: string) {
  const client = getClient();
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });
  return res.choices[0]?.message?.content || '';
}

export type StreamOptions = {
  signal?: AbortSignal;
  traceId?: string;
  fetch?: typeof fetch;
  maxRetries?: number;
};

function mergeSignals(a?: AbortSignal, b?: AbortSignal) {
  if (!a) return b;
  if (!b) return a;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  a.addEventListener('abort', onAbort);
  b.addEventListener('abort', onAbort);
  if (a.aborted || b.aborted) controller.abort();
  return controller.signal;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function* stream(
  prompt: string,
  opts: StreamOptions = {}
): AsyncIterable<string> {
  const {
    signal,
    traceId = generateTraceId(),
    fetch: fetchImpl = fetch,
    maxRetries = 3,
  } = opts;

  let attempt = 0;
  let backoff = 1000;

  while (attempt < maxRetries) {
    const abortController = new AbortController();
    const combined = mergeSignals(signal, abortController.signal);
    const timeout = setTimeout(() => abortController.abort(), 30_000);

    try {
      const res = await fetchImpl(
        `${baseConfig.baseURL || 'https://api.openai.com/v1'}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${baseConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            stream: true,
            messages: [{ role: 'user', content: prompt }],
          }),
          signal: combined,
        }
      );

      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < maxRetries - 1) {
        log('warn', 'openai_stream_retry', {
          route: 'openai.stream',
          status: res.status,
          attempt: attempt + 1,
          trace_id: traceId,
        });
          attempt++;
          await delay(backoff);
          backoff *= 2;
          continue;
        }
        throw new Error(`OpenAI error ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (!data || data === '[DONE]') {
            if (data === '[DONE]') return;
            continue;
          }
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              yield delta;
            }
          } catch {
            // ignore parse errors
          }
        }
      }
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }
      if (attempt < maxRetries - 1) {
        log('warn', 'openai_stream_retry', {
          route: 'openai.stream',
          status: 0,
          attempt: attempt + 1,
          trace_id: traceId,
        });
        attempt++;
        await delay(backoff);
        backoff *= 2;
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}

