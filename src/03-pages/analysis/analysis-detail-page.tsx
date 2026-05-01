import Image from 'next/image';
import {
  BotIcon,
  HelpCircleIcon,
  ICON_SIZE,
  ShieldIcon,
  SourceIcon,
} from '@/07-shared/ui/icons';

export function AnalysisDetailPage() {
  return (
    <>
      <section className="bg-surface-container-low sticky top-[var(--nav-height)] z-40 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-8 md:flex-row md:items-center">
          <div className="flex-1">
            <span className="text-secondary font-pretendard mb-1 block text-xs font-bold tracking-widest">
              ANALYSIS ID: #CM-40921
            </span>
            <h1 className="font-pretendard text-primary leading-none text-2xl font-extrabold tracking-tight md:text-3xl">
              합성 재조림이 지역 생태계에 미치는 영향 분석
            </h1>
          </div>
          {/* Trust Score Gauge */}
          <div className="bg-surface-container-lowest flex items-center gap-4 rounded-full p-3 pr-8">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="border-surface-container-highest absolute inset-0 rounded-full border-4"></div>
              <div className="border-secondary absolute inset-0 rotate-45 rounded-full border-4 border-l-transparent border-t-transparent"></div>
              <span className="text-primary text-xl font-black">84</span>
            </div>
            <div>
              <div className="text-on-surface-variant font-pretendard text-xs font-bold tracking-tighter uppercase">
                신뢰도 점수
              </div>
              <div className="mt-1 flex gap-1">
                <ShieldIcon
                  aria-hidden="true"
                  className={`text-secondary ${ICON_SIZE.sm}`}
                />
                <ShieldIcon
                  aria-hidden="true"
                  className={`text-secondary ${ICON_SIZE.sm}`}
                />
                <ShieldIcon
                  aria-hidden="true"
                  className={`text-on-surface-variant ${ICON_SIZE.sm}`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Content Area: Claims */}
          <div className="space-y-12 lg:col-span-8">
            <header className="mb-8">
              <h2 className="font-pretendard text-primary mb-2 text-3xl font-bold">
                주장 분석
              </h2>
              <p className="text-on-surface-variant font-pretendard leading-relaxed">
                편집팀과 AI 검증자가 기사를 세 가지 핵심 주장으로 분류하여 진위
                여부를 검증했습니다.
              </p>
            </header>
            {/* Claim Card Tier 1: Verified */}
            <article className="bg-surface-container-lowest border-secondary flex items-start gap-6 rounded-xl border-l-4 p-8">
              <div className="bg-secondary-container text-on-secondary-container flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                <ShieldIcon aria-hidden="true" className={ICON_SIZE.md} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-secondary-container text-on-secondary-container font-pretendard rounded px-2 py-1 text-xs font-bold">
                    TIER 1: 검증됨
                  </span>
                  <span className="text-outline font-pretendard text-xs font-medium tracking-tighter">
                    신뢰도: 98%
                  </span>
                </div>
                <h3 className="font-pretendard text-primary text-xl font-bold">
                  &quot;재조림 프로젝트는 이전에 건조했던 토지 4만5천 헥타르를
                  포함합니다.&quot;
                </h3>
                <p className="text-on-surface-variant font-pretendard leading-relaxed">
                  코페르니쿠스 센티넬-2 위성 이미지와 현지 토지대장 기록이
                  프로젝트 부지의 정확한 경계를 확인했습니다. 데이터는 주장된
                  지리적 면적과 1.2% 오차 이내로 일치합니다.
                </p>
              </div>
            </article>
            {/* Claim Card Tier 2: AI Analyzed */}
            <article className="bg-surface-container-low border-secondary-container flex items-start gap-6 rounded-xl border-l-4 p-8">
              <div className="bg-secondary-fixed text-secondary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                <BotIcon aria-hidden="true" className={ICON_SIZE.md} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-secondary-fixed text-secondary font-pretendard rounded px-2 py-1 text-xs font-bold">
                    TIER 2: AI 분석
                  </span>
                  <span className="text-outline font-pretendard text-xs font-medium tracking-tighter">
                    신뢰도: 72%
                  </span>
                </div>
                <h3 className="font-pretendard text-primary text-xl font-bold">
                  &quot;토종 조류 종이 자연 회복보다 3배 빠른 속도로
                  돌아왔습니다.&quot;
                </h3>
                <p className="text-on-surface-variant font-pretendard leading-relaxed">
                  AI 언어 모델이 이를 &apos;비교 최상급&apos;으로 분류했습니다.
                  생물 다양성은 증가했지만, &apos;3배&apos; 배수는 다년간 종단
                  데이터가 아닌 6개월의 좁은 계절적 창에 기반합니다. 교차 참조
                  결과 1.8배가 통계적으로 근거있는 수치입니다.
                </p>
              </div>
            </article>
            {/* Claim Card Tier 3: Unverifiable */}
            <article className="bg-surface-container-high border-outline-variant flex items-start gap-6 rounded-xl border-l-4 p-8">
              <div className="bg-surface-variant text-on-surface-variant flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                <HelpCircleIcon aria-hidden="true" className={ICON_SIZE.md} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-surface-variant text-on-surface-variant font-pretendard rounded px-2 py-1 text-xs font-bold">
                    TIER 3: 검증 불가
                  </span>
                  <span className="text-outline font-pretendard text-xs font-medium tracking-tighter">
                    신뢰도: N/A
                  </span>
                </div>
                <h3 className="font-pretendard text-primary text-xl font-bold">
                  &quot;예상 탄소 상쇄량은 2030년까지 지역 순제로에 도달할
                  것입니다.&quot;
                </h3>
                <p className="text-on-surface-variant font-pretendard leading-relaxed">
                  이 주장은 공개되지 않은 투기적 미래 기후 모델과 내부 회사
                  전망에 의존합니다. 독립적인 생태 감사에서는 이 2030년 목표에
                  필요한 토양 격리 속도를 아직 검증하지 않았습니다.
                </p>
              </div>
            </article>
          </div>
          {/* Sidebar: Sources and Evidence */}
          <aside className="space-y-10 lg:col-span-4">
            <div className="bg-surface-container rounded-xl p-8">
              <h2 className="font-pretendard text-primary mb-6 flex items-center gap-2 text-xl font-bold">
                <SourceIcon
                  aria-hidden="true"
                  className={`text-secondary ${ICON_SIZE.md}`}
                />
                출처 신뢰도
              </h2>
              <ul className="space-y-6">
                <li>
                  <div className="group block">
                    <div className="text-secondary font-pretendard text-xs font-bold tracking-widest uppercase">
                      주요 출처
                    </div>
                    <div className="text-primary font-pretendard decoration-secondary font-bold transition-all underline-offset-4 decoration-2">
                      UN 생물다양성 보고서 2023
                    </div>
                    <div className="text-outline-variant font-pretendard mt-1 text-xs">
                      공인 기관 • 정부 기관
                    </div>
                  </div>
                </li>
                <li>
                  <div className="group block">
                    <div className="text-secondary font-pretendard text-xs font-bold tracking-widest uppercase">
                      과학 데이터
                    </div>
                    <div className="text-primary font-pretendard decoration-secondary font-bold transition-all underline-offset-4 decoration-2">
                      Nature Journal: 건조지 복원
                    </div>
                    <div className="text-outline-variant font-pretendard mt-1 text-xs">
                      동료 심사 • 전문가 의견
                    </div>
                  </div>
                </li>
                <li>
                  <div className="group block">
                    <div className="text-secondary font-pretendard text-xs font-bold tracking-widest uppercase">
                      위성 이미지
                    </div>
                    <div className="text-primary font-pretendard decoration-secondary font-bold transition-all underline-offset-4 decoration-2">
                      코페르니쿠스 센티넬-2 데이터셋
                    </div>
                    <div className="text-outline-variant font-pretendard mt-1 text-xs">
                      원본 데이터 • 독립 검증
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-primary group relative h-64 overflow-hidden rounded-xl">
              <Image
                alt="위성 이미지 지도"
                className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                src="/images/satellite-placeholder.jpg"
                fill
              />
              <div className="from-primary/80 absolute inset-0 flex flex-col justify-end bg-gradient-to-t to-transparent p-6">
                <div className="font-pretendard text-lg font-bold text-white">
                  인터랙티브 사이트 맵
                </div>
                <div className="font-pretendard text-white/70 text-xs">
                  위치 기반 검증 포인트 탐색
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
