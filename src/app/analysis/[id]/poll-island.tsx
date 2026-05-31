'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/07-shared/api/base';
import { AppError } from '@/07-shared/errors';
import { isTerminalStatus } from '@/04-widgets/result-card';
import type { ArticleVerificationResponse } from '@/06-entities/article'; // A1: 루트 배럴

interface Props {
  articleId: string;
}

const POLL_MS = 3000;
const MAX = 60; // 3분 상한 (60 x 3초)

export function PollIsland({ articleId }: Props) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const countRef = useRef(0);

  useEffect(() => {
    countRef.current = 0;

    const id = setInterval(() => {
      countRef.current += 1;

      if (countRef.current > MAX) {
        clearInterval(id);
        setTimedOut(true);
        return;
      }

      apiClient
        .get<ArticleVerificationResponse>(`/articles/${articleId}/verification`)
        .then((dto) => {
          if (isTerminalStatus(dto.status)) {
            clearInterval(id);
            router.refresh(); // 서버 재fetch → 결과/실패 UI로 전환
          }
        })
        .catch((err: unknown) => {
          // A6: 404 mid-poll 즉시 중단 (기사/세션 삭제는 transient 아님)
          if (err instanceof AppError && err.statusCode === 404) {
            clearInterval(id);
            setTimedOut(true);
            return;
          }
          // 그 외 일시 네트워크 오류는 무시하고 다음 tick
        });
    }, POLL_MS);

    return () => {
      clearInterval(id);
    };
  }, [articleId, router]);

  if (timedOut) {
    return (
      <div
        className="flex flex-col items-center gap-[var(--spacing-16)] py-[var(--spacing-32)] text-center"
        role="alert"
      >
        <p className="text-[var(--color-text-secondary)]">
          분석이 지연되고 있습니다. 잠시 후 다시 시도해주세요.
        </p>
        <button
          className="inline-flex h-9 items-center rounded-full border border-[var(--color-border-subtle)] px-[var(--spacing-16)] text-sm text-[var(--color-brand-secondary)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-primary)]"
          onClick={() => router.refresh()}
          type="button"
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className="flex flex-col items-center gap-[var(--spacing-16)] py-[var(--spacing-32)]"
    >
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand-subtle)] border-t-[var(--color-brand-secondary)]"
      />
      <p className="text-sm text-[var(--color-text-secondary)]">
        분석 중입니다. 잠시만 기다려주세요.
      </p>
    </div>
  );
}
