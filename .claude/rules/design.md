# 디자인 토큰 규칙

## 하드코딩 금지
```css
/* ❌ 금지 */
color: #285c9f;
padding: 12px;

/* ✅ 올바름 */
color: var(--color-brand-secondary);
padding: var(--spacing-10);
```

## 허용 Spacing 값
`6 | 8 | 10 | 16 | 20 | 24 | 32 | 48` (px)
— 이 외 임의 값 사용 금지

## 폰트
- `Recipekorea` — Display, Heading LG 전용. 본문 사용 금지
- `Pretendard` — 그 외 모든 텍스트

## 색상 토큰 (주요)
- `--color-brand-primary` (blue-900) — 메인 브랜드
- `--color-brand-secondary` (blue-700) — 보조 브랜드
- `--color-accent-blue` (blue-400) — 포인트
- `--color-bg-surface` (blue-50) — 서피스 배경
- `--color-text-primary` (black) — 기본 텍스트

---

## 디자인 철학 보강 (Phase 22, 2026-05-04 Codex R2 반영)

### 1. Primary action / confidence signal 단일화 + 접근성 보편 근거

**규칙**:
- Primary action / confidence signal은 `brand-primary`를 기본값으로 한다.
- 두 번째 primary accent 도입 금지 — 회귀 방지 룰.
- 상태색(error / success / info)은 semantic token을 유지한다 (별도 신호 채널).

**채택 근거 — 미적 취향 아닌 3 기능적 사유**:
1. **WCAG 2.2 AA 대비 보장** (§1.4.3 Contrast Minimum) — `brand-primary` blue-900은 white/parchment surface 모두에서 텍스트 4.5:1 확보 가능. 단일 색이라 모든 surface 조합 검증이 단순화됨.
2. **색맹 안전** (§1.4.1 Use of Color, Level A) — 빨강-초록 색맹(남성 약 8%, NIH)도 파랑 계열은 식별 가능. 따라서 액션 컬러를 빨강/초록으로 쓰면 접근성 위반. 또한 색만으로 정보 전달 금지 조항을 만족시키려면 색 외 시각 신호(pill 모양 / padding / 아이콘 / 텍스트)를 함께 사용해야 함 — 안세환 PR 시 hover/focus 외 모양·크기·위치 신호도 반드시 보존 의무.
3. **단일 시그니파이어 = 인지 자원 절약 + 접근성 보편 장치** — 색이 1개면 사용자는 "파랑 = 클릭 가능" 규칙을 한 번만 학습. Norman 시그니파이어 + Nielsen #4 일관성의 핵심. 영구·일시·상황적 장애(MS Persona Spectrum) 모두에 동일한 인지 비용 적용.

→ 파랑은 "심리적 신뢰감의 색"이 아니라 **모든 사용자가 같은 규칙으로 클릭 가능 신호를 인지하게 하는 인지 자원 절약 장치이자 접근성 보편 장치**다.

**출처**:
- W3C WCAG 2.2 — https://www.w3.org/TR/WCAG22/ (§1.4.1 Use of Color / §1.4.3 Contrast Minimum / §1.4.11 Non-text Contrast)
- Apple HIG Accessibility — https://developer.apple.com/design/human-interface-guidelines/accessibility ("Avoid using color as the only way to convey information")
- Microsoft Inclusive Design Toolkit — https://www.microsoft.com/design/inclusive/ (Persona Spectrum: 영구/일시/상황적 장애 보편 디자인)
- Google Material Design 3 — Accessible design / Color contrast ("Color shouldn't be the only way to differentiate states")
- KWCAG 2.2 (한국형 웹 콘텐츠 접근성 지침, NIA, 「지능정보화 기본법」 근거 — 공공기관 의무) — Sprint 후반 공공 배포 고려 시 근거
- VoltAgent/awesome-design-md Apple DESIGN.md "Don't introduce a second accent color" (비공식 토큰 자료, 일반 원칙만 차용)

