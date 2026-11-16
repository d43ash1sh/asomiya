import { describe, expect, it } from 'vitest';
import { fail, failCode, lines, run } from '../helpers';

describe('functions', () => {
  it('runs the specification example', () => {
    const program =
      'ফাংচন যোগ(ক, খ) {\n    ঘূৰাইদিয়া ক + খ\n}\n\nধৰা ফলাফল = যোগ(১০, ২০)\nকোৱা(ফলাফল)\n';
    expect(run(program)).toBe('৩০\n');
  });

  it('returns খালী without an explicit value', () => {
    expect(lines('ফাংচন ক() { }\nফাংচন খ() { ঘূৰাইদিয়া }\nকোৱা(ক(), খ())')).toEqual(['খালী খালী']);
  });

  it('returns early from nested blocks and loops', () => {
    const program =
      'ফাংচন বিচাৰ(ল, x) {\n ধৰা i = ০\n যেতিয়ালৈকে (i < দৈৰ্ঘ্য(ল)) {\n  যদি (ল[i] == x) { ঘূৰাইদিয়া i }\n  i = i + ১\n }\n ঘূৰাইদিয়া -১\n}\nকোৱা(বিচাৰ([৫, ৬, ৭], ৬), বিচাৰ([৫], ৯))';
    expect(run(program)).toBe('১ -১\n');
  });

  it('checks the number of arguments', () => {
    const d = fail('ফাংচন যোগ(ক, খ) { ঘূৰাইদিয়া ক + খ }\nযোগ(১)').diagnostic;
    expect(d.code).toBe('R006');
    expect(d.params).toEqual({ name: 'যোগ', min: 2, max: 2, got: 1 });
  });

  it('rejects calling a non-function', () => {
    expect(failCode('ধৰা ক = ৫\nক()')).toBe('R005');
    expect(failCode('"ক"()')).toBe('R005');
  });

  it('treats functions as values', () => {
    const program =
      'ফাংচন প্ৰয়োগ(ফ, x) { ঘূৰাইদিয়া ফ(x) }\nফাংচন বৰ্গ(x) { ঘূৰাইদিয়া x * x }\nকোৱা(প্ৰয়োগ(বৰ্গ, ৯))\nকোৱা(বৰ্গ)';
    expect(lines(program)).toEqual(['৮১', '<ফাংচন বৰ্গ>']);
  });
});

describe('local environments and closures', () => {
  it('keeps parameters and locals private to each call', () => {
    expect(failCode('ফাংচন ফ(ক) { ধৰা খ = ক }\nফ(১)\nকোৱা(খ)')).toBe('R001');
    expect(failCode('ফাংচন ফ(ক) { }\nফ(১)\nকোৱা(ক)')).toBe('R001');
  });

  it('uses lexical (not dynamic) scope', () => {
    const program =
      'ধৰা x = "বিশ্বব্যাপী"\nফাংচন দেখুওৱা() { ঘূৰাইদিয়া x }\nফাংচন পৰীক্ষা() { ধৰা x = "স্থানীয়"\n ঘূৰাইদিয়া দেখুওৱা() }\nকোৱা(পৰীক্ষা())';
    expect(run(program)).toBe('বিশ্বব্যাপী\n');
  });

  it('captures variables in closures, independently per closure', () => {
    const program = [
      'ফাংচন গণক() {',
      '  ধৰা ন = ০',
      '  ফাংচন বঢ়োৱা() { ন = ন + ১\n ঘূৰাইদিয়া ন }',
      '  ঘূৰাইদিয়া বঢ়োৱা',
      '}',
      'ধৰা ক = গণক()',
      'ধৰা খ = গণক()',
      'ক(); ক()',
      'কোৱা(ক(), খ())',
    ].join('\n');
    expect(run(program)).toBe('৩ ১\n');
  });

  it('allows mutual recursion once both functions are declared', () => {
    const program = [
      'ফাংচন যুগ্ম(ন) { যদি (ন == ০) { ঘূৰাইদিয়া সঁচা }\n ঘূৰাইদিয়া অযুগ্ম(ন - ১) }',
      'ফাংচন অযুগ্ম(ন) { যদি (ন == ০) { ঘূৰাইদিয়া মিছা }\n ঘূৰাইদিয়া যুগ্ম(ন - ১) }',
      'কোৱা(যুগ্ম(১০), অযুগ্ম(৭))',
    ].join('\n');
    expect(run(program)).toBe('সঁচা সঁচা\n');
  });
});

describe('recursion', () => {
  it('computes factorial and fibonacci', () => {
    const program = [
      'ফাংচন কাৰক(ন) { যদি (ন <= ১) { ঘূৰাইদিয়া ১ }\n ঘূৰাইদিয়া ন * কাৰক(ন - ১) }',
      'ফাংচন ফিব(ন) { যদি (ন < ২) { ঘূৰাইদিয়া ন }\n ঘূৰাইদিয়া ফিব(ন - ১) + ফিব(ন - ২) }',
      'কোৱা(কাৰক(১০), ফিব(২০))',
    ].join('\n');
    expect(run(program)).toBe('৩৬২৮৮০০ ৬৭৬৫\n');
  });

  it('supports recursion up to the default depth', () => {
    const program =
      'ফাংচন গভীৰ(ন) { যদি (ন == ০) { ঘূৰাইদিয়া ০ }\n ঘূৰাইদিয়া ১ + গভীৰ(ন - ১) }\nকোৱা(গভীৰ(৪৯৯))';
    expect(run(program)).toBe('৪৯৯\n');
  });

  it('stops runaway recursion with R009', () => {
    const d = fail('ফাংচন অসীম(ন) { ঘূৰাইদিয়া অসীম(ন + ১) }\nঅসীম(০)').diagnostic;
    expect(d.code).toBe('R009');
    expect(d.params).toEqual({ limit: 500 });
  });

  it('honours a custom depth limit', () => {
    expect(failCode('ফাংচন ফ(ন) { ঘূৰাইদিয়া ফ(ন) }\nফ(০)', { maxCallDepth: 10 })).toBe('R009');
  });

  it('reports host stack exhaustion as R018 instead of crashing', () => {
    const program = 'ফাংচন ফ(ন) { ঘূৰাইদিয়া ফ(ন + ১) }\nফ(০)';
    expect(failCode(program, { maxCallDepth: 1_000_000, maxSteps: Infinity })).toBe('R018');
  });
});
