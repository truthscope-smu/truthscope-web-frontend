/**
 * BYOK lib — 타입 + 에러 정의.
 *
 * ADR-004 BYOK 6 원칙 (b/c/f) 정합. lib은 auth context를 모른다 — caller(#18 form)가 userId 주입 의무.
 * passphrase 분실 시 record 삭제 후 재등록만 가능 (복구 메커니즘 없음).
 */

// provider 분리 근거: Gemini와 Google Fact Check가 동일 키 포맷 공유하나
// endpoint + restrictions 정책이 다르므로 분리 (2026-06-19 Gemini unrestricted key 차단 정합).
export type ApiProvider = 'google-ai' | 'google-fact-check' | 'custom';

// envelope encryption record. KEK = PBKDF2(passphrase, salt, 600k). DEK = random 32 byte raw bytes.
// keyFingerprint는 SHA-256(plaintextKey).slice(0,16) 16 hex char (64-bit entropy, fingerprintVersion:1).
export type StoredApiKeyRecordV1 = {
  readonly version: 1;
  readonly userId: string;
  readonly provider: ApiProvider;
  readonly providerId:
    | 'generativelanguage.googleapis.com'
    | 'factchecktools.googleapis.com'
    | string;
  readonly keyName: string;
  readonly wrappedDekIv: string;
  readonly wrappedDekCiphertext: string;
  readonly salt: string;
  readonly kdf: 'PBKDF2-SHA-256';
  readonly iterations: 600_000;
  readonly keyFingerprint: string;
  readonly fingerprintVersion: 1;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export class BYOKError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class IndexedDBNotSupportedError extends BYOKError {}
export class PassphraseTooShortError extends BYOKError {}
export class PassphraseTooLongError extends BYOKError {}
export class PassphraseIncorrectError extends BYOKError {}
export class KeyFormatError extends BYOKError {}
export class KeyNotFoundError extends BYOKError {}
export class KeyAlreadyExistsError extends BYOKError {}
export class IntegrityError extends BYOKError {}
