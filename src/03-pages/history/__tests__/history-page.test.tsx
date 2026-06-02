import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { HistoryPage } from '../history-page';
import type { AnalysisSessionListItem } from '@/06-entities/analysis-session';

afterEach(cleanup);

const MOCK_SESSIONS: AnalysisSessionListItem[] = [
  {
    sessionId: 'session-1',
    articleId: 'article-1',
    articleTitle: '반도체 시장 2026년 전망',
    articleUrl: 'https://news.example.com/semiconductor',
    articleDomain: 'news.example.com',
    status: 'COMPLETED',
    totalScore: 82,
    requestedAt: '2026-06-01T10:00:00Z',
    completedAt: '2026-06-01T10:01:30Z',
  },
  {
    sessionId: 'session-2',
    articleId: null,
    articleTitle: null,
    articleUrl: 'https://news.example.com/another',
    articleDomain: null,
    status: 'ANALYZING',
    totalScore: null,
    requestedAt: '2026-06-01T11:00:00Z',
    completedAt: null,
  },
];

describe('HistoryPage — 빈 상태', () => {
  it('sessions이 빈 배열이면 빈 상태 문구를 렌더한다', () => {
    render(<HistoryPage sessions={[]} />);
    expect(
      screen.getByText(
        '아직 분석 이력이 없습니다. 기사를 분석하면 여기에 표시됩니다.'
      )
    ).toBeDefined();
  });
});

describe('HistoryPage — 목록 렌더', () => {
  it('sessions 배열이 있으면 기사 제목을 렌더한다', () => {
    render(<HistoryPage sessions={MOCK_SESSIONS} />);
    expect(screen.getByText('반도체 시장 2026년 전망')).toBeDefined();
  });

  it('totalScore가 null인 항목은 "검증 가능 주장 없음"을 렌더한다', () => {
    render(<HistoryPage sessions={MOCK_SESSIONS} />);
    expect(screen.getByText('검증 가능 주장 없음')).toBeDefined();
  });

  it('totalScore가 존재하는 항목은 점수/100 형식으로 렌더한다', () => {
    render(<HistoryPage sessions={MOCK_SESSIONS} />);
    expect(screen.getByText('82/100')).toBeDefined();
  });
});
