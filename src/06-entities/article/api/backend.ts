import { apiClient } from '@/07-shared/api';
import { fromAnalysisSession } from '@06-entities/article/api/mappers';
import type {
  ArticleExtractionRequest,
  ArticleExtractionResponse,
} from '@06-entities/article/api/dto';
import type { Article } from '@06-entities/article/model/article';

/**
 * rev.1 CX1-01 + rev.3 R3-04/R3-09 fix: BE 실측 contract — `POST /analysis-sessions` 단일 endpoint.
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
