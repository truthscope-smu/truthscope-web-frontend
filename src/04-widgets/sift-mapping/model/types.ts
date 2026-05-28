/**
 * SIFT 4단계 매핑 widget 도메인 타입. ADR-020 정합.
 *
 * BE 매핑: core/.../scoring/{SourceTransparencyBand,SourceTransparencySummary}.java
 * - SourceTransparencyBand: 3종 enum (ALL_EXPLICIT / SOME_UNCLEAR / MISSING_SOURCE).
 * - SourceTransparencySummary: band + 3 count (explicit/ambiguous/none).
 *
 * SIFT 4단계 책임 분리:
 * - S (Stop): 정적 안내 배지 (별도 데이터 없음).
 * - I (Investigate): SourceTransparencySummary 매핑.
 * - F (Find): cross-source 결과 (Tier 1/2 + adapter 다양성).
 * - T (Trace): attribution 링크 list (ADR-020 결정 1).
 *   - 시스템 자동 맥락 정확성 판정 금지 (ADR-020 결정 2).
 */
export type SourceTransparencyBand =
  | 'ALL_EXPLICIT'
  | 'SOME_UNCLEAR'
  | 'MISSING_SOURCE';

export interface SiftMappingSnapshot {
  /** I: Investigate the source — BE SourceTransparencySummary 매핑. */
  sourceTransparency?: {
    band: SourceTransparencyBand;
    explicitCount: number;
    ambiguousCount: number;
    noneCount: number;
  };
  /** F: Find better coverage — Tier 1/2 결과 + adapter 다양성. */
  crossSource?: {
    tier1Count: number;
    tier2Count: number;
    adapterDiversity: number;
  };
  /** T: Trace claims to origin — attribution 링크 list (ADR-020 결정 1). */
  attributionLinks?: Array<{
    url: string;
    label: string;
  }>;
}
