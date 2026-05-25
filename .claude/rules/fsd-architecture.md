# FSD 아키텍처 규칙

## Import 방향 (최우선)
```
app → 03-pages → 04-widgets → 05-features → 06-entities → 07-shared
←←←←←←←←←←← import 허용 방향 ←←←←←←←←←←←
```
- 높은 번호에서만 낮은 번호로 import 가능
- `07-shared`에서 `05-features` import — 절대 금지

## Barrel Export
- 각 슬라이스는 `index.ts`로 외부 API 노출
- 슬라이스 외부에서 내부 경로 직접 접근 비권장

```ts
// ✅ barrel을 통해 import
import { AuthModal, useAuth } from '@/05-features/auth';

// ❌ 내부 경로 직접 접근
import { AuthModal } from '@/05-features/auth/ui/auth-modal';
```

## 슬라이스 내부 구조
```
05-features/{기능}/
├── index.ts      ← barrel export
├── model/        ← 비즈니스 로직, 커스텀 훅
└── ui/           ← UI 컴포넌트
```

## Path Alias
- `@/*` → `./src/*`
- `@04-widgets/*` ~ `@07-shared/*` 사용
- 상대 경로 `../../` 비권장

## 07-shared Import 경로 표

| 모듈 | 경로 |
|------|------|
| `AppError` | `@/07-shared/errors` |
| `apiClient` | `@/07-shared/api` |
| Supabase (browser) | `@/07-shared/api/supabase/client` |
| Supabase (server) | `@/07-shared/api/supabase/server` |
| `config` | `@/07-shared/config/config` |

- `process.env` 직접 접근 금지 → `config`를 통해서만
