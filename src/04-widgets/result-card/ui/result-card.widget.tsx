'use client';

import { cn } from '@/07-shared/lib/cn';
import type { ResultCardSnapshot } from '@04-widgets/result-card/model/types';
import { ContextSection } from '@04-widgets/result-card/ui/context-section';
import { FactCheckSection } from '@04-widgets/result-card/ui/fact-check-section';

interface Props {
  /** Sprint 4 실 데이터 연동 전까지는 undefined 또는 부분 채워진 값 허용 (skeleton). */
  snapshot?: ResultCardSnapshot;
  className?: string;
}

export function ResultCard({ snapshot, className }: Props) {
  return (
    <article
      aria-label="분석 결과"
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)] ambient-shadow',
        className
      )}
    >
      <FactCheckSection snapshot={snapshot?.factCheck} />
      <div
        role="separator"
        aria-orientation="horizontal"
        className="h-px bg-[var(--color-border-subtle)]"
      />
      <ContextSection snapshot={snapshot?.context} />
      <p className="px-[var(--spacing-24)] pb-[var(--spacing-16)] text-xs text-[var(--color-text-secondary)]">
        AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요.
      </p>
    </article>
  );
}
