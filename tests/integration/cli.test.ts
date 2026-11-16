import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '../..');
const CLI = join(ROOT, 'dist/cli.js');

function cli(args: string[], input = '') {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    cwd: ROOT,
    input,
    encoding: 'utf8',
  });
  return { stdout: result.stdout, stderr: result.stderr, status: result.status };
}

function tempProgram(source: string | Buffer): string {
  const dir = mkdtempSync(join(tmpdir(), 'asomiya-'));
  const file = join(dir, 'program.asom');
  writeFileSync(file, source);
  return file;
}

const EXPECTED: Record<string, string> = {
  'hello.asom': 'নমস্কাৰ, দেবাশীষ\nমোৰ বয়স ২৪\nমই এজন প্ৰাপ্তবয়স্ক\n',
  'functions.asom': '৩০\n৫! = ১২০\nফিবোনাচি(১৫) = ৬১০\n২০\nগণক: ৩\n',
  'variables.asom': [
    'গুৱাহাটী পাঠ',
    '১১২৮০০০ সংখ্যা',
    'মিছা সঁচা-মিছা',
    'খালী খালী',
    'গুৱাহাটীৰ কাষেৰে বৈ যায় ব্ৰহ্মপুত্ৰ',
    'বছৰ: ২০২৪',
    '৩',
    'ভিতৰ',
    'বাহিৰ',
    '',
  ].join('\n'),
  'conditionals.asom': '৯৫ → ক\n৮০ → খ\n৬৫ → গ\n৪০ → ঘ\nতিতিব লাগিব!\nঘৰতে থাকোঁ\n২০২৪ অধিবৰ্ষ\n',
  'loops.asom': [
    '১ৰ পৰা ১০লৈ যোগফল: ৫৫',
    'যিটো সংখ্যাৰ বৰ্গ ৫০তকৈ বেছি: ৮',
    '৭ × ১ = ৭',
    '৭ × ২ = ১৪',
    '৭ × ৩ = ২১',
    '৭ × ৪ = ২৮',
    '৭ × ৫ = ৩৫',
    '★',
    '★★',
    '★★★',
    '★★★★',
    '',
  ].join('\n'),
  'arithmetic.asom': [
    '১৪',
    '২০',
    '৩',
    '৩.৫',
    '২',
    '৯',
    '৩',
    '০.৩০০০০০০০০০০০০০০০৪',
    'সঁচা মিছা সঁচা মিছা',
    '৫০',
    '৪২৮',
    'খালী',
    '',
  ].join('\n'),
  'lists.asom': [
    '["আম", "কল", "লিচু"]',
    'প্ৰথম ফল: আম',
    'ফলৰ সংখ্যা: ৩',
    '["আম", "আনাৰস", "লিচু", "কঁঠাল"]',
    'সৰ্বোচ্চ: ৯',
    '["প্ৰা", "প্ত", "ব", "য়", "স্ক"]',
    '',
  ].join('\n'),
};

describe('running the example programs', () => {
  it.each(Object.entries(EXPECTED))('%s', (file, expected) => {
    const result = cli(['run', `examples/${file}`]);
    expect(result.stderr).toBe('');
    expect(result.stdout).toBe(expected);
    expect(result.status).toBe(0);
  });

  it('greet.asom reads from standard input', () => {
    const result = cli(['run', 'examples/greet.asom'], 'দেবাশীষ\n');
    expect(result.stdout).toBe('আপোনাৰ নাম কি? নমস্কাৰ, দেবাশীষ!\n');
    expect(result.status).toBe(0);
  });

  it('greet.asom handles end of input', () => {
    const result = cli(['run', 'examples/greet.asom'], '');
    expect(result.stdout).toBe("আপোনাৰ নাম কি? কোনো নাম দিয়া নহ'ল\n");
  });
});

describe('options', () => {
  it('--ascii-digits prints 0-9', () => {
    const result = cli(['run', 'examples/hello.asom', '--ascii-digits']);
    expect(result.stdout).toContain('মোৰ বয়স 24');
  });

  it('--max-steps stops long programs', () => {
    const file = tempProgram('যেতিয়ালৈকে (সঁচা) { }\n');
    const result = cli(['run', file, '--max-steps', '1000']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('[R008]');
  });

  it('rejects an invalid --max-steps value', () => {
    const result = cli(['run', 'examples/hello.asom', '--max-steps', 'abc']);
    expect(result.status).toBe(2);
  });

  it('--version and --help', () => {
    expect(cli(['--version']).stdout.trim()).toBe('0.1.0');
    const help = cli(['--help']);
    expect(help.status).toBe(0);
    expect(help.stdout).toContain('run');
  });
});

describe('errors and exit codes', () => {
  it('reports a runtime error in Assamese with location and exit code 1', () => {
    const file = tempProgram('ধৰা ক = ৫\nকোৱা(ক + খ)\n');
    const result = cli(['run', file]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('চলোৱাৰ সময়ৰ ভুল [R001]');
    expect(result.stderr).toContain('"খ" নামৰ কোনো চলক ঘোষণা কৰা হোৱা নাই');
    expect(result.stderr).toContain(`${file}:2:10`);
    expect(result.stderr).toContain('কোৱা(ক + খ)');
  });

  it('keeps output printed before a runtime error', () => {
    const file = tempProgram('কোৱা("আগতে")\nকোৱা(১ / ০)\n');
    const result = cli(['run', file]);
    expect(result.stdout).toBe('আগতে\n');
    expect(result.stderr).toContain('[R004]');
    expect(result.status).toBe(1);
  });

  it('reports a syntax error and runs nothing', () => {
    const file = tempProgram('কোৱা("আগতে")\nধৰা = ৫\n');
    const result = cli(['run', file]);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('বাক্য-গঠনৰ ভুল [P008]');
    expect(result.status).toBe(1);
  });

  it('can report errors in English', () => {
    const file = tempProgram('কোৱা(১ / ০)\n');
    const result = cli(['run', file, '--lang', 'en']);
    expect(result.stderr).toContain('runtime error [R004]: Division by zero');
  });

  it('exits 2 for a missing file', () => {
    const result = cli(['run', 'nope/missing.asom']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("ফাইল পোৱা নগ'ল");
  });

  it('exits 2 for a directory', () => {
    const result = cli(['run', 'examples']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('ফাইল নহয়');
  });

  it('exits 2 for a file that is not valid UTF-8', () => {
    const file = tempProgram(Buffer.from([0x6b, 0xff, 0xfe, 0x0a]));
    const result = cli(['run', file]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('UTF-8');
  });

  it('exits 2 for unknown options and missing arguments', () => {
    expect(cli(['run']).status).toBe(2);
    expect(cli(['run', 'examples/hello.asom', '--bogus']).status).toBe(2);
  });
});

describe('REPL over a pipe', () => {
  it('evaluates lines, keeps state and handles multi-line input', () => {
    const input = ['ধৰা ক = ২', 'ক * ২১', 'যদি (ক > ১) {', '  কোৱা("ডাঙৰ")', '}', '.exit', ''].join(
      '\n',
    );
    const result = cli([], input);
    expect(result.stdout).toContain('৪২');
    expect(result.stdout).toContain('ডাঙৰ');
    expect(result.status).toBe(0);
  });
});
