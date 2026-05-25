'use client';

import Link from 'next/link';
import { useArticle } from '@/app/providers/article.context';
import { AnalysisResultWidget } from '@/04-widgets/analysis-result';
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
      className="inline-flex h-9 items-center rounded-full border border-[var(--analysis-hairline)] px-[var(--spacing-16)] text-sm text-[var(--analysis-link)]"
      href="/analysis/new"
    >
      새 분석 시작
    </Link>
  );

  return (
    <AnalysisResultWidget
      actions={attachActions}
      article={
        snapshot
          ? {
              title: snapshot.title,
              url: snapshot.url,
              sessionId: snapshot.sessionId,
            }
          : undefined
      }
    />
  );
}
