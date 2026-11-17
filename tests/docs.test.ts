import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MESSAGES } from '../src/errors/messages';
import { LANGUAGE } from '../src/language/config';
import { BUILTIN_NAMES, BUILTIN_ROMAN, KEYWORD_GLOSSARY } from '../src/language/glossary';

const ROOT = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

describe('documentation stays in sync with the code', () => {
  it('docs/KEYWORDS.md documents every keyword and built-in', () => {
    const doc = read('docs/KEYWORDS.md');
    for (const entry of KEYWORD_GLOSSARY) {
      expect(doc, entry.word).toContain(`\`${entry.word}\``);
      expect(doc, `${entry.word} status`).toMatch(
        new RegExp(`\`${entry.word}\`[^\\n]*\\|\\s*${entry.status}\\s*\\|`, 'u'),
      );
    }
    for (const name of Object.values(BUILTIN_NAMES)) {
      expect(doc, name).toContain(`\`${name}\``);
    }
  });

  it('docs/ROMAN.md lists every romanised spelling', () => {
    const doc = read('docs/ROMAN.md');
    const spellings = [
      ...KEYWORD_GLOSSARY.flatMap((entry) => entry.roman),
      ...Object.values(BUILTIN_ROMAN).flat(),
    ];
    for (const spelling of spellings) expect(doc, spelling).toContain(`\`${spelling}\``);
  });

  it('docs/ERRORS.md documents every diagnostic code', () => {
    const doc = read('docs/ERRORS.md');
    for (const code of Object.keys(MESSAGES)) {
      expect(doc, code).toContain(`### ${code}`);
    }
  });

  it('every example program has an expected-output test', () => {
    const cliTest = read('tests/integration/cli.test.ts');
    for (const file of readdirSync(join(ROOT, 'examples'))) {
      expect(cliTest, file).toContain(file);
    }
  });

  it('LANGUAGE.version matches package.json', () => {
    const pkg = JSON.parse(read('package.json')) as { version: string; name: string };
    expect(LANGUAGE.version).toBe(pkg.version);
    expect(LANGUAGE.cliName).toBe(pkg.name);
  });
});
