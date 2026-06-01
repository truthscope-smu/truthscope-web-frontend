export type VerificationVerdict =
  | 'SUPPORTED'
  | 'CONTRADICTED'
  | 'INSUFFICIENT'
  | 'TIME_SENSITIVE'
  | 'OUT_OF_SCOPE';

export type EvidenceStance = 'supports' | 'refutes' | 'neutral'; // BE 소문자

export type SourceTransparencyBand =
  | 'ALL_EXPLICIT'
  | 'SOME_UNCLEAR'
  | 'MISSING_SOURCE';

export type TruthLabelValue =
  | 'FACT'
  | 'MOSTLY_FACT'
  | 'PARTLY_FACT'
  | 'MOSTLY_NOT_FACT'
  | 'NOT_FACT';

export type ClaimScoreStatusValue =
  | 'INSUFFICIENT'
  | 'TIME_SENSITIVE'
  | 'OUT_OF_SCOPE';

export interface EvidenceDto {
  url: string;
  publisher: string;
  title: string;
  stance: EvidenceStance;
  summary: string;
}

export interface SourceTransparencySummaryDto {
  explicitCount: number;
  ambiguousCount: number;
  noneCount: number;
  band: SourceTransparencyBand;
}

/** BE CoverageSummary record (8필드) */
export interface CoverageSummaryDto {
  scorableCount: number;
  excludedCount: number;
  insufficientCount: number;
  timeSensitiveCount: number;
  outOfScopeCount: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
}

export interface ClaimVerificationItemDto {
  claimId: string;
  claimText: string;
  speakerName: string | null;
  isQuotedClaim: boolean;
  originalContext: string | null;
  tier: number | null; // A8: 수신하나 미표시(향후 per-claim tier 배지 후보)
  score: number | null; // Tier3/비판정/미검증 = null
  verdict: VerificationVerdict;
  reason: string;
  disclaimer: string | null; // Tier2만
  verifiedAt: string; // ISO
  truthLabel: TruthLabelValue | null; // SCORABLE이면 채워짐
  claimScoreStatus: ClaimScoreStatusValue | null; // 비판정이면 채워짐
  evidence: EvidenceDto[];
}

export interface ArticleVerificationResponse {
  articleId: string;
  url: string;
  title: string | null;
  status: string; // SessionStatus.name(): PENDING|EXTRACTING|ANALYZING|COMPLETED|FAILED
  analysisCompletedAt: string | null; // ISO
  totalScore: number | null; // null=검증가능 claim 0
  articleLabel: string | null;
  coverage: CoverageSummaryDto | null;
  tier1Count: number | null;
  tier2Count: number | null;
  tier3Count: number | null; // 최상위(AnalysisSession). FE 미표시
  sourceTransparency: SourceTransparencySummaryDto | null; // 66a=null
  claims: ClaimVerificationItemDto[];
}
