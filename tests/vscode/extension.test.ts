import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'esbuild';
import oniguruma from 'vscode-oniguruma';
import textmate from 'vscode-textmate';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { parse } from '../../src/index';
import { buildGrammar } from '../../editors/vscode/src/grammar';
import { RunSession } from '../../editors/vscode/src/run-session';
import {
  check,
  completions,
  describe as describeWord,
  python,
} from '../../editors/vscode/src/service';

const EXT = join(import.meta.dirname, '../../editors/vscode');
const read = (path: string): string => readFileSync(join(EXT, path), 'utf8');

// ── syntax colours, with VS Code's own TextMate engine ───────────────────

let grammar: textmate.IGrammar;

beforeAll(async () => {
  const wasm = readFileSync(
    join(import.meta.dirname, '../../node_modules/vscode-oniguruma/release/onig.wasm'),
  );
  await oniguruma.loadWASM(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
  const registry = new textmate.Registry({
    onigLib: Promise.resolve({
      createOnigScanner: (patterns) => new oniguruma.OnigScanner(patterns),
      createOnigString: (s) => new oniguruma.OnigString(s),
    }),
    loadGrammar: () =>
      Promise.resolve(textmate.parseRawGrammar(read('syntaxes/asomiya.tmLanguage.json'), 'g.json')),
  });
  const loaded = await registry.loadGrammar('source.asomiya');
  if (loaded === null) throw new Error('grammar did not load');
  grammar = loaded;
});

/** [text, innermost scope] for each token of one line. */
function tokens(line: string): [string, string][] {
  const { tokens: list } = grammar.tokenizeLine(line, textmate.INITIAL);
  return list.map((t) => [
    line.slice(t.startIndex, t.endIndex),
    t.scopes[t.scopes.length - 1] ?? '',
  ]);
}

const scopeOf = (line: string, text: string): string | undefined =>
  tokens(line).find(([t]) => t === text)?.[1];

describe('VS Code extension: syntax colours', () => {
  it('the committed grammar is up to date (run npm run vscode:grammar)', () => {
    expect(JSON.parse(read('syntaxes/asomiya.tmLanguage.json'))).toEqual(buildGrammar());
  });

  it('colours keywords, built-ins, strings, numbers and comments in Assamese script', () => {
    const line = 'ধৰা ক = দৈৰ্ঘ্য("অসম") + ১২.৫ // মন্তব্য';
    expect(scopeOf(line, 'ধৰা')).toBe('storage.type.asomiya');
    expect(scopeOf(line, 'দৈৰ্ঘ্য')).toBe('support.function.builtin.asomiya');
    expect(scopeOf(line, '১২.৫')).toBe('constant.numeric.asomiya');
    expect(tokens(line).some(([, s]) => s === 'string.quoted.double.asomiya')).toBe(true);
    expect(tokens(line).some(([, s]) => s === 'comment.line.double-slash.asomiya')).toBe(true);
    expect(scopeOf("} নহ'লে {", "নহ'লে")).toBe('keyword.control.asomiya');
    expect(scopeOf('যদি (সঁচা আৰু মিছা) {', 'সঁচা')).toBe('constant.language.asomiya');
  });

  it('colours keywords written in English letters', () => {
    expect(scopeOf('dhora x = 5', 'dhora')).toBe('storage.type.asomiya');
    expect(scopeOf('jodi (x > 1) {', 'jodi')).toBe('keyword.control.asomiya');
    expect(scopeOf('kowa(x)', 'kowa')).toBe('support.function.builtin.asomiya');
    expect(scopeOf('fangchon jog(a, b) {', 'jog')).toBe('entity.name.function.asomiya');
  });

  it('accepts every way of typing য় ড় ঢ় and the apostrophe', () => {
    const decomposed = 'যেতিয়ালৈকে'.normalize('NFD');
    const precomposed = 'যেতিয়ালৈকে';
    expect(scopeOf(`${decomposed} (ক) {`, decomposed)).toBe('keyword.control.asomiya');
    expect(scopeOf(`${precomposed} (ক) {`, precomposed)).toBe('keyword.control.asomiya');
    expect(scopeOf('} noh’le {', 'noh’le')).toBe('keyword.control.asomiya');
  });

  it('does not colour keywords inside longer names', () => {
    for (const [line, word] of [
      ['dhorabo = 1', 'dhora'],
      ['ধৰাক = ১', 'ধৰা'],
      ['Jodi = 1', 'Jodi'],
      ['x1kowa = 2', 'kowa'],
    ] as const) {
      expect(tokens(line).some(([t, s]) => t === word && s !== 'source.asomiya')).toBe(false);
    }
  });
});

// ── editor features ──────────────────────────────────────────────────────

describe('VS Code extension: errors, hover, completion, Python', () => {
  it('points at the exact characters of an error', () => {
    const source = 'ধৰা ক = ১\nকোৱা(ক ২)';
    const [problem] = check(source, 'en');
    expect(problem?.code).toBe('P001');
    expect(source.slice(problem?.start, problem?.end)).toBe('২');
    expect(check('ধৰা ক = ১', 'en')).toEqual([]);
  });

  it('marks something visible for an error at the end of the file', () => {
    const [problem] = check('কোৱা(', 'as');
    expect(problem).toBeDefined();
    expect((problem?.end ?? 0) - (problem?.start ?? 0)).toBeGreaterThan(0);
  });

  it('explains keywords and built-ins in both scripts, with the Python name', () => {
    expect(describeWord('kowa')).toContain('print()');
    expect(describeWord('যদি')).toContain('`if`');
    expect(describeWord('দৈৰ্ঘ্য')).toContain('len()');
    expect(describeWord('xudha')).toContain('input()');
    expect(describeWord('Kowa')).toBeNull();
    expect(describeWord('নাম')).toBeNull();
  });

  it('suggests words in the script the program uses', () => {
    expect(completions('dhora x = 1')[0]?.label).toBe('dhora');
    expect(completions('ধৰা ক = ১')[0]?.label).toBe('ধৰা');
  });

  it('shows the Python version or the reason there is none', () => {
    expect(python('kowa("hi")', 'en', 'auto').python).toContain('print("hi")');
    const failed = python('kowa(', 'en', 'auto');
    expect(failed.python).toBeNull();
    expect(failed.error).toContain('P0');
  });

  it('every snippet is a valid program', () => {
    const snippets = JSON.parse(read('snippets/asomiya.json')) as Record<
      string,
      { body: string[] }
    >;
    expect(Object.keys(snippets).length).toBeGreaterThan(10);
    for (const [name, { body }] of Object.entries(snippets)) {
      const code = body
        .join('\n')
        .replace(/\$\{\d+:([^}]*)\}/g, '$1')
        .replace(/\$\d+/g, '');
      expect(() => parse(code), name).not.toThrow();
    }
  });
});

