import { defineConfig } from 'tsup';

// Bundles the extension and its run worker (with the whole interpreter inside) into two files, so
// the packaged extension has no dependencies at all. `vscode` is provided by the editor.
export default defineConfig({
  entry: {
    extension: 'editors/vscode/src/extension.ts',
    'run-worker': 'editors/vscode/src/run-worker.ts',
  },
  outDir: 'editors/vscode/dist',
  format: ['cjs'],
  target: 'node18',
  platform: 'node',
  external: ['vscode'],
  sourcemap: false,
  minify: true,
  clean: true,
  splitting: false,
  outExtension: () => ({ js: '.js' }),
});
