import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import fsdPlugin from 'eslint-plugin-fsd-lint';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // FSD 아키텍처 규칙 (P3 책임 분리 — ADR-006 §책임 분리표)
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      // ADR-006 §책임 분리표: layer direction R2/R3 enforcement는 dep-cruiser primary.
      // fsd/forbidden-imports는 동일 룰 중복 메시지 회피 위해 비활성 (Phase 21 P3).
      'fsd/forbidden-imports': 'off',
      // 슬라이스 간 상대 경로 금지 (같은 슬라이스 내 ./ 허용) — dep-cruiser scope 외, fsd 단독.
      'fsd/no-relative-imports': 'error',
      // 슬라이스 Public API (index.ts) 우회 금지 — dep-cruiser R4와 메시지 양식 차이로 보조 유지.
      'fsd/no-public-api-sidestep': 'error',
      // 동일 레이어 내 슬라이스 간 참조 금지 — ADR-006 row 15 cross-slice는 fsd-lint 단독.
      'fsd/no-cross-slice-dependency': 'error',
    },
  },

  // 외부 라이브러리 barrel import 금지 (번들 성능)
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['lucide-react'],
              message:
                "lucide-react barrel import 금지. 직접 경로 사용: import { Icon } from 'lucide-react/dist/esm/icons/icon'",
            },
          ],
        },
      ],
    },
  },

  // Phase 21 W1 — root-level test infrastructure는 FSD slice 외부.
  // vitest.setup.*.ts, test/**/*.ts는 src/ 외부에 위치하며 alias 적용 대상이 아니므로
  // fsd/no-relative-imports 비활성 (S3 옵션 정합 — dep-cruiser는 이미 exclude 처리).
  {
    files: ['vitest.setup.*.ts', 'test/**/*.ts'],
    rules: {
      'fsd/no-relative-imports': 'off',
    },
  },

  // Phase 21 W2 — slice 내부 __tests__/**/*.test.* 와 형제 *.test.* 는 slice 일부.
  // dep-cruiser exclude(.test.tsx?$)와 정합 — fsd 룰 비활성화.
  {
    files: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'fsd/no-relative-imports': 'off',
      'fsd/no-public-api-sidestep': 'off',
    },
  },

  // Phase 21 W3 — src/app/** 은 Next.js App Router 라우팅 폴더. FSD 의 "slice" 개념 아님.
  // app/analysis 와 app/providers 는 cross-slice가 아니라 routing/ + provider 의 정상 통합 패턴.
  // 동일 layer 내 직접 import 패턴 (예: app/analysis/layout.tsx → app/providers/article.context)이
  // 정상이므로 fsd/no-cross-slice-dependency 비활성. 단 fsd/forbidden-imports + arch R5 (provider mount-block) 유지.
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'fsd/no-cross-slice-dependency': 'off',
    },
  },

  // Override default ignores
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    'public/mockServiceWorker.js',
  ]),
]);

export default eslintConfig;
