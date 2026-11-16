# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-11-17

First release.

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
