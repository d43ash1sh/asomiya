import { describe, expect, it } from 'vitest';
import { formatDiagnostic } from '../../src/errors/format';
import { MESSAGES } from '../../src/errors/messages';
import { fail } from '../helpers';

describe('message catalogue', () => {
  it('has a non-empty Assamese and English message for every code', () => {
    for (const [code, def] of Object.entries(MESSAGES)) {
      expect(typeof def.as, code).toBe('function');
      expect(typeof def.en, code).toBe('function');
    }
  });

  it('writes Assamese messages in Assamese script, with Assamese digits', () => {
    const { diagnostic } = fail('যেতিয়ালৈকে (সঁচা) { }', { maxSteps: 250 });
    const text = formatDiagnostic(diagnostic, { lang: 'as' });
    expect(text).toContain('২৫০টা পদক্ষেপৰ সীমা');
    expect(text).not.toMatch(/\b250\b/u);
  });
});

describe('formatDiagnostic', () => {
  it('shows the file, position, source line and a caret under the error', () => {
    const source = 'ধৰা ক = ৫\nকোৱা(ক + খ)';
    const { diagnostic } = fail(source);
    const text = formatDiagnostic(diagnostic, { lang: 'en', source, fileName: 'x.asom' });
    expect(text.split('\n')).toEqual([
      'runtime error [R001]: Undefined variable "খ" (declare it first with "ধৰা")',
      '  --> x.asom:2:10',
      '  |',
      '2 | কোৱা(ক + খ)',
      //   কো ৱা ( ক ␠ + ␠  → 7 grapheme clusters before খ
      '  |        ^',
    ]);
  });

  it('works without the source text', () => {
    const { diagnostic } = fail('কোৱা(১ / ০)');
    expect(formatDiagnostic(diagnostic, { lang: 'as' })).toBe(
      'চলোৱাৰ সময়ৰ ভুল [R004]: শূন্যৰে হৰণ কৰিব নোৱাৰি\n  --> <input>:1:8',
    );
  });
});
