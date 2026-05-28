/**
 * BYOK lib — IndexedDB CRUD 레이어.
 *
 * ADR-004 (a)(b) 정합. ObjectStore primary key = `${userId}:${provider}:${keyName}` 3중 복합.
 * lib은 auth context를 모른다 — caller(#18 form)가 userId 주입 의무 (Precondition 3).
 * Safari ITP 7일 방어: requestPersistentStorage() 호출 (Precondition 6).
 */

import type {
  StoredApiKeyRecord,
  ApiProvider,
} from '@/05-features/byok/lib/types';
import {
  IndexedDBNotSupportedError,
  KeyAlreadyExistsError,
  KeyNotFoundError,
} from '@/05-features/byok/lib/types';

export const DB_NAME = 'truthscope-byok';
export const DB_VERSION = 1;
export const STORE_NAME = 'keys';

// primary key 조합 헬퍼 — JSON.stringify([userId, provider, keyName]) 직렬화로
// ':' 포함 입력에서 발생하는 PK 충돌을 방지한다 (CodeRabbit Group C amend).
function primaryKey(
  userId: string,
  provider: ApiProvider,
  keyName: string
): string {
  return JSON.stringify([userId, provider, keyName]);
}

// IndexedDB 연결 헬퍼 (매 호출마다 열고 닫는 단순 패턴)
function openDB(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'pk' });
        // byUserId 인덱스: userId 필드로 필터링 지원
        store.createIndex('byUserId', 'userId', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * IndexedDB 사용 가능 여부 확인.
 * Safari Private 모드에서는 open 시도 시 오류 → false 반환.
 */
export async function isAvailable(): Promise<boolean> {
  if (
    typeof globalThis.indexedDB === 'undefined' ||
    globalThis.indexedDB === null
  ) {
    return false;
  }
  return new Promise<boolean>((resolve) => {
    try {
      const testReq = globalThis.indexedDB.open('__byok_probe__', 1);
      testReq.onsuccess = (event) => {
        (event.target as IDBOpenDBRequest).result.close();
        globalThis.indexedDB.deleteDatabase('__byok_probe__');
        resolve(true);
      };
      testReq.onerror = () => {
        resolve(false);
      };
    } catch {
      resolve(false);
    }
  });
}

/**
 * navigator.storage.persist() 호출로 Safari ITP 7일 자동 삭제 방어 (Precondition 6).
 * 실패하거나 API 미지원 시 false 반환 (caller에게 boolean만 반환, 예외 아님).
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.storage !== undefined &&
      navigator.storage !== null &&
      typeof navigator.storage.persist === 'function'
    ) {
      return await navigator.storage.persist();
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * record 저장. 같은 primary key가 이미 존재하면 KeyAlreadyExistsError throw.
 * putRecord는 항상 새 record 등록용 — update는 별도 메서드로 분리 (ADR-004 §a 정합).
 */
export async function putRecord(record: StoredApiKeyRecord): Promise<void> {
  const available = await isAvailable();
  if (!available) {
    throw new IndexedDBNotSupportedError(
      'IndexedDB is not available in this environment'
    );
  }

  const pk = primaryKey(record.userId, record.provider, record.keyName);
  const db = await openDB();
  try {
    // add() 직접 호출로 exist-check + add() 2단계 race condition을 제거한다.
    // IDBObjectStore.add()는 atomic — 중복 PK 시 ConstraintError를 던진다.
    // CodeRabbit Group C amend: exist check 제거 + ConstraintError → KeyAlreadyExistsError 변환.
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      // pk 필드를 추가해서 저장
      const recordWithPk = { ...record, pk };
      const req = store.add(recordWithPk);
      req.onsuccess = () => resolve();
      req.onerror = () => {
        const err = req.error;
        if (err?.name === 'ConstraintError') {
          reject(
            new KeyAlreadyExistsError(
              `${pk} already exists. Use deleteKey then saveKey to replace.`
            )
          );
        } else {
          reject(err ?? new Error('putRecord add() failed'));
        }
      };
    });
  } finally {
    db.close();
  }
}

/**
 * 단일 record 조회. 없으면 KeyNotFoundError throw.
 */
export async function getRecord(
  userId: string,
  provider: ApiProvider,
  keyName: string
): Promise<StoredApiKeyRecord> {
  const available = await isAvailable();
  if (!available) {
    throw new IndexedDBNotSupportedError(
      'IndexedDB is not available in this environment'
    );
  }

  const pk = primaryKey(userId, provider, keyName);
  const db = await openDB();
  try {
    const raw = await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(pk);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (raw === undefined || raw === null) {
      throw new KeyNotFoundError(`${pk} not found`);
    }

    // pk 필드 제거 후 반환 (StoredApiKeyRecord 타입 준수)
    const { pk: _pk, ...record } = raw as StoredApiKeyRecord & { pk: string };
    void _pk;
    return record as StoredApiKeyRecord;
  } finally {
    db.close();
  }
}

/**
 * userId 기준으로 record 목록 조회. provider 필터 선택적.
 */
export async function listRecords(
  userId: string,
  filter?: { provider?: ApiProvider }
): Promise<StoredApiKeyRecord[]> {
  const available = await isAvailable();
  if (!available) {
    throw new IndexedDBNotSupportedError(
      'IndexedDB is not available in this environment'
    );
  }

  const db = await openDB();
  try {
    const raws = await new Promise<unknown[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('byUserId');
      const req = index.getAll(userId);
      req.onsuccess = () => resolve((req.result ?? []) as unknown[]);
      req.onerror = () => reject(req.error);
    });

    const records = raws.map((raw) => {
      const { pk: _pk, ...record } = raw as StoredApiKeyRecord & {
        pk: string;
      };
      void _pk;
      return record as StoredApiKeyRecord;
    });

    // provider 필터 적용
    if (filter?.provider !== undefined) {
      return records.filter((r) => r.provider === filter.provider);
    }
    return records;
  } finally {
    db.close();
  }
}

/**
 * record 삭제. 없는 키 삭제는 조용히 성공 (idempotent).
 */
export async function deleteRecord(
  userId: string,
  provider: ApiProvider,
  keyName: string
): Promise<void> {
  const available = await isAvailable();
  if (!available) {
    throw new IndexedDBNotSupportedError(
      'IndexedDB is not available in this environment'
    );
  }

  const pk = primaryKey(userId, provider, keyName);
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(pk);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

/**
 * userId에 속한 모든 record 삭제 (logout 시 호출).
 */
export async function clearUserRecords(userId: string): Promise<void> {
  const available = await isAvailable();
  if (!available) {
    throw new IndexedDBNotSupportedError(
      'IndexedDB is not available in this environment'
    );
  }

  const db = await openDB();
  try {
    // byUserId 인덱스로 해당 userId의 모든 pk 수집 후 삭제
    const pks = await new Promise<string[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('byUserId');
      const req = index.getAll(userId);
      req.onsuccess = () => {
        const items = (req.result ?? []) as (StoredApiKeyRecord & {
          pk: string;
        })[];
        resolve(items.map((item) => item.pk));
      };
      req.onerror = () => reject(req.error);
    });

    if (pks.length === 0) return;

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      let pending = pks.length;
      let failed = false;

      for (const pk of pks) {
        const req = store.delete(pk);
        req.onsuccess = () => {
          pending -= 1;
          if (pending === 0 && !failed) resolve();
        };
        req.onerror = () => {
          if (!failed) {
            failed = true;
            reject(req.error);
          }
        };
      }
    });
  } finally {
    db.close();
  }
}
