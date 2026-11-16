import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Drives the REPL through a real pseudo-terminal, typing one keystroke at a time, the way a
 * person would. This is the only way to see what readline-style line editors do to the screen.
 */
const ROOT = resolve(import.meta.dirname, '../..');
const DRIVER = join(ROOT, 'tests/fixtures/pty-driver.py');
const CLI = join(ROOT, 'dist/cli.js');

const python = spawnSync('python3', ['-c', 'import pty'], { encoding: 'utf8' });
const canRun = process.platform !== 'win32' && python.status === 0;

function typeIntoRepl(lines: string[], columns = 80): string {
  const result = spawnSync('python3', [DRIVER, String(columns), process.execPath, CLI], {
    input: lines.join('\n') + '\n',
    encoding: 'utf8',
    timeout: 30_000,
  });
  return result.stdout;
}

/** CSI escape sequences (cursor moves, line clears) — the redraws that corrupted the screen. */
const CONTROL_SEQUENCE = new RegExp(String.raw`\x1b\[[0-9;]*[A-Za-z]`, 'u');

describe.skipIf(!canRun)('REPL in a real terminal', () => {
  it('prints the output of a statement immediately', () => {
    const screen = typeIntoRepl(['কোৱা("নমস্কাৰ পৃথিৱী!")', '.প্ৰস্থান']);
    expect(screen).toContain('অসমীয়া> ');
    expect(screen).toContain('নমস্কাৰ পৃথিৱী!\r\n');
    expect(screen).toContain('বিদায়!');
  });

  it('never redraws the line, even when Assamese input wraps a narrow terminal', () => {
    // Regression: Node's readline redrew wrapped lines with "\x1b[1G\x1b[0J" using column
    // arithmetic that does not match how terminals draw Assamese, erasing the prompt/output.
    const screen = typeIntoRepl(['কোৱা("নমস্কাৰ পৃথিৱী! এইটো এটা দীঘল শাৰী")', '.exit'], 20);
    expect(screen).toContain('নমস্কাৰ পৃথিৱী! এইটো এটা দীঘল শাৰী\r\n');
    expect(screen).not.toMatch(CONTROL_SEQUENCE);
  });

  it('runs multi-line blocks, shows errors, and reads input with সোধা', () => {
    const screen = typeIntoRepl([
      'যদি (সঁচা) {',
      'কোৱা("ভিতৰ")',
      '}',
      'ধৰা নাম = সোধা("নাম? ")',
      'দেবাশীষ',
      'কোৱা("নমস্কাৰ, " + নাম)',
      'কোৱা(১ / ০)',
      '.exit',
    ]);
    expect(screen).toContain('   ...> ');
    expect(screen).toContain('ভিতৰ\r\n');
    expect(screen).toContain('নাম? ');
    expect(screen).toContain('নমস্কাৰ, দেবাশীষ\r\n');
    expect(screen).toContain('[R004]');
  });
});
