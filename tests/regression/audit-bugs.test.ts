import { describe, expect, it } from 'vitest';
import { LexerError } from '../../src/errors/lexer-error';
import { formatDiagnostic } from '../../src/errors/format';
import { tokenize } from '../../src/lexer/lexer';
import { MAX_LIST_LENGTH, MAX_TEXT_LENGTH } from '../../src/runtime/limits';
import { fail, failCode, run } from '../helpers';

/** Regression tests for the bugs found in the repository audit (docs/FINAL_AUDIT_REPORT.md). */

function lexCode(source: string) {
  try {
    tokenize(source);
  } catch (error) {
    if (error instanceof LexerError) return error.diagnostic.code;
    throw error;
  }
  return null;
}

describe('B1 — backslash at the end of a line is an unterminated string, not a bad escape', () => {
  it.each([
    ['at end of input', 'ধৰা ক = "অসম\\'],
    ['before \\n', 'ধৰা ক = "অসম\\\nকোৱা(১)'],
    ['before \\r\\n', 'ধৰা ক = "অসম\\\r\nকোৱা(১)'],
  ])('%s', (_label, source) => {
    expect(lexCode(source)).toBe('L002');
  });

  it('still reports a genuinely invalid escape as L004', () => {
    expect(lexCode('"\\q"')).toBe('L004');
  });
});

describe('B2/B3 — huge values fail with R019 instead of crashing the host', () => {
  it('stops text that keeps doubling', () => {
    const d = fail('ধৰা শ = "ক"\nযেতিয়ালৈকে (সঁচা) { শ = শ + শ }', {
      maxSteps: Infinity,
    }).diagnostic;
    expect(d.code).toBe('R019');
    expect(d.params).toEqual({ type: 'string', limit: MAX_TEXT_LENGTH });
  });

  it('stops a list that keeps doubling (previously: fatal heap out of memory)', () => {
    const d = fail('ধৰা ল = [১]\nযেতিয়ালৈকে (সঁচা) { ল = ল + ল }', {
      maxSteps: Infinity,
    }).diagnostic;
    expect(d).toMatchObject({ code: 'R019', params: { type: 'list', limit: MAX_LIST_LENGTH } });
  });

  it('stops সংযোজন at the list limit', () => {
    const d = fail('ধৰা ল = []\nযেতিয়ালৈকে (সঁচা) { সংযোজন(ল, ১) }', {
      maxSteps: Infinity,
    }).diagnostic;
    expect(d.code).toBe('R019');
  });

  it('stops printing a list whose display would be exponentially long', () => {
    const program =
      'ধৰা ল = [১]\nধৰা i = ০\nযেতিয়ালৈকে (i < ৪০) { ল = [ল, ল]; i = i + ১ }\nকোৱা(ল)';
    expect(failCode(program)).toBe('R019');
  });

  it('charges steps for comparing lists that share references', () => {
    const program = [
      'ধৰা ক = [১]',
      'ধৰা খ = [১]',
      'ধৰা i = ০',
      'যেতিয়ালৈকে (i < ৪০) { ক = [ক, ক]; খ = [খ, খ]; i = i + ১ }',
      'কোৱা(ক == খ)',
    ].join('\n');
    expect(failCode(program)).toBe('R008');
  });

  it('still allows ordinary string building', () => {
    const program =
      'ধৰা শ = ""\nধৰা i = ০\nযেতিয়ালৈকে (i < ২০০০) { শ = শ + "★"; i = i + ১ }\nকোৱা(দৈৰ্ঘ্য(শ))';
    expect(run(program)).toBe('২০০০\n');
  });
});

describe('B4 — built-ins can be shadowed but not overwritten', () => {
  it('rejects assignment to a built-in', () => {
    const d = fail('দৈৰ্ঘ্য = ৫').diagnostic;
    expect(d).toMatchObject({ code: 'R020', params: { name: 'দৈৰ্ঘ্য' } });
  });

  it('still allows shadowing with ধৰা', () => {
    expect(run('ধৰা দৈৰ্ঘ্য = ৫\nদৈৰ্ঘ্য = ৬\nকোৱা(দৈৰ্ঘ্য)')).toBe('৬\n');
  });
});

describe('B5 — lone carriage returns are line breaks', () => {
  it('runs a file with classic-Mac line endings', () => {
    expect(run('কোৱা(১)\rকোৱা(২)\r')).toBe('১\n২\n');
  });

  it('counts lines correctly for \\r, \\n and \\r\\n', () => {
    const { diagnostic } = fail('কোৱা(১)\rকোৱা(২)\r\nকোৱা(৩)\nকোৱা(ক)');
    expect(diagnostic.span.start.line).toBe(4);
  });

  it('shows the right source line in diagnostics', () => {
    const source = 'কোৱা(১)\rকোৱা(ক)';
    const { diagnostic } = fail(source);
    expect(formatDiagnostic(diagnostic, { lang: 'en', source })).toContain('2 | কোৱা(ক)');
  });

  it('ends a line comment at a lone \\r', () => {
    expect(run('// মন্তব্য\rকোৱা(১)')).toBe('১\n');
  });
});
