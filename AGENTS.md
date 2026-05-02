# AGENTS.md — TruthScope Frontend

> 모든 AI 도구 (Codex CLI / GitHub Copilot / Cursor / Claude Code 등) 공통 instruction.
> 사람이 보는 상세 절차서는 `docs/guides/` 참조.
> Claude Code 세부 규칙은 `CLAUDE.md` 보존 (본 파일과 정합 유지).

---

## 1. 절대 금지 (모든 PR에 강제)

| 금지 | 이유 |
|---|---|
| `any` 타입 | TypeScript strict — `unknown` 또는 명시적 타입만 |
| `process.env` 직접 접근 | `config` (`@/07-shared/config/config`) 통해서만 |
| `fetch()` 직접 호출 | `apiClient` (`@/07-shared/api`) 래퍼 의무 |
| 하드코딩된 색상/spacing | `var(--color-*)`, `var(--spacing-*)` 토큰 사용 |
| 임의 spacing 값 (12px / 15px 등) | `6 / 8 / 10 / 16 / 20 / 24 / 32 / 48` (px)만 허용 |
| `Recipekorea` 본문 사용 | Display + Heading LG 전용 |
| 07-shared → 05-features import | FSD 역방향 import 금지 |
| `app/providers/*provider.tsx` 직접 import (consumer) | mount-block 차단 — useArticle 같은 hook만 import |
| `--no-verify` git push | hook 실패 시 원인 수정 의무 |

---

## 2. 핵심 패턴 (PR 작성 시 따라야 할 invariant)

### FSD 아키텍처

```
app → 03-pages → 04-widgets → 05-features → 06-entities → 07-shared
←←←←←←←←←←← import 허용 방향 ←←←←←←←←←←←
```

- 높은 번호 → 낮은 번호 import만 허용
- 각 슬라이스는 `index.ts` barrel export로 외부 API 노출
- 슬라이스 외부에서 내부 경로 직접 접근 비권장

### Path Alias

| Alias | 경로 |
|---|---|
| `@/*` | `./src/*` |
| `@04-widgets/*` ~ `@07-shared/*` | 각 레이어 |

### 파일 네이밍

- 폴더 / 파일: kebab-case (`auth-modal.tsx`, `use-auth.ts`)
- 컴포넌트: PascalCase (`AuthModal`)
- 변수 / 함수: camelCase
- 타입 / 인터페이스: PascalCase
- dot-role suffix 허용: `.widget`, `.component`, `.hook`, `.context` 등 (PLAN rev.7 정합)

### Next.js App Router

- 상태 / 이벤트 / 브라우저 API 사용 시 `'use client'` 최상단 의무
- Server Component에서 `getSupabaseBrowserClient` 사용 금지
- `apiClient`는 RSC + CSC 양쪽 사용 가능 (server-only code 폴루션 회피 의무 — barrel 직접 import X)

### DDD/TDD aggregate (Phase 21 학습 reference)

- 정적 팩토리 (`Article.fromAnalysisSession()`, `Article.fromBackendDto()`)로만 인스턴스 생성
- private constructor + 비즈니스 메서드 (`attachTo()`)로만 상태 전환
- invariant 위반은 `InvariantViolationError` / `IllegalStateError` throw
- snapshot ↔ class round-trip (`toSnapshot()` / `rehydrate()`) 패턴
- 상세: `src/06-entities/article/model/article.ts` (reference 코드)

### API 호출

- Spring BE: `apiClient.get / .post / .patch / .delete` (제네릭으로 응답/요청 타입 명시)
- Supabase Browser: `getSupabaseBrowserClient` (`@/07-shared/api/supabase/client`)
- Supabase Server: `getSupabaseServerClient` (`@/07-shared/api/supabase/server`) — Server Component 전용
- 네트워크 실패 + 4xx/5xx는 자동 `AppError` 변환

### 디자인 토큰 (Tier 2 disclaimer 정합)

- `Tier 2` UI에는 disclaimer 의무: "AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요."
- 임의 의역/축약 금지 (도메인 룰)
- 상세: `.claude/rules/domain-logic.md`

---

## 3. 테스트 명령어 (PR 전 필수)

