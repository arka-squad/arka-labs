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
  const { role } = useRole();
  const readOnly = role === 'viewer';
  const [docs, setDocs] = useState<Doc[]>([]);
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
        const res = await apiFetch('/api/documents', { headers: { [TRACE_HEADER]: trace_id } });
        const duration_ms = Math.round(performance.now() - start);
        uiLog('docs_fetch', { status: res.status, duration_ms, role, trace_id });
        if (!res.ok) throw new Error('fail');
        const data = await res.json();
        setDocs(data.items || []);
      } catch (e) {
        setZoneState('error');
        notify('Erreur lors du chargement');
        const duration_ms = Math.round(performance.now() - start);
        const trace_id = (e as any)?.trace_id || generateTraceId();
        uiLog('docs_fetch', {
          status: 'error',
          duration_ms,
          role,
          trace_id,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [role, notify]);

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
      <DocUploadPanel
        docs={docs}
        onUpload={handleUpload}
        onDelete={handleDelete}
        state={zoneState}
        readOnly={readOnly}
      />
    </div>
  );
}
