# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

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
