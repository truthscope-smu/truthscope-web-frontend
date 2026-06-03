import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestArticleExtraction } from '../backend';
import { AppError } from '@/07-shared/errors';

// Phase 70: getSupabaseBrowserClient mock — getSession 반환값을 케이스별로 제어.
vi.mock('@/07-shared/api/supabase/client', () => ({
  getSupabaseBrowserClient: vi.fn(),
}));

import { getSupabaseBrowserClient } from '@/07-shared/api/supabase/client';

/**
 * #45 키리스 Edge 프록시 — requestArticleExtraction이 same-origin 프록시 경로를
 * 경유하는지(T5), BE 4xx 메시지가 프록시 패스스루를 거쳐 AppError까지 보존되는지(T5-b) 검증.
 * Phase 70 추가: 로그인 시 Authorization 헤더 첨부(T5-c), 미로그인 시 미첨부(T5-d) 검증.
 */
describe('requestArticleExtraction (#45 키리스 Edge 프록시)', () => {
  const fetchMock = vi.fn();

  function mockSupabaseSession(token: string | null) {
    (getSupabaseBrowserClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: token ? { access_token: token } : null,
          },
        }),
      },
    });
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('T5: same-origin 프록시 경로(/api/proxy/analysis-sessions)로 호출하고 BE 응답을 Article로 합성한다', async () => {
    mockSupabaseSession(null);
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
    mockSupabaseSession(null);
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

  it('T5-c: 로그인 상태에서 Authorization Bearer 헤더를 프록시로 전달한다 (Phase 70)', async () => {
    mockSupabaseSession('test-access-token-123');
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          sessionId: 's-2',
          status: 'EXTRACTING',
          articleId: 'a-2',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await requestArticleExtraction('https://news.example.com/b');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer test-access-token-123');
  });

  it('T5-d: 미로그인 상태에서 Authorization 헤더를 전달하지 않는다 (Phase 70)', async () => {
    mockSupabaseSession(null);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          sessionId: 's-3',
          status: 'EXTRACTING',
          articleId: 'a-3',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await requestArticleExtraction('https://news.example.com/c');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.has('Authorization')).toBe(false);
  });
});
