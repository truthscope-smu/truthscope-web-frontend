import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import tsconfigPaths from 'vite-tsconfig-paths';

// IMPORTANT: Do NOT add root-level test.setupFiles or test.environment here.
// Each project below specifies its own setupFile — root inheritance would re-pollute
// the browser project with msw/node imports.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // Coverage scope = unit-testable business logic only.
    // UI components are covered by browser project (Vitest browser mode, separate run).
    // Next.js framework files / supabase clients / Sprint 2 placeholders 제외.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // tests + types
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/**',
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.d.ts',
        // Next.js framework files (covered by build / e2e)
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/error.tsx',
        'src/app/**/not-found.tsx',
        'src/app/**/global-error.tsx',
        'src/app/**/loading.tsx',
        'src/proxy.ts',
        // UI components (covered by Vitest browser project, not unit coverage)
        'src/03-pages/**',
        'src/04-widgets/**',
        'src/05-features/**/ui/**',
        'src/06-entities/**/ui/**',
        'src/07-shared/ui/**',
        // Supabase clients (server-side / browser-side, integration test territory)
        'src/07-shared/api/supabase/**',
        // Static helpers (no logic to assert)
        'src/07-shared/lib/cn.ts',
        'src/07-shared/utils/**',
        'src/07-shared/types/**',
        // Sprint 2 placeholders (services not yet implemented)
        'src/06-entities/article/api/backend.ts',
        'src/05-features/extract-article/model/schema.ts',
      ],
      thresholds: {
        lines: 60,
        statements: 60,
        functions: 60,
        branches: 50,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.unit.ts'],
          include: [
            'src/06-entities/**/*.test.ts',
            'src/06-entities/**/__tests__/**/*.test.ts',
            'src/05-features/**/__tests__/**/*.test.{ts,tsx}',
            'src/05-features/**/model/**/*.test.ts',
            'src/05-features/**/api*.test.ts',
            'src/04-widgets/**/lib/**/*.test.ts',
            'test/architecture.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          setupFiles: ['./vitest.setup.browser.ts'],
          include: [
            'src/04-widgets/**/*.test.tsx',
            'src/05-features/**/ui/**/*.test.tsx',
          ],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
          },
        },
      },
    ],
  },
});
