'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  ICON_SIZE,
  ShieldCheckIcon,
  BrainCircuitIcon,
  NetworkIcon,
  SearchIcon,
} from '@/07-shared/ui/icons';
import { EASE_OUT_EXPO } from '@/03-pages/home/ui/motion-variants';

const CAPABILITIES = [
  {
    icon: SearchIcon,
    label: '다수 기사 분석',
    description:
      '국내외 다양한 출처의 뉴스 기사를 자동으로 수집하고 검증합니다.',
    accent: 'landing-accent-blue',
    glow: 'rgba(0,150,255,0.14)',
  },
  {
    icon: ShieldCheckIcon,
    label: '교차 검증 기반',
    description:
      '복수의 공신력 있는 매체를 대조하여 사실관계 일치 여부를 판단합니다.',
    accent: 'landing-accent-purple',
    glow: 'rgba(104,26,187,0.14)',
  },
  {
    icon: BrainCircuitIcon,
    label: '빠른 AI 분석',
    description:
      'URL 입력 후 수 초 내에 자연어 처리 기반 분석 결과를 제공합니다.',
    accent: 'landing-accent-success',
    glow: 'rgba(34,197,94,0.14)',
  },
  {
    icon: NetworkIcon,
    label: '다양한 검증 소스',
    description:
      '국내외 공신력 있는 미디어 및 공공 데이터를 검증 소스로 활용합니다.',
    accent: 'landing-accent-blue',
    glow: 'rgba(0,150,255,0.14)',
  },
] as const;

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8"
    >
      {/* Gradient divider top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--color-brand-subtle) 50%, transparent 100%)',
        }}
      />

      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      >
        <span className="text-secondary font-pretendard mb-4 inline-block text-sm font-bold tracking-widest uppercase">
          Core Features
        </span>
        <h2 className="text-primary font-display text-3xl font-bold tracking-tight md:text-4xl">
          CheckMate의 핵심 기능
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
        {CAPABILITIES.map((cap, i) => (
          <motion.div
            key={cap.label}
            className="group relative rounded-2xl p-6 text-center transition-all duration-300"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 0.5,
              ease: EASE_OUT_EXPO,
              delay: i * 0.1,
            }}
          >
            {/* Hover glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: cap.glow }}
            />

            <div className="relative">
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 ${cap.accent}`}
              >
                <cap.icon className={ICON_SIZE.lg} aria-hidden="true" />
              </div>
              <h3 className="text-primary font-pretendard mb-2 text-sm font-bold md:text-base">
                {cap.label}
              </h3>
              <p className="text-on-surface-variant font-pretendard text-xs leading-relaxed md:text-sm">
                {cap.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gradient divider bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--color-brand-subtle) 50%, transparent 100%)',
        }}
      />
    </section>
  );
}
