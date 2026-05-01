'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import Link from 'next/link';
import {
  BrainCircuitIcon as BrainCircuit,
  ChevronRightIcon as ChevronRight,
  ICON_SIZE,
  PuzzleIcon as Puzzle,
  ShieldCheckIcon as ShieldCheck,
  TriangleAlertIcon as TriangleAlert,
} from '@/07-shared/ui/icons';
import { EASE_OUT_EXPO } from '@/03-pages/home/ui/motion-variants';

/* ------------------------------------------------------------------ */
/*  Card Reveal wrapper                                                */
/* ------------------------------------------------------------------ */

function RevealCard({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: 0.55,
        ease: EASE_OUT_EXPO,
        delay: index * 0.08,
      }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export function BentoSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
      <div className="space-y-16">
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-primary font-display text-3xl font-bold tracking-tight md:text-4xl">
              분석 리포트 예시
            </h2>
            <p className="text-on-surface-variant font-pretendard mt-3 text-lg font-medium">
              CheckMate가 제공하는 검증 리포트의 구성 예시입니다.
            </p>
          </div>
          <Link
            href="/history"
            className="text-secondary font-pretendard inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center gap-2 self-start rounded-lg px-4 font-bold transition-all underline-offset-2 hover:gap-3 hover:underline focus-visible:underline motion-reduce:transition-none active:scale-[0.98] sm:self-auto"
            aria-label="실시간 분석 리포트 전체 보기"
          >
            전체 보기
            <ChevronRight aria-hidden="true" className={ICON_SIZE.sm} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Tier 1: Verified (Large Card) */}
          <RevealCard
            index={0}
            className="gradient-border bg-surface-container-lowest border-outline-variant/10 ambient-shadow group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:shadow-xl md:col-span-2 lg:col-span-2"
          >
            {/* Shimmer stripe */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  'linear-gradient(135deg, transparent 35%, rgba(0,150,255,0.07) 50%, transparent 65%)',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease infinite',
              }}
            />
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.14]"
              style={{ background: 'var(--color-brand-secondary)' }}
              aria-hidden="true"
            />
            <div className="relative mb-8 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110">
                  <ShieldCheck aria-hidden="true" className={ICON_SIZE.md} />
                </div>
                <span className="bg-secondary-container text-on-secondary-container font-pretendard inline-block rounded-lg px-3 py-1.5 text-xs font-bold tracking-widest uppercase">
                  VERIFIED
                </span>
              </div>
              <span className="text-on-surface-variant font-pretendard text-xs font-medium">
                예시
              </span>
            </div>
            <div className="relative">
              <h3 className="text-primary font-pretendard text-2xl font-bold leading-snug">
                중앙은행 디지털 화폐(CBDC) 도입 가속화설의 실체
              </h3>
              <p className="text-on-surface-variant font-pretendard mt-4 line-clamp-2 leading-relaxed">
                한국은행 보도자료 및 관련 법안 검토 결과, 현재 논의 중인 단계는
                맞으나 강제 도입은 사실무근으로 확인되었습니다.
              </p>
            </div>
            <div className="border-surface-container relative mt-8 flex items-center justify-between border-t pt-8">
              <div className="flex items-center gap-2">
                <div className="bg-surface-container-highest h-6 w-6 rounded-full" />
                <span className="text-on-surface font-pretendard text-xs font-semibold">
                  Fact Analyst: AI-Theta
                </span>
              </div>
              <div className="bg-surface-container text-primary font-pretendard rounded-lg px-3 py-1.5 text-xs font-bold tracking-tighter uppercase">
                매체 교차 확인
              </div>
            </div>
          </RevealCard>

          {/* Tier 2: Mixed */}
          <RevealCard
            index={1}
            className="gradient-border bg-surface-container-lowest border-outline-variant/10 group flex flex-col rounded-3xl border p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
          >
            <div className="mb-8">
              <span className="bg-surface-container-highest text-on-surface-variant font-pretendard mb-4 inline-block rounded-lg px-3 py-1.5 text-xs font-bold tracking-widest uppercase">
                MIXED
              </span>
              <h4 className="text-primary font-pretendard text-lg font-bold leading-tight">
                신규 에너지 정책에 따른 요금 인상폭 논란
              </h4>
            </div>
            <div className="mt-auto">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-800 font-pretendard inline-block rounded-lg px-2.5 py-1 text-xs font-bold">
                  부분 일치
                </span>
                <span className="text-on-surface-variant font-pretendard text-xs">
                  추가 검증 필요
                </span>
              </div>
              <div className="bg-surface-container-highest mt-3 h-1.5 w-full overflow-hidden rounded-full">
                <motion.div
                  className="bg-amber-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: '54%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          </RevealCard>

          {/* Tier 3: False */}
          <RevealCard
            index={2}
            className="bg-error-container/30 border-outline-variant/10 group flex flex-col rounded-3xl border p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
          >
            <div className="mb-8">
              <span className="bg-error text-on-error font-pretendard mb-4 inline-block rounded-lg px-3 py-1.5 text-xs font-bold tracking-widest uppercase">
                FALSE
              </span>
              <h4 className="text-on-error-container font-pretendard text-lg font-bold leading-tight">
                수도권 지하철 무료 운행 중단 루머 분석
              </h4>
            </div>
            <div className="mt-auto">
              <div className="text-error flex items-center gap-2">
                <TriangleAlert aria-hidden="true" className={ICON_SIZE.sm} />
                <span className="font-pretendard text-xs font-bold">
                  허위 정보 주의
                </span>
              </div>
              <p className="text-on-error-container/80 font-pretendard mt-2 text-xs leading-relaxed">
                공식 브리핑에서 부인된 사안입니다.
              </p>
            </div>
          </RevealCard>

          {/* AI Insight */}
          <RevealCard
            index={3}
            className="bg-primary text-on-primary border-primary-container/20 group relative flex flex-col overflow-hidden rounded-3xl border p-8 shadow-sm transition-all duration-300 hover:shadow-lg md:col-span-1 lg:col-span-1"
          >
            {/* Animated bg circles */}
            <div
              className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/[0.1]"
              style={{ animation: 'float 8s ease-in-out infinite' }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/[0.07]"
              style={{ animation: 'float 6s ease-in-out 2s infinite' }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute right-4 top-1/2 h-16 w-16 rounded-full bg-white/[0.06]"
              style={{ animation: 'float-slow 7s ease-in-out 1s infinite' }}
              aria-hidden="true"
            />
            <BrainCircuit
              aria-hidden="true"
              className={`text-on-primary-container mb-4 transition-transform duration-200 group-hover:scale-110 ${ICON_SIZE.lg}`}
            />
            <h4 className="font-pretendard mb-3 text-xl font-bold">
              AI 분석 패턴
            </h4>
            <p className="text-on-primary-container font-pretendard mb-6 text-sm leading-relaxed">
              최근 분석된 패턴에 따르면, 허위 정보 기사일수록 자극적인 썸네일과
              제목을 사용하는 경향이 관찰됩니다.
            </p>
            <button
              className="bg-primary-container font-pretendard inline-flex min-h-12 w-full items-center justify-center rounded-xl px-4 text-xs font-bold transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
              type="button"
            >
              분석 패턴 확인
            </button>
          </RevealCard>

          {/* Extension */}
          <RevealCard
            index={4}
            className="bg-surface-container-highest/50 rounded-3xl p-1 md:col-span-2 lg:col-span-3"
          >
            <div className="gradient-border bg-surface-container-lowest border-outline-variant/10 flex h-full flex-col items-start gap-8 rounded-2xl border p-8 shadow-sm md:flex-row md:items-center">
              <div className="flex-1">
                <h4 className="text-primary font-pretendard mb-2 text-xl font-bold">
                  브라우저 확장 프로그램
                </h4>
                <p className="text-on-surface-variant font-pretendard text-sm">
                  어떤 웹사이트에서든 마우스 우클릭 한 번으로 즉시 뉴스 진위
                  여부를 파악하세요.
                </p>
              </div>
              <button
                className="bg-surface-container-lowest text-secondary border-outline-variant/20 shadow-secondary/10 font-pretendard inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-8 font-bold shadow-xl transition-all hover:bg-secondary-container/30 hover:shadow-2xl active:scale-[0.98]"
                type="button"
              >
                <Puzzle aria-hidden="true" className={ICON_SIZE.sm} />
                Chrome에 추가하기
              </button>
            </div>
          </RevealCard>
        </div>
      </div>
    </section>
  );
}
