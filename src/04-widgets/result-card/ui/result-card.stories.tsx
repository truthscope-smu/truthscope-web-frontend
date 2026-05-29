import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ResultCard } from '@/04-widgets/result-card';

const meta = {
  title: '04-widgets/ResultCard',
  component: ResultCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ResultCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Storybook 6 케이스 — 5 BE 정본 mock + 1 SingleSource (절충안 A' contract C 무력화 baseline) + 1 Skeleton

// Round 1 C-1/CX-1 amend: ArticleFactScoreSnapshot 정본 시그니처는 value? + scorableCount? + totalClaimCount? 3 필드 only.
// score / truthLabel 필드 부재 — phase 57 model/types.ts:10-17 정합.

export const NormalScore: Story = {
  args: {
    snapshot: {
      articleFactScore: { value: 82, scorableCount: 6, totalClaimCount: 8 },
      siftMapping: {
        sourceTransparency: {
          band: 'ALL_EXPLICIT',
          explicitCount: 5,
          ambiguousCount: 0,
          noneCount: 0,
        },
        crossSource: { tier1Count: 4, tier2Count: 2, adapterDiversity: 5 },
        attributionLinks: [
          { url: 'https://kostat.go.kr', label: '통계청 자료' },
        ],
      },
      factCheck: {
        truthLabel: 'FACT',
        confidence: 90,
        claim: '주장 예시',
        evidence: ['근거 1', '근거 2'],
      },
      partialFailure: {
        coverage: {
          insufficientCount: 0,
          timeSensitiveCount: 0,
          outOfScopeCount: 0,
          tier1Count: 4,
          tier2Count: 2,
          tier3Count: 0,
        },
        sourceTransparency: {
          band: 'ALL_EXPLICIT',
          explicitCount: 5,
          ambiguousCount: 0,
          noneCount: 0,
        },
      },
      context: {
        summary: '요약 본문',
        relatedArticles: [{ id: '1', title: '관련 기사', source: '통계청' }],
        sourceCount: 5,
      },
    },
  },
};

export const ZeroFloor: Story = {
  args: {
    snapshot: {
      articleFactScore: { value: 0, scorableCount: 3, totalClaimCount: 8 },
      siftMapping: {
        sourceTransparency: {
          band: 'MISSING_SOURCE',
          explicitCount: 1,
          ambiguousCount: 2,
          noneCount: 5,
        },
      },
      factCheck: {
        truthLabel: 'NOT_FACT',
        confidence: 95,
        claim: '오류 주장',
        evidence: ['반박 근거 1', '반박 근거 2'],
      },
      partialFailure: {
        coverage: {
          insufficientCount: 3,
          timeSensitiveCount: 1,
          outOfScopeCount: 1,
          tier1Count: 0,
          tier2Count: 3,
          tier3Count: 5,
        },
        sourceTransparency: {
          band: 'MISSING_SOURCE',
          explicitCount: 1,
          ambiguousCount: 2,
          noneCount: 5,
        },
      },
      context: { summary: '에러 톤 요약', sourceCount: 2 },
    },
  },
};

// NoScorable: value 필드 생략 = "검증 가능 주장 없음" 상태 (phase 57 types.ts:11 정합, C-2 amend).
// evidence 필드 생략 = INSUFFICIENT 시 근거 없음 (Round 2 CX-2 amend, 빈 배열 [] 사용 금지 contract — `evidence?.length` 분기에서 skeleton과 구분 어려움).
export const NoScorable: Story = {
  args: {
    snapshot: {
      articleFactScore: { scorableCount: 0, totalClaimCount: 5 },
      factCheck: { status: 'INSUFFICIENT', claim: '검증 불가 주장' },
      partialFailure: {
        coverage: {
          insufficientCount: 3,
          timeSensitiveCount: 1,
          outOfScopeCount: 1,
          tier1Count: 0,
          tier2Count: 0,
          tier3Count: 5,
        },
      },
      context: { summary: '검증 가능 0개 안내', sourceCount: 2 },
    },
  },
};

export const PartialFailure: Story = {
  args: {
    snapshot: {
      articleFactScore: { value: 65, scorableCount: 4, totalClaimCount: 8 },
      siftMapping: {
        sourceTransparency: {
          band: 'SOME_UNCLEAR',
          explicitCount: 3,
          ambiguousCount: 2,
          noneCount: 1,
        },
      },
      factCheck: {
        truthLabel: 'PARTLY_FACT',
        confidence: 70,
        claim: '일부 사실 주장',
        evidence: ['근거 1'],
      },
      partialFailure: {
        coverage: {
          insufficientCount: 2,
          timeSensitiveCount: 1,
          outOfScopeCount: 1,
          tier1Count: 2,
          tier2Count: 2,
          tier3Count: 4,
        },
        sourceTransparency: {
          band: 'SOME_UNCLEAR',
          explicitCount: 3,
          ambiguousCount: 2,
          noneCount: 1,
        },
      },
      context: { summary: '부분 실패 요약', sourceCount: 3 },
    },
  },
};

// SingleSource — context.sourceCount=1 → partial-failure-display 단일 출처 경고 발화 (절충안 A' contract C 무력화 baseline)
export const SingleSource: Story = {
  args: {
    snapshot: {
      articleFactScore: { value: 75, scorableCount: 5, totalClaimCount: 7 },
      siftMapping: {
        sourceTransparency: {
          band: 'ALL_EXPLICIT',
          explicitCount: 5,
          ambiguousCount: 0,
          noneCount: 0,
        },
      },
      factCheck: {
        truthLabel: 'MOSTLY_FACT',
        confidence: 80,
        claim: '주장 예시',
        evidence: ['근거 1'],
      },
      partialFailure: {
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
      },
      context: { summary: '단일 출처 의존 baseline', sourceCount: 1 },
    },
  },
};

export const Skeleton: Story = {
  args: { snapshot: undefined },
};
