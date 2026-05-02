import {
  Article,
  type ArticleStatus,
} from '@06-entities/article/model/article';
import { InvariantViolationError } from '@06-entities/article/model/errors';
import type {
  ArticleExtractionResponse,
  AnalysisSessionStatus,
} from '@06-entities/article/api/dto';

/**
 * rev.3 CX3-01 fix: BE 실측 성공 응답은 `EXTRACTING` (분석 시작 후 진행 중).
 * AnalysisTransactionService가 `Article.extract(...).attachTo(session)` 저장 후
 * `session.updateStatus(EXTRACTING)`을 반환하므로 정상 성공 = EXTRACTING.
 *
 * 매핑 정책:
 * - EXTRACTING → EXTRACTED (Article preview 가용 — Phase 21 success path)
 * - COMPLETED → EXTRACTED (BE 분석 완료, 동일 처리)
 * - PENDING / ANALYZING → throw InvariantViolationError (진행 중, form polling/알림 처리)
 * - FAILED → throw InvariantViolationError (실패, user 재시도 안내)
 *
 * Phase 21 IN scope: EXTRACTING/COMPLETED 처리 (BE PR #27 동기 흐름 + 미래 async 호환).
 */
function mapSessionStatusToArticleStatus(
  sessionStatus: AnalysisSessionStatus
): ArticleStatus {
  switch (sessionStatus) {
    case 'EXTRACTING':
    case 'COMPLETED':
      return 'EXTRACTED';
    case 'PENDING':
    case 'ANALYZING':
      throw new InvariantViolationError(
        '분석을 시작했습니다. 잠시 후 다시 확인해주세요.'
      );
    case 'FAILED':
      throw new InvariantViolationError(
        '분석에 실패했습니다. URL을 다시 확인해주세요.'
      );
    default:
      throw new InvariantViolationError(
        `알 수 없는 분석 상태: ${sessionStatus}`
      );
  }
}

/**
 * rev.2 CX2-01 fix: BE 실측 contract (AnalysisResponse) → Article 합성 with status guard.
 * sessionStatus 매핑 실패 시 InvariantViolationError throw — form catch에서 user feedback.
 */
export function fromAnalysisSession(
  url: string,
  response: ArticleExtractionResponse
): Article {
  const articleStatus = mapSessionStatusToArticleStatus(response.status);
  return Article.fromAnalysisSession({
    url,
    sessionId: response.sessionId,
    status: articleStatus,
  });
}

/**
 * Phase 22+ deferred — BE ArticleController endpoint 작성 후 도입.
 *
 * export function fromBackendDto(dto: ArticleBackendDto): Article { ... }
 * export function fromSupabaseRow(row: SupabaseArticleRow): Article { ... }
 */
