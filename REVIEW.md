# TruthScope Frontend — PR 리뷰 규칙

> Claude AI 리뷰어 전용. 한국어로 리뷰한다.
> 포맷/FSD 의존성/타입 에러/디자인 토큰은 CI(Prettier + ESLint + tsc + Stylelint)가 자동 차단하므로 여기서 다루지 않는다.
> Claude는 CI가 잡지 못하는 **비즈니스 로직, 성능, UX**에 집중한다.

## Always check

### 비즈니스 로직 결함
- 상태 관리 로직의 경쟁 조건 (race condition)
- useEffect 의존성 배열 누락으로 인한 무한 루프 가능성
- 조건부 렌더링의 논리적 오류

### 성능
- 불필요한 리렌더링 유발 패턴 (객체/배열 리터럴을 prop으로 전달)
- 대규모 리스트에서 key 누락 또는 인덱스 key 사용
- Server Component로 충분한데 Client Component로 작성한 경우

### 보안
- dangerouslySetInnerHTML 사용 여부
- 사용자 입력이 검증 없이 URL이나 쿼리에 전달되는지
- API 키가 클라이언트 코드에 노출되었는지

### UX
- 로딩/에러 상태 처리 누락
- 접근성(a11y) — 시맨틱 태그, alt 속성, 키보드 네비게이션

## Style

- Server Component 우선 설계 (상태 없으면 'use client' 불필요)
- apiFetch 래퍼 사용 권장
- barrel export(index.ts)를 통한 슬라이스 간 import 권장

## Skip — CI가 자동으로 검증하는 항목

- 코드 포맷 (Prettier가 검증)
- FSD 레이어 의존성 위반 (eslint-plugin-fsd-lint가 차단)
- 슬라이스 간 상대 경로 사용 (fsd/no-relative-imports가 차단)
- Public API 우회 접근 (fsd/no-public-api-sidestep이 차단)
- TypeScript 타입 에러 (tsc --noEmit이 차단)
- 하드코딩 색상/spacing (Stylelint가 차단)
- any 타입 사용 (strict 모드가 차단)
- import 순서 (ESLint가 검증)
