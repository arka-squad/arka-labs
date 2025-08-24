import { ReactNode } from 'react';

export function ConsoleShell({ children }: { children: ReactNode }) {
  return <div className="console-shell">{children}</div>;
}
