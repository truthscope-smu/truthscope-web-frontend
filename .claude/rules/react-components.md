# React 컴포넌트 규칙

## Next.js App Router
- 상태/이벤트/브라우저 API 사용 시 `'use client'` 최상단 선언 필수
- Server Component에서 `getSupabaseBrowserClient` 사용 금지

## TypeScript
- `any` 타입 사용 금지 — `unknown` 또는 명시적 타입
- Props는 `interface` 또는 `type`으로 명시

## 네이밍
- 폴더/파일: `kebab-case` (`auth-modal.tsx`, `use-auth.ts`)
- 컴포넌트: `PascalCase` (`AuthModal`)
- 변수/함수: `camelCase` (`getSupabaseBrowserClient`)
- 타입/인터페이스: `PascalCase` (`Article`)

## 에러 처리
- `AppError` 사용 (`@/07-shared/errors`) — 직접 `new Error()` 금지
- 에러 UI: `error.tsx`, `not-found.tsx` (Next.js 자동 처리)

## 포맷
- `npm run format` (Prettier) + `npm run lint` (ESLint)
- 빌드 전 반드시 적용
