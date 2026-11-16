# Repository Audit

Date: 2026-11-17 · Baseline: commit `16764c3` (245 tests, 11 test files) · Node 20.20.2

This document records what the audit **found**. What was changed as a result is in
[FINAL_AUDIT_REPORT.md](FINAL_AUDIT_REPORT.md).

## Method

| Area                      | How it was checked                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Files and artifacts       | `git ls-files` with sizes, `git status --ignored`, search for DOCX/PDF/images/backups/temporary files |
| Secrets and personal data | filename patterns (`.env*`, keys, credentials) and content search for e-mail addresses / local paths  |
| Exports and dead code     | script listing every `export` in `src/` that nothing outside its own file references                  |
| Import cycles             | import graph of `src/`, split into value-level and type-only edges                                    |
| Debug code, unsafe typing | search for `console.*`, `debugger`, `TODO`, `as X` assertions, `@ts-*`, `eslint-disable`              |
| Bugs                      | probe programs against the built interpreter, plus reading every module                               |
| REPL                      | driven through a real pseudo-terminal (Python `pty`), one keystroke at a time, at 80/30/20 columns    |
| Dependencies              | `npm audit`, `npm outdated`, `npm ls`, and `engines` of candidate versions checked against Node 20    |
| Shipped package           | `npm pack --dry-run`; REA `audit_release_exposure` on the extracted tarball                           |

**About REA:** REA analyses _shipped artifacts_ (binaries, bundles, packages). Its own guidance is to
skip it for ordinary source-repository analysis, so the source was audited directly with the TypeScript
compiler, ESLint and the scripts above. REA was used where it fits: on the npm tarball users would
install.

## Findings

### 1. Files

- **No unwanted files.** There are no DOCX, PDF, image, backup, temporary or generated files in git.
  The only untracked files on disk were `.DS_Store` and `dist/`, both correctly ignored.
- **No secrets or personal data.** There are no `.env`, keys or credentials, and no e-mail addresses
  or local paths in tracked files, the build output or the source maps.
- `.gitignore` already covered `node_modules/`, `dist/`, `coverage/`, `.env*`, `*.log`, `*.tgz`,
  `.DS_Store`, `.idea/` and `.vscode/`. No change was needed.
- **No duplicate documentation.** README.md (English) and README.as.md (Assamese) are deliberate
  translations, and each `docs/` file covers a separate topic.

### 2. Code quality

- Strict mode (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) and zero `any`.
  `src/` has **no type assertions**, and nothing in the repository uses `@ts-` or `eslint-disable`
  comments. (Correction: the tests do use `as { … }` on `JSON.parse` results, which is justified
  because `JSON.parse` is untyped. The original search pattern missed that form.)
- **No debug statements** and no `TODO`/`FIXME` markers.
- **No value-level import cycles.** One type-only cycle, `runtime/values.ts` ↔
  `runtime/environment.ts`, is justified: a function value's closure has type `Environment`.
- **Dead code:** `Environment.hasOwn()` was never called.
- **Needlessly exported:** `parseNumberText`, `TRUE`/`FALSE`, and three character constants in
  `lexer/unicode.ts` were only used inside their own module.
- **Duplicated logic:** each built-in received `digits` and called `displayValue` itself, which
  duplicated the interpreter's display path and bypassed any limits on it.
- Other exports flagged as "unused" are deliberate: members of the `Token`/`Value` unions, the public
  API in `src/index.ts`, and CLI types.

### 3. Bugs

