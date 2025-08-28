'use client';
import { useState, useEffect, useCallback } from 'react';
import { uiLog } from '../../../lib/ui-log';
import { useRole } from '../../../src/role-context';
import { DocUploadPanel, Doc } from './DocUploadPanel';

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
        const res = await fetch('/api/documents');
        const duration_ms = Math.round(performance.now() - start);
        uiLog('docs_fetch', { status: res.status, duration_ms, role });
        if (!res.ok) throw new Error('fail');
        const data = await res.json();
        setDocs(data.items || []);
      } catch {
        setZoneState('error');
        notify('Erreur lors du chargement');
        uiLog('docs_fetch', {
          status: 'error',
          duration_ms: Math.round(performance.now() - start),
          role,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [role, notify]);

  async function handleUpload(files: File[], tags: string[]) {
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
        const res = await fetch('/api/documents', {
          method: 'POST',
          body: form,
        });
        const duration_ms = Math.round(performance.now() - start);
        uiLog('doc_upload', { status: res.status, duration_ms, role });
        if (!res.ok) {
          setZoneState('error');
          notify('Upload échoué');
          continue;
        }
        const doc = await res.json();
        setDocs((d) => [doc, ...d]);
        notify('Upload réussi');
        setZoneState('idle');
      } catch {
        setZoneState('error');
        notify('Upload échoué');
        uiLog('doc_upload', {
          status: 'error',
          duration_ms: Math.round(performance.now() - start),
          role,
        });
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleDelete(id: number) {
    const start = performance.now();
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      const duration_ms = Math.round(performance.now() - start);
      uiLog('doc_delete', { status: res.status, duration_ms, role });
      if (!res.ok) {
        notify('Suppression échouée');
        return;
      }
      setDocs((d) => d.filter((doc) => doc.id !== id));
      notify('Document supprimé');
    } catch {
      notify('Suppression échouée');
      uiLog('doc_delete', {
        status: 'error',
        duration_ms: Math.round(performance.now() - start),
        role,
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
      />
    </div>
  );
}
