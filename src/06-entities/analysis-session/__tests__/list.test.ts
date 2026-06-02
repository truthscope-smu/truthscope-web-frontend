import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { findMyAnalysisSessions } from '../api/list';
import { AppError } from '@/07-shared/errors';
import type { AnalysisSessionListItem } from '../model/types';

describe('findMyAnalysisSessions', () => {
  const fetchMock = vi.fn();

  const MOCK_SESSIONS: AnalysisSessionListItem[] = [
    {
      sessionId: 'session-1',
      articleId: 'article-1',
      articleTitle: '반도체 시장 전망',
      articleUrl: 'https://news.example.com/semiconductor',
      articleDomain: 'news.example.com',
      status: 'COMPLETED',
      totalScore: 78,
      requestedAt: '2026-06-01T10:00:00Z',
      completedAt: '2026-06-01T10:01:30Z',
    },
    {
      sessionId: 'session-2',
      articleId: null,
      articleTitle: null,
      articleUrl: null,
      articleDomain: null,
      status: 'PENDING',
      totalScore: null,
      requestedAt: '2026-06-01T11:00:00Z',
      completedAt: null,
    },
  ];

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('200 응답 시 AnalysisSessionListItem 배열을 파싱해 반환한다', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(MOCK_SESSIONS), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await findMyAnalysisSessions('valid-token');

    expect(result).toHaveLength(2);
    expect(result[0]?.sessionId).toBe('session-1');
    expect(result[0]?.status).toBe('COMPLETED');
    expect(result[1]?.totalScore).toBeNull();
  });

  it('Authorization: Bearer 헤더를 올바르게 전달한다', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await findMyAnalysisSessions('my-access-token');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer my-access-token');
  });

  it('401 응답 시 AppError(401)를 throw한다 (CX-8 — page에서 /login 리다이렉트)', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'fail',
          statusCode: 401,
          message: '인증이 필요합니다',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const error = await findMyAnalysisSessions('expired-token').catch(
      (e: unknown) => e
    );

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(401);
  });

  it('빈 배열을 정상 파싱한다 (이력 0건)', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await findMyAnalysisSessions('valid-token');
    expect(result).toEqual([]);
  });
});
