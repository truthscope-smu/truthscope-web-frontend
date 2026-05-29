import Link from 'next/link';

function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl flex-col items-center gap-[var(--spacing-10)] border-t border-[var(--color-border-subtle)] px-[var(--spacing-20)] py-[var(--spacing-24)] text-center font-pretendard text-xs leading-5 text-[var(--color-text-secondary)] sm:px-[var(--spacing-32)]">
      <div className="flex flex-col items-center gap-[var(--spacing-6)] sm:flex-row sm:gap-[var(--spacing-16)]">
        <p className="font-medium text-[var(--color-text-primary)]">
          TruthScope
        </p>
        <p>분석 결과는 참고용이며, 최종 판단을 대체하지 않습니다.</p>
      </div>

      <Link
        href="https://github.com/truthscope-smu"
        className="w-fit text-[var(--color-brand-secondary)] transition-colors hover:text-[var(--color-brand-primary)]"
      >
        GitHub
      </Link>
    </footer>
  );
}

export { Footer };
