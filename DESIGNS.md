# CheckMate Web

## 웹앱 디자인 규칙 가이드

접근성 + Material Design 3 + CheckMate 토큰 통합 안내서

- 작성 주체: CheckMate 팀
- 작성일: 2026-04-10
- 대상: 안세환, 정세린

---

## 1. 접근성이 왜 필요한가

CheckMate는 뉴스 신뢰도를 분석하는 서비스입니다. 시각 장애인, 키보드만 사용하는 사람, 색각 이상자 등 다양한 사람이 사용할 수 있어야 합니다.

> KWCAG 2.2 (한국형 웹 접근성 지침): 4원칙 · 14지침 · 33항목 | 디지털포용법 제21조

아래는 CheckMate에 직접 적용해야 하는 항목만 추린 것입니다.

### KWCAG 2.2 — 4대 원칙

| 원칙 | 의미 | 핵심 예시 |
|---|---|---|
| 인식의 용이성 | 모든 정보를 인식할 수 있어야 함 | 이미지 대체 텍스트, 명도 대비 |
| 운용의 용이성 | 모든 기능을 조작할 수 있어야 함 | 키보드 접근, 포커스 표시 |
| 이해의 용이성 | 콘텐츠를 이해할 수 있어야 함 | 언어 명시, 오류 안내 |
| 견고성 | 기술 환경에 관계없이 동작해야 함 | 시맨틱 HTML, ARIA |

---

## 2. 접근성 필수 규칙 — 인식 + 운용

### 이미지 대체 텍스트

`KWCAG 5.1.1`

```jsx
// Bad: alt 없음
<img src="/logo.svg" />

// Good: 의미 있는 alt
<img src="/logo.svg" alt="CheckMate 로고" />

// Good: 장식용 — 빈 alt
<img src="/decorative-bg.png" alt="" />
```

### 명도 대비

`KWCAG 5.4.1`

- 일반 텍스트: 4.5:1 이상 (WCAG AA)
- 큰 텍스트 (18px+ 또는 Bold 14px+): 3:1 이상
- 비텍스트 요소 (버튼 테두리, 아이콘, 포커스 링): 3:1 이상 (WCAG 1.4.11)

| 텍스트 색 | 배경 | 대비율 | 판정 |
|---|---|---|---|
| `--color-brand-primary` | white | ~14:1 | Pass |
| `--color-brand-secondary` | white | ~7:1 | Pass |
| `--color-text-secondary` | white | ~9.7:1 | Pass |
| `--color-info` | white | ~3.1:1 | 큰 텍스트만 |

### 키보드 접근

`KWCAG 6.1.1`

```jsx
// Bad: div에 onClick만
<div onClick={handleSubmit}>분석 시작</div>

// Good: button 사용
<button onClick={handleSubmit}>분석 시작</button>
```

### 포커스 표시

`KWCAG 6.1.2`

```css
/* Bad: 절대 금지 */
:focus { outline: none; }

/* Good: 커스텀 포커스 */
:focus-visible {
  outline: 2px solid var(--color-brand-secondary);
  outline-offset: 2px;
}
```

---

## 3. 접근성 필수 규칙 — 이해 + 견고

### 언어 명시

`KWCAG 7.1.1`

```html
<html lang="ko">
```

### 입력 오류 안내

`KWCAG 7.4.1`

```jsx
// Good: 색상 + 텍스트 오류 메시지 함께
<input aria-invalid={!!error} aria-describedby="url-error" />
{error && (
  <p id="url-error" role="alert">
    올바른 뉴스 URL을 입력해주세요.
  </p>
)}
```

### 시맨틱 HTML

`KWCAG 8.1.1`

```html
<header><nav>...</nav></header>
<main id="main-content">
  <section><h1>뉴스 신뢰도 분석</h1></section>
  <section><h2>분석 결과</h2></section>
</main>
<footer>...</footer>
```

### ARIA 레이블

`KWCAG 8.2.1`

```jsx
// Bad: 아이콘만 있는 버튼
<button onClick={handleClose}>X</button>

// Good: aria-label 추가
<button onClick={handleClose} aria-label="모달 닫기">X</button>
```

---

## 4. CheckMate 핵심 UI 접근성

### 신뢰도 점수 게이지 (3요소 규칙)

색 + 아이콘 + 텍스트 라벨을 동시에 표현해야 합니다.
색만으로 상태를 구분하면 색각이상자에게 무의미합니다.

