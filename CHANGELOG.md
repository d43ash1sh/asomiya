# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.3.0] — 2026-11-20

### Added

- **Website** (`website/`, deployed to https://asomiya.codes): home page, a 14-page tutorial, a
  reference (keywords, built-ins, every error code, CLI, JavaScript API, limits), a community page,
  and the playground. Every page is in English and Assamese, every code sample has Assamese-script
  and English-letter versions, and every sample is run when the site is built.
- The playground now runs programs in a Web Worker with a **Stop** button, so the page never
  freezes.
- **Show in Python.** The playground's **Python** button shows the program in Python, side by
  side and updated as you type, with Copy and Download. `asomiya python <file>` does the same in
  the terminal, and `toPython()` in the library. The translation is exact: the Python program
  prints the same output byte for byte and fails at the same point. Plain Python is used wherever
  it behaves like Asomiya (a static type and scope analysis decides); small helper functions,
  included only when needed, cover the differences: number formatting and Assamese digits,
  `%` on negative numbers, strict types in `+`, `==` and conditions, letter-based text indexing
  (`ক্ষ` is one letter), block scopes and per-iteration loop variables. Tested by running every
  example, 75 edge-case programs and thousands of random programs in both languages.

### Security

- Website: strict Content Security Policy on every page (no inline scripts, no network access),
  share links are size-limited and never run automatically, and tests check these rules plus every
  internal link on each build.
- Show in Python: a program with thousands of lists took minutes to translate (the type analysis
  grew with the cube of the number of lists). It now stays fast for any program, and the
  playground stops a translation that takes longer than 5 seconds instead of waiting forever.
- Dependencies: the build tool esbuild is pinned to 0.28.2 or newer (GHSA-g7r4-m6w7-qqqr, a dev
  server file read on Windows; it was never part of the published package).

### Fixed

- Show in Python: a very long expression such as `ক + ক + … + ক` crashed the translator with an
  internal error. Programs that Python itself cannot run (more than 20 loops inside each other,
  more than 99 levels of blocks, or more than 200 brackets inside each other) produced Python
  that failed with a SyntaxError. Both now give the new error **P012** with the exact place.

## [0.2.0] — 2026-11-18

### Added

- **Romanised Assamese.** Every keyword and built-in can also be written in English letters, the
  way Assamese is typed in chats (`dhora`, `kowa`, `jodi`, `nohole`, `xosa` …). Because there is no
  standard romanisation, several common spellings are accepted per word. Roman spellings are
  lower-case only, so capitalised names (`Jodi`, `Misha`) stay usable. Both scripts can be mixed in
  one program. See `docs/ROMAN.md`.
- An undefined name that is close to a romanised keyword or built-in now gets a suggestion:
  `"kowaa" … did you mean kowa (কোৱা)?` (R001). A misspelt keyword at the start of a statement
  (`jodii (…) {`, `dhoraa x`) gets one too (P007).
- **`আগবাঢ়া` (continue)**, Roman `aagbara`: skips to the next loop iteration. Outside a loop it is
  a syntax error (P011).
- `examples/roman.asom`, also in the playground.
- Programs written in English letters print numbers with 0-9; Assamese-script programs keep ০-৯.
  New `--assamese-digits` flag, and an **Auto** digit option (the default) in the playground.
- Programs written in English letters also print `xosa`/`misa`/`khali`, and `prokar()` returns
  Roman type names (`xonkhya`, `path`, `talika` …).

### Changed

- Website and playground moved to **https://asomiya.codes**.
- Siddhartha Borah ([@siddharthaborah](https://github.com/siddharthaborah)) is listed in
  `contributors`.

### Breaking

- The lower-case Roman spellings (`ba`, `aru`, `misa`, `khali`, `jodi` …) are now keywords, so 0.1.x
  programs that used them as variable names must rename them.

### Security

- **Denial of service:** text length and indexing used `Intl.Segmenter`, which is quadratic in V8.
  A single long string (from a program, `সোধা` input or a shared playground link) could freeze the
  CLI or the browser tab for minutes. Text is now segmented in chunks, so this is linear (1 000 000
  characters: >60 s before, ~0.4 s now).
- **Trojan Source / terminal escapes:** invisible control characters (bidi overrides, ESC, NUL, …)
  are rejected in strings and comments (new error **L008**). Diagnostics show any control character
  as a visible symbol (␛, �) and clip very long names and lines, so a crafted file can't send escape
  sequences to the terminal through an error message or file name.
- ZWJ/ZWNJ are allowed in names only after Assamese characters, so `naam` and `na‍am` can't be two
  different names that look the same.
- Playground: added a Content Security Policy (only its own script may run; no network access) and
  `no-referrer`.
- CI: GitHub Actions are pinned to commit SHAs, checkout no longer keeps the token, the Pages
  publish permission is limited to the deploy job, and CI now also runs on the `beta` branch.

## [0.1.1] — 2026-11-17

### Added

- **Browser playground** at https://d43ash1sh.github.io/asomiya/ runs the real interpreter
  client-side. It has the bundled examples, an input box for `সোধা`, Assamese/English errors, a digit
  style option, share links and a keyword cheat sheet. It deploys to GitHub Pages from `main`.

### Changed

- The npm page's **Homepage** link now points to the playground.
- Arnab Sharma ([@arnabsmh](https://github.com/arnabsmh)) is listed in `contributors`.

## [0.1.0] — 2026-11-17

First published release. It includes the initial implementation and the fixes from the repository
audit (see `docs/FINAL_AUDIT_REPORT.md`).

### Language

- Keywords: `ধৰা`, `কোৱা`, `যদি`, `নহ'লে` (also `নহলে`, `নহ’লে`), `যেতিয়ালৈকে`, `ৰখা`, `ফাংচন`,
  `ঘূৰাইদিয়া`, `সঁচা`, `মিছা`, `খালী`, `আৰু`, `বা`.
- Types: number, text, boolean, null, list, function (first-class, closures).
- Operators: `+ - * / %`, `== != < <= > >=`, `&& || !` with short-circuiting; precedence as in
  `docs/GRAMMAR.md`.
- Assamese (`০-৯`) and ASCII digits; numbers print in Assamese digits by default.
- Unicode identifiers with NFC normalisation; grapheme-aware text length and indexing.
- Statements end at a newline, `;` or `।`; comments `//` and `/* */`.
- Built-ins: `দৈৰ্ঘ্য`, `প্ৰকাৰ`, `সংখ্যা`, `পাঠ`, `পূৰ্ণাংক`, `সংযোজন`, `সোধা`.
- Execution step budget (R008), call-depth limit (R009), parser nesting limit (P010).

### Tooling

- `asomiya run <file>` and an interactive REPL, with Assamese/English diagnostics.
- File extension `.asom`.
- Library API: `runSource`, `Interpreter`, `parse`, `tokenize`, `formatDiagnostic`.

### Fixed during the pre-release audit

- **REPL:** replaced Node's `readline` line editor, whose redraws garbled the screen with Assamese
  input, with plain synchronous line reads. Output appears immediately and the prompt is never
  redrawn.
- **REPL:** `সোধা` now works inside the REPL (it reads the next typed line).
- **REPL:** a result too large or too deep to display is reported as an error instead of crashing.
- A program that grows a list without bound crashed Node with a fatal out-of-memory error. Text and
  lists now have size limits (new error **R019**), and size-proportional work costs extra steps.
- Text that grows past JavaScript's limit was reported as R018 ("nesting too deep"). It is now R019.
- Built-ins could be overwritten by plain assignment (`দৈৰ্ঘ্য = ৫`). This is now **R020**; shadowing
  with `ধৰা` still works.
- `"…\` at the end of a line or file is reported as an unterminated string (L002) instead of an
  invalid escape (L004).
- Lone `\r` (classic Mac) line endings are treated as line breaks, including in error excerpts.
- CLI output is written synchronously, so prompts always appear before input is read.

### Added

- REPL command `.বাতিল` / `.cancel` to discard an unfinished multi-line statement.
- `npm run docs:errors`, which regenerates `docs/ERRORS.md` from the message catalogue.

### Changed

- Ctrl+C in the REPL now quits, including while a program is running (it previously only cleared
  unfinished input and could not stop a running loop).
- The npm package no longer ships source maps.
- vitest 3.2.7 → 4.1.12 (fixes critical advisories in vitest/tinypool; dev-only).
- ESLint config uses ESLint core's `defineConfig()` instead of the deprecated `tseslint.config()`.
