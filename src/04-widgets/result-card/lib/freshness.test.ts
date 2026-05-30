import { describe, it, expect } from 'vitest';
import { freshnessSnapshotFromIso } from '@04-widgets/result-card/lib/freshness';

describe('freshnessSnapshotFromIso', () => {
  it('유효 ISO 문자열을 createdAtMs로 변환', () => {
    const iso = '2026-05-30T00:00:00.000Z';
    expect(freshnessSnapshotFromIso(iso)).toEqual({
      createdAtMs: Date.parse(iso),
    });
  });

  it('잘못된 문자열은 undefined (NaN 가드)', () => {
    expect(freshnessSnapshotFromIso('not-a-date')).toBeUndefined();
    expect(freshnessSnapshotFromIso('')).toBeUndefined();
  });
});
