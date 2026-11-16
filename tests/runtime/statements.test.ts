import { describe, expect, it } from 'vitest';
import { fail, failCode, lines, run } from '../helpers';

describe('print', () => {
  it('joins arguments with spaces and ends with a newline', () => {
    expect(run('কোৱা("ক", ১, সঁচা, খালী)')).toBe('ক ১ সঁচা খালী\n');
    expect(run('কোৱা()')).toBe('\n');
  });
});

describe('variables', () => {
  it('declares, reads and reassigns', () => {
    expect(lines('ধৰা ক = ১\nকোৱা(ক)\nক = ক + ১\nকোৱা(ক)')).toEqual(['১', '২']);
  });

  it('defaults to খালী without an initialiser', () => {
    expect(run('ধৰা ক\nকোৱা(ক)')).toBe('খালী\n');
  });

  it('treats assignment as an expression', () => {
    expect(run('ধৰা ক\nধৰা খ\nক = খ = ৭\nকোৱা(ক, খ)')).toBe('৭ ৭\n');
  });

  it('reports undefined variables on read and on assignment', () => {
    const d = fail('কোৱা(অজ্ঞাত)').diagnostic;
    expect(d.code).toBe('R001');
    expect(d.params).toEqual({ name: 'অজ্ঞাত' });
    expect(failCode('অজ্ঞাত = ৫')).toBe('R001');
  });

  it('rejects re-declaration in the same scope', () => {
    expect(failCode('ধৰা ক = ১\nধৰা ক = ২')).toBe('R002');
  });
});

describe('block scoping', () => {
  it('lets an inner block shadow an outer variable', () => {
    expect(lines('ধৰা ক = "বাহিৰ"\n{\n ধৰা ক = "ভিতৰ"\n কোৱা(ক)\n}\nকোৱা(ক)')).toEqual([
      'ভিতৰ',
      'বাহিৰ',
    ]);
  });

  it('assigns through to the enclosing scope', () => {
    expect(run('ধৰা ক = ১\n{ ক = ২ }\nকোৱা(ক)')).toBe('২\n');
  });

  it('does not leak block-local variables', () => {
    expect(failCode('যদি (সঁচা) { ধৰা ভিতৰৰ = ১ }\nকোৱা(ভিতৰৰ)')).toBe('R001');
    expect(failCode('যেতিয়ালৈকে (মিছা) { }\n{ ধৰা খ = ১ }\nকোৱা(খ)')).toBe('R001');
  });

  it('gives each loop iteration a fresh scope', () => {
    const program = 'ধৰা i = ০\nযেতিয়ালৈকে (i < ৩) { ধৰা চ = i * ২\n কোৱা(চ)\n i = i + ১ }';
    expect(lines(program)).toEqual(['০', '২', '৪']);
  });

  it('lets a program shadow a built-in', () => {
    expect(run('ধৰা দৈৰ্ঘ্য = ৫\nকোৱা(দৈৰ্ঘ্য)')).toBe('৫\n');
  });
});

describe('conditionals', () => {
  const grade = (n: number) =>
    run(
      `ধৰা ন = ${n}\nযদি (ন >= ৯০) { কোৱা("ক") } নহ'লে যদি (ন >= ৬০) { কোৱা("খ") } নহ'লে { কোৱা("গ") }`,
    ).trimEnd();

  it('takes the right branch of an else-if chain', () => {
    expect([grade(95), grade(70), grade(10)]).toEqual(['ক', 'খ', 'গ']);
  });

  it('supports nesting', () => {
    const program =
      'ধৰা ক = ৫\nযদি (ক > ০) {\n যদি (ক % ২ == ০) { কোৱা("যুগ্ম") } নহ\'লে { কোৱা("অযুগ্ম") }\n}';
    expect(run(program)).toBe('অযুগ্ম\n');
  });

  it('requires a boolean condition (no truthiness)', () => {
    for (const cond of ['১', '০', '"ক"', 'খালী', '[]']) {
      expect(failCode(`যদি (${cond}) { }`), cond).toBe('R007');
    }
  });
});

describe('loops', () => {
  it('runs while the condition holds', () => {
    expect(
      run('ধৰা ক = ০\nধৰা যোগ = ০\nযেতিয়ালৈকে (ক < ১০০) { ক = ক + ১; যোগ = যোগ + ক }\nকোৱা(যোগ)'),
    ).toBe('৫০৫০\n');
  });

  it('never runs the body when the condition starts false', () => {
    expect(run('যেতিয়ালৈকে (মিছা) { কোৱা("না") }\nকোৱা("শেষ")')).toBe('শেষ\n');
  });

  it('breaks out of the innermost loop only', () => {
    const program = [
      'ধৰা i = ০',
      'যেতিয়ালৈকে (i < ৩) {',
      '  ধৰা j = ০',
      '  যেতিয়ালৈকে (সঁচা) {',
      '    যদি (j == ২) { ৰখা }',
      '    j = j + ১',
      '  }',
      '  কোৱা(i, j)',
      '  i = i + ১',
      '}',
    ].join('\n');
    expect(lines(program)).toEqual(['০ ২', '১ ২', '২ ২']);
  });

  it('requires a boolean condition', () => {
    expect(failCode('যেতিয়ালৈকে (১) { ৰখা }')).toBe('R007');
  });
});

describe('infinite-loop protection', () => {
  it('stops an infinite loop with R008', () => {
    const { diagnostic } = fail('যেতিয়ালৈকে (সঁচা) { }', { maxSteps: 10_000 });
    expect(diagnostic.code).toBe('R008');
    expect(diagnostic.params).toEqual({ limit: 10_000 });
  });

  it('keeps the output printed before the limit was hit', () => {
    const { output } = fail(
      'ধৰা ক = ০\nযেতিয়ালৈকে (সঁচা) { ক = ক + ১\n যদি (ক <= ২) { কোৱা(ক) } }',
      {
        maxSteps: 1000,
      },
    );
    expect(output).toBe('১\n২\n');
  });

  it('stops with the default budget too', () => {
    expect(failCode('যেতিয়ালৈকে (সঁচা) { }')).toBe('R008');
  });

  it('allows an unlimited budget', () => {
    expect(
      run('ধৰা ক = ০\nযেতিয়ালৈকে (ক < ১০০০) { ক = ক + ১ }\nকোৱা(ক)', { maxSteps: Infinity }),
    ).toBe('১০০০\n');
  });
});
