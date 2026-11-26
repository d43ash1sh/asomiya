import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The playground bundles examples/*.asom as text (see tsup.playground.config.ts), and the MCP
  // server bundles docs/*.md and its built view (mcp/scripts/build.mjs); mirror that.
  plugins: [
    {
      name: 'text-imports',
      transform(code, id) {
        return /\.(asom|md|html)$/.test(id) ? `export default ${JSON.stringify(code)};` : null;
      },
    },
  ],
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/global-setup.ts'],
    testTimeout: 20_000,
  },
});
