'use client';
// rev.1 CX1-01 fix + rev.2 CX2-04/CX2-11 fix:
// BE controller 부재 → server-side findArticleById 불가. Phase 21에서 [id] page는 CSC.
// Provider state는 navigation flow로 채워짐 — direct URL access (bookmark/refresh) 시 빈 화면.
// Phase 22+ findArticleById endpoint 도입 후 RSC + force-dynamic 격상.
//
// W3 BE 무관 영역 진행 — AttachToSessionButton (T3.3)는 BE phase 21-5 머지 후 W-1b 통과 시 actions slot에 주입.
import Link from 'next/link';
import { useArticle } from '@/app/providers/article.context';
import { ArticleCard } from '@/04-widgets/article-card';

export default function AnalysisDetailPage() {
  const { snapshot } = useArticle();

  if (!snapshot) {
    return (
      <main className="p-[var(--spacing-24)]">
        <h2 className="text-[var(--color-text-heading)]">
          분석 결과를 불러올 수 없습니다
        </h2>
        <p className="mt-[var(--spacing-10)] text-[var(--color-text-secondary)]">
          이 화면은 새 분석 직후에만 표시됩니다. 다시 조회 기능은 다음 버전에서
          제공 예정입니다.
        </p>
        <Link
          href="/analysis/new"
          className="mt-[var(--spacing-16)] inline-block rounded px-[var(--spacing-16)] py-[var(--spacing-8)] bg-[var(--color-accent-blue)] text-[var(--color-text-on-brand)]"
        >
          새 분석 시작
        </Link>
      </main>
    );
  }

  return (
    <main className="p-[var(--spacing-24)]">
      <h1>분석 결과</h1>
      <ArticleCard snapshot={snapshot} />
    </main>
  );
}
