import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PartialFailureDisplay } from '@/04-widgets/partial-failure-display';

const meta = {
  title: '04-widgets/PartialFailureDisplay',
  component: PartialFailureDisplay,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof PartialFailureDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

// Storybook 케이스: 5건 BE 정본 + 1건 mock + 1 Skeleton = 7 케이스 (절충안 A' 안전 우선)

export const Default: Story = {
  args: {
    snapshot: {
      coverage: {
        insufficientCount: 0,
        timeSensitiveCount: 0,
        outOfScopeCount: 0,
        tier1Count: 5,
        tier2Count: 3,
        tier3Count: 0,
      },
      sourceTransparency: {
        band: 'ALL_EXPLICIT',
        explicitCount: 5,
        ambiguousCount: 0,
        noneCount: 0,
      },
    },
  },
};

export const PartialInsufficient: Story = {
  args: {
    snapshot: {
      coverage: {
        insufficientCount: 3,
        timeSensitiveCount: 0,
        outOfScopeCount: 0,
        tier1Count: 5,
        tier2Count: 3,
        tier3Count: 3,
      },
      sourceTransparency: {
        band: 'SOME_UNCLEAR',
        explicitCount: 4,
        ambiguousCount: 2,
        noneCount: 0,
      },
    },
  },
};

export const PartialMixed: Story = {
  args: {
    snapshot: {
      coverage: {
        insufficientCount: 2,
        timeSensitiveCount: 1,
        outOfScopeCount: 1,
        tier1Count: 4,
        tier2Count: 2,
        tier3Count: 4,
      },
      sourceTransparency: {
        band: 'SOME_UNCLEAR',
        explicitCount: 3,
        ambiguousCount: 3,
        noneCount: 1,
      },
    },
  },
};

export const MissingSource: Story = {
  args: {
    snapshot: {
      coverage: {
        insufficientCount: 1,
        timeSensitiveCount: 0,
        outOfScopeCount: 1,
        tier1Count: 2,
        tier2Count: 3,
        tier3Count: 2,
      },
      sourceTransparency: {
        band: 'MISSING_SOURCE',
        explicitCount: 2,
        ambiguousCount: 1,
        noneCount: 2,
      },
    },
  },
};

export const AllClear: Story = {
  args: {
    snapshot: {
      coverage: {
        insufficientCount: 0,
        timeSensitiveCount: 0,
        outOfScopeCount: 0,
        tier1Count: 8,
        tier2Count: 4,
        tier3Count: 0,
      },
      sourceTransparency: {
        band: 'ALL_EXPLICIT',
        explicitCount: 12,
        ambiguousCount: 0,
        noneCount: 0,
      },
    },
  },
};

// 절충안 A' 1 mock 케이스 — uniqueSourceCount=1 노출 (선행 시연 + #46 baseline 박제)
export const SingleSourceWarning: Story = {
  args: {
    snapshot: {
      coverage: {
        insufficientCount: 0,
        timeSensitiveCount: 0,
        outOfScopeCount: 0,
        tier1Count: 3,
        tier2Count: 2,
        tier3Count: 0,
      },
      sourceTransparency: {
        band: 'ALL_EXPLICIT',
        explicitCount: 5,
        ambiguousCount: 0,
        noneCount: 0,
      },
      uniqueSourceCount: 1, // mock — #46 통합 phase에서 BE 매핑 의무
    },
  },
};

export const Skeleton: Story = {
  args: { snapshot: undefined },
};
