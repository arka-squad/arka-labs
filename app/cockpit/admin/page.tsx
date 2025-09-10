'use client';

import { useEffect } from 'react';

export default function AdminDashboard() {
  useEffect(() => {
    // Redirection vers l'interface backoffice créée par Codex OpenAI
    window.location.href = '/backoffice';
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirection vers l'interface admin...</p>
        <p className="text-gray-500 text-sm mt-2">
          Vous serez redirigé automatiquement vers le backoffice admin complet
        </p>
      </div>
    </div>
  );
}