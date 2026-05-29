// Precondition 7: fake-indexeddb를 테스트 파일 상단에 직접 import (vitest.config.ts setupFiles 전역 추가 금지)
import 'fake-indexeddb/auto';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveKey, unwrapKey, lockAll, deleteKey } from '@/05-features/byok/lib';

// 테스트용 키 — AIza prefix 회피 (시크릿 스캐너 false-positive 방지)
// custom provider를 사용하여 google-ai regex 우회 (8~512자 범위 유효)
const TEST_ONLY_KEY = 'TEST_ONLY_GOOGLE_KEY_NON_SECRET_PATTERN_0001';
const VALID_PASSPHRASE = 'test-lifecycle-pass';

// 테스트 인자 구성 헬퍼
function makeSaveArgs(overrides: Partial<Parameters<typeof saveKey>[0]> = {}) {
  return {
    userId: 'lifecycle-user-1',
    provider: 'custom' as const,
    providerId: 'test-provider.example.com',
    keyName: 'lifecycle-key',
    plaintextKey: new TextEncoder().encode(
      TEST_ONLY_KEY
    ) as Uint8Array<ArrayBuffer>,
    passphrase: VALID_PASSPHRASE,
    ...overrides,
  };
}

describe('lifecycle.ts (index.ts 통합 lifecycle 테스트)', () => {
  // 각 테스트 전 fake-indexeddb 새 인스턴스로 교체 (테스트 격리)
  beforeEach(async () => {
    const { IDBFactory } = await import('fake-indexeddb');
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new IDBFactory(),
      configurable: true,
      writable: true,
    });
  });

  // ──────────────────────────────────────────────────────────
  // happy path: saveKey → unwrapKey → lockAll (V2 round-trip 검증)
  // ──────────────────────────────────────────────────────────
  describe('happy path: saveKey → unwrapKey → lockAll', () => {
    it('saveKey 저장 → unwrapKey 복호화 → 실제 plaintextKey 복원 → lockAll zero-fill', async () => {
      // saveKey (V2: plaintextKey 직접 AES-GCM encrypt)
      await saveKey(makeSaveArgs());

      // unwrapKey — plaintextKey raw bytes 반환 확인 (V2 round-trip)
      const plaintextKey = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'custom',
        keyName: 'lifecycle-key',
        passphrase: VALID_PASSPHRASE,
      });

      expect(plaintextKey).toBeInstanceOf(Uint8Array);

      // V2 round-trip 핵심 검증: 복호화된 bytes가 원본 TEST_ONLY_KEY와 동일해야 함
      const decoded = new TextDecoder().decode(plaintextKey);
      expect(decoded).toBe(TEST_ONLY_KEY);

      // lockAll 전: plaintextKey에 값이 있어야 함
      const beforeLock = Array.from(plaintextKey).some((b) => b !== 0);
      expect(beforeLock).toBe(true);

      // lockAll 호출 — inMemoryPlaintextKeys zero-fill
      lockAll();

      // lockAll 후: plaintextKey가 zero-fill되었는지 확인 (같은 참조)
      const afterLock = Array.from(plaintextKey).every((b) => b === 0);
      expect(afterLock).toBe(true);
    });

    it('lockAll 후 unwrapKey 재호출 → 새 plaintextKey 반환 (record는 유지)', async () => {
      await saveKey(makeSaveArgs());
      const key1 = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'custom',
        keyName: 'lifecycle-key',
        passphrase: VALID_PASSPHRASE,
      });

      lockAll();
      // key1은 zero-fill됨
      expect(Array.from(key1).every((b) => b === 0)).toBe(true);

      // lockAll 후 재호출 — record는 IndexedDB에 남아 있어 재복호화 가능
      const key2 = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'custom',
        keyName: 'lifecycle-key',
        passphrase: VALID_PASSPHRASE,
      });

      expect(key2).toBeInstanceOf(Uint8Array);
      // key2도 TEST_ONLY_KEY와 동일 (V2 round-trip 재확인)
      expect(new TextDecoder().decode(key2)).toBe(TEST_ONLY_KEY);
      // key2는 zero-fill 전 상태여야 함
      expect(Array.from(key2).some((b) => b !== 0)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // lockAll 여러 plaintextKey 동시 zero-fill
  // ──────────────────────────────────────────────────────────
  describe('lockAll 여러 plaintextKey 동시 zero-fill', () => {
    it('여러 key unwrapKey 후 lockAll → 모두 zero-fill', async () => {
      // key-a 저장
      await saveKey(makeSaveArgs({ keyName: 'key-a' }));
      // key-b 저장
      await saveKey(makeSaveArgs({ keyName: 'key-b' }));

      const keyA = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'custom',
        keyName: 'key-a',
        passphrase: VALID_PASSPHRASE,
      });
      const keyB = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'custom',
        keyName: 'key-b',
        passphrase: VALID_PASSPHRASE,
      });

      lockAll();

      expect(Array.from(keyA).every((b) => b === 0)).toBe(true);
      expect(Array.from(keyB).every((b) => b === 0)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // beforeunload 이벤트 → lockAll 자동 호출
  // ──────────────────────────────────────────────────────────
  describe('beforeunload 이벤트 → lockAll 자동 호출', () => {
    it('beforeunload dispatch 시 lockAll이 호출되어 plaintextKey zero-fill', async () => {
      await saveKey(makeSaveArgs());
      const plaintextKey = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'custom',
        keyName: 'lifecycle-key',
        passphrase: VALID_PASSPHRASE,
      });

      // lockAll spy
      const lockAllSpy = vi.fn();
      window.addEventListener('beforeunload', lockAllSpy);

      // beforeunload 이벤트 dispatch
      window.dispatchEvent(new Event('beforeunload'));

      // spy가 호출됐는지 확인
      expect(lockAllSpy).toHaveBeenCalledOnce();

      // index.ts의 실제 beforeunload 핸들러도 실행됐으므로 plaintextKey zero-fill 확인
      expect(Array.from(plaintextKey).every((b) => b === 0)).toBe(true);

      window.removeEventListener('beforeunload', lockAllSpy);
    });
  });

  // ──────────────────────────────────────────────────────────
  // deleteKey 후 unwrapKey → KeyNotFoundError (record 삭제 후 재등록만 가능)
  // ──────────────────────────────────────────────────────────
  describe('deleteKey + 재등록 flow', () => {
    it('deleteKey 후 saveKey 재등록 → 새 plaintextKey로 unwrapKey 가능', async () => {
      const { KeyNotFoundError } = await import('@/05-features/byok/lib');

      await saveKey(makeSaveArgs());

      // 삭제
      await deleteKey('lifecycle-user-1', 'custom', 'lifecycle-key');

      // 삭제 후 unwrapKey → KeyNotFoundError
      await expect(
        unwrapKey({
          userId: 'lifecycle-user-1',
          provider: 'custom',
          keyName: 'lifecycle-key',
          passphrase: VALID_PASSPHRASE,
        })
      ).rejects.toBeInstanceOf(KeyNotFoundError);

      // 재등록
      await saveKey(makeSaveArgs());

      // 재등록 후 unwrapKey → 성공 + round-trip 확인
      const newKey = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'custom',
        keyName: 'lifecycle-key',
        passphrase: VALID_PASSPHRASE,
      });

      expect(newKey).toBeInstanceOf(Uint8Array);
      // V2 round-trip: 복호화 결과 = 원본 TEST_ONLY_KEY
      expect(new TextDecoder().decode(newKey)).toBe(TEST_ONLY_KEY);
    });
  });
});
