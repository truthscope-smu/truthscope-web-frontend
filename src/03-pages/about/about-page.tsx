import Image from 'next/image';
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  DatabaseIcon,
  ICON_SIZE,
  NetworkIcon,
} from '@/07-shared/ui/icons';

export function AboutPage() {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="bg-surface relative flex min-h-[716px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_50%_50%,var(--color-blue-900)_0%,transparent_50%)]"></div>
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <span className="bg-surface-container-highest text-primary font-pretendard mb-8 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]">
            디지털 큐레이터
          </span>
          <h1 className="text-primary font-pretendard mx-auto mb-8 max-w-4xl text-6xl font-black leading-[0.9] tracking-tighter md:text-8xl">
            디지털 시대의 진실을 지킵니다
          </h1>
          <p className="text-on-surface-variant font-pretendard mx-auto max-w-2xl text-lg font-light leading-relaxed md:text-xl">
            고급 기관급 AI를 활용해 즉각적인 정보와 절대적인 사실 사이의 간극을
            메웁니다.
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="bg-surface-container-low py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="text-primary font-pretendard mb-12 text-4xl font-extrabold tracking-tight md:text-5xl">
              우리의 미션
            </h2>
            <div className="text-on-surface-variant font-pretendard space-y-8 text-lg leading-loose">
              <p>
                초고속 디지털 소비의 시대, 사실 보도와 의도된 허위 정보의 경계가
                흐려졌습니다. CheckMate는 민주주의의 근간인 공유된 진실을 되찾기
                위해 존재합니다.
              </p>
              <p>
                단순히 사실을 확인하는 것을 넘어, 디지털 생태계를
                큐레이션합니다. 검증된 기관 데이터에 즉각 접근하고 AI 교차
                분석을 제공함으로써, 모든 개인이 정보의 현명한 소비자가 될 수
                있도록 지원합니다.
              </p>
              <div className="pt-6">
                <button
                  className="text-primary font-pretendard group flex items-center gap-3 font-bold tracking-tight transition-all hover:gap-5"
                  type="button"
                >
                  윤리 헌장 전문 읽기
                  <ArrowRightIcon
                    aria-hidden="true"
                    className={`text-secondary ${ICON_SIZE.md}`}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="relative md:col-span-5">
            <div className="bg-primary-container relative aspect-[4/5] overflow-hidden rounded-xl shadow-2xl">
              <Image
                className="mix-blend-luminosity h-full w-full object-cover opacity-60 grayscale"
                src="/images/mission-placeholder.jpg"
                alt="미션 이미지"
                fill
              />
              <div className="from-primary-container/90 absolute inset-0 flex flex-col justify-end bg-gradient-to-t to-transparent p-8">
                <div className="text-white">
                  <p className="font-pretendard mb-2 text-xs uppercase tracking-widest opacity-70">
                    편집 인사이트
                  </p>
                  <p className="font-pretendard text-2xl font-semibold italic leading-tight">
                    &quot;진실은 현대 정신의 통화다.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-surface py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center md:text-left">
            <h2 className="text-primary font-pretendard mb-6 text-4xl font-extrabold md:text-5xl">
              계층형 지능 시스템
            </h2>
            <p className="text-on-surface-variant font-pretendard max-w-xl text-lg">
              검증 엔진의 핵심 작동 원리입니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-surface-container-low border-outline-variant/10 flex h-full flex-col rounded-xl border p-8">
              <div className="bg-primary-container mb-10 flex h-12 w-12 items-center justify-center rounded-full text-white">
                <DatabaseIcon aria-hidden="true" className={ICON_SIZE.md} />
              </div>
              <h3 className="text-primary font-pretendard mb-4 text-xl font-bold">
                수집 & 파싱
              </h3>
              <p className="text-on-surface-variant font-pretendard mb-auto">
                AI가 뉴스 와이어, 소셜 미디어, 학술 저널의 수백만 데이터
                포인트를 실시간으로 수집하여 바이럴 전에 신흥 주장을 식별합니다.
              </p>
            </div>
            <div className="bg-surface-container-highest border-outline-variant/10 flex h-full flex-col rounded-xl border p-8">
              <div className="bg-secondary-container text-primary mb-10 flex h-12 w-12 items-center justify-center rounded-full">
                <NetworkIcon aria-hidden="true" className={ICON_SIZE.md} />
              </div>
              <h3 className="text-primary font-pretendard mb-4 text-xl font-bold">
                교차 검증
              </h3>
              <p className="text-on-surface-variant font-pretendard mb-auto">
                주장은 AP통신부터 전문 연구기관까지 500개 이상의 신뢰할 수 있는
                기관 파트너와의 폐쇄형 루프에서 교차 검증됩니다.
              </p>
            </div>
            <div className="bg-primary-container flex h-full flex-col rounded-xl p-8 text-white">
              <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                <BadgeCheckIcon aria-hidden="true" className={ICON_SIZE.md} />
              </div>
              <h3 className="font-pretendard mb-4 text-xl font-bold">
                3단계 점수화
              </h3>
              <p className="font-pretendard mb-auto opacity-80">
                결과는 저희 고유의 3단계 신뢰도 점수로 종합되어 과도한 단순화
                없이 즉각적인 명확성을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers Visualization */}
      <section className="bg-surface py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="bg-surface-container-lowest border-outline-variant/15 mt-16 rounded-xl border p-10">
            <h4 className="text-on-surface-variant font-pretendard mb-12 text-xs font-bold tracking-[0.3em] uppercase">
              신뢰도 프레임워크 (Tiers)
            </h4>
            <div className="grid gap-12 md:grid-cols-3">
              <div className="flex gap-6">
                <div className="bg-secondary h-16 w-2 flex-shrink-0 rounded-full"></div>
                <div>
                  <h5 className="text-primary font-pretendard mb-2 font-bold">
                    Tier 1: 검증됨
                  </h5>
                  <p className="text-on-surface-variant font-pretendard text-sm">
                    여러 독립 기관 소스에 의해 확인됨. 높은 역사적 신뢰도.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-surface-container-highest h-16 w-2 flex-shrink-0 rounded-full"></div>
                <div>
                  <h5 className="text-primary font-pretendard mb-2 font-bold">
                    Tier 2: 혼합
                  </h5>
                  <p className="text-on-surface-variant font-pretendard text-sm">
                    사실적 요소를 포함하지만 맥락이 부족하거나 신뢰할 수 있는
                    소스에서 상충되는 증거가 있음.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-error h-16 w-2 flex-shrink-0 rounded-full"></div>
                <div>
                  <h5 className="text-primary font-pretendard mb-2 font-bold">
                    Tier 3: 허위
                  </h5>
                  <p className="text-on-surface-variant font-pretendard text-sm">
                    직접적인 증거 또는 1차 소스 데이터 위조를 통해 잘못된 것으로
                    증명됨.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-primary py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-24 md:grid-cols-2">
            <div className="space-y-16">
              <div>
                <h2 className="font-pretendard mb-4 text-5xl font-black leading-tight tracking-tight text-white">
                  핵심 가치
                </h2>
                <p className="text-on-primary-container font-pretendard text-lg">
                  우리 플랫폼을 정의하는 타협 불가한 원칙들입니다.
                </p>
              </div>
              <div className="space-y-12">
                <div className="group flex gap-8">
                  <span className="group-hover:text-secondary-container font-pretendard text-6xl font-black text-white/10 transition-colors duration-500">
                    01
                  </span>
                  <div>
                    <h3 className="font-pretendard mb-2 text-xl font-bold text-white">
                      절대적 정확성
                    </h3>
                    <p className="text-on-primary-container font-pretendard text-sm leading-relaxed">
                      속도보다 정확성을 우선시합니다. 검증되지 않으면 게시하지
                      않습니다.
                    </p>
                  </div>
                </div>
                <div className="group flex gap-8">
                  <span className="group-hover:text-secondary-container font-pretendard text-6xl font-black text-white/10 transition-colors duration-500">
                    02
                  </span>
                  <div>
                    <h3 className="font-pretendard mb-2 text-xl font-bold text-white">
                      급진적 투명성
                    </h3>
                    <p className="text-on-primary-container font-pretendard text-sm leading-relaxed">
                      모든 점수는 출처가 공개됩니다. 알고리즘은 감사에 열려
                      있습니다.
                    </p>
                  </div>
                </div>
                <div className="group flex gap-8">
                  <span className="group-hover:text-secondary-container font-pretendard text-6xl font-black text-white/10 transition-colors duration-500">
                    03
                  </span>
                  <div>
                    <h3 className="font-pretendard mb-2 text-xl font-bold text-white">
                      보편적 접근성
                    </h3>
                    <p className="text-on-primary-container font-pretendard text-sm leading-relaxed">
                      정보는 공공재입니다. 핵심 검증 도구를 모두에게 무료로
                      제공합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-surface-container-highest absolute -right-20 -top-20 aspect-square w-full rounded-full opacity-20 blur-[120px]"></div>
              <div className="relative z-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/0 p-1 backdrop-blur-sm">
                <Image
                  className="aspect-square w-full rounded-[20px] object-cover"
                  src="/images/values-placeholder.jpg"
                  alt="핵심 가치 이미지"
                  width={600}
                  height={600}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visionaries & Contact */}
      <section className="bg-surface py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 flex flex-col items-end justify-between gap-8 md:flex-row">
            <div className="max-w-2xl">
              <h2 className="text-primary font-pretendard mb-6 text-4xl font-extrabold md:text-5xl">
                팀 소개
              </h2>
              <p className="text-on-surface-variant font-pretendard text-lg">
                CheckMate는 탐사 저널리스트, AI 연구원, 시민권 옹호자들이 모여
                설립했습니다.
              </p>
            </div>
            <button
              className="border-outline/15 text-primary font-pretendard hover:bg-primary rounded-md border-2 px-8 py-4 font-bold transition-all hover:text-white"
              type="button"
            >
              팀 합류하기
            </button>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="group">
              <div className="bg-surface-container-low mb-6 aspect-[3/4] overflow-hidden rounded-xl">
                <Image
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src="/images/team-placeholder.jpg"
                  alt="팀원 프로필"
                  width={300}
                  height={400}
                />
              </div>
              <h4 className="text-primary font-pretendard text-lg font-bold">
                CheckMate 팀
              </h4>
              <p className="text-secondary font-pretendard mb-2 text-sm font-medium">
                개발팀
              </p>
              <p className="text-on-surface-variant font-pretendard text-xs leading-relaxed opacity-70">
                상명대학교 SW설계 팀 프로젝트
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-surface-container-high relative overflow-hidden py-24">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-primary font-pretendard mb-8 text-4xl font-black tracking-tighter">
            진실을 확인할 준비가 되셨나요?
          </h2>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              className="bg-primary shadow-primary/20 font-pretendard rounded-md px-10 py-4 font-bold text-white shadow-xl transition-transform hover:scale-105"
              type="button"
            >
              피드 탐색
            </button>
            <button
              className="border-primary text-primary font-pretendard hover:bg-primary rounded-md border-2 px-10 py-4 font-bold transition-all hover:text-white"
              type="button"
            >
              데모 요청
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
