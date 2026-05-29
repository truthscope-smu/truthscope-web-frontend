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

export const Fact: Story = {
  args: {
    snapshot: {
      factCheck: {
        truthLabel: 'FACT',
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

export const MostlyFact: Story = {
  args: {
    snapshot: {
      factCheck: {
        truthLabel: 'MOSTLY_FACT',
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

export const PartlyFact: Story = {
  args: {
    snapshot: {
      factCheck: {
        truthLabel: 'PARTLY_FACT',
        confidence: 54,
        claim: '지원금 증가가 청년 고용률 회복의 주된 원인이다.',
        evidence: ['수치 방향은 맞지만 인과 설명은 확인되지 않았습니다.'],
      },
      context: {
        summary: '다른 경기 변수와 정책 시차가 분리되지 않았습니다.',
        sourceCount: 2,
      },
    },
  },
};

export const MostlyNotFact: Story = {
  args: {
    snapshot: {
      factCheck: {
        truthLabel: 'MOSTLY_NOT_FACT',
        confidence: 31,
        claim: '해당 법안은 이미 모든 절차를 통과해 시행 중이다.',
        evidence: [
          '상임위 계류 상태로, 시행 중이라는 표현은 부정확합니다.',
          '일부 조항은 별도 시행령으로 검토 중입니다.',
        ],
      },
      context: {
        summary: '법안은 입법 절차의 일부만 통과했습니다.',
        sourceCount: 3,
      },
    },
  },
};

export const NotFact: Story = {
  args: {
    snapshot: {
      factCheck: {
        truthLabel: 'NOT_FACT',
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

export const Insufficient: Story = {
  args: {
    snapshot: {
      factCheck: {
        status: 'INSUFFICIENT',
        claim: '해당 사건의 책임자는 A 회사이다.',
        evidence: ['확인 가능한 출처가 1건뿐이며 교차 검증이 어렵습니다.'],
      },
      context: {
        summary: '추가 1차 출처가 확인되면 재평가 가능합니다.',
        sourceCount: 1,
      },
    },
  },
};

export const TimeSensitive: Story = {
  args: {
    snapshot: {
      factCheck: {
        status: 'TIME_SENSITIVE',
        claim: '오늘 기준 환율은 1,380원이다.',
        evidence: [
          '실시간 환율 변동성이 커 시점 명시 없이는 사실성 평가가 어렵습니다.',
        ],
      },
      context: {
        summary: '시점 정보가 명확해지면 재검증 가능합니다.',
        sourceCount: 1,
      },
    },
  },
};

export const OutOfScope: Story = {
  args: {
    snapshot: {
      factCheck: {
        status: 'OUT_OF_SCOPE',
        claim: '이 정책은 윤리적으로 옳다.',
        evidence: ['가치 판단 주장은 사실 검증 범위 밖입니다.'],
      },
      context: {
        summary: 'TruthScope는 검증 가능한 사실 단위만 다룹니다.',
        sourceCount: 0,
      },
    },
  },
};
