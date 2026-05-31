// 서버 컴포넌트 전용. config 경유(process.env 직접접근 금지 규칙 정합).
// A1: 외부는 루트 배럴로 import(dep-cruiser R4). plain fetch+config만이라 client 오염 없음.
// api-patterns "fetch 직접 금지" 예외: 서버 컴포넌트는 cache:'no-store' 제어 필요 +
//   apiClient(브라우저 wrapper)는 404→null 분기 불가. URL은 config 경유로 규칙 정합.
import { config } from '@/07-shared/config/config';
import { AppError } from '@/07-shared/errors';
import type { ArticleVerificationResponse } from '@06-entities/article/api/verification-dto'; // slice 내부 — R4 허용(dep-cruiser), ESLint fsd/no-relative-imports는 절대경로 요구

/**
 * BE GET /api/v1/articles/{articleId}/verification 조회.
 * 404 → null (미존재/미검증).
 * 비2xx → Error throw (page error.tsx 처리).
 */
export async function findArticleVerification(
  articleId: string
): Promise<ArticleVerificationResponse | null> {
  const res = await fetch(
    `${config.api.baseUrl}/articles/${articleId}/verification`,
    { cache: 'no-store' }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new AppError('검증 조회 실패', res.status);
  return res.json() as Promise<ArticleVerificationResponse>;
}