| ID  | Area    | Bug                                                                                                                                                                            | Severity |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| B1  | Lexer   | `"…\` at the end of a line or file was reported as L004 "invalid escape" (with an empty or raw-newline sequence) instead of L002                                               | Low      |
| B2  | Runtime | Text exceeding JavaScript's string limit was reported as R018 "nesting too deep", the wrong diagnosis                                                                          | Medium   |
| B3  | Runtime | **`ল = ল + ল` in a loop crashed Node with `FATAL ERROR … heap out of memory`.** The step budget bounds time, not memory                                                        | High     |
| B4  | Runtime | Built-ins could be overwritten by plain assignment (`দৈৰ্ঘ্য = ৫`), contrary to the spec's "shadow with ধৰা"                                                                     | Low      |
| B5  | Lexer   | Lone `\r` line endings were not line breaks: two statements became one line (P007), and error excerpts showed the wrong line                                                   | Low      |
| B6  | REPL    | The echo of a result was computed outside the interpreter's error handling, so a deeply nested value crashed the REPL                                                          | Medium   |
| B7  | REPL    | Screen corruption with Assamese input (details below), and `সোধা` could not read input in the REPL                                                                             | High     |
| B8  | Runtime | Displaying or comparing a list holding many references to the same sub-list did exponential work in one step                                                                   | Medium   |
| B9  | CLI     | Output used `process.stdout.write`, which is asynchronous for pipes on macOS and for Windows consoles, so a `সোধা` prompt could still be queued when the blocking read started | Low      |

#### B7 — the REPL

- **Reported symptom:** the prompt showed only `>`, and `কোৱা("নমস্কাৰ পৃথিৱী!")` showed no output.
- **What was verified:** in a real pseudo-terminal the statement **did** execute and its output **was**
  written. Execution, output callbacks and buffering were not at fault.
- **The defect:** the REPL used Node's `readline` in terminal mode, which redraws the input line with
  `ESC[1G ESC[0J` (go to column 1, clear to end of screen) followed by the prompt and the line. It
  decides where to redraw using its own column widths, which count spacing vowel signs (`া`, `ী`)
  as one column each; real terminals draw Assamese at different widths. Captured output shows a
  redraw in the middle of typing once the line reaches the computed edge (20-column test).
- **Effect:** when readline's idea of the cursor position and the terminal's disagree, the redraw
  starts in the wrong place and clears text already on screen, including the prompt (leaving `>`)
  and previous output. This matches the reported symptom. The exact appearance depends on the
  terminal's font and shaping, which could not be observed from here.
- **Second problem, same root:** `readline` owned stdin asynchronously, so `সোধা`, a synchronous read,
  could not share it.

#### Not bugs (documented instead)

- Numbers at or above 10²¹ print with a Latin `e` (`১e+২২`).
- `<`/`>` on text compare by UTF-16 code unit. This is identical to code-point order for Assamese.

### 4. Dependencies and security (`npm audit`)

| Package (path)                    | Severity | Scope    | Finding                                                                               | Patched, Node 20-compatible?                                |
| --------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| tinypool (via vitest 3.2.7)       | critical | dev only | prototype-pollution gadgets leading to RCE (GHSA-5gmw-xhrv-c9v3, GHSA-85c8-ppgw-ccpr) | yes: vitest 4.1.12 (`node ^20 \|\| ^22 \|\| >=24`)          |
| @vitest/mocker (via vitest 3.2.7) | critical | dev only | code injection via manual mock registration (GHSA-qxg6-89mg-rqv8)                     | yes: vitest 4.1.12                                          |
| esbuild 0.27.7 (via tsup, vite)   | low      | dev only | arbitrary file read from the **dev server on Windows** (GHSA-g7r4-m6w7-qqqr)          | only esbuild ≥ 0.28.1, outside tsup 8.5.1's range `^0.27.0` |

No advisory affects the published package: its only runtime dependency is `commander`. Other
outdated packages (`typescript` 7, `@types/node` 26, `globals` 17) are majors held back on purpose.
typescript-eslint 8 supports TypeScript < 6.1, and `@types/node` should match the minimum supported
Node.

### 5. ESLint

- `npx eslint .` printed **no warnings**.
- The deprecation was in the config itself: `tseslint.config()` is marked `@deprecated` in favour of
  ESLint core's `defineConfig()` (typescript-eslint 8.73). It never prints at runtime because it is
  a type-level deprecation in a JavaScript file, which is linted without type information.
- The earlier "ESLint 10 warning" report was inaccurate. The warning seen then came from **npm**,
  which flagged `eslint@9` as deprecated, and was resolved by upgrading to ESLint 10.

### 6. Shipped package

- REA `audit_release_exposure`: **no credential markers** in any of the 25 packaged files.
- REA also flagged **source maps with embedded `sourcesContent`** (rated "high" by REA's generic
  model). For an MIT project the source is public anyway, so this is not a leak. But the maps
  were 150 kB of a 323 kB package and duplicated every source file.
- The `files` list shipped the whole `docs/` directory, so these audit reports would have been
  published too.

### 7. Documentation

- The docs matched the implementation, except where this audit changed behaviour: REPL keys, `সোধা`
  in the REPL, size limits, line endings and R019/R020.
- `docs/ERRORS.md` had been generated by a one-off script that was never committed, so it could not
  be regenerated.
