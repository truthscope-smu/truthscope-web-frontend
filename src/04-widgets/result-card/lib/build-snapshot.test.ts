// Phase 67 T5: buildResultCardSnapshot + isTerminalStatus unit test.
// vitest unit project include: src/04-widgets/result-card/lib/*.test.ts
//
// 회귀 시뮬레이션 anchor (PLAN §7):
//   A: confidence 매핑 (score → confidence, null → undefined)
//   B: truthLabel/status 도출 swap
//   C: evidence 타입 계약 (string[] → EvidenceDto[]) → typecheck 차단
import { describe, it, expect } from 'vitest';
import { buildResultCardSnapshot, isTerminalStatus } from './build-snapshot';
import type {
  ArticleVerificationResponse,
  ClaimVerificationItemDto,
  EvidenceDto,
} from '@06-entities/article'; // A1: 루트 배럴

// --- 팩토리 함수 ---

const makeEvidence = (overrides: Partial<EvidenceDto> = {}): EvidenceDto => ({
  url: 'https://kostat.go.kr/a',
  publisher: '통계청',
  title: '소비자물가 동향',
  stance: 'supports',
  summary: '물가 안정 확인',
  ...overrides,
});

const makeClaimItem = (
  overrides: Partial<ClaimVerificationItemDto> = {}
): ClaimVerificationItemDto => ({
  claimId: 'claim-1',
  claimText: '소비자물가 상승률이 안정된다는 주장',
  speakerName: '기획재정부 장관',
  isQuotedClaim: true,
  originalContext: '브리핑에서 발언',
  tier: 1,
  score: 78,
  verdict: 'SUPPORTED',
  reason: '통계청 자료 근거',
  disclaimer: null,
  verifiedAt: '2026-05-31T10:00:00.000Z',
  truthLabel: 'FACT',
  claimScoreStatus: null,
  evidence: [makeEvidence()],
  ...overrides,
});

const makeBaseDto = (
  overrides: Partial<ArticleVerificationResponse> = {}
): ArticleVerificationResponse => ({
  articleId: 'article-uuid-1',
  url: 'https://news.example.com/article-1',
  title: '테스트 기사 제목',
  status: 'COMPLETED',
  analysisCompletedAt: '2026-05-31T10:00:00.000Z',
  totalScore: 78,
  articleLabel: null,
  coverage: {
    scorableCount: 4,
    excludedCount: 3,
    insufficientCount: 1,
    timeSensitiveCount: 1,
    outOfScopeCount: 1,
    tier1Count: 2,
    tier2Count: 2,
    tier3Count: 3,
  },
  tier1Count: 2,
  tier2Count: 2,
  tier3Count: 3,
  sourceTransparency: {
    band: 'ALL_EXPLICIT',
    explicitCount: 5,
    ambiguousCount: 0,
    noneCount: 0,
  },
  claims: [makeClaimItem()],
  ...overrides,
});

// --- isTerminalStatus ---

describe('isTerminalStatus', () => {
  it('COMPLETED는 true를 반환한다', () => {
    expect(isTerminalStatus('COMPLETED')).toBe(true);
  });

  it('FAILED는 true를 반환한다', () => {
    expect(isTerminalStatus('FAILED')).toBe(true);
  });

  it('PENDING은 false를 반환한다', () => {
    expect(isTerminalStatus('PENDING')).toBe(false);
  });

  it('EXTRACTING은 false를 반환한다', () => {
    expect(isTerminalStatus('EXTRACTING')).toBe(false);
  });

  it('ANALYZING은 false를 반환한다', () => {
    expect(isTerminalStatus('ANALYZING')).toBe(false);
  });
});

// --- rename chain ---

