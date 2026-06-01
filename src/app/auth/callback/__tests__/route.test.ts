import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * /auth/callback Route Handler — PKCE 콜백 처리 단위 테스트
 * getSupabaseServerClient vi.mock 격리
 */

const mockExchangeCodeForSessionFn = vi.fn();

vi.mock('@/07-shared/api/supabase/server', () => ({
  getSupabaseServerClient: async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSessionFn,
    },
  }),
}));

import { GET } from '../route';

function makeRequest(params: Record<string, string>): Request {
  const url = new URL('http://localhost/auth/callback');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

describe('GET /auth/callback', () => {
  beforeEach(() => {
    mockExchangeCodeForSessionFn.mockReset();
    mockExchangeCodeForSessionFn.mockResolvedValue({ error: null });
  });

  it('error 파라미터 있으면 /login?error=oauth_cancelled로 redirect됨 (code보다 우선)', async () => {
    const request = makeRequest({ error: 'access_denied', code: 'some-code' });
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location')!;
    expect(location).toContain('/login');
    expect(location).toContain('error=oauth_cancelled');
    // error 우선이므로 exchangeCodeForSession 미호출
    expect(mockExchangeCodeForSessionFn).not.toHaveBeenCalled();
  });

  it('code 없으면 /login으로 redirect됨', async () => {
    const request = makeRequest({});
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location')!;
    expect(location).toContain('/login');
    expect(location).not.toContain('error=');
    expect(mockExchangeCodeForSessionFn).not.toHaveBeenCalled();
  });

  it('exchange 실패 시 /login?error=auth_failed로 redirect됨', async () => {
    mockExchangeCodeForSessionFn.mockResolvedValue({
      error: { message: 'invalid code' },
    });

    const request = makeRequest({ code: 'bad-code' });
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location')!;
    expect(location).toContain('/login');
    expect(location).toContain('error=auth_failed');
  });

  it('exchange 실패 시 next도 유지됨 (재시도 의도 보존)', async () => {
    mockExchangeCodeForSessionFn.mockResolvedValue({
      error: { message: 'invalid code' },
    });

    const request = makeRequest({ code: 'bad-code', next: '/history' });
    const response = await GET(request);

    const location = response.headers.get('location')!;
    expect(location).toContain('error=auth_failed');
    expect(location).toContain('next=%2Fhistory');
  });

  it('성공 시 next 경로로 redirect됨', async () => {
    mockExchangeCodeForSessionFn.mockResolvedValue({ error: null });

    const request = makeRequest({ code: 'valid-code', next: '/history' });
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location')!;
    expect(location).toContain('/history');
    expect(mockExchangeCodeForSessionFn).toHaveBeenCalledWith('valid-code');
  });

  it('next 없으면 / 로 redirect됨', async () => {
    mockExchangeCodeForSessionFn.mockResolvedValue({ error: null });

    const request = makeRequest({ code: 'valid-code' });
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location')!;
    expect(location).toMatch(/\/$/);
  });

  it('위험한 next 경로는 /로 폴백됨 (open redirect 방지)', async () => {
    mockExchangeCodeForSessionFn.mockResolvedValue({ error: null });

    const request = makeRequest({ code: 'valid-code', next: '//evil.com' });
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location')!;
    // 위험 경로는 '/'로 폴백 → 정확히 origin 루트로 redirect (negative-only tautology 방지)
    expect(location).toBe('http://localhost/');
  });
});
