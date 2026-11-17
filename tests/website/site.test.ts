import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
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
      expect(csp, file).toContain("script-src 'self'");
      expect(csp, file).toContain("connect-src 'none'");
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

describe('website links', () => {
  it('every internal link and asset exists', () => {
    const missing: string[] = [];
    for (const { file, html } of pages) {
      for (const [, attr = ''] of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
        if (/^(https?:|mailto:|#|data:)/.test(attr)) continue;
        const path = attr.split('#')[0] ?? '';
        if (path === '') continue;
        const base = attr.startsWith('/') ? OUT : dirname(file);
        let target = join(base, attr.startsWith('/') ? path.slice(1) : path);
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
      .map(({ file }) => relative(OUT, file))
      .filter((p) => !p.startsWith('as/') && p !== '404.html');
    for (const page of english) expect(existsSync(join(OUT, 'as', page)), page).toBe(true);
  });
});
