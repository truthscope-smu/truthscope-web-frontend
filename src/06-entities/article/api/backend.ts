// W3 fix (2026-05-02): apiClient는 `@/07-shared/api/base` 직접 import.
// `@/07-shared/api` barrel은 supabase/server (next/headers 의존)를 re-export하므로
// barrel 경유 시 client component bundle에 server-only code 폴루션 (next build 실패).
// 기존 TruthScope 패턴 정합 — 05-features/analysis/api.ts:1 와 동일.
import { apiClient } from '@/07-shared/api/base';
import {
  fromAnalysisSession,
  fromBackendDto,
} from '@06-entities/article/api/mappers';
import type {
  ArticleBackendDto,
  ArticleExtractionRequest,
  ArticleExtractionResponse,
} from '@06-entities/article/api/dto';
import type { Article } from '@06-entities/article/model/article';

/**
 * rev.7 P21-5-1: BE PR #29 6ad70ec articleId 노출.
 * `POST /analysis-sessions` 응답 {sessionId, status, articleId} → fromAnalysisSession으로 Article 합성.
 *
 * #45 (ADR-025): 키리스(BYOK 미설정) 분석은 same-origin Edge 프록시를 경유한다
 * (baseUrl '' → /api/proxy/analysis-sessions). 프록시가 X-User-Gemini-Key 없이
 * BE로 중계하고 BE가 서버 기본 키로 fallback한다. 응답은 프록시가 status+body 그대로
 * 패스스루하므로 ArticleExtractionResponse 매핑은 영향받지 않는다.
 */
export async function requestArticleExtraction(url: string): Promise<Article> {
  const response = await apiClient.post<
    ArticleExtractionResponse,
    ArticleExtractionRequest
  >('/api/proxy/analysis-sessions', { url }, { baseUrl: '' });
  return fromAnalysisSession(url, response);
}

/**
 * rev.7 P4: BE PR #28 d9b6168 ArticleController 머지 후 활성화.
 * GET /api/v1/articles/{id} → ArticleResponse → Article 합성.
 * BE auto-attach 정책으로 응답 status는 항상 ATTACHED.
 */
export async function findArticleById(id: string): Promise<Article> {
  const dto = await apiClient.get<ArticleBackendDto>(`/articles/${id}`);
  return fromBackendDto(dto);
}

/**
 * rev.7 P4 + A4 reframe: BE PR #28 + auto-attach 정책 실측 결과.
 * BE Article.extract().attachTo(session) 즉시 부착으로 추가 호출은 무조건 409 ConflictException.
 * apiClient가 `AppError`로 변환 (status 409, message "이 기사는 이미 분석 세션에 부착되어 있습니다").
 * W3-3 AttachButton (정세린 owner)이 호출 → 항상 catch → user-facing 409 UX 시연.
 * 학습 가치 = aggregate lifecycle invariant 시각화.
 */
export async function requestAttachToSession(
  articleId: string,
  sessionId: string
): Promise<Article> {
  const dto = await apiClient.post<ArticleBackendDto, { sessionId: string }>(
    `/articles/${articleId}/attach`,
    { sessionId }
  );
  return fromBackendDto(dto);
}
