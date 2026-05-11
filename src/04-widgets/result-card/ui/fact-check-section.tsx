'use client';

import { cn } from '@/07-shared/lib/cn';
import type {
  FactCheckSnapshot,
  Verdict,
} from '@04-widgets/result-card/model/types';

interface VerdictDisplay {
  label: string;
  icon: string;
  tone: 'success' | 'error' | 'info' | 'subtle' | 'neutral';
}

const VERDICT_DISPLAY: Record<Verdict, VerdictDisplay> = {
  TRUE: { label: '사실', icon: '✓', tone: 'success' },
  PARTIAL: { label: '부분 사실', icon: '◑', tone: 'subtle' },
  FALSE: { label: '거짓', icon: '✕', tone: 'error' },
  UNVERIFIED: { label: '검증 불가', icon: '?', tone: 'neutral' },
  PENDING: { label: '검증 중', icon: '⋯', tone: 'info' },
};

const TONE_CLASS: Record<VerdictDisplay['tone'], string> = {
  success:
    'bg-[var(--color-success-subtle)] text-[var(--color-success-strong)] ring-[var(--color-success-strong)]/30',
  error:
    'bg-[var(--color-error-subtle)] text-[var(--color-error)] ring-[var(--color-error)]/30',
  info: 'bg-[var(--color-blue-50)] text-[var(--color-info)] ring-[var(--color-info)]/30',
  subtle: 'bg-brand-subtle text-brand-primary ring-brand-primary/30',
  neutral:
    'bg-[var(--color-bg-surface-sunken)] text-[var(--color-text-secondary)] ring-[var(--color-border-subtle)]',
};

interface Props {
  snapshot?: FactCheckSnapshot;
  className?: string;
}

export function FactCheckSection({ snapshot, className }: Props) {
  const verdict = snapshot?.verdict;
  const display = verdict ? VERDICT_DISPLAY[verdict] : null;

  return (
    <section
      aria-labelledby="result-card-fact-check-title"
      className={cn(
        'flex flex-col gap-[var(--spacing-16)] p-[var(--spacing-24)]',
        className
      )}
    >
      <header className="flex items-center justify-between gap-[var(--spacing-16)]">
        <h3
          id="result-card-fact-check-title"
          className="text-[var(--color-text-heading)] text-lg font-semibold"
        >
          팩트체크
        </h3>

        {display ? (
          <span
            role="status"
            aria-label={`판정: ${display.label}`}
            className={cn(
              'inline-flex items-center gap-[var(--spacing-6)] rounded-full px-[var(--spacing-10)] py-[var(--spacing-6)] text-sm font-medium ring-1 ring-inset',
              TONE_CLASS[display.tone]
            )}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {display.icon}
            </span>
            {display.label}
          </span>
        ) : (
          <SkeletonPill />
        )}
      </header>

      <div className="flex flex-col gap-[var(--spacing-10)]">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
          핵심 주장
        </p>
        {snapshot?.claim ? (
          <p className="text-[var(--color-text-primary)] text-base leading-relaxed">
            {snapshot.claim}
          </p>
        ) : (
          <SkeletonLines lines={2} />
        )}
      </div>

      <div className="flex flex-col gap-[var(--spacing-10)]">
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
            근거
          </p>
          {typeof snapshot?.confidence === 'number' && (
            <p
              aria-label={`신뢰도 ${snapshot.confidence}퍼센트`}
              className="text-xs text-[var(--color-text-secondary)] tabular-nums"
            >
              신뢰도 {snapshot.confidence}%
            </p>
          )}
        </div>
        {snapshot?.evidence?.length ? (
          <ul className="flex flex-col gap-[var(--spacing-6)] list-disc pl-[var(--spacing-20)]">
            {snapshot.evidence.map((item, idx) => (
              <li
                key={idx}
                className="text-[var(--color-text-primary)] text-sm leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <SkeletonLines lines={3} />
        )}
      </div>
    </section>
  );
}

function SkeletonPill() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-6 w-20 animate-pulse rounded-full bg-[var(--color-bg-surface-sunken)]"
    />
  );
}

function SkeletonLines({ lines }: { lines: number }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-[var(--spacing-8)]">
      {Array.from({ length: lines }).map((_, i) => (
        <span
          key={i}
          className="block h-3 animate-pulse rounded bg-[var(--color-bg-surface-sunken)]"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
