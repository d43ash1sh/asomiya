import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The playground bundles examples/*.asom as text (see tsup.playground.config.ts); mirror that.
  plugins: [
    {
      name: 'asom-as-text',
      transform(code, id) {
        return id.endsWith('.asom') ? `export default ${JSON.stringify(code)};` : null;
      },
    },
  ],
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/global-setup.ts'],
    testTimeout: 20_000,
  },
});
