// Precondition 7: fake-indexeddb를 테스트 파일 상단에 직접 import (vitest.config.ts setupFiles 전역 추가 금지)
import 'fake-indexeddb/auto';

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isAvailable,
  requestPersistentStorage,
  putRecord,
  getRecord,
  listRecords,
  deleteRecord,
  clearUserRecords,
} from '@/05-features/byok/lib/storage';
import {
  KeyAlreadyExistsError,
  KeyNotFoundError,
  type StoredApiKeyRecordV1,
} from '@/05-features/byok/lib/types';

// 테스트용 샘플 record 생성 헬퍼
const sampleRecord = (
  overrides: Partial<StoredApiKeyRecordV1> = {}
): StoredApiKeyRecordV1 => ({
  version: 1,
  userId: 'user-1',
  provider: 'google-ai',
  providerId: 'generativelanguage.googleapis.com',
  keyName: 'default',
  wrappedDekIv: 'aWl2aWl2aWl2', // base64url 12 byte 샘플
  wrappedDekCiphertext: 'Y3R4Y3R4Y3R4Y3R4Y3R4Y3R4Y3R4Y3R4Y3R4Y3R4Y3R4',
  salt: 'c2x0c2x0c2x0c2x0', // base64url 16 byte 샘플
  kdf: 'PBKDF2-SHA-256',
  iterations: 600_000,
  keyFingerprint: 'a1b2c3d4e5f60718',
  fingerprintVersion: 1,
  createdAt: '2026-05-28T00:00:00.000Z',
  updatedAt: '2026-05-28T00:00:00.000Z',
  ...overrides,
});

