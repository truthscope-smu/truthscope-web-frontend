/**
 * ArticleFactScore widget 도메인 타입. ADR-019 + Phase 55 정합.
 *
 * BE 매핑: truthscope-web-backend/core/.../scoring/{ArticleFactScore,CoverageSummary}.java
 * - ArticleFactScore(value): 0..100 정수 (검증 가능 claim 존재 시).
 * - CoverageSummary(scorableCount, excludedCount, ...): 검증 가능 + 제외 count.
 *
 * value undefined = aggregateArticleFactScore가 Optional.empty 반환 = "검증 가능 주장 없음" 상태.
 */
export interface ArticleFactScoreSnapshot {
  /** 0..100 정수. undefined일 때 "검증 가능 주장 없음" 표시 (BE Optional.empty). */
  value?: number;
  /** 검증 가능 claim 수 (CoverageSummary.scorableCount). */
  scorableCount?: number;
  /** 전체 claim 수 (scorableCount + excludedCount). coverage "N개 중 M개 기준" 텍스트 생성용. */
  totalClaimCount?: number;
}
