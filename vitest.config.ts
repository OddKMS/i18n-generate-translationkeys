import { defineConfig, coverageConfigDefaults } from 'vitest/config';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './src'),
      '#lib': path.resolve(__dirname, './src/lib'),
      '#helpers': path.resolve(__dirname, './src/lib/helpers'),
    },
  },
  test: {
    name: 'i18n-generate-translationkeys',
    globals: true,
    root: '.',
    environment: 'node',
    passWithNoTests: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      exclude: ['**/index.ts', ...coverageConfigDefaults.exclude],
    },
  },
});
