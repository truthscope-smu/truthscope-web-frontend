---
status: Accepted
date: 2026-05-02
deciders: gs07103
related-adrs: []
related-prs:
  - llm-setup-templates/typescript-template#21 (archetype-ddd-pilot 정합 inheritance)
  - truthscope-smu/truthscope-web-backend#27 (BE Article aggregate 정합)
---

# ADR-006: Frontend DDD/TDD 적용 — Article aggregate + 2-project Vitest + dep-cruiser FE-DDD rules

## Status
Accepted (2026-05-02)

## Motivation (P7)

CheckMate 현 코드 (`05-features/analysis/api.ts` 16줄)는 `apiClient.post('/analysis-sessions', { url })` 단일 함수 + DTO 직접 사용 — anemic model 패턴.

**실제 problem 1건 명시**: 현 `analysis-form.tsx`는 URL 입력 검증을 하지 않아 `ftp://` 또는 일반 텍스트가 BE로 전달됨. BE가 400 응답을 반환할 때까지 user feedback 없음 (네트워크 라운드트립 1회 낭비 + UX 지연 ~200ms).

Article aggregate URL invariant (`Article.extract(url, ...)`이 invalid URL throw)은 client-side preflight로 작동 — 네트워크 호출 전 form-level 차단. 이는 DDD aggregate가 anemic model 대비 가져오는 첫 가시적 가치.

