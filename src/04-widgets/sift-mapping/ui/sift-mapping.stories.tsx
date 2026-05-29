import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SiftMapping } from '@/04-widgets/sift-mapping';

const meta = {
  title: '04-widgets/SiftMapping',
  component: SiftMapping,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof SiftMapping>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    snapshot: {
      sourceTransparency: {
        band: 'ALL_EXPLICIT',
        explicitCount: 4,
        ambiguousCount: 1,
        noneCount: 0,
      },
      crossSource: { tier1Count: 3, tier2Count: 5, adapterDiversity: 4 },
      attributionLinks: [
        { url: 'https://kostat.go.kr', label: '통계청 공식 자료' },
        { url: 'https://customs.go.kr', label: '관세청 수출입 통계' },
      ],
    },
  },
};

export const AllExplicit: Story = {
  args: {
    snapshot: {
      sourceTransparency: {
        band: 'ALL_EXPLICIT',
        explicitCount: 5,
        ambiguousCount: 0,
        noneCount: 0,
      },
      crossSource: { tier1Count: 4, tier2Count: 4, adapterDiversity: 5 },
      attributionLinks: [
        { url: 'https://kostat.go.kr', label: '통계청 1차 자료' },
      ],
    },
  },
};

export const SomeUnclear: Story = {
  args: {
    snapshot: {
      sourceTransparency: {
        band: 'SOME_UNCLEAR',
        explicitCount: 3,
        ambiguousCount: 2,
        noneCount: 0,
      },
      crossSource: { tier1Count: 2, tier2Count: 3, adapterDiversity: 3 },
      attributionLinks: [],
    },
  },
};

export const MissingSource: Story = {
  args: {
    snapshot: {
      sourceTransparency: {
        band: 'MISSING_SOURCE',
        explicitCount: 2,
        ambiguousCount: 1,
        noneCount: 2,
      },
      crossSource: { tier1Count: 1, tier2Count: 2, adapterDiversity: 2 },
      attributionLinks: [],
    },
  },
};

export const TraceOnly: Story = {
  args: {
    snapshot: {
      attributionLinks: [
        { url: 'https://example.com/a', label: '원문 기사 A' },
        { url: 'https://example.com/b', label: '원문 보고서 B' },
        { url: 'https://example.com/c', label: '공식 데이터 C' },
      ],
    },
  },
};

export const Skeleton: Story = {
  args: { snapshot: undefined },
};
