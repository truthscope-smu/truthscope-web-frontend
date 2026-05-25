import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ResultCard } from '@/04-widgets/result-card';

const meta = {
  title: '04-widgets/ResultCard',
  component: ResultCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResultCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Skeleton: Story = {
  args: {
    snapshot: undefined,
  },
};

export const True: Story = {
  args: {
    snapshot: {
      factCheck: {
        verdict: 'TRUE',
        confidence: 92,
        claim: '공식 통계 기준 전년 대비 수출액이 12.4% 증가했다.',
        evidence: [
          '통계청 공식 자료와 수치가 일치합니다.',
          '관세청 수출입 통계 원문 링크 확보.',
        ],
      },
      context: {
        summary:
          '통계청 발표 자료에 따르면 2026년 1분기 수출액은 전년 동기 대비 12.4% 증가했습니다.',
        sourceCount: 4,
        relatedArticles: [
          { id: '1', title: '관세청 1분기 수출 동향 보고서', source: '관세청' },
          { id: '2', title: '한국은행 분기별 GDP 발표', source: '한국은행' },
        ],
      },
    },
  },
};

export const Partial: Story = {
  args: {
    snapshot: {
      factCheck: {
        verdict: 'PARTIAL',
        confidence: 76,
        claim: '전문가 다수는 해당 정책의 단기 효과를 긍정적으로 봤다.',
        evidence: ['보고서 방향은 일치하지만 범위가 일부 축약됐습니다.'],
      },
      context: {
        summary: '표본 기간과 비교 대상 설명이 추가로 필요합니다.',
        sourceCount: 3,
      },
    },
  },
};

export const False: Story = {
  args: {
    snapshot: {
      factCheck: {
        verdict: 'FALSE',
        confidence: 88,
        claim: '지난해 같은 지역의 사고 건수는 0건이었다.',
        evidence: [
          '공식 사고 통계에 동일 기간 18건이 기록되어 있습니다.',
          '지자체 공개 자료 + 재난안전 포털 양쪽 모두 18건 확인.',
        ],
      },
      context: {
        summary: '지자체 공개 자료 + 재난안전 포털 모두 18건 기록 확인.',
        sourceCount: 2,
      },
    },
  },
};

export const Unverified: Story = {
  args: {
    snapshot: {
      factCheck: {
        verdict: 'UNVERIFIED',
        claim: '지원금 증가가 청년 고용률 회복의 주된 원인이다.',
        evidence: ['다른 경기 변수와 정책 시차가 분리되지 않았습니다.'],
      },
      context: {
        summary: '인과 관계 확인을 위해 추가 자료가 필요합니다.',
        sourceCount: 0,
      },
    },
  },
};

export const Pending: Story = {
  args: {
    snapshot: {
      factCheck: {
        verdict: 'PENDING',
        claim: '검증 진행 중입니다.',
      },
      context: {
        summary: 'BE 응답 대기 중',
      },
    },
  },
};