describe('buildResultCardSnapshot — rename chain', () => {
  it('claimText → factCheck.claim으로 매핑된다', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    expect(snap.claims?.[0]?.factCheck.claim).toBe(
      '소비자물가 상승률이 안정된다는 주장'
    );
  });

  it('score → factCheck.confidence로 매핑된다 (회귀 시뮬레이션 A anchor)', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    // A: confidence=78이어야 함. 0으로 바꾸면 "expected 0 to be 78" 실패.
    expect(snap.claims?.[0]?.factCheck.confidence).toBe(78);
  });

  it('truthLabel → factCheck.truthLabel로 매핑된다 (회귀 시뮬레이션 B anchor)', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    // B: truthLabel='FACT'이어야 함. swap하면 undefined 실패.
    expect(snap.claims?.[0]?.factCheck.truthLabel).toBe('FACT');
  });

  it('claimScoreStatus → factCheck.status로 매핑된다', () => {
    const dto = makeBaseDto({
      claims: [
        makeClaimItem({
          claimId: 'claim-2',
          score: null,
          truthLabel: null,
          claimScoreStatus: 'INSUFFICIENT',
        }),
      ],
    });
    const snap = buildResultCardSnapshot(dto);
    expect(snap.claims?.[0]?.factCheck.status).toBe('INSUFFICIENT');
    expect(snap.claims?.[0]?.factCheck.truthLabel).toBeUndefined();
  });

  it('analysisCompletedAt → freshness.createdAtMs로 변환된다', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    expect(snap.freshness).toBeDefined();
    expect(snap.freshness?.createdAtMs).toBe(
      Date.parse('2026-05-31T10:00:00.000Z')
    );
  });

  it('analysisCompletedAt=null이면 freshness는 undefined', () => {
    const snap = buildResultCardSnapshot(
      makeBaseDto({ analysisCompletedAt: null })
    );
    expect(snap.freshness).toBeUndefined();
  });
});

// --- SCORABLE vs 비판정 ---

describe('buildResultCardSnapshot — SCORABLE vs 비판정', () => {
  it('SCORABLE: confidence 값이 존재한다', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    expect(typeof snap.claims?.[0]?.factCheck.confidence).toBe('number');
  });

  it('비판정(Tier3): score=null이면 confidence는 undefined', () => {
    const dto = makeBaseDto({
      claims: [
        makeClaimItem({
          score: null,
          truthLabel: null,
          claimScoreStatus: 'OUT_OF_SCOPE',
        }),
      ],
    });
    const snap = buildResultCardSnapshot(dto);
    expect(snap.claims?.[0]?.factCheck.confidence).toBeUndefined();
  });

  it('비판정: truthLabel은 undefined이고 status가 채워진다', () => {
    const dto = makeBaseDto({
      claims: [
        makeClaimItem({
          score: null,
          truthLabel: null,
          claimScoreStatus: 'TIME_SENSITIVE',
        }),
      ],
    });
    const snap = buildResultCardSnapshot(dto);
    expect(snap.claims?.[0]?.factCheck.truthLabel).toBeUndefined();
    expect(snap.claims?.[0]?.factCheck.status).toBe('TIME_SENSITIVE');
  });
});

// --- evidence stance 소문자 ---

describe('buildResultCardSnapshot — evidence stance 소문자', () => {
  it('evidence stance가 소문자(supports)로 전달된다', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    expect(snap.claims?.[0]?.factCheck.evidence?.[0]?.stance).toBe('supports');
  });

  it('evidence stance refutes, neutral도 소문자로 전달된다', () => {
    const dto = makeBaseDto({
      claims: [
        makeClaimItem({
          evidence: [
            makeEvidence({ stance: 'refutes' }),
            makeEvidence({ stance: 'neutral' }),
          ],
        }),
      ],
    });
    const snap = buildResultCardSnapshot(dto);
    expect(snap.claims?.[0]?.factCheck.evidence?.[0]?.stance).toBe('refutes');
    expect(snap.claims?.[0]?.factCheck.evidence?.[1]?.stance).toBe('neutral');
  });
});

// --- claims 빈 배열 ---

describe('buildResultCardSnapshot — claims 빈 배열', () => {
  it('claims=[] 이면 snap.claims는 빈 배열이다', () => {
    const snap = buildResultCardSnapshot(makeBaseDto({ claims: [] }));
    expect(snap.claims).toEqual([]);
    // claims 모드 분기: !!snap.claims.length = false (widget이 레거시 모드 사용)
    expect(!!snap.claims?.length).toBe(false);
  });
});

// --- totalClaimCount anchor ---

