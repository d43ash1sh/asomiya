// Regenerates docs/ERRORS.md from the message catalogue. Run: npm run docs:errors
// (builds first, because it reads the compiled catalogue from dist/).
import { writeFileSync } from 'node:fs';
import { phaseOf, renderMessage } from '../dist/index.js';
const tok = (t) => ({ kind: 'token', text: t });
const samples = {
  L001: [{ char: '@' }, 'ধৰা ক = @'],
  L002: [{}, 'ধৰা ক = "অসম'],
  L003: [{}, '/* মন্তব্য …'],
  L004: [{ sequence: 'q' }, '"\\q"'],
  L005: [{ text: '১2' }, 'ধৰা ক = ১2'],
  L006: [{ text: '১২ক' }, 'ধৰা ক = ১২ক'],
  L007: [{ char: 'া' }, 'ধৰা ক = া'],
  P001: [{ expected: ')', found: tok('২') }, 'কোৱা(১ ২)'],
  P002: [{ found: { kind: 'eof' } }, 'ধৰা ক ='],
  P003: [{}, '১ = ২'],
  P004: [{}, 'ৰখা  (outside a loop)'],
  P005: [{}, 'ঘূৰাইদিয়া ১  (outside a function)'],
  P006: [{ name: 'ক' }, 'ফাংচন ফ(ক, ক) { }'],
  P007: [{ found: tok('খ') }, 'ক খ'],
  P008: [{ role: 'variable', found: tok('=') }, 'ধৰা = ৫'],
  P009: [{ keyword: 'যদি' }, 'ধৰা যদি = ৫'],
  P010: [{ limit: 256 }, '(((((… ৩০০ levels …)))))'],
  R001: [{ name: 'খ' }, 'কোৱা(খ)  (খ never declared)'],
  R002: [{ name: 'ক' }, 'ধৰা ক = ১; ধৰা ক = ২'],
  R003: [{ op: '-', left: 'string', right: 'number' }, '"ক" - ১'],
  R004: [{}, '১ / ০'],
  R005: [{ type: 'number' }, 'ধৰা ক = ৫; ক()'],
  R006: [{ name: 'যোগ', min: 2, max: 2, got: 1 }, 'যোগ(১)'],
  R007: [{ type: 'number' }, 'যদি (১) { }'],
  R008: [{ limit: 10000000 }, 'যেতিয়ালৈকে (সঁচা) { }'],
  R009: [{ limit: 500 }, 'ফাংচন ফ() { ঘূৰাইদিয়া ফ() }'],
  R010: [{ index: 3, length: 3 }, '[১, ২, ৩][৩]'],
  R011: [{ value: '০.৫' }, 'ল[০.৫]'],
  R012: [{ type: 'number' }, '৫[০]'],
  R013: [{ op: '-', type: 'string' }, '-"ক"'],
  R014: [{ name: 'দৈৰ্ঘ্য', position: 1, expected: ['string', 'list'], got: 'number' }, 'দৈৰ্ঘ্য(৫)'],
  R015: [{}, 'সোধা()  (in the REPL)'],
  R016: [{}, 'ধৰা শ = "ক"; শ[০] = "খ"'],
  R017: [{ op: 'আৰু', type: 'number' }, '১ আৰু সঁচা'],
  R018: [{}, 'very deep recursion with a raised --max-depth'],
  R019: [{ type: 'list', limit: 1000000 }, 'ধৰা ল = [১]; যেতিয়ালৈকে (সঁচা) { ল = ল + ল }'],
  R020: [{ name: 'দৈৰ্ঘ্য' }, 'দৈৰ্ঘ্য = ৫'],
};
const titles = {
  lexer: 'Lexical errors — শব্দ-বিশ্লেষণৰ ভুল (`L`)',
  parser: 'Syntax errors — বাক্য-গঠনৰ ভুল (`P`)',
  runtime: 'Runtime errors — চলোৱাৰ সময়ৰ ভুল (`R`)',
};
let out = `# Error Reference — ভুলৰ তালিকা

Every diagnostic has a stable code. Messages are in Assamese by default; pass \`--lang en\` for English.
The messages below come from the real catalogue in [\`src/errors/messages.ts\`](../src/errors/messages.ts),
filled in with example values.

Exit codes: \`0\` success · \`1\` the program had an error · \`2\` bad command-line usage or unreadable file.

`;
let phase = null;
for (const [code, [params, example]] of Object.entries(samples)) {
  const p = phaseOf(code);
  if (p !== phase) {
    out += `\n## ${titles[p]}\n\n`;
    phase = p;
  }
  out += `### ${code}\n\n- **অসমীয়া:** ${renderMessage(code, params, 'as')}\n- **English:** ${renderMessage(code, params, 'en')}\n- **Example:** \`${example}\`\n\n`;
}
writeFileSync(new URL('../docs/ERRORS.md', import.meta.url), out);
