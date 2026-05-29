import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
