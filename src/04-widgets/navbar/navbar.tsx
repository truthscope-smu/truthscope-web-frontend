import Link from 'next/link';

function Navbar() {
  return (
    <nav className="mx-auto flex w-full max-w-7xl min-h-[var(--nav-height)] items-center justify-between border-b px-6 py-3 sm:px-8">
      <Link
        href="/"
        className="font-display text-[var(--color-text-heading)] font-bold"
      >
        CheckMate
      </Link>

      <button
        className="hidden md:block text-[var(--color-text-primary)] font-pretendard"
        type="button"
      >
        로그인
      </button>

      <button
        className="md:hidden flex flex-col gap-1"
        type="button"
        aria-label="메뉴 열기"
      >
        <span className="block w-6 h-0.5 bg-[var(--color-text-primary)]"></span>
        <span className="block w-6 h-0.5 bg-[var(--color-text-primary)]"></span>
        <span className="block w-6 h-0.5 bg-[var(--color-text-primary)]"></span>
      </button>
    </nav>
  );
}

export { Navbar };
