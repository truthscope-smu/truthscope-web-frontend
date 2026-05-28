/**
 * BYOK lib — public API.
 *
 * ADR-004 §(a)(b)(c)(f) 정합.
 * 암호화 방식: Web Crypto AES-GCM + PBKDF2 + non-extractable CryptoKey + encrypted IndexedDB storage.
 * passphrase 분실 시 record 삭제 후 재등록만 가능 (복구 메커니즘 없음, Precondition 1).
 * caller zero-fill 의무: unwrapKey 반환 raw bytes는 BE 헤더 1회성 조립 후 즉시 zeroFill 호출 (ADR-004 §c).
 */

import type {
  StoredApiKeyRecord,
  ApiProvider,
} from '@/05-features/byok/lib/types';
import {
  PassphraseTooShortError,
  PassphraseTooLongError,
  KeyFormatError,
  KeyNotFoundError,
  KeyAlreadyExistsError,
  NeedsKeyReentryError,
} from '@/05-features/byok/lib/types';
import {
  deriveKEK,
  encryptApiKey,
  decryptApiKey,
  computeFingerprint,
  zeroFill,
  toBase64Url,
  fromBase64Url,
  SALT_LENGTH_BYTES,
  PBKDF2_ITERATIONS,
  PBKDF2_HASH,
  IV_LENGTH_BYTES,
  FINGERPRINT_HEX_LENGTH,
} from '@/05-features/byok/lib/crypto';
import {
  isAvailable as isAvailableStorage,
  requestPersistentStorage as requestPersistentStorageStorage,
  putRecord,
  getRecord,
  listRecords as listRecordsStorage,
  deleteRecord,
  clearUserRecords,
  DB_NAME,
  DB_VERSION,
  STORE_NAME,
} from '@/05-features/byok/lib/storage';

// 상수 re-export
export {
  PBKDF2_ITERATIONS,
  PBKDF2_HASH,
  SALT_LENGTH_BYTES,
  IV_LENGTH_BYTES,
  FINGERPRINT_HEX_LENGTH,
  DB_NAME,
  DB_VERSION,
  STORE_NAME,
};

// 타입 + 에러 클래스 re-export
export * from '@/05-features/byok/lib/types';

// storage 함수 re-export
export const isAvailable = isAvailableStorage;
export const requestPersistentStorage = requestPersistentStorageStorage;

// ──────────────────────────────────────────────────────────────────────────────
// 내부 상수
// ──────────────────────────────────────────────────────────────────────────────

const PASSPHRASE_MIN = 8;
const PASSPHRASE_MAX = 128;
// Google AI API key 패턴: AIza + 35자 [0-9A-Za-z-_]
const GOOGLE_KEY_REGEX = /^AIza[0-9A-Za-z\-_]{35}$/;

// ──────────────────────────────────────────────────────────────────────────────
// 메모리 내 plaintextKey 관리 (lockAll 대상)
// ──────────────────────────────────────────────────────────────────────────────

const inMemoryPlaintextKeys = new Set<Uint8Array<ArrayBuffer>>();

// ──────────────────────────────────────────────────────────────────────────────
// 내부 검증 헬퍼
// ──────────────────────────────────────────────────────────────────────────────

function validatePassphrase(passphrase: string): void {
  if (passphrase.length < PASSPHRASE_MIN) {
    throw new PassphraseTooShortError(
      `passphrase는 최소 ${PASSPHRASE_MIN}자 이상이어야 합니다 (현재 ${passphrase.length}자)`
    );
  }
  if (passphrase.length > PASSPHRASE_MAX) {
    throw new PassphraseTooLongError(
      `passphrase는 최대 ${PASSPHRASE_MAX}자 이하이어야 합니다 (현재 ${passphrase.length}자)`
    );
  }
}

