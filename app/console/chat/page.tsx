'use client';

import { useState, useEffect } from 'react';
import { ChatMessage, ChatMessageProps } from '../../../src/ui/ChatMessage';
import { uiLog } from '../../../lib/ui-log';
import { generateTraceId, TRACE_HEADER } from '../../../lib/trace';
import { useRole } from '../../../src/role-context';

export default function ChatPage() {
  const { role } = useRole();
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    { role: 'system', content: 'Thread initialisé.' },
  ]);
  const [input, setInput] = useState('');
  const readOnly = role === 'viewer';

  useEffect(() => {
    uiLog('mount', { role });
  }, [role]);

  async function send() {
    if (readOnly) return;
    if (!input.trim()) return;
    // intents: /gate <id> or /test <id>
    const intent = input.trim();
    if (await runFromIntent(intent)) {
      setInput('');
      return;
    }
    const userMsg: ChatMessageProps = { role: 'user', content: input };
    setMessages((m) => [...m, userMsg, { role: 'agent', content: '', streaming: true }]);
    uiLog('send_message', { role });
    setInput('');
    setTimeout(() => {
      setMessages((m) => {
        const copy = [...m];
        const agentIndex = copy.findIndex((msg) => (msg as any).streaming);
        if (agentIndex !== -1) copy[agentIndex] = { role: 'agent', content: "Réponse de l'agent." } as ChatMessageProps;
        return copy;
      });
    }, 1000);
  }

  async function runFromIntent(text: string) {
    const m = text.match(/^\/(gate|test)\s+([^\s]+).*$/i);
    if (!m) return false;
    const kind = m[1].toLowerCase();
    const id = m[2];
    const trace_id = generateTraceId();
    try {
      if (kind === 'gate') {
        const res = await fetch('/api/gates/run', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-idempotency-key': crypto.randomUUID(),
            [TRACE_HEADER]: trace_id,
            authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({ gate_id: id, inputs: {} }),
        });
        if (res.ok) {
          const data = await res.json();
          uiLog('chat.intent.gate', { id, job_id: data.job_id, trace_id });
        }
      } else {
        const res = await fetch('/api/recipes/run', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-idempotency-key': crypto.randomUUID(),
            [TRACE_HEADER]: trace_id,
            authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({ recipe_id: id, inputs: {} }),
        });
        if (res.ok) {
          const data = await res.json();
          uiLog('chat.intent.test', { id, job_id: data.job_id, trace_id });
        }
      }
    } catch {}
    return true;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ul className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {messages.map((m, i) => (
          <ChatMessage key={i} {...m} />
        ))}
      </ul>
      {readOnly ? (
        <div className="rounded-md border px-3 py-2 text-sm" style={{ background: '#151F27', borderColor: '#1F2A33' }}>
          Mode lecture seule (viewer)
        </div>
      ) : (
        <input
          className="rounded-md px-3 py-2 text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
          placeholder="Votre message..."
        />
      )}
    </div>
  );
}
