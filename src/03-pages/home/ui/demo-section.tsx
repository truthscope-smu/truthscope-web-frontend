'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import {
  ICON_SIZE,
  ShieldCheckIcon,
  TriangleAlertIcon,
  BadgeCheckIcon,
} from '@/07-shared/ui/icons';
import { EASE_OUT_EXPO } from '@/03-pages/home/ui/motion-variants';
import { AnimatedCounter } from '@/03-pages/home/ui/animated-counter';

const DEMO_CLAIMS = [
  {
    id: 'claim-1',
    text: '한국은행이 2026년 내로 CBDC를 전면 도입한다',
    verdict: 'partial' as const,
    score: 42,
    label: '부분 사실',
    detail:
      '한국은행은 CBDC 파일럿 테스트를 진행 중이나, 전면 도입 시점은 공식 확정되지 않았습니다.',
    sources: ['한국은행 보도자료', 'BIS 리포트'],
  },
  {
    id: 'claim-2',
    text: '서울시가 대중교통 무료화를 추진 중이다',
    verdict: 'false' as const,
    score: 12,
    label: '허위',
    detail:
      '서울시 교통정책과 공식 브리핑에서 해당 사안은 검토된 바 없다고 밝혔습니다.',
    sources: ['서울시 공식 보도자료'],
  },
  {
    id: 'claim-3',
    text: 'AI 기반 팩트체크 정확도가 인간 전문가를 능가했다',
    verdict: 'verified' as const,
    score: 91,
    label: '사실',
    detail:
      'Nature 게재 논문에 따르면, 특정 도메인에서 AI 교차검증이 인간 검증 대비 높은 일치율을 보였습니다.',
    sources: ['Nature (2025)', 'MIT Tech Review'],
  },
];

const VERDICT_STYLES = {
  verified: {
    badge: 'bg-green-100 text-green-800',
    bar: 'bg-green-500',
    glow: '0 0 30px rgba(34,197,94,0.3), 0 0 60px rgba(34,197,94,0.1)',
    icon: ShieldCheckIcon,
  },
  partial: {
    badge: 'bg-amber-100 text-amber-800',
    bar: 'bg-amber-500',
    glow: '0 0 30px rgba(245,158,11,0.3), 0 0 60px rgba(245,158,11,0.1)',
    icon: BadgeCheckIcon,
  },
  false: {
    badge: 'bg-red-100 text-red-800',
    bar: 'bg-red-500',
    glow: '0 0 30px rgba(239,68,68,0.3), 0 0 60px rgba(239,68,68,0.1)',
    icon: TriangleAlertIcon,
  },
} as const;

