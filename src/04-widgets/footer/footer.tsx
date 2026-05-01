import Link from 'next/link';

function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 border-t px-6 py-6 font-pretendard text-[var(--color-text-primary)] sm:px-8">
      <p>CheckMate — AI 뉴스 신뢰도 분석</p>

      <p>© 2026 CheckMate Team. All rights reserved.</p>

      <Link
        href="https://github.com/checkmate-smu"
        className="underline text-[var(--color-text-accent)]"
      >
        GitHub
      </Link>
    </footer>
  );
}

export { Footer };
