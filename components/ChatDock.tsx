import React, { useState, useEffect } from 'react';
// import TokenModal from './TokenModal';
// import ProviderSelect from './ProviderSelect'; // Removed outdated usage
import { AiOutlineClockCircle, AiOutlineLink } from 'react-icons/ai';

export default function ChatDock() {
  const [open, setOpen] = useState(true);
  const [ttl, setTtl] = useState<number | null>(null);
  const [traceId, setTraceId] = useState<string>('');
  const [agentMapping, setAgentMapping] = useState<Record<string, {provider:string,model:string}>>({});

  // Fetch TTL periodically
  useEffect(() => {
    async function fetchTtl() {
      const res = await fetch('/api/keys/session');
      if (res.ok) {
        const data = await res.json();
        setTtl(data.ttl_remaining);
      } else {
        setTtl(null);
      }
    }
    fetchTtl();
    const id = setInterval(fetchTtl, 60000);
    return () => clearInterval(id);
  }, []);

  // Listen for traceId updates via custom event
  useEffect(() => {
    function onTrace(e: CustomEvent) {
      setTraceId(e.detail);
    }
    window.addEventListener('traceUpdate', onTrace as EventListener);
    return () => window.removeEventListener('traceUpdate', onTrace as EventListener);
  }, []);
  
  // Listen for provider mapping changes
  useEffect(() => {
    function onProviderChange(e: CustomEvent) {
      const { agent, provider, model } = e.detail;
      setAgentMapping(prev => ({ ...prev, [agent]: { provider, model } }));
    }
    window.addEventListener('providerChange', onProviderChange as EventListener);
    return () => window.removeEventListener('providerChange', onProviderChange as EventListener);
  }, []);

  return (
    <div className={`fixed right-0 top-0 h-full bg-white border-l p-4 shadow-lg transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <button className="mb-4 text-gray-500" onClick={() => setOpen(o => !o)}>
        {open ? 'Fermer' : 'Ouvrir'} Dock
      </button>
      <div className="flex flex-col space-y-4">
        {ttl !== null && (
          <div className="flex items-center space-x-1 text-sm text-gray-700">
            <AiOutlineClockCircle />
            <span>Expire dans {Math.floor(ttl / 60)} min</span>
          </div>
        )}
        {/* ProviderSelect moved to ChatPanel header via ChatHeaderControls */}
        <div className="flex items-center space-x-1 text-sm">
          <AiOutlineLink />
          <span>Trace ID: {traceId}</span>
        </div>
      </div>
      {/* Mapping providers par agent */}
      <div className="mt-4">
        {Object.entries(agentMapping).map(([agent, {provider, model}]) => (
          <div key={agent} className="text-xs text-gray-500">{agent}: {provider} / {model}</div>
        ))}
      </div>
    </div>
  );
}
