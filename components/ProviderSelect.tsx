import React, { useEffect, useState } from 'react';

interface ProviderModel {
  id: string;
  display: string;
}
interface ProviderItem {
  id: string;
  display_name: string;
  models: ProviderModel[];
}

type AgentKey = 'AGP' | 'PMO' | 'QA-ARC';
const AGENTS: AgentKey[] = ['AGP', 'PMO', 'QA-ARC'];

interface Mapping {
  [agent: string]: { provider: string; model: string };
}

interface Props {
  agentId: string;
  value: { providerId?: string; modelId?: string; connected: boolean; ttlSec?: number };
  onChange: (next: { agentId: string; providerId: string; modelId: string }) => void;
  onOpenToken: () => void;
}

export default function ProviderSelect({ agentId, value, onChange, onOpenToken }: Props) {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, { providerId: string|null; modelId: string|null }>>({});

  useEffect(() => {
    async function loadProviders() {
      try {
        const jwt = localStorage.getItem('jwt') || localStorage.getItem('RBAC_TOKEN') || '';
        const headers: Record<string, string> = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;
        const res = await fetch('/api/providers', { headers });
        if (res.status === 401) {
          setError('auth');
          window.dispatchEvent(new CustomEvent('chat:toast', { detail: { level: 'warn', msg: 'Authentifiez‑vous pour charger les providers' } }));
          return;
        }
        if (!res.ok) {
          setError('fetch');
          return;
        }
        const data = await res.json();
        setProviders(data.providers || []);
        setError(null);
      } catch {
        setError('fetch');
      }
    }
    loadProviders();
    // Load persisted mapping
    (async () => {
      try {
        const jwt = localStorage.getItem('jwt') || localStorage.getItem('RBAC_TOKEN') || '';
        const headers: Record<string, string> = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;
        const r = await fetch('/api/providers/mapping', { headers });
        if (r.ok) {
          const j = await r.json();
          setMapping(j.mapping || {});
          const rec = (j.mapping || {})[(agentId||'').toLowerCase()] || null;
          if (rec && (rec.providerId || rec.modelId)) {
            onChange({ agentId, providerId: rec.providerId || '', modelId: rec.modelId || '' });
          }
        }
      } catch {}
    })();
  }, []);

  if (providers.length === 0) {
    if (error === 'auth') {
      return (
        <div className="flex items-center gap-2">
          <span>Déconnecté</span>
          <button
            className="px-2 py-1 text-xs rounded bg-emerald-600/20 border border-emerald-600/40"
            onClick={async () => {
              try {
                const r = await fetch('/api/dev/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ role: 'owner' }),
                });
                if (r.ok) {
                  const j = await r.json();
                  localStorage.setItem('jwt', j.jwt);
                  window.location.reload();
                }
              } catch {}
            }}
          >
            Se connecter
          </button>
        </div>
      );
    }
    return <div>Chargement providers...</div>;
  }

  const handleProviderChange = (providerId: string) => {
    // always update selected provider and reset model
    const firstModel = providers.find(p => p.id === providerId)?.models[0]?.id || '';
    onChange({ agentId, providerId, modelId: firstModel });
    // persist mapping
    try {
      const key = (agentId||'').toLowerCase();
      const next = { ...(mapping||{}), [key]: { providerId, modelId: firstModel } };
      setMapping(next as any);
      const jwt = localStorage.getItem('jwt') || localStorage.getItem('RBAC_TOKEN') || '';
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (jwt) headers.Authorization = `Bearer ${jwt}`;
      fetch('/api/providers/mapping', { method:'POST', headers, body: JSON.stringify({ mapping: next }) }).catch(()=>{});
    } catch {}
    // open token modal if no session connected
    if (!value.connected) {
      onOpenToken();
    }
  };

  const handleModelChange = (modelId: string) => {
    onChange({ agentId, providerId: value.providerId || '', modelId });
    try {
      const key = (agentId||'').toLowerCase();
      const next = { ...(mapping||{}), [key]: { providerId: value.providerId || null, modelId } };
      setMapping(next as any);
      const jwt = localStorage.getItem('jwt') || localStorage.getItem('RBAC_TOKEN') || '';
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (jwt) headers.Authorization = `Bearer ${jwt}`;
      fetch('/api/providers/mapping', { method:'POST', headers, body: JSON.stringify({ mapping: next }) }).catch(()=>{});
    } catch {}
  };

  return (
    <div className="space-x-2 flex items-center">
      <select
        value={value.providerId}
        onChange={e => handleProviderChange(e.target.value)}
        className="border rounded px-2 py-1 cursor-pointer hover:border-[var(--primary)]"
      >
        <option value="">Fournisseur</option>
        {providers.map(p => (
          <option key={p.id} value={p.id}>{p.display_name}</option>
        ))}
      </select>
      <select
        value={value.modelId}
        onChange={e => handleModelChange(e.target.value)}
        className="border rounded px-2 py-1"
        disabled={!value.connected}
      >
        <option value="">Modèle</option>
        {providers.find(p => p.id === value.providerId)?.models.map(m => (
          <option key={m.id} value={m.id}>{m.display}</option>
        ))}
      </select>
      <button onClick={onOpenToken} className="btn cursor-pointer hover:bg-[var(--primary)]/20">Clé</button>
    </div>
  );
}
