/**
 * BYOK lib — Web Crypto AES-GCM + PBKDF2 + envelope encryption.
 *
 * ADR-004 (b)(c) 정합. KEK = PBKDF2(passphrase, salt, 600k). DEK = random 32 byte raw bytes.
 * KEK usage = ['encrypt','decrypt'] (Round 1 F1 amend: wrapKey API 미사용).
 *
 * caller zero-fill 의무: unwrapDEK 반환 raw bytes는 BE 헤더 1회성 조립 후 즉시 zeroFill 호출 (ADR-004 §c).
 */

import { PassphraseIncorrectError } from '@/05-features/byok/lib/types';

export const PBKDF2_ITERATIONS = 600_000;
export const PBKDF2_HASH = 'SHA-256' as const;
export const SALT_LENGTH_BYTES = 16;
export const IV_LENGTH_BYTES = 12;
export const DEK_LENGTH_BYTES = 32;
export const FINGERPRINT_HEX_LENGTH = 16;

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

export async function wrapDEK(
  kek: CryptoKey,
  rawDEK: Uint8Array<ArrayBuffer>
): Promise<{ iv: Uint8Array<ArrayBuffer>; ciphertext: ArrayBuffer }> {
  const iv = new Uint8Array(new ArrayBuffer(IV_LENGTH_BYTES));
  crypto.getRandomValues(iv);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    kek,
    rawDEK as BufferSource
  );
  return { iv, ciphertext };
}

export async function unwrapDEK(
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
  } catch {
    // AES-GCM auth tag 검증 실패 — 잘못된 passphrase (또는 record 손상)
    throw new PassphraseIncorrectError(
      'AES-GCM authentication failed — wrong passphrase or corrupted record'
    );
  }
}

export function generateDEK(): Uint8Array<ArrayBuffer> {
  const dek = new Uint8Array(new ArrayBuffer(DEK_LENGTH_BYTES));
  crypto.getRandomValues(dek);
  return dek;
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
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const padding =
    padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + padding);
  const buf = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) {
    buf[i] = binary.charCodeAt(i);
  }
  return buf;
}
