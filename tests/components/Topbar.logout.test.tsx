import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Topbar from '../../components/Topbar';

test.skip('logout (Topbar) — déplacé dans la Sidebar avatar menu', () => {
  const originalLocation = window.location;
  Object.defineProperty(window, 'location', {
    value: { href: '/', assign: (u: string) => { (window as any).location.href = u; } },
    writable: true,
  });
  const store: Record<string,string> = { RBAC_TOKEN:'abc', access_token:'def', jwt:'ghi', session_token:'s123' };
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k]=v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k=>delete store[k]); },
    },
    configurable: true,
  });

  render(React.createElement(Topbar as any, { role: 'owner' }));
  const buttons = screen.getAllByRole('button');
  fireEvent.click(buttons[buttons.length-1]);
  fireEvent.click(screen.getByRole('menuitem', { name: /Se déconnecter/i }));

  expect((window as any).location.href).toBe('/login');
  Object.defineProperty(window, 'location', { value: originalLocation });
});
