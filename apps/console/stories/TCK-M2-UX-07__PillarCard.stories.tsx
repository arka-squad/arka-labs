import type { Meta, StoryObj } from '@storybook/react';
import { PillarCard } from '../../src/ui/PillarCard';

const meta: Meta<typeof PillarCard> = {
  title: 'Landing/PillarCard',
  component: PillarCard,
};
export default meta;

type Story = StoryObj<typeof PillarCard>;

export const Efficacite: Story = {
  args: { icon: '⚡', label: 'Efficacité', desc: 'Accélérez vos workflows IA.' },
};

export const Securite: Story = {
  args: { icon: '🛡️', label: 'Sécurité', desc: 'RBAC intégré.' },
};

export const Clarite: Story = {
  args: { icon: '📊', label: 'Clarté', desc: 'Des insights consolidés.' },
};
