'use client';
import { useState, useEffect, useCallback } from 'react';
import { uiLog } from '../../../lib/ui-log';
import { useRole } from '../../../src/role-context';
import { generateTraceId, TRACE_HEADER } from '../../../lib/trace';

interface GateMeta {
  id: string;
  title?: string;
  scope?: string;
  category?: string;
}

interface RunItem {
  job_id: string;
  gate_id: string;
  status: 'running' | 'pass' | 'fail' | 'error';
}

export default function GatesPage() {
  const { role } = useRole();
  const [gates, setGates] = useState<GateMeta[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<GateMeta | null>(null);
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [toast, setToast] = useState<{
    msg: string;
    level: 'success' | 'error';
  } | null>(null);

  const notify = useCallback((level: 'success' | 'error', msg: string) => {
    setToast({ level, msg });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const load = async () => {
      const trace_id = generateTraceId();
      try {
        uiLog('gates_fetch', { trace_id, role });
        const res = await fetch('/api/gates', {
          headers: { [TRACE_HEADER]: trace_id },
        });
        if (!res.ok) throw new Error('fail');
        const data = await res.json();
        setGates(data.items || []);
        setState('ready');
      } catch (e) {
        setState('error');
      }
    };
    load();
  }, [role]);

  const filtered = gates.filter(
    (g) =>
      g.id.toLowerCase().includes(filter.toLowerCase()) ||
      (g.title || '').toLowerCase().includes(filter.toLowerCase()),
  );

  async function checkStatus(jobId: string) {
    try {
      const res = await fetch(`/api/gates/jobs/${jobId}`);
      if (!res.ok) return;
      const data = await res.json();
      const status = data.job.status as RunItem['status'];
      setRuns((r) =>
        r.map((run) => (run.job_id === jobId ? { ...run, status } : run)),
      );
      if (status === 'running') {
        setTimeout(() => checkStatus(jobId), 2000);
      } else if (status === 'pass') {
        notify('success', 'Gate PASS');
      } else if (status === 'fail') {
        notify('error', 'Gate FAIL');
      }
    } catch {}
  }

  async function runGate() {
    if (!selected) return;
    try {
      const trace_id = generateTraceId();
      const res = await fetch('/api/gates/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': crypto.randomUUID(),
          [TRACE_HEADER]: trace_id,
        },
        body: JSON.stringify({ gate_id: selected.id }),
      });
      uiLog('gate_run', { gate_id: selected.id, status: res.status, trace_id });
      if (!res.ok) throw new Error('run_fail');
      const data = await res.json();
      setRuns((r) => [
        { job_id: data.job_id, gate_id: selected.id, status: 'running' },
        ...r,
      ]);
      notify('success', 'Gate lancé');
      checkStatus(data.job_id);
    } catch (e) {
      notify('error', 'Échec du lancement');
    }
  }

  const disabled = selected?.scope === 'owner-only' && role !== 'owner';

  return (
    <div className="grid grid-cols-3 gap-4">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 rounded px-4 py-2 text-white ${
            toast.level === 'success' ? 'bg-green-600' : 'bg-rose-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Catalog */}
      <section className="space-y-2">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrer"
          className="w-full rounded-md bg-slate-800 px-2 py-1 text-sm"
        />
        {state === 'loading' && <div>Chargement...</div>}
        {state === 'error' && (
          <div className="text-rose-500">Erreur de chargement</div>
        )}
        {state === 'ready' && filtered.length === 0 && (
          <div>Aucun gate disponible.</div>
        )}
        <ul className="space-y-1">
          {filtered.map((g) => (
            <li key={g.id}>
              <button
                className={`w-full text-left rounded px-2 py-1 text-sm ${selected?.id === g.id ? 'bg-slate-700' : 'bg-slate-800'}`}
                onClick={() => setSelected(g)}
              >
                {g.id}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Details */}
      <section className="space-y-2">
        {selected ? (
          <div className="space-y-2">
            <h3 className="font-semibold">{selected.title || selected.id}</h3>
            <p className="text-sm text-slate-400">ID: {selected.id}</p>
            <p className="text-sm text-slate-400">
              Scope: {selected.scope || 'safe'}
            </p>
            <button
              onClick={runGate}
              disabled={disabled}
              title={disabled ? 'ui.gates.banner.owner_required' : undefined}
              className="rounded bg-arka-accent px-4 py-2 text-sm disabled:opacity-50"
              style={{ background: 'var(--arka-accent)' }}
            >
              Lancer
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-400">Sélectionnez un gate</div>
        )}
      </section>

      {/* Runs */}
      <section className="space-y-2">
        <h3 className="font-semibold">Runs récents</h3>
        {runs.length === 0 ? (
          <div className="text-sm text-slate-400">Aucun run</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {runs.map((r) => (
              <li key={r.job_id}>
                {r.gate_id} — {r.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
