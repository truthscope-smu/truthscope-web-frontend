'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  ICON_SIZE,
  Link2Icon,
  BrainCircuitIcon,
  ShieldCheckIcon,
} from '@/07-shared/ui/icons';
import { EASE_OUT_EXPO } from '@/03-pages/home/ui/motion-variants';

const STEPS = [
  {
    icon: Link2Icon,
    step: '01',
    title: 'URL 입력',
    description: '검증하고 싶은 뉴스 기사의 URL을 붙여넣기만 하면 됩니다.',
    accent: 'landing-accent-blue',
    glow: 'rgba(0,150,255,0.22)',
    ring: 'rgba(0,150,255,0.45)',
  },
  {
    icon: BrainCircuitIcon,
    step: '02',
    title: 'AI 교차 분석',
    description:
      '다수의 공신력 있는 매체와 교차 대조하여 사실관계를 다각도로 검증합니다.',
    accent: 'landing-accent-purple',
    glow: 'rgba(104,26,187,0.2)',
    ring: 'rgba(104,26,187,0.4)',
  },
  {
    icon: ShieldCheckIcon,
    step: '03',
    title: '결과 확인',
    description:
      '신뢰도 점수와 함께 근거 출처, 검증 로직을 투명하게 제공합니다.',
    accent: 'landing-accent-success',
    glow: 'rgba(34,197,94,0.2)',
    ring: 'rgba(34,197,94,0.4)',
  },
] as const;

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
      <motion.div
        className="mb-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      >
        <span className="text-secondary font-pretendard mb-4 inline-block text-sm font-bold tracking-widest uppercase">
          How it works
        </span>
        <h2 className="text-primary font-display text-3xl font-bold tracking-tight md:text-4xl">
          3단계로 끝나는 팩트체크
        </h2>
        <p className="text-on-surface-variant font-pretendard mx-auto mt-4 max-w-xl text-lg">
          복잡한 가입이나 설정 없이, URL 하나로 시작하세요.
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
        {/* Animated connecting line (desktop) */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-16 hidden h-[2px] md:block"
          style={{
            background:
              'linear-gradient(90deg, transparent 8%, var(--color-accent-blue) 30%, var(--color-accent-purple) 50%, var(--color-accent-blue) 70%, transparent 92%)',
            backgroundSize: '200% 100%',
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={
            isInView
              ? {
                  opacity: 0.6,
                  scaleX: 1,
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }
              : undefined
          }
          transition={{
            opacity: { duration: 0.6, delay: 0.3 },
            scaleX: { duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO },
            backgroundPosition: {
              duration: 6,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        />

        {STEPS.map((step, i) => (
          <motion.div
            key={step.step}
            className="group relative flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 0.55,
              ease: EASE_OUT_EXPO,
              delay: i * 0.15 + 0.2,
            }}
          >
            {/* Icon with pulse ring */}
            <div className="relative z-10 mb-6">
              {/* Pulse ring */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `0 0 0 0 ${step.ring}`,
                  animation: 'pulse-ring 2s ease-out infinite',
                  background: step.glow,
                }}
              />
              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-[1.15] group-hover:shadow-xl ${step.accent}`}
                style={{
                  boxShadow: `0 6px 32px ${step.glow}`,
                }}
              >
                <step.icon className={ICON_SIZE.lg} aria-hidden="true" />
              </div>
            </div>

            <span className="text-on-surface-variant/40 font-pretendard mb-2 text-xs font-black tracking-widest">
              STEP {step.step}
            </span>
            <h3 className="text-primary font-pretendard mb-3 text-xl font-bold">
              {step.title}
            </h3>
            <p className="text-on-surface-variant font-pretendard max-w-xs text-sm leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
