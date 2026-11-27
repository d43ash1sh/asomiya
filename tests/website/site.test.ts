import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '../..');
const OUT = join(ROOT, 'website/dist');

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

let pages: { file: string; html: string }[] = [];

beforeAll(() => {
  // The generator runs every code sample on the site and fails if one breaks.
  execFileSync(process.execPath, [join(ROOT, 'website/build.mjs')], { stdio: 'pipe' });
  pages = htmlFiles(OUT).map((file) => ({ file, html: readFileSync(file, 'utf8') }));
}, 60_000);

describe('website security', () => {
  it('every page has a strict Content Security Policy', () => {
    expect(pages.length).toBeGreaterThan(40);
    for (const { file, html } of pages) {
      const csp = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)?.[1];
      expect(csp, file).toBeDefined();
      expect(csp, file).toContain("default-src 'none'");
      expect(csp, file).toMatch(/script-src 'self'( https:\/\/www\.googletagmanager\.com)?;/);
      // The only network requests allowed are Google Analytics page views.
      const connect = /connect-src ([^;]+)/.exec(csp ?? '')?.[1] ?? '';
      for (const source of connect.split(' ')) {
        expect(source, file).toMatch(
          /^('none'|https:\/\/\*\.(google-analytics\.com|analytics\.google\.com|googletagmanager\.com))$/,
        );
      }
      expect(csp, file).not.toContain('unsafe-inline');
      expect(csp, file).not.toContain('unsafe-eval');
    }
  });

  it('has no inline scripts or inline event handlers', () => {
    for (const { file, html } of pages) {
      for (const tag of html.match(/<script\b[^>]*>/g) ?? []) expect(tag, file).toMatch(/\ssrc="/);
      expect(html, file).not.toMatch(/\son[a-z]+\s*=\s*["']/i);
      expect(html, file).not.toMatch(/javascript:/i);
    }
  });

  it('opens external links safely and only over HTTPS', () => {
    for (const { file, html } of pages) {
      for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []) {
        expect(tag, file).toMatch(/rel="[^"]*noopener[^"]*"/);
      }
      for (const [, url] of html.matchAll(/(?:href|src)="(http:[^"]*)"/g)) {
        throw new Error(`Insecure URL ${url ?? ''} in ${file}`);
      }
    }
  });
});

describe('link previews', () => {
  it('every page has its own 1200×630 preview image, and the image exists', () => {
    const seen = new Set<string>();
    for (const { file, html } of pages) {
      if (file.endsWith('404.html')) continue;
      const image = /property="og:image" content="https:\/\/asomiya\.codes\/(og\/[^"]+\.png)"/.exec(
        html,
      )?.[1];
      expect(image, file).toBeDefined();
      if (image === undefined) continue;
      const png = readFileSync(join(OUT, image));
      // PNG header: width and height are big-endian at bytes 16 and 20.
      expect([png.readUInt32BE(16), png.readUInt32BE(20)], image).toEqual([1200, 630]);
      expect(html, file).toContain('name="twitter:card" content="summary_large_image"');
      seen.add(image);
    }
    // One card per page, not the home card reused (run `npm run website:og` after adding a page).
    expect(seen.size).toBe(pages.filter((p) => !p.file.endsWith('404.html')).length);
  });
});

describe('website links', () => {
  it('every internal link and asset exists', () => {
    const missing: string[] = [];
    for (const { file, html } of pages) {
      for (const [, attr = ''] of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
        if (/^(https?:|mailto:|#|data:)/.test(attr)) continue;
        const path = attr.split('#')[0]?.split('?')[0] ?? '';
        if (path === '') continue;
        const base = attr.startsWith('/') ? OUT : dirname(file);
        let target = join(base, path.startsWith('/') ? path.slice(1) : path);
        if (path.endsWith('/') || path === './') target = join(target, 'index.html');
        // Built by tsup into assets/, which this test doesn't run.
        if (target.startsWith(join(OUT, 'assets')) && target.endsWith('.js')) continue;
        if (!existsSync(target)) missing.push(`${relative(OUT, file)} → ${attr}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every page exists in English and Assamese', () => {
    const english = pages
      // Forward slashes on every OS (Windows paths use \\).
      .map(({ file }) => relative(OUT, file).split(sep).join('/'))
      .filter((p) => !p.startsWith('as/') && p !== '404.html');
    for (const page of english) expect(existsSync(join(OUT, 'as', page)), page).toBe(true);
  });
});

describe('for AI assistants', () => {
  it('publishes llms.txt and the same guide the MCP server gives', () => {
    const index = readFileSync(join(OUT, 'llms.txt'), 'utf8');
    expect(index).toMatch(/^# Asomiya/);
    expect(index).toContain('https://asomiya.codes/llms-full.txt');
    const full = readFileSync(join(OUT, 'llms-full.txt'), 'utf8');
    const served = execFileSync(process.execPath, [join(ROOT, 'mcp/dist/index.js'), '--guide'], {
      encoding: 'utf8',
    });
    expect(full).toBe(served);
    expect(full).toContain('প্ৰতিটো');
  });

  it('names the current .mcpb file on the AI page', () => {
    const { version } = JSON.parse(readFileSync(join(ROOT, 'mcp/package.json'), 'utf8')) as {
      version: string;
    };
    const page = pages.find(
      ({ file }) => relative(OUT, file).split(sep).join('/') === 'ai/index.html',
    );
    expect(page?.html).toContain(`asomiya-${version}.mcpb`);
  });
});
