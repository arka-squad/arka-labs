'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/http';

export default function ProjectsPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/health', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setStatus(data.status);
      })
      .catch(() => setError("Erreur d'authentification"));
  }, []);

  return (
    <main className="p-6 text-white">
      <h1 className="mb-4 text-2xl font-bold">Projects</h1>
      {status && <p className="text-green-400">API status: {status}</p>}
      {error && <p className="text-red-400">{error}</p>}
    </main>
  );
}
