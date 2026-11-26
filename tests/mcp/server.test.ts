import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { tokenize } from '../../src/lexer/lexer';
import { runSource } from '../../src/run';
import { KEYWORD_GLOSSARY } from '../../src/language/glossary';
import { MESSAGES } from '../../src/errors/messages';
import { fromHash } from '../../website/src/playground/share';
import {
  EXAMPLES,
  GUIDE_PROGRAM,
  GUIDE_PROGRAM_OUTPUT,
  GUIDE_ROMAN_OUTPUT,
  GUIDE_ROMAN_PROGRAM,
  KEYWORD_USAGE,
  guide,
} from '../../mcp/src/knowledge';
import { FIX_HINTS } from '../../mcp/src/hints';
import { MAX_OUTPUT_LENGTH } from '../../mcp/src/runner';
import { createServer, GUIDE_URI, VIEW_URI } from '../../mcp/src/server';
import { SERVER_VERSION } from '../../mcp/src/version';

const ROOT = join(import.meta.dirname, '../..');

let client: Client;

beforeAll(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverSide);
  client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(clientSide);
});

afterAll(async () => {
  await client.close();
});

interface Structured {
  ok: boolean;
  output: string;
  outputTruncated: boolean;
  error: { code: string; phase: string; line: number; message: string; messageAs: string } | null;
  inputLinesUsed: number;
  playgroundUrl: string | null;
}

async function call(name: string, args: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: args });
  const text = result.content.map((c) => (c.type === 'text' ? c.text : '')).join('\n');
  return { result, text, data: result.structuredContent as Structured };
}

const run = (code: string, extra: Record<string, unknown> = {}) =>
  call('run_asomiya', { code, ...extra });

describe('server', () => {
  it('introduces itself and tells the model how to use it', () => {
    expect(client.getServerVersion()).toMatchObject({
      name: 'asomiya',
      version: SERVER_VERSION,
      websiteUrl: 'https://asomiya.codes',
    });
    expect(client.getInstructions()).toContain(GUIDE_URI);
    expect(client.getInstructions()).toContain('run_asomiya');
  });

  it('lists five read-only tools with input and output schemas', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      'asomiya_to_python',
      'check_asomiya',
      'explain_error',
      'lookup_keyword',
      'run_asomiya',
    ]);
    for (const tool of tools) {
      expect(tool.title, tool.name).toBeTruthy();
      expect(tool.description, tool.name).toBeTruthy();
      expect(tool.outputSchema, tool.name).toBeDefined();
      expect(tool.annotations, tool.name).toMatchObject({
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      });
    }
    const runTool = tools.find((t) => t.name === 'run_asomiya');
    expect(runTool?._meta).toMatchObject({ ui: { resourceUri: VIEW_URI } });
  });

  it('keeps the version in step with the package', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'mcp/package.json'), 'utf8')) as {
      version: string;
      mcpName: string;
    };
    expect(pkg.version).toBe(SERVER_VERSION);
    const registry = JSON.parse(readFileSync(join(ROOT, 'mcp/server.json'), 'utf8')) as {
      name: string;
      version: string;
      packages: { identifier: string; version: string }[];
    };
    expect(registry.name).toBe(pkg.mcpName);
    expect(registry.version).toBe(SERVER_VERSION);
    expect(registry.packages[0]).toMatchObject({
      identifier: 'asomiya-mcp',
      version: SERVER_VERSION,
    });
    const bundle = JSON.parse(readFileSync(join(ROOT, 'mcp/manifest.json'), 'utf8')) as {
      version: string;
    };
    expect(bundle.version).toBe(SERVER_VERSION);
  });
});

