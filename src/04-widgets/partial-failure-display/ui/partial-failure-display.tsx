'use client';

import { useId } from 'react';
import { cn } from '@/07-shared/lib/cn';
import type {
  PartialFailureSnapshot,
  ReasonCountKey,
  SourceTransparencyBand,
  Tier3Reason,
} from '@/04-widgets/partial-failure-display/model/types';

interface Props {
  snapshot?: PartialFailureSnapshot;
  className?: string;
}

const BAND_LABEL: Record<SourceTransparencyBand, string> = {
  ALL_EXPLICIT: '모두 명시',
  SOME_UNCLEAR: '일부 불명확',
  MISSING_SOURCE: '출처 누락 있음',
};

const BAND_TONE: Record<SourceTransparencyBand, string> = {
  ALL_EXPLICIT: 'text-[var(--color-success-strong)]',
  SOME_UNCLEAR: 'text-[var(--color-info)]',
  MISSING_SOURCE: 'text-[var(--color-error)]',
};

/**
 * BE Tier3ReasonCandidate enum → CoverageSummary count 필드 bridge.
 * BE enum 추가/리네이밍 시 컴파일 에러 발생 의무 (Round 1 CX-3 정합).
 */
const TIER3_REASON_TO_COUNT_KEY: Record<Tier3Reason, ReasonCountKey> = {
  INSUFFICIENT: 'insufficientCount',
  TIME_SENSITIVE: 'timeSensitiveCount',
  OUT_OF_SCOPE: 'outOfScopeCount',
};

interface ReasonRowDef {
  reason: Tier3Reason;
  key: ReasonCountKey;
  label: string;
  detail: string;
}

const REASON_ROWS: readonly ReasonRowDef[] = [
  {
    reason: 'INSUFFICIENT',
    key: TIER3_REASON_TO_COUNT_KEY.INSUFFICIENT,
    label: '검증불가',
    detail: '근거 부족 또는 Tier 1/2 실패',
  },
  {
    reason: 'TIME_SENSITIVE',
    key: TIER3_REASON_TO_COUNT_KEY.TIME_SENSITIVE,
    label: '시점주의',
    detail: '재검증 필요',
  },
  {
    reason: 'OUT_OF_SCOPE',
    key: TIER3_REASON_TO_COUNT_KEY.OUT_OF_SCOPE,
    label: '검증범위 밖',
    detail: '의견·예측·가치판단',
  },
] as const;

const SINGLE_SOURCE_WARNING = '단일 출처 의존 — 교차 출처 확보 권장';

