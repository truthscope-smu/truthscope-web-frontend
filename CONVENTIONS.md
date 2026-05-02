# TruthScope Web Frontend — 코딩 컨벤션 가이드

> 이 문서는 팀원이 코드를 작성할 때 참고하는 규칙입니다.

---

## 1. FSD (Feature-Sliced Design) 아키텍처

```
src/
├── app/              ← Next.js App Router (라우트 + 레이아웃)
├── 03-pages/         ← 페이지 단위 컴포넌트 (app/에서 import)
├── 04-widgets/       ← 레이아웃 위젯 (Navbar, Footer 등)
├── 05-features/      ← 기능 단위 모듈 (auth, analysis 등)
├── 06-entities/      ← 도메인 엔티티 (타입, 기본 CRUD)
└── 07-shared/        ← 기반 레이어 (api, config, errors, types, utils)
```

### 핵심 규칙: Import 방향

**높은 번호에서만 import 가능.** 낮은 번호 → 높은 번호 방향만 허용.

```
app → 03-pages → 04-widgets → 05-features → 06-entities → 07-shared
 ←←←←←←←←←←← import 허용 방향 ←←←←←←←←←←←
```

```ts
// ✅ 허용 — 05-features가 07-shared에서 import
import { AppError } from '@/07-shared/errors';

// ✅ 허용 — 03-pages가 05-features에서 import
import { useAuth } from '@/05-features/auth';

// ❌ 금지 — 07-shared가 05-features에서 import
import { useAuth } from '@/05-features/auth'; // 07-shared 안에서 사용 금지!
```

---

## 2. Import/Export 패턴

### Barrel Export (index.ts)

각 레이어와 슬라이스는 `index.ts`로 외부 API를 노출합니다.

```ts
// src/05-features/auth/index.ts
export { AuthModal } from './ui/auth-modal';
export { useAuth } from './model/use-auth';
```

### Import 할 때

```ts
// ✅ barrel을 통해 import (슬라이스 외부에서)
import { AuthModal, useAuth } from '@/05-features/auth';

// ✅ 직접 경로 import도 허용 (구체적인 모듈이 필요할 때)
import { getSupabaseBrowserClient } from '@/07-shared/api/supabase/client';

// ❌ 슬라이스 내부 구조에 직접 접근 금지 (barrel 우회)
import { AuthModal } from '@/05-features/auth/ui/auth-modal'; // 외부에서 비권장
```

### 07-shared 주요 Import 경로

| 모듈 | Import 경로 | 용도 |
|------|------------|------|
| **AppError** | `@/07-shared/errors` | 에러 throw |
| **apiClient** | `@/07-shared/api` | Spring Boot API 호출 |
| **Supabase (브라우저)** | `@/07-shared/api/supabase/client` | Client Component |
| **Supabase (서버)** | `@/07-shared/api/supabase/server` | Server Component |
| **config** | `@/07-shared/config/config` | 환경변수 접근 |

---

## 3. 슬라이스 내부 구조

기능을 추가할 때 아래 구조를 따릅니다.

```
05-features/auth/
├── index.ts           ← barrel export (외부에 노출할 것만)
├── model/             ← 비즈니스 로직, 커스텀 훅
│   └── use-auth.ts
└── ui/                ← UI 컴포넌트
    └── auth-modal.tsx
```

```
04-widgets/navbar/
├── index.ts
└── navbar.tsx
```

---

## 4. 파일/폴더 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| **폴더** | kebab-case | `auth-modal/`, `api/` |
| **파일** | kebab-case + dot-role suffix | `auth-modal.tsx`, `use-auth.ts` |
| **컴포넌트** | PascalCase | `AuthModal`, `Navbar` |
| **변수/함수** | camelCase | `getSupabaseBrowserClient` |
| **타입/인터페이스** | PascalCase | `Article`, `AnalysisSession` |

---

## 5. API 호출 패턴

### Spring Boot 백엔드 API

```ts
import { apiClient } from '@/07-shared/api';

// GET
const article = await apiClient.get<Article>('/articles/123');

// POST (두 번째 제네릭은 body 타입)
const result = await apiClient.post<AnalysisResponse, { url: string }>(
  '/analysis-sessions',
  { url: newsUrl }
);
```

`apiClient`는 내부적으로 `JSON.stringify`를 처리하므로 body를 직접 직렬화하지 않는다.
네트워크 실패 및 4xx/5xx 응답은 자동으로 `AppError`로 변환된다.

### Supabase (Client Component)

```ts
'use client';
import { getSupabaseBrowserClient } from '@/07-shared/api/supabase/client';

function MyComponent() {
  const supabase = getSupabaseBrowserClient();
  // supabase.from('articles').select('*') ...
}
```

### Supabase (Server Component)

```ts
import { getSupabaseServerClient } from '@/07-shared/api/supabase/server';

export default async function Page() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from('articles').select('*');
  // ...
}
```

---

## 6. 에러 처리

```ts
import { AppError } from '@/07-shared/errors';

// 에러 throw
throw new AppError('분석 실패', 400);  // 4xx → status: 'fail'
throw new AppError('서버 오류', 500);  // 5xx → status: 'error'

// apiClient는 자동으로 응답 에러를 AppError로 변환
try {
  const data = await apiClient.get('/analysis-sessions/123');
} catch (err) {
  if (err instanceof AppError) {
    console.error(err.statusCode, err.message);
  }
}
```

에러 UI는 Next.js가 자동 처리:
- `app/error.tsx` — 라우트 내부 런타임 에러
- `app/global-error.tsx` — root layout 에러
- `app/not-found.tsx` — 404

---

## 7. 환경변수

**`process.env` 직접 접근 금지.** 반드시 `config.ts`를 통해 접근.

```ts
// ❌ 금지
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

// ✅ 올바름
import { config } from '@/07-shared/config/config';
const url = config.supabase.url;
```

---

## 8. 컴포넌트 규칙

- 상태/이벤트/브라우저 API 사용 → `'use client'` 선언 필수
- SSR 안전: `typeof window !== 'undefined'` 체크
- 테스트 파일은 컴포넌트와 같은 폴더에 배치 (`auth-modal.test.tsx`)

---

## 9. 절대경로 (Path Alias)

| Alias | 경로 |
|-------|------|
| `@/*` | `./src/*` |
| `@app/*` | `./src/app/*` |
| `@04-widgets/*` | `./src/04-widgets/*` |
| `@05-features/*` | `./src/05-features/*` |
| `@06-entities/*` | `./src/06-entities/*` |
| `@07-shared/*` | `./src/07-shared/*` |

---

## 10. 커밋 전 체크리스트

```bash
npm run format       # Prettier 포맷
npm run lint         # ESLint 검사
npm run build        # 빌드 통과 확인
```

**세 단계 모두 통과해야 커밋 가능합니다.**

---

## 11. 커밋 메시지

Gitmoji + 태그 방식:

```
✨feat: URL 입력 컴포넌트 추가
🐛fix: API 응답 파싱 오류 수정
♻️refactor: 에러 처리 로직 개선
```
