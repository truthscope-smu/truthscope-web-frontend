'use client';

import Link from 'next/link';
import { useArticle } from '@/app/providers/article.context';
import { ResultCard, type ResultCardSnapshot } from '@/04-widgets/result-card';
import { AttachToSessionButton } from '@/05-features/attach-to-session';

export default function AnalysisDetailPage() {
  const { snapshot } = useArticle();

  const attachActions = snapshot?.sessionId ? (
    <AttachToSessionButton
      articleId={snapshot.id}
      sessionId={snapshot.sessionId}
    />
  ) : (
    <Link
      className="inline-flex h-9 items-center rounded-full border border-[var(--color-border-subtle)] px-[var(--spacing-16)] text-sm text-[var(--color-brand-secondary)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-primary)]"
      href="/analysis/new"
    >
      새 분석 시작
    </Link>
  );

  // Sprint 4 BE 매핑 전 임시 ResultCardSnapshot. Task #10 후속 PR에서 verdict 5종 정본
  // (FACT/MOSTLY_FACT/PARTLY_FACT/MOSTLY_NOT_FACT/NOT_FACT + 비판정 3종) + Spring Boot
  // AnalysisSession.completeCascade 응답 매핑으로 교체된다.
  const cardSnapshot: ResultCardSnapshot | undefined = snapshot
    ? {
        factCheck: {
          verdict: 'PENDING',
          claim: snapshot.title,
        },
        context: {
          summary: `분석 대상 기사: ${snapshot.url}`,
          sourceCount: 0,
        },
      }
    : undefined;

  return (
    <main className="mx-auto max-w-4xl px-[var(--spacing-24)] py-[var(--spacing-32)]">
      <header className="mb-[var(--spacing-24)] flex items-start justify-between gap-[var(--spacing-16)]">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-heading)]">
            분석 결과
          </h1>
          {snapshot?.title && (
            <p className="mt-[var(--spacing-8)] text-sm text-[var(--color-text-secondary)]">
              {snapshot.title}
            </p>
          )}
        </div>
        {attachActions}
      </header>
      <ResultCard snapshot={cardSnapshot} />
    </main>
  );
}
