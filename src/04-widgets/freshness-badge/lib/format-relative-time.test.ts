import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from '@04-widgets/freshness-badge/lib/format-relative-time';

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

const NOW = 1_000_000_000_000;

// Intl.RelativeTimeFormat('ko', { numeric: 'auto' }) actual outputs (verified 2026-05-29):
// -1 minute  => '1분 전'
// -2 minute  => '2분 전'
// -30 minute => '30분 전'
// -59 minute => '59분 전'
// -1 hour    => '1시간 전'
// -2 hour    => '2시간 전'
// -12 hour   => '12시간 전'
// -23 hour   => '23시간 전'
// -1 day     => '어제'       (numeric:'auto' special word)
// -2 day     => '그저께'     (numeric:'auto' special word)
// -3 day     => '3일 전'
// -7 day     => '7일 전'
// -1 month   => '지난달'     (numeric:'auto' special word)
// -2 month   => '2개월 전'
// -6 month   => '6개월 전'

describe('formatRelativeTime — 방금 branch (diff < 60s)', () => {
  it('diff=0 -> 방금', () => {
    expect(formatRelativeTime(NOW, NOW)).toBe('방금');
  });

  it('diff=30s -> 방금', () => {
    expect(formatRelativeTime(NOW - 30 * SEC, NOW)).toBe('방금');
  });

  it('diff=59s -> 방금', () => {
    expect(formatRelativeTime(NOW - 59 * SEC, NOW)).toBe('방금');
  });

  it('diff=59999ms (just under 1 minute) -> 방금', () => {
    expect(formatRelativeTime(NOW - 59_999, NOW)).toBe('방금');
  });
});

describe('formatRelativeTime — minute branch', () => {
  it('diff=1min exactly -> 1분 전', () => {
    expect(formatRelativeTime(NOW - MIN, NOW)).toBe('1분 전');
  });

  it('diff=2min -> 2분 전', () => {
    expect(formatRelativeTime(NOW - 2 * MIN, NOW)).toBe('2분 전');
  });

  it('diff=30min -> 30분 전', () => {
    expect(formatRelativeTime(NOW - 30 * MIN, NOW)).toBe('30분 전');
  });

  it('diff=59min -> 59분 전', () => {
    expect(formatRelativeTime(NOW - 59 * MIN, NOW)).toBe('59분 전');
  });
});

describe('formatRelativeTime — hour branch', () => {
  it('diff=1hour -> 1시간 전', () => {
    expect(formatRelativeTime(NOW - HOUR, NOW)).toBe('1시간 전');
  });

  it('diff=2hour -> 2시간 전', () => {
    expect(formatRelativeTime(NOW - 2 * HOUR, NOW)).toBe('2시간 전');
  });

  it('diff=12hour -> 12시간 전', () => {
    expect(formatRelativeTime(NOW - 12 * HOUR, NOW)).toBe('12시간 전');
  });

  it('diff=23hour -> 23시간 전', () => {
    expect(formatRelativeTime(NOW - 23 * HOUR, NOW)).toBe('23시간 전');
  });
});

describe('formatRelativeTime — day branch', () => {
  // Intl numeric:'auto' produces special words for -1 and -2
  it('diff=1day -> 어제 (numeric:auto special word)', () => {
    expect(formatRelativeTime(NOW - DAY, NOW)).toBe('어제');
  });

  it('diff=2day -> 그저께 (numeric:auto special word)', () => {
    expect(formatRelativeTime(NOW - 2 * DAY, NOW)).toBe('그저께');
  });

  it('diff=3day -> 3일 전', () => {
    expect(formatRelativeTime(NOW - 3 * DAY, NOW)).toBe('3일 전');
  });

  it('diff=7day -> 7일 전', () => {
    expect(formatRelativeTime(NOW - 7 * DAY, NOW)).toBe('7일 전');
  });
});

describe('formatRelativeTime — month branch', () => {
  // Intl numeric:'auto' produces '지난달' for -1 month
  it('diff=1month -> 지난달 (numeric:auto special word)', () => {
    expect(formatRelativeTime(NOW - MONTH, NOW)).toBe('지난달');
  });

  it('diff=2month -> 2개월 전', () => {
    expect(formatRelativeTime(NOW - 2 * MONTH, NOW)).toBe('2개월 전');
  });

  it('diff=6month -> 6개월 전', () => {
    expect(formatRelativeTime(NOW - 6 * MONTH, NOW)).toBe('6개월 전');
  });

  it('very large diff (2 years) -> month branch, ko locale', () => {
    expect(formatRelativeTime(NOW - 24 * MONTH, NOW)).toBe('24개월 전');
  });
});

describe('formatRelativeTime — ko locale correctness', () => {
  it('returns Korean string containing 전 for non-recent times', () => {
    const result = formatRelativeTime(NOW - 5 * MIN, NOW);
    // '5분 전' must contain Korean text
    expect(result).toBe('5분 전');
    expect(result).toMatch(/전$/);
  });
});
