import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArticleFactScore } from '@/04-widgets/article-fact-score';

const meta = {
  title: '04-widgets/ArticleFactScore',
  component: ArticleFactScore,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ArticleFactScore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { snapshot: { value: 68, scorableCount: 4, totalClaimCount: 5 } },
};

export const FloorZero: Story = {
  args: { snapshot: { value: 0, scorableCount: 3, totalClaimCount: 3 } },
};

export const Empty: Story = {
  args: {
    snapshot: { value: undefined, scorableCount: 0, totalClaimCount: 5 },
  },
};

export const HighScore: Story = {
  args: { snapshot: { value: 92, scorableCount: 4, totalClaimCount: 4 } },
};

export const Skeleton: Story = {
  args: { snapshot: undefined },
};