```bash
npm run format               # 1. Prettier 자동 수정
npm run typecheck            # 2. TypeScript 타입 검증
npm run lint:fix             # 3. ESLint + FSD 레이어 위반 자동 수정
npm run stylelint:fix        # 4. 하드코딩 색상/spacing 자동 수정
npm run arch                 # 5. dep-cruiser FSD-DDD 룰
npm run check:names          # 6. kebab-case 파일명 검증
npm run check:cache          # 7. cacheComponents / force-dynamic 검증
npm run test:unit -- --run   # 8. 단위 테스트 (Vitest unit project)
npm run build                # 9. Next 16 build
```

또는 한 번에: `npm run check:ci`

상세: `docs/guides/frontend-testing-standard.md` (작성 예정)

---

## 4. 멤버별 진입 경로 (Sprint 2 Week 1)

| 멤버 | 시작 이슈 | 주 가이드 | 보조 가이드 |
|---|---|---|---|
| 안세환 | FE #19 (결과 카드 UI skeleton) | 본 AGENTS.md + `CLAUDE.md` | `.claude/rules/design.md` |
| 정세린 | FE #25 (Vitest CI hardening, FE #21 재정의) + 본인 FE 별도 PR (햄버거+Footer+placeholder 4 라우트) + BE #30 GDELT quota | `docs/guides/frontend-vitest-ci-hardening.md` (작성 예정) | `vitest.config.ts` + GitHub Actions 공식 문서 |
| 권석 (PM) | D6 토큰 v2 초안 (5/5 회의 안건) | 본 AGENTS.md + 일관성 검수 | — |

한지민님은 BE 영역 (BE #22 DataSourceAdapter) — FE 작업 없음.

---

## 5. PR 체크리스트 (모든 PR 본문에 복사)

- [ ] `npm run format` PASS (CRLF 주의 — format으로 수정된 파일 모두 staging 포함)
- [ ] `npm run typecheck` PASS (0 errors)
- [ ] `npm run lint` PASS (0 errors)
- [ ] `npm run stylelint` PASS (하드코딩 색상/spacing 0)
- [ ] `npm run arch` PASS (0 violations)
- [ ] `npm run check:names` PASS (kebab-case)
- [ ] `npm run check:cache` PASS
- [ ] `npm run test:unit -- --run` PASS (회귀 0)
- [ ] `npm run build` PASS (Next 16 build)
- [ ] PR 본문에 spec 이슈 번호 + 학습 가치 1줄 명시
- [ ] CodeRabbit 리뷰 통과 (Critical 0)

---

## 6. 커밋 메시지 (Gitmoji)

형식: `{이모지}{type}({scope}): {description}`

```
✨feat(features): attach-to-session A4 reframe (Phase 21 W3-3)
🐛fix(entities): apiClient barrel 우회 (server.ts 폴루션 회피)
♻️refactor(widgets): article-card actions slot 항상 노출
💄style(tokens): --color-error 신규 추가
📝docs(guides): frontend-vitest-ci-hardening.md 신규
🔧chore(deps): vitest 4.x 업그레이드
✅test(article): fromBackendDto 3 cases 추가
```

Co-authored-by 의무 (PM 본인): `Co-authored-by: gs07103 <gwonseok02@gmail.com>`

---

## 7. Phase 21 학습 자산 (Sprint 2 진입 의무 reference)

본 phase 머지 결과 작동 검증된 패턴:

| 패턴 | reference 코드 |
|---|---|
| DDD aggregate (정적 팩토리 + invariant) | `src/06-entities/article/model/article.ts` |
| Snapshot ↔ Class round-trip | `src/06-entities/article/model/snapshot.ts` + `article.ts:rehydrate()` |
| MSW real wiring (production parity) | `test/msw/handlers.ts` (3 endpoint) |
| AppError(409) → user-facing 한국어 안내 | `src/05-features/attach-to-session/ui/attach-to-session-button.component.tsx` |
| ArticleProvider context + useArticle hook | `src/app/providers/article.context.tsx` |
| Vitest 2-project (unit jsdom + browser chromium) | `vitest.config.ts` |
| dep-cruiser FE-DDD 룰 (R1-R5 + Q3) | `.dependency-cruiser.cjs` |

신규 컴포넌트/feature 작성 시 위 reference를 그대로 모방.
