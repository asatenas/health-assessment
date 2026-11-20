import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Unit tests only. Playwright owns tests/ (e2e + routes), and
    // lib/ai/models.test.ts is a Playwright mock, not a test.
    include: ['**/*.unit.test.ts'],
    exclude: ['node_modules/**', '.next/**'],
  },
});
