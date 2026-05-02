import type { ArticleSnapshot } from '@06-entities/article/model/snapshot';
import {
  InvariantViolationError,
  IllegalStateError,
} from '@06-entities/article/model/errors';

// rev.1 CX1-03 fix: ArticleStatus는 article.ts에서 export (snapshot.ts는 import만).
export type ArticleStatus = 'EXTRACTED' | 'ATTACHED';

const URL_PATTERN = /^https?:\/\/[^\s]+$/;

export class Article {
  private constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly title: string,
    public readonly content: string,
    private _status: ArticleStatus,
    private _sessionId: string | null,
    public readonly createdAt: string
  ) {}

  /**
   * rev.1 R1-01/CX1-02 fix: extract(url) single param. URL invariant 만 preflight.
   * title/content/createdAt는 BE response에서 채워지므로 client preflight에는 검증하지 않음.
   * Layer 2 preflight 목적 — 결과는 instance discard (form은 boolean throw 여부만 확인).
   *
   * 사용 예: try { Article.extract(url); } catch (e) { if (e instanceof InvariantViolationError) ... }
   */
  static extract(url: string): void {
    if (!URL_PATTERN.test(url)) {
      throw new InvariantViolationError('URL은 http(s)로 시작해야 합니다');
    }
    // No instance returned — preflight is validation-only.
  }

  /**
   * rev.7 P21-5-1: BE PR #29 6ad70ec 머지 후 articleId 노출.
   * AnalysisResponse {sessionId, status, articleId} → Article 합성 (id는 articleId 사용).
   *
   * Q1 reframe: BE Article entity와 FE Article class 1:1 매핑 (entity-level).
   * BE auto-attach 정책으로 본 응답 시점에 BE article은 이미 ATTACHED 상태이지만,
   * FE Article의 status는 mappers.ts에서 SessionStatus → ArticleStatus 매핑 결과 사용
   * (EXTRACTING → EXTRACTED). 실제 attach 상태 확인은 findArticleById 호출로 별도 조회.
   *
   * title/content는 placeholder marker — widget의 displayTitle logic이 user-friendly 텍스트로 대체.
   */
  static fromAnalysisSession(input: {
    url: string;
    sessionId: string;
    articleId: string;
    status: ArticleStatus;
  }): Article {
    if (!URL_PATTERN.test(input.url)) {
      throw new InvariantViolationError(`URL invariant 위반: ${input.url}`);
    }
    return new Article(
      input.articleId, // rev.7 P21-5-1: BE 실 articleId (sessionId placeholder 제거)
      input.url,
      '(서버에서 추출 중)',
      '(서버에서 추출 중)',
      input.status,
      input.sessionId,
      new Date().toISOString()
    );
  }

  /**
   * rev.7 P4: BE PR #28 d9b6168 ArticleController 머지 후 활성화.
   * GET /api/v1/articles/{id} + POST /api/v1/articles/{id}/attach 응답 → Article 합성.
   * BE는 title/content가 추출 진행 중이면 null로 응답 — placeholder marker로 변환.
   */
  static fromBackendDto(dto: {
    id: string;
    url: string;
    title: string | null;
    content: string | null;
    status: ArticleStatus;
    sessionId: string | null;
    createdAt: string;
  }): Article {
    if (!URL_PATTERN.test(dto.url)) {
      throw new InvariantViolationError(`URL invariant 위반: ${dto.url}`);
    }
    return new Article(
      dto.id,
      dto.url,
      dto.title ?? '(서버에서 추출 중)',
      dto.content ?? '(서버에서 추출 중)',
      dto.status,
      dto.sessionId,
      dto.createdAt
    );
  }

  /**
   * Q10 LOCK: snapshot ↔ class round-trip. invariant 검증 동일.
   * BE 단일 source (Spring) + Supabase mapper는 Phase 22+ deferred.
   */
  static rehydrate(snapshot: ArticleSnapshot): Article {
    if (!URL_PATTERN.test(snapshot.url)) {
      throw new InvariantViolationError(
        `Snapshot URL invariant 위반: ${snapshot.url}`
      );
    }
    return new Article(
      snapshot.id,
      snapshot.url,
      snapshot.title,
      snapshot.content,
      snapshot.status,
      snapshot.sessionId,
      snapshot.createdAt
    );
  }

  get status(): ArticleStatus {
    return this._status;
  }

  get sessionId(): string | null {
    return this._sessionId;
  }

  /**
   * Q10 LOCK: state transition. 1회 부착 invariant.
   * 재부착 시 IllegalStateError throw.
   */
  attachTo(sessionId: string): void {
    if (this._status === 'ATTACHED') {
      throw new IllegalStateError(
        `Article ${this.id}는 이미 session ${this._sessionId}에 부착됨. 재부착 불가.`
      );
    }
    if (!sessionId || sessionId.trim() === '') {
      throw new InvariantViolationError('sessionId는 비어있을 수 없습니다');
    }
    this._status = 'ATTACHED';
    this._sessionId = sessionId;
  }

  toSnapshot(): ArticleSnapshot {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      content: this.content,
      status: this._status,
      sessionId: this._sessionId,
      createdAt: this.createdAt,
    };
  }
}
