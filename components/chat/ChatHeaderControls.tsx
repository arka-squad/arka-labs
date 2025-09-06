"use client";
import React, { useState, useEffect } from 'react';
import ProviderSelect from '../ProviderSelect';
import TokenModal from '../TokenModal';
import { AiOutlineLink } from 'react-icons/ai';

interface Props {
  agentId: string;
}

export default function ChatHeaderControls({ agentId }: Props) {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [ttl, setTtl] = useState<number | null>(null);
  const [traceId, setTraceId] = useState<string>('');
  const [ttftMs, setTtftMs] = useState<number | null>(null);
  const [selected, setSelected] = useState<{ provider?: string; model?: string }>({});
  const connected = ttl !== null;

  useEffect(() => {
    if (ttl === null) return;
    const interval = setInterval(() => setTtl(t => (t && t > 0 ? t - 1 : null)), 1000);
    return () => clearInterval(interval);
  }, [ttl]);

  useEffect(() => {
    function onTokenStatus(e: CustomEvent) {
      if (e.detail.provider && e.detail.connected) {
        setShowTokenModal(false);
        setTtl(e.detail.ttlSec);
      }
    }
    window.addEventListener('chat:tokenStatus', onTokenStatus as EventListener);
    return () => window.removeEventListener('chat:tokenStatus', onTokenStatus as EventListener);
  }, []);

  useEffect(() => {
    function onTrace(e: CustomEvent) { setTraceId(e.detail.traceId); }
    window.addEventListener('chat:trace', onTrace as EventListener);
    return () => window.removeEventListener('chat:trace', onTrace as EventListener);
  }, []);

  useEffect(() => {
    function onTtft(e: CustomEvent) { setTtftMs(e.detail.ms); }
    window.addEventListener('chat:ttft', onTtft as EventListener);
    return () => window.removeEventListener('chat:ttft', onTtft as EventListener);
  }, []);


  // Open Token modal on request
  useEffect(() => {
    function onOpen() { setShowTokenModal(true); }
    window.addEventListener('chat:openTokenModal', onOpen as EventListener);
    return () => window.removeEventListener('chat:openTokenModal', onOpen as EventListener);
  }, []);

  // TTL sync polling (dev/demo)
  useEffect(() => {
    let id: any;
    async function poll() {
      const sessionId = localStorage.getItem('session_token');
      if (!sessionId) { setTtl(null); return; }
      try {
        const r = await fetch('/api/keys/session', { headers: { 'X-Provider-Session': sessionId, Authorization: `Bearer ${localStorage.getItem('jwt') || ''}` } });
        if (r.ok) {
          const j = await r.json();
          if (typeof j.ttl_remaining === 'number') setTtl(j.ttl_remaining);
        }
      } catch {}
    }
    poll();
    id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-3 border-b">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <ProviderSelect
            agentId={agentId}
            value={{ providerId: selected.provider, modelId: selected.model, connected, ttlSec: ttl || undefined }}
            onChange={(next) => {
              setSelected({ provider: next.providerId, model: next.modelId });
              window.dispatchEvent(new CustomEvent('providerChange', {
                detail: { agent: agentId, provider: next.providerId, model: next.modelId }
              }));
            }}
            onOpenToken={() => setShowTokenModal(true)}
          />
          <span className={`px-2 py-0.5 rounded-full text-xs ${connected ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20' : 'bg-gray-600/20 text-gray-300 border border-gray-500/40'}`}>
            {connected ? `Connecté (${Math.floor((ttl||0)/60)}:${('0'+((ttl||0)%60)).slice(-2)})` : 'Déconnecté'}
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm font-medium cursor-default">TTFT {ttftMs == null ? '—' : `${(ttftMs/1000).toFixed(1)}s`}</span>
          <button
            className="flex items-center gap-1 text-sm cursor-pointer hover:underline"
            onClick={() => {
              if (traceId) navigator.clipboard.writeText(traceId);
              window.dispatchEvent(new CustomEvent('chat:traceCopied'));
            }}
          >
            <AiOutlineLink />
            <span>Trace {traceId || '---'}</span>
          </button>
        </div>
      </div>
      {showTokenModal && (
        <TokenModal
          agentId={agentId}
          initialProvider={selected.provider || ''}
          initialModel={selected.model || ''}
          onClose={() => setShowTokenModal(false)}
          onTokenExchange={({ agentId: aId, provider, model, ttlSec }) => {
            setSelected({ provider, model });
            setTtl(ttlSec);
            window.dispatchEvent(new CustomEvent('providerChange', { detail: { agent: aId, provider, model } }));
            setShowTokenModal(false);
          }}
        />
      )}
    </div>
  );
}

