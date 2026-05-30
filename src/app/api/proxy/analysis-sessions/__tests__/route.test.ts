import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { config } from '@/07-shared/config/config';

/**
 * #45 키리스 Edge route handler — 키 헤더 미전달(T4-1), body 전달(T4-2),
 * BE status 패스스루(T4-3), 잘못된 body 400(T4-4), fetch 실패 502(T4-5) 검증.
 */
describe('POST /api/proxy/analysis-sessions (#45 키리스 Edge 프록시)', () => {
  const fetchMock = vi.fn();
  const BE_URL = `${config.api.baseUrl}/analysis-sessions`;

  function makeRequest(body: unknown, raw?: string): Request {
    return new Request('http://localhost/api/proxy/analysis-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: raw ?? JSON.stringify(body),
    });
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('T4-1: BE로 X-User-Gemini-Key 헤더를 전달하지 않는다 (키리스 레인)', async () => {
    await POST(makeRequest({ url: 'https://news.example.com/a' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.has('X-User-Gemini-Key')).toBe(false);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(BE_URL);
  });

  it('T4-2: 요청 body를 BE로 그대로 전달한다', async () => {
    await POST(makeRequest({ url: 'https://news.example.com/a' }));

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      url: 'https://news.example.com/a',
    });
  });

  it('T4-3: BE status를 그대로 패스스루한다 (4xx 보존)', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ message: 'BE 검증 실패', statusCode: 400 }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const res = await POST(makeRequest({ url: 'https://news.example.com/a' }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      message: 'BE 검증 실패',
      statusCode: 400,
    });
  });

  it('T4-4: 잘못된 요청 body는 400을 반환하고 BE를 호출하지 않는다', async () => {
    const res = await POST(makeRequest(undefined, 'not-json{'));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('T4-5: BE fetch 실패 시 502를 반환한다', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const res = await POST(makeRequest({ url: 'https://news.example.com/a' }));

    expect(res.status).toBe(502);
    expect((await res.json()).statusCode).toBe(502);
  });
});
