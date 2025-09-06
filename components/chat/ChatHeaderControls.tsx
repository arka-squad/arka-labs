import React, { useState, useEffect } from 'react';
import ProviderSelect from '../ProviderSelect';
import TokenModal from '../TokenModal';
import { AiOutlineClockCircle, AiOutlineLink } from 'react-icons/ai';

interface Props {
  agentId: string;
}

export default function ChatHeaderControls({ agentId }: Props) {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [ttl, setTtl] = useState<number | null>(null);
  const [traceId, setTraceId] = useState<string>('');
  const [selected, setSelected] = useState<{ provider?: string; model?: string }>({});
  const connected = ttl !== null;

  // Countdown timer for TTL
  useEffect(() => {
    if (ttl === null) return;
    const interval = setInterval(() => setTtl(t => (t && t > 0 ? t - 1 : null)), 1000);
    return () => clearInterval(interval);
  }, [ttl]);

  // TTL listener
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

  // Trace listener
  useEffect(() => {
    function onTrace(e: CustomEvent) {
      setTraceId(e.detail.traceId);
    }
    window.addEventListener('chat:trace', onTrace as EventListener);
    return () => window.removeEventListener('chat:trace', onTrace as EventListener);
  }, []);
  // Provider/model selection listener (external events)
  // useEffect(() => {
  //   function onProv(e: CustomEvent) {
  //     setSelected({ providerId: e.detail.provider, modelId: e.detail.model });
  //   }
  //   window.addEventListener('providerChange', onProv as EventListener);
  //   return () => window.removeEventListener('providerChange', onProv as EventListener);
  // }, []);

  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center space-x-2">
        <ProviderSelect
          agentId={agentId}
          value={{ providerId: selected.provider, modelId: selected.model, connected, ttlSec: ttl || undefined }}
          onChange={(next) => {
            setSelected({ provider: next.providerId, model: next.modelId });
            // Notify ChatDock and UI listeners of mapping change
            window.dispatchEvent(new CustomEvent('providerChange', {
              detail: { agent: agentId, provider: next.providerId, model: next.modelId }
            }));
          }}
          onOpenToken={() => setShowTokenModal(true)}
        />
        {/* Connection status badge */}
        <span className={`px-2 py-0.5 rounded-full text-xs ${connected ? 'bg-success text-success/90' : 'bg-gray-600 text-gray-300'}`}> 
          {connected ? `Connecté (${Math.floor((ttl||0)/60)}:${('0'+((ttl||0)%60)).slice(-2)})` : 'Déconnecté'}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium cursor-default">TTFT 0.0s</span>
        <button
          className="flex items-center space-x-1 text-sm cursor-pointer hover:underline"
          onClick={() => {
            navigator.clipboard.writeText(traceId);
            window.dispatchEvent(new CustomEvent('chat:traceCopied'));
          }}
        >
          <AiOutlineLink />
          <span>Trace {traceId || '---'}</span>
        </button>
      </div>
      {showTokenModal && (
        <TokenModal
          agentId={agentId}
          initialProvider={selected.provider || ''}
          initialModel={selected.model || ''}
          onClose={() => setShowTokenModal(false)}
          onTokenExchange={({ agentId: aId, provider, model, ttlSec }) => {
            // update selected mapping and TTL
            setSelected({ provider: provider, model: model });
            setTtl(ttlSec);
            // dispatch mapping to ChatDock and listeners
            window.dispatchEvent(new CustomEvent('providerChange', {
              detail: { agent: aId, provider, model }
            }));
            setShowTokenModal(false);
          }}
        />
      )}
    </div>
  );
}
