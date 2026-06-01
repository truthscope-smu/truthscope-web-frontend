'use client';

import { getSupabaseBrowserClient } from '@/07-shared/api/supabase/client';
import { toSafeRedirectPath } from '@/07-shared/lib';

export type SocialProvider = 'google' | 'kakao';

/**
 * 소셜 OAuth 로그인 시작함 (PKCE: Supabase → provider → /auth/callback?code=)
 * 브라우저 전용 — Server Component/Route Handler에서 호출 금지 (ui 레이어에서만 import)
 *
 * @param provider - 'google' 또는 'kakao'
 * @param nextPath - 로그인 완료 후 복귀 내부 경로 (기본 '/')
 * @returns 에러 메시지 문자열 또는 null(정상 시 provider redirect 발생)
 */
export async function signInWithSocialProvider(
  provider: SocialProvider,
  nextPath: string = '/'
): Promise<string | null> {
  const safePath = toSafeRedirectPath(nextPath);
  const supabase = getSupabaseBrowserClient();
  const origin = window.location.origin;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safePath)}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  return error ? error.message : null;
}
