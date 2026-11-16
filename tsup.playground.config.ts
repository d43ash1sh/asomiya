import { defineConfig } from 'tsup';

/** Builds the browser playground into site/ (deployed to GitHub Pages). */
export default defineConfig({
  entry: { app: 'playground/src/main.ts' },
  format: ['iife'],
  platform: 'browser',
  target: 'es2022',
  outDir: 'site',
  publicDir: 'playground/public',
  loader: { '.asom': 'text' },
  outExtension: () => ({ js: '.js' }),
  minify: true,
  sourcemap: false,
  dts: false,
  clean: true,
});
