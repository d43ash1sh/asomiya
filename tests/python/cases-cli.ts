// npx tsx tests/python/cases-cli.ts — runs the hand-written cases and shows any difference.
import { CASES } from './cases';
import { compare } from './differential';

const result = compare(CASES);
console.log(
  `compared ${result.compared} (errors ${result.errors}), skipped ${result.skipped}, mismatches ${result.mismatches.length}`,
);
for (const s of result.skippedNames) console.log('skipped:', s);
for (const m of result.mismatches) {
  console.log(
    `\n──── ${m.name}\n── asomiya: ${JSON.stringify(m.asomiya)}\n── python:  ${JSON.stringify(m.got)}`,
  );
  if (process.env.PY) console.log(m.python.slice(m.python.indexOf('# ── the program')));
}
