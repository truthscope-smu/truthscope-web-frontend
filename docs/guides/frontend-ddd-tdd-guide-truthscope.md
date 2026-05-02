# TruthScope Frontend DDD/TDD Guide

> 본 가이드는 Phase 21 (Article aggregate adoption) 산출물을 reference로 한 패턴 가이드. ADR-006 박제 정합.

## 4-step pattern (Form → Domain → Boundary → Persistence)

1. **Form input shape** — zod safeParse (예: `ExtractArticleRequestSchema`)
2. **Client domain invariant** — `Article.extract()` throws `InvariantViolationError`
3. **External boundary** — `apiClient` + `AppError` (PR#9 6 rule 자산)
4. **Persistence** — Provider snapshot 교체 + optimistic update + rollback

## RSC/CSC boundary

- **pages**: 현 Phase 21에서는 **CSC** (BE `ArticleController` 부재로 server fetch 불가).
  Phase 22+ `findArticleById` endpoint 도입 후 RSC + `force-dynamic` 격상 예정.
- **widgets**: CSC (`'use client'` + `Article.rehydrate(snapshot)` `useMemo`)
- **features**: CSC (form/button + invariant pre-check)
- **entities/model**: pure (no React)
- **entities/api**: pure (apiClient — 직접 import `@/07-shared/api/base`, barrel 우회)

## DTO ↔ class boundary 시연 위치

Phase 21은 boundary 시연을 **2 widget만** (`ArticleCard`, 그리고 W-1b 후 추가될 `AttachToSessionButton`).
`useMemo(() => Article.rehydrate(snapshot), [snapshot])` 패턴.
features/use-\*는 Provider snapshot을 직접 사용. 학습 burden 분산 회피.

## How to add a new entity in 30 minutes (P8)

> Article 패턴을 reference로, 새 entity (예: `claim`) 추가 step-by-step.

### Step 1 (5분): folder 생성

```bash
mkdir -p src/06-entities/claim/{model,api,__tests__}
```

생성할 파일:

- `src/06-entities/claim/model/{claim,snapshot,errors,index}.ts`
- `src/06-entities/claim/api/{backend,dto,mappers,index}.ts`
- `src/06-entities/claim/index.ts`
- `src/06-entities/claim/__tests__/claim.test.ts`

### Step 2 (10분): model class

- `claim.ts`: `export class Claim` (named export only) + `private constructor` + `static extract(...)` + `static rehydrate(snapshot)` + invariant methods
- `snapshot.ts`: `export interface ClaimSnapshot { ... }` (plain object, mutation 함정 회피)
- `errors.ts`: `InvariantViolationError` / `IllegalStateError` 상속 (Article 패턴 정합)
- `model/index.ts` (client-safe barrel): class + types + errors export

### Step 3 (5분): api adapters

- `dto.ts`: `ClaimBackendDto` + (필요 시 `SupabaseClaimRow`)
- `mappers.ts`: `fromBackendDto(dto): Claim` (+ `fromSupabaseRow(row): Claim` if Supabase source)
- `backend.ts`: intent-based functions (`requestClaimAnalysis(...)` 등). **`apiClient`는 `@/07-shared/api/base` 직접 import** (barrel 우회 — server.ts client bundle 폴루션 회피).
- (선택) `supabase.ts`: `SupabaseClient` 인자 주입 (Phase 22+ 확장 시)

### Step 4 (3분): barrel

- `06-entities/claim/api/index.ts` (server-capable surface)
- `06-entities/claim/index.ts` (외부 진입점 — model + api re-export)
- `06-entities/index.ts` 갱신 (`export * from './claim'`)

### Step 5 (5분): test

- `__tests__/claim.test.ts`: 5+ case
  - extract URL/value invariant (positive + negative)
  - state transition (예: `attachTo`/`approve`/`publish` 등 도메인별 전이)
  - rehydrate invariant (snapshot → class)
  - mapper happy path + 비정상 status 거부
  - toSnapshot round-trip

### Step 6 (2분): verify

```bash
npm run typecheck
npm run arch          # dep-cruiser 0 violations 확인
npm run lint
npm run test:unit     # claim.test.ts ≥ 5 PASS
```

## Phase 22+ 자산 재사용 표 (Q11 LOCK)

| 자산                                | 위치                                       | Phase 22+ 재사용                                   |
| ----------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| `test/msw/handlers.ts`              | 단일 source                                | Storybook addon-msw로 import → BE 응답 주입        |
| `Article.rehydrate`                 | `06-entities/article/model/article.ts`     | Story decorator에서 snapshot → class 변환          |
| `app/providers/article.context.tsx` | provider                                   | Story decorator에서 ArticleProvider mount          |
| `04-widgets/article-card`           | widget                                     | Default + Attached + ErrorState 3 stories         |
| `05-features/extract-article`       | feature                                    | Default + InvariantError + ApiError 3 stories     |
| 디자인 토큰 (`var(--color-*)`)       | tokens.css                                 | Story preview body inject                          |

## Classicist test pattern (no-mocking domain)

- **domain layer**: 직접 인스턴스화 + 상태 기반 단언 (no mocking) — Article aggregate가 reference
- **feature layer**: msw boundary mock + `onUnhandledRequest: 'error'` 정책 (handlers.ts 단일 source)
- **widget layer**: RTL + browser-mode (Playwright Chromium) — 파일 단위 격리

## RSC/CSC import 규칙

| 위치                                         | 허용 import 패턴                                                    |
| -------------------------------------------- | ------------------------------------------------------------------- |
| RSC (`app/page.tsx`, `force-dynamic` page)   | server-capable barrel (Phase 22+ `findArticleById` 도입 후)         |
| CSC (`app/providers/`, `widgets/`, `features/`) | `Article` / `requestArticleExtraction` 등 client-safe barrel 사용 |

> **Phase 21 한계**: BE `ArticleController` 부재로 `app/analysis/[id]/page.tsx`는 CSC.
> Provider state는 navigation flow에서만 채워짐 — direct URL access (bookmark/refresh) 시 빈 화면.
> Phase 22+ `findArticleById` 도입 후 RSC + force-dynamic 격상 패턴:
>
> ```tsx
> // Phase 22+ pattern
> import { findArticleById } from '@/06-entities/article';
> export const dynamic = 'force-dynamic';
> export default async function Page({ params }: { params: Promise<{ id: string }> }) {
>   const article = await findArticleById((await params).id);
>   return <ArticleCard snapshot={article.toSnapshot()} />;
> }
> ```

## When NOT to use DDD aggregate

ADR-006 §"When NOT to use" 참조. 요약:

- **CRUD-only entity** (단순 read/write, lifecycle 상태 전이 없음): anemic model + zod validation만 충분
- **invariant이 1개 미만**: Single field 검증은 zod schema에 inline. Aggregate 불필요
- **lifecycle 상태 전이가 zod로 표현 가능**: 단순 enum union 1단계 전이는 zod discriminated union으로 충분

Aggregate 적용 기준 (2개 이상 충족):

- invariant이 2개 이상
- lifecycle 상태 전이가 method 캡슐화 필요
- 외부 source 다수 (Spring BE + Supabase = 2 source rehydration 필요)

## TruthScope FSD 번호 체계 (참조)

- `app/` — Next.js App Router routing + providers
- `03-pages/` — 페이지 컴포넌트 (RSC 또는 CSC)
- `04-widgets/` — 레이아웃 위젯 (Navbar/Footer/ArticleCard 등)
- `05-features/` — 기능 단위 (auth/analysis/extract-article 등)
- `06-entities/` — 도메인 엔티티 (Article aggregate 등)
- `07-shared/` — 기반 (api/errors/config/types/styles/lib)

import 방향: `app → 03-pages → 04-widgets → 05-features → 06-entities → 07-shared` (역방향 금지).

## 14a Revision adoption signal (Phase 21 — 2026-11-01 평가)

archetype-ddd-pilot의 첫 production-like adoption signal로 작용. 옵시디언 history에 6항목 정량 박제 의무 (verify 통과 후).

## Tooling 체크리스트 (TruthScope-specific)

- `apiClient` import는 `@/07-shared/api/base` 직접 (barrel 우회 — server.ts client bundle 폴루션 회피)
- intra-slice import는 절대경로 (`@06-entities/article/model/snapshot` 형태) — barrel 파일(`index.ts`)만 `./` 상대 export 허용
- `__tests__/**/*.test.{ts,tsx}` + `*.test.{ts,tsx}` 파일은 fsd/no-relative-imports + fsd/no-public-api-sidestep 비활성 (eslint override)
- `src/app/**` 은 fsd/no-cross-slice-dependency 비활성 (App Router 라우팅 폴더)
- 디자인 토큰: `var(--spacing-{6,8,10,16,20,24,32,48})` + `var(--color-*)` 의무. 하드코딩 금지
- 파일명 kebab-case + symbol PascalCase (`article.ts` ↔ `class Article`) — `scripts/check-file-names.mjs` 강제

## 주요 reference

- ADR-006: `docs/architecture/decisions/ADR-006-frontend-ddd-tdd-application.md`
- RATIONALE: `RATIONALE.md`
- archetype-ddd-pilot: `llm-setup-templates/typescript-template` PR #21 (`747cea82`)
- BE Article aggregate 정합: `truthscope-smu/truthscope-web-backend` PR #27 (`73b5e43c`)
