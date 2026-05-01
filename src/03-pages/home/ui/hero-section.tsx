'use client';

import { useRef, useCallback } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'motion/react';
import { AnalysisForm } from '@/05-features/analysis';
import { BadgeCheckIcon as BadgeCheck, ICON_SIZE } from '@/07-shared/ui/icons';
import { stagger, fadeUp, scaleIn } from '@/03-pages/home/ui/motion-variants';
import { AnimatedCounter } from '@/03-pages/home/ui/animated-counter';

/* ------------------------------------------------------------------ */
/*  Animated Gradient Orb                                              */
/* ------------------------------------------------------------------ */

function GradientOrb({
  className,
  color,
  delay = 0,
}: {
  className?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${className}`}
      style={{ background: color }}
      animate={{
        y: [0, -30, 0],
        x: [0, 16, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Animated Gauge                                                     */
/* ------------------------------------------------------------------ */

function TrustGauge() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const fillRatio = 0.72;

  const CX = 50;
  const ARC_R = 42;
  const ARC_CY = 50;
  const arcPath = `M ${CX - ARC_R} ${ARC_CY} A ${ARC_R} ${ARC_R} 0 0 1 ${CX + ARC_R} ${ARC_CY}`;
  const computedArcLength = Math.PI * ARC_R;
  const computedDashOffset = computedArcLength * (1 - fillRatio);

  const endAngleComputed = Math.PI * fillRatio;
  const dotX = CX - ARC_R * Math.cos(endAngleComputed);
  const dotY = ARC_CY - ARC_R * Math.sin(endAngleComputed);

  return (
    <div className="relative w-full" style={{ aspectRatio: '1 / 0.55' }}>
      <svg
        ref={ref}
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 55"
        preserveAspectRatio="xMidYMax meet"
        role="img"
        aria-label="신뢰도 점수 84점 게이지"
      >
        <defs>
          <linearGradient id="gradient-hero" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop
              offset="0%"
              style={{ stopColor: 'var(--color-brand-primary)' }}
            />
            <stop
              offset="50%"
              style={{ stopColor: 'var(--color-brand-secondary)' }}
            />
            <stop
              offset="100%"
              style={{ stopColor: 'var(--color-accent-blue)' }}
            />
          </linearGradient>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          </filter>
        </defs>

        <path
          d={arcPath}
          fill="none"
          stroke="var(--color-brand-subtle)"
          strokeLinecap="round"
          strokeWidth="6"
          opacity="0.3"
        />

        <motion.path
          d={arcPath}
          fill="none"
          stroke="url(#gradient-hero)"
          strokeLinecap="round"
          strokeWidth="6"
          strokeDasharray={computedArcLength}
          filter="url(#gauge-glow)"
          initial={{ strokeDashoffset: computedArcLength }}
          animate={
            isInView ? { strokeDashoffset: computedDashOffset } : undefined
          }
          transition={{
            duration: 1.4,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.3,
          }}
        />

        <motion.circle
          cx={dotX}
          cy={dotY}
          r="4"
          fill="var(--color-accent-blue)"
          filter="url(#dot-glow)"
          opacity="0"
          animate={isInView ? { opacity: [0, 0.6, 0.3] } : undefined}
          transition={{ duration: 1.8, delay: 1.2, ease: 'easeOut' }}
        />
        <motion.circle
          cx={dotX}
          cy={dotY}
          r="2.5"
          fill="var(--color-accent-blue)"
          opacity="0"
          animate={isInView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.4, delay: 1.5 }}
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating Badges around gauge                                       */
/* ------------------------------------------------------------------ */

function FloatingBadge({
  children,
  className,
  delay = 0,
  floatDelay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  floatDelay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-2xl border border-white/40 bg-white/80 px-3.5 py-2.5 shadow-xl backdrop-blur-xl transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ animation: `float-slow 6s ease-in-out ${floatDelay}s infinite` }}
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mouse Parallax Container                                           */
/* ------------------------------------------------------------------ */

function ParallaxGauge({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseX.set((e.clientX - cx) / 20);
      mouseY.set((e.clientY - cy) / 20);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <motion.div style={{ x: springX, y: springY }}>{children}</motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */

export function HeroSection() {
  return (
    <section className="relative mb-32 overflow-hidden">
      {/* Background grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--color-brand-primary) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Animated gradient orbs */}
      <GradientOrb
        className="h-[550px] w-[550px] -top-24 right-0 opacity-[0.2]"
        color="radial-gradient(circle, var(--color-brand-subtle) 0%, transparent 70%)"
        delay={0}
      />
      <GradientOrb
        className="h-[400px] w-[400px] -bottom-32 -left-24 opacity-[0.16]"
        color="radial-gradient(circle, var(--color-accent-blue) 0%, transparent 70%)"
        delay={2}
      />
      <GradientOrb
        className="h-[240px] w-[240px] top-1/3 left-1/3 opacity-[0.1]"
        color="radial-gradient(circle, var(--color-accent-purple) 0%, transparent 70%)"
        delay={4}
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 py-20 sm:px-8 md:py-28 lg:flex-row lg:gap-20">
        <motion.div
          className="flex-1 space-y-8"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <motion.div variants={fadeUp}>
            <span className="bg-secondary-container/30 text-on-secondary-container glow-blue inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                  style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              AI-Powered Fact Checking
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl font-black leading-tight tracking-tight md:text-7xl md:leading-[1.08]"
          >
            <span className="text-shimmer">뉴스 신뢰도,</span>
            <br />
            <span className="text-primary">CheckMate로</span>
            <br />
            <span className="text-primary">확인하세요</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-on-surface-variant font-pretendard max-w-lg text-lg leading-relaxed"
          >
            복잡한 정보의 시대, 데이터와 인공지능이 뉴스 배후의 진실을
            분석합니다. 투명한 검증 프로세스로 신뢰할 수 있는 정보를 선별하세요.
          </motion.p>

          <motion.div variants={fadeUp}>
            <AnalysisForm />
          </motion.div>
        </motion.div>

        {/* Hero Visual -- Parallax Gauge */}
        <motion.div
          className="relative w-full flex-1 max-w-md"
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <ParallaxGauge>
            <div className="relative isolate mx-auto w-full max-w-md">
              {/* Outer glow ring */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(92vw,28rem)] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-55"
                style={{
                  background:
                    'radial-gradient(circle, var(--color-brand-subtle) 0%, transparent 70%)',
                  animation: 'float 6s ease-in-out infinite',
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-8 -z-10 h-40 w-40 rounded-full opacity-35"
                style={{
                  background:
                    'radial-gradient(circle, var(--color-accent-blue) 0%, transparent 70%)',
                  animation: 'float 5s ease-in-out 1s infinite',
                }}
              />

              {/* Concentric decorative rings */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -z-[1] aspect-square w-[108%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-blue-200/40"
                style={{ animation: 'spin 60s linear infinite' }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -z-[1] aspect-square w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-blue-100/25"
                style={{ animation: 'spin 90s linear infinite reverse' }}
              />

              <div className="bg-surface-container-lowest border-outline-variant/10 glow-blue relative aspect-square rounded-full border text-center shadow-2xl transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(0,150,255,0.3),0_0_100px_rgba(0,150,255,0.15)]">
                {/* Inner radial gradient overlay */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.6) 0%, transparent 60%)',
                  }}
                />

                {/* Gauge arc - absolute in upper area */}
                <div className="pointer-events-none absolute left-[9%] right-[9%] top-[6%]">
                  <TrustGauge />
                </div>

                {/* Centered content group: score + labels */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <span className="text-gradient-brand text-5xl font-black leading-none drop-shadow-[0_0_12px_rgba(0,150,255,0.2)] sm:text-6xl">
                    <AnimatedCounter target={84} duration={1.8} />
                  </span>
                  <span className="font-pretendard mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-green-600">
                    <BadgeCheck aria-hidden="true" className={ICON_SIZE.sm} />
                    Score
                  </span>
                  <h3 className="text-gradient-brand font-pretendard mt-2 text-lg font-bold sm:text-xl">
                    높은 신뢰도
                  </h3>
                  <p className="text-on-surface-variant font-pretendard text-xs sm:text-sm">
                    예시 분석 결과
                  </p>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                    <span className="font-pretendard inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-green-500"
                        aria-hidden="true"
                      />
                      다수 매체 일치
                    </span>
                    <span className="font-pretendard inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-blue-500"
                        aria-hidden="true"
                      />
                      공식 발표 기반
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating context badges */}
              <FloatingBadge
                className="-left-4 top-8 glow-blue sm:-left-12"
                delay={1.0}
                floatDelay={0}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M13.3 4.3 6 11.6 2.7 8.3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="font-pretendard text-xs font-bold text-gray-700">
                    3개 매체 일치
                  </span>
                </div>
              </FloatingBadge>

              <FloatingBadge
                className="-right-4 bottom-24 glow-blue sm:-right-16"
                delay={1.3}
                floatDelay={1}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 3v5l3 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="8"
                        cy="8"
                        r="5.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </span>
                  <span className="font-pretendard text-xs font-bold text-gray-700">
                    실시간 분석
                  </span>
                </div>
              </FloatingBadge>

              <FloatingBadge
                className="-right-2 top-4 sm:-right-8"
                delay={1.6}
                floatDelay={2}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-700 shadow-[0_0_8px_rgba(147,51,234,0.3)]">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 2v2m0 8v2M2 8h2m8 0h2M4.2 4.2l1.4 1.4m4.8 4.8 1.4 1.4M11.8 4.2l-1.4 1.4M5.6 10.6 4.2 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="font-pretendard text-xs font-bold text-gray-700">
                    AI 검증
                  </span>
                </div>
              </FloatingBadge>
            </div>
          </ParallaxGauge>
        </motion.div>
      </div>
    </section>
  );
}
