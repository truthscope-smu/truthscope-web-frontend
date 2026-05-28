/**
 * BYOK lib — 타입 + 에러 정의.
 *
 * ADR-004 BYOK 6 원칙 (b/c/f) 정합. lib은 auth context를 모른다 — caller(#18 form)가 userId 주입 의무.
 * passphrase 분실 시 record 삭제 후 재등록만 가능 (복구 메커니즘 없음).
 *
 * 암호화 방식: Web Crypto AES-GCM + PBKDF2 + non-extractable CryptoKey + encrypted IndexedDB storage.
 * (V1 envelope encryption DEK/KEK 구조 폐기 — codex 5.5 thread `019e6ded` 옵션 B 채택)
 */

// provider 분리 근거: Gemini와 Google Fact Check가 동일 키 포맷 공유하나
// endpoint + restrictions 정책이 다르므로 분리 (2026-06-19 Gemini unrestricted key 차단 정합).
export type ApiProvider = 'google-ai' | 'google-fact-check' | 'custom';

/**
 * V1 record — 폐기 (DEK/KEK envelope 구조, saveKey round-trip 미성립 결함).
 * V1 record를 읽으면 NeedsKeyReentryError throw — 자동 migration 불가, 재등록 의무.
 * @deprecated PR #53 CodeRabbit Critical 정정으로 V2로 대체됨.
 */
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

/**
 * V2 record — Web Crypto AES-GCM + PBKDF2 + non-extractable CryptoKey + encrypted IndexedDB storage.
 *
 * 저장 흐름:
 *   1. KEK = PBKDF2(passphrase, salt, 600k, AES-GCM, extractable:false, ['encrypt','decrypt'])
 *   2. ciphertext = AES-GCM.encrypt(KEK, iv, plaintextKey)
 *   3. keyFingerprint = SHA-256(plaintextKey).slice(0,16)
 *   4. zeroFill(plaintextKey)
 *   5. record {version:2, ..., ciphertext, iv, salt} 저장
 *
 * 복호화 흐름:
 *   1. KEK = PBKDF2(passphrase, salt, 600k, ...)
 *   2. plaintextKey = AES-GCM.decrypt(KEK, iv, ciphertext)
 *   3. caller zero-fill 의무 (ADR-004 §c)
 *
 * keyFingerprint: SHA-256(plaintextKey).slice(0,16) 16 hex char (64-bit entropy, fingerprintVersion:1).
 */
export type StoredApiKeyRecordV2 = {
  readonly version: 2;
  readonly userId: string;
  readonly provider: ApiProvider;
  readonly providerId:
    | 'generativelanguage.googleapis.com'
    | 'factchecktools.googleapis.com'
    | string;
  readonly keyName: string;
  /** AES-GCM(KEK, plaintextKey) 결과 — base64url */
  readonly ciphertext: string;
  /** AES-GCM IV — base64url, 12 byte */
  readonly iv: string;
  /** PBKDF2 salt — base64url, 16 byte */
  readonly salt: string;
  readonly kdf: 'PBKDF2-SHA-256';
  readonly iterations: 600_000;
  readonly keyFingerprint: string;
  readonly fingerprintVersion: 1;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** storage 레이어에서 사용하는 현행 record 타입 */
export type StoredApiKeyRecord = StoredApiKeyRecordV2;

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

/**
 * V1 record 읽기 시 throw — 자동 migration 불가.
 * passphrase + plaintextKey가 V1에서 round-trip 미성립이므로 재등록 의무.
 */
export class NeedsKeyReentryError extends BYOKError {}