export function PartialFailureDisplay({ snapshot, className }: Props) {
  const titleId = useId();

  if (!snapshot) {
    return <PartialFailureSkeleton className={className} />;
  }

  const coverage = snapshot.coverage;
  const sourceTransparency = snapshot.sourceTransparency;
  const uniqueSourceCount = snapshot.uniqueSourceCount;

  const excludedTotal = coverage
    ? coverage.insufficientCount +
      coverage.timeSensitiveCount +
      coverage.outOfScopeCount
    : 0;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)] overflow-hidden',
        className
      )}
    >
      <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] p-[var(--spacing-16)]">
        <h3
          id={titleId}
          className="m-0 text-base font-semibold text-[var(--color-text-heading)]"
        >
          검증 커버리지
        </h3>
        <span className="text-xs text-[var(--color-text-secondary)]">N-5</span>
      </header>

      {/* 사유별 비판정 count */}
      {coverage && (
        <div className="flex flex-col p-[var(--spacing-16)] gap-[var(--spacing-10)] border-b border-[var(--color-border-subtle)]">
          {excludedTotal === 0 ? (
            <span className="text-sm text-[var(--color-success-strong)]">
              모든 claim 검증 완료
            </span>
          ) : (
            REASON_ROWS.filter((row) => coverage[row.key] > 0).map((row) => (
              <ReasonRow
                key={row.reason}
                count={coverage[row.key]}
                label={row.label}
                detail={row.detail}
              />
            ))
          )}
        </div>
      )}

      {/* Tier 분포 */}
      {coverage && (
        <div className="flex flex-wrap items-center gap-[var(--spacing-6)] border-b border-[var(--color-border-subtle)] p-[var(--spacing-16)] text-xs text-[var(--color-text-secondary)]">
          <span className="font-semibold text-[var(--color-text-primary)]">
            검증 경로:
          </span>
          <span>Tier 1 기관 {coverage.tier1Count}건</span>
          <span aria-hidden="true">·</span>
          <span>Tier 2 AI 교차 {coverage.tier2Count}건</span>
          <span aria-hidden="true">·</span>
          <span>Tier 3 검증불가 {coverage.tier3Count}건</span>
        </div>
      )}

      {/* 출처 명시 band */}
      {sourceTransparency && (
        <div className="flex flex-col gap-[var(--spacing-6)] border-b border-[var(--color-border-subtle)] p-[var(--spacing-16)]">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            출처 명시
          </span>
          <span className={cn('text-xs', BAND_TONE[sourceTransparency.band])}>
            {BAND_LABEL[sourceTransparency.band]} · 명시{' '}
            {sourceTransparency.explicitCount} · 불명확{' '}
            {sourceTransparency.ambiguousCount} · 누락{' '}
            {sourceTransparency.noneCount}
          </span>
        </div>
      )}

      {/* 단일 출처 경고 (절충안 A' 안전 contract: undefined 시 hide) */}
      {uniqueSourceCount === 1 && (
        <div
          role="alert"
          className="flex items-start gap-[var(--spacing-8)] p-[var(--spacing-16)] bg-[var(--color-bg-surface-sunken)]"
        >
          <span
            aria-hidden="true"
            className="text-[var(--color-info)] text-base leading-none"
          >
            ⚠
          </span>
          <span className="text-xs text-[var(--color-info)] leading-relaxed">
            {SINGLE_SOURCE_WARNING}
          </span>
        </div>
      )}
    </section>
  );
}

interface ReasonRowProps {
  count: number;
  label: string;
  detail: string;
}

function ReasonRow({ count, label, detail }: ReasonRowProps) {
  return (
    <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-[var(--spacing-10)] items-start">
      <span
        aria-hidden="true"
        className="inline-flex h-7 min-w-[40px] items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)] px-[var(--spacing-6)] text-sm font-semibold text-[var(--color-brand-primary)]"
      >
        {count}
      </span>
      <div className="flex flex-col gap-[var(--spacing-6)]">
        <strong className="text-sm font-semibold text-[var(--color-text-primary)]">
          {label} {count}건
        </strong>
        <span className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
          {detail}
        </span>
      </div>
    </div>
  );
}

function PartialFailureSkeleton({ className }: { className?: string }) {
  return (
    <section
      aria-busy="true"
      aria-label="검증 커버리지 로딩 중"
      className={cn(
        'flex flex-col rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)] overflow-hidden',
        className
      )}
    >
      <div className="border-b border-[var(--color-border-subtle)] p-[var(--spacing-16)]">
        <span className="block h-4 w-[140px] animate-pulse rounded bg-[var(--color-bg-surface-sunken)]" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[40px_minmax(0,1fr)] gap-[var(--spacing-10)] p-[var(--spacing-16)] border-b border-[var(--color-border-subtle)] last:border-b-0"
        >
          <span className="h-7 min-w-[40px] animate-pulse rounded-full bg-[var(--color-bg-surface-sunken)]" />
          <div className="flex flex-col gap-[var(--spacing-6)]">
            <span className="block h-3 w-[100px] animate-pulse rounded bg-[var(--color-bg-surface-sunken)]" />
            <span className="block h-3 w-[200px] animate-pulse rounded bg-[var(--color-bg-surface-sunken)]" />
          </div>
        </div>
      ))}
    </section>
  );
}
