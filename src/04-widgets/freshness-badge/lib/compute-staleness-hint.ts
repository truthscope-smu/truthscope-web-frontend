import type { StalenessHint } from '@04-widgets/freshness-badge/model/types';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;
const THREE_DAYS = 3 * ONE_DAY;
const SEVEN_DAYS = 7 * ONE_DAY;

export function computeStalenessHint(
  createdAtMs: number,
  nowMs: number = Date.now()
): StalenessHint {
  // NaN/Infinity 입력은 expired로 fallback + dev 경고 (props 타입은 number 강제이나 런타임 방어)
  if (!Number.isFinite(createdAtMs)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[FreshnessBadge] invalid createdAtMs: ${createdAtMs} -> expired`
      );
    }
    return 'expired';
  }
  const diff = Math.max(0, nowMs - createdAtMs); // 미래 시점(음수) clamp -> fresh
  if (diff <= ONE_HOUR) return 'fresh';
  if (diff <= ONE_DAY) return 'stable';
  if (diff <= THREE_DAYS) return 'aging';
  if (diff <= SEVEN_DAYS) return 'stale';
  return 'expired';
}
