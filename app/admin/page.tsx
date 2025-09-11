'use client';

import { useEffect } from 'react';

export default function AdminHomePage() {
  useEffect(() => {
    // Redirect to projects page
    window.location.href = '/admin/projects';
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>Redirecting to admin panel...</p>
      </div>
    </div>
  );
}