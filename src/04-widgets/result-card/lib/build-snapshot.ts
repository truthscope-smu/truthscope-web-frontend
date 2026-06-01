/**
 * Phase 67 T5: BE ArticleVerificationResponse → ResultCardSnapshot 단일 변환.
 * 위치: 04-widgets/result-card/lib (04→06 type import 허용, lib는 vitest unit include 대상).
 * A1: 외부는 루트 배럴 @06-entities/article 경유 (dep-cruiser R4).
 * A4: uniqueSourceCount는 BE 기사 단위 필드 없음 — 의도적 생략. fabricate 금지.
 *     sourceTransparency 실값 + EvidenceCard 단일출처 배지로 대체.
 * A5: crossSource.adapterDiversity 생략 (BE 미제공). tier1/2만 주입.
 * A6: isTerminalStatus를 순수 헬퍼로 분리 (poll 판정 + unit 대상).
 */

import type { ArticleVerificationResponse } from '@06-entities/article'; // A1: 루트 배럴
import type {
  ResultCardSnapshot,
  ClaimCardSnapshot,
} from '@04-widgets/result-card/model/types';
import { freshnessSnapshotFromIso } from '@04-widgets/result-card/lib/freshness';

/**
 * A6: poll 종료 판정 순수 헬퍼. COMPLETED 또는 FAILED이면 true.
 * PENDING / EXTRACTING / ANALYZING은 false.
 */
export function isTerminalStatus(status: string): boolean {
  return status === 'COMPLETED' || status === 'FAILED';
}

/**
 * BE 응답 → ResultCardSnapshot rename chain + 도출.
 * COMPLETED 응답에만 호출 (pending/FAILED는 page에서 분기).
 *
 * rename chain:
 *   c.claimText → factCheck.claim
 *   c.score     → factCheck.confidence (null → undefined)
 *   c.truthLabel → factCheck.truthLabel (SCORABLE 도출값. null → undefined)
 *   c.claimScoreStatus → factCheck.status (비판정. null → undefined)
 *   c.analysisCompletedAt → freshness (null → undefined)
 *   cov.scorableCount + cov.excludedCount → articleFactScore.totalClaimCount
 */
export function buildResultCardSnapshot(
  dto: ArticleVerificationResponse
): ResultCardSnapshot {
  const claims: ClaimCardSnapshot[] = dto.claims.map((c) => ({
    claimId: c.claimId,
    factCheck: {
      claim: c.claimText, // rename: claimText → claim
      confidence: c.score ?? undefined, // rename: score → confidence (null → undefined)
      truthLabel: c.truthLabel ?? undefined, // SCORABLE 도출값 (null → undefined)
      status: c.claimScoreStatus ?? undefined, // rename: claimScoreStatus → status (null → undefined)
      evidence: c.evidence, // EvidenceDto[]
      disclaimer: c.disclaimer ?? undefined, // Tier2 원문 (null → undefined)
    },
    attribution: c.isQuotedClaim
      ? {
          isQuotedClaim: true,
          speakerName: c.speakerName ?? undefined,
          originalContext: c.originalContext ?? undefined,
        }
      : undefined,
    disclaimer: c.disclaimer ?? undefined,
  }));

  const cov = dto.coverage;

  return {
    freshness: dto.analysisCompletedAt
      ? freshnessSnapshotFromIso(dto.analysisCompletedAt)
      : undefined,
    articleFactScore: cov
      ? {
          value: dto.totalScore ?? undefined,
          scorableCount: cov.scorableCount,
          // totalClaimCount = scorableCount + excludedCount (PLAN §7 anchor: 4+3=7)
          totalClaimCount: cov.scorableCount + cov.excludedCount,
        }
      : undefined,
    siftMapping:
      dto.sourceTransparency || cov
        ? {
            sourceTransparency: dto.sourceTransparency
              ? {
                  band: dto.sourceTransparency.band,
                  explicitCount: dto.sourceTransparency.explicitCount,
                  ambiguousCount: dto.sourceTransparency.ambiguousCount,
                  noneCount: dto.sourceTransparency.noneCount,
                }
              : undefined,
            // A5: crossSource tier1/2만. adapterDiversity 생략 (BE 미제공). fabricate 금지.
            crossSource: cov
              ? { tier1Count: cov.tier1Count, tier2Count: cov.tier2Count }
              : undefined,
          }
        : undefined,
    partialFailure: cov
      ? {
          coverage: {
            insufficientCount: cov.insufficientCount,
            timeSensitiveCount: cov.timeSensitiveCount,
            outOfScopeCount: cov.outOfScopeCount,
            tier1Count: cov.tier1Count,
            tier2Count: cov.tier2Count,
            tier3Count: cov.tier3Count,
          },
          // A4: uniqueSourceCount 의도적 생략.
          //     BE 기사 단위 unique source 필드 없음 — fabricate 금지.
          //     sourceTransparency 실값이 기사 출처 신호 담당.
          sourceTransparency: dto.sourceTransparency ?? undefined,
        }
      : undefined,
    claims,
  };
}
