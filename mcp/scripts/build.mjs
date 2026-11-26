// Builds asomiya-mcp: first the playground view (one self-contained HTML file, script and styles
// inline), then the server, which bundles the view, the docs and the whole interpreter into
// mcp/dist/index.js. The package has no runtime dependencies at all.
//
//   node mcp/scripts/build.mjs          view + server
//   node mcp/scripts/build.mjs --view   view only (the tests import the server source)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'tsup';

const MCP = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * zod re-exports all 40+ of its message translations as one namespace, which no bundler can drop
 * (~260 KB). The SDK only ever uses the English messages, so keep just those.
 */
const zodEnglishOnly = {
  name: 'zod-english-only',
  setup(b) {
    b.onResolve({ filter: /\/locales\/index\.js$/ }, (args) =>
      /[\\/]zod[\\/]/.test(args.importer)
        ? { path: join(dirname(args.importer), '../locales/en.js'), namespace: 'zod-locales' }
        : undefined,
    );
    b.onLoad({ filter: /.*/, namespace: 'zod-locales' }, (args) => ({
      contents: `export { default as en } from ${JSON.stringify(args.path)};`,
      resolveDir: dirname(args.path),
    }));
  },
};
const VIEW_OUT = join(MCP, '.view');

async function buildView() {
  rmSync(VIEW_OUT, { recursive: true, force: true });
  await build({
    entry: { view: join(MCP, 'src/view/view.ts') },
    outDir: VIEW_OUT,
    format: ['iife'],
    platform: 'browser',
    target: 'es2022',
    minify: true,
    sourcemap: false,
    splitting: false,
    clean: false,
    silent: true,
    // Don't pick up the repository's tsup.config.ts.
    config: false,
    tsconfig: join(MCP, 'tsconfig.json'),
    noExternal: [/.*/],
    esbuildPlugins: [zodEnglishOnly],
    outExtension: () => ({ js: '.js' }),
  });
  const script = readFileSync(join(VIEW_OUT, 'view.js'), 'utf8')
    .replace(/<\/(script)/gi, '<\\/$1')
    .replace(/<!--/g, '<\\!--');
  const style = readFileSync(join(MCP, 'src/view/view.css'), 'utf8');
  const html = readFileSync(join(MCP, 'src/view/view.html'), 'utf8')
    .replace('/*STYLE*/', () => style)
    .replace('/*SCRIPT*/', () => script);
  mkdirSync(VIEW_OUT, { recursive: true });
  writeFileSync(join(VIEW_OUT, 'playground.html'), html);
  return html.length;
}

async function buildServer() {
  await build({
    entry: { index: join(MCP, 'src/index.ts') },
    outDir: join(MCP, 'dist'),
    format: ['esm'],
    platform: 'node',
    target: 'node20',
    minify: true,
    sourcemap: false,
    splitting: false,
    clean: true,
    silent: true,
    // Don't pick up the repository's tsup.config.ts.
    config: false,
    tsconfig: join(MCP, 'tsconfig.json'),
    noExternal: [/.*/],
    esbuildPlugins: [zodEnglishOnly],
    loader: { '.md': 'text', '.html': 'text', '.asom': 'text' },
    banner: {
      // Bundled CommonJS dependencies may call require(); give ESM a real one.
      js: "#!/usr/bin/env node\nimport { createRequire as __asomiyaRequire } from 'node:module';\nconst require = __asomiyaRequire(import.meta.url);",
    },
  });
}

const viewOnly = process.argv.includes('--view');
const size = await buildView();
console.log(`mcp/.view/playground.html  ${(size / 1024).toFixed(0)} KB`);
if (!viewOnly) {
  await buildServer();
  const out = readFileSync(join(MCP, 'dist/index.js'));
  console.log(`mcp/dist/index.js          ${(out.length / 1024).toFixed(0)} KB`);
}
