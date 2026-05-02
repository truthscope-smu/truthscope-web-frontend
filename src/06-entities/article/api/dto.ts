import type { ArticleStatus } from '@06-entities/article/model/article';

/**
 * rev.2 CX2-01 fix: BE `AnalysisSession.status` enum과 FE Article aggregate `status`는 별개 도메인.
 * BE SessionStatus (5개): PENDING | EXTRACTING | ANALYZING | COMPLETED | FAILED
 * FE ArticleStatus (2개): EXTRACTED | ATTACHED
 *
 * BE의 SessionStatus는 분석 파이프라인 진행 단계 — process state.
 * FE의 ArticleStatus는 Article aggregate의 lifecycle — domain state.
 * 두 개념을 같은 type으로 cast하면 silent corruption (article.status === 'EXTRACTED' 조건 깨짐).
 */
export type AnalysisSessionStatus =
  | 'PENDING'
  | 'EXTRACTING'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED';

/**
 * rev.7 P21-5-1: BE PR #29 6ad70ec 머지 후 articleId 노출.
 * `POST /analysis-sessions` 응답 shape에 articleId 추가 — FE attach wiring unblock.
 */
export interface ArticleExtractionResponse {
  sessionId: string;
  status: AnalysisSessionStatus;
  articleId: string; // rev.7 P21-5-1: BE PR #29에서 노출
}

export interface ArticleExtractionRequest {
  url: string;
}

/**
 * rev.7 P4: BE PR #28 d9b6168 ArticleController 머지 후 활성화.
 * GET /api/v1/articles/{id} + POST /api/v1/articles/{id}/attach 응답 shape.
 * BE auto-attach 정책으로 status는 항상 ATTACHED (실측).
 */
export type ArticleBackendDto = {
  id: string;
  url: string;
  title: string | null; // BE는 추출 진행 중이면 null
  content: string | null;
  status: ArticleStatus;
  sessionId: string | null;
  createdAt: string;
};

/**
 * Phase 22+ deferred — Supabase article 테이블 read 시 도입.
 */
export type SupabaseArticleRow = {
  id: string;
  url: string;
  title: string;
  content: string;
  status: ArticleStatus;
  session_id: string | null;
  created_at: string;
};
