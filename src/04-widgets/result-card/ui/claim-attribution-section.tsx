'use client';

import { useId } from 'react';
import { cn } from '@/07-shared/lib/cn';
import type { ClaimAttributionSnapshot } from '@04-widgets/result-card/model/types';

interface Props {
  snapshot?: ClaimAttributionSnapshot;
  /**
   * true이면 claimText 본문 블록과 skeleton을 미렌더.
   * 헤더 화자 배지, 인용 disclaimer, originalContext details만 표시.
   * ClaimCard 내부에서 사용(FactCheckSection이 이미 claim 텍스트를 렌더하므로 중복 방지).
   * standalone 동작(미지정)은 불변.
   */
  hideClaimText?: boolean;
  className?: string;
}

// DISCUSS Q1 C1 확정 문구 - 임의 의역 금지.
const ATTRIBUTION_DISCLAIMER =
  '인용된 주장은 화자의 입장이며, 사실로 확인된 내용이 아닙니다.';

export function ClaimAttributionSection({
  snapshot,
  hideClaimText,
  className,
}: Props) {
  const titleId = useId();

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
          인용 표기
        </h3>
        {snapshot?.isQuotedClaim && (
          <span
            aria-label={
              snapshot.speakerName
                ? `화자: ${snapshot.speakerName}`
                : '인용된 주장'
            }
            className="inline-flex items-center gap-[var(--spacing-6)] rounded-full bg-brand-subtle px-[var(--spacing-10)] py-[var(--spacing-6)] text-xs font-medium text-brand-primary"
          >
            <span aria-hidden="true">&ldquo; &rdquo;</span>
            {snapshot.speakerName ?? '인용'}
          </span>
        )}
      </header>

      {/* 주장 본문: hideClaimText=true 시 미렌더(FactCheckSection이 claim 텍스트 담당) */}
      {!hideClaimText &&
        (snapshot?.claimText ? (
          <p className="text-[var(--color-text-primary)] text-base leading-relaxed">
            {snapshot.isQuotedClaim && (
              <span className="text-[var(--color-text-secondary)] text-sm">
                {snapshot.speakerName ? `${snapshot.speakerName} · ` : ''}주장
                인용{' '}
              </span>
            )}
            {snapshot.claimText}
          </p>
        ) : (
          // snapshot undefined 또는 claimText 부재(빈 문자열 포함) 둘 다 skeleton.
          // sibling(fact-check-section, context-section) binary 분기 패턴 정합.
          <SkeletonLines lines={2} />
        ))}

      {/* disclaimer - 인용 주장에만 (implied-truth 대칭성, DISCUSS Q1) */}
      {snapshot?.isQuotedClaim && (
        <p
          role="note"
          className="flex items-start gap-[var(--spacing-8)] rounded-md border-l-2 border-[var(--color-info)] bg-[var(--color-blue-50)] p-[var(--spacing-10)] text-sm text-[var(--color-text-primary)]"
        >
          <span aria-hidden="true">&#9432;</span>
          {ATTRIBUTION_DISCLAIMER}
        </p>
      )}

      {/* 원문 맥락 펼치기 */}
      {snapshot?.isQuotedClaim && snapshot.originalContext && (
        <details className="rounded-md border border-[var(--color-border-subtle)] p-[var(--spacing-10)]">
          <summary className="cursor-pointer text-sm font-medium text-[var(--color-text-accent)]">
            원문 맥락 보기
          </summary>
          <p className="mt-[var(--spacing-8)] text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {snapshot.originalContext}
          </p>
        </details>
      )}
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
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
