'use client';

import { ReactNode } from 'react';
import { useSession } from '@/hooks/useSession';

type Role = 'viewer' | 'editor' | 'admin' | 'owner';

interface FoldersRBACGuardProps {
  roles: Role[];
  children: ReactNode;
}

export function FoldersRBACGuard({ roles, children }: FoldersRBACGuardProps) {
  const { session } = useSession();
  
  // If no session, don't show protected content
  if (!session?.user?.role) {
    return null;
  }
  
  const userRole = session.user.role as Role;
  
  // Check if user role is in allowed roles
  if (roles.includes(userRole)) {
    return <>{children}</>;
  }
  
  return null;
}