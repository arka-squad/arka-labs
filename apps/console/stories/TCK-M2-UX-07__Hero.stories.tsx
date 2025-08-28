import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from '../../src/ui/Hero';

const meta: Meta<typeof Hero> = {
  title: 'Landing/Hero',
  component: Hero,
};
export default meta;

type Story = StoryObj<typeof Hero>;
export const Default: Story = {};
