# Contributing — অৱদান

Thank you for helping! Two kinds of contribution matter most:

1. **Language review by Assamese speakers.** If a keyword, built-in name or error message sounds
   unnatural, open an issue. Several keywords are marked _provisional_ in
   [docs/KEYWORDS.md](docs/KEYWORDS.md).
2. **Code**: bug fixes, tests, and the features listed under "Words reserved for later".

## Setup

```sh
npm install
npm run check     # typecheck + lint + format check + tests
```

Node.js 20+ is required.

## Ground rules

- **The interpreter never executes JavaScript.** No `eval`, `Function`, `vm`, or host APIs exposed to
  programs. ESLint enforces the first two.
- **No `any`.** Use discriminated unions and explicit types. `tsc` runs in strict mode with
  `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- **Every language change comes with:** spec + grammar docs, glossary entry (if vocabulary),
  messages in both languages (if errors), tests, and a CHANGELOG entry. The checklist is in
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#adding-a-feature-checklist).
- **Don't silently change syntax.** Examples and docs must keep working. If a spelling changes, keep
  the old one as an alias for at least one release.
- **Unicode:** scan by code point, compare names after NFC, keep spans on the original text. Add a
  test in `tests/unicode/` for any new character handling.

## Changing vocabulary

1. Propose the word in an issue, with its everyday meaning and an example sentence.
2. Update `src/language/glossary.ts` and `docs/KEYWORDS.md` together. A test checks that they
   agree.
3. Update examples and docs that use the old word.

## Playground

`npm run website:serve` builds the website (`website/`) and serves it at <http://localhost:8080>
(needs Python 3). See [website/README.md](website/README.md). Keep logic out of the DOM scripts:
put it in a DOM-free module and test it in `tests/website/`.

## MCP server

`mcp/` holds asomiya-mcp, the server that lets AI assistants use Asomiya. `npm run mcp:build` builds
it, and `npx vitest run tests/mcp` tests it. To try it in an AI app, point the app at your build:
`node /path/to/asomiya/mcp/dist/index.js`. See [mcp/README.md](mcp/README.md).

## Error messages

Every diagnostic code needs an Assamese and an English message in `src/errors/messages.ts` (the
compiler enforces this). After adding one, add an example to `scripts/generate-error-docs.mjs` and run
`npm run docs:errors` to regenerate `docs/ERRORS.md`. A test fails if a code is missing there. Also add
how to fix it to `mcp/src/hints.ts`, which the MCP server's `explain_error` tool uses.

## Tests

- `tests/lexer`, `tests/parser`, `tests/runtime`, `tests/unicode`: unit tests.
- `tests/integration`: runs the built CLI (`dist/cli.js`) as a real process. `npm test` builds it first.
- `tests/integration/repl-tty.test.ts`: types into the REPL through a real pseudo-terminal
  (`tests/fixtures/pty-driver.py`). Needs Python 3 and is skipped on Windows.
- `tests/regression`: one test per bug found in an audit.
- `tests/mcp`: the MCP server, through a real MCP client (in memory and over stdio).
- When you add an example program, add its expected output to `tests/integration/cli.test.ts`.

## Commit style

Small, focused commits with a clear message. Run `npm run check` before pushing; CI runs the same
command.
