# T1-9 회귀 시뮬레이션 ABC stdout 박제 (2026-05-28, V2 amend)

> 실측일: 2026-05-28 (Round 1) + amend 2026-05-28 (Round 2 PR #53 V2 schema)
> 실측 환경: Windows 11 Home, Node.js 20+, vitest 4.1.5, fake-indexeddb 6.2.5
> 브랜치: `feat/61-fe47-byok-aes-gcm-indexeddb-2026-05-28`
>
> V2 amend: `wrapDEK` → `encryptApiKey`, `generateDEK` 제거. 무력화 A/B 대상 함수명 정정.

---

## 무력화 A — State (encryptApiKey IV 재사용)

### 변경 내용

- 파일: `src/05-features/byok/lib/crypto.ts`
- 변경 위치: `encryptApiKey` 함수 내 IV 생성 라인

변경 전 (정상):

```ts
const iv = new Uint8Array(new ArrayBuffer(IV_LENGTH_BYTES));
crypto.getRandomValues(iv);
```

변경 후 (무력화):

```ts
const iv = new Uint8Array(new ArrayBuffer(IV_LENGTH_BYTES));
// 무력화 A: crypto.getRandomValues(iv); 를 주석 처리하여 IV를 모두 0으로 고정
// crypto.getRandomValues(iv);
```

### Fail (예상 — 실측 FAIL 확인됨)

```text
RUN  v4.1.5 ...

 FAIL  |unit| src/05-features/byok/lib/__tests__/crypto.test.ts > crypto.ts > AES-GCM encryptApiKey / decryptApiKey > IV uniqueness: 동일 plaintextKey 두 번 encrypt 시 IV 서로 다름

AssertionError: expected [ Array(12) ] to not deeply equal [ Array(12) ]

Compared values have no visual difference.

 ❯ src/05-features/byok/lib/__tests__/crypto.test.ts
       expect(Array.from(r1.iv)).not.toEqual(Array.from(r2.iv));
                                     ^

Test Files  1 failed | 4 passed (5)
      Tests  1 failed | 56 passed (57)
```

### Recover + PASS

원복 후 (정상 라인 복구: `crypto.getRandomValues(iv);`):

```text
RUN  v4.1.5 ...

 Test Files  5 passed (5)
      Tests  57 passed (57)
   Start at  17:34:51
   Duration  8.03s
```

---

## 무력화 B — Business logic (encryptApiKey 암호화 skip)

### 변경 내용

- 파일: `src/05-features/byok/lib/crypto.ts`
- 변경 위치: `encryptApiKey` 함수 내 AES-GCM encrypt 호출 라인

변경 전 (정상):

```ts
const ciphertext = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv: iv as BufferSource },
  kek,
  plaintextKey as BufferSource
);
return { iv, ciphertext };
```

변경 후 (무력화):

```ts
// 무력화 B: 암호화 skip, 원문 buffer 그대로 반환
const ciphertext = plaintextKey.buffer;
// const ciphertext = await crypto.subtle.encrypt(
//   { name: 'AES-GCM', iv: iv as BufferSource },
//   kek,
//   plaintextKey as BufferSource
// );
return { iv, ciphertext };
```

### Fail (예상 — 실측 FAIL 확인됨)

```text
RUN  v4.1.5 ...

 Test Files  2 failed | 3 passed (5)
      Tests  8 failed | 49 passed (57)

실패 테스트 목록:
 × crypto.ts > PBKDF2 deriveKEK > 동일 passphrase + salt → 동일 KEK로 암호화 시 같은 평문 복호화 가능 (결정성 확인)
 × crypto.ts > AES-GCM encryptApiKey / decryptApiKey > wrong passphrase → PassphraseIncorrectError throw (auth tag fail)
 × lifecycle.ts > happy path: saveKey → unwrapKey → lockAll > saveKey 저장 → unwrapKey 복호화 → 실제 plaintextKey 복원 → lockAll zero-fill
 × lifecycle.ts > happy path > lockAll 후 unwrapKey 재호출
 × lifecycle.ts > lockAll 여러 plaintextKey > 여러 key unwrapKey 후 lockAll → 모두 zero-fill
 × lifecycle.ts > beforeunload > beforeunload dispatch 시 lockAll이 호출되어 plaintextKey zero-fill
 × lifecycle.ts > deleteKey + 재등록 flow > deleteKey 후 saveKey 재등록 → 새 plaintextKey로 unwrapKey 가능
 × (기타 lifecycle)

원인: 암호화 skip 시 ciphertext = plaintextKey.buffer
decryptApiKey에서 AES-GCM 인증 태그 없는 데이터를 decrypt 시도 → PassphraseIncorrectError
roundtrip이 실패하므로 lifecycle 전체가 연쇄적으로 FAIL
```

### Recover + PASS

원복 후 (정상 encrypt 라인 복구):

```text
RUN  v4.1.5 ...

 Test Files  5 passed (5)
      Tests  57 passed (57)
   Start at  17:36:07
   Duration  8.15s
```

---

## 무력화 C — Contract (provider literal union 변경)

### 변경 내용

- 파일: `src/05-features/byok/lib/types.ts`
- 변경 위치: `ApiProvider` type 정의 10번째 라인

변경 전 (정상):

```ts
export type ApiProvider = 'google-ai' | 'google-fact-check' | 'custom';
```

변경 후 (무력화):

```ts
// 무력화 C: literal union 변경 (google-ai → gemini, google-fact-check → fact-check)
export type ApiProvider = 'gemini' | 'fact-check' | 'custom';
```

### Fail (예상 — 실측 FAIL 확인됨)

```text
> npm run typecheck

src/05-features/byok/lib/__stories__/byok-lib-happy-path.stories.tsx:
  error TS2345: Argument of type '"google-ai"' is not assignable to parameter of type 'ApiProvider | (() => ApiProvider)'.

src/05-features/byok/lib/__stories__/byok-lib-wrong-passphrase.stories.tsx:
  error TS2322: Type '"google-ai"' is not assignable to type 'ApiProvider'.

src/05-features/byok/lib/__tests__/lifecycle.test.ts:
  error TS2345: ...Types of property 'provider' are incompatible.
    Type 'ApiProvider | "google-ai"' is not assignable to type 'ApiProvider'.
      Type '"google-ai"' is not assignable to type 'ApiProvider'.

(총 14건 이상의 TS2322/TS2345/TS2367 컴파일 에러)
```

### Recover + PASS

원복 후 (정상 `'google-ai' | 'google-fact-check' | 'custom'` 복구):

```text
> npm run typecheck

(출력 없음 — 컴파일 성공)
```

---

## 결론

| 무력화 | 계층 | FAIL 확인 | 원복 PASS | verdict |
|--------|------|-----------|-----------|---------|
| A (State: IV 재사용) | State | FAIL 1건: IV uniqueness 테스트 | 57/57 PASS | PASS |
| B (Logic: encryptApiKey 암호화 skip) | Business Logic | FAIL 8건: roundtrip + lifecycle 연쇄 | 57/57 PASS | PASS |
| C (Contract: literal union 변경) | Contract | FAIL 14건+: TS2322/TS2345 컴파일 에러 | typecheck 0 에러 | PASS |

3건 모두 FAIL 확인 → 원복 PASS 확인. 회귀 시뮬레이션 ABC 완료.
(V2 amend: Vitest 총 케이스 59 → 57 변경. generateDEK 전용 2케이스 제거, encryptApiKey/decryptApiKey 4케이스 추가)
