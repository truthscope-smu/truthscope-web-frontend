import Link from 'next/link';

export default function AnalysisDetailNotFound() {
  return (
    <main className="mx-auto max-w-4xl px-[var(--spacing-24)] py-[var(--spacing-32)]">
      <h1 className="text-2xl font-semibold text-[var(--color-text-heading)]">
        분석 결과를 찾을 수 없습니다
      </h1>
      <p className="mt-[var(--spacing-16)] text-[var(--color-text-secondary)]">
        요청하신 분석 결과가 존재하지 않거나 아직 준비되지 않았습니다.
      </p>
      <Link
        className="mt-[var(--spacing-16)] inline-flex h-9 items-center rounded-full border border-[var(--color-border-subtle)] px-[var(--spacing-16)] text-sm text-[var(--color-brand-secondary)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-primary)]"
        href="/analysis/new"
      >
        새 분석 시작
      </Link>
    </main>
  );
}