```jsx
// Good: 3요소 세트
<div className="trust-score">
  <svg role="img" aria-label="신뢰도 점수 78점, 신뢰도 낮음">
    <circle ... />
  </svg>
  <span className="score-number">78점</span>
  <span className="score-label">신뢰도 낮음</span>
</div>
```

### Claim 카드 Tier별 상태

| Tier | 의미 | 색상 역할 | 아이콘 |
|---|---|---|---|
| Tier 1 | 기관 검증 완료 | success (초록) | 방패+체크 |
| Tier 2 | AI 교차검증 | attention (주황) | 로봇/AI |
| Tier 3 | 검증 불가 | muted (회색) | 물음표 |

### 모달 접근성 필수 체크리스트

- [ ] `role="dialog"` + `aria-modal="true"`
- [ ] `aria-labelledby`로 제목 연결
- [ ] ESC 키로 닫기
- [ ] 열릴 때 모달 내부로 포커스 이동
- [ ] 포커스 트랩 (모달 밖으로 Tab 불가)
- [ ] 닫힐 때 원래 버튼으로 포커스 복귀

### 로딩 상태

```jsx
<div role="status" aria-live="polite">
  {isLoading ? '분석 진행 중...' : '분석 완료'}
</div>
{isLoading && <Spinner aria-hidden="true" />}
```

---

## 5. Material Design 3 핵심 원칙

### 역할 기반 색상

| M3 역할 | CheckMate 토큰 | 용도 |
|---|---|---|
| Primary | `--color-brand-primary` | 주요 버튼, 강조 |
| Secondary | `--color-brand-secondary` | 보조 버튼, 링크 |
| Surface | `--color-bg-surface` | 카드 배경 |
| Background | `--color-bg-base` | 페이지 배경 |

### 컴포넌트 5가지 상태

| 상태 | CSS | 설명 |
|---|---|---|
| Enabled | 기본 | 기본 상태 |
| Hover | `:hover` | 마우스 올림 |
| Pressed | `:active` | 클릭 중 |
| Focused | `:focus-visible` | 키보드 포커스 |
| Disabled | `opacity: 0.38` | 비활성화 |

### 링크 스타일 규칙 [CheckMate]

텍스트 링크는 hover와 :focus-visible 상태에서 밑줄(underline)이 반드시 나타나야 합니다.
색상만으로 링크를 구분하면 색각이상자가 인지할 수 없습니다.

```css
a {
  color: var(--color-brand-secondary);
  text-decoration: none;
}

a:hover, a:focus-visible {
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

### 터치 타겟

- M3 권장 (CheckMate 채택): 48 x 48 dp
- WCAG 2.2 법적 최소: 24 x 24 CSS px
- Apple HIG: 44 x 44 pt

---

## Spacing 규칙

> 허용 값: 6 | 8 | 10 | 16 | 20 | 24 | 32 | 48 (px) — 이외 값 사용 금지

6/10/20은 M3 정규 8dp 그리드에 없는 CheckMate 내부 확장값입니다. 12, 14, 15, 18px 등은 사용할 수 없습니다.

---

## 6. CheckMate 디자인 토큰

### 색상 — Semantic 토큰만 사용

개발자가 바로 복사해서 사용할 수 있는 토큰 목록입니다.

| CSS 변수명 | Hex 값 | 용도 |
|---|---|---|
| `--color-brand-primary` | #0f2d52 | 주요 버튼, 헤더 |
| `--color-brand-secondary` | #285c9f | 보조 강조, 링크 |
| `--color-brand-subtle` | #d2e6ff | 연한 배경, 태그 |
| `--color-accent-blue` | #0096ff | 포인트 강조 |
| `--color-bg-base` | #ffffff | 페이지 배경 |
| `--color-bg-surface` | #f0f7ff | 카드/섹션 배경 |
| `--color-text-primary` | #000000 | 기본 텍스트 |
| `--color-text-secondary` | #444444 | 보조 텍스트 |
| `--color-info` | #379ee6 | 정보 알림, 링크 힌트 |

### 폰트 규칙

| 폰트 | 사용 범위 | 비고 |
|---|---|---|
| Recipekorea | Display(83px), Heading LG(32px) 전용 | 본문 사용 금지 |
| Pretendard | 그 외 모든 텍스트 | 기본 폰트 |

### 아이콘 시스템 규칙

- 아이콘은 폰트 리그처(`material-symbols-outlined`) 대신 **SVG 컴포넌트만 사용**합니다.
- 공용 아이콘 파일: `src/07-shared/ui/icons.tsx`
- 아이콘 크기는 `ICON_SIZE` 토큰으로만 지정합니다.
  - `ICON_SIZE.sm` = `h-4 w-4`
  - `ICON_SIZE.md` = `h-5 w-5`
  - `ICON_SIZE.lg` = `h-10 w-10`
- 장식 아이콘은 `aria-hidden="true"`를 기본값으로 사용합니다.
- 아이콘이 의미 전달의 핵심인 경우 텍스트 라벨을 반드시 함께 제공합니다.

### 토큰 사용 예시

```jsx
// Bad: 하드코딩
<button style={{ backgroundColor: '#0f2d52' }}>분석</button>

