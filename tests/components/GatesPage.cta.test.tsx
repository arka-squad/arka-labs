import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import GatesPage from '../../app/console/gates/page';

jest.mock('../../src/role-context', () => ({
  useRole: () => ({ role: 'viewer' }),
}));

beforeAll(() => {
  global.fetch = jest.fn((url) => {
    if (url === '/api/gates') {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                id: 'security.webhook.hmac',
                title: 'HMAC',
                scope: 'owner-only',
              },
            ],
          }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ job: { status: 'pass' } }),
    });
  }) as any;
});

test('disables run for owner-only gate', async () => {
  render(<GatesPage />);
  const item = await screen.findByText('security.webhook.hmac');
  fireEvent.click(item);
  const btn = await screen.findByRole('button', { name: /Lancer/i });
  expect(btn).toBeDisabled();
  expect(btn).toHaveAttribute('title', 'ui.gates.banner.owner_required');
});
