/**
 * ResultCard 도메인 타입. Phase 55 D12 + ADR-014 정합 (5/22 LOCK).
 *
 * - TruthLabel 5종: claim score 산출 가능 시 도출 (Phase 55 deriveTruthLabel).
 * - ClaimScoreStatus 3종: claim score 산출 불가 시 별도 상태 (verdict 5종 중 비판정).
 *
 * BE 매핑: truthscope-web-backend/core/.../scoring/{TruthLabel,ClaimScoreStatus}.java
 * ADR-014 §5: FE에서 신규 enum 생성 금지, BE 도출값 직접 매핑.
 */

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
  factCheck?: FactCheckSnapshot;
  context?: ContextSnapshot;
}
