# Architecture

Asomiya is a classic tree-walking interpreter. Each stage is a separate module with typed inputs and
outputs. Nothing in the pipeline ever turns source text into JavaScript.

```
source text (UTF-8)
   │
   ▼  src/lexer/lexer.ts        code-point scanner, NFC-normalised names, line/column spans
Token[]
   │
   ▼  src/parser/parser.ts      recursive descent (statements) + Pratt (expressions)
Program (AST, src/parser/ast.ts)
   │
   ▼  src/runtime/interpreter.ts   evaluator with step budget and call-depth limit
output via host callbacks (write / readLine)
```

## Directory map

| Path                         | Responsibility                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `src/language/config.ts`     | Language name, CLI name, file extension, version: the single place to rebrand. |
| `src/language/glossary.ts`   | Keyword vocabulary with meanings and status. Source of truth for keywords.     |
| `src/language/keywords.ts`   | Keyword table derived from the glossary (normalised spelling → token type).    |
| `src/language/types.ts`      | Value kinds and their Assamese/English names.                                  |
| `src/lexer/unicode.ts`       | Character classes (`\p{L}`, `\p{M}` …), digit conversion, NFC, graphemes.      |
| `src/lexer/token*.ts`        | Token and source-span types.                                                   |
| `src/lexer/lexer.ts`         | The lexer.                                                                     |
| `src/parser/ast.ts`          | AST node types: discriminated unions on `kind`.                                |
| `src/parser/precedence.ts`   | Binding powers and infix rules for the Pratt loop.                             |
| `src/parser/parser.ts`       | The parser.                                                                    |
| `src/runtime/values.ts`      | Runtime value types (tagged unions) and equality.                              |
| `src/runtime/environment.ts` | Lexical scopes.                                                                |
| `src/runtime/display.ts`     | How values print (Assamese or ASCII digits).                                   |
| `src/runtime/builtins.ts`    | The standard library.                                                          |
| `src/runtime/interpreter.ts` | The evaluator.                                                                 |
| `src/errors/*`               | Diagnostic types, bilingual message catalogue, error classes, pretty-printer.  |
| `src/run.ts`                 | `runSource()`: one-call convenience API.                                       |
| `src/cli/*`                  | Command-line interface, REPL, synchronous stdin reader.                        |

## Key design decisions

### Unicode

- The lexer walks **code points**, not UTF-16 units, so astral characters never split.
- Identifier classes are Unicode properties: start = `L | Nl | _`, part = `L | Nl | M | Nd | Pc | ZWNJ | ZWJ`.
  Assamese vowel signs, virama, nukta and chandrabindu are category `M`, so they continue a word.
- Names are compared after **NFC** normalisation (`normalizeIdentifier`). Token spans always point at
  the original text, so error positions match the user's file.
- String values are NFC-normalised too, so equality agrees with what the user sees.
- String length and indexing use **extended grapheme clusters** (`Intl.Segmenter`).

### Newlines as terminators

The lexer keeps a bracket stack and emits `Newline` tokens only at brace level (or top level). That
one rule lets calls and lists span lines while statements still end at line breaks, without
JavaScript-style semicolon-insertion surprises. The parser additionally skips newlines after binary
operators and before `নহ'লে`.

### Control flow as data

`execute()` returns a `Completion` (`normal | break | return`) instead of throwing. That keeps the
evaluator fully typed and makes non-local exits explicit.

### Errors

Every error is an `AsomiyaError` carrying a `Diagnostic<C>`: a code, typed parameters for that code,
a source span and an `incomplete` flag. `DiagnosticParams` maps each code to its parameter shape, and
`MESSAGES` is typed `{ [C in DiagnosticCode]: … }`. Adding a code without both Assamese and English
messages therefore fails to compile.

The `incomplete` flag marks errors caused only by input ending early (an open `{`, `(`, or
`/* …`). The REPL uses it to ask for another line.

### Safety and limits

- No `eval`, no `Function`; ESLint enforces both.
- Programs reach the host only through `write` and `readLine`, which the embedder supplies.
- **Step budget**: every statement and expression costs one step (default 10,000,000). This turns
  infinite loops into error R008.
- **Call-depth limit** (default 500) turns runaway recursion into R009. If an embedder raises it beyond
  what the JS stack allows, the resulting `RangeError` becomes R018. It never surfaces as a crash.
- **Parser nesting limit** (256) protects the recursive-descent parser from pathological input (P010).

## Embedding

```ts
import { Interpreter, parse, runSource, formatDiagnostic } from 'asomiya';

const { output, error } = runSource('কোৱা(১ + ২)');
// output === '৩\n'

const interpreter = new Interpreter({
  write: (text) => process.stdout.write(text),
  readLine: () => null,
  digits: 'ascii',
  maxSteps: 100_000,
});
interpreter.run(parse('কোৱা(১০ * ১০)')); // prints 100
```

## Adding a feature (checklist)

1. Vocabulary: add the keyword to `glossary.ts` **and** `docs/KEYWORDS.md`.
2. Grammar: update `docs/GRAMMAR.md`, then `ast.ts` and `parser.ts`.
3. Semantics: update `docs/LANGUAGE_SPEC.md`, then `interpreter.ts`.
4. Errors: add codes to `diagnostic.ts` and `messages.ts` (the compiler enforces both languages), then
   regenerate the sample section of `docs/ERRORS.md`.
5. Tests for every new path, plus an example program if user-visible.
