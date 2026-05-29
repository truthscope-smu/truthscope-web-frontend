const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

/** "방금" / "N분 전" / "N시간 전" / "N일 전" / "N개월 전" */
export function formatRelativeTime(
  createdAtMs: number,
  nowMs: number = Date.now()
): string {
  const diff = Math.max(0, nowMs - createdAtMs);
  if (diff < MIN) return '방금';
  if (diff < HOUR) return rtf.format(-Math.floor(diff / MIN), 'minute');
  if (diff < DAY) return rtf.format(-Math.floor(diff / HOUR), 'hour');
  if (diff < MONTH) return rtf.format(-Math.floor(diff / DAY), 'day');
  return rtf.format(-Math.floor(diff / MONTH), 'month');
}
