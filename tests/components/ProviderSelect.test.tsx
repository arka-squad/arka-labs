import { render, screen, fireEvent } from '@testing-library/react';
import ProviderSelect from '../../components/ProviderSelect';
import React from 'react';

// Mock fetch
const providersMock = [
  { id: 'openai', display_name: 'OpenAI', models: [{ id: 'm1', display: 'M1' }] },
];
beforeAll(() => {
  global.fetch = jest.fn((url, opts) => {
    if (url === '/api/providers') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ providers: providersMock }) });
    }
    return Promise.reject('Unknown URL');
  }) as any;
});

describe('ProviderSelect', () => {
  it('renders agent selectors and dispatches events', async () => {
    const listener = jest.fn();
    window.addEventListener('providerChange', listener as any);
    render(<ProviderSelect />);
    expect(await screen.findByText('AGP')).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'openai' } });
    expect(listener).toHaveBeenCalled();
  });
});