추가 동기:
- BE Article aggregate (`truthscope-smu/truthscope-web-backend#27`, `73b5e43c`) 1:1 매핑 가능 (lifecycle: `extract` → `attachTo`, URL invariant, Testcontainers ≥4)
- typescript-template archetype-ddd-pilot (PR #21 `747cea82`, 2026-05-02) 첫 production-like adoption signal — 14a Revision 평가 게이트 (2026-11-01) 충족 의무

## Decision

### Q2 파일명 룰 (kebab-case + named export only)

- 파일명: `06-entities/article/model/article.ts` (kebab-case)
- 클래스 export: `export class Article` (named export only — `export default` 금지)
- 사유: CheckMate FE CLAUDE.md `파일명 kebab-case` 룰 + Linux CI case-sensitivity 함정 회피
- 강제 도구: `scripts/check-file-names.mjs` (Wave 1 T1.4) + `unicorn/filename-case` 후속 검토 (P3)
- archetype-ddd-pilot의 `Order.ts` PascalCase 파일은 path-aware codemod로 변환 (`from './Article'` 같은 path token만, 클래스명 `Article`은 보존)

### Q3 api 어댑터 전략 (rev.4 reframe — 축소 단일 BE adapter, 의도적 archetype deviation)

- archetype `Axios + base.ts` 단일 vs CheckMate 두 데이터 소스(Spring BE `/api/v1/...` + Supabase Auth/reaction) 통합 불가
- **rev.4 reframe** (mini-DISCUSS addendum §12): Phase 21 BE 실측 결과 ArticleController 부재 → BE single endpoint (`POST /analysis-sessions`)만 wiring. Supabase adapter는 Phase 22+ deferred (Auth/RLS/Realtime scope).
- **Phase 21 채택 (4 파일)**: `06-entities/article/api/{backend.ts, dto.ts, mappers.ts, index.ts}`
- **Phase 22+ deferred (1 파일 + endpoints 추가)**: `supabase.ts` (`SupabaseClient` 인자 주입 + RSC 호환) + `findArticleById` + `requestAttachToSession` + `saveArticleReaction` + `findArticleByIdFromSupabase`
- archetype 정합 손실은 의도적 deviation으로 박제 — apiClient PR#9 6 rule 자산 보존 우선
- Public API: 의도 기반 함수 (`requestArticleExtraction(url)`만 Phase 21). Phase 22+ `findArticleById`, `requestAttachToSession`, `saveArticleReaction` 추가 시 동일 패턴 (Supabase query DSL 외부 노출 금지)
- Mapper 분리: `fromAnalysisSession(url, response): Article` (Phase 21). Phase 22+: `fromBackendDto(dto): Article` + `fromSupabaseRow(row): Article` (union mapper 회피)
- D 승격 가능성: 두 번째 도메인 추가 또는 source 교체 필요 시 `ArticleRepository` interface 도입 (Phase 22+)

### Q5 테스트 러너 (Vitest 4 + 2-project + RSC E2E 한정)

- archetype 단일 browser-mode → 2-project 분리: `unit` (node/jsdom) + `browser` (Chromium via Playwright)
- 사유: Codex Critical 2 (도메인 느림) + Critical 3 (RSC + Supabase server client = Vitest 미테스트)
- RSC + Supabase server client 통합은 **Playwright E2E 한정** — Phase 21 OUT
- W0 의존성: 12 packages (vitest@^4 + @vitest/browser + @vitest/browser-playwright + @vitejs/plugin-react + vite-tsconfig-paths + @testing-library/* 3 + playwright + msw + dependency-cruiser + zod)

### Q9 캐싱 전략 (좁힌 force-dynamic + cacheComponents 비활성)

- archetype 좁힌 적용 정합 (next.config.ts 빈 + 페이지별 directive)
- `app/page.tsx` (home), `app/about/page.tsx` — static (default)
- `app/history/page.tsx` — RSC + `force-dynamic` (Supabase Auth)
- **rev.2 R2-02 fix**: `app/analysis/[id]/page.tsx` — **CSC (Phase 21)** — Provider state consume. `findArticleById` 부재로 RSC fetch 불가. Phase 22+ findArticleById endpoint 도입 후 `RSC + force-dynamic` 격상.
- **rev.2 CX2-02 fix**: `app/analysis/layout.tsx` (parent segment) — `'use client'` (ArticleProvider mount). `[id]/layout.tsx`은 Phase 21에서 미사용 (sibling /analysis/new까지 cover하기 위해 parent segment로 격상).
- `next.config.ts`에 `cacheComponents` 없음 또는 `false`
- CI fail-safe: `scripts/check-cache-config.mjs` (cacheComponents + force-dynamic 동시 차단 — cross-user data leak 방지)
- client layout에 segment config 금지 — config는 server `page.tsx`에만
- Cache Components migration은 Phase 22+ ADR

### Q10 DTO ↔ class boundary (최소 D — extract + card + attach)

- 3 features: `extract-article` (form, C: URL invariant) + `article-card` (widget, B: rehydrate display) + `attach-to-session` (button, B: state transition)
- 3-layer validation:
  - Layer 1: zod `ExtractArticleRequestSchema.safeParse({ url })` — request body shape **만**
  - Layer 2: `Article.extract(url, ...)` — URL invariant throw `InvariantViolationError`
  - Layer 3: `requestArticleExtraction(url)` — apiClient + AppError (PR#9 자산)
- `Article.extract()` instance discard 룰 — client instance는 preflight artifact. Canonical Article은 server response → `Article.rehydrate(snapshot)`
- `fromBackendDto/fromSupabaseRow` (api mapper) ≠ `Article.rehydrate(snapshot)` (domain factory) — 명명 분리
- AttachButton optimistic + persistence 결과 snapshot 교체 — 도메인 메서드가 서버 성공 대체 금지
- events/VO deferred — Phase 22+ ADR 후속 candidates

## Why two adapters (not single Axios)?

- CheckMate는 두 데이터 소스: Spring BE (REST `/api/v1/...`) + Supabase (Auth + reaction storage)
- 단일 Axios로 통합 시 Supabase JS SDK + RLS + cookie 처리 손실 (PR#9 자산도 같이 폐기)
- archetype-ddd-pilot 정합은 의도적 deviation — Phase 22+ 단일 source archetype 적용 phase 등장 시 재검토

## Consequences

- 신규 12 packages devDependency 추가 (P1)
- `06-entities/article/` 5 파일(api) + 4 파일(model) + 5+ tests + 1 barrel 분리(client-safe vs server-capable)
- `scripts/check-file-names.mjs` + `scripts/check-cache-config.mjs` CI 통합 (Q2 + Q9)
- `eslint.config.mjs` fsd-lint 일부 룰 비활성화 가능 (P3 책임 분리표 결과 반영)
- `npm run check:ci`에 `arch` 추가 (P6)
- archetype-ddd-pilot 14a Revision 평가 게이트 (2026-11-01) adoption signal 6항목 박제 의무

## When NOT to use (P8)

DDD aggregate 도입은 모든 entity에 적용하지 않음:

- **CRUD-only entity** (단순 read/write, lifecycle 상태 전이 없음): anemic model + zod validation만 충분 (예: `tags`, `categories`, `audit-logs`)
- **invariant이 1개 미만**: Single field 검증은 zod schema에 inline. Aggregate 불필요
- **lifecycle 상태 전이가 zod로 표현 가능**: 단순 enum union 1단계 전이는 zod discriminated union으로 충분

Aggregate 적용 기준:
- invariant이 2개 이상 (Article = URL invariant + 1회 부착 invariant + currency consistency 등 다수)
- lifecycle 상태 전이가 method 캡슐화 필요 (Article.extract → attachTo → 재부착 거부)
- 외부 source 다수 (Spring BE + Supabase = 2 source rehydration 필요)

위 3 조건 중 2개 이상 충족 시 aggregate 채택 권장.

## dep-cruiser ↔ fsd-lint 책임 분리표 (P3 — Wave 0 실측)

| 룰 | dep-cruiser | fsd-lint 1.0.11 | 결정 |
|---|---|---|---|
| R1: model→api/ui 역참조 금지 | ✅ enforce (path-only) | ❌ layer만 잡음 | dep-cruiser 단독 |
| R2: 06→05/04/03/app 역방향 금지 | ✅ enforce | ✅ enforce (`forbidden-imports`) | **dep-cruiser 단독** (fsd-lint 비활성 — 중복 메시지 회피) |
| R3: 5→4 역방향 금지 (FSD 방향) | ✅ enforce | ✅ enforce | **dep-cruiser 단독** |
| R4: barrel 우회 직접 접근 | ✅ enforce (path-aware) | ⚠️ partial (`no-public-api-sidestep` 있으나 path 패턴 약함) | **dep-cruiser 우선** + fsd-lint `no-public-api-sidestep` 보조 |
| R5: app/providers만 provider mount | ✅ enforce | ❌ scope 외 | dep-cruiser 단독 |
| S1: app/providers 내부 05/06/07 import 허용 | ✅ exception | ❌ | dep-cruiser exception |
| S2: barrel 우회 차단 (slice 내부 model→api/ui 역참조 금지) | ✅ | ⚠️ | dep-cruiser 우선 |
| S3: tests / MSW handlers / setup 룰 제외 | ✅ exception (path glob) | ⚠️ 쉽지 않음 | dep-cruiser exception |
| S4: `@06-entities/*` + `@/06-entities/*` alias 매칭 | ✅ (alias config) | ✅ | 양쪽 enforce |
| S5: type-only import 런타임 분리 | ✅ (TS aware) | ❌ | dep-cruiser 단독 |
| Q3-룰: entity 내부 model→api 역참조 금지 | ✅ | ❌ | dep-cruiser 단독 |
| Q3-룰: api/* → 07-shared/api/config/errors 허용 | ✅ exception | — | dep-cruiser |
| Q3-룰: api/* → features/widgets/pages/app 금지 | ✅ | ⚠️ (forbidden-imports 일부) | **dep-cruiser 우선** |
| `no-relative-imports` (`../../`) | ❌ scope 외 | ✅ | **fsd-lint 단독** |
| `forbidden-imports` (slice cross) | ⚠️ 가능 | ✅ | fsd-lint 단독 (간결성) |

**결정 요약**: dep-cruiser primary boundary + fsd-lint `no-relative-imports` + `forbidden-imports`만. fsd-lint 중복 룰 (R2/R3 path-only) 비활성화.

## Future extensions (deferred)

- domain events 시스템 (article-extracted/article-attached) — 두 번째 도메인 이벤트 후보 등장 시
- URL VO / Money VO 등 Value Object — 같은 invariant 반복 사용 시점
- Repository abstraction (Q3 D 승격) — 두 번째 도메인 추가 또는 source 교체 필요 시

## Phase 22+ deferred (P4)

| 항목 | 사유 | 승격 트리거 |
|---|---|---|
| Supabase Auth flow integration test | login/logout/session refresh/cookie scope | 별도 phase, integration test infra 갖춘 시점 |
| Supabase RLS 통합 검증 | local Supabase docker 또는 staging project 필요 | 인프라 준비 후 |
| Supabase Realtime (subscription) | 현재 사용 안 함 | 사용 시점 |
| Cookie / SSR session 전파 | RSC + Playwright E2E 영역 | E2E phase |
| Cache Components (Next 16 'use cache') | rendering mental model 변경 | Next.js 16 stable + Phase 21 안정화 후 |
| Storybook + Code Connect | Phase 21 자산 재사용 순서 | Phase 21 머지 + W5 docs guide 작성 후 |
