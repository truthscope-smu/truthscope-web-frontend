'use client';

import type { EvidenceDto, EvidenceStance } from '@06-entities/article'; // A1: 루트 배럴

const STANCE_DISPLAY: Record<EvidenceStance, { label: string; tone: string }> =
  {
    supports: {
      label: '뒷받침',
      tone: 'bg-[var(--color-success-subtle)] text-[var(--color-success-strong)] ring-[var(--color-success-strong)]/30',
    },
    refutes: {
      label: '반박',
      tone: 'bg-[var(--color-error-subtle)] text-[var(--color-error)] ring-[var(--color-error)]/30',
    },
    neutral: {
      label: '중립',
      tone: 'bg-[var(--color-bg-surface-sunken)] text-[var(--color-text-secondary)] ring-[var(--color-border-subtle)]',
    },
  };

interface Props {
  evidence: EvidenceDto[];
}

export function EvidenceCard({ evidence }: Props) {
  return (
    <ul className="flex flex-col gap-[var(--spacing-10)]">
      {evidence.length === 1 && (
        <li
          role="note"
          aria-label="단일 출처"
          className="inline-flex items-center gap-[var(--spacing-6)] rounded px-[var(--spacing-8)] py-[var(--spacing-6)] text-xs bg-[var(--color-blue-50)] text-[var(--color-info)] ring-1 ring-inset ring-[var(--color-info)]/30"
        >
          단일 출처 — 다수 출처 교차 확인 권장
        </li>
      )}
      {evidence.map((item, idx) => {
        const stanceDisplay =
          STANCE_DISPLAY[item.stance] ?? STANCE_DISPLAY.neutral;
        return (
          <li
            key={idx}
            className="flex flex-col gap-[var(--spacing-6)] rounded-lg border border-[var(--color-border-subtle)] p-[var(--spacing-10)]"
          >
            <div className="flex items-start justify-between gap-[var(--spacing-8)]">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm font-medium text-[var(--color-text-accent)] underline underline-offset-2 hover:opacity-80"
              >
                <span className="text-xs text-[var(--color-text-secondary)] mr-[var(--spacing-6)]">
                  {item.publisher}
                </span>
                {item.title}
              </a>
              <span
                aria-label={`출처 입장: ${stanceDisplay.label}`}
                className={`inline-flex shrink-0 items-center rounded-full px-[var(--spacing-8)] py-[var(--spacing-6)] text-xs font-medium ring-1 ring-inset ${stanceDisplay.tone}`}
              >
                {stanceDisplay.label}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
              {item.summary}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
