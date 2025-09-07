import { render, screen } from '@testing-library/react';
import React from 'react';
import Examples, { ExampleItem } from '../../app/(site)/_components/Examples';

describe('Examples section', () => {
  const items: ExampleItem[] = [
    {
      title: 'Préparer un onboarding RH',
      command: '/kit onboarding',
      status: 'A_FAIRE',
      resultTitle: 'Onboarding',
      resultDesc:
        'Le Conseiller RH prépare le kit, le Coach organisation vérifie les étapes, le Qualité valide la conformité. Résultat : checklist complète J‑7 à J+7.',
    },
    {
      title: 'Mettre une procédure à jour',
      command: '/assign Proc-23',
      status: 'A_FAIRE',
      resultTitle: 'Procédure mise à jour',
      resultDesc:
        'Le Coach prend la tâche, le Qualité revoit la cohérence, le Support la publie. Résultat : procédure à jour, validée.',
    },
    {
      title: 'Signaler un risque conformité',
      command: '/gate conformité',
      status: 'A_RISQUE',
      resultTitle: 'Conformité',
      resultDesc:
        "Le Qualité évalue, l’Analyste propose des correctifs, le Coach les intègre. Résultat : livrable marqué À risque avec actions proposées.",
    },
  ];

  it('renders cards with proper labels and statuses', () => {
    render(<Examples items={items} />);
    expect(screen.getByText('1 commande = 1 résultat')).toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(3);
    expect(
      screen.getByLabelText('Préparer un onboarding RH — /kit onboarding')
    ).toBeInTheDocument();
    expect(screen.getByText('À risque')).toBeInTheDocument();
  });
});

