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
 * rev.2 CX2-01 + rev.3 R3-04/CX3-03 fix: Phase 21 BE 실측 contract.
 * `POST /analysis-sessions` 응답 — entity api 측 명명 (`05-features/analysis`의 AnalysisResponse와 동명 회피).
 * articleStatus 직접 반환 안 함 — fromAnalysisSession이 sessionStatus → articleStatus 매핑.
 */
export interface ArticleExtractionResponse {
  sessionId: string;
  status: AnalysisSessionStatus; // 명시적 SessionStatus 타입 (cast 불필요)
}

export interface ArticleExtractionRequest {
  url: string;
}

/**
 * Phase 22+ deferred — BE ArticleController 작성 시 도입.
 * 본 phase에서는 사용 안 함.
 */
export type ArticleBackendDto = {
  id: string;
  url: string;
  title: string;
  content: string;
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
