'use client';
import { useState, useEffect } from 'react';
import { ChatMessage, ChatMessageProps } from '../../../src/ui/ChatMessage';
import { uiLog } from '../../../lib/ui-log';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    { role: 'system', content: 'Thread initialisé.' },
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    uiLog('mount');
  }, []);

  async function send() {
    if (!input.trim()) return;
    const userMsg: ChatMessageProps = { role: 'user', content: input };
    setMessages((m) => [...m, userMsg, { role: 'agent', content: '', streaming: true }]);
    uiLog('send_message');
    setInput('');
    setTimeout(() => {
      setMessages((m) => {
        const copy = [...m];
        const agentIndex = copy.findIndex((msg) => msg.streaming);
        if (agentIndex !== -1) copy[agentIndex] = { role: 'agent', content: 'Réponse de l’agent.' };
        return copy;
      });
    }, 1000);
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-1 flex-col gap-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} {...m} />
        ))}
      </ul>
      <input
        className="rounded-md px-3 py-2 text-black"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') send();
        }}
        placeholder="Votre message..."
      />
    </div>
  );
}
