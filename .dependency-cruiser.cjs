/**
 * Phase 21 dep-cruiser config — FE-DDD 5 enforceable rules + Codex 보완 5건 (S1-S5) + Q3 추가 룰.
 *
 * 책임 분리 (P3, ADR-006 §책임 분리표):
 *   - dep-cruiser primary: R1-R5 + Q3 추가 룰 (path-aware + TS aware)
 *   - fsd-lint 보조: no-relative-imports + no-public-api-sidestep (보조)
 *
 * S1-S5 처리 방식 (모두 implicit, 별도 enforceable 룰 없음):
 *   - S1: app/providers/ 내부 05/06/07 import 허용 → R2 from-scope가 ^src/06-entities/라
 *         app/providers/는 from-scope 아님 (자동 exception)
 *   - S2: barrel 우회 차단 → R4 (slice-internal-must-go-through-barrel)이 enforce
 *   - S3: tests / MSW handlers / vitest setup 룰 제외 → options.exclude.path glob 처리
 *   - S4: @/06-entities/* + @06-entities/* alias 매칭 → tsConfig.fileName tsconfig.json path 자동 따라감
 *   - S5: type-only import 런타임 분리 → tsPreCompilationDeps:true 처리
 */
module.exports = {
  forbidden: [
    {
      name: 'R1-entity-model-must-not-depend-on-adapters',
      comment:
        'Entity model must not depend on api/ui adapters within same slice',
      severity: 'error',
      from: { path: '^src/06-entities/([^/]+)/model/' },
      to: { path: '^src/06-entities/[^/]+/(api|ui)/' },
    },
    {
      name: 'R2-entity-must-not-depend-on-upper-layers',
      comment: 'Entity must not depend on app/03-pages/04-widgets/05-features',
      severity: 'error',
      from: { path: '^src/06-entities/' },
      to: { path: '^src/(03-pages|04-widgets|05-features|app)/' },
    },
    {
      name: 'R3-feature-must-not-depend-on-widgets',
      comment: 'FSD direction: 5-features must not depend on 4-widgets',
      severity: 'error',
      from: { path: '^src/05-features/' },
      to: { path: '^src/04-widgets/' },
    },
    {
      name: 'R4-slice-internal-must-go-through-barrel',
      comment:
        'External access to entities slice internals (model/ui/api) must go through entity index.ts barrel',
      severity: 'error',
      from: { pathNot: '^src/06-entities/[^/]+/' },
      to: { path: '^src/06-entities/[^/]+/(model|ui|api)/[^/]+\\.tsx?$' },
    },
    // cross-feature import 차단은 ADR-006 §책임 분리표 row 15 정합 — fsd-lint 단독 (`fsd/no-cross-slice-dependency`).
    // dep-cruiser 백레퍼런스(`\1`)가 `to.path` / `to.pathNot` 양쪽에서 same-slice 내부 import를 false positive로 잡음
    // (dep-cruiser 17.3.10 실측, 2026-05-02). PLAN T1.2 rev.3 R3-03 의 "dep-cruiser 단독" 인용은 ADR과 contradiction —
    // ADR-006 §책임 분리표 결정 요약 "fsd-lint no-relative-imports + forbidden-imports만" 그대로 따름.
    {
      name: 'R5-app-is-only-provider-entry',
      comment: 'Provider components must mount in app/, not slice internals',
      severity: 'error',
      from: { pathNot: '^src/app/' },
      to: { path: '^src/app/providers/' },
    },
    {
      name: 'Q3-entity-model-no-api',
      comment:
        'entities/{name}/model must not import entities/{name}/api (Q3 LOCK)',
      severity: 'error',
      from: { path: '^src/06-entities/[^/]+/model/' },
      to: { path: '^src/06-entities/[^/]+/api/' },
    },
    {
      name: 'Q3-entity-api-no-upper',
      comment: 'entities/{name}/api must not import features/widgets/pages/app',
      severity: 'error',
      from: { path: '^src/06-entities/[^/]+/api/' },
      to: { path: '^src/(03-pages|04-widgets|05-features|app)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    exclude: {
      path: '(\\.test\\.tsx?$|^test/|^vitest\\.setup\\.|^vitest\\.config\\.|^vitest\\.shims\\.)',
    },
  },
};
