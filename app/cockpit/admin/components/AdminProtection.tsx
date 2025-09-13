'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentRole, UIRole } from '../../../../lib/auth/role';

interface AdminProtectionProps {
  children: React.ReactNode;
  allowedRoles?: UIRole[];
  redirectTo?: string;
}

export default function AdminProtection({ 
  children, 
  allowedRoles = ['admin', 'manager'],
  redirectTo = '/login'
}: AdminProtectionProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [currentRole, setCurrentRole] = useState<UIRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const role = getCurrentRole();
        setCurrentRole(role);
        
        const hasAccess = allowedRoles.includes(role);
        setIsAuthorized(hasAccess);
        
        if (!hasAccess) {
          console.warn(`Access denied: role '${role}' not in allowed roles:`, allowedRoles);
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthorized(false);
        router.push(redirectTo);
      }
    };

    checkAuth();
    
    // Re-check auth on localStorage changes (login/logout events)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'arka_token' || e.key === 'arka_user' || e.key === 'jwt' || e.key === 'RBAC_TOKEN' || e.key === 'access_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [allowedRoles, redirectTo, router]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen console-theme flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="min-h-screen console-theme flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Accès refusé</h1>
          <p className="text-gray-400 mb-4">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette section.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Rôle actuel: <span className="font-medium text-gray-300">{currentRole}</span><br />
            Rôles requis: <span className="font-medium text-gray-300">{allowedRoles.join(', ')}</span>
          </p>
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}