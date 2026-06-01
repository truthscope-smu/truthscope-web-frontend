import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/07-shared/api/supabase/server';
import { toSafeRedirectPath } from '@/07-shared/lib';

/**
 * Supabase PKCE 콜백 처리함
 * error 먼저 검사 → code 교환 → 세션 쿠키 set → next redirect
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url);
  const next = toSafeRedirectPath(searchParams.get('next'));

  // 1. OAuth provider error 우선 검사 (RFC 6749)
  if (searchParams.get('error')) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'oauth_cancelled');
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  // 2. code 없으면 /login
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  // 3. PKCE code 교환 (code_verifier 쿠키는 SDK가 자동 검증)
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'auth_failed');
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, origin));
}
