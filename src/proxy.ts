import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/07-shared/api/supabase/middleware';
import { toSafeRedirectPath } from '@/07-shared/lib';

/**
 * Next.js 16 Proxy (구 middleware) — Supabase 세션 갱신 + /history 인증 가드함
 * 미인증 사용자의 /history 접근 시 /login?next=로 redirect
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  // 정확 매칭 — /history-foo 같은 비대상 경로 오보호 방지 (codex 권고)
  const isHistory = pathname === '/history' || pathname.startsWith('/history/');
  if (isHistory && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', toSafeRedirectPath(pathname));
    const redirectResponse = NextResponse.redirect(loginUrl);
    // updateSession이 갱신한 세션 쿠키를 redirect 응답에 복사함 (세션 손실 방지)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