export function DemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const activeClaim = DEMO_CLAIMS[activeIndex];
  const activeStyle = activeClaim
    ? VERDICT_STYLES[activeClaim.verdict]
    : VERDICT_STYLES.verified;

  function handleSelectClaim(index: number) {
    if (index === activeIndex && showResult) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    setActiveIndex(index);
    setShowResult(false);
    setIsAnalyzing(true);

    timerRef.current = setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 1800);
  }

  useEffect(() => {
    if (isInView && !showResult && !isAnalyzing) {
      handleSelectClaim(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!activeClaim) return null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24"
      style={{ background: 'var(--color-bg-surface)' }}
    >
      {/* Decorative bg elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full opacity-[0.1]"
        style={{
          background:
            'radial-gradient(circle, var(--color-accent-purple) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-10 h-60 w-60 rounded-full opacity-[0.1]"
        style={{
          background:
            'radial-gradient(circle, var(--color-accent-blue) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        >
          <span className="text-secondary font-pretendard mb-4 inline-block text-sm font-bold tracking-widest uppercase">
            체험하기
          </span>
          <h2 className="text-primary font-display text-3xl font-bold tracking-tight md:text-4xl">
            분석 프로세스를 직접 확인하세요
          </h2>
          <p className="text-on-surface-variant font-pretendard mx-auto mt-4 max-w-xl text-lg">
            아래 샘플 클레임을 클릭하면 CheckMate의 검증 과정을 미리 체험할 수
            있습니다.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-8 lg:grid-cols-2"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.2 }}
        >
          {/* Left: Claims list */}
          <div className="space-y-3">
            <p className="text-on-surface-variant font-pretendard mb-4 text-xs font-bold tracking-widest uppercase">
              샘플 검증 클레임
            </p>
            {DEMO_CLAIMS.map((claim, i) => (
              <button
                key={claim.id}
                type="button"
                onClick={() => handleSelectClaim(i)}
                className={`gradient-border w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
                  i === activeIndex
                    ? 'border-secondary/30 bg-surface-container-lowest shadow-lg'
                    : 'border-outline-variant/10 bg-surface-container-lowest/60 hover:bg-surface-container-lowest hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                      i === activeIndex
                        ? 'bg-secondary text-on-secondary shadow-md'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-primary font-pretendard text-sm font-semibold leading-snug">
                    {claim.text}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Analysis result */}
          <div
            className="bg-surface-container-lowest border-outline-variant/10 relative overflow-hidden rounded-3xl border shadow-xl transition-shadow duration-300"
            style={{ boxShadow: showResult ? activeStyle.glow : undefined }}
          >
            {/* Window chrome header */}
            <div className="border-b border-gray-100 px-8 py-5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="text-on-surface-variant font-pretendard ml-2 text-xs">
                  CheckMate Analysis Engine
                </span>
                {isAnalyzing && (
                  <span className="ml-auto font-pretendard text-xs text-blue-500 font-medium">
                    분석중...
                  </span>
                )}
              </div>
            </div>

            {/* Scan line when analyzing */}
            {isAnalyzing && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 right-0 top-14 h-16 opacity-20"
                style={{
                  background:
                    'linear-gradient(180deg, transparent, var(--color-accent-blue), transparent)',
                  animation: 'scan-line 1.5s ease-in-out infinite',
                }}
              />
            )}

            <div className="p-8">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div
                    key="analyzing"
                    className="flex flex-col items-center justify-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Gradient spinner */}
                    <div className="relative mb-8" role="status">
                      <div
                        className="h-20 w-20 rounded-full"
                        style={{
                          border: '3px solid var(--color-bg-surface)',
                          borderTopColor: 'var(--color-accent-blue)',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                      <div
                        className="absolute inset-1 rounded-full"
                        style={{
                          border: '3px solid transparent',
                          borderTopColor: 'var(--color-accent-purple)',
                          animation: 'spin 1.5s linear infinite reverse',
                        }}
                      />
                    </div>
                    <p className="text-on-surface-variant font-pretendard text-sm font-medium">
                      AI가 교차 분석 중입니다...
                    </p>
                    <div className="mt-3 flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: 'var(--color-brand-secondary)' }}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : showResult ? (
                  <motion.div
                    key={`result-${activeIndex}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                  >
                    {/* Verdict badge */}
                    <div className="mb-6 flex items-center gap-3">
                      <motion.div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${activeStyle.badge}`}
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 12,
                          delay: 0.1,
                        }}
                      >
                        <activeStyle.icon
                          className={ICON_SIZE.md}
                          aria-hidden="true"
                        />
                      </motion.div>
                      <div>
                        <span
                          className={`inline-block rounded-lg px-3 py-1.5 text-xs font-bold uppercase ${activeStyle.badge}`}
                        >
                          {activeClaim.label}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="mb-6">
                      <div className="mb-2 flex items-baseline gap-2">
                        <span className="text-primary text-5xl font-black">
                          <AnimatedCounter
                            target={activeClaim.score}
                            duration={1.2}
                          />
                        </span>
                        <span className="text-on-surface-variant font-pretendard text-sm font-bold">
                          / 100
                        </span>
                      </div>
                      <div className="bg-surface-container-highest h-2.5 w-full overflow-hidden rounded-full">
                        <motion.div
                          className={`h-full rounded-full ${activeStyle.bar}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${activeClaim.score}%` }}
                          transition={{
                            duration: 0.8,
                            ease: 'easeOut',
                            delay: 0.2,
                          }}
                        />
                      </div>
                    </div>

                    {/* Detail */}
                    <p className="text-on-surface font-pretendard mb-6 text-sm leading-relaxed">
                      {activeClaim.detail}
                    </p>

                    {/* Sources */}
                    <div className="border-surface-container border-t pt-4">
                      <p className="text-on-surface-variant font-pretendard mb-2 text-xs font-bold tracking-widest uppercase">
                        검증 출처
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeClaim.sources.map((source, i) => (
                          <motion.span
                            key={source}
                            className="bg-surface-container font-pretendard rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                          >
                            {source}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Sample data disclaimer */}
                    <p className="text-on-surface-variant/60 font-pretendard mt-5 text-[11px] leading-relaxed">
                      * 위 결과는 샘플 데이터 기반의 예시이며, 실제 서비스에서는
                      실시간 데이터로 산출됩니다.
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
