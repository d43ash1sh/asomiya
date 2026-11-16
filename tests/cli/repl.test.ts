import { describe, expect, it } from 'vitest';
import { ReplSession } from '../../src/cli/repl';

function session() {
  return new ReplSession({ lang: 'as', digits: 'assamese', maxSteps: 100_000, maxCallDepth: 100 });
}

describe('ReplSession', () => {
  it('echoes expression values, quoting text', () => {
    const s = session();
    expect(s.feed('১ + ২')).toEqual({ kind: 'done', output: '৩\n', error: null });
    expect(s.feed('"ক" + "খ"')).toEqual({ kind: 'done', output: '"কখ"\n', error: null });
    expect(s.feed('খালী')).toEqual({ kind: 'done', output: '', error: null });
  });

  it('keeps variables between inputs and allows re-declaration', () => {
    const s = session();
    s.feed('ধৰা ক = ১');
    s.feed('ধৰা ক = ক + ১');
    expect(s.feed('কোৱা(ক)')).toMatchObject({ output: '২\n' });
  });

  it('waits for more lines while a block is open', () => {
    const s = session();
    expect(s.feed('ফাংচন দুগুণ(x) {').kind).toBe('continue');
    expect(s.isContinuing).toBe(true);
    expect(s.feed('  ঘূৰাইদিয়া x * ২').kind).toBe('continue');
    expect(s.feed('}').kind).toBe('done');
    expect(s.feed('দুগুণ(২১)')).toMatchObject({ output: '৪২\n' });
  });

  it('reports errors and recovers', () => {
    const s = session();
    const result = s.feed('কোৱা(অজ্ঞাত)');
    expect(result.kind).toBe('done');
    if (result.kind === 'done') expect(result.error).toContain('[R001]');
    expect(s.feed('১')).toMatchObject({ output: '১\n', error: null });
  });

  it('cancel() discards unfinished input', () => {
    const s = session();
    s.feed('যদি (সঁচা) {');
    s.cancel();
    expect(s.isContinuing).toBe(false);
    expect(s.feed('৫')).toMatchObject({ output: '৫\n' });
  });

  it('understands .exit/.প্ৰস্থান and .help/.সহায়', () => {
    const s = session();
    expect(s.feed('.exit').kind).toBe('exit');
    expect(s.feed('.প্ৰস্থান').kind).toBe('exit');
    expect(s.feed('.সহায়')).toMatchObject({ kind: 'done', error: null });
  });

  it('protects against infinite loops', () => {
    const result = session().feed('যেতিয়ালৈকে (সঁচা) { }');
    expect(result.kind === 'done' && result.error).toContain('[R008]');
  });
});
