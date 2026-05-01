'use client';

import { HeroSection } from '@/03-pages/home/ui/hero-section';
import { HowItWorksSection } from '@/03-pages/home/ui/how-it-works-section';
import { DemoSection } from '@/03-pages/home/ui/demo-section';
import { StatsSection } from '@/03-pages/home/ui/stats-section';
import { BentoSection } from '@/03-pages/home/ui/bento-section';
import { CtaSection } from '@/03-pages/home/ui/cta-section';

/**
 * 03-pages -- Home Page
 * 랜딩 페이지의 메인 화면을 조립합니다.
 */
export function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <DemoSection />
      <StatsSection />
      <BentoSection />
      <CtaSection />
    </main>
  );
}
