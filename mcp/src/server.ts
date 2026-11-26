// The Asomiya MCP server: tools, resources and prompts that let an AI assistant write, check, run
// and explain Asomiya programs. The interpreter is a sandbox (no files, network or processes, with
// step and size limits), so running any program a model writes is safe.
import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
} from '@modelcontextprotocol/ext-apps/server';
import { completable, McpServer, ResourceTemplate } from '@modelcontextprotocol/server';
import * as z from 'zod';
import { LANGUAGE } from '../../src/language/config';
import PLAYGROUND_VIEW from '../.view/playground.html';
import {
  DOCS,
  ERROR_CODES,
  EXAMPLES,
  explainError,
  guide,
  isErrorCode,
  lookup,
  type VocabularyEntry,
} from './knowledge';
import {
  checkProgram,
  describeProblem,
  MAX_CODE_LENGTH,
  MAX_INPUT_LINE_LENGTH,
  MAX_INPUT_LINES,
  runProgram,
  translateProgram,
  type ProblemReport,
} from './runner';
import { SERVER_VERSION } from './version';

export const VIEW_URI = 'ui://asomiya/playground.html';
export const GUIDE_URI = 'asomiya://guide';

export const INSTRUCTIONS = `Asomiya (অসমীয়া) is a programming language whose keywords are Assamese words; programs can be written in Assamese script or in English letters (romanised Assamese). Before writing Asomiya code, read the ${GUIDE_URI} resource (or call lookup_keyword): Asomiya is not Python, and guessed keywords are usually wrong. Always run the code with run_asomiya (or at least check_asomiya) before showing it, and fix any error it reports. When explaining to a learner, prefer Assamese script unless they write in English letters. Running code is safe: programs cannot touch files, the network or the system.`;

// ── schemas ───────────────────────────────────────────────────────────────

const code = z
  .string()
  .max(MAX_CODE_LENGTH)
  .describe(
    'Asomiya source code, in Assamese script (ধৰা ক = ৫) or English letters (dhora k = 5). Use real line breaks, not "\\n".',
  );

const lang = z
  .enum(['en', 'as'])
  .optional()
  .describe('Language of error messages: "en" (English, default) or "as" (Assamese).');

const digits = z
  .enum(['auto', 'assamese', 'ascii'])
  .optional()
  .describe(
    'Digits for printed numbers. "auto" (default): Assamese digits, or ASCII when the keywords are in English letters.',
  );

const problem = z.object({
  code: z.string().describe('Stable error code, e.g. "R001". See explain_error.'),
  phase: z.enum(['lexer', 'parser', 'runtime']),
  line: z.number().int(),
  column: z.number().int(),
  message: z.string(),
  messageAs: z.string(),
  messageEn: z.string(),
  formatted: z.string().describe('The message with the source line and a caret.'),
});

const runOutput = z.object({
  ok: z.boolean().describe('True when the program ran to the end without an error.'),
  output: z
    .string()
    .describe('Everything the program printed (also when it stopped with an error).'),
  outputTruncated: z.boolean(),
  error: problem.nullable(),
  inputLinesUsed: z.number().int(),
  playgroundUrl: z
    .string()
    .nullable()
    .describe('Opens this program in the asomiya.codes playground.'),
});

const checkOutput = z.object({ ok: z.boolean(), error: problem.nullable() });

const pythonOutput = z.object({
  ok: z.boolean(),
  python: z.string().nullable(),
  error: problem.nullable(),
});

const entry = z.object({
  kind: z.enum(['keyword', 'builtin', 'type']),
  id: z.string(),
  word: z.string(),
  aliases: z.array(z.string()),
  roman: z.array(z.string()),
  english: z.string(),
  meaning: z.string(),
  example: z.string(),
});

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

// ── text for the model ────────────────────────────────────────────────────

function runText(r: ReturnType<typeof runProgram>, l: 'en' | 'as'): string {
  const parts: string[] = [];
  const printed = r.output === '' ? '(no output)' : r.output.replace(/\n$/, '');
  if (r.error !== null && r.error.phase !== 'runtime') {
    parts.push('The program did not run: it has a spelling or syntax error.');
  } else {
    parts.push(r.ok ? `Output:\n${printed}` : `Output before the error:\n${printed}`);
  }
  if (r.outputTruncated) parts.push('(output truncated)');
  if (r.error !== null) parts.push(describeProblem(r.error, l));
  if (r.inputLinesUsed > 0) parts.push(`Input lines read: ${r.inputLinesUsed}`);
  if (r.playgroundUrl !== null) parts.push(`Open in the playground: ${r.playgroundUrl}`);
  return parts.join('\n\n');
}

function problemText(p: ProblemReport | null, l: 'en' | 'as', ok: string): string {
  return p === null ? ok : describeProblem(p, l);
}

