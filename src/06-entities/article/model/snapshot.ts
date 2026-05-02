import type { ArticleStatus } from '@06-entities/article/model/article';

/**
 * Q7 LOCK — Provider state는 ArticleSnapshot (plain object). class instance 금지.
 * mutation 함정 + Object.is re-render 회피.
 *
 * rev.1 CX1-03 fix: ArticleStatus는 article.ts에서 export. snapshot.ts는 type import만.
 */
export interface ArticleSnapshot {
  id: string;
  url: string;
  title: string;
  content: string;
  status: ArticleStatus;
  sessionId: string | null;
  createdAt: string;
}
