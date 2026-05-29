// Precondition 7: fake-indexeddb를 테스트 파일 상단에 직접 import (vitest.config.ts setupFiles 전역 추가 금지)
import 'fake-indexeddb/auto';

import { describe, it, expect } from 'vitest';
import {
  deriveKEK,
  encryptApiKey,
  decryptApiKey,
  computeFingerprint,
  zeroFill,
  toBase64Url,
  fromBase64Url,
  SALT_LENGTH_BYTES,
  IV_LENGTH_BYTES,
  FINGERPRINT_HEX_LENGTH,
} from '@/05-features/byok/lib/crypto';
import { PassphraseIncorrectError } from '@/05-features/byok/lib/types';

// 테스트 헬퍼: 랜덤 salt 생성
function makeSalt(): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(
    new Uint8Array(new ArrayBuffer(SALT_LENGTH_BYTES))
  );
}

// 테스트 헬퍼: 샘플 plaintextKey 생성 (Google AI key 형식)
function makePlaintextKey(): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(
    'AIzaSyTestKeyAAAAAAAAAAAAAAAAAAAAAAAAAAA'
  ) as Uint8Array<ArrayBuffer>;
}

describe('crypto.ts', () => {
  // ──────────────────────────────────────────────────────────
  // PBKDF2 deriveKEK
  // ──────────────────────────────────────────────────────────
  describe('PBKDF2 deriveKEK', () => {
    it('동일 passphrase + salt → 동일 KEK로 암호화 시 같은 평문 복호화 가능 (결정성 확인)', async () => {
      const salt = makeSalt();
      const passphrase = 'test-passphrase-123';
      const kek1 = await deriveKEK(passphrase, salt);
      const kek2 = await deriveKEK(passphrase, salt);

      // 같은 KEK로 암호화/복호화가 가능한지 검증 (CryptoKey 직접 비교 불가)
      const plaintextKey = makePlaintextKey();
      const { iv, ciphertext } = await encryptApiKey(kek1, plaintextKey);
      const decrypted = await decryptApiKey(
        kek2,
        iv,
        new Uint8Array(ciphertext) as Uint8Array<ArrayBuffer>
      );
      expect(Array.from(decrypted)).toEqual(Array.from(plaintextKey));
    });

    it('다른 salt → 다른 KEK (동일 passphrase, 동일 plaintext + 다른 KEK → 복호화 실패)', async () => {
      const salt1 = makeSalt();
      const salt2 = makeSalt();
      const passphrase = 'same-passphrase-123';
      const kek1 = await deriveKEK(passphrase, salt1);
      const kek2 = await deriveKEK(passphrase, salt2);

      const plaintextKey = makePlaintextKey();
      const { iv, ciphertext } = await encryptApiKey(kek1, plaintextKey);
      await expect(
        decryptApiKey(
          kek2,
          iv,
          new Uint8Array(ciphertext) as Uint8Array<ArrayBuffer>
        )
      ).rejects.toBeInstanceOf(PassphraseIncorrectError);
    });
  });

  // ──────────────────────────────────────────────────────────
  // AES-GCM encryptApiKey / decryptApiKey (V2 단일 KEK 암복호화)
  // ──────────────────────────────────────────────────────────
  describe('AES-GCM encryptApiKey / decryptApiKey', () => {
    it('roundtrip: encryptApiKey → decryptApiKey → 원본 plaintextKey 동일', async () => {
      const salt = makeSalt();
      const kek = await deriveKEK('roundtrip-passphrase-ok', salt);
      const plaintextKey = makePlaintextKey();

      const { iv, ciphertext } = await encryptApiKey(kek, plaintextKey);
      const decrypted = await decryptApiKey(
        kek,
        iv,
        new Uint8Array(ciphertext) as Uint8Array<ArrayBuffer>
      );

      expect(Array.from(decrypted)).toEqual(Array.from(plaintextKey));
    });

    it('wrong passphrase → PassphraseIncorrectError throw (auth tag fail)', async () => {
      const salt = makeSalt();
      const kek = await deriveKEK('correct-passphrase-123', salt);
      const wrongKek = await deriveKEK('wrong-passphrase-456', salt);
      const plaintextKey = makePlaintextKey();

      const { iv, ciphertext } = await encryptApiKey(kek, plaintextKey);
      await expect(
        decryptApiKey(
          wrongKek,
          iv,
          new Uint8Array(ciphertext) as Uint8Array<ArrayBuffer>
        )
      ).rejects.toBeInstanceOf(PassphraseIncorrectError);
    });

    // Round 1 F5 amend: IV uniqueness 검증 — 무력화 A FAIL 보장 의무
    it('IV uniqueness: 동일 plaintextKey 두 번 encrypt 시 IV 서로 다름', async () => {
      const salt = makeSalt();
      const kek = await deriveKEK('iv-uniqueness-test-123', salt);
      const plaintextKey = makePlaintextKey();

      const r1 = await encryptApiKey(kek, plaintextKey);
      const r2 = await encryptApiKey(kek, plaintextKey);

      expect(Array.from(r1.iv)).not.toEqual(Array.from(r2.iv));
    });

    it('ciphertext는 plaintextKey 원문과 달라야 함 (암호화 적용 검증)', async () => {
      const salt = makeSalt();
      const kek = await deriveKEK('encrypt-check-passphrase', salt);
      const plaintextKey = makePlaintextKey();

      const { ciphertext } = await encryptApiKey(kek, plaintextKey);
      const ciphertextBytes = new Uint8Array(ciphertext);

      // ciphertext 크기는 plaintext + GCM auth tag (16 byte)
      // 원문과 일치하지 않아야 함 (암호화 검증)
      expect(ciphertextBytes.length).toBeGreaterThan(plaintextKey.length);
      // 앞 plaintextKey.length 바이트가 원문과 같으면 암호화 미적용
      expect(
        Array.from(ciphertextBytes.slice(0, plaintextKey.length))
      ).not.toEqual(Array.from(plaintextKey));
    });
  });

  // ──────────────────────────────────────────────────────────
  // computeFingerprint
  // ──────────────────────────────────────────────────────────
  describe('computeFingerprint', () => {
    it(`${FINGERPRINT_HEX_LENGTH} hex char 반환 (64-bit entropy, Precondition 2)`, async () => {
      const plaintext = new TextEncoder().encode(
        'AIzaSyTestKey1234567890123456789012345'
      ) as Uint8Array<ArrayBuffer>;
      const fp = await computeFingerprint(plaintext);

      expect(fp.length).toBe(FINGERPRINT_HEX_LENGTH);
      expect(fp).toMatch(/^[0-9a-f]{16}$/);
    });

    it('동일 input → 동일 fingerprint (결정성)', async () => {
      const plaintext = new TextEncoder().encode(
        'AIzaSyDeterministicKey1234567890123456'
      ) as Uint8Array<ArrayBuffer>;
      const fp1 = await computeFingerprint(plaintext);
      const fp2 = await computeFingerprint(plaintext);
      expect(fp1).toBe(fp2);
    });

    it('다른 input → 다른 fingerprint (충돌 회피 기본 확인)', async () => {
      const p1 = new TextEncoder().encode(
        'AIzaSyKeyOne123456789012345678901234a'
      ) as Uint8Array<ArrayBuffer>;
      const p2 = new TextEncoder().encode(
        'AIzaSyKeyTwo123456789012345678901234b'
      ) as Uint8Array<ArrayBuffer>;
      const fp1 = await computeFingerprint(p1);
      const fp2 = await computeFingerprint(p2);
      expect(fp1).not.toBe(fp2);
    });
  });

  // ──────────────────────────────────────────────────────────
  // zeroFill
  // ──────────────────────────────────────────────────────────
  describe('zeroFill', () => {
    it('Uint8Array 모든 byte를 0으로 set', () => {
      const buf = new Uint8Array([1, 2, 3, 4]) as Uint8Array<ArrayBuffer>;
      zeroFill(buf);
      expect(Array.from(buf).every((b) => b === 0)).toBe(true);
    });

    it('이미 0인 Uint8Array도 정상 처리', () => {
      const buf = new Uint8Array(8) as Uint8Array<ArrayBuffer>;
      zeroFill(buf);
      expect(Array.from(buf).every((b) => b === 0)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // base64url encoding
  // ──────────────────────────────────────────────────────────
  describe('base64url encoding', () => {
    it('roundtrip: toBase64Url → fromBase64Url → 원본 Uint8Array 동일', () => {
      const original = new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8,
      ]) as Uint8Array<ArrayBuffer>;
      const encoded = toBase64Url(original);
      const decoded = fromBase64Url(encoded);
      expect(Array.from(decoded)).toEqual(Array.from(original));
    });

    it('패딩 없음 + URL safe (하이픈, 언더스코어 사용)', () => {
      // base64에서 +/= 가 나올 수 있는 바이트 배열
      // 0xfb = 251, 0xfc = 252 등은 base64에서 +/ 가 나올 수 있음
      const buf = new Uint8Array([
        0xfb, 0xfc, 0xfd, 0xfe, 0xff,
      ]) as Uint8Array<ArrayBuffer>;
      const encoded = toBase64Url(buf);

      // base64url 규칙: + → -, / → _, = 제거
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    it('빈 Uint8Array roundtrip', () => {
      const original = new Uint8Array(
        new ArrayBuffer(0)
      ) as Uint8Array<ArrayBuffer>;
      const encoded = toBase64Url(original);
      const decoded = fromBase64Url(encoded);
      expect(decoded.length).toBe(0);
    });

    it('IV_LENGTH_BYTES(12) 길이 roundtrip', () => {
      const iv = crypto.getRandomValues(
        new Uint8Array(new ArrayBuffer(IV_LENGTH_BYTES))
      );
      const encoded = toBase64Url(iv);
      const decoded = fromBase64Url(encoded);
      expect(Array.from(decoded)).toEqual(Array.from(iv));
    });
  });
});
