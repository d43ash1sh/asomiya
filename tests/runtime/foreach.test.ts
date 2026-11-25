import { describe, expect, it } from 'vitest';
import { fail, failCode, lines, run, types } from '../helpers';

describe('প্ৰতিটো … মাজত (for-each)', () => {
  it('lexes in both scripts', () => {
    expect(types('প্ৰতিটো protito pratito protitu')).toEqual([
      'ForEach',
      'ForEach',
      'ForEach',
      'ForEach',
    ]);
    expect(types('মাজত majot majat maajot majhot')).toEqual(['In', 'In', 'In', 'In', 'In']);
    // Romanised keywords are lower-case only; `Majot` is an ordinary name.
    expect(types('Protito Majot')).toEqual(['Identifier', 'Identifier']);
  });

  it('runs the body once for each element, in order', () => {
    const source = 'ধৰা ফলবোৰ = ["আম", "কল", "লিচু"]\nপ্ৰতিটো ফল ফলবোৰ মাজত {\n    কোৱা(ফল)\n}';
    expect(run(source)).toBe('আম\nকল\nলিচু\n');
  });

  it('accepts the header in parentheses, any expression as the list, and English letters', () => {
    expect(run('প্ৰতিটো (ক [১, ২] + [৩] মাজত) { কোৱা(ক) }')).toBe('১\n২\n৩\n');
    expect(run('protito k [1, 2] majot { kowa(k * 10) }')).toBe('10\n20\n');
  });

  it('goes through text letter by letter (grapheme clusters)', () => {
    expect(lines('প্ৰতিটো আখৰ "অসমীয়া" মাজত { কোৱা(আখৰ) }')).toEqual(['অ', 'স', 'মী', 'য়া']);
    expect(run('প্ৰতিটো আখৰ "" মাজত { কোৱা(আখৰ) }')).toBe('');
  });

  it('does nothing for an empty list', () => {
    expect(run('প্ৰতিটো ক [] মাজত { কোৱা(ক) }\nকোৱা("শেষ")')).toBe('শেষ\n');
  });

  it('goes over the elements the list had when the loop started', () => {
    const source =
      'ধৰা ল = [১, ২]\nপ্ৰতিটো ক ল মাজত { সংযোজন(ল, ক * ১০); ল[১] = ৯৯; কোৱা(ক) }\nকোৱা(ল)';
    expect(lines(source)).toEqual(['১', '২', '[১, ৯৯, ১০, ২০]']);
  });

  it('works with ৰখা, আগবাঢ়া and ঘূৰাইদিয়া', () => {
    const loop = [
      'প্ৰতিটো ক [১, ২, ৩, ৪, ৫] মাজত {',
      '  যদি (ক == ২) { আগবাঢ়া }',
      '  যদি (ক == ৪) { ৰখা }',
      '  কোৱা(ক)',
      '}',
    ].join('\n');
    expect(run(loop)).toBe('১\n৩\n');
    const search = [
      'ফাংচন আছে(ল, ম) {',
      '  প্ৰতিটো ক ল মাজত { যদি (ক == ম) { ঘূৰাইদিয়া সঁচা } }',
      '  ঘূৰাইদিয়া মিছা',
      '}',
      'কোৱা(আছে([১, ২], ২), আছে([১, ২], ৩))',
    ].join('\n');
    expect(run(search)).toBe('সঁচা মিছা\n');
  });

  it('only breaks out of the innermost loop', () => {
    const source =
      'প্ৰতিটো ক [১, ২] মাজত { প্ৰতিটো খ [১, ২, ৩] মাজত { যদি (খ == ২) { ৰখা }\nকোৱা(ক, খ) } }';
    expect(run(source)).toBe('১ ১\n২ ১\n');
  });

  it('gives each iteration its own variable', () => {
    const source = [
      'ধৰা ফ = []',
      'প্ৰতিটো ক [১, ২, ৩] মাজত {',
      '  ফাংচন দেখুওৱা() { ঘূৰাইদিয়া ক }',
      '  সংযোজন(ফ, দেখুওৱা)',
      '}',
      'কোৱা(ফ[০](), ফ[১](), ফ[২]())',
    ].join('\n');
    expect(run(source)).toBe('১ ২ ৩\n');
  });

  it('keeps the variable inside the loop', () => {
    expect(run('ধৰা ক = "বাহিৰ"\nপ্ৰতিটো ক [১] মাজত { কোৱা(ক) }\nকোৱা(ক)')).toBe('১\nবাহিৰ\n');
    expect(failCode('প্ৰতিটো ক [১] মাজত { }\nকোৱা(ক)')).toBe('R001');
  });

  it('shares the scope with the body, like function parameters', () => {
    expect(failCode('প্ৰতিটো ক [১] মাজত { ধৰা ক = ২ }')).toBe('R002');
    expect(run('প্ৰতিটো ক [১] মাজত { ক = ক + ১; কোৱা(ক) }')).toBe('২\n');
  });

  it('reports looping over something that is not a list or text (R021)', () => {
    const { diagnostic, output } = fail('কোৱা("আগত")\nপ্ৰতিটো ক ১০ মাজত { কোৱা(ক) }');
    expect(diagnostic.code).toBe('R021');
    expect(diagnostic.span.start.line).toBe(2);
    expect(output).toBe('আগত\n');
    expect(failCode('প্ৰতিটো ক খালী মাজত { }')).toBe('R021');
  });

  it('explains when মাজত is written before the list (P013)', () => {
    const { error } = fail('ধৰা ল = [১]\nপ্ৰতিটো ক মাজত ল { কোৱা(ক) }');
    expect(error.diagnostic.code).toBe('P013');
    expect(error.message).toContain('প্ৰতিটো ক <list> মাজত');
  });

  it('reports a missing মাজত or a missing name', () => {
    expect(failCode('প্ৰতিটো ক [১] { কোৱা(ক) }')).toBe('P001');
    expect(failCode('প্ৰতিটো [১] মাজত { }')).toBe('P008');
  });

  it('counts steps, so a huge loop still stops', () => {
    expect(failCode('ধৰা ল = [১, ২, ৩, ৪]\nপ্ৰতিটো ক ল মাজত { }', { maxSteps: 4 })).toBe('R008');
  });

  it('makes প্ৰতিটো and মাজত reserved', () => {
    expect(failCode('ধৰা মাজত = ১')).toBe('P009');
    expect(failCode('ধৰা protito = ১')).toBe('P009');
  });
});
