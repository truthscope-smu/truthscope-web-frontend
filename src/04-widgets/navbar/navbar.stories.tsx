import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Navbar } from '@/04-widgets/navbar';

const meta = {
  title: '04-widgets/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
