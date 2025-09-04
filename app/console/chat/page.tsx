'use client';

import { useState, useEffect } from 'react';
import { ChatMessage, ChatMessageProps } from '../../../src/ui/ChatMessage';
import { uiLog } from '../../../lib/ui-log';
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