function validateKeyFormat(
  provider: ApiProvider,
  plaintextKey: Uint8Array<ArrayBuffer>
): void {
  const keyStr = new TextDecoder().decode(plaintextKey);
  if (provider === 'google-ai' || provider === 'google-fact-check') {
    if (!GOOGLE_KEY_REGEX.test(keyStr)) {
      throw new KeyFormatError(
        `${provider} API key 형식이 올바르지 않습니다. AIza로 시작하는 39자 형식이어야 합니다.`
      );
    }
  } else {
    // custom provider: 8~512자 범위
    if (keyStr.length < 8 || keyStr.length > 512) {
      throw new KeyFormatError(
        `custom API key 길이가 올바르지 않습니다 (현재 ${keyStr.length}자, 허용 8~512자)`
      );
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

/**
 * API key를 Web Crypto AES-GCM + PBKDF2 + non-extractable CryptoKey로 암호화하여 IndexedDB에 저장 (V2 schema).
 *
 * 저장 흐름:
 *   1. validate passphrase (8~128) + validate keyFormat
 *   2. 중복 check (KeyAlreadyExistsError)
 *   3. salt = getRandomValues(16 byte)
 *   4. KEK = deriveKEK(passphrase, salt, PBKDF2-SHA-256 600k, AES-GCM, extractable:false)
 *   5. {iv, ciphertext} = encryptApiKey(KEK, plaintextKey)
 *   6. keyFingerprint = SHA-256(plaintextKey).slice(0,16)
 *   7. zeroFill(plaintextKey) (best-effort, JS GC 비결정성 한계)
 *   8. record V2 put: {version:2, ciphertext, iv, salt, ...}
 *
 * passphrase 분실 시 record 삭제 후 재등록만 가능 — 복구 불가 (Precondition 1).
 * caller는 plaintextKey 전달 전 Uint8Array<ArrayBuffer>로 변환 의무.
 */
export async function saveKey(args: {
  userId: string;
  provider: ApiProvider;
  providerId: string;
  keyName: string;
  plaintextKey: Uint8Array<ArrayBuffer>;
  passphrase: string;
}): Promise<void> {
  // 1. 입력 검증
  validatePassphrase(args.passphrase);
  validateKeyFormat(args.provider, args.plaintextKey);

  // 2. 중복 존재 여부 확인
  try {
    await getRecord(args.userId, args.provider, args.keyName);
    // 여기까지 왔으면 이미 존재하는 것
    throw new KeyAlreadyExistsError(
      `${args.userId}:${args.provider}:${args.keyName} already exists`
    );
  } catch (e) {
    // KeyNotFoundError면 정상 — 신규 등록 진행
    if (!(e instanceof KeyNotFoundError)) throw e;
  }

  // 3. salt 생성 + KEK 유도
  const salt = crypto.getRandomValues(
    new Uint8Array(new ArrayBuffer(SALT_LENGTH_BYTES))
  );
  const kek = await deriveKEK(args.passphrase, salt);

  // 4. plaintextKey 직접 AES-GCM encrypt (V2: DEK 개념 제거)
  const { iv, ciphertext } = await encryptApiKey(kek, args.plaintextKey);

  // 5. plaintext key fingerprint 계산
  const keyFingerprint = await computeFingerprint(args.plaintextKey);

  // 6. plaintextKey zero-fill (best-effort, JS GC 비결정성 한계, Precondition 1 JSDoc 참조)
  zeroFill(args.plaintextKey);

  // 7. record V2 저장
  const now = new Date().toISOString();
  await putRecord({
    version: 2,
    userId: args.userId,
    provider: args.provider,
    providerId: args.providerId,
    keyName: args.keyName,
    ciphertext: toBase64Url(
      new Uint8Array(ciphertext) as Uint8Array<ArrayBuffer>
    ),
    iv: toBase64Url(iv),
    salt: toBase64Url(salt),
    kdf: 'PBKDF2-SHA-256',
    iterations: 600_000,
    keyFingerprint,
    fingerprintVersion: 1,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * 저장된 API key를 복호화하여 plaintextKey raw bytes로 반환 (V2 schema).
 *
 * 복호화 흐름:
 *   1. record 조회 (record.version !== 2 → NeedsKeyReentryError)
 *   2. KEK = deriveKEK(passphrase, salt)
 *   3. plaintextKey = decryptApiKey(KEK, iv, ciphertext)
 *   4. inMemoryPlaintextKeys 등록 (lockAll 대상)
 *   5. plaintextKey 반환 — caller zero-fill 의무 (ADR-004 §c)
 *
 * caller는 BE 헤더 1회성 조립 후 즉시 zeroFill 의무 (ADR-004 §c).
 * passphrase 분실 시 record 삭제 후 재등록만 가능 (복구 불가, Precondition 1).
 *
 * @throws PassphraseIncorrectError — 잘못된 passphrase (AES-GCM auth tag 실패)
 * @throws KeyNotFoundError — 해당 record 없음
 * @throws NeedsKeyReentryError — V1 record — 자동 migration 불가, 재등록 의무
 */
export async function unwrapKey(args: {
  userId: string;
  provider: ApiProvider;
  keyName: string;
  passphrase: string;
}): Promise<Uint8Array<ArrayBuffer>> {
  const record = await getRecord(args.userId, args.provider, args.keyName);

  // V1 record 자동 migration 불가 — 재등록 의무
  if (record.version !== 2) {
    throw new NeedsKeyReentryError(
      `record version ${record.version}은 V2 schema와 호환되지 않습니다. ` +
        '삭제 후 재등록 의무 (자동 migration 불가).'
    );
  }

  const salt = fromBase64Url(record.salt);
  const iv = fromBase64Url(record.iv);
  const ciphertext = fromBase64Url(record.ciphertext);
  const kek = await deriveKEK(args.passphrase, salt);
  const plaintextKey = await decryptApiKey(kek, iv, ciphertext);

  // lockAll() 시 wipe 대상으로 등록
  inMemoryPlaintextKeys.add(plaintextKey);
  return plaintextKey;
}

/**
 * userId에 속한 key 목록 조회.
 * 민감 필드(ciphertext, iv, salt)는 제거하여 반환.
 */
export async function listKeys(
  userId: string,
  filter?: { provider?: ApiProvider }
): Promise<Array<Omit<StoredApiKeyRecord, 'ciphertext' | 'iv' | 'salt'>>> {
  const records = await listRecordsStorage(userId, filter);
  return records.map((r) => {
    const { ciphertext: _ct, iv: _iv, salt: _s, ...rest } = r;
    void _ct;
    void _iv;
    void _s;
    return rest;
  });
}

/**
 * key record 삭제.
 */
export async function deleteKey(
  userId: string,
  provider: ApiProvider,
  keyName: string
): Promise<void> {
  await deleteRecord(userId, provider, keyName);
}

/**
 * key fingerprint 조회 (ADR-004 §f BE api_usage_logs 전달 경로).
 * caller가 BE 요청 헤더에 fingerprint 포함 시 호출.
 *
 * @returns 16 char hex (SHA-256.slice(0,16), 64-bit entropy, fingerprintVersion:1)
 */
export async function getKeyFingerprint(
  userId: string,
  provider: ApiProvider,
  keyName: string
): Promise<string> {
  const record = await getRecord(userId, provider, keyName);
  return record.keyFingerprint;
}

/**
 * userId 기준 전체 key record 삭제 (logout 시 호출).
 *
 * CodeRabbit Group C amend: clearUserRecords 호출 후 inMemoryPlaintextKeys 잔존을 방지하기 위해
 * lockAll()을 자동으로 호출한다. unwrapKey로 꺼낸 raw bytes가 메모리에 남아 있으면
 * IndexedDB 레코드 삭제 후에도 보안 기대(ADR-004 §c)를 어긋나게 할 수 있다.
 */
export async function clearAllKeys(userId: string): Promise<void> {
  await clearUserRecords(userId);
  lockAll();
}

/**
 * 메모리에 남아 있는 plaintextKey raw bytes를 모두 zero-fill.
 * beforeunload 이벤트 + explicit logout 시 호출.
 */
export function lockAll(): void {
  for (const key of inMemoryPlaintextKeys) {
    zeroFill(key);
  }
  inMemoryPlaintextKeys.clear();
}

// beforeunload 시 자동 lockAll (클라이언트 전용)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => lockAll());
}
