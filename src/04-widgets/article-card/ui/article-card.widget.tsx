'use client';
import { useMemo, type ReactNode } from 'react';
import { Article, type ArticleSnapshot } from '@/06-entities/article';
import { cn } from '@/07-shared/lib/cn';

interface Props {
  snapshot: ArticleSnapshot;
  /**
   * rev.1 CX1-04 fix: AttachButton을 slot으로 주입 — ArticleCard 자체는 provider 의존성 없음.
   * 이로 인해 T4.2 browser test에서 provider 없이 ArticleCard 렌더 가능.
   * 사용처(예: app/analysis/[id]/page.tsx)에서
   * `<ArticleCard snapshot={s} actions={<AttachToSessionButton .../>} />`.
   */
  actions?: ReactNode;
  className?: string;
}

export function ArticleCard({ snapshot, actions, className }: Props) {
  // Q10 LOCK: useMemo로 snapshot → Article instance round-trip
  const article = useMemo(() => Article.rehydrate(snapshot), [snapshot]);

  // rev.2 R2-05/CX2-05 fix: placeholder string user-facing 회피 — 한국어 UX 친화 displayTitle.
  // 내부 phase 정보는 ADR-006/PR description/comment에만 표시.
  const isPlaceholderTitle = article.title.startsWith('(서버에서 추출');
  const displayTitle = isPlaceholderTitle ? '기사 제목 추출 중' : article.title;

  return (
    <article
      className={cn(
        'rounded p-[var(--spacing-16)] bg-[var(--color-bg-surface)]',
        className
      )}
    >
      <h2 className="text-[var(--color-text-heading)] text-lg font-bold">
        {displayTitle}
      </h2>
      <p className="text-[var(--color-text-secondary)] text-sm mt-[var(--spacing-8)]">
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          {article.url}
        </a>
      </p>
      <p className="mt-[var(--spacing-10)] text-[var(--color-text-primary)]">
        상태: {article.status === 'EXTRACTED' ? '추출 완료' : '세션 부착됨'}
        {article.sessionId && ` (세션 ID: ${article.sessionId})`}
      </p>
      {article.status === 'EXTRACTED' && actions && (
        <div className="mt-[var(--spacing-16)]">{actions}</div>
      )}
    </article>
  );
}
