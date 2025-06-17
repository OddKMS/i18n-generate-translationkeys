import { defineConfig, coverageConfigDefaults } from 'vitest/config';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '#types': path.resolve(__dirname, './src/types'),
      '#helpers': path.resolve(__dirname, './src/helpers'),
      '#generate-keys': path.resolve(
        __dirname,
        './src/generate-translationkeys.ts'
      ),
    },
  },
  test: {
    name: 'i18n-generate-translationkeys',
    isolate: false,
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    setupFiles: 'tests/setup.ts',
    silent: 'passed-only',
    coverage: {
      provider: 'v8',
      exclude: ['**/index.ts', ...coverageConfigDefaults.exclude],
    },
  },
});
