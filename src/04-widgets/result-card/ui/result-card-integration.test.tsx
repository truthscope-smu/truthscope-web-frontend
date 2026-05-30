import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { ResultCard } from '@/04-widgets/result-card';

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
