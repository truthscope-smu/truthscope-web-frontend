'use client';

import { useId } from 'react';
import { cn } from '@/07-shared/lib/cn';
import type { ContextSnapshot } from '@04-widgets/result-card/model/types';

interface Props {
  snapshot?: ContextSnapshot;
  className?: string;
}

export function ContextSection({ snapshot, className }: Props) {
  const titleId = useId();
  const hasRelated = !!snapshot?.relatedArticles?.length;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col gap-[var(--spacing-16)] p-[var(--spacing-24)]',
        className
      )}
    >
      <header className="flex items-center justify-between gap-[var(--spacing-16)]">
        <h3
          id={titleId}
          className="text-[var(--color-text-heading)] text-lg font-semibold"
        >
          맥락
        </h3>
        {typeof snapshot?.sourceCount === 'number' && (
          <span
            aria-label={`출처 ${snapshot.sourceCount}개`}
            className="inline-flex items-center gap-[var(--spacing-6)] rounded-full bg-brand-subtle px-[var(--spacing-10)] py-[var(--spacing-6)] text-xs font-medium text-brand-primary"
          >
            <span aria-hidden="true">⊞</span>
            출처 {snapshot.sourceCount}
          </span>
        )}
      </header>

      <div className="flex flex-col gap-[var(--spacing-10)]">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
          요약
        </p>
        {snapshot?.summary ? (
          <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">
            {snapshot.summary}
          </p>
        ) : (
          <SkeletonLines lines={3} />
        )}
      </div>

      <div className="flex flex-col gap-[var(--spacing-10)]">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
          관련 기사
        </p>
        {hasRelated ? (
          <ul className="flex flex-col gap-[var(--spacing-8)]">
            {snapshot!.relatedArticles!.map((article) => (
              <li
                key={article.id}
                className="flex items-start justify-between gap-[var(--spacing-10)] rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)] p-[var(--spacing-10)]"
              >
                <p className="text-[var(--color-text-primary)] text-sm leading-snug">
                  {article.title}
                </p>
                {article.source && (
                  <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                    {article.source}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <ul
            aria-hidden="true"
            className="flex flex-col gap-[var(--spacing-8)]"
          >
            {Array.from({ length: 2 }).map((_, i) => (
              <li
                key={i}
                className="h-12 animate-pulse rounded-md bg-[var(--color-bg-surface-sunken)]"
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function SkeletonLines({ lines }: { lines: number }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-[var(--spacing-8)]">
      {Array.from({ length: lines }).map((_, i) => (
        <span
          key={i}
          className="block h-3 animate-pulse rounded bg-[var(--color-bg-surface-sunken)]"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}
