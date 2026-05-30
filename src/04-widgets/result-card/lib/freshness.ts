import type { FreshnessSnapshot } from '@04-widgets/result-card/model/types';

/**
 * ISO 문자열을 FreshnessSnapshot으로 변환. 임시 프록시 — article.createdAt(추출 시각)을
 * 검증 시각 근사로 사용. BE verification_results.verified_at(#76) 랜딩 시 교체.
 * 파싱 실패(NaN) 시 undefined 반환(배지 미렌더).
 */
export function freshnessSnapshotFromIso(
  iso: string
): FreshnessSnapshot | undefined {
  const createdAtMs = Date.parse(iso);
  if (Number.isNaN(createdAtMs)) return undefined;
  return { createdAtMs };
}
