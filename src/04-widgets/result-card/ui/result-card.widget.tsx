'use client';

import { cn } from '@/07-shared/lib/cn';
import { ArticleFactScore } from '@04-widgets/article-fact-score';
import { FreshnessBadge } from '@04-widgets/freshness-badge';
import { SiftMapping } from '@04-widgets/sift-mapping';
import { PartialFailureDisplay } from '@04-widgets/partial-failure-display';
import type { PartialFailureSnapshot } from '@04-widgets/partial-failure-display';
import type { ResultCardSnapshot } from '@04-widgets/result-card/model/types';
import { ClaimAttributionSection } from '@04-widgets/result-card/ui/claim-attribution-section';
import { ClaimCard } from '@04-widgets/result-card/ui/claim-card';
import { ContextSection } from '@04-widgets/result-card/ui/context-section';
import { FactCheckSection } from '@04-widgets/result-card/ui/fact-check-section';

interface Props {
  /** Sprint 4 통합 시 ResultCardSnapshot 직접 주입. undefined 시 6 sub-component 자체 skeleton. */
  snapshot?: ResultCardSnapshot;
  className?: string;
}

export function ResultCard({ snapshot, className }: Props) {
  // Phase 67 T4: claims 모드 분기.
  // hasClaims=true 시 ClaimCard 목록 렌더. context는 레거시 모드(!hasClaims)에서만.
  // A4: uniqueSourceCount는 BE 기사 단위 필드 없음 — sourceTransparency + EvidenceCard 단일출처 배지로 대체.
  // 레거시 모드에서만 context.sourceCount fallback 유지 (하위호환).
  const hasClaims = !!snapshot?.claims?.length;

  const mergedPartialFailure: PartialFailureSnapshot | undefined =
    snapshot?.partialFailure
      ? {
          ...snapshot.partialFailure,
          uniqueSourceCount:
            snapshot.partialFailure.uniqueSourceCount ??
            (!hasClaims ? snapshot.context?.sourceCount : undefined),
        }
      : undefined;

  return (
    <article
      aria-label="분석 결과"
      className={cn(
        // ambient-shadow는 src/app/globals.css 정의 (tokens.css 미등재, Round 1 M-1 amend 주석).
        // 외곽 padding 제거 (Round 1 CX-4 amend — 기존 FactCheckSection/ContextSection 자체 p-[var(--spacing-24)] 정합, 이중 padding 회피).
        'flex flex-col gap-[var(--spacing-16)] overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)] ambient-shadow',
        className
      )}
    >
      {snapshot?.freshness && (
        <div className="flex justify-end px-[var(--spacing-24)] pt-[var(--spacing-16)]">
          <FreshnessBadge createdAtMs={snapshot.freshness.createdAtMs} />
        </div>
      )}
      <ArticleFactScore snapshot={snapshot?.articleFactScore} />
      <SiftMapping snapshot={snapshot?.siftMapping} />
      <PartialFailureDisplay snapshot={mergedPartialFailure} />
      {hasClaims ? (
        snapshot!.claims!.map((c, i) => (
          <ClaimCard key={c.claimId} claim={c} index={i + 1} />
        ))
      ) : (
        <>
          <ClaimAttributionSection snapshot={snapshot?.claimAttribution} />
          <FactCheckSection snapshot={snapshot?.factCheck} />
        </>
      )}
      {!hasClaims && <ContextSection snapshot={snapshot?.context} />}
      <p className="px-[var(--spacing-24)] pb-[var(--spacing-16)] text-xs text-[var(--color-text-secondary)]">
        AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요.
      </p>
    </article>
  );
}
