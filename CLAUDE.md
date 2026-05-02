# TruthScope Frontend — 코딩 규칙

> 상세 가이드: `CONVENTIONS.md` 참조 (팀원 온보딩용, **Claude는 수정 금지**)
> 커밋 메시지: Gitmoji 사용 (팀 규칙)

---

## 📌 문서 역할 분리 (반드시 준수)

| 파일 | 읽는 주체 | 수정 권한 |
|------|-----------|----------|
| `CLAUDE.md` | Claude (코드 작성자, 자동 로드) | Claude 가능 |
| `.claude/rules/*.md` | Claude (코드 작성자, auto-load) | Claude 가능 |
| `.claude/agents/code-reviewer.md` | 리뷰 에이전트 (시스템 프롬프트) | Claude 가능 |
| `.coderabbit.yaml` | CodeRabbit (PR 자동 리뷰) | Claude 가능 |
| **`CONVENTIONS.md`** | **팀원 (사람, 온보딩/학습용)** | **❌ Claude 수정 금지** |

### `CONVENTIONS.md`를 Claude가 수정하면 안 되는 이유

1. **팀원이 읽는 유일한 문서** — 팀원은 `.claude/`를 보지 않음. CONVENTIONS.md가 팀의 "공식 교과서" 역할
2. **자동 리더 없음** — Claude/CodeRabbit 누구도 자동으로 읽지 않음 → 수정해도 규칙 집행에 영향 없음
3. **회의 결정의 기록물** — 팀 회의에서 합의된 내용만 들어가야 함. Claude가 임의로 바꾸면 "합의 없이 바뀐 규칙"이 됨
4. **드리프트 방지** — 규칙이 자주 바뀌는 곳은 `.claude/rules/`. CONVENTIONS.md가 같이 흔들리면 팀원 혼란
5. **Git blame 신뢰성** — CONVENTIONS.md 변경 히스토리는 "팀 결정 로그"여야 함. Claude 커밋이 섞이면 의사결정 추적이 망가짐

### 규칙이 바뀔 때의 올바른 순서

```text
1. .claude/rules/*.md 수정 (즉시 반영)
2. .claude/agents/code-reviewer.md 수정 (리뷰 기준 동기화)
3. .coderabbit.yaml 수정 (PR 리뷰 동기화)
4. CLAUDE.md 수정 (Claude가 기억하는 요약)
5. 팀 회의에서 공유 → 합의 후 CONVENTIONS.md 수정 (사람이 직접)
```

**Claude는 1~4까지만 담당.** 5번은 사용자가 직접 수행. 사용자가 명시적으로 "CONVENTIONS.md 수정해줘"라고 요청해도, 회의 결정 근거를 먼저 확인할 것.

---

## 기술 스택
- Next.js 15 (App Router)
- TypeScript
- Feature-Sliced Design (FSD) 커스텀 번호 체계
- Supabase (PostgreSQL + Auth)

## FSD 아키텍처 (최우선)

### Import 방향 규칙
```
app → 03-pages → 04-widgets → 05-features → 06-entities → 07-shared
←←←←←←←←←←← import 허용 방향 ←←←←←←←←←←←
```
- 높은 번호에서만 낮은 번호로 import 가능
- `07-shared`에서 `05-features` import — 절대 금지

### Barrel Export (index.ts)
- 각 슬라이스는 `index.ts`로 외부 API 노출
- 슬라이스 외부에서 내부 경로 직접 접근 비권장

### 슬라이스 내부 구조
```
05-features/auth/
├── index.ts      ← barrel export
├── model/        ← 비즈니스 로직, 커스텀 훅
└── ui/           ← UI 컴포넌트
```

## 파일/폴더 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 폴더 | kebab-case | `auth-modal/` |
| 파일 | kebab-case | `auth-modal.tsx`, `use-auth.ts` |
| 컴포넌트 | PascalCase | `AuthModal` |
| 변수/함수 | camelCase | `getSupabaseBrowserClient` |
| 타입 | PascalCase | `Article`, `AnalysisSession` |

## Path Alias

| Alias | 경로 |
|-------|------|
| `@/*` | `./src/*` |
| `@04-widgets/*` | `./src/04-widgets/*` |
| `@05-features/*` | `./src/05-features/*` |
| `@06-entities/*` | `./src/06-entities/*` |
| `@07-shared/*` | `./src/07-shared/*` |

## 디자인 토큰

- 하드코딩 금지 — `var(--color-*)`, `var(--spacing-*)` 사용
- 허용 spacing: `6 | 8 | 10 | 16 | 20 | 24 | 32 | 48` (px)
- `Recipekorea` — Display, Heading LG 전용. 본문 금지
- `Pretendard` — 그 외 모든 텍스트

## API 호출

- Spring Boot API: `apiClient` (`@/07-shared/api`)
- Supabase Client: `getSupabaseBrowserClient` (`@/07-shared/api/supabase/client`)
- Supabase Server: `getSupabaseServerClient` (`@/07-shared/api/supabase/server`)
- 환경변수: `process.env` 직접 접근 금지 → `config` (`@/07-shared/config/config`)

## TypeScript

- `any` 타입 사용 금지 — `unknown` 또는 명시적 타입
- Props는 `interface` 또는 `type`으로 명시

## Next.js App Router

- 상태/이벤트/브라우저 API 사용 시 `'use client'` 최상단 선언 필수
- Server Component에서 `getSupabaseBrowserClient` 사용 금지

## 에러 처리

- `AppError` 사용 (`@/07-shared/errors`) — 직접 `new Error()` 금지
- 에러 UI는 Next.js 자동 처리: `error.tsx`, `not-found.tsx`
