/**
 * BYOK lib — Web Crypto AES-GCM + PBKDF2 + non-extractable CryptoKey + encrypted IndexedDB storage.
 *
 * ADR-004 (b)(c) 정합.
 * KEK = PBKDF2(passphrase, salt, 600k, AES-GCM, extractable:false, ['encrypt','decrypt']).
 * plaintextKey를 KEK로 직접 AES-GCM encrypt (V1 DEK/KEK envelope 구조 폐기 — 옵션 B).
 *
 * caller zero-fill 의무: decryptApiKey 반환 raw bytes는 BE 헤더 1회성 조립 후 즉시 zeroFill 호출 (ADR-004 §c).
 */

import {
  IntegrityError,
  PassphraseIncorrectError,
} from '@/05-features/byok/lib/types';

export const PBKDF2_ITERATIONS = 600_000;
export const PBKDF2_HASH = 'SHA-256' as const;
export const SALT_LENGTH_BYTES = 16;
export const IV_LENGTH_BYTES = 12;
export const FINGERPRINT_HEX_LENGTH = 16;

/**
 * PBKDF2-SHA-256 600k 반복으로 passphrase + salt에서 KEK 유도.
 * extractable:false — CryptoKey가 JS 메모리 외부로 노출되지 않음.
 * usages: ['encrypt','decrypt'] — AES-GCM 직접 암복호화용.
 */
export async function deriveKEK(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>
): Promise<CryptoKey> {
  const passphraseBytes = new TextEncoder().encode(passphrase);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passphraseBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * AES-GCM으로 plaintextKey를 KEK로 직접 암호화.
 * IV는 매 호출마다 random 12 byte 생성 (IV uniqueness 보장).
 *
 * V1 DEK/KEK envelope 구조 폐기 — codex 5.5 thread `019e6ded` 옵션 B 채택.
 */
export async function encryptApiKey(
  kek: CryptoKey,
  plaintextKey: Uint8Array<ArrayBuffer>
): Promise<{ iv: Uint8Array<ArrayBuffer>; ciphertext: ArrayBuffer }> {
  const iv = new Uint8Array(new ArrayBuffer(IV_LENGTH_BYTES));
  crypto.getRandomValues(iv);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    kek,
    plaintextKey as BufferSource
  );
  return { iv, ciphertext };
}

/**
 * AES-GCM으로 ciphertext를 KEK로 복호화하여 plaintextKey raw bytes 반환.
 * AES-GCM auth tag 검증 실패 시 PassphraseIncorrectError throw.
 *
 * caller zero-fill 의무: 반환 bytes는 BE 헤더 1회성 조립 후 즉시 zeroFill 호출 (ADR-004 §c).
 */
export async function decryptApiKey(
  kek: CryptoKey,
  iv: Uint8Array<ArrayBuffer>,
  ciphertext: Uint8Array<ArrayBuffer>
): Promise<Uint8Array<ArrayBuffer>> {
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      kek,
      ciphertext as BufferSource
    );
    return new Uint8Array(plaintext);
  } catch (error) {
    // AES-GCM 복호화 실패는 DOMException (name='OperationError').
    // Web Crypto 명세상 subtle.decrypt()는 auth tag 실패 시 DOMException을 throw.
    // jsdom/Node.js 환경별로 DOMException 인스턴스 여부 또는 name='OperationError'로 구분.
    // IntegrityError는 fromBase64Url() 실패 등 decryptApiKey() 호출 전 단계에서 발생.
    const isWebCryptoError =
      error instanceof DOMException ||
      (error instanceof Error && error.name === 'OperationError');
    if (isWebCryptoError) {
      throw new PassphraseIncorrectError(
        'AES-GCM authentication failed — wrong passphrase'
      );
    }
    throw new IntegrityError('Stored record has invalid IV or ciphertext data');
  }
}

export async function computeFingerprint(
  plaintext: Uint8Array<ArrayBuffer>
): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    plaintext as BufferSource
  );
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, FINGERPRINT_HEX_LENGTH);
}

export function zeroFill(buf: Uint8Array<ArrayBuffer>): void {
  buf.fill(0);
}

// Uint8Array.toBase64() ES2026 V8 미구현이라 수동 구현.
// noUncheckedIndexedAccess 대응: Array.from()으로 안전하게 순회
export function toBase64Url(buf: Uint8Array<ArrayBuffer>): string {
  const binary = Array.from(buf)
    .map((b) => String.fromCharCode(b))
    .join('');
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function fromBase64Url(s: string): Uint8Array<ArrayBuffer> {
  try {
    const padded = s.replace(/-/g, '+').replace(/_/g, '/');
    const padding =
      padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const binary = atob(padded + padding);
    const buf = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) {
      buf[i] = binary.charCodeAt(i);
    }
    return buf;
  } catch {
    // atob 실패 = 저장 레코드의 base64url 형식 이상 → IntegrityError
    throw new IntegrityError('Stored record has invalid base64url data');
  }
}
