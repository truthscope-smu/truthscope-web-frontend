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
