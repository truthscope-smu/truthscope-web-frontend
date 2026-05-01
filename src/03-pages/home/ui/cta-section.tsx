'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import Link from 'next/link';
import { ArrowRightIcon, ICON_SIZE } from '@/07-shared/ui/icons';
import { EASE_OUT_EXPO } from '@/03-pages/home/ui/motion-variants';

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 pb-24 pt-8 sm:px-8">
      <motion.div
        className="relative overflow-hidden rounded-[2rem] p-12 text-center md:p-20"
        style={{
          background:
            'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 40%, var(--color-accent-blue) 70%, var(--color-accent-purple) 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradient-shift 8s ease infinite',
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      >
        {/* Animated decorative circles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/[0.1]"
          style={{ animation: 'float 8s ease-in-out infinite' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/[0.08]"
          style={{ animation: 'float 7s ease-in-out 2s infinite' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-1/4 top-1/3 h-32 w-32 rounded-full bg-white/[0.06]"
          style={{ animation: 'float-slow 9s ease-in-out 1s infinite' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1/4 left-1/3 h-20 w-20 rounded-full bg-white/[0.07]"
          style={{ animation: 'float 6s ease-in-out 3s infinite' }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10">
          <motion.h2
            className="font-display mb-4 text-3xl font-black text-white md:text-5xl"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT_EXPO }}
          >
            뉴스의 진실,
            <br />
            지금 바로 확인하세요
          </motion.h2>
          <motion.p
            className="font-pretendard mx-auto mb-10 max-w-lg text-base leading-relaxed text-white/80 md:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT_EXPO }}
          >
            CheckMate와 함께라면 가짜 뉴스에 더 이상 속지 않습니다. 무료로
            시작하세요.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.4, ease: EASE_OUT_EXPO }}
          >
            <Link
              href="/"
              className="font-pretendard group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-10 text-base font-bold shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ color: 'var(--color-brand-primary)' }}
            >
              무료로 분석 시작
              <ArrowRightIcon
                className={`${ICON_SIZE.md} transition-transform duration-200 group-hover:translate-x-1`}
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/about"
              className="font-pretendard inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-white/30 px-10 text-base font-bold text-white transition-all hover:border-white/60 hover:bg-white/10 active:scale-[0.98]"
            >
              서비스 소개
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
