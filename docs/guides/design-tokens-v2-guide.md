# 디자인 토큰 v2 마이그레이션 가이드 (Phase 22)

> **대상**: TruthScope FE 작업자 (안세환 owner — Wave 2-3, PM 권석 — Wave 1 + review)
> **상위 결정**: 5/1 회의 D-0501-7 옵션 A `brand-*` 통일
> **연관 PR**: `feat/d6-token-v2-base` (Wave 1, base: dev) → 본 가이드의 신규 토큰 추가
> **작성일**: 2026-05-04

---

## 1. 왜 마이그레이션하는가

기존 `bg-primary` / `text-on-surface` / `surface-container-*` / `outline-variant` 같은 **Material Design 3 (M3) 클래스**가 `src/03-pages/` 9 파일에 156 occurrence 잔재. M3 토큰은 TruthScope `tokens.css`에 정의되지 않아 **렌더링 시 깨진 스타일** 또는 **Tailwind 무인식**으로 떨어진다.

5/1 회의에서 **TruthScope 자체 `brand-*` 토큰 통일** 결정 (D-0501-7). M3는 폐기.

## 2. 신규 토큰 (Wave 1, tokens.css)

| 토큰 | 값 | 의미 |
|---|---|---|
| `--color-bg-surface-base` | white | 가장 기본 배경 (= bg-base) |
| `--color-bg-surface-sunken` | gray-100 (#f3f4f6) | 한 단계 가라앉은 배경 |
| `--color-bg-surface-raised` | blue-50 (#f0f7ff) | 기본 surface (= 기존 bg-surface) |
| `--color-bg-surface-elevated` | blue-100 (#d2e6ff) | 한 단계 강조된 배경 |
| `--color-bg-surface-floating` | blue-200 (#b8d4f5) | 가장 떠 보이는 배경 |
| `--color-border-subtle` | gray-200 (#e5e7eb) | 약한 경계 (outline-variant 대체) |
| `--color-error-subtle` | red-50 (#fef2f2) | error 연한 배경 |
| `--color-text-on-error` | white | error 위 흰 글자 |

primitive 신규: `--color-blue-200` / `--color-gray-200` / `--color-gray-100` / `--color-red-50`.

## 3. Tailwind v4 약식 클래스 (`@theme inline` alias 등록 완료)

Wave 1 PR이 머지되면 다음 약식 클래스가 동작한다:

```tsx
<div className="bg-brand-primary text-on-brand">
  TruthScope
</div>

<div className="bg-surface-elevated border-border-subtle">
  카드
</div>
```

`bg-[var(--color-brand-primary)]` 같은 arbitrary value도 동작하지만, **약식 클래스를 primary로 권장**한다.

## 4. M3 → v2 매핑표 (Wave 2/3 마이그레이션 시 직접 참조)

### 4.1 base scale (primary / secondary / on-* / error)

| M3 클래스 | TruthScope v2 |
|---|---|
| `bg-primary` / `hover:bg-primary` | `bg-brand-primary` / `hover:bg-brand-primary` |
| `text-primary` / `hover:text-primary` | `text-brand-primary` / `hover:text-brand-primary` |
| `border-primary` | `border-brand-primary` |
| `from-primary` / `from-primary/80` / `shadow-primary/20` | `from-brand-primary` / `from-brand-primary/80` / `shadow-brand-primary/20` |
| `text-on-primary` / `text-on-secondary` | `text-on-brand` |
| `bg-secondary` / `bg-secondary/10` | `bg-brand-secondary` / `bg-brand-secondary/10` |
| `border-secondary` / `border-secondary/30` | `border-brand-secondary` / `border-brand-secondary/30` |
| `text-secondary` / `decoration-secondary` | `text-brand-secondary` / `decoration-brand-secondary` |
| `focus:ring-secondary` / `focus-within:ring-secondary` | `focus:ring-brand-secondary` / `focus-within:ring-brand-secondary` |
| `from-secondary/5` / `shadow-secondary/10` | `from-brand-secondary/5` / `shadow-brand-secondary/10` |
| `group-hover:text-secondary` | `group-hover:text-brand-secondary` |

### 4.2 surface 5단계

| M3 | TruthScope v2 |
|---|---|
| `bg-surface-container-lowest` (+ `/60` opacity / `hover:`) | `bg-surface-base` |
| `bg-surface-container-low` (+ `hover:`) | `bg-surface-sunken` |
| `bg-surface-container` / `bg-surface-variant` (+ `hover:`) | `bg-surface-raised` |
| `text-surface-container` / `border-surface-container` | `text-surface-raised` / `border-surface-raised` |
| `bg-surface-container-high` (+ `hover:`) | `bg-surface-elevated` |
| `bg-surface-container-highest` (+ `/50` opacity) | `bg-surface-floating` |
| `border-surface-container-highest` / `text-surface-container-highest` | `border-surface-floating` / `text-surface-floating` |
| `text-on-surface` | `text-text-primary` |
| `text-on-surface-variant` | `text-text-secondary` |

### 4.3 outline-variant → border-subtle

| M3 | TruthScope v2 |
|---|---|
| `bg-outline-variant` (드물게 — divider 용도, PM 협의) | `bg-border-subtle` |
| `border-outline-variant` (+ `/10` `/15` `/20` `/30` opacity) | `border-border-subtle` (동일 opacity 보존) |
| `text-outline-variant` | `text-text-secondary` |
| `placeholder:text-outline-variant` | `placeholder:text-text-secondary` |

### 4.4 container (primary / secondary / error)

| M3 | TruthScope v2 |
|---|---|
| `bg-primary-container` / `hover:bg-primary-container` | `bg-brand-subtle` / `hover:bg-brand-subtle` |
| `border-primary-container/20` / `from-primary-container/90` | `border-brand-subtle/20` / `from-brand-subtle/90` |
| `text-on-primary-container` | `text-brand-primary` |
| `bg-secondary-container` (+ `/20` `/30` opacity / `hover:`) | `bg-brand-subtle` (동일 opacity 보존) |
| `border-secondary-container` | `border-brand-subtle` |
| `text-on-secondary-container` / `group-hover:text-secondary-container` | `text-brand-secondary` / `group-hover:text-brand-secondary` |
| `bg-secondary-fixed` | `bg-brand-subtle` |
| `bg-error-container/30` | `bg-error-subtle/30` |
| `text-on-error-container` (+ `/80` opacity) | `text-error` (+ opacity) |

### 4.5 error base + typography

| M3 | TruthScope v2 |
|---|---|
| `bg-error` / `bg-error/10` / `text-error` | (변경 없음, 유지) |
| `text-on-error` | (신규 토큰, 그대로 사용 가능) |
| `text-body-md` / `text-body-sm` / `text-label-md` / `text-label-sm` | (Wave 1 후 자동 인식, 변경 없음) |

## 5. Wave 2/3 작업자 (안세환) 핵심 의무

### 5.1 hover/focus 매핑 의무 — 누락 0건

`hover:*` / `focus:*` / `focus-within:*` / `group-hover:*` / `placeholder:*` 변형은 **반드시 매핑**한다 (Apple Iteration Guide #4 "Never document hover"는 docs 작성 룰일 뿐 production CSS의 :hover 부재가 아님). 누락 1건이라도 PR review reject.

### 5.2 컨테이너 컴포넌트 전경/배경 pair 보존

`bg-primary text-on-primary hover:bg-primary-container` 같은 패턴은 hover 시 색 조합이 바뀌어도 글자 가독성을 유지해야 한다. 매핑 후 dev 서버에서 직접 확인.

### 5.3 색 외 신호 보존 (WCAG §1.4.1 + 색맹 안전)

분석 결과 / 상태 / 판정 등을 **색만으로 구분 X**. pill 모양 / padding / 아이콘 / 텍스트 라벨을 함께 사용해야 한다.
- 빨강-초록 색맹 남성 ~8% (NIH) — 액션 컬러를 빨강/초록 단독 사용 시 접근성 위반.
- 출처: W3C WCAG 2.2 §1.4.1 Use of Color (Level A) / Apple HIG Accessibility / MS Inclusive Design Toolkit.

### 5.4 rounded-full 정리

카드(`p-6`/`p-8` 큰 컨테이너)는 `rounded-xl` 또는 `rounded-2xl`. `rounded-full`은 chip / badge / icon-container만. 디자인 의도 보존 시 PR 코멘트 협의.

### 5.5 검증 (커밋 전 필수, 순서)

```bash
npm run format
npm run typecheck
npm run lint
npm run lint:fix
npm run stylelint
npm run stylelint:fix
npm run build
```

이후 `npm run dev`로 실제 페이지 4개(history / about / analysis-detail / analysis-form) + 홈 5섹션 시각 확인.

## 6. PR review explicit gate (PM)

PM(권석)이 PR review owner. 다음 3 gate 모두 explicit comment로 통과 표시:

| Gate | 검증 |
|---|---|
| G1. 매핑 정합 | §4 매핑표 1:1 적용 — hover/focus pair 누락 없음 (1건이라도 reject) |
| G2. 시각 회귀 + 접근성 보편 신호 | dev 서버 + Playwright snapshot diff. 색 외 신호(pill 모양 / padding / 아이콘 / 텍스트) 보존 확인 |
| G3. grep 0건 | M3 토큰 정확 grep 0건 |

## 7. 접근성 표준 출처

이 마이그레이션의 색·타이포 결정은 **세계 디자인 표준** 기반:

- **W3C WCAG 2.2** — `https://www.w3.org/TR/WCAG22/`
  - §1.4.1 Use of Color (Level A) — 색만으로 정보 전달 금지
  - §1.4.3 Contrast Minimum (AA) — 텍스트 4.5:1 / 큰 텍스트 3:1
  - §1.4.11 Non-text Contrast (AA) — UI 컴포넌트 경계 3:1
  - §2.1.1 / §2.4.7 / §2.5.8 — 키보드 단독 / focus 가시 / target size
- **Apple HIG Accessibility** — `https://developer.apple.com/design/human-interface-guidelines/accessibility`
- **Microsoft Inclusive Design Toolkit** — `https://www.microsoft.com/design/inclusive/` (Persona Spectrum: 영구·일시·상황적 장애 보편 디자인)
- **Google Material Design 3 — Accessible design / Color contrast**
- **KWCAG 2.2** (한국형 웹 콘텐츠 접근성 지침, NIA, 「지능정보화 기본법」 근거 — 공공기관 의무 적용)

## 8. 별도 Phase 후보 (본 phase 외)

| 후보 | trigger | rationale |
|---|---|---|
| Phase 24 | Phase 22 머지 후 주요 화면 안정화 ≥ 1주 | TruthScope 디자인 정량 채점 (UI/UX Rubric v0.6 Pre-launch utility mode) |
| Phase 25 | typography 변경 요구 발생 시 | 폰트 weight ladder 정책 (no 500 검토 등) |
| Phase 26 | Phase 22+24 완료 후 디자인 차별화 요청 | Stripe / Vercel 일반 원칙 부분 채용 (토큰값 카피 X) |

## 9. 문의

- 매핑 권고와 시각 의도가 충돌하면 PR 코멘트로 PM 협의 (안세환 의도 우선).
- 회의: 매주 화요일 19:00.
