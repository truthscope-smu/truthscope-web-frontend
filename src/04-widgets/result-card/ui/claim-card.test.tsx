import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ClaimCard } from './claim-card';
import type { ClaimCardSnapshot } from '../model/types';
import type { EvidenceDto } from '@06-entities/article';

afterEach(cleanup);

const makeEvidence = (overrides: Partial<EvidenceDto> = {}): EvidenceDto => ({
  url: 'https://example.com/article',
  publisher: '통계청',
  title: '소비자물가 동향 보고서',
  stance: 'supports',
  summary: '물가상승률이 안정적임을 확인',
  ...overrides,
});

const makeClaim = (
  overrides: Partial<ClaimCardSnapshot> = {}
): ClaimCardSnapshot => ({
  claimId: 'claim-1',
  factCheck: {
    claim: '테스트 주장 텍스트',
    truthLabel: 'FACT',
    confidence: 90,
    evidence: [makeEvidence()],
  },
  ...overrides,
});

describe('ClaimCard — 기본 렌더', () => {
  it('claim 텍스트를 FactCheckSection을 통해 렌더한다', () => {
    render(<ClaimCard claim={makeClaim()} index={1} />);
    expect(screen.getByText('테스트 주장 텍스트')).toBeDefined();
  });

  it('aria-label에 claim 순번이 포함된다', () => {
    const { container } = render(<ClaimCard claim={makeClaim()} index={2} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('aria-label')).toBe('주장 2');
  });
});

describe('ClaimCard — isQuotedClaim 화자', () => {
  it('isQuotedClaim=true + speakerName 있으면 화자 배지를 렌더한다', () => {
    render(
      <ClaimCard
        claim={makeClaim({
          attribution: {
            isQuotedClaim: true,
            speakerName: '홍길동',
            claimText: '테스트 주장 텍스트',
          },
        })}
        index={1}
      />
    );
    expect(screen.getByLabelText('화자: 홍길동')).toBeDefined();
  });

  it('speakerName null(undefined)이면 "인용" 폴백 배지를 렌더한다', () => {
    render(
      <ClaimCard
        claim={makeClaim({
          attribution: {
            isQuotedClaim: true,
            speakerName: undefined,
            claimText: '테스트 주장 텍스트',
          },
        })}
        index={1}
      />
    );
    // aria-label이 "인용된 주장"으로 폴백
    expect(screen.getByLabelText('인용된 주장')).toBeDefined();
    // 배지 텍스트는 "인용"
    expect(screen.getByText('인용')).toBeDefined();
  });

  it('isQuotedClaim=true 시 Tier2 attribution disclaimer(role=note)를 렌더한다', () => {
    render(
      <ClaimCard
        claim={makeClaim({
          attribution: {
            isQuotedClaim: true,
            speakerName: '홍길동',
            claimText: '테스트 주장 텍스트',
          },
        })}
        index={1}
      />
    );
    const notes = screen.getAllByRole('note');
    const attributionNote = notes.find((n) =>
      n.textContent?.includes('화자의 입장이며')
    );
    expect(attributionNote).toBeDefined();
  });
});

describe('ClaimCard — Tier2 FactCheck disclaimer', () => {
  it('factCheck.disclaimer 있으면 근거 아래 Tier2 disclaimer를 렌더한다', () => {
    render(
      <ClaimCard
        claim={makeClaim({
          factCheck: {
            claim: '테스트 주장',
            truthLabel: 'PARTLY_FACT',
            evidence: [makeEvidence()],
            disclaimer:
              'AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요.',
          },
          disclaimer:
            'AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요.',
        })}
        index={1}
      />
    );
    expect(
      screen.getByText(
        'AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요.'
      )
    ).toBeDefined();
  });
});

describe('ClaimCard — evidence 단일 렌더(중복 금지)', () => {
  it('evidence는 FactCheckSection 내 EvidenceCard에서만 1회 렌더된다', () => {
    render(
      <ClaimCard
        claim={makeClaim({
          attribution: {
            isQuotedClaim: true,
            speakerName: '홍길동',
            claimText: '테스트 주장 텍스트',
          },
        })}
        index={1}
      />
    );
    // publisher 텍스트가 정확히 1개만 나타나야 한다(중복 렌더 없음)
    const links = screen.getAllByRole('link');
    const evidenceLinks = links.filter((l) =>
      l.textContent?.includes('통계청')
    );
    expect(evidenceLinks).toHaveLength(1);
  });
});

describe('ClaimCard — 비인용 attribution 미렌더', () => {
  it('isQuotedClaim=false이면 ClaimAttributionSection을 렌더하지 않는다', () => {
    render(
      <ClaimCard
        claim={makeClaim({
          attribution: {
            isQuotedClaim: false,
            claimText: '테스트 주장 텍스트',
          },
        })}
        index={1}
      />
    );
    // 인용 표기 헤더가 없어야 한다
    expect(screen.queryByText('인용 표기')).toBeNull();
  });

  it('attribution 없으면 ClaimAttributionSection을 렌더하지 않는다', () => {
    render(
      <ClaimCard claim={makeClaim({ attribution: undefined })} index={1} />
    );
    expect(screen.queryByText('인용 표기')).toBeNull();
  });
});
