import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * social-auth.ts — signInWithSocialProvider 단위 테스트
 * Supabase 클라이언트 vi.mock 격리
 */

const mockSignInWithOAuth = vi.fn();

vi.mock('@/07-shared/api/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

import { signInWithSocialProvider } from './social-auth';

// window.location.origin 설정
Object.defineProperty(window, 'location', {
  value: { origin: 'https://example.com' },
  writable: true,
});

describe('signInWithSocialProvider', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockReset();
    mockSignInWithOAuth.mockResolvedValue({
      error: null,
      data: { provider: 'google', url: '' },
    });
  });

  it('google provider로 signInWithOAuth를 호출함', async () => {
    await signInWithSocialProvider('google', '/history');

    expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    const callArg = mockSignInWithOAuth.mock.calls[0]?.[0];
    expect(callArg.provider).toBe('google');
  });

  it('kakao provider로 signInWithOAuth를 호출함', async () => {
    await signInWithSocialProvider('kakao', '/history');

    expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    const callArg = mockSignInWithOAuth.mock.calls[0]?.[0];
    expect(callArg.provider).toBe('kakao');
  });

  it('redirectTo에 안전한 next 경로가 포함됨', async () => {
    await signInWithSocialProvider('google', '/history');

    const callArg = mockSignInWithOAuth.mock.calls[0]?.[0];
    const redirectTo: string = callArg.options.redirectTo;
    expect(redirectTo).toContain('/auth/callback');
    expect(redirectTo).toContain(encodeURIComponent('/history'));
  });

  it('위험한 next 경로는 /로 정규화되어 redirectTo에 포함됨', async () => {
    await signInWithSocialProvider('google', '//evil.com');

    const callArg = mockSignInWithOAuth.mock.calls[0]?.[0];
    const redirectTo: string = callArg.options.redirectTo;
    // //evil.com은 차단되어 / 로 폴백됨
    expect(redirectTo).not.toContain('evil.com');
  });

  it('기본 nextPath는 /임', async () => {
    await signInWithSocialProvider('google');

    const callArg = mockSignInWithOAuth.mock.calls[0]?.[0];
    const redirectTo: string = callArg.options.redirectTo;
    // next=%2F 뒤에 아무것도 없어야 기본값('/')만 통과, '/history' 등은 실패
    expect(redirectTo).toMatch(/next=%2F$/);
  });

  it('에러 발생 시 에러 메시지 문자열을 반환함', async () => {
    mockSignInWithOAuth.mockResolvedValue({
      error: { message: 'OAuth 오류', name: 'AuthError', status: 400 },
      data: { provider: 'google', url: '' },
    });

    const result = await signInWithSocialProvider('google', '/');

    expect(result).toBe('OAuth 오류');
  });

  it('정상 시 null을 반환함', async () => {
    mockSignInWithOAuth.mockResolvedValue({
      error: null,
      data: { provider: 'google', url: '' },
    });

    const result = await signInWithSocialProvider('google', '/');

    expect(result).toBeNull();
  });
});
