import { describe, it, expect } from 'vitest';
import {
  Article,
  InvariantViolationError,
  IllegalStateError,
  type ArticleSnapshot,
} from '../index';

describe('Article aggregate (Phase 21 — DDD/TDD pilot, rev.1 BE-aware)', () => {
  const validSnapshot: ArticleSnapshot = {
    id: 'article_1',
    url: 'https://example.com/news/1',
    title: 'Sample News',
    content: 'Sample content',
    status: 'EXTRACTED',
    sessionId: null,
    createdAt: '2026-05-02T00:00:00.000Z',
  };

  // Case 1: Article.extract URL invariant — preflight (rev.1 single-param)
  it('extract: rejects ftp:// URL via InvariantViolationError (preflight only)', () => {
    expect(() => Article.extract('ftp://example.com')).toThrow(
      InvariantViolationError
    );
    expect(() => Article.extract('not-a-url')).toThrow(InvariantViolationError);
  });

  it('extract: accepts https URL — no return (validation-only)', () => {
    expect(() => Article.extract('https://example.com/x')).not.toThrow();
  });

  // Case 2: fromAnalysisSession (rev.1 CX1-01 — BE AnalysisResponse → Article 합성)
  it('fromAnalysisSession: synthesizes Article from URL + AnalysisResponse', () => {
    const a = Article.fromAnalysisSession({
      url: 'https://example.com/news/1',
      sessionId: 'session_xyz',
      status: 'EXTRACTED',
    });
    expect(a.url).toBe('https://example.com/news/1');
    expect(a.sessionId).toBe('session_xyz');
    expect(a.id).toBe('session_xyz'); // id placeholder = sessionId until Phase 22+
    expect(a.status).toBe('EXTRACTED');
    expect(a.title).toContain('서버에서 추출 중'); // rev.3 CX3-04 fix: placeholder marker (한국어)
  });

  it('fromAnalysisSession: rejects invalid URL via InvariantViolationError', () => {
    expect(() =>
      Article.fromAnalysisSession({
        url: 'ftp://invalid',
        sessionId: 's1',
        status: 'EXTRACTED',
      })
    ).toThrow(InvariantViolationError);
  });

  // Case 3: attachTo 1회 부착 (client-only state transition)
  it('attachTo: transitions EXTRACTED → ATTACHED with sessionId', () => {
    const a = Article.rehydrate(validSnapshot);
    a.attachTo('session_123');
    expect(a.status).toBe('ATTACHED');
    expect(a.sessionId).toBe('session_123');
  });

  // Case 4: attachTo 재부착 거부
  it('attachTo: rejects re-attach via IllegalStateError', () => {
    const a = Article.rehydrate(validSnapshot);
    a.attachTo('session_123');
    expect(() => a.attachTo('session_456')).toThrow(IllegalStateError);
  });

  // Case 5: rehydrate invariant violation
  it('rehydrate: rejects snapshot with invalid URL', () => {
    const bad: ArticleSnapshot = { ...validSnapshot, url: 'invalid' };
    expect(() => Article.rehydrate(bad)).toThrow(InvariantViolationError);
  });

  // Bonus Case 6: toSnapshot round-trip preserves data
  it('toSnapshot: round-trip preserves all fields', () => {
    const a = Article.rehydrate(validSnapshot);
    const snap = a.toSnapshot();
    expect(snap).toEqual(validSnapshot);
  });

  // Bonus Case 7: rehydrate after fromAnalysisSession (chain)
  it('chain: fromAnalysisSession → toSnapshot → rehydrate preserves invariant', () => {
    const a = Article.fromAnalysisSession({
      url: 'https://example.com/x',
      sessionId: 's1',
      status: 'EXTRACTED',
    });
    const snap = a.toSnapshot();
    const reborn = Article.rehydrate(snap);
    expect(reborn.url).toBe(a.url);
    expect(reborn.status).toBe(a.status);
  });
});

// rev.4 CX4-03 fix: mapper status mapping 4 case 추가 (api adapter test).
describe('mapSessionStatusToArticleStatus (rev.3 CX3-01)', () => {
  // 본 함수는 mappers.ts의 internal — fromAnalysisSession을 통해 indirect 검증.

  it('EXTRACTED status → fromAnalysisSession returns Article EXTRACTED', () => {
    const a = Article.fromAnalysisSession({
      url: 'https://example.com/x',
      sessionId: 's1',
      status: 'EXTRACTED', // mapper에서 EXTRACTING → EXTRACTED 변환 후 전달된다는 가정
    });
    expect(a.status).toBe('EXTRACTED');
  });

  it('PENDING → mapper throws InvariantViolationError (진행 중 안내)', async () => {
    const { fromAnalysisSession: mapperFn } = await import('../api/mappers');
    expect(() =>
      mapperFn('https://example.com/x', { sessionId: 's1', status: 'PENDING' })
    ).toThrow(InvariantViolationError);
  });

  it('FAILED → mapper throws InvariantViolationError (분석 실패)', async () => {
    const { fromAnalysisSession: mapperFn } = await import('../api/mappers');
    expect(() =>
      mapperFn('https://example.com/x', { sessionId: 's1', status: 'FAILED' })
    ).toThrow(InvariantViolationError);
  });

  it('EXTRACTING → mapper synthesizes Article EXTRACTED (BE 실측 success path)', async () => {
    const { fromAnalysisSession: mapperFn } = await import('../api/mappers');
    const a = mapperFn('https://example.com/x', {
      sessionId: 's1',
      status: 'EXTRACTING',
    });
    expect(a.status).toBe('EXTRACTED');
  });
});