// ── the manifest ─────────────────────────────────────────────────────────

describe('VS Code extension: manifest', () => {
  const manifest = JSON.parse(read('package.json')) as {
    version: string;
    icon: string;
    contributes: {
      commands: { command: string }[];
      menus: Record<string, { command: string }[]>;
      keybindings: { command: string }[];
      languages: { icon: { light: string; dark: string }; configuration: string }[];
      grammars: { path: string }[];
      snippets: { path: string }[];
    };
  };

  it('only refers to commands and files that exist', () => {
    const commands = new Set(manifest.contributes.commands.map((c) => c.command));
    const used = [
      ...Object.values(manifest.contributes.menus).flat(),
      ...manifest.contributes.keybindings,
    ].map((m) => m.command);
    for (const c of used) expect(commands.has(c), c).toBe(true);
    const files = [
      manifest.icon,
      ...manifest.contributes.languages.flatMap((l) => [
        l.icon.light,
        l.icon.dark,
        l.configuration,
      ]),
      ...manifest.contributes.grammars.map((g) => g.path),
      ...manifest.contributes.snippets.map((s) => s.path),
    ];
    for (const f of files) expect(existsSync(join(EXT, f)), f).toBe(true);
  });

  it('has a changelog entry for its version', () => {
    expect(read('CHANGELOG.md')).toContain(`## ${manifest.version}`);
  });
});

// ── Run, with a real worker thread ───────────────────────────────────────

describe('VS Code extension: Run', () => {
  let worker = '';

  beforeAll(async () => {
    worker = join(mkdtempSync(join(tmpdir(), 'asomiya-run-')), 'run-worker.js');
    await build({
      entryPoints: [join(EXT, 'src/run-worker.ts')],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: worker,
      logLevel: 'silent',
    });
  });

  afterAll(() => undefined);

  function start(source: string): {
    session: RunSession;
    output: () => string;
    done: Promise<string>;
  } {
    let out = '';
    let resolve: (outcome: string) => void = () => undefined;
    const done = new Promise<string>((r) => {
      resolve = r;
    });
    const session = new RunSession(
      worker,
      { source, fileName: 'test.asom', lang: 'en', digits: 'auto' },
      {
        write: (text) => {
          out += text;
        },
        finished: (outcome) => {
          resolve(outcome);
        },
      },
    );
    return { session, output: () => out, done };
  }

  const until = async (test: () => boolean): Promise<void> => {
    for (let i = 0; i < 200 && !test(); i++) await new Promise((r) => setTimeout(r, 10));
  };

  it('prints output with terminal line breaks', async () => {
    const run = start('kowa("Nomoskar")\nkowa(1 + 2)');
    expect(await run.done).toBe('ok');
    expect(run.output()).toContain('Nomoskar\r\n3\r\n');
  });

  it('reads input typed in the terminal, including Assamese and backspace', async () => {
    const run = start('dhora naam = xudha("Naam? ")\nkowa("Nomoskar, " + naam)');
    await until(() => run.output().includes('Naam? '));
    run.session.input('অসমx\x7f\r');
    expect(await run.done).toBe('ok');
    expect(run.output()).toContain('Nomoskar, অসম');
  });

  it('shows errors with their code and position', async () => {
    const run = start('kowa(naam)');
    expect(await run.done).toBe('error');
    expect(run.output()).toContain('R001');
    expect(run.output()).toContain('test.asom:1:6');
  });

  it('stops an endless program with Ctrl+C', async () => {
    const run = start('jetialoike (xosa) { }');
    await new Promise((r) => setTimeout(r, 100));
    run.session.input('\x03');
    expect(await run.done).toBe('stopped');
    expect(run.session.running).toBe(false);
  });
});