describe('run_asomiya', () => {
  it('runs a program and returns its output', async () => {
    const { data, text, result } = await run('ধৰা ক = ১০\nকোৱা("ফল:", ক + ২০)');
    expect(result.isError).toBeFalsy();
    expect(data).toMatchObject({ ok: true, output: 'ফল: ৩০\n', error: null });
    expect(text).toContain('Output:\nফল: ৩০');
  });

  it('prints ASCII digits for programs in English letters, unless told otherwise', async () => {
    expect((await run('kowa(10 + 20)')).data.output).toBe('30\n');
    expect((await run('kowa(10 + 20)', { digits: 'assamese' })).data.output).toBe('৩০\n');
    expect((await run('কোৱা(১০)', { digits: 'ascii' })).data.output).toBe('10\n');
  });

  it('feeds input lines to সোধা, then খালী', async () => {
    const code = 'কোৱা(সোধা("নাম? "))\nকোৱা(সোধা() == খালী)';
    const { data } = await run(code, { input: ['ৰীতা'] });
    expect(data).toMatchObject({ ok: true, output: 'নাম? ৰীতা\nসঁচা\n', inputLinesUsed: 1 });
  });

  it('keeps the output printed before a runtime error', async () => {
    const { data, text } = await run('কোৱা("আগত")\nকোৱা(খ)');
    expect(data.ok).toBe(false);
    expect(data.output).toBe('আগত\n');
    expect(data.error).toMatchObject({ code: 'R001', phase: 'runtime', line: 2 });
    expect(text).toContain('Output before the error:\nআগত');
    expect(text).toContain('[R001]');
    expect(text).toContain('অসমীয়া:');
  });

  it('says a program with a syntax error did not run', async () => {
    const { data, text } = await run('প্ৰতিটো ক মাজত [১] { }');
    expect(data.error).toMatchObject({ code: 'P013', phase: 'parser' });
    expect(text).toContain('did not run');
    expect(text).not.toContain('Output before the error');
  });

  it('gives messages in Assamese when asked', async () => {
    const { data, text } = await run('কোৱা(খ)', { lang: 'as' });
    expect(data.error?.message).toBe(data.error?.messageAs);
    expect(text).toContain('চলোৱাৰ সময়ৰ ভুল [R001]');
    expect(text).toContain('English:');
  });

  it('stops an endless loop', async () => {
    const { data } = await run('যেতিয়ালৈকে (সঁচা) { }');
    expect(data.error?.code).toBe('R008');
  });

  it('cuts very long output', async () => {
    const code = 'ধৰা ক = ০\nযেতিয়ালৈকে (ক < ৫০০০) { কোৱা("অসমীয়া ভাষা"); ক = ক + ১ }';
    const { data, text } = await run(code);
    expect(data.ok).toBe(true);
    expect(data.outputTruncated).toBe(true);
    expect(data.output.length).toBeLessThanOrEqual(MAX_OUTPUT_LENGTH);
    expect(text).toContain('(output truncated)');
  });

  it('links to the same program in the playground', async () => {
    const code = 'কোৱা("নমস্কাৰ")';
    const { data } = await run(code);
    expect(data.playgroundUrl).toMatch(/^https:\/\/asomiya\.codes\/playground\/#code=/);
    expect(fromHash(new URL(data.playgroundUrl ?? '').hash)).toBe(code);
  });

  it('rejects programs that are too long', async () => {
    const result = await client
      .callTool({ name: 'run_asomiya', arguments: { code: 'ক'.repeat(100_001) } })
      .catch((error: unknown) => ({ isError: true, error }));
    expect(result.isError).toBe(true);
  });
});

describe('check_asomiya', () => {
  it('accepts a correct program', async () => {
    const { data, text } = await call('check_asomiya', { code: GUIDE_PROGRAM });
    expect(data).toMatchObject({ ok: true, error: null });
    expect(text).toBe('No syntax errors.');
  });

  it('reports the first syntax error with its position', async () => {
    const { data } = await call('check_asomiya', { code: 'ধৰা ক = ৫\nযদি (ক > ২ {\n}' });
    expect(data.ok).toBe(false);
    expect(data.error).toMatchObject({ code: 'P001', line: 2 });
  });

  it("doesn't run the program, so runtime errors pass", async () => {
    expect((await call('check_asomiya', { code: 'কোৱা(খ)' })).data.ok).toBe(true);
  });
});

describe('asomiya_to_python', () => {
  it('translates a program', async () => {
    const { result, text } = await call('asomiya_to_python', { code: GUIDE_PROGRAM });
    const python = (result.structuredContent as { python: string }).python;
    expect(python).toContain('print(');
    expect(text).toContain('```python');
    // The translation prints exactly what the interpreter prints.
    const py = spawnSync('python3', ['-c', python], { encoding: 'utf8' });
    if (py.error === undefined) expect(py.stdout).toBe(GUIDE_PROGRAM_OUTPUT);
  });

  it('reports errors instead of translating', async () => {
    const { result } = await call('asomiya_to_python', { code: 'ধৰা = ৫' });
    expect(result.structuredContent).toMatchObject({
      ok: false,
      python: null,
      error: { code: 'P008' },
    });
  });
});

describe('lookup_keyword', () => {
  const lookup = async (query: string) =>
    (await call('lookup_keyword', { query })).result.structuredContent as {
      matches: { kind: string; id: string; word: string }[];
    };

  it('finds a word in either script', async () => {
    for (const query of ['প্ৰতিটো', 'protito', 'pratito', 'forEach']) {
      expect(
        (await lookup(query)).matches.map((m) => m.id),
        query,
      ).toEqual(['forEach']);
    }
    expect((await lookup('নহ’লে')).matches[0]?.id).toBe('else');
  });

  it('finds built-ins and types by English meaning', async () => {
    expect((await lookup('length')).matches.map((m) => m.word)).toContain('দৈৰ্ঘ্য');
    expect((await lookup('list')).matches.map((m) => m.word)).toContain('তালিকা');
    expect((await lookup('xudha')).matches.map((m) => m.id)).toEqual(['input']);
  });

  it('lists everything for an empty query, and nothing for nonsense', async () => {
    expect((await lookup('')).matches.length).toBe(KEYWORD_GLOSSARY.length + 7 + 6);
    const none = await call('lookup_keyword', { query: 'zzzz' });
    expect((none.result.structuredContent as { matches: unknown[] }).matches).toEqual([]);
    expect(none.text).toContain('Nothing matches');
  });
});

describe('explain_error', () => {
  it('explains every error code', async () => {
    for (const code of Object.keys(MESSAGES)) {
      const { result } = await call('explain_error', { code: code.toLowerCase() });
      const e = result.structuredContent as Record<string, unknown>;
      expect(e, code).toMatchObject({ found: true, code });
      for (const field of ['messageAs', 'messageEn', 'example', 'fix']) {
        expect(String(e[field]), `${code} ${field}`).not.toBe('');
      }
    }
    expect(Object.keys(FIX_HINTS).sort()).toEqual(Object.keys(MESSAGES).sort());
  });

  it('lists the real codes for an unknown one', async () => {
    const { result, text } = await call('explain_error', { code: 'X999' });
    expect(result.structuredContent).toMatchObject({ found: false });
    expect(text).toContain('R021');
  });
});

describe('knowledge', () => {
  it('runs every code block in the guide without an error', () => {
    const blocks = [...guide().matchAll(/```asomiya\n([\s\S]*?)```/g)].map((m) => m[1] ?? '');
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    for (const block of blocks) expect(runSource(block).error?.message ?? null, block).toBeNull();
    expect(runSource(GUIDE_PROGRAM).output).toBe(GUIDE_PROGRAM_OUTPUT);
    expect(runSource(GUIDE_ROMAN_PROGRAM).output).toBe(GUIDE_ROMAN_OUTPUT);
    expect(guide()).toContain(GUIDE_PROGRAM_OUTPUT.trimEnd());
  });

  it('names every keyword and built-in in the guide', () => {
    const text = guide();
    for (const k of KEYWORD_GLOSSARY) {
      expect(text, k.id).toContain(`\`${k.word}\``);
      expect(text, k.id).toContain(`\`${k.roman[0] ?? ''}\``);
    }
  });

  it('has a working example for every keyword that uses that keyword', () => {
    for (const k of KEYWORD_GLOSSARY) {
      const example = KEYWORD_USAGE[k.id];
      const result = runSource(example);
      expect(result.error?.message ?? null, k.id).toBeNull();
      expect(result.output, k.id).not.toBe('');
      expect(
        tokenize(example).some((t) => t.lexeme === k.word),
        `${k.id} example uses ${k.word}`,
      ).toBe(true);
    }
  });
});

describe('resources', () => {
  it('serves the guide and every doc', async () => {
    const { resources } = await client.listResources();
    const uris = resources.map((r) => r.uri);
    expect(uris).toContain(GUIDE_URI);
    for (const uri of uris.filter((u) => u.startsWith('asomiya://docs/'))) {
      const { contents } = await client.readResource({ uri });
      expect((contents[0] as { text: string }).text.length, uri).toBeGreaterThan(500);
    }
    const docs = readdirSync(join(ROOT, 'docs')).filter((f) => f.endsWith('.md'));
    expect(uris.filter((u) => u.startsWith('asomiya://docs/')).length).toBe(docs.length);
  });

  it('serves every example program, and each one runs', async () => {
    const files = readdirSync(join(ROOT, 'examples')).filter((f) => f.endsWith('.asom'));
    expect(EXAMPLES.map((e) => e.file).sort()).toEqual(files.sort());
    for (const example of EXAMPLES) {
      const { contents } = await client.readResource({
        uri: `asomiya://examples/${example.name}`,
      });
      const source = (contents[0] as { text: string }).text;
      expect(source).toBe(readFileSync(join(ROOT, 'examples', example.file), 'utf8'));
      const { data } = await run(source, { input: [...example.input] });
      expect(data.error, example.file).toBeNull();
    }
    await expect(client.readResource({ uri: 'asomiya://examples/nope' })).rejects.toThrow();
  });

  it('completes example names', async () => {
    const { completion } = await client.complete({
      ref: { type: 'ref/resource', uri: 'asomiya://examples/{name}' },
      argument: { name: 'name', value: 'l' },
    });
    expect(completion.values.sort()).toEqual(['lists', 'loops']);
  });

  it('serves the playground view as one self-contained page', async () => {
    const { contents } = await client.readResource({ uri: VIEW_URI });
    const view = contents[0] as { text: string; mimeType: string };
    expect(view.mimeType).toBe('text/html;profile=mcp-app');
    expect(view.text).toMatch(/^<!doctype html>/);
    // No external scripts, styles or fonts: hosts sandbox the frame and block outside requests.
    expect(view.text).not.toMatch(/<(script|link|img)[^>]+(src|href)=/i);
    expect(view.text.match(/<\/script>/gi)?.length).toBe(1);
  });
});

describe('prompts', () => {
  it('builds a lesson and a translation request', async () => {
    const lesson = await client.getPrompt({
      name: 'teach_asomiya',
      arguments: { topic: 'for-each loops', language: 'Assamese' },
    });
    const text = (lesson.messages[0]?.content as { text: string }).text;
    expect(text).toContain('for-each loops');
    expect(text).toContain('in Assamese');
    expect(text).toContain(GUIDE_URI);

    const translation = await client.getPrompt({
      name: 'translate_to_asomiya',
      arguments: { program: 'print(1)', script: 'roman' },
    });
    expect((translation.messages[0]?.content as { text: string }).text).toContain('print(1)');
  });

  it('completes lesson topics', async () => {
    const { completion } = await client.complete({
      ref: { type: 'ref/prompt', name: 'teach_asomiya' },
      argument: { name: 'topic', value: 'f' },
    });
    expect(completion.values).toEqual(['first program', 'for-each loops', 'functions']);
  });
});

describe('asomiya-mcp command', () => {
  const bin = join(ROOT, 'mcp/dist/index.js');

  it('prints help and its version', () => {
    expect(execFileSync('node', [bin, '--version'], { encoding: 'utf8' })).toBe(
      `${SERVER_VERSION}\n`,
    );
    expect(execFileSync('node', [bin, '--help'], { encoding: 'utf8' })).toContain('npx');
  });

  it('serves MCP over stdio', async () => {
    const stdio = new Client({ name: 'stdio-test', version: '1.0.0' });
    await stdio.connect(
      new StdioClientTransport({ command: process.execPath, args: [bin], stderr: 'ignore' }),
    );
    try {
      const result = await stdio.callTool({
        name: 'run_asomiya',
        arguments: { code: 'প্ৰতিটো ক [১, ২] মাজত { কোৱা(ক * ২) }' },
      });
      expect(result.structuredContent).toMatchObject({ ok: true, output: '২\n৪\n' });
    } finally {
      await stdio.close();
    }
  });
});
