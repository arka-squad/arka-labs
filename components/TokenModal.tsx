"use client";
import React, { useState, useEffect } from 'react';
import { PROVIDERS_SEED } from '../lib/providers/seed';

interface TokenModalProps {
  agentId: string;
  initialProvider: string;
  initialModel: string;
  onClose: () => void;
  onTokenExchange: (detail: { agentId: string; provider: string; model: string; ttlSec: number }) => void;
}

export default function TokenModal({ agentId, initialProvider, initialModel, onClose, onTokenExchange }: TokenModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const [provider, setProvider] = useState(initialProvider || PROVIDERS_SEED[0].id);
  const [model, setModel] = useState(
    initialModel || PROVIDERS_SEED.find(p => p.id === initialProvider)?.models[0].id || PROVIDERS_SEED[0].models[0].id
  );
  const [token, setToken] = useState('');
  const [ttl, setTtl] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('jwt')}` },
        body: JSON.stringify({ provider, model, apiKey: token }),
      });
      const data = await res.json();
      const resultText = data.ok ? `OK: ${data.latency_ms ?? '—'}ms` : 'Échec';
      setTestResult(resultText);
    } catch {
      setTestResult('Erreur réseau');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('jwt') || ''}` },
      body: JSON.stringify({ provider, key: token }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('session_token', data.session_token);
      setTtl(data.ttl_sec);
      onTokenExchange({ agentId, provider, model, ttlSec: data.ttl_sec });
      onClose();
    } else {
      const data = await res.json().catch(() => ({}));
      const msg = data?.error || "Erreur lors de l'enregistrement";
      setError(msg);
      if ((res.status === 401) && !localStorage.getItem('jwt')) {
        // Propose dev login
        window.dispatchEvent(new CustomEvent('chat:toast', { detail: { level: 'warn', msg: 'Non connecté. Cliquez Se connecter.' } }));
      }
    }
    setLoading(false);
  };

  const handleRevoke = async () => {
    const sessionId = localStorage.getItem('session_token');
    if (!sessionId) return;
    await fetch(`/api/keys?id=${sessionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
    });
    localStorage.removeItem('session_token');
    setTtl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
      <div
        className="bg-[var(--surface)] p-6 rounded-xl shadow-2xl max-w-full w-96 border border-[var(--border)] flex flex-col overflow-hidden"
        style={{ fontFamily: 'var(--font-sans)', position: 'relative' }}
      >
        <h2 className="text-lg font-semibold mb-4 text-[var(--fg)]">Connexion BYOK</h2>
        <label className="block mb-2 text-[var(--fgdim)]">
          Fournisseur :
          <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full mt-1 bg-[var(--bubble)] border border-[var(--border)] rounded px-2 py-1 text-[var(--fg)]">
            {PROVIDERS_SEED.map(p => (
              <option key={p.id} value={p.id}>{p.display_name}</option>
            ))}
          </select>
        </label>
        <label className="block mb-2 text-[var(--fgdim)]">
          Modèle :
          <select value={model} onChange={e => setModel(e.target.value)} className="w-full mt-1 bg-[var(--bubble)] border border-[var(--border)] rounded px-2 py-1 text-[var(--fg)]">
            {PROVIDERS_SEED.find(p => p.id === provider)?.models.map(m => (
              <option key={m.id} value={m.id}>{m.display}</option>
            ))}
          </select>
        </label>
        <label className="block mb-4 text-[var(--fgdim)]">
          Clé API :
          <input type="password" value={token} onChange={e => setToken(e.target.value)} className="w-full mt-1 bg-[var(--bubble)] border border-[var(--border)] rounded px-2 py-1 text-[var(--fg)]" />
        </label>
        <div className="text-xs text-[var(--muted)] mb-2">La clé n&#39;est pas stockée durablement. Session éphémère.</div>
        {testResult && <div className="mb-2 text-sm text-[var(--fg)]">Résultat test: {testResult}</div>}
        {error && <div className="mb-2 text-sm text-[var(--danger)]">{error}</div>}
        <div className="flex flex-wrap gap-2 justify-end mt-2">
          {!localStorage.getItem('jwt') && (
            <button onClick={async ()=>{
              try {
                const r = await fetch('/api/dev/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ role:'owner' }) });
                if (r.ok) {
                  const j = await r.json();
                  localStorage.setItem('jwt', j.jwt);
                  window.dispatchEvent(new CustomEvent('chat:toast', { detail: { level: 'info', msg: 'Connecté (DEV)' } }));
                } else {
                  window.dispatchEvent(new CustomEvent('chat:toast', { detail: { level: 'error', msg: 'Login DEV indisponible' } }));
                }
              } catch {}
            }} className="px-3 py-1 bg-emerald-600 text-white rounded cursor-pointer">Se connecter</button>
          )}
          <button onClick={handleRevoke} className="px-3 py-1 bg-red-500 text-white rounded cursor-pointer" disabled={loading}>Révoquer</button>
          <button onClick={handleTest} className="px-3 py-1 bg-gray-200 rounded cursor-pointer disabled:opacity-60" disabled={loading}>Tester</button>
          <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer disabled:opacity-60" disabled={loading || !token}>Enregistrer</button>
          <button onClick={onClose} className="px-3 py-1 bg-gray-400 text-white rounded cursor-pointer disabled:opacity-60" disabled={loading}>Annuler</button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[var(--bubble)] text-[var(--fgdim)] flex items-center justify-center hover:bg-[var(--border)] cursor-pointer"
          title="Fermer"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  );
}
