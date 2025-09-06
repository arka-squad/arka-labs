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

  useEffect(() => {
    async function loadProviders() {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch('/api/providers', { headers: { Authorization: `Bearer ${jwt}` } });
      if (!res.ok) return;
      const data = await res.json();
      setProviders(data.providers);
    }
    loadProviders();
  }, []);

  if (providers.length === 0) return <div>Chargement providers...</div>;

  const handleProviderChange = (providerId: string) => {
    // always update selected provider and reset model
    const firstModel = providers.find(p => p.id === providerId)?.models[0]?.id || '';
    onChange({ agentId, providerId, modelId: firstModel });
    // open token modal if no session connected
    if (!value.connected) {
      onOpenToken();
    }
  };

  const handleModelChange = (modelId: string) => {
    onChange({ agentId, providerId: value.providerId || '', modelId });
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
