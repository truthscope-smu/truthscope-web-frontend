export type StalenessHint = 'fresh' | 'stable' | 'aging' | 'stale' | 'expired';

export interface FreshnessBadgeProps {
  /** 검증 완료 시각 (epoch ms). BE verification_results.verified_at 매핑 예정 (Phase 64). */
  createdAtMs: number;
  /** 테스트/SSR 주입용. 기본값 런타임 Date.now(). */
  nowMs?: number;
}
