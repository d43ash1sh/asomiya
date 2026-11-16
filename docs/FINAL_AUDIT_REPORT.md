# Final Audit Report

Date: 2026-11-17 · Findings: [REPOSITORY_AUDIT.md](REPOSITORY_AUDIT.md) · Baseline: `16764c3`

All changes are uncommitted in the working tree, pending the maintainer's review. Nothing was
committed or pushed.

## 1. Files removed

**None.** The audit found no unwanted DOCX, PDF, image, backup, temporary or generated files, and no
abandoned code files. One file was **renamed**: `src/cli/stdin.ts` → `src/cli/io.ts`. It now holds
the synchronous writers as well as the reader.

The only code removed was dead code inside files: `Environment.hasOwn()`, the `readline`-based
`startRepl()`, and `ReplSession.cancel()`, which is replaced by the `.বাতিল` command.

## 2. Files retained and why

Every tracked file is in active use:

- **Source (`src/`):** every module is imported along the pipeline lexer → parser → interpreter →
  CLI. No value-level import cycles.
- **Tests (`tests/`):** each file tests real behaviour. Nothing was removed or weakened.
- **Docs:** both READMEs (English and Assamese), the language spec, grammar, keyword glossary, error
  reference and architecture are each a distinct topic. LICENSE (MIT, Debashish Bordoloi),
  CHANGELOG and CONTRIBUTING are kept as you specified.
