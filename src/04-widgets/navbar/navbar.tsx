import Link from 'next/link';

const NAV_LINKS = [
  { label: '홈', href: '/' },
  { label: '분석 시작', href: '/analysis/new' },
  { label: '방법론', href: '/about#how-it-works' },
  { label: '기록', href: '/history' },
  { label: '소개', href: '/about' },
] as const;

function Navbar() {
  return (
    <nav className="mx-auto flex min-h-[52px] w-full max-w-7xl flex-wrap items-center justify-between border-b border-[#d2d2d7] bg-white/90 px-5 py-2 backdrop-blur-xl sm:px-8">
      <Link
        href="/"
        className="font-pretendard text-[15px] font-semibold tracking-[-0.18px] text-[#1d1d1f]"
      >
        TruthScope
      </Link>

      <ul className="order-3 mt-2 flex w-full items-center justify-center gap-5 border-t border-[#ededf0] pt-2 md:order-none md:mt-0 md:w-auto md:gap-7 md:border-t-0 md:pt-0">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-pretendard text-[13px] tracking-[-0.08px] text-[#424245] transition-colors hover:text-[#0066cc]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          className="hidden font-pretendard text-[13px] tracking-[-0.08px] text-[#424245] transition-colors hover:text-[#0066cc] md:inline-flex"
          type="button"
        >
          로그인
        </button>
        <Link
          href="/analysis/new"
          className="inline-flex h-8 items-center rounded-full bg-[#0071e3] px-4 font-pretendard text-[13px] font-medium tracking-[-0.08px] text-white transition-colors hover:bg-[#0077ed]"
        >
          분석하기
        </Link>
      </div>
    </nav>
  );
}

export { Navbar };
