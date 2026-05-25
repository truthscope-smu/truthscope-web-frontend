import Link from 'next/link';

function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 border-t border-[#d2d2d7] px-5 py-6 text-center font-pretendard text-[12px] leading-5 tracking-[-0.08px] text-[#6e6e73] sm:px-8">
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-4">
        <p className="font-medium text-[#424245]">TruthScope</p>
        <p>분석 결과는 참고용이며, 최종 판단을 대체하지 않습니다.</p>
      </div>

      <Link
        href="https://github.com/truthscope-smu"
        className="w-fit text-[#0066cc] transition-colors hover:text-[#0071e3]"
      >
        GitHub
      </Link>
    </footer>
  );
}

export { Footer };
