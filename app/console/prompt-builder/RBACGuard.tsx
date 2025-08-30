'use client';
import { ReactNode } from 'react';
import { useRole, Role } from '../../../src/role-context';

export function RBACGuard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { role } = useRole();
  if (roles.includes(role)) {
    return <>{children}</>;
  }
  return null;
}
