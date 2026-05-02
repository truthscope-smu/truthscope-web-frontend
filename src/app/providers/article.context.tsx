'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ArticleSnapshot } from '@/06-entities/article';

interface ArticleContextValue {
  snapshot: ArticleSnapshot | null;
  setSnapshot: (snapshot: ArticleSnapshot | null) => void;
}

const ArticleContext = createContext<ArticleContextValue | null>(null);

export function ArticleProvider({
  initialSnapshot,
  children,
}: {
  initialSnapshot?: ArticleSnapshot;
  children: ReactNode;
}) {
  // Q7 LOCK — state는 ArticleSnapshot (plain). class instance 금지.
  const [snapshot, setSnapshot] = useState<ArticleSnapshot | null>(
    initialSnapshot ?? null
  );

  return (
    <ArticleContext.Provider value={{ snapshot, setSnapshot }}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticle(): ArticleContextValue {
  const ctx = useContext(ArticleContext);
  if (!ctx) {
    throw new Error('useArticle must be used within ArticleProvider');
  }
  return ctx;
}
