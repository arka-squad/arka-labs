'use client';
import { useState, useEffect, useCallback } from 'react';
import { uiLog } from '../../../lib/ui-log';
import { useRole } from '../../../src/role-context';
import { DocUploadPanel, Doc } from './DocUploadPanel';
import { generateTraceId, TRACE_HEADER } from '../../../lib/trace';
import { apiFetch } from '../../../lib/http';

const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/plain',
  'image/png',
  'image/jpeg',
];

export default function DocumentsPage() {
  // B5: lecture seule (RO) et pagination 20/l
  const readOnly = true;
  const { role } = useRole();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [count, setCount] = useState(0);
  const [zoneState, setZoneState] = useState<'idle' | 'drag' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const fetchDocs = async () => {
      const start = performance.now();
      try {
        setLoading(true);
        const trace_id = generateTraceId();
        const res = await apiFetch(`/api/documents?page=${page}&page_size=${pageSize}`, { headers: { [TRACE_HEADER]: trace_id } });
        const duration_ms = Math.round(performance.now() - start);
        uiLog('docs_fetch', { status: res.status, duration_ms, role, trace_id, page, page_size: pageSize });
        if (!res.ok) throw new Error('fail');
        const data = await res.json();
        setDocs(data.items || []);
        setCount(data.count || 0);
      } catch (e) {
        setZoneState('error');
        notify('Erreur lors du chargement');
        const duration_ms = Math.round(performance.now() - start);
        const trace_id = (e as any)?.trace_id || generateTraceId();
        uiLog('docs_fetch', {
          status: 'error',
          duration_ms,
          role,
          page,
          page_size: pageSize,
          trace_id,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [role, notify, page]);

  async function handleUpload(files: File[], tags: string[]) {
    if (readOnly) return;
    for (const file of files) {
      if (file.size > MAX_SIZE || !ALLOWED.includes(file.type)) {
        notify('Fichier invalide');
        setZoneState('error');
        continue;
      }
      const form = new FormData();
      form.append('file', file);
      tags.forEach((t) => form.append('labels', t));
      const start = performance.now();
      try {
        setLoading(true);
        const trace_id = generateTraceId();
        const res = await apiFetch('/api/documents', {
          method: 'POST',
          body: form,
          headers: { [TRACE_HEADER]: trace_id },
        });
        const duration_ms = Math.round(performance.now() - start);
        uiLog('doc_upload', { status: res.status, duration_ms, role, trace_id });
        if (!res.ok) {
          setZoneState('error');
          notify('Upload échoué');
          continue;
        }
        const doc = await res.json();
        setDocs((d) => [doc, ...d]);
        notify('Upload réussi');
        setZoneState('idle');
      } catch (e) {
        setZoneState('error');
        notify('Upload échoué');
        const duration_ms = Math.round(performance.now() - start);
        const trace_id = (e as any)?.trace_id || generateTraceId();
        uiLog('doc_upload', {
          status: 'error',
          duration_ms,
          role,
          trace_id,
        });
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleDelete(id: number) {
    if (readOnly) return;
    const start = performance.now();
    try {
      setLoading(true);
      const trace_id = generateTraceId();
      const res = await apiFetch(`/api/documents/${id}`, { method: 'DELETE', headers: { [TRACE_HEADER]: trace_id } });
      const duration_ms = Math.round(performance.now() - start);
      uiLog('doc_delete', { status: res.status, duration_ms, role, trace_id });
      if (!res.ok) {
        notify('Suppression échouée');
        return;
      }
      setDocs((d) => d.filter((doc) => doc.id !== id));
      notify('Document supprimé');
    } catch (e) {
      notify('Suppression échouée');
      const duration_ms = Math.round(performance.now() - start);
      const trace_id = (e as any)?.trace_id || generateTraceId();
      uiLog('doc_delete', {
        status: 'error',
        duration_ms,
        role,
        trace_id,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 relative">
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
          Chargement...
        </div>
      )}
      {toast && (
        <div className="fixed bottom-4 right-4 rounded bg-black px-4 py-2 text-white">
          {toast}
        </div>
      )}
      {/* Empty/Error states + liste (RO) */}
      {docs.length === 0 && zoneState !== 'error' ? (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 text-center text-sm text-slate-300">
          Aucun document disponible.
        </div>
      ) : null}
      <DocUploadPanel
        docs={docs}
        onUpload={handleUpload}
        onDelete={handleDelete}
        state={zoneState}
        readOnly={readOnly}
      />
      {/* Pagination 20/l */}
      <div className="flex items-center justify-between text-sm text-slate-300">
        <button
          className="rounded-md border px-3 py-1 disabled:opacity-50"
          style={{ background: '#151F27', borderColor: '#1F2A33' }}
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Précédent
        </button>
        <span>
          Page {page} · {Math.ceil((count || 0) / pageSize)} — {count} documents
        </span>
        <button
          className="rounded-md border px-3 py-1 disabled:opacity-50"
          style={{ background: '#151F27', borderColor: '#1F2A33' }}
          disabled={page >= Math.ceil((count || 0) / pageSize)}
          onClick={() => setPage((p) => p + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
