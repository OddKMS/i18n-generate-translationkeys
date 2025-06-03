import { defineConfig, coverageConfigDefaults } from 'vitest/config';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '#helpers': path.resolve(__dirname, './src/helpers'),
      '#generate-keys': path.resolve(
        __dirname,
        './src/generate-translationkeys.ts',
      ),
    },
  },
  test: {
    name: 'i18n-generate-translationkeys',
    globals: true,
    root: '.',
    environment: 'node',
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      exclude: ['**/index.ts', ...coverageConfigDefaults.exclude],
    },
  },
});
