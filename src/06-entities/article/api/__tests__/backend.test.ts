import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestArticleExtraction } from '../backend';
import { AppError } from '@/07-shared/errors';

/**
 * #45 키리스 Edge 프록시 — requestArticleExtraction이 same-origin 프록시 경로를
 * 경유하는지(T5), BE 4xx 메시지가 프록시 패스스루를 거쳐 AppError까지 보존되는지(T5-b) 검증.
 */
describe('requestArticleExtraction (#45 키리스 Edge 프록시)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('T5: same-origin 프록시 경로(/api/proxy/analysis-sessions)로 호출하고 BE 응답을 Article로 합성한다', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          sessionId: 's-1',
          status: 'EXTRACTING',
          articleId: 'a-1',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const article = await requestArticleExtraction(
      'https://news.example.com/a'
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // baseUrl '' → BE direct가 아니라 same-origin 상대 경로로 호출
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/proxy/analysis-sessions');

    const snapshot = article.toSnapshot();
    expect(snapshot.id).toBe('a-1');
    expect(snapshot.status).toBe('EXTRACTED'); // EXTRACTING → EXTRACTED 매핑 보존
  });

  it('T5-b: 프록시가 패스스루한 BE 4xx 메시지가 AppError까지 보존된다 (Round 2 C2-1)', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: '분석 대상 URL에 접근할 수 없습니다',
          statusCode: 422,
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const error = await requestArticleExtraction(
      'https://news.example.com/a'
    ).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).message).toBe(
      '분석 대상 URL에 접근할 수 없습니다'
    );
    expect((error as AppError).statusCode).toBe(422);
  });
});