- **Examples:** all 8 are distinct and each has an expected-output test.
- **Config:** `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `eslint.config.js`, Prettier,
  `.editorconfig`, `.gitattributes` (LF endings on Windows CI) and the CI workflow are all needed.

## 3. Bugs discovered

Nine (B1–B9); details in [REPOSITORY_AUDIT.md §3](REPOSITORY_AUDIT.md#3-bugs).

## 4. Bugs fixed

| ID  | Fix                                                                                                                                           | Regression test                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| B1  | `\` before end of line/input → L002                                                                                                           | `tests/regression/audit-bugs.test.ts` › B1                  |
| B2  | Size limits; host "Invalid string/array length" errors map to **R019** instead of R018                                                        | › B2/B3                                                     |
| B3  | `src/runtime/limits.ts`: text ≤ 10,000,000 code units, lists ≤ 1,000,000 elements (R019); size-proportional work costs extra steps            | › B2/B3; CLI test "memory-hungry program"                   |
| B4  | Built-ins live in a read-only scope: reassignment → new **R020**, shadowing with `ধৰা` still works                                            | › B4                                                        |
| B5  | `\r` alone is a line break in the lexer and in error excerpts                                                                                 | › B5                                                        |
| B6  | `Interpreter.describe()` produces the echo inside the error handling                                                                          | `tests/cli/repl.test.ts` › "un-displayable result"          |
| B7  | REPL rewritten as a synchronous loop over `SyncLineReader` (no `readline`); `সোধা` shares the same reader                                     | `tests/integration/repl-tty.test.ts` (real pty), REPL tests |
| B8  | Display is length-bounded (`Renderer`); equality charges a step per element compared                                                          | › B2/B3 "exponentially long", "share references"            |
| B9  | `createWriter()` writes with `fs.writeSync` (with EAGAIN/EPIPE handling); a Windows console keeps `process.stdout.write` for correct encoding | covered by pty/pipe `সোধা` prompt tests on POSIX            |

Cleanups:

- Built-ins now get `display` and `chargeFor` from their context instead of re-implementing display.
- Internal-only symbols are no longer exported.
- The `tseslint.config()` → `defineConfig()` migration.
- The error-reference generator is now committed as `scripts/generate-error-docs.mjs` (`npm run docs:errors`).

## 5. Files modified

- **Source:** `src/cli/index.ts`, `src/cli/io.ts` (renamed from `stdin.ts`), `src/cli/messages.ts`,
  `src/cli/repl.ts`, `src/errors/diagnostic.ts`, `src/errors/format.ts`, `src/errors/messages.ts`,
  `src/lexer/lexer.ts`, `src/lexer/unicode.ts`, `src/runtime/builtins.ts`,
  `src/runtime/display.ts`, `src/runtime/environment.ts`, `src/runtime/interpreter.ts`,
  `src/runtime/values.ts`; new `src/runtime/limits.ts`.
- **Tests:** `tests/cli/repl.test.ts`, `tests/integration/cli.test.ts`; new
  `tests/integration/repl-tty.test.ts`, `tests/regression/audit-bugs.test.ts`,
  `tests/fixtures/pty-driver.py`.
- **Config:** `eslint.config.js`, `tsup.config.ts`, `package.json`, `package-lock.json`.
- **Docs:** `README.md`, `README.as.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`,
  `docs/ERRORS.md` (regenerated: 37 codes), `docs/GRAMMAR.md`, `docs/KEYWORDS.md`,
  `docs/LANGUAGE_SPEC.md`; new `docs/REPOSITORY_AUDIT.md`, this file.
- **New script:** `scripts/generate-error-docs.mjs`.

**Syntax unchanged.** No keyword was added, removed or changed, including `ধৰা`.

## 6. Dependencies updated

| Package | From  | To     | Why                                                                        |
| ------- | ----- | ------ | -------------------------------------------------------------------------- |
| vitest  | 3.2.7 | 4.1.12 | fixes two critical advisories (tinypool, @vitest/mocker); supports Node 20 |

No other changes. `npm audit fix --force` was not used.

## 7. Security findings

- **Fixed:** 2 critical dev-only advisories (via vitest).
- **Accepted, 1 low:** esbuild GHSA-g7r4-m6w7-qqqr. It only affects esbuild's dev **server** on
  Windows, which tsup never starts. It is dev-only and absent from the published package. The fix
  (esbuild ≥ 0.28.1) is outside tsup 8.5.1's declared range, and forcing it would be riskier than
  the advisory. Revisit when tsup accepts esbuild 0.28.
- **Host safety:** a program can no longer crash the host process by exhausting memory (B3, B8).
- **Package:** REA found no credential markers. Source maps are no longer shipped. The package went
  from 25 files / 83.0 kB to **22 files / 51.2 kB**, and the audit reports are not included.

## 8. REPL status

**Working**, verified in a real pseudo-terminal by typing one keystroke at a time:

- A complete statement runs immediately on Enter, and its output appears straight away.
- Multi-line input: an open `{`/`(` shows `  ...>` until the statement is complete. `.বাতিল` /
  `.cancel` discards it.
- Errors go to stderr with code, Assamese message and caret, and the session continues.
- **`সোধা` works in the REPL**, reading the next typed line.
- Ctrl+D or `.প্ৰস্থান` / `.exit` quit with `বিদায়!`. Ctrl+C quits immediately, including during a
  running program, which the old REPL could not interrupt.
- The REPL emits **no terminal control sequences**, so nothing can redraw over the screen.

The trade-off: **no arrow-key history or in-line cursor movement.** Editing is whatever the terminal's
own line mode provides (Backspace works).

## 9. Test results

`npm test`: **280 passed, 0 failed, 0 skipped, in 13 files** (baseline: 245 in 11).

| File                                | Tests |
| ----------------------------------- | ----: |
| tests/lexer/lexer.test.ts           |    55 |
| tests/parser/parser.test.ts         |    50 |
| tests/runtime/expressions.test.ts   |    39 |
| tests/integration/cli.test.ts       |    31 |
| tests/runtime/statements.test.ts    |    22 |
| tests/unicode/unicode.test.ts       |    18 |
| tests/regression/audit-bugs.test.ts |    16 |
| tests/runtime/functions.test.ts     |    15 |
| tests/cli/repl.test.ts              |    14 |
| tests/runtime/builtins.test.ts      |     9 |
| tests/docs.test.ts                  |     4 |
| tests/errors/messages.test.ts       |     4 |
| tests/integration/repl-tty.test.ts  |     3 |

No existing test was deleted or weakened. Tests in `tests/cli/repl.test.ts` were rewritten for the
new `ReplSession` API with the same assertions, plus new ones.

## 10. Build results

| Command                                    | Result                                          |
| ------------------------------------------ | ----------------------------------------------- |
| `npm run typecheck`                        | exit 0                                          |
| `npm run lint`                             | exit 0, no warnings                             |
| `npm run format:check`                     | exit 0                                          |
| `npm test`                                 | exit 0 (280 passed)                             |
| `npm run check`                            | exit 0                                          |
| `npm run build`                            | exit 0                                          |
| `node dist/cli.js --help` / `--version`    | exit 0 / `0.1.0`                                |
| `node dist/cli.js run examples/hello.asom` | the three expected lines, exit 0                |
| `npm pack --dry-run`                       | 22 files, 51.2 kB, no tests/config/maps/secrets |

## 11. Remaining known limitations

- **Windows:** the REPL and `সোধা` on a Windows console are untested. CI runs the suite on Windows, but
  the real-terminal tests are POSIX-only (Python `pty`). B9 is only partly fixed there: on a Windows
  console output still goes through `process.stdout.write` (needed for correct Assamese encoding),
  which Node documents as asynchronous for Windows terminals.
- **The exact symptom you reported could not be observed here.** The fix removes the mechanism that
  produces it. Please confirm in your own terminal.
- **No REPL line history** (see §8).
- **esbuild advisory** (low, dev-only) is open until tsup supports esbuild 0.28.
- **Exponent notation** uses a Latin `e` (`১e+২২`).
- **The vocabulary still needs native-speaker review:** `যেতিয়ালৈকে`, `ফাংচন` and `ঘূৰাইদিয়া` are
  provisional.
- **`package.json`** still has no `repository`, `homepage` or `bugs` fields.

## 12. Recommended next milestones

1. **Confirm the REPL** in your terminal, then commit this audit.
2. **Fill `repository`/`homepage`/`bugs`** with `https://github.com/d43ash1sh/asomiya` and watch
   the first CI run.
3. **Native-speaker review** of the provisional keywords and the Assamese error messages.
4. **Browser playground:** the interpreter is already host-independent (`write`/`readLine`
   callbacks, no Node APIs below `src/cli/`), so a static page can bundle `src/index.ts` directly.
5. **Language features reserved in the glossary:** `আগবাঢ়া` (continue), `প্ৰতিটো` (for-each),
   `নহয়` (not).
6. **Optional Assamese-aware line editor** for REPL history, written to measure grapheme widths the
   way terminals do.
