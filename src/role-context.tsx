'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
export type Role = 'viewer' | 'editor' | 'admin' | 'owner';
interface RoleCtx { role: Role; setRole: (r: Role) => void; }
const RoleContext = createContext<RoleCtx>({ role: 'viewer', setRole: () => {} });
export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('viewer');
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}
export function useRole() {
  return useContext(RoleContext);
}
