// FSD 슬라이스 독립성: article 슬라이스의 동명 타입을 import하지 않고 자체 정의(cross-slice 금지).
// fsd/no-cross-slice-dependency ESLint 룰 준수(CX-2).
export type AnalysisSessionStatus =
  | 'PENDING'
  | 'EXTRACTING'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED';

export interface AnalysisSessionListItem {
  sessionId: string;
  articleId: string | null;
  articleTitle: string | null;
  articleUrl: string | null;
  articleDomain: string | null;
  status: AnalysisSessionStatus;
  totalScore: number | null; // null = 검증 가능 주장 없음 (ADR-019)
  requestedAt: string; // ISO
  completedAt: string | null; // ISO
}
