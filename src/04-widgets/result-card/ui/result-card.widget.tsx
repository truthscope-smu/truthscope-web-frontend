'use client';

import { cn } from '@/07-shared/lib/cn';
import { ArticleFactScore } from '@04-widgets/article-fact-score';
import { SiftMapping } from '@04-widgets/sift-mapping';
import { PartialFailureDisplay } from '@04-widgets/partial-failure-display';
import type { PartialFailureSnapshot } from '@04-widgets/partial-failure-display';
import type { ResultCardSnapshot } from '@04-widgets/result-card/model/types';
import { ClaimAttributionSection } from '@04-widgets/result-card/ui/claim-attribution-section';
import { ContextSection } from '@04-widgets/result-card/ui/context-section';
import { FactCheckSection } from '@04-widgets/result-card/ui/fact-check-section';

interface Props {
  /** Sprint 4 통합 시 ResultCardSnapshot 직접 주입. undefined 시 6 sub-component 자체 skeleton. */
  snapshot?: ResultCardSnapshot;
  className?: string;
}

export function ResultCard({ snapshot, className }: Props) {
  // Q4 uniqueSourceCount fallback mapping (DISCUSS Q4 정합 — ContextSnapshot.sourceCount 재사용).
  // useMemo 제거 (Round 1 CX-3 amend — 계산 싸고 deps shallow equality 함정 회피).
  const mergedPartialFailure: PartialFailureSnapshot | undefined =
    snapshot?.partialFailure
      ? {
          ...snapshot.partialFailure,
          uniqueSourceCount:
            snapshot.partialFailure.uniqueSourceCount ??
            snapshot.context?.sourceCount,
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
      <ArticleFactScore snapshot={snapshot?.articleFactScore} />
      <SiftMapping snapshot={snapshot?.siftMapping} />
      <ClaimAttributionSection snapshot={snapshot?.claimAttribution} />
      <FactCheckSection snapshot={snapshot?.factCheck} />
      <PartialFailureDisplay snapshot={mergedPartialFailure} />
      <ContextSection snapshot={snapshot?.context} />
      <p className="px-[var(--spacing-24)] pb-[var(--spacing-16)] text-xs text-[var(--color-text-secondary)]">
        AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요.
      </p>
    </article>
  );
}
