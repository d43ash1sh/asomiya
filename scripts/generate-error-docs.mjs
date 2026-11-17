// Regenerates docs/ERRORS.md from the message catalogue. Run: npm run docs:errors
// (builds first, because it reads the compiled catalogue from dist/).
import { writeFileSync } from 'node:fs';
import { phaseOf, renderMessage } from '../dist/index.js';
import { samples } from './error-samples.mjs';
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
