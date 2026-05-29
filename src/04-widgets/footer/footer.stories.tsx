import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Footer } from '@/04-widgets/footer';

const meta = {
  title: '04-widgets/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
