import {
  BadgeCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  HelpCircleIcon,
  ICON_SIZE,
  SearchIcon,
  SortIcon,
  TriangleAlertIcon,
} from '@/07-shared/ui/icons';

export function HistoryPage() {
  return (
    <>
      <main className="mx-auto max-w-7xl px-8 py-12">
        <header className="mb-12">
          <h1 className="font-pretendard text-primary mb-2 text-5xl font-black tracking-tighter">
            히스토리 & 인사이트
          </h1>
          <p className="font-pretendard text-on-surface-variant max-w-2xl text-body-md">
            신뢰도 분석 결과의 종합적인 개요와 전 세계 섹터별 정보 신뢰성 변화
            추이를 확인하세요.
          </p>
        </header>

        <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Global Trust Gauge */}
          <div className="bg-surface-container-lowest relative flex flex-col items-center justify-center overflow-hidden rounded-full p-8 text-center shadow-sm md:col-span-1">
            <div className="from-secondary/5 pointer-events-none absolute inset-0 bg-gradient-to-tr to-transparent"></div>
            <span className="font-pretendard text-secondary mb-4 text-label-md font-semibold tracking-widest uppercase">
              현재 신뢰도 점수
            </span>
            <div className="relative mb-4 h-24 w-48">
              <svg
                className="h-full w-full transform transition-transform duration-500 hover:scale-105"
                viewBox="0 0 100 50"
              >
                <path
                  className="text-surface-container-highest"
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                ></path>
                <path
                  d="M 10 50 A 40 40 0 0 1 72 15"
                  fill="none"
                  stroke="url(#trustGradient)"
                  strokeLinecap="round"
                  strokeWidth="10"
                ></path>
                <defs>
                  <linearGradient
                    id="trustGradient"
                    x1="0%"
                    x2="100%"
                    y1="0%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: 'var(--color-blue-900)' }}
                    ></stop>
                    <stop
                      offset="100%"
                      style={{ stopColor: 'var(--color-blue-700)' }}
                    ></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="font-pretendard text-primary absolute bottom-0 left-1/2 -translate-x-1/2 text-4xl font-black">
                78%
              </div>
            </div>
            <p className="font-pretendard text-on-surface-variant text-body-sm">
              지난달 대비 신뢰도 지수 4.2% 상승
            </p>
          </div>

          {/* Reliability by Category */}
          <div className="bg-surface-container-low rounded-full p-8 shadow-sm md:col-span-2">
            <div className="mb-8 flex items-start justify-between">
              <h3 className="font-pretendard text-primary text-xl font-bold">
                카테고리별 신뢰도 추이
              </h3>
              <div className="flex gap-2">
                <span className="text-secondary flex items-center gap-2 text-body-sm font-pretendard font-medium">
                  <span className="bg-secondary h-2 w-2 rounded-full"></span>{' '}
                  검증됨
                </span>
                <span className="text-outline flex items-center gap-2 text-body-sm font-pretendard font-medium">
                  <span className="bg-outline-variant h-2 w-2 rounded-full"></span>{' '}
                  혼합
                </span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="font-pretendard text-on-surface flex justify-between text-label-md font-semibold">
                  <span>정치</span>
                  <span>64%</span>
                </div>
                <div className="bg-surface-container-highest h-3 w-full overflow-hidden rounded-full">
                  <div className="bg-secondary h-full w-[64%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-pretendard text-on-surface flex justify-between text-label-md font-semibold">
                  <span>기술 & AI</span>
                  <span>91%</span>
                </div>
                <div className="bg-surface-container-highest h-3 w-full overflow-hidden rounded-full">
                  <div className="bg-secondary h-full w-[91%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-pretendard text-on-surface flex justify-between text-label-md font-semibold">
                  <span>글로벌 경제</span>
                  <span>82%</span>
                </div>
                <div className="bg-surface-container-highest h-3 w-full overflow-hidden rounded-full">
                  <div className="bg-secondary h-full w-[82%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h2 className="font-pretendard text-primary text-3xl font-black">
              분석 아카이브
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="group relative">
                <SearchIcon
                  aria-hidden="true"
                  className={`text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 ${ICON_SIZE.sm}`}
                />
                <input
                  className="bg-surface-container-highest focus:ring-secondary font-pretendard border-none py-2 pl-10 pr-4 text-body-sm w-full outline-none transition-all focus:ring-2 focus:ring-offset-4 rounded-lg md:w-64"
                  placeholder="주장 검색..."
                  type="text"
                  aria-label="주장 검색"
                />
              </div>
              <button
                className="bg-surface-container-low text-on-surface-variant font-pretendard hover:bg-surface-container-high flex items-center gap-2 rounded-lg px-4 py-2 text-body-sm transition-colors"
                type="button"
              >
                <FilterIcon aria-hidden="true" className={ICON_SIZE.md} />
                필터
              </button>
              <button
                className="bg-surface-container-low text-on-surface-variant font-pretendard hover:bg-surface-container-high flex items-center gap-2 rounded-lg px-4 py-2 text-body-sm transition-colors"
                type="button"
              >
                <SortIcon aria-hidden="true" className={ICON_SIZE.md} />
                날짜순 정렬
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container-lowest hover:translate-x-2 flex flex-col items-center gap-6 rounded-full p-6 transition-transform duration-300 md:flex-row">
              <div className="bg-secondary-container/20 text-secondary flex h-12 w-12 items-center justify-center rounded-xl">
                <BadgeCheckIcon aria-hidden="true" className={ICON_SIZE.md} />
              </div>
              <div className="flex-grow">
                <div className="mb-1 flex items-center gap-3">
                  <span className="font-pretendard text-secondary text-label-sm font-bold tracking-tighter uppercase">
                    검증됨
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-pretendard text-on-surface-variant text-label-sm">
                    2024년 10월 24일
                  </span>
                </div>
                <h4 className="font-pretendard text-primary text-lg font-bold">
                  글로벌 반도체 생산량, 2024년 4분기 12% 증가 전망
                </h4>
              </div>
              <div className="flex w-full items-center justify-between gap-8 md:w-auto md:justify-end">
                <div className="text-right">
                  <div className="font-pretendard text-primary text-xl font-black">
                    98/100
                  </div>
                  <div className="font-pretendard text-on-surface-variant text-label-sm">
                    신뢰도
                  </div>
                </div>
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  type="button"
                  aria-label="상세 보기"
                >
                  <ChevronRightIcon
                    aria-hidden="true"
                    className={ICON_SIZE.sm}
                  />
                </button>
              </div>
            </div>

            <div className="bg-surface-container-low hover:translate-x-2 flex flex-col items-center gap-6 rounded-full p-6 transition-transform duration-300 md:flex-row">
              <div className="bg-surface-container-highest text-on-surface-variant flex h-12 w-12 items-center justify-center rounded-xl">
                <HelpCircleIcon aria-hidden="true" className={ICON_SIZE.md} />
              </div>
              <div className="flex-grow">
                <div className="mb-1 flex items-center gap-3">
                  <span className="font-pretendard text-on-surface-variant text-label-sm font-bold tracking-tighter uppercase">
                    혼합 맥락
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-pretendard text-on-surface-variant text-label-sm">
                    2024년 10월 22일
                  </span>
                </div>
                <h4 className="font-pretendard text-primary text-lg font-bold">
                  새 도시계획으로 출퇴근 시간 즉시 40% 단축 주장
                </h4>
              </div>
              <div className="flex w-full items-center justify-between gap-8 md:w-auto md:justify-end">
                <div className="text-right">
                  <div className="font-pretendard text-primary text-xl font-black">
                    52/100
                  </div>
                  <div className="font-pretendard text-on-surface-variant text-label-sm">
                    신뢰도
                  </div>
                </div>
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  type="button"
                  aria-label="상세 보기"
                >
                  <ChevronRightIcon
                    aria-hidden="true"
                    className={ICON_SIZE.sm}
                  />
                </button>
              </div>
            </div>

            <div className="bg-error-container/30 hover:translate-x-2 flex flex-col items-center gap-6 rounded-full p-6 transition-transform duration-300 md:flex-row">
              <div className="bg-error/10 text-error flex h-12 w-12 items-center justify-center rounded-xl">
                <TriangleAlertIcon
                  aria-hidden="true"
                  className={ICON_SIZE.md}
                />
              </div>
              <div className="flex-grow">
                <div className="mb-1 flex items-center gap-3">
                  <span className="font-pretendard text-error text-label-sm font-bold tracking-tighter uppercase">
                    부정확
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-pretendard text-on-surface-variant text-label-sm">
                    2024년 10월 19일
                  </span>
                </div>
                <h4 className="font-pretendard text-primary text-lg font-bold">
                  지역 연구소 기적의 에너지 혁신 영상이라 주장하는 바이럴 영상
                </h4>
              </div>
              <div className="flex w-full items-center justify-between gap-8 md:w-auto md:justify-end">
                <div className="text-right">
                  <div className="font-pretendard text-error text-xl font-black">
                    14/100
                  </div>
                  <div className="font-pretendard text-on-surface-variant text-label-sm">
                    신뢰도
                  </div>
                </div>
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  type="button"
                  aria-label="상세 보기"
                >
                  <ChevronRightIcon
                    aria-hidden="true"
                    className={ICON_SIZE.sm}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              className="border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
              type="button"
              aria-label="이전 페이지"
            >
              <ChevronLeftIcon aria-hidden="true" className={ICON_SIZE.sm} />
            </button>
            <div className="flex items-center gap-2">
              <button
                className="bg-primary text-on-primary font-pretendard h-10 w-10 rounded-full font-bold"
                type="button"
              >
                1
              </button>
              <button
                className="text-on-surface-variant hover:bg-surface-container-low font-pretendard h-10 w-10 rounded-full"
                type="button"
              >
                2
              </button>
              <button
                className="text-on-surface-variant hover:bg-surface-container-low font-pretendard h-10 w-10 rounded-full"
                type="button"
              >
                3
              </button>
              <span className="text-outline-variant">...</span>
              <button
                className="text-on-surface-variant hover:bg-surface-container-low font-pretendard h-10 w-10 rounded-full"
                type="button"
              >
                12
              </button>
            </div>
            <button
              className="border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
              type="button"
              aria-label="다음 페이지"
            >
              <ChevronRightIcon aria-hidden="true" className={ICON_SIZE.sm} />
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
