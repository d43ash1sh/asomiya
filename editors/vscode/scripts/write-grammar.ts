// Writes syntaxes/asomiya.tmLanguage.json from the language's vocabulary. Run: npm run vscode:grammar
import { writeFileSync } from 'node:fs';
import { buildGrammar } from '../src/grammar';

writeFileSync(
  new URL('../syntaxes/asomiya.tmLanguage.json', import.meta.url),
  JSON.stringify(buildGrammar(), null, 2) + '\n',
);
