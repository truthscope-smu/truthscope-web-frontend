import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Fact Check', href: '/' },
  { label: 'Methodology', href: '/about#how-it-works' },
  { label: 'Archive', href: '/history' },
  { label: 'About', href: '/about' },
] as const;

function Navbar() {
  return (
    <nav className="mx-auto flex w-full max-w-7xl min-h-[var(--nav-height)] items-center justify-between border-b px-6 py-3 sm:px-8">
      <Link
        href="/"
        className="font-display text-[var(--color-text-heading)] font-bold"
      >
        CheckMate
      </Link>

      <ul className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-pretendard text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-text-accent)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden md:flex items-center gap-6">
        <button
          className="font-pretendard text-[var(--color-text-primary)]"
          type="button"
        >
          로그인
        </button>
        <Link
          href="/#analysis-form"
          className="font-pretendard rounded-lg bg-[var(--color-brand-primary)] px-6 py-2 font-bold text-white transition-colors hover:bg-[var(--color-brand-secondary)]"
        >
          Get Started
        </Link>
      </div>

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