describe('storage.ts', () => {
  // 각 테스트 전 fake-indexeddb를 새 인스턴스로 초기화하여 테스트 격리.
  // fake-indexeddb/auto 가 최초 import 시 globalThis.indexedDB를 자동 설정하므로,
  // beforeEach에서 IDBFactory(재export된 FDBFactory)를 새로 인스턴스화하여 교체.
  beforeEach(async () => {
    const { IDBFactory } = await import('fake-indexeddb');
    // globalThis.indexedDB 교체 (테스트 격리용)
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new IDBFactory(),
      configurable: true,
      writable: true,
    });
  });

  // ──────────────────────────────────────────────────────────
  // isAvailable
  // ──────────────────────────────────────────────────────────
  describe('isAvailable', () => {
    it('globalThis.indexedDB 존재 시 true 반환', async () => {
      const result = await isAvailable();
      expect(result).toBe(true);
    });

    it('globalThis.indexedDB가 undefined이면 false 반환', async () => {
      const original = globalThis.indexedDB;
      // @ts-expect-error: 테스트를 위한 임시 undefined 설정
      globalThis.indexedDB = undefined;
      const result = await isAvailable();
      globalThis.indexedDB = original;
      expect(result).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────
  // putRecord + getRecord roundtrip
  // ──────────────────────────────────────────────────────────
  describe('putRecord + getRecord', () => {
    it('putRecord → getRecord roundtrip', async () => {
      const record = sampleRecord();
      await putRecord(record);
      const retrieved = await getRecord(
        record.userId,
        record.provider,
        record.keyName
      );

      expect(retrieved.userId).toBe(record.userId);
      expect(retrieved.provider).toBe(record.provider);
      expect(retrieved.keyName).toBe(record.keyName);
      expect(retrieved.keyFingerprint).toBe(record.keyFingerprint);
      expect(retrieved.wrappedDekIv).toBe(record.wrappedDekIv);
    });

    it('pk 필드가 반환 결과에 포함되지 않음', async () => {
      const record = sampleRecord();
      await putRecord(record);
      const retrieved = await getRecord(
        record.userId,
        record.provider,
        record.keyName
      );

      // StoredApiKeyRecordV1 타입에 pk 필드 없음 확인
      expect((retrieved as Record<string, unknown>)['pk']).toBeUndefined();
    });
  });

  // ──────────────────────────────────────────────────────────
  // duplicate primary key → KeyAlreadyExistsError
  // ──────────────────────────────────────────────────────────
  describe('KeyAlreadyExistsError', () => {
    it('동일 primary key (userId:provider:keyName) 재등록 시 KeyAlreadyExistsError', async () => {
      const record = sampleRecord();
      await putRecord(record);
      await expect(putRecord(record)).rejects.toBeInstanceOf(
        KeyAlreadyExistsError
      );
    });

    it('다른 keyName이면 중복 아님 (정상 저장)', async () => {
      const record1 = sampleRecord({ keyName: 'key-a' });
      const record2 = sampleRecord({ keyName: 'key-b' });
      await putRecord(record1);
      await expect(putRecord(record2)).resolves.toBeUndefined();
    });

    it('다른 userId이면 중복 아님 (사용자 격리, Precondition 3)', async () => {
      const record1 = sampleRecord({ userId: 'user-1' });
      const record2 = sampleRecord({ userId: 'user-2' });
      await putRecord(record1);
      await expect(putRecord(record2)).resolves.toBeUndefined();
    });
  });

  // ──────────────────────────────────────────────────────────
  // getRecord 없는 키 → KeyNotFoundError
  // ──────────────────────────────────────────────────────────
  describe('KeyNotFoundError', () => {
    it('존재하지 않는 키 조회 시 KeyNotFoundError', async () => {
      await expect(
        getRecord('nonexistent-user', 'google-ai', 'missing-key')
      ).rejects.toBeInstanceOf(KeyNotFoundError);
    });
  });

  // ──────────────────────────────────────────────────────────
  // listRecords
  // ──────────────────────────────────────────────────────────
  describe('listRecords', () => {
    it('userId 기준 전체 조회', async () => {
      await putRecord(
        sampleRecord({ keyName: 'key-a', provider: 'google-ai' })
      );
      await putRecord(
        sampleRecord({ keyName: 'key-b', provider: 'google-fact-check' })
      );
      await putRecord(sampleRecord({ userId: 'user-2', keyName: 'key-c' }));

      const records = await listRecords('user-1');
      expect(records).toHaveLength(2);
    });

    it('provider 필터 적용', async () => {
      await putRecord(
        sampleRecord({ keyName: 'key-ai', provider: 'google-ai' })
      );
      await putRecord(
        sampleRecord({ keyName: 'key-fc', provider: 'google-fact-check' })
      );

      const aiRecords = await listRecords('user-1', { provider: 'google-ai' });
      expect(aiRecords).toHaveLength(1);
      expect(aiRecords[0]?.provider).toBe('google-ai');
    });

    it('존재하지 않는 userId로 조회 시 빈 배열 반환', async () => {
      const records = await listRecords('nonexistent-user');
      expect(records).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────────────────
  // deleteRecord
  // ──────────────────────────────────────────────────────────
  describe('deleteRecord', () => {
    it('deleteRecord 후 getRecord → KeyNotFoundError', async () => {
      const record = sampleRecord();
      await putRecord(record);
      await deleteRecord(record.userId, record.provider, record.keyName);
      await expect(
        getRecord(record.userId, record.provider, record.keyName)
      ).rejects.toBeInstanceOf(KeyNotFoundError);
    });

    it('존재하지 않는 키 삭제는 조용히 성공 (idempotent)', async () => {
      await expect(
        deleteRecord('nonexistent-user', 'google-ai', 'nonexistent-key')
      ).resolves.toBeUndefined();
    });
  });

  // ──────────────────────────────────────────────────────────
  // clearUserRecords
  // ──────────────────────────────────────────────────────────
  describe('clearUserRecords', () => {
    it('clearUserRecords → user-1 record 삭제, user-2 record 유지', async () => {
      await putRecord(sampleRecord({ userId: 'user-1', keyName: 'key-a' }));
      await putRecord(sampleRecord({ userId: 'user-1', keyName: 'key-b' }));
      await putRecord(sampleRecord({ userId: 'user-2', keyName: 'key-c' }));

      await clearUserRecords('user-1');

      const user1Records = await listRecords('user-1');
      const user2Records = await listRecords('user-2');

      expect(user1Records).toHaveLength(0);
      expect(user2Records).toHaveLength(1);
    });

    it('record 없는 userId clearUserRecords도 정상 처리', async () => {
      await expect(
        clearUserRecords('nonexistent-user')
      ).resolves.toBeUndefined();
    });
  });

  // ──────────────────────────────────────────────────────────
  // requestPersistentStorage
  // ──────────────────────────────────────────────────────────
  describe('requestPersistentStorage', () => {
    it('navigator.storage.persist mock → true 반환', async () => {
      const originalStorage = Object.getOwnPropertyDescriptor(
        navigator,
        'storage'
      );
      Object.defineProperty(navigator, 'storage', {
        value: { persist: async () => true },
        configurable: true,
        writable: true,
      });

      const result = await requestPersistentStorage();
      expect(result).toBe(true);

      // 복원
      if (originalStorage) {
        Object.defineProperty(navigator, 'storage', originalStorage);
      } else {
        // originalStorage 없던 환경 — mock 값 delete
        delete (navigator as { storage?: unknown }).storage;
      }
    });

    it('navigator.storage 미지원 시 false 반환', async () => {
      const originalStorage = Object.getOwnPropertyDescriptor(
        navigator,
        'storage'
      );
      Object.defineProperty(navigator, 'storage', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const result = await requestPersistentStorage();
      expect(result).toBe(false);

      // 복원
      if (originalStorage) {
        Object.defineProperty(navigator, 'storage', originalStorage);
      } else {
        // originalStorage 없던 환경 — mock 값 delete
        delete (navigator as { storage?: unknown }).storage;
      }
    });
  });
});
