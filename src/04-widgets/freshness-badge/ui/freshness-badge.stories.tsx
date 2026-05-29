import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FreshnessBadge } from '@/04-widgets/freshness-badge';

const meta = {
  title: '04-widgets/FreshnessBadge',
  component: FreshnessBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FreshnessBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const BASE = 0;

export const Fresh: Story = {
  args: {
    createdAtMs: BASE,
    nowMs: 30 * 60 * 1000,
  },
};

export const Stable: Story = {
  args: {
    createdAtMs: BASE,
    nowMs: 12 * 60 * 60 * 1000,
  },
};

export const Aging: Story = {
  args: {
    createdAtMs: BASE,
    nowMs: 2 * 24 * 60 * 60 * 1000,
  },
};

export const Stale: Story = {
  args: {
    createdAtMs: BASE,
    nowMs: 5 * 24 * 60 * 60 * 1000,
  },
};

export const Expired: Story = {
  args: {
    createdAtMs: BASE,
    nowMs: 12 * 24 * 60 * 60 * 1000,
  },
};
