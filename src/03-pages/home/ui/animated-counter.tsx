'use client';

import { useEffect, useRef } from 'react';
import {
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  target,
  duration = 1.6,
  suffix = '',
  prefix = '',
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, {
    duration: duration * 1000,
    bounce: 0,
  });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    if (isInView) motionVal.set(target);
  }, [isInView, motionVal, target]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${String(v)}${suffix}`;
      }
    });
    return unsubscribe;
  }, [display, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
