import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ExtractArticleForm } from '@/05-features/extract-article';
import { ArticleProvider } from '@/app/providers/article.context';

const meta = {
  title: '05-features/ExtractArticleForm',
  component: ExtractArticleForm,
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ArticleProvider>
        <div style={{ width: '480px' }}>
          <Story />
        </div>
      </ArticleProvider>
    ),
  ],
} satisfies Meta<typeof ExtractArticleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
