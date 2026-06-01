'use client';

import { useId } from 'react';
import { cn } from '@/07-shared/lib/cn';
import type {
  SiftMappingSnapshot,
  SourceTransparencyBand,
} from '@04-widgets/sift-mapping/model/types';

interface Props {
  snapshot?: SiftMappingSnapshot;
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

const TRACE_DISCLAIMER =
  '원출처 링크를 사용자가 직접 확인하도록 표시합니다. 시스템이 맥락 정확성을 자동 판정하지 않습니다 (ADR-020).';

export function SiftMapping({ snapshot, className }: Props) {
  const titleId = useId();

  if (!snapshot) {
    return <SiftMappingSkeleton className={className} />;
  }

  const investigateText = snapshot.sourceTransparency
    ? `${BAND_LABEL[snapshot.sourceTransparency.band]} · 명시 ${snapshot.sourceTransparency.explicitCount} · 불명확 ${snapshot.sourceTransparency.ambiguousCount} · 누락 ${snapshot.sourceTransparency.noneCount}`
    : '출처 정보 없음';

  const findText = snapshot.crossSource
    ? snapshot.crossSource.adapterDiversity != null
      ? `Tier 1 ${snapshot.crossSource.tier1Count}건 · Tier 2 ${snapshot.crossSource.tier2Count}건 · 출처 ${snapshot.crossSource.adapterDiversity}종`
      : `Tier 1 ${snapshot.crossSource.tier1Count}건 · Tier 2 ${snapshot.crossSource.tier2Count}건`
    : 'cross-source 정보 없음';

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)]',
        className
      )}
    >
      <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] p-[var(--spacing-16)]">
        <h3
          id={titleId}
          className="m-0 text-base font-semibold text-[var(--color-text-heading)]"
        >
          SIFT 4단계
        </h3>
        <span className="text-xs text-[var(--color-text-secondary)]">N-3</span>
      </header>

      <div className="flex flex-col">
        <SiftRow
          letter="S"
          label="Stop"
          description="제목과 감정적 표현을 분리해 읽기"
        />
        <SiftRow
          letter="I"
          label="Investigate"
          description={investigateText}
          band={snapshot.sourceTransparency?.band}
        />
        <SiftRow letter="F" label="Find" description={findText} />
        <SiftRow
          letter="T"
          label="Trace"
          description={TRACE_DISCLAIMER}
          links={snapshot.attributionLinks}
        />
      </div>
    </section>
  );
}

interface SiftRowProps {
  letter: 'S' | 'I' | 'F' | 'T';
  label: string;
  description: string;
  band?: SourceTransparencyBand;
  links?: Array<{ url: string; label: string }>;
}

function SiftRow({ letter, label, description, band, links }: SiftRowProps) {
  const isLast = letter === 'T';
  return (
    <div
      className={cn(
        'grid grid-cols-[36px_minmax(0,1fr)] items-start gap-[var(--spacing-10)] p-[var(--spacing-16)]',
        !isLast && 'border-b border-[var(--color-border-subtle)]'
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)] text-sm font-semibold text-[var(--color-brand-primary)]"
      >
        {letter}
      </span>
      <div className="flex flex-col gap-[var(--spacing-6)]">
        <strong className="text-sm font-semibold text-[var(--color-text-primary)]">
          {label}
        </strong>
        <span
          className={cn(
            'text-xs leading-relaxed text-[var(--color-text-secondary)]',
            band && BAND_TONE[band]
          )}
        >
          {description}
        </span>
        {links !== undefined && <SiftAttributionLinks links={links} />}
      </div>
    </div>
  );
}

function SiftAttributionLinks({
  links,
}: {
  links: Array<{ url: string; label: string }>;
}) {
  if (links.length === 0) {
    return (
      <span className="text-xs text-[var(--color-text-secondary)]">
        원출처 추적 가능 링크 없음
      </span>
    );
  }
  return (
    <ul className="m-0 flex list-none flex-col gap-[var(--spacing-6)] p-0">
      {links.map((link, idx) => (
        <li key={idx}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--color-brand-primary)] underline underline-offset-2"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function SiftMappingSkeleton({ className }: { className?: string }) {
  return (
    <section
      aria-hidden="true"
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)]',
        className
      )}
    >
      <div className="border-b border-[var(--color-border-subtle)] p-[var(--spacing-16)]">
        <span className="block h-4 w-[140px] animate-pulse rounded bg-[var(--color-bg-surface-sunken)]" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[36px_minmax(0,1fr)] gap-[var(--spacing-10)] border-b border-[var(--color-border-subtle)] p-[var(--spacing-16)] last:border-b-0"
        >
          <span className="h-7 w-7 animate-pulse rounded-full bg-[var(--color-bg-surface-sunken)]" />
          <div className="flex flex-col gap-[var(--spacing-6)]">
            <span className="block h-3 w-[80px] animate-pulse rounded bg-[var(--color-bg-surface-sunken)]" />
            <span className="block h-3 w-[200px] animate-pulse rounded bg-[var(--color-bg-surface-sunken)]" />
          </div>
        </div>
      ))}
    </section>
  );
}
