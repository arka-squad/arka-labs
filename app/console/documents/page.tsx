'use client';
import { useState, useEffect } from 'react';
import { uiLog } from '../../../lib/ui-log';
import { useRole } from '../../../src/role-context';

type Doc = { id: number; name: string; size: number; date: string; tags: string[] };

export default function DocumentsPage() {
  const [drag, setDrag] = useState(false);
  const [docs, setDocs] = useState<Doc[]>([]);
  const { role } = useRole();
  useEffect(() => {
    uiLog('mount', { role });
  }, [role]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    const files = Array.from(e.dataTransfer.files);
    const newDocs = files.map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: f.size,
      date: new Date().toLocaleDateString(),
      tags: ['mock'],
    }));
    setDocs((d) => [...d, ...newDocs]);
    uiLog('upload', { count: files.length, role });
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`flex h-32 items-center justify-center rounded-xl border-2 border-dashed ${drag ? 'border-white' : 'border-slate-600'}`}
        aria-label="Zone de dépôt"
      >
        Glisser les fichiers ici
      </div>
      <ul className="space-y-2">
        {docs.map((d) => (
          <li key={d.id} className="flex justify-between rounded-lg bg-[#151F27] p-3 text-sm">
            <span>{d.name}</span>
            <span>{(d.size / 1024).toFixed(1)} ko</span>
            <span>{d.date}</span>
            <span>{d.tags.join(', ')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
