'use client';

import { useState, useEffect } from 'react';

interface Session { 
  provider: string; 
  keyHash: string; 
  keyPlain?: string; 
  createdAt: number; 
}

// React hook for session management
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock session for now - in real app this would check actual auth
    const mockSession: Session = {
      provider: 'mock',
      keyHash: 'mock-hash',
      createdAt: Date.now()
    };
    
    setSession(mockSession);
    setLoading(false);
  }, []);

  return { session, loading };
}