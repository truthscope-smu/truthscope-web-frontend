'use client';

import { useId } from 'react';
import { cn } from '@/07-shared/lib/cn';
import type {
  ClaimScoreStatus,
  FactCheckSnapshot,
  TruthLabel,
} from '@04-widgets/result-card/model/types';

interface VerdictDisplay {
  label: string;
  icon: string;
  tone:
    | 'success'
    | 'success-soft'
    | 'mixed'
    | 'error-soft'
    | 'error'
    | 'info'
    | 'neutral';
}

const TRUTH_LABEL_DISPLAY: Record<TruthLabel, VerdictDisplay> = {
  FACT: { label: '사실', icon: '✓', tone: 'success' },
  MOSTLY_FACT: { label: '대체로 사실', icon: '✓', tone: 'success-soft' },
  PARTLY_FACT: { label: '일부 사실', icon: '◑', tone: 'mixed' },
  MOSTLY_NOT_FACT: { label: '대체로 사실 아님', icon: '✕', tone: 'error-soft' },
  NOT_FACT: { label: '사실 아님', icon: '✕', tone: 'error' },
};

const STATUS_DISPLAY: Record<ClaimScoreStatus, VerdictDisplay> = {
  INSUFFICIENT: { label: '근거 부족', icon: '?', tone: 'neutral' },
  TIME_SENSITIVE: { label: '시점 의존', icon: '⋯', tone: 'info' },
  OUT_OF_SCOPE: { label: '검증 범위 밖', icon: '—', tone: 'neutral' },
};

const TONE_CLASS: Record<VerdictDisplay['tone'], string> = {
  success:
    'bg-[var(--color-success-subtle)] text-[var(--color-success-strong)] ring-[var(--color-success-strong)]/30',
  'success-soft':
    'bg-[var(--color-success-subtle)] text-[var(--color-success-strong)]/80 ring-[var(--color-success-strong)]/20',
  mixed: 'bg-brand-subtle text-brand-primary ring-brand-primary/30',
  'error-soft':
    'bg-[var(--color-error-subtle)] text-[var(--color-error)]/80 ring-[var(--color-error)]/20',
  error:
    'bg-[var(--color-error-subtle)] text-[var(--color-error)] ring-[var(--color-error)]/30',
  info: 'bg-[var(--color-blue-50)] text-[var(--color-info)] ring-[var(--color-info)]/30',
  neutral:
    'bg-[var(--color-bg-surface-sunken)] text-[var(--color-text-secondary)] ring-[var(--color-border-subtle)]',
};

interface Props {
  snapshot?: FactCheckSnapshot;
  className?: string;
}

export function FactCheckSection({ snapshot, className }: Props) {
  const titleId = useId();
  const display = snapshot?.truthLabel
    ? TRUTH_LABEL_DISPLAY[snapshot.truthLabel]
    : snapshot?.status
      ? STATUS_DISPLAY[snapshot.status]
      : null;
  const showConfidence =
    typeof snapshot?.confidence === 'number' && Boolean(snapshot?.truthLabel);

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
          {showConfidence && (
            <p
              aria-label={`신뢰도 ${snapshot?.confidence}퍼센트`}
              className="text-xs text-[var(--color-text-secondary)] tabular-nums"
            >
              신뢰도 {snapshot?.confidence}%
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
