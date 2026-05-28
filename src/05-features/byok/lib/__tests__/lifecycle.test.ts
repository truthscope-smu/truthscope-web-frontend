// Precondition 7: fake-indexeddb를 테스트 파일 상단에 직접 import (vitest.config.ts setupFiles 전역 추가 금지)
import 'fake-indexeddb/auto';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveKey, unwrapKey, lockAll, deleteKey } from '@/05-features/byok/lib';

// 테스트용 키 (저엔트로피 반복 패턴 — 시크릿 스캐너 엔트로피 검사 통과 안 됨, 실제 key 아님)
const TEST_ONLY_KEY = 'AIzaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const VALID_PASSPHRASE = 'test-lifecycle-pass';

// 테스트 인자 구성 헬퍼
function makeSaveArgs(overrides: Partial<Parameters<typeof saveKey>[0]> = {}) {
  return {
    userId: 'lifecycle-user-1',
    provider: 'google-ai' as const,
    providerId: 'generativelanguage.googleapis.com',
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
  // happy path: saveKey → unwrapKey → lockAll
  // ──────────────────────────────────────────────────────────
  describe('happy path: saveKey → unwrapKey → lockAll', () => {
    it('saveKey 저장 → unwrapKey 복호화 → lockAll zero-fill', async () => {
      // saveKey
      await saveKey(makeSaveArgs());

      // unwrapKey — rawDEK 반환 확인
      const rawDEK = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'google-ai',
        keyName: 'lifecycle-key',
        passphrase: VALID_PASSPHRASE,
      });

      expect(rawDEK).toBeInstanceOf(Uint8Array);
      expect(rawDEK.length).toBe(32);

      // lockAll 전: rawDEK에 값이 있어야 함
      const beforeLock = Array.from(rawDEK).some((b) => b !== 0);
      expect(beforeLock).toBe(true);

      // lockAll 호출 — inMemoryDeks zero-fill
      lockAll();

      // lockAll 후: rawDEK가 zero-fill되었는지 확인 (같은 참조)
      const afterLock = Array.from(rawDEK).every((b) => b === 0);
      expect(afterLock).toBe(true);
    });

    it('lockAll 후 unwrapKey 재호출 → 새 rawDEK 반환 (record는 유지)', async () => {
      await saveKey(makeSaveArgs());
      const dek1 = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'google-ai',
        keyName: 'lifecycle-key',
        passphrase: VALID_PASSPHRASE,
      });

      lockAll();
      // dek1은 zero-fill됨
      expect(Array.from(dek1).every((b) => b === 0)).toBe(true);

      // lockAll 후 재호출 — record는 IndexedDB에 남아 있어 재복호화 가능
      const dek2 = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'google-ai',
        keyName: 'lifecycle-key',
        passphrase: VALID_PASSPHRASE,
      });

      expect(dek2).toBeInstanceOf(Uint8Array);
      expect(dek2.length).toBe(32);
      // dek2는 zero-fill 전 상태여야 함
      expect(Array.from(dek2).some((b) => b !== 0)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // lockAll 여러 DEK 동시 zero-fill
  // ──────────────────────────────────────────────────────────
  describe('lockAll 여러 DEK 동시 zero-fill', () => {
    it('여러 key unwrapKey 후 lockAll → 모두 zero-fill', async () => {
      // key-a 저장
      await saveKey(makeSaveArgs({ keyName: 'key-a' }));
      // key-b 저장
      await saveKey(makeSaveArgs({ keyName: 'key-b' }));

      const dekA = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'google-ai',
        keyName: 'key-a',
        passphrase: VALID_PASSPHRASE,
      });
      const dekB = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'google-ai',
        keyName: 'key-b',
        passphrase: VALID_PASSPHRASE,
      });

      lockAll();

      expect(Array.from(dekA).every((b) => b === 0)).toBe(true);
      expect(Array.from(dekB).every((b) => b === 0)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // beforeunload 이벤트 → lockAll 자동 호출
  // ──────────────────────────────────────────────────────────
  describe('beforeunload 이벤트 → lockAll 자동 호출', () => {
    it('beforeunload dispatch 시 lockAll이 호출되어 DEK zero-fill', async () => {
      await saveKey(makeSaveArgs());
      const rawDEK = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'google-ai',
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

      // index.ts의 실제 beforeunload 핸들러도 실행됐으므로 rawDEK zero-fill 확인
      expect(Array.from(rawDEK).every((b) => b === 0)).toBe(true);

      window.removeEventListener('beforeunload', lockAllSpy);
    });
  });

  // ──────────────────────────────────────────────────────────
  // deleteKey 후 unwrapKey → KeyNotFoundError (record 삭제 후 재등록만 가능)
  // ──────────────────────────────────────────────────────────
  describe('deleteKey + 재등록 flow', () => {
    it('deleteKey 후 saveKey 재등록 → 새 DEK로 unwrapKey 가능', async () => {
      const { KeyNotFoundError } = await import('@/05-features/byok/lib');

      await saveKey(makeSaveArgs());

      // 삭제
      await deleteKey('lifecycle-user-1', 'google-ai', 'lifecycle-key');

      // 삭제 후 unwrapKey → KeyNotFoundError
      await expect(
        unwrapKey({
          userId: 'lifecycle-user-1',
          provider: 'google-ai',
          keyName: 'lifecycle-key',
          passphrase: VALID_PASSPHRASE,
        })
      ).rejects.toBeInstanceOf(KeyNotFoundError);

      // 재등록
      await saveKey(makeSaveArgs());

      // 재등록 후 unwrapKey → 성공
      const newDEK = await unwrapKey({
        userId: 'lifecycle-user-1',
        provider: 'google-ai',
        keyName: 'lifecycle-key',
        passphrase: VALID_PASSPHRASE,
      });

      expect(newDEK).toBeInstanceOf(Uint8Array);
      expect(newDEK.length).toBe(32);
    });
  });
});
