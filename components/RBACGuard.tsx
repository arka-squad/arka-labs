'use client';
import { ReactNode } from 'react';
import { useRole } from '../src/role-context';

export type GuardRole = 'viewer' | 'editor' | 'admin' | 'owner' | 'operator';

export default function RBACGuard({ roles, children }: { roles: GuardRole[]; children: ReactNode }) {
  const { role } = useRole();
  if (roles.includes(role as GuardRole)) return <>{children}</>;
  return null;
}

