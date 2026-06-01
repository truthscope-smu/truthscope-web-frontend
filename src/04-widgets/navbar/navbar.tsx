'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/05-features/auth';

const NAV_LINKS = [
  { label: '홈', href: '/' },
  { label: '분석 시작', href: '/analysis/new' },
  { label: '방법론', href: '/about#how-it-works' },
  { label: '기록', href: '/history' },
  { label: '소개', href: '/about' },
] as const;

function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="mx-auto flex min-h-[52px] w-full max-w-7xl flex-wrap items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/90 px-[var(--spacing-20)] py-[var(--spacing-8)] backdrop-blur-xl sm:px-[var(--spacing-32)]">
      <Link
        href="/"
        className="font-pretendard text-base font-semibold text-[var(--color-text-heading)]"
      >
        TruthScope
      </Link>
      <ul className="order-3 mt-[var(--spacing-8)] flex w-full items-center justify-center gap-[var(--spacing-20)] border-t border-[var(--color-border-subtle)] pt-[var(--spacing-8)] md:order-none md:mt-0 md:w-auto md:gap-[var(--spacing-24)] md:border-t-0 md:pt-0">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-pretendard text-sm text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-brand-secondary)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-[var(--spacing-10)]">
        {loading ? (
          <span className="hidden h-5 w-12 md:inline-flex" aria-hidden="true" />
        ) : user ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="hidden font-pretendard text-sm text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-brand-secondary)] md:inline-flex"
          >
            로그아웃
          </button>
        ) : (
          <Link
            href="/login"
            className="hidden font-pretendard text-sm text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-brand-secondary)] md:inline-flex"
          >
            로그인
          </Link>
        )}
        <Link
          href="/analysis/new"
          className="inline-flex h-8 items-center rounded-full bg-[var(--color-brand-primary)] px-[var(--spacing-16)] font-pretendard text-sm font-medium text-[var(--color-text-on-brand)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
        >
          분석하기
        </Link>
      </div>
    </nav>
  );
}

export { Navbar };
