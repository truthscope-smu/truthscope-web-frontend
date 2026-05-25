# API & 데이터 패칭 규칙

## API 호출
- Spring Boot API: `apiClient` (`@/07-shared/api`)
- `fetch()` 직접 사용 금지 — 반드시 `apiClient` 래퍼 사용
- 메서드별 분리: `apiClient.get / .post / .patch / .delete`
- body는 객체로 전달 — 내부에서 `JSON.stringify` 처리 (직접 직렬화 금지)
- 타입 안전: `apiClient.post<TRes, TReq>(path, body)` — 요청/응답 둘 다 제네릭 지정
- 네트워크 실패 + 4xx/5xx 응답은 자동으로 `AppError`로 변환됨

## Supabase 클라이언트
- Client Component: `getSupabaseBrowserClient` (`@/07-shared/api/supabase/client`)
- Server Component: `getSupabaseServerClient` (`@/07-shared/api/supabase/server`)
- Server에서 Browser 클라이언트 사용 금지

## 환경변수
- `process.env` 직접 접근 금지
- 반드시 `config` (`@/07-shared/config/config`) 통해 접근

```ts
// ❌ 금지
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

// ✅ 올바름
import { config } from '@/07-shared/config/config';
const url = config.supabase.url;
```
