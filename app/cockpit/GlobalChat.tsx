"use client";

import React, { useEffect, useRef, useState } from 'react';
import ChatPanel from '../../components/chat/ChatPanel';
import { demoThreads, demoAgents, demoMessages } from '../console/demo-data';

export default function GlobalChat() {
  const [activeThreadId, setActiveThreadId] = useState<string>(demoThreads[0]?.id || '');
  const [msgs, setMsgs] = useState<Record<string, any[]>>({ ...demoMessages });
  const asideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onAgentReply(e: any) {
      const { threadId, agentId, text } = (e as CustomEvent).detail || {};
      if (!threadId || !text) return;
      setMsgs(prev => {
        const arr = prev[threadId] || [];
        const now = new Date();
        const agentName = (demoAgents.find(a=>a.id===agentId)?.name) || 'Agent';
        const agentMsg = { id: 'agent_'+now.getTime(), from: agentName, role: 'agent', at: now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}), text, status: 'delivered' };
        return { ...prev, [threadId]: [...arr, agentMsg] };
      });
    }
    window.addEventListener('chat:agentReply', onAgentReply as EventListener);
    return () => window.removeEventListener('chat:agentReply', onAgentReply as EventListener);
  }, []);

  // Publish actual chat width to a CSS var for precise main padding
  useEffect(() => {
    function updateVar() {
      const el = asideRef.current;
      if (!el) return;
      const w = el.offsetWidth; // includes padding + border
      document.documentElement.style.setProperty('--cockpit-chat-w', `${w}px`);
    }
    updateVar();
    window.addEventListener('resize', updateVar);
    return () => window.removeEventListener('resize', updateVar);
  }, []);

  const handleSend = async (threadId: string, payload: { text: string }) => {
    const list = msgs[threadId] || [];
    const now = new Date();
    const newMsg = { id: 'loc_'+now.getTime(), from: 'Owner', role: 'human', at: now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}), text: payload.text, status: 'delivered' } as any;
    setMsgs({ ...msgs, [threadId]: [...list, newMsg] });
  };

  return (
    <aside ref={asideRef} className="fixed top-14 left-[72px] bottom-0 w-[320px] lg:w-[380px] border-r border-[var(--border)] elevated bg-[var(--surface)] z-20">
      <ChatPanel
        threads={demoThreads as any}
        messagesByThread={msgs as any}
        agents={demoAgents as any}
        activeThreadId={activeThreadId}
        onSelectThread={(id)=>setActiveThreadId(id)}
        onSelectAgent={()=>{}}
        onSend={handleSend}
      />
    </aside>
  );
}

