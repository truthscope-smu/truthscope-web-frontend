/**
 * S2-08 skeleton-only types. Sprint 4에서 실 데이터 (BE response) 결합 시
 * 06-entities/analysis-result/ aggregate에 의해 대체될 가능성 있음.
 */

export type Verdict = 'TRUE' | 'PARTIAL' | 'FALSE' | 'UNVERIFIED' | 'PENDING';

export interface RelatedArticleRef {
  id: string;
  title: string;
  source?: string;
}

export interface FactCheckSnapshot {
  verdict?: Verdict;
  /** 0-100. 모델 자신감 등 BE 정의 따라감 (Sprint 4 결정). */
  confidence?: number;
  claim?: string;
  evidence?: string[];
}

export interface ContextSnapshot {
  summary?: string;
  relatedArticles?: RelatedArticleRef[];
  sourceCount?: number;
}

export interface ResultCardSnapshot {
  factCheck?: FactCheckSnapshot;
  context?: ContextSnapshot;
}
