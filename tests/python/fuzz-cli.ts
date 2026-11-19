// Large differential run: npx tsx tests/python/fuzz-cli.ts [count] [firstSeed]
import { compare, type Case } from './differential';
import { generate } from './generate';

const count = Number(process.argv[2] ?? 2000);
const first = Number(process.argv[3] ?? 1);
const cases: Case[] = [];
for (let seed = first; seed < first + count; seed++) {
  const g = generate(seed);
  const digits = (['auto', 'assamese', 'ascii'] as const)[seed % 3] ?? 'auto';
  cases.push({ name: `seed ${seed}`, source: g.source, stdin: g.stdin, digits });
}
const result = compare(cases);
console.log(
  `compared ${result.compared} (errors ${result.errors}), skipped ${result.skipped}, mismatches ${result.mismatches.length}`,
);
for (const m of result.mismatches.slice(0, Number(process.env.SHOW ?? 3))) {
  console.log(
    `\n──── ${m.name}\n${m.source}\n── asomiya: ${JSON.stringify(m.asomiya)}\n── python: ${JSON.stringify(m.got)}`,
  );
  if (process.env.PY) console.log(m.python.slice(m.python.indexOf('# ── the program')));
}
