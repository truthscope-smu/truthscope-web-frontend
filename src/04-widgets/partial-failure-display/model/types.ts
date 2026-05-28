/**
 * 부분 실패 + 신뢰도 분리 표시 widget 도메인 타입.
 * 면담 D-D(부분 실패 투명 표시) + sprint-4-amendment N-5 정합.
 *
 * BE 매핑:
 * - coverage: core/scoring/CoverageSummary.java
 * - sourceTransparency: core/scoring/SourceTransparencySummary.java
 * - uniqueSourceCount: BE 정본 미존재 — #46 통합 phase에서 cascade source_count 집계 파생 매핑.
 *
 * 부재 시 fallback (절충안 A' 안전 contract):
 * - coverage 부재 → skeleton.
 * - sourceTransparency 부재 → I 섹션 hide.
 * - uniqueSourceCount 부재 → 단일 출처 경고 섹션 hide (placeholder 노출 회피).
 *
 * Optional 필드 의미 (CX-4 정합):
 * - exactOptionalPropertyTypes 미설정 환경 (tsconfig.json strict=true / 미설정).
 * - 따라서 `uniqueSourceCount: undefined`와 필드 부재(absent)를 동일 처리.
 * - 본 widget의 분기 조건 `=== undefined` 또는 `=== 1` 만 검사 — 양쪽 모두 안전.
 */

export type Tier3Reason = 'INSUFFICIENT' | 'TIME_SENSITIVE' | 'OUT_OF_SCOPE';

export type SourceTransparencyBand =
  | 'ALL_EXPLICIT'
  | 'SOME_UNCLEAR'
  | 'MISSING_SOURCE';

/**
 * 사유 row 키 — `CoverageSummary` 사유별 count 3개 한정 (tier1/2/3Count 제외).
 * REASON_ROWS narrowing + Tier3Reason 매핑 bridge용 (Round 1 CX-2 + CX-3 정합).
 */
export type ReasonCountKey =
  | 'insufficientCount'
  | 'timeSensitiveCount'
  | 'outOfScopeCount';

export interface PartialFailureSnapshot {
  coverage?: {
    insufficientCount: number;
    timeSensitiveCount: number;
    outOfScopeCount: number;
    tier1Count: number;
    tier2Count: number;
    tier3Count: number;
  };
  sourceTransparency?: {
    band: SourceTransparencyBand;
    explicitCount: number;
    ambiguousCount: number;
    noneCount: number;
  };
  uniqueSourceCount?: number;
}
