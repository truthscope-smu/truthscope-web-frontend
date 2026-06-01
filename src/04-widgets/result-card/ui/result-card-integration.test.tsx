import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { ResultCard } from '@/04-widgets/result-card';
import type { EvidenceDto } from '@06-entities/article';

afterEach(cleanup);

// 회귀 시뮬레이션 C (widget wire 제거)를 executable하게 만드는 통합 테스트.
describe('ResultCard — claim attribution integration', () => {
  it('renders ClaimAttributionSection (인용 표기 heading + note) when claimAttribution provided', () => {
    render(
      <ResultCard
        snapshot={{
          claimAttribution: {
            isQuotedClaim: true,
            speakerName: '김OO',
            claimText: '주장 본문',
          },
        }}
      />
    );
    expect(screen.getByRole('heading', { name: '인용 표기' })).toBeDefined();
    expect(screen.getByRole('note').textContent).toContain('화자의 입장이며');
  });
});

// Phase 67 T4: claims 모드 통합 테스트.
// hasClaims=true 시 ClaimCard 렌더 + context 미렌더 + Tier2 disclaimer 확인.
const makeEvidence = (overrides: Partial<EvidenceDto> = {}): EvidenceDto => ({
  url: 'https://example.com/article',
  publisher: '통계청',
  title: '소비자물가 동향 보고서',
  stance: 'supports',
  summary: '물가상승률이 안정적임을 확인',
  ...overrides,
});

describe('ResultCard — claims 모드', () => {
  it('claims 모드에서 ClaimCard를 렌더한다', () => {
    render(
      <ResultCard
        snapshot={{
          claims: [
            {
              claimId: 'claim-1',
              factCheck: {
                claim: '물가가 안정된다는 주장',
                truthLabel: 'FACT',
                confidence: 85,
                evidence: [makeEvidence()],
              },
            },
          ],
        }}
      />
    );
    expect(screen.getByText('물가가 안정된다는 주장')).toBeDefined();
    expect(screen.getByLabelText('주장 1')).toBeDefined();
  });

  it('claims 모드에서 ContextSection을 렌더하지 않는다', () => {
    render(
      <ResultCard
        snapshot={{
          claims: [
            {
              claimId: 'claim-1',
              factCheck: {
                claim: '테스트 주장',
                truthLabel: 'FACT',
                evidence: [makeEvidence()],
              },
            },
          ],
          context: { summary: '이 요약은 claims 모드에서 미렌더됨' },
        }}
      />
    );
    expect(screen.queryByText('이 요약은 claims 모드에서 미렌더됨')).toBeNull();
  });

  it('claims 모드에서 Tier2 disclaimer를 렌더한다', () => {
    // 하단 일반 disclaimer와 구분되는 고유 BE 원문으로 per-claim 렌더를 특정.
    const disclaimer = 'BE per-claim Tier2 원문 검증 문구입니다.';
    render(
      <ResultCard
        snapshot={{
          claims: [
            {
              claimId: 'claim-1',
              factCheck: {
                claim: 'Tier2 disclaimer 테스트 주장',
                truthLabel: 'PARTLY_FACT',
                evidence: [makeEvidence()],
                disclaimer,
              },
              disclaimer,
            },
          ],
        }}
      />
    );
    expect(screen.getByText(disclaimer)).toBeDefined();
  });
});

// 회귀 시뮬레이션 A (freshness 렌더 게이팅) executable 통합 테스트.
describe('ResultCard — freshness badge integration', () => {
  it('freshness 제공 시 FreshnessBadge가 카드 최상단에 role=status로 렌더', async () => {
    const NOW = 1_000_000_000_000; // 고정 epoch. hint 라벨엔 단언 안 함(wall-clock 비의존)
    const { container } = render(
      <ResultCard
        snapshot={{ freshness: { createdAtMs: NOW - 30 * 60 * 1000 } }}
      />
    );
    await waitFor(() => {
      expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    });
    // 최상단 배치: article의 첫 자식 안에 role=status 배지가 있어야 함
    const article = container.querySelector('article');
    const firstChild = article?.firstElementChild;
    expect(firstChild?.querySelector('[role="status"]')).not.toBeNull();
    // 아이콘 제거: .icon class span 부재
    expect(container.querySelector('[class*="icon"]')).toBeNull();
  });

  it('freshness 미제공 시 freshness 배지 미렌더', () => {
    const { container } = render(
      <ResultCard snapshot={{ factCheck: { claim: 'x' } }} />
    );
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});
