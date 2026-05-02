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
   * rev.1 CX1-01 + rev.2 CX2-05 fix: BE controller 부재 대응.
   * AnalysisResponse {sessionId, status (mapped from SessionStatus)} + 사용자 입력 url로 Article 합성.
   * title/content는 placeholder marker — widget의 displayTitle logic이 user-friendly 텍스트로 대체.
   *
   * Q1 reframe: BE Article entity와 FE Article class 1:1 매핑 (entity-level).
   * Controller exposure는 Phase 22+. transport는 AnalysisResponse 단일.
   *
   * 입력 status는 이미 mappers.ts의 mapSessionStatusToArticleStatus()를 통과한 ArticleStatus.
   * rev.2 CX2-01: silent cast 제거 — fromAnalysisSession은 ArticleStatus만 받음.
   */
  static fromAnalysisSession(input: {
    url: string;
    sessionId: string;
    status: ArticleStatus;
  }): Article {
    if (!URL_PATTERN.test(input.url)) {
      throw new InvariantViolationError(`URL invariant 위반: ${input.url}`);
    }
    return new Article(
      input.sessionId, // id = sessionId (placeholder, ArticleController 작성 후 변경)
      input.url,
      '(서버에서 추출 중)', // rev.2 CX2-05: marker prefix — widget displayTitle 매칭
      '(서버에서 추출 중)', // rev.3 CX3-04: 'Phase 22+' user-facing 흔적 제거
      input.status,
      input.sessionId,
      new Date().toISOString()
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
