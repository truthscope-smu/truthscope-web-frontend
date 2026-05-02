'use client';
import type { ReactNode } from 'react';
import { ArticleProvider } from '@/app/providers/article.context';

// rev.2 CX2-02 fix: provider mount를 [id]/layout.tsx에서 parent /analysis/layout.tsx로 격상.
// Next.js App Router에서 /analysis/new는 [id] sibling — [id]/layout이 cover 못 함.
// /analysis/layout.tsx은 /analysis/new + /analysis/[id] 모두 children으로 가짐.
//
// Q9 LOCK: client layout에 segment config 금지. force-dynamic은 page.tsx에만.
export default function AnalysisLayout({ children }: { children: ReactNode }) {
  return <ArticleProvider>{children}</ArticleProvider>;
}
