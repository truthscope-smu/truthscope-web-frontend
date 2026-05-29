# fetch 래퍼 작성 규칙

> 출처: PR #9 (apiClient 도입) CodeRabbit 리뷰 3건 — `docs/code-review-history/2026-04-12-pr09-apiclient.md`

fetch를 직접 호출하는 래퍼(`apiClient`, `apiFetch`, custom HTTP client 등)를 작성할 때 반드시 다음 3가지를 갖춘다.

## 1. Headers는 `new Headers()`로 정규화

`RequestInit['headers']`는 다음 3가지 형태가 모두 가능:
- `Record<string, string>` (객체)
- `Headers` 인스턴스
- `[string, string][]` (튜플 배열)

**object spread (`{...headers}`)는 평문 객체만 올바르게 처리한다.** Headers 인스턴스나 튜플 배열을 spread하면 헤더가 누락된다.

```ts
// ❌ 금지 — Headers 인스턴스/튜플 배열에서 헤더 누락
headers: { Accept: 'application/json', ...headers }

// ✅ 올바름 — Headers 객체로 정규화
const requestHeaders = new Headers(headers);
if (!requestHeaders.has('Accept')) {
  requestHeaders.set('Accept', 'application/json');
}
```

## 2. body 없는 요청에 Content-Type 설정 금지

`Content-Type: application/json`을 GET/DELETE 등 body 없는 요청에도 무조건 설정하면 브라우저가 **CORS preflight(OPTIONS)**를 먼저 보낸다. 백엔드 CORS 설정에 따라 preflight 실패 시 원래 요청도 실패.

```ts
// ❌ 금지
headers: { 'Content-Type': 'application/json', ... }

// ✅ 올바름 — body 있을 때만
const hasBody = body !== undefined;
if (hasBody && !requestHeaders.has('Content-Type')) {
  requestHeaders.set('Content-Type', 'application/json');
}
```

## 3. catch에서 `AbortError`는 re-throw

`RequestInit.signal`로 `AbortController` 사용 시, 취소된 요청은 `AbortError` (`DOMException`)를 던진다. catch에서 모든 에러를 `AppError('네트워크 실패')`로 묶으면 **의도된 취소가 사용자 오류로 오인**된다.

```ts
// ❌ 금지
try {
  res = await fetch(url, init);
} catch {
  throw new AppError('네트워크 연결에 실패했습니다', 0);
}

// ✅ 올바름 — AbortError는 그대로
try {
  res = await fetch(url, init);
} catch (error) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    throw error;
  }
  throw new AppError('네트워크 연결에 실패했습니다', 0);
}
```

## 4. body 객체 직렬화는 래퍼 내부에서

호출자가 `body: JSON.stringify(...)`로 직접 직렬화하는 패턴은 이중 stringify 함정을 만든다. 래퍼가 객체를 받아 내부에서 한 번만 직렬화한다.

```ts
// ❌ 호출자 패턴
apiClient.post('/path', JSON.stringify({ url: 'x' }))

// ✅ 호출자 패턴
apiClient.post<TRes, TReq>('/path', { url: 'x' })

// 내부에서:
body: hasBody ? JSON.stringify(body) : undefined
```

## 5. 204 No Content 처리

```ts
if (res.status === 204) {
  return undefined as T;
}
return res.json() as Promise<T>;
```

## 6. 4xx/5xx → AppError 변환

```ts
if (!res.ok) {
  const errorBody = (await res.json().catch(() => ({}))) as BackendErrorBody;
  const message = errorBody.message ?? `요청 실패 (${res.status})`;
  throw new AppError(message, res.status);
}
```

---

## 체크리스트 (래퍼 수정/리뷰 시)

- [ ] `new Headers(headers)`로 정규화하는가?
- [ ] body 없을 때 Content-Type을 제외하는가?
- [ ] catch에서 AbortError를 re-throw하는가?
- [ ] 호출자가 직접 `JSON.stringify` 하지 않도록 객체 파라미터로 받는가?
- [ ] 204 처리가 있는가?
- [ ] 4xx/5xx를 `AppError`로 변환하는가?
