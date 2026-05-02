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
