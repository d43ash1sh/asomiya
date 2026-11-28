import { describe, expect, it } from 'vitest';
import { Interpreter } from '../../src/runtime/interpreter';
import { parse } from '../../src/parser/parser';
import { fail, failCode, lines, run } from '../helpers';

describe('built-in functions', () => {
  it('দৈৰ্ঘ্য — length of text and lists', () => {
    expect(lines('কোৱা(দৈৰ্ঘ্য("অসম"))\nকোৱা(দৈৰ্ঘ্য([]))\nকোৱা(দৈৰ্ঘ্য(""))')).toEqual(['৩', '০', '০']);
    const d = fail('দৈৰ্ঘ্য(৫)').diagnostic;
    expect(d.code).toBe('R014');
    expect(d.params).toMatchObject({ expected: ['string', 'list'], got: 'number', position: 1 });
  });

  it('প্ৰকাৰ — type names', () => {
    expect(
      run('কোৱা(প্ৰকাৰ(১), প্ৰকাৰ("ক"), প্ৰকাৰ(সঁচা), প্ৰকাৰ(খালী), প্ৰকাৰ([]), প্ৰকাৰ(প্ৰকাৰ))'),
    ).toBe('সংখ্যা পাঠ সঁচা-মিছা খালী তালিকা ফাংচন\n');
  });

  it('পাঠ and সংখ্যা — conversions', () => {
    expect(
      lines('কোৱা(পাঠ(১২) + "৩")\nকোৱা(সংখ্যা(" ৭ ") * ২)\nকোৱা(সংখ্যা(৫))\nকোৱা(সংখ্যা("১২ক"))'),
    ).toEqual(['১২৩', '১৪', '৫', 'খালী']);
    expect(failCode('সংখ্যা(সঁচা)')).toBe('R014');
  });

  it('পূৰ্ণাংক — truncates toward zero', () => {
    expect(run('কোৱা(পূৰ্ণাংক(৭.৯), পূৰ্ণাংক(-৭.৯), পূৰ্ণাংক(-০.৫))')).toBe('৭ -৭ ০\n');
  });

  it('পৰমমান, আসন্ন, সৰ্বোচ্চ, সৰ্বনিম্ন — maths helpers', () => {
    expect(run('কোৱা(পৰমমান(-১২.৫), পৰমমান(০), পৰমমান(-০))')).toBe('১২.৫ ০ ০\n');
    expect(run('কোৱা(আসন্ন(২.৫), আসন্ন(২.৪), আসন্ন(-০.৫), আসন্ন(-২.৬))')).toBe('৩ ২ ০ -৩\n');
    expect(run('কোৱা(সৰ্বোচ্চ(৩, ৯, ১, ৭), সৰ্বনিম্ন(৩, ৯, ১, -৪))')).toBe('৯ -৪\n');
    expect(failCode('পৰমমান("ক")')).toBe('R014');
    expect(failCode('আসন্ন(সঁচা)')).toBe('R014');
    expect(failCode('সৰ্বোচ্চ(১)')).toBe('R006');
    expect(failCode('সৰ্বনিম্ন(১, "২")')).toBe('R014');
  });

  it('সংযোজন — requires a list', () => {
    expect(failCode('সংযোজন("ক", ১)')).toBe('R014');
  });

  it('checks built-in arity', () => {
    const d = fail('দৈৰ্ঘ্য()').diagnostic;
    expect(d.code).toBe('R006');
    expect(failCode('সোধা(১, ২)', { readLine: () => '' })).toBe('R006');
  });

  it('সোধা — reads lines from the host and returns খালী at end of input', () => {
    const input = ['দেবাশীষ'];
    let written = '';
    const interpreter = new Interpreter({
      write: (t) => (written += t),
      readLine: () => input.shift() ?? null,
    });
    interpreter.run(parse('ধৰা ক = সোধা("নাম? ")\nধৰা খ = সোধা()\nকোৱা(ক, খ)'));
    expect(written).toBe('নাম? দেবাশীষ খালী\n');
  });

  it('সোধা — fails cleanly when the host provides no input', () => {
    expect(failCode('সোধা()')).toBe('R015');
  });
});

describe('isolation', () => {
  it('exposes no host objects', () => {
    for (const name of ['process', 'require', 'globalThis', 'eval', 'console', 'Function']) {
      expect(failCode(`কোৱা(${name})`), name).toBe('R001');
    }
  });
});
