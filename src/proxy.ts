import { type NextRequest } from 'next/server';
import { updateSession } from '@/07-shared/api/supabase/middleware';

/**
 * Next.js 16+: 요청 경계는 `src/proxy.ts`의 `proxy`가 담당합니다(구 `middleware` 명칭 대체).
 * Supabase SSR 세션 갱신 — 공식 가이드의 `updateSession` 패턴과 동일합니다.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
