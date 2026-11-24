import { describe, expect, it } from 'vitest';
import { fail, failCode, lines, run } from '../helpers';

const value = (expression: string) => run(`কোৱা(${expression})`).trimEnd();

describe('arithmetic', () => {
  it.each([
    ['২ + ৩', '৫'],
    ['১০ - ৪', '৬'],
    ['৬ * ৭', '৪২'],
    ['৭ / ২', '৩.৫'],
    ['১৭ % ৫', '২'],
    ['-১৭ % ৫', '-২'],
    ['২ + ৩ * ৪', '১৪'],
    ['(২ + ৩) * ৪', '২০'],
    ['১০ - ৪ - ৩', '৩'],
    ['১০০ / ১০ / ২', '৫'],
    ['-৩ * -৩', '৯'],
    ['০.৫ + ০.২৫', '০.৭৫'],
    ['1.5 * 2', '৩'],
    ['-০', '০'],
  ])('%s = %s', (expression, expected) => {
    expect(value(expression)).toBe(expected);
  });

  it('reports division and modulo by zero', () => {
    expect(failCode('কোৱা(১ / ০)')).toBe('R004');
    expect(failCode('কোৱা(১ % ০)')).toBe('R004');
  });

  it('rejects arithmetic on non-numbers', () => {
    const d = fail('কোৱা("ক" - ১)').diagnostic;
    expect(d.code).toBe('R003');
    expect(d.params).toEqual({ op: '-', left: 'string', right: 'number' });
    expect(failCode('কোৱা(সঁচা * ২)')).toBe('R003');
    expect(failCode('কোৱা(খালী + ১)')).toBe('R003');
    expect(failCode('কোৱা(-"ক")')).toBe('R013');
  });

  it('displays very large and fractional results', () => {
    expect(value('১০০০০০০ * ১০০০০০০')).toBe('১০০০০০০০০০০০০');
    expect(value('১ / ৩')).toBe('০.৩৩৩৩৩৩৩৩৩৩৩৩৩৩৩৩');
  });
});

describe('strings', () => {
  it('concatenates text with text and with other values', () => {
    expect(value('"নমস্কাৰ, " + "অসম"')).toBe('নমস্কাৰ, অসম');
    expect(value('"বয়স " + ২৪')).toBe('বয়স ২৪');
    expect(value('২৪ + " বছৰ"')).toBe('২৪ বছৰ');
    expect(value('"মান: " + সঁচা')).toBe('মান: সঁচা');
    expect(value('"মান: " + খালী')).toBe('মান: খালী');
    expect(value('"তালিকা: " + [১, "ক"]')).toBe('তালিকা: [১, "ক"]');
  });

  it('compares text', () => {
    expect(value('"ক" == "ক"')).toBe('সঁচা');
    expect(value('"ক" < "খ"')).toBe('সঁচা');
    expect(value('"abc" > "abd"')).toBe('মিছা');
  });

  it('does not coerce text to numbers in comparisons', () => {
    expect(value('১ == "১"')).toBe('মিছা');
    expect(failCode('কোৱা(১ < "২")')).toBe('R003');
  });
});

describe('booleans and logic', () => {
  it.each([
    ['সঁচা আৰু সঁচা', 'সঁচা'],
    ['সঁচা আৰু মিছা', 'মিছা'],
    ['মিছা বা সঁচা', 'সঁচা'],
    ['মিছা || মিছা', 'মিছা'],
    ['সঁচা && !মিছা', 'সঁচা'],
    ['!(১ > ২)', 'সঁচা'],
    ['নহয় সঁচা', 'মিছা'],
    ['নহয় মিছা', 'সঁচা'],
    ['নহয় নহয় সঁচা', 'সঁচা'],
    ['নহয় (১ > ২)', 'সঁচা'],
    ['সঁচা আৰু নহয় মিছা', 'সঁচা'],
    ['nohoy xosa', 'misa'],
    ['nohoy misa', 'xosa'],
    ['খালী == খালী', 'সঁচা'],
    ['খালী == মিছা', 'মিছা'],
    ['৩ >= ৩', 'সঁচা'],
    ['৩ <= ২', 'মিছা'],
    ['৩ != ৪', 'সঁচা'],
  ])('%s → %s', (expression, expected) => {
    expect(value(expression)).toBe(expected);
  });

  it('short-circuits', () => {
    // The right side would fail (undefined variable) if it were evaluated.
    expect(value('মিছা আৰু অজ্ঞাত')).toBe('মিছা');
    expect(value('সঁচা বা অজ্ঞাত')).toBe('সঁচা');
  });

  it('requires boolean operands for logical operators', () => {
    const d = fail('কোৱা(১ আৰু সঁচা)').diagnostic;
    expect(d.code).toBe('R017');
    expect(d.params).toEqual({ op: 'আৰু', type: 'number' });
    expect(failCode('কোৱা(মিছা || "ক")')).toBe('R017');
    expect(failCode('কোৱা(!১)')).toBe('R013');
    expect(failCode('কোৱা(নহয় ১)')).toBe('R013');
    expect(failCode('kowa(nohoy 1)')).toBe('R013');
  });
});

describe('lists', () => {
  it('creates, indexes, updates and appends', () => {
    expect(
      lines(
        'ধৰা ল = [১০, ২০, ৩০]\nকোৱা(ল[০], ল[২])\nল[১] = "দুই"\nসংযোজন(ল, সঁচা)\nকোৱা(ল, দৈৰ্ঘ্য(ল))',
      ),
    ).toEqual(['১০ ৩০', '[১০, "দুই", ৩০, সঁচা] ৪']);
  });

  it('shares lists by reference', () => {
    expect(run('ধৰা ক = [১]\nধৰা খ = ক\nসংযোজন(খ, ২)\nকোৱা(ক)')).toBe('[১, ২]\n');
  });

  it('compares lists structurally', () => {
    expect(value('[১, [২, "ক"]] == [১, [২, "ক"]]')).toBe('সঁচা');
    expect(value('[১, ২] == [২, ১]')).toBe('মিছা');
    expect(value('[১] + [২, ৩]')).toBe('[১, ২, ৩]');
  });

  it('handles self-referencing lists without hanging', () => {
    expect(run('ধৰা ল = [১]\nসংযোজন(ল, ল)\nকোৱা(ল)\nকোৱা(ল == ল)')).toBe('[১, […]]\nসঁচা\n');
  });

  it('reports bad indexes', () => {
    expect(failCode('কোৱা([১, ২][২])')).toBe('R010');
    expect(failCode('কোৱা([১, ২][-১])')).toBe('R010');
    expect(failCode('কোৱা([১, ২][০.৫])')).toBe('R011');
    expect(failCode('কোৱা([১, ২]["০"])')).toBe('R011');
    expect(failCode('কোৱা(৫[০])')).toBe('R012');
    expect(failCode('ধৰা শ = "ক"\nশ[০] = "খ"')).toBe('R016');
  });
});

describe('evaluation order', () => {
  it('evaluates operands and arguments left to right', () => {
    const program = [
      'ধৰা লগ = []',
      'ফাংচন চিন(x) { সংযোজন(লগ, x)\n ঘূৰাইদিয়া x }',
      'ধৰা ফল = চিন(১) + চিন(২) * চিন(৩)',
      'ফাংচন তিনি(ক, খ, গ) { ঘূৰাইদিয়া খালী }',
      'তিনি(চিন(৪), চিন(৫), চিন(৬))',
      'কোৱা(লগ, ফল)',
    ].join('\n');
    expect(run(program)).toBe('[১, ২, ৩, ৪, ৫, ৬] ৭\n');
  });
});