describe('buildResultCardSnapshot — totalClaimCount (PLAN §7 anchor)', () => {
  it('totalClaimCount = scorableCount + excludedCount (4+3=7 anchor)', () => {
    // cov.scorableCount=4, cov.excludedCount=3 → totalClaimCount=7
    const snap = buildResultCardSnapshot(makeBaseDto());
    expect(snap.articleFactScore?.totalClaimCount).toBe(7);
  });

  it('scorableCount도 정확하게 전달된다', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    expect(snap.articleFactScore?.scorableCount).toBe(4);
  });
});

// --- sourceTransparency ---

describe('buildResultCardSnapshot — sourceTransparency', () => {
  it('sourceTransparency가 있으면 siftMapping에 매핑된다', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    expect(snap.siftMapping?.sourceTransparency?.band).toBe('ALL_EXPLICIT');
    expect(snap.siftMapping?.sourceTransparency?.explicitCount).toBe(5);
  });

  it('sourceTransparency=null이면 siftMapping.sourceTransparency는 undefined', () => {
    const snap = buildResultCardSnapshot(
      makeBaseDto({ sourceTransparency: null })
    );
    expect(snap.siftMapping?.sourceTransparency).toBeUndefined();
    // coverage가 있으면 siftMapping 자체는 존재함 (crossSource 때문)
    expect(snap.siftMapping).toBeDefined();
  });
});

// --- A5 crossSource tier1/2 (adapterDiversity 생략) ---

describe('buildResultCardSnapshot — A5 crossSource tier1/2', () => {
  it('crossSource에 tier1Count와 tier2Count가 채워진다', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    expect(snap.siftMapping?.crossSource?.tier1Count).toBe(2);
    expect(snap.siftMapping?.crossSource?.tier2Count).toBe(2);
  });

  it('crossSource에 adapterDiversity가 없다 (BE 미제공, fabricate 금지)', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    // adapterDiversity는 optional이며 미주입 확인
    expect(
      (snap.siftMapping?.crossSource as Record<string, unknown>)
        ?.adapterDiversity
    ).toBeUndefined();
  });

  it('coverage=null이면 siftMapping이 없다', () => {
    const snap = buildResultCardSnapshot(
      makeBaseDto({ coverage: null, sourceTransparency: null })
    );
    expect(snap.siftMapping).toBeUndefined();
  });
});

// --- isQuotedClaim attribution ---

describe('buildResultCardSnapshot — attribution', () => {
  it('isQuotedClaim=true이면 attribution이 채워진다', () => {
    const snap = buildResultCardSnapshot(makeBaseDto());
    expect(snap.claims?.[0]?.attribution?.isQuotedClaim).toBe(true);
    expect(snap.claims?.[0]?.attribution?.speakerName).toBe('기획재정부 장관');
    expect(snap.claims?.[0]?.attribution?.originalContext).toBe(
      '브리핑에서 발언'
    );
  });

  it('isQuotedClaim=false이면 attribution은 undefined', () => {
    const dto = makeBaseDto({
      claims: [makeClaimItem({ isQuotedClaim: false })],
    });
    const snap = buildResultCardSnapshot(dto);
    expect(snap.claims?.[0]?.attribution).toBeUndefined();
  });

  it('speakerName=null이면 attribution.speakerName은 undefined', () => {
    const dto = makeBaseDto({
      claims: [makeClaimItem({ speakerName: null })],
    });
    const snap = buildResultCardSnapshot(dto);
    expect(snap.claims?.[0]?.attribution?.speakerName).toBeUndefined();
  });
});

// --- Tier2 disclaimer ---

describe('buildResultCardSnapshot — Tier2 disclaimer', () => {
  it('disclaimer가 있으면 factCheck.disclaimer와 claim.disclaimer 모두 채워진다', () => {
    const disclaimerText =
      'AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요.';
    const dto = makeBaseDto({
      claims: [makeClaimItem({ disclaimer: disclaimerText })],
    });
    const snap = buildResultCardSnapshot(dto);
    expect(snap.claims?.[0]?.factCheck.disclaimer).toBe(disclaimerText);
    expect(snap.claims?.[0]?.disclaimer).toBe(disclaimerText);
  });

  it('disclaimer=null이면 undefined로 변환된다', () => {
    const snap = buildResultCardSnapshot(makeBaseDto()); // disclaimer: null in base
    expect(snap.claims?.[0]?.factCheck.disclaimer).toBeUndefined();
    expect(snap.claims?.[0]?.disclaimer).toBeUndefined();
  });
});
