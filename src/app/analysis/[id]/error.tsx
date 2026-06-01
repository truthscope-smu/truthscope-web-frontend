'use client';
// error.tsx: ErrorComponentProps 사용 금지 — 인라인 타입으로 정의 (A3 rev.2 정정)

export default function AnalysisDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-4xl px-[var(--spacing-24)] py-[var(--spacing-32)]">
      <h1 className="text-2xl font-semibold text-[var(--color-text-heading)]">
        오류가 발생했습니다
      </h1>
      <p
        className="mt-[var(--spacing-16)] text-[var(--color-error)]"
        role="alert"
      >
        {error.message || '분석 결과를 불러오는 중 오류가 발생했습니다.'}
      </p>
      <button
        className="mt-[var(--spacing-16)] inline-flex h-9 items-center rounded-full border border-[var(--color-border-subtle)] px-[var(--spacing-16)] text-sm text-[var(--color-brand-secondary)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-primary)]"
        onClick={reset}
        type="button"
      >
        다시 시도
      </button>
    </main>
  );
}
