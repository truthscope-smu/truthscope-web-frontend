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
      claimAttribution: {
        isQuotedClaim: true,
        speakerName: '김OO',
        claimText: '내년 물가상승률은 2퍼센트대로 안정될 것',
        originalContext:
          '브리핑에서 "내년 물가상승률은 2퍼센트대로 안정될 것"이라고 밝혔다.',
      },
      factCheck: {
        truthLabel: 'FACT',
        confidence: 90,
        claim: '주장 예시',
        evidence: [
          {
            url: 'https://kostat.go.kr/a',
            publisher: '통계청',
            title: '소비자물가 동향',
            stance: 'supports',
            summary: '물가상승률이 2퍼센트대를 유지하고 있음을 확인',
          },
          {
            url: 'https://kostat.go.kr/b',
            publisher: '한국은행',
            title: '통화정책 보고서',
            stance: 'supports',
            summary: '목표 물가 수준 달성 전망',
          },
        ],
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
      claimAttribution: {
        isQuotedClaim: false,
        claimText: '비인용 — 기사 본문이 직접 단정한 주장',
      },
      factCheck: {
        truthLabel: 'NOT_FACT',
        confidence: 95,
        claim: '오류 주장',
        evidence: [
          {
            url: 'https://example.com/a',
            publisher: '팩트체크',
            title: '오류 사실 확인',
            stance: 'refutes',
            summary: '주장이 사실과 다름을 확인',
          },
          {
            url: 'https://example.com/b',
            publisher: '언론진흥재단',
            title: '검증 결과',
            stance: 'refutes',
            summary: '다수 출처에서 반박 근거 확인',
          },
        ],
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
        evidence: [
          {
            url: 'https://example.com/c',
            publisher: '정책브리핑',
            title: '관련 정책 자료',
            stance: 'neutral',
            summary: '일부 내용은 사실이나 전체적으로 과장된 측면 있음',
          },
        ],
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
        evidence: [
          {
            url: 'https://example.com/d',
            publisher: '통계청',
            title: '단일 출처 검증 자료',
            stance: 'supports',
            summary: '주요 통계 수치가 사실임을 확인',
          },
        ],
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

// Phase 67 T4: WithClaims — claims 모드. hasClaims=true 시 ClaimCard 목록 렌더.
// context는 claims 모드에서 미렌더. Tier2 disclaimer + EvidenceDto 포함.
export const WithClaims: Story = {
  args: {
    snapshot: {
      articleFactScore: { value: 74, scorableCount: 4, totalClaimCount: 7 },
      siftMapping: {
        sourceTransparency: {
          band: 'SOME_UNCLEAR',
          explicitCount: 3,
          ambiguousCount: 1,
          noneCount: 0,
        },
        crossSource: { tier1Count: 2, tier2Count: 2 },
      },
      partialFailure: {
        coverage: {
          insufficientCount: 1,
          timeSensitiveCount: 1,
          outOfScopeCount: 1,
          tier1Count: 2,
          tier2Count: 2,
          tier3Count: 3,
        },
        sourceTransparency: {
          band: 'SOME_UNCLEAR',
          explicitCount: 3,
          ambiguousCount: 1,
          noneCount: 0,
        },
      },
      claims: [
        {
          claimId: 'claim-1',
          factCheck: {
            claim: '소비자물가 상승률이 2퍼센트대로 안정될 것이다.',
            truthLabel: 'FACT',
            confidence: 88,
            evidence: [
              {
                url: 'https://kostat.go.kr/report/a',
                publisher: '통계청',
                title: '소비자물가 동향 보고서',
                stance: 'supports',
                summary: '최근 물가 지표가 목표 범위 내에서 안정적임을 확인.',
              },
              {
                url: 'https://bok.or.kr/report/b',
                publisher: '한국은행',
                title: '통화정책 보고서',
                stance: 'supports',
                summary: '물가 목표 달성 전망을 유지함.',
              },
            ],
          },
          attribution: {
            isQuotedClaim: true,
            speakerName: '기획재정부 장관',
            claimText: '소비자물가 상승률이 2퍼센트대로 안정될 것이다.',
            originalContext: '브리핑에서 "내년 물가는 안정된다"고 발언.',
          },
        },
        {
          claimId: 'claim-2',
          factCheck: {
            claim: 'AI가 도출한 분석이므로 기관 검증과 다를 수 있습니다.',
            truthLabel: 'PARTLY_FACT',
            confidence: 61,
            evidence: [
              {
                url: 'https://example.com/e',
                publisher: '정책브리핑',
                title: 'AI 팩트체크 가이드',
                stance: 'neutral',
                summary: 'AI 분석의 한계와 활용 방법을 안내.',
              },
            ],
            disclaimer:
              'AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요.',
          },
          disclaimer:
            'AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요.',
        },
      ],
    },
  },
};
