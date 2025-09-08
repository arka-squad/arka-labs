'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRole } from '../../../src/role-context';
import { uiLog } from '../../../lib/ui-log';
import { generateTraceId, TRACE_HEADER } from '../../../lib/trace';

type GateMeta = { id: string; title?: string; scope?: 'safe'|'owner-only'; category?: string };
type Job = { job_id: string; gate_id?: string; recipe_id?: string; status: string };

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) throw Object.assign(new Error('http'), { status: res.status });
  return res.json();
}

export default function GatesPage() {
  const { role } = useRole();
  const [gates, setGates] = useState<GateMeta[]>([]);
  const [selected, setSelected] = useState<GateMeta | null>(null);
  const [runs, setRuns] = useState<Job[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const trace_id = generateTraceId();
      try {
        const data = await fetchJson('/api/gates', { headers: { [TRACE_HEADER]: trace_id, authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
        setGates(data.items || []);
        uiLog('gates_fetch', { count: data.items?.length || 0, trace_id, role });
      } catch (e: any) {
        setError(`Erreur de chargement (${e.status || 'net'})`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role]);

  const filtered = useMemo(() => gates.filter((g) => g.id.toLowerCase().includes(filter.toLowerCase()) || (g.title || '').toLowerCase().includes(filter.toLowerCase())), [gates, filter]);

  async function runGate() {
    if (!selected) return;
    const trace_id = generateTraceId();
    try {
      const res = await fetch('/api/gates/run', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': crypto.randomUUID(),
          [TRACE_HEADER]: trace_id,
          authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ gate_id: selected.id, inputs: {} }),
      });
      uiLog('gate_run', { id: selected.id, status: res.status, trace_id });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setRuns((r) => [{ job_id: data.job_id, gate_id: selected.id, status: 'running' }, ...r]);
      pollStatus(data.job_id);
    } catch (e) {
      uiLog('gate_run_error', { id: selected.id });
      alert('Échec du lancement, vérifiez vos droits.');
    }
  }

  async function pollStatus(jobId: string) {
    try {
      const res = await fetch(`/api/gates/jobs/${jobId}`, { headers: { authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      if (!res.ok) return;
      const data = await res.json();
      setRuns((rs) => rs.map((j) => (j.job_id === jobId ? { ...j, status: data.job.status } : j)));
      if (data.job.status === 'running') setTimeout(() => pollStatus(jobId), 400);
    } catch {}
  }

  const disabled = selected?.scope === 'owner-only' && role !== 'owner';

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <section className="space-y-2">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrer" className="w-full rounded bg-slate-800 px-2 py-1 text-sm" />
        {loading && <div>Chargement…</div>}
        {error && <div className="text-rose-500">{error}</div>}
        <ul className="space-y-1">
          {filtered.map((g) => (
            <li key={g.id}>
              <button className={`w-full text-left rounded px-2 py-1 text-sm ${selected?.id === g.id ? 'bg-slate-700' : 'bg-slate-800'}`} onClick={() => setSelected(g)}>
                {g.id}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-2">
        {selected ? (
          <div className="space-y-2">
            <h3 className="font-semibold">{selected.title || selected.id}</h3>
            <p className="text-sm text-slate-400">Scope: {selected.scope || 'safe'}</p>
            <button onClick={runGate} disabled={disabled} title={disabled ? 'owner requis' : undefined} className="rounded bg-arka-accent px-4 py-2 text-sm disabled:opacity-50" style={{ background: 'var(--arka-accent)' }}>
              Lancer
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-400">Sélectionnez un gate</div>
        )}
      </section>
      <section className="space-y-2">
        <h3 className="font-semibold">Runs récents</h3>
        {runs.length === 0 ? <div className="text-sm text-slate-400">Aucun run</div> : (
          <ul className="space-y-1 text-sm">
            {runs.map((r) => (
              <li key={r.job_id}>{r.gate_id || r.recipe_id} — {r.status}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

