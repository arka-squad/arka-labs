import type { Meta, StoryObj } from '@storybook/react';
import { PromptBuilder } from '../../../../src/ui/PromptBuilder';

export default {
  title: 'Prompt/Builder',
  component: PromptBuilder,
} as Meta<typeof PromptBuilder>;

type Story = StoryObj<typeof PromptBuilder>;

export const Empty: Story = {};

export const OneBloc: Story = {
  render: () => (
    <PromptBuilder initialBlocks={[{ id: '1', titre: 'Titre', valeur: '' }]} />
  ),
};

export const Multiple: Story = {
  render: () => (
    <PromptBuilder
      initialBlocks={[
        { id: '1', titre: 'Titre 1', valeur: '' },
        { id: '2', titre: 'Titre 2', valeur: '' },
      ]}
    />
  ),
};