// Good: 토큰 사용
<button style={{ backgroundColor: 'var(--color-brand-primary)' }}>
  분석
</button>
```

---

## 7. 자주 하는 실수 6가지

| # | 실수 | 올바른 방법 |
|---|---|---|
| 1 | 색상 하드코딩 (#0f2d52) | `var(--color-brand-primary)` |
| 2 | alt 누락/무의미 ("이미지") | 기능 설명 alt 또는 장식용 `alt=""` |
| 3 | tabIndex에 양수 (1, 2, 3...) | 0 또는 -1만 사용 |
| 4 | 연한 색 본문 텍스트 (대비 미달) | `--color-text-secondary` (#444, 9.7:1) |
| 5 | Spacing 임의값 (14px, 22px) | `var(--spacing-16)` 등 허용값만 |
| 6 | 모든 걸 div로 | header, main, nav, article 사용 |

---

## 8. 통합 체크리스트

### 접근성 (8항목)

- [ ] 모든 `<img>`에 alt 있는가?
- [ ] 아이콘 버튼에 aria-label 있는가?
- [ ] Tab 키로 모든 요소 접근 가능한가?
- [ ] outline: none 시 대체 포커스 있는가?
- [ ] 오류 메시지가 텍스트로 전달되는가?
- [ ] `<html lang="ko">` 설정했는가?
- [ ] 시맨틱 HTML 태그 사용했는가?
- [ ] 제목 계층이 h1 > h2 > h3 순서인가?

### CheckMate 핵심 UI (8항목)

- [ ] 신뢰도 점수가 색+아이콘+텍스트 3요소인가?
- [ ] SVG 게이지에 role="img" + aria-label 있는가?
- [ ] Claim 카드가 Tier별 아이콘+라벨 포함하는가?
- [ ] 모달에 포커스 트랩 + ESC 닫기 있는가?
- [ ] 로딩 스피너에 role="status" 있는가?
- [ ] 링크 hover/focus에서 밑줄 나타나는가?
- [ ] 버튼 테두리가 배경과 3:1 대비인가?
- [ ] 포커스 링이 주변과 3:1 대비인가?

### 디자인 토큰 (6항목)

- [ ] 색상 하드코딩 없는가?
- [ ] Spacing이 허용값만 사용했는가?
- [ ] Recipekorea가 Display/Heading LG에만 쓰였는가?
- [ ] 새 토큰 추가 시 CSS+JS 모두 수정했는가?
- [ ] 아이콘이 `src/07-shared/ui/icons.tsx` 공용 컴포넌트를 사용하는가?
- [ ] 아이콘 크기가 `ICON_SIZE` 토큰(`sm|md|lg`)만 사용하는가?

---

## 9. 참고 링크

### 접근성 표준

- KWCAG 2.2: https://a11ykr.github.io/kwcag22/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

### 디자인 시스템 (우선순위 순)

1. Material Design 3 — https://m3.material.io/styles/color/roles
2. GitHub Primer — https://primer.style/foundations/color/overview
3. IBM Carbon — https://carbondesignsystem.com/guidelines/accessibility/color

CheckMate는 M3를 기본 설계 기준으로 채택합니다. Primer와 Carbon은 접근성 패턴 및 색상 역할 참고용입니다.

---

## 10. CheckMate 내부

- 디자인 토큰: `Design Assistant/tokens.css`
- 심화 레퍼런스: `docs/guides/checkmate-design-system-references.md`
