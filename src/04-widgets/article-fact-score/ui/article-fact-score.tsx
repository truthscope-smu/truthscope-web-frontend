'use client';

import { useId } from 'react';
import { cn } from '@/07-shared/lib/cn';
import type { ArticleFactScoreSnapshot } from '@04-widgets/article-fact-score/model/types';

interface Props {
  snapshot?: ArticleFactScoreSnapshot;
  className?: string;
}

const SCORE_LABEL = '검증 가능 주장 기준 종합 점수';
const EMPTY_LABEL = '검증 가능 주장 없음';
const EMPTY_CAPTION = '기사 종합 점수 산출 불가';

export function ArticleFactScore({ snapshot, className }: Props) {
  const titleId = useId();

  if (!snapshot) {
    return <ArticleFactScoreSkeleton className={className} />;
  }

  const hasScore = typeof snapshot.value === 'number';
  const hasCoverage =
    typeof snapshot.scorableCount === 'number' &&
    typeof snapshot.totalClaimCount === 'number';

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col items-center gap-[var(--spacing-8)] rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)] p-[var(--spacing-24)] text-center',
        className
      )}
    >
      {hasScore ? (
        <>
          <strong
            id={titleId}
            aria-label={`${SCORE_LABEL} ${snapshot.value}점`}
            className="text-[68px] font-semibold leading-none text-[var(--color-action-hero)] tabular-nums"
          >
            {snapshot.value}
          </strong>
          <span className="text-xs text-[var(--color-text-secondary)]">
            {SCORE_LABEL}
          </span>
          {hasCoverage && (
            <span
              aria-label={`검증 가능 주장 ${snapshot.totalClaimCount}개 중 ${snapshot.scorableCount}개 기준`}
              className="text-xs text-[var(--color-text-secondary)] tabular-nums"
            >
              검증 가능 {snapshot.totalClaimCount}개 중 {snapshot.scorableCount}
              개 기준
            </span>
          )}
        </>
      ) : (
        <>
          <strong
            id={titleId}
            className="text-[28px] font-semibold text-[var(--color-text-primary)]"
          >
            {EMPTY_LABEL}
          </strong>
          <span className="text-xs text-[var(--color-text-secondary)]">
            {EMPTY_CAPTION}
          </span>
        </>
      )}
    </section>
  );
}

function ArticleFactScoreSkeleton({ className }: { className?: string }) {
  return (
    <section
      aria-hidden="true"
      className={cn(
        'flex flex-col items-center gap-[var(--spacing-8)] rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)] p-[var(--spacing-24)]',
        className
      )}
    >
      <span className="block h-[68px] w-[100px] animate-pulse rounded bg-[var(--color-bg-surface-sunken)]" />
      <span className="block h-3 w-[200px] animate-pulse rounded bg-[var(--color-bg-surface-sunken)]" />
      <span className="block h-3 w-[160px] animate-pulse rounded bg-[var(--color-bg-surface-sunken)]" />
    </section>
  );
}
