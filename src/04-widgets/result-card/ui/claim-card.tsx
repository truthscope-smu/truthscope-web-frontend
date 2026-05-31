'use client';

import type { ClaimCardSnapshot } from '@04-widgets/result-card/model/types';
import { FactCheckSection } from '@04-widgets/result-card/ui/fact-check-section';
import { ClaimAttributionSection } from '@04-widgets/result-card/ui/claim-attribution-section';

interface Props {
  claim: ClaimCardSnapshot;
  /** 1-based claim 순번. aria 레이블에 사용. */
  index: number;
}

/**
 * Phase 67 T3: claim 단위 카드. border-t divider로 목록 구분.
 *
 * 구성:
 * - FactCheckSection: 판정 배지 + claim 텍스트 + evidence + Tier2 disclaimer (중복 금지)
 * - ClaimAttributionSection(hideClaimText): isQuotedClaim=true 시에만 표시.
 *   hideClaimText=true이면 FactCheckSection이 이미 claim 텍스트를 렌더하므로 attribution에서 미렌더.
 */
export function ClaimCard({ claim, index }: Props) {
  return (
    <div
      aria-label={`주장 ${index}`}
      className="border-t border-[var(--color-border-subtle)]"
    >
      <FactCheckSection snapshot={claim.factCheck} />
      {claim.attribution?.isQuotedClaim && (
        <ClaimAttributionSection snapshot={claim.attribution} hideClaimText />
      )}
    </div>
  );
}
