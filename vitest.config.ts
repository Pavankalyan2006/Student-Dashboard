import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    // CI runs 60 isolated test files on a small runner; under that CPU load a fast test can exceed the
    // 5 s default (seen once on coding.test.ts, which takes about 0.1 s locally). Generous limits keep
    // the timeout a guard against hangs rather than a measure of runner load.
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
