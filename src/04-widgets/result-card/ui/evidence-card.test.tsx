import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EvidenceCard } from './evidence-card';
import type { EvidenceDto } from '@06-entities/article';

const makeEvidence = (overrides: Partial<EvidenceDto> = {}): EvidenceDto => ({
  url: 'https://example.com/article',
  publisher: '통계청',
  title: '소비자물가 동향 보고서',
  stance: 'supports',
  summary: '물가상승률이 안정적임을 확인',
  ...overrides,
});

describe('EvidenceCard', () => {
  it('publisher와 title을 href 앵커로 렌더한다', () => {
    render(<EvidenceCard evidence={[makeEvidence()]} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('https://example.com/article');
    expect(link.textContent).toContain('통계청');
    expect(link.textContent).toContain('소비자물가 동향 보고서');
  });

  it('rel=noopener noreferrer 앵커 속성이 설정된다', () => {
    render(<EvidenceCard evidence={[makeEvidence()]} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
  });

  it('summary 텍스트를 렌더한다', () => {
    render(<EvidenceCard evidence={[makeEvidence()]} />);
    expect(screen.getByText('물가상승률이 안정적임을 확인')).toBeDefined();
  });

  it('stance supports 시 뒷받침 배지를 렌더한다', () => {
    render(<EvidenceCard evidence={[makeEvidence({ stance: 'supports' })]} />);
    expect(screen.getByText('뒷받침')).toBeDefined();
  });

  it('stance refutes 시 반박 배지를 렌더한다', () => {
    render(<EvidenceCard evidence={[makeEvidence({ stance: 'refutes' })]} />);
    expect(screen.getByText('반박')).toBeDefined();
  });

  it('stance neutral 시 중립 배지를 렌더한다', () => {
    render(<EvidenceCard evidence={[makeEvidence({ stance: 'neutral' })]} />);
    expect(screen.getByText('중립')).toBeDefined();
  });

  it('evidence.length === 1 시 단일출처 경고 배지를 렌더한다', () => {
    render(<EvidenceCard evidence={[makeEvidence()]} />);
    const badge = screen.getByRole('note', { name: '단일 출처' });
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain('단일 출처');
  });

  it('evidence.length > 1 시 단일출처 배지를 렌더하지 않는다', () => {
    render(
      <EvidenceCard
        evidence={[
          makeEvidence({ url: 'https://a.com' }),
          makeEvidence({ url: 'https://b.com', publisher: '한국은행' }),
        ]}
      />
    );
    expect(screen.queryByRole('note', { name: '단일 출처' })).toBeNull();
  });
});
