export default function AnalysisDetailLoading() {
  return (
    <main className="mx-auto max-w-4xl px-[var(--spacing-24)] py-[var(--spacing-32)]">
      <div className="mb-[var(--spacing-24)]">
        <div className="h-8 w-48 animate-pulse rounded-md bg-[var(--color-bg-surface)]" />
        <div className="mt-[var(--spacing-8)] h-4 w-64 animate-pulse rounded bg-[var(--color-bg-surface)]" />
      </div>
      <div className="space-y-[var(--spacing-16)]">
        <div className="h-32 animate-pulse rounded-xl bg-[var(--color-bg-surface)]" />
        <div className="h-24 animate-pulse rounded-xl bg-[var(--color-bg-surface)]" />
        <div className="h-48 animate-pulse rounded-xl bg-[var(--color-bg-surface)]" />
      </div>
    </main>
  );
}
