import { describe, it, expect, vi, afterEach } from 'vitest';
import { computeStalenessHint } from '@04-widgets/freshness-badge/lib/compute-staleness-hint';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;
const THREE_DAYS = 3 * ONE_DAY;
const SEVEN_DAYS = 7 * ONE_DAY;

afterEach(() => {
  vi.useRealTimers();
});

describe('computeStalenessHint — 5 bucket representative values', () => {
  it('30min -> fresh', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - 30 * 60 * 1000, now)).toBe('fresh');
  });

  it('12h -> stable', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - 12 * ONE_HOUR, now)).toBe('stable');
  });

  it('2d -> aging', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - 2 * ONE_DAY, now)).toBe('aging');
  });

  it('5d -> stale', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - 5 * ONE_DAY, now)).toBe('stale');
  });

  it('12d -> expired', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - 12 * ONE_DAY, now)).toBe('expired');
  });
});

describe('computeStalenessHint — boundary values', () => {
  it('diff=0 -> fresh', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now, now)).toBe('fresh');
  });

  it('diff=1h exactly -> fresh', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - ONE_HOUR, now)).toBe('fresh');
  });

  it('diff=1h+1ms -> stable', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - ONE_HOUR - 1, now)).toBe('stable');
  });

  it('diff=24h exactly -> stable', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - ONE_DAY, now)).toBe('stable');
  });

  it('diff=24h+1ms -> aging', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - ONE_DAY - 1, now)).toBe('aging');
  });

  it('diff=3d exactly -> aging', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - THREE_DAYS, now)).toBe('aging');
  });

  it('diff=3d+1ms -> stale', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - THREE_DAYS - 1, now)).toBe('stale');
  });

  it('diff=7d exactly -> stale', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - SEVEN_DAYS, now)).toBe('stale');
  });

  it('diff=7d+1ms -> expired', () => {
    const now = 1_000_000_000_000;
    expect(computeStalenessHint(now - SEVEN_DAYS - 1, now)).toBe('expired');
  });
});

describe('computeStalenessHint — edge cases', () => {
  it('future timestamp (negative diff) -> fresh (clamped)', () => {
    const now = 1_000_000_000_000;
    // createdAtMs is in the future relative to nowMs
    expect(computeStalenessHint(now + 5 * ONE_DAY, now)).toBe('fresh');
  });

  it('NaN createdAtMs -> expired', () => {
    expect(computeStalenessHint(NaN, 1_000_000_000_000)).toBe('expired');
  });

  it('Infinity createdAtMs -> expired', () => {
    expect(computeStalenessHint(Infinity, 1_000_000_000_000)).toBe('expired');
  });

  it('uses Date.now() as default nowMs via fake timers', () => {
    const fixedMs = 1_000_000_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(fixedMs);
    // 30 minutes before fixed time -> fresh
    const result = computeStalenessHint(fixedMs - 30 * 60 * 1000);
    expect(result).toBe('fresh');
    vi.useRealTimers();
  });
});