### 2. Shadow / elevation 정책
- `box-shadow` / `glow` 토큰 신규 도입은 다음 3 케이스 중 하나에 한정한다:
  (a) 데이터 강조 (분석 결과 카드의 핵심 수치)
  (b) Floating overlay (sticky bar / modal)
  (c) Focus affordance (키보드 접근성 보강)
- 위 외 사용 시 PR 코멘트로 근거 주석 의무 (`/* shadow rgba: design system semantic 미정의, Phase 23+ 토큰화 후보 */`).
- elevation은 shadow보다 surface/background pair + border로 해결 권고 (TruthScope = utility 정합).

### 3. 디자인 평가 모드 (UI/UX Rubric v0.6 매핑)
- **Default mode = Pre-launch utility app evaluation** — 100점 12원칙 + Critical Gate G1/G2/G3 적용.
- Content / report-heavy 화면(분석 결과 페이지 / 근거 인용 카드 / 정책 페이지)은 **추가로 Editorial-Content-Educational evidence-tag** (metaphor-borrowed / density-justified / constraint-disciplined / identity-expressed) 보조 적용.
- 4 evidence-tag는 점수 가산이 아닌 **evidence 평가 가이드**다. 12원칙 100점 산식은 불변.

**WCAG 2.2 AA 명시 매핑** (Critical Gate G3 = 원칙 11 < 5/10 OR 11.2 Operable Fail):
- §1.4.1 Use of Color (Level A) → 11.1 Perceivable + 7.1 Signifier 명확성 (색만으로 정보 전달 금지, non-color cue 의무)
- §1.4.3 Contrast Minimum (AA) → 11.1 Perceivable (텍스트 4.5:1 / 큰 텍스트 3:1)
- §1.4.11 Non-text Contrast (AA) → 11.1 Perceivable (UI 컴포넌트 경계 3:1)
- §2.1.1 Keyboard (A) + §2.4.7 Focus Visible (AA) + §2.5.8 Target Size Minimum (AA) → 11.2 Operable

→ **검증 의무 (Sprint 후반 출시 전)**: Phase 24 정량 채점에서 위 4 항목을 정량 측정 (대비 측정 도구 + 색맹 시뮬레이터 + 키보드 단독 운용 테스트).

- 출처: 옵시디언 vault `Guide/UI UX Design Quality Rubric.md` v0.6 (Codex 5R PASS, 2026-05-01 LOCK) + W3C WCAG 2.2

### 4. Hover / focus / group-hover / placeholder 매핑 의무 (Phase 22 한정)
- 기존 코드에 존재하는 `hover:*` / `focus:*` / `focus-within:*` / `group-hover:*` / `placeholder:*` 변형은 **반드시 매핑한다** (Phase 22 마이그레이션 시 누락 0건).
- 신규 hover token 추가는 컴포넌트 affordance 필요성이 명확할 때만 허용한다.
- 회귀 차단 우선 — Apple Iteration Guide #4 "Never document hover"는 design system docs 작성 룰이며, production CSS의 :hover 부재를 의미하지 않는다.

### 5. 적용 가능한 Apple 디자인 원리 (PARTIAL — 비공식 자료 인용)
TruthScope = utility/content 사이트, Apple = commerce. **일반 원칙만 차용하며 토큰값 / 폰트 metric / 수치 직접 복제 금지**.

| 원리 | 적용 단위 | 위험 |
|---|---|---|
| 단일 신호색 | brand-primary 통일 (이미 정합) | 상태색까지 통일 X |
| chrome 절제 | 카드/버튼 그림자 최소화 | photography-first는 X (TruthScope = data-dense) |
| 단일 product shadow | §2 shadow 정책 정합 | 모든 floating에 남발 X |
| surface 위계 (정보 차원) | 5단계 semantic surface (`base/sunken/raised/elevated/floating`) | dramatic dark alternation X |
| primary CTA 일관성 | 분석 시작 등 핵심 액션 | 분석 필터/툴바는 compact control |
