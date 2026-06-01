/**
 * ResultCard 도메인 타입. Phase 55 D12 + ADR-014 정합 (5/22 LOCK).
 * Phase 60 #46 통합: ResultCardSnapshot 3 nested optional 추가 (articleFactScore + siftMapping + partialFailure).
 * Phase 67 #67: evidence string[] → EvidenceDto[] (breaking, T2 원자 커밋). ClaimCardSnapshot 신규.
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
import type { EvidenceDto } from '@06-entities/article'; // A1: 루트 배럴 경유(dep-cruiser R4). /api/* 직접 금지

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
  /** Phase 67: string[] → EvidenceDto[] (breaking). BE EvidenceDto 1:1 매핑. */
  evidence?: EvidenceDto[];
  /** Phase 67: Tier2 per-claim BE 원문 disclaimer. */
  disclaimer?: string;
}

export interface ContextSnapshot {
  summary?: string;
  relatedArticles?: RelatedArticleRef[];
  sourceCount?: number;
}

/**
 * Claim 인용 표기 sub-component (#49 phase 63) — attribution 보존 (M-3, FM12).
 * BE 매핑 예정: claims.is_quoted_claim / speaker_name / original_context (S3-09 BE #76, 별 phase).
 * isQuotedClaim true일 때만 화자 귀속 표기 + disclaimer 노출.
 */
export interface ClaimAttributionSnapshot {
  /** 인용 주장 여부. true면 화자 귀속 표기 + disclaimer. */
  isQuotedClaim: boolean;
  /** 주장 본문. 없거나 빈 문자열이면 skeleton. */
  claimText?: string;
  /** 화자 또는 주체명. isQuotedClaim일 때만 의미. 없으면 "인용된 주장" 폴백. */
  speakerName?: string;
  /** 인용 원문 맥락. details 펼치기로 노출 (선택). */
  originalContext?: string;
}

/**
 * Phase 67: claim 단위 카드 스냅샷. BE ClaimVerificationItemDto → build-snapshot 변환.
 * claims 모드(hasClaims=true) 시 result-card.widget.tsx가 ClaimCard[]로 렌더.
 */
export interface ClaimCardSnapshot {
  claimId: string;
  factCheck: FactCheckSnapshot;
  attribution?: ClaimAttributionSnapshot;
  /** Tier2 원문(factCheck.disclaimer와 동일값). ClaimCard 레벨에서도 접근 가능하도록 중복 저장. */
  disclaimer?: string;
}

/**
 * 검증 노후도 sub-component(#48 phase 62 widget, phase 64 wire).
 */
export interface FreshnessSnapshot {
  /**
   * 검증 시각(epoch ms). FreshnessBadge createdAtMs 입력.
   * 현재 임시로 article 추출 시각(createdAt) 프록시. BE verification_results.verified_at(#76) 랜딩 시 교체.
   */
  createdAtMs: number;
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
  /**
   * Phase 67: claim 단위 스냅샷 목록. 채워지면 claims 모드.
   * BE ClaimVerificationItemDto[] → buildResultCardSnapshot 변환 (T5).
   */
  claims?: ClaimCardSnapshot[];
  /** claim 인용 표기 sub-component (#49 phase 63) — 레거시(하위호환, claims 모드 비활성 시 사용). */
  claimAttribution?: ClaimAttributionSnapshot;
  /**
   * 검증 노후도(#48). 임시 프록시 article.createdAt 사용,
   * BE verification_results.verified_at(#76) 랜딩 시 교체.
   */
  freshness?: FreshnessSnapshot;
  /** 레거시 — claim별 진실성 라벨 (claims 모드 비활성 시). */
  factCheck?: FactCheckSnapshot;
  /** 레거시 — 맥락 (요약 + 관련 기사 + sourceCount). BE 기사 summary 없음 → claims 모드에서 미렌더(A8 유지). */
  context?: ContextSnapshot;
}
