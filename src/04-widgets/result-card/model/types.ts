/**
 * ResultCard 도메인 타입. Phase 55 D12 + ADR-014 정합 (5/22 LOCK).
 * Phase 60 #46 통합: ResultCardSnapshot 3 nested optional 추가 (articleFactScore + siftMapping + partialFailure).
 *
 * - TruthLabel 5종: claim score 산출 가능 시 도출 (Phase 55 deriveTruthLabel).
 * - ClaimScoreStatus 3종: claim score 산출 불가 시 별도 상태 (verdict 5종 중 비판정).
 *
 * BE 매핑: truthscope-web-backend/core/.../scoring/{TruthLabel,ClaimScoreStatus}.java
 * ADR-014 §5: FE에서 신규 enum 생성 금지, BE 도출값 직접 매핑.
 */

import type { ArticleFactScoreSnapshot } from '@04-widgets/article-fact-score';
import type { SiftMappingSnapshot } from '@04-widgets/sift-mapping';
import type { PartialFailureSnapshot } from '@04-widgets/partial-failure-display';

/**
 * 진실성 5종 (claim score 0..100 밴딩에서 도출).
 * 정세린 딥리서치 + Sprint 2 Q1 정합 + codex thread 019e4af1 2라운드 + 사용자 승인.
 */
export type TruthLabel =
  | 'FACT'
  | 'MOSTLY_FACT'
  | 'PARTLY_FACT'
  | 'MOSTLY_NOT_FACT'
  | 'NOT_FACT';

/**
 * 비판정 3종 (claim score 산출 불가, NULL score).
 * verdict 5종(SUPPORTED/CONTRADICTED/INSUFFICIENT/TIME_SENSITIVE/OUT_OF_SCOPE) 중
 * 비판정 영역. SUPPORTED/CONTRADICTED는 TruthLabel로 도출됨.
 */
export type ClaimScoreStatus =
  | 'INSUFFICIENT'
  | 'TIME_SENSITIVE'
  | 'OUT_OF_SCOPE';

export interface RelatedArticleRef {
  id: string;
  title: string;
  source?: string;
}

export interface FactCheckSnapshot {
  /** claim score 산출 가능 시 도출 라벨 (TruthLabel 5종). status와 mutually exclusive. */
  truthLabel?: TruthLabel;
  /** claim score 산출 불가 시 상태 (비판정 3종). truthLabel과 mutually exclusive. */
  status?: ClaimScoreStatus;
  /** 0-100. TruthLabel일 때만 의미. status일 때 NULL ("모르면 모른다" 원칙). */
  confidence?: number;
  claim?: string;
  evidence?: string[];
}

export interface ContextSnapshot {
  summary?: string;
  relatedArticles?: RelatedArticleRef[];
  sourceCount?: number;
}

export interface ResultCardSnapshot {
  /**
   * N-1 sub-component (#41 phase 57 DONE) — 기사 종합 점수.
   * 시그니처: value? + scorableCount? + totalClaimCount? 3 필드 only (Round 1 C-1/CX-1 amend).
   * BE 매핑: core/scoring/ArticleFactScore.value (0..100 정수, Optional.empty 시 undefined).
   */
  articleFactScore?: ArticleFactScoreSnapshot;
  /** N-3 sub-component (#42 phase 58 DONE) — SIFT 4단계 매핑. */
  siftMapping?: SiftMappingSnapshot;
  /**
   * N-5 sub-component (#44 phase 59 DONE) — 부분 실패 표시.
   * coverage 필드는 CoverageSummary 8 필드 중 reason 3 + tier 3 = 6 필드 projection (Round 1 CX-2 명시 박제).
   * scorableCount/excludedCount는 derive 가능하므로 widget 노출 제외.
   */
  partialFailure?: PartialFailureSnapshot;
  /** 기존 — claim별 진실성 라벨. */
  factCheck?: FactCheckSnapshot;
  /** 기존 — 맥락 (요약 + 관련 기사 + sourceCount). */
  context?: ContextSnapshot;
}
