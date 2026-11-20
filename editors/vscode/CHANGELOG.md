# Changelog

## 0.2.0

- **Run now shows its output in the Asomiya panel** (next to Terminal) instead of a terminal.
  VS Code's terminal draws one character per cell, which broke joined Assamese letters
  (যুগ্ম, আপোনাৰ); the panel shapes them properly. Questions from `সোধা` / `xudha` get an
  input box there (Ctrl+D for no answer), and Stop / Ctrl+C ends a running program.
- The panel takes the keyboard focus when a program runs, so answers are never typed into your
  code.
- **Show in Python** opens at your program, not at the helper functions at the top of the file.
- New real screenshots and a rewritten guide.

## 0.1.0

First release.

- Syntax colours for `.asom` files, in Assamese script and in English letters (`ধৰা` / `dhora`),
  including every accepted spelling of each keyword.
- Errors as you type, with Asomiya's error codes (each one links to its explanation).
- Hover a keyword or built-in for its meaning in English and Assamese and its Python name.
- Completions for every keyword and built-in, in the script your program uses.
- **Run** (▶ in the editor title, or Cmd/Ctrl+F5): runs the program in a terminal inside the
  editor, with input (`সোধা`) and Ctrl+C to stop. No Node.js or other install needed.
- **Show in Python**: the same program in Python, beside it, updated as you type. Save it as a
  `.py` file with **Asomiya: Save Python Version As…**.
- Snippets in both scripts: `jodi`, `jetialoike`, `fangchon`, `যদি`, `ফাংচন` and more.
