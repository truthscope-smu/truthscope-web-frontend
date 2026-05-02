// W3 fix (2026-05-02): apiClient는 `@/07-shared/api/base` 직접 import.
// `@/07-shared/api` barrel은 supabase/server (next/headers 의존)를 re-export하므로
// barrel 경유 시 client component bundle에 server-only code 폴루션 (next build 실패).
// 기존 CheckMate 패턴 정합 — 05-features/analysis/api.ts:1 와 동일.
import { apiClient } from '@/07-shared/api/base';
import { fromAnalysisSession } from '@06-entities/article/api/mappers';
import type {
  ArticleExtractionRequest,
  ArticleExtractionResponse,
} from '@06-entities/article/api/dto';
import type { Article } from '@06-entities/article/model/article';

/**
 * rev.1 CX1-01 + rev.3 R3-04 fix: BE 실측 contract — `POST /analysis-sessions` 단일 endpoint.
 * ArticleExtractionResponse {sessionId, status} 반환 후 fromAnalysisSession으로 Article 합성.
 *
 * Q3 reframe: hybrid 분리에서 single backend adapter로 축소.
 * Phase 22+에 supabase.ts + findArticleById + requestAttachToSession 추가.
 */
export async function requestArticleExtraction(url: string): Promise<Article> {
  const response = await apiClient.post<
    ArticleExtractionResponse,
    ArticleExtractionRequest
  >('/analysis-sessions', { url });
  return fromAnalysisSession(url, response);
}

/**
 * Phase 22+ deferred — BE ArticleController 작성 후 도입.
 *
 * export async function findArticleById(id: string): Promise<Article> {
 *   const dto = await apiClient.get<ArticleBackendDto>(`/articles/${id}`);
 *   return fromBackendDto(dto);
 * }
 *
 * export async function requestAttachToSession(
 *   articleId: string,
 *   sessionId: string,
 * ): Promise<Article> {
 *   const dto = await apiClient.post<ArticleBackendDto, { sessionId: string }>(
 *     `/articles/${articleId}/attach`,
 *     { sessionId },
 *   );
 *   return fromBackendDto(dto);
 * }
 */
