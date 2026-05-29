import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ClaimAttributionSection } from '@04-widgets/result-card/ui/claim-attribution-section';

afterEach(cleanup);

describe('ClaimAttributionSection — quoted claim', () => {
  it('shows speaker badge, disclaimer(role=note), and details when quoted with context', () => {
    render(
      <ClaimAttributionSection
        snapshot={{
          isQuotedClaim: true,
          speakerName: '김OO',
          claimText: '주장 본문',
          originalContext: '원문 맥락',
        }}
      />
    );
    expect(screen.getByLabelText('화자: 김OO')).toBeDefined();
    const note = screen.getByRole('note');
    expect(note.textContent).toContain('화자의 입장이며');
    expect(screen.getByText('원문 맥락 보기')).toBeDefined();
  });
});

describe('ClaimAttributionSection — non-quoted', () => {
  it('renders claimText only, no disclaimer, no badge', () => {
    render(
      <ClaimAttributionSection
        snapshot={{ isQuotedClaim: false, claimText: '비인용 주장' }}
      />
    );
    expect(screen.getByText('비인용 주장')).toBeDefined();
    expect(screen.queryByRole('note')).toBeNull();
  });
});

describe('ClaimAttributionSection — skeleton', () => {
  it('renders skeleton when snapshot undefined', () => {
    const { container } = render(<ClaimAttributionSection />);
    expect(container.querySelector('[class*="animate-pulse"]')).not.toBeNull();
    expect(screen.queryByRole('note')).toBeNull();
  });
});

// C2 — quoted edge 계약 방어
describe('ClaimAttributionSection — quoted edge', () => {
  it('quoted without speakerName falls back to "인용된 주장" aria-label', () => {
    render(
      <ClaimAttributionSection
        snapshot={{ isQuotedClaim: true, claimText: '주장' }}
      />
    );
    expect(screen.getByLabelText('인용된 주장')).toBeDefined();
    // disclaimer는 화자명 없어도 노출
    expect(screen.getByRole('note')).toBeDefined();
  });

  it('quoted without originalContext renders no details toggle', () => {
    render(
      <ClaimAttributionSection
        snapshot={{
          isQuotedClaim: true,
          speakerName: '김OO',
          claimText: '주장',
        }}
      />
    );
    expect(screen.queryByText('원문 맥락 보기')).toBeNull();
  });

  it('quoted with empty claimText shows skeleton (note still present)', () => {
    const { container } = render(
      <ClaimAttributionSection
        snapshot={{ isQuotedClaim: true, speakerName: '김OO', claimText: '' }}
      />
    );
    expect(container.querySelector('[class*="animate-pulse"]')).not.toBeNull();
    expect(screen.getByRole('note')).toBeDefined();
  });
});
