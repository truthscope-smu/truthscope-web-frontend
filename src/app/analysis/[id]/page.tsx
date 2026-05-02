'use client';
// rev.1 CX1-01 fix + rev.2 CX2-04/CX2-11 fix + rev.7 A4 reframe:
// BE controller 머지 (PR #28 + #29) — Phase 21 [id] page는 여전히 CSC (Provider state navigation flow).
// Phase 22+ findArticleById endpoint를 RSC + force-dynamic 격상 옵션 검토 가능 (현재는 client-only).
//
// W3-3 (rev.7): AttachToSessionButton actions slot 주입 — A4 reframe로 항상 409 ConflictException 시연.
import Link from 'next/link';
import { useArticle } from '@/app/providers/article.context';
import { ArticleCard } from '@/04-widgets/article-card';
import { AttachToSessionButton } from '@/05-features/attach-to-session';

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

  // rev.7 A4: snapshot의 sessionId가 없으면 attach 시도 자체가 무의미 (선행 분석 필요).
  const attachActions = snapshot.sessionId ? (
    <AttachToSessionButton
      articleId={snapshot.id}
      sessionId={snapshot.sessionId}
    />
  ) : null;

  return (
    <main className="p-[var(--spacing-24)]">
      <h1>분석 결과</h1>
      <ArticleCard snapshot={snapshot} actions={attachActions} />
    </main>
  );
}