function entryText(e: VocabularyEntry): string {
  const spellings = [e.word, ...e.aliases].join(' / ');
  const lines = [
    `${spellings} (${e.roman.join(', ')}) — ${e.kind}: ${e.english}`,
    e.meaning === '' ? '' : `  ${e.meaning}`,
    e.example === '' ? '' : `  Example:\n${e.example.replace(/^/gm, '    ')}`,
  ];
  return lines.filter((l) => l !== '').join('\n');
}

// ── the server ────────────────────────────────────────────────────────────

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: 'asomiya',
      title: 'Asomiya (অসমীয়া)',
      version: SERVER_VERSION,
      description:
        'Write, check and run programs in Asomiya, the programming language in Assamese.',
      websiteUrl: 'https://asomiya.codes',
      icons: [{ src: 'https://asomiya.codes/favicon.svg', mimeType: 'image/svg+xml' }],
    },
    { instructions: INSTRUCTIONS },
  );

  // ── tools ──

  registerAppTool(
    server,
    'run_asomiya',
    {
      title: 'Run Asomiya code',
      description:
        'Runs an Asomiya program and returns what it printed, or the error with its code, line and message in English and Assamese. Programs are sandboxed (no files or network) and stop after 10 million steps. Pass input lines for সোধা (sodha) in `input`.',
      inputSchema: z.object({
        code,
        input: z
          .array(z.string().max(MAX_INPUT_LINE_LENGTH))
          .max(MAX_INPUT_LINES)
          .optional()
          .describe('Lines returned one by one by সোধা(); after the last one it returns খালী.'),
        digits,
        lang,
      }),
      outputSchema: runOutput,
      annotations: READ_ONLY,
      _meta: { ui: { resourceUri: VIEW_URI } },
    },
    ({ code: source, input, digits: d, lang: l = 'en' }) => {
      const result = runProgram(source, { input, digits: d, lang: l });
      return {
        content: [{ type: 'text', text: runText(result, l) }],
        structuredContent: { ...result },
      };
    },
  );

  server.registerTool(
    'check_asomiya',
    {
      title: 'Check Asomiya code',
      description:
        'Checks an Asomiya program for spelling and syntax errors without running it. Errors that only happen while running (R… codes) need run_asomiya.',
      inputSchema: z.object({ code, lang }),
      outputSchema: checkOutput,
      annotations: READ_ONLY,
    },
    ({ code: source, lang: l = 'en' }) => {
      const result = checkProgram(source, l);
      return {
        content: [{ type: 'text', text: problemText(result.error, l, 'No syntax errors.') }],
        structuredContent: { ...result },
      };
    },
  );

  server.registerTool(
    'asomiya_to_python',
    {
      title: 'Show Asomiya code in Python',
      description:
        'Translates an Asomiya program into an equivalent, runnable Python 3 program (same output). Useful to explain Asomiya to someone who knows Python.',
      inputSchema: z.object({ code, digits, lang }),
      outputSchema: pythonOutput,
      annotations: READ_ONLY,
    },
    ({ code: source, digits: d, lang: l = 'en' }) => {
      const result = translateProgram(source, { digits: d, lang: l });
      return {
        content: [
          {
            type: 'text',
            text:
              result.python === null
                ? problemText(result.error, l, '')
                : `\`\`\`python\n${result.python}\`\`\``,
          },
        ],
        structuredContent: { ...result },
      };
    },
  );

  server.registerTool(
    'lookup_keyword',
    {
      title: 'Look up an Asomiya word',
      description:
        'Finds keywords, built-in functions and type names by Assamese spelling (প্ৰতিটো), English-letter spelling (protito) or English meaning ("for each", "length"). An empty query lists everything.',
      inputSchema: z.object({
        query: z.string().max(200).describe('A word in any script, or an English meaning.'),
      }),
      outputSchema: z.object({ matches: z.array(entry) }),
      annotations: READ_ONLY,
    },
    ({ query }) => {
      const matches = lookup(query);
      const text =
        matches.length === 0
          ? `Nothing matches "${query}". Call lookup_keyword with an empty query to list every word.`
          : matches.map(entryText).join('\n\n');
      return {
        content: [{ type: 'text', text }],
        structuredContent: {
          matches: matches.map((m) => ({ ...m, aliases: [...m.aliases], roman: [...m.roman] })),
        },
      };
    },
  );

  server.registerTool(
    'explain_error',
    {
      title: 'Explain an Asomiya error',
      description:
        'Explains an Asomiya error code (such as P013 or R007): what it means in English and Assamese, an example that causes it, and how to fix it.',
      inputSchema: z.object({
        code: z.string().max(10).describe('The error code, e.g. "R001".'),
      }),
      outputSchema: z.object({
        found: z.boolean(),
        code: z.string(),
        phase: z.string(),
        messageAs: z.string(),
        messageEn: z.string(),
        example: z.string(),
        fix: z.string(),
      }),
      annotations: READ_ONLY,
    },
    ({ code: raw }) => {
      const wanted = raw.trim().toUpperCase();
      if (!isErrorCode(wanted)) {
        const text = `"${raw}" is not an Asomiya error code. Codes: ${ERROR_CODES.join(', ')}.`;
        return {
          content: [{ type: 'text', text }],
          structuredContent: {
            found: false,
            code: wanted,
            phase: '',
            messageAs: '',
            messageEn: '',
            example: '',
            fix: '',
          },
        };
      }
      const e = explainError(wanted);
      const text = [
        `${e.code} (${e.phase} error)`,
        `English: ${e.messageEn}`,
        `অসমীয়া: ${e.messageAs}`,
        `Example: ${e.example}`,
        `How to fix: ${e.fix}`,
      ].join('\n');
      return { content: [{ type: 'text', text }], structuredContent: { found: true, ...e } };
    },
  );

  // ── resources ──

  server.registerResource(
    'guide',
    GUIDE_URI,
    {
      title: 'Guide for AI assistants',
      description:
        'Start here: a compact, tested summary of Asomiya with every keyword, built-in and the rules that differ from Python.',
      mimeType: 'text/markdown',
      annotations: { audience: ['assistant'], priority: 1 },
    },
    (uri) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: guide() }] }),
  );

  for (const doc of DOCS) {
    server.registerResource(
      doc.name,
      doc.uri,
      { title: doc.title, description: doc.description, mimeType: 'text/markdown' },
      (uri) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: doc.text }] }),
    );
  }

  server.registerResource(
    'example',
    new ResourceTemplate('asomiya://examples/{name}', {
      list: () => ({
        resources: EXAMPLES.map((e) => ({
          uri: `asomiya://examples/${e.name}`,
          name: e.file,
          title: e.label,
          mimeType: 'text/plain',
        })),
      }),
      complete: {
        name: (value) => EXAMPLES.map((e) => e.name).filter((n) => n.startsWith(value)),
      },
    }),
    {
      title: 'Example programs',
      description: 'The example programs from the Asomiya repository and playground.',
      mimeType: 'text/plain',
    },
    (uri, { name }) => {
      const example = EXAMPLES.find((e) => e.name === name);
      if (example === undefined) {
        throw new Error(
          `No example named "${String(name)}". Examples: ${EXAMPLES.map((e) => e.name).join(', ')}.`,
        );
      }
      return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: example.source }] };
    },
  );

  registerAppResource(
    server,
    'Asomiya playground',
    VIEW_URI,
    { description: 'Shows the code and output of run_asomiya, with a Run button.' },
    () => ({
      contents: [{ uri: VIEW_URI, mimeType: RESOURCE_MIME_TYPE, text: PLAYGROUND_VIEW }],
    }),
  );

  // ── prompts ──

  const TOPICS = [
    'first program',
    'variables',
    'arithmetic',
    'conditions',
    'while loops',
    'for-each loops',
    'functions',
    'lists',
    'text and letters',
    'input',
    'English letters (roman)',
  ];

  server.registerPrompt(
    'teach_asomiya',
    {
      title: 'Teach me Asomiya',
      description:
        'A short, hands-on lesson on one topic, with examples you can run and an exercise.',
      argsSchema: z.object({
        topic: completable(z.string().describe(`One of: ${TOPICS.join(', ')}.`), (value) =>
          TOPICS.filter((t) => t.startsWith(value.toLowerCase())),
        ),
        language: completable(
          z.string().optional().describe('Language to teach in: English, Assamese, Hindi…'),
          (value) =>
            ['English', 'Assamese', 'Hindi'].filter((l) =>
              l.toLowerCase().startsWith((value ?? '').toLowerCase()),
            ),
        ),
      }),
    },
    ({ topic, language }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Teach me "${topic}" in ${LANGUAGE.name} (${LANGUAGE.nativeName}), the programming language in Assamese. Explain in ${language ?? 'English'}, simply, for a beginner. First read ${GUIDE_URI}. Show two or three short examples in Assamese script, run each one with run_asomiya and show its real output. End with one small exercise for me, and check my answer with run_asomiya when I send it.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    'translate_to_asomiya',
    {
      title: 'Translate a program to Asomiya',
      description:
        'Rewrites a program from Python (or another language) in Asomiya and checks it runs.',
      argsSchema: z.object({
        program: z.string().max(MAX_CODE_LENGTH).describe('The program to translate.'),
        script: completable(
          z
            .string()
            .optional()
            .describe('"assamese" (default) for Assamese script, "roman" for English letters.'),
          (value) => ['assamese', 'roman'].filter((s) => s.startsWith((value ?? '').toLowerCase())),
        ),
      }),
    },
    ({ program, script }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Rewrite this program in ${LANGUAGE.name}, using ${script === 'roman' ? 'English letters (romanised keywords such as dhora, kowa, jodi)' : 'Assamese script'} and meaningful Assamese names. First read ${GUIDE_URI}; if something has no direct equivalent (dictionaries, classes, imports), say so and use the closest Asomiya construct. Run the result with run_asomiya, fix any error, and show the final code with its output.\n\n\`\`\`\n${program}\n\`\`\``,
          },
        },
      ],
    }),
  );

  return server;
}
