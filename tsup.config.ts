import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', cli: 'src/cli/index.ts' },
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  dts: { entry: { index: 'src/index.ts' } },
  // No source maps in the package: they would ship every source file a second time (REA release audit).
  sourcemap: false,
  clean: true,
  splitting: true,
});
