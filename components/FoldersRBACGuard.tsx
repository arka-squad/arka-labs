'use client';

import { ReactNode } from 'react';
import { useSession } from '@/hooks/useSession';

type Role = 'viewer' | 'editor' | 'admin' | 'owner';

interface FoldersRBACGuardProps {
  roles: Role[];
  children: ReactNode;
}

export function FoldersRBACGuard({ roles, children }: FoldersRBACGuardProps) {
  // For development, use mock role matching withAuth approach  
  const mockUserRole: Role = 'owner'; // Highest permission for development
  const userRole = mockUserRole;
  
  // Check if user role is in allowed roles
  if (roles.includes(userRole)) {
    return <>{children}</>;
  }
  
  return null;
}