# অসমীয়া · Asomiya

**A small programming language written in Assamese.** Keywords, names, numerals and error messages are
all in Assamese. A real lexer, parser and interpreter, written in TypeScript, run the programs.

> অসমীয়াত পঢ়ক → [README.as.md](README.as.md)
>
> **Try it in your browser → [https://d43ash1sh.github.io/asomiya/](https://d43ash1sh.github.io/asomiya/)**, no installation needed.

```
ধৰা নাম = "দেবাশীষ"
ধৰা বয়স = ২৪

কোৱা("নমস্কাৰ, " + নাম)
কোৱা("মোৰ বয়স " + বয়স)

যদি (বয়স >= ১৮) {
    কোৱা("মই এজন প্ৰাপ্তবয়স্ক")
} নহ'লে {
    কোৱা("মই এতিয়াও সৰু")
}
```

```
$ asomiya run examples/hello.asom
নমস্কাৰ, দেবাশীষ
মোৰ বয়স ২৪
মই এজন প্ৰাপ্তবয়স্ক
```

## Why?

Programming languages almost always borrow English for their keywords. Asomiya shows that nothing about
lexing, parsing or evaluation depends on that. Variables can be called `বয়স`, loops can be written
with `যেতিয়ালৈকে`, and `১০ + ২০` prints `৩০`. It is meant for teaching programming to Assamese
speakers, and for showing how a language implementation works.

It is a **toy**: small, readable, and well tested, not fast or feature-complete.

## Install

Requires Node.js 20 or newer.

```sh
npm install -g asomiya
# or, from a clone of this repository:
npm install
npm run build
npm link                      # makes the `asomiya` command available
```

## Quick start

```sh
asomiya run examples/hello.asom     # run a file
asomiya                             # interactive REPL
asomiya --help
```

Source files use the `.asom` extension. (`.as` already belongs to ActionScript/AngelScript, and `.asm`
to assembly.)

## The language in five minutes

| Concept         | Asomiya                                             |
| --------------- | --------------------------------------------------- |
| variable        | `ধৰা ক = ৫`                                         |
| reassign        | `ক = ক + ১`                                         |
| print           | `কোৱা("মান:", ক)`                                   |
| if / else       | `যদি (ক > ১) { … } নহ'লে যদি (…) { … } নহ'লে { … }` |
| while           | `যেতিয়ালৈকে (ক < ১০) { … }`                         |
| break           | `ৰখা`                                               |
| function        | `ফাংচন যোগ(ক, খ) { ঘূৰাইদিয়া ক + খ }`                |
| true/false/null | `সঁচা` `মিছা` `খালী`                                 |
| and / or / not  | `আৰু` (or `&&`), `বা` (or `\|\|`), `!`               |
| list            | `ধৰা ল = [১, ২, ৩]`, `ল[০]`, `সংযোজন(ল, ৪)`         |
| comment         | `// line` and `/* block */`                         |

- **Numbers** can be written with Assamese (`২৪`) or ASCII (`24`) digits and print in Assamese by
  default (`--ascii-digits` switches this).
- **Text** uses double quotes. `+` joins text with any value. Length and indexing count whole
  characters, so `দৈৰ্ঘ্য("নাম")` is `২`.
- **Conditions must be `সঁচা` or `মিছা`.** There is no truthiness.
- **Statements** end at a newline, `;`, or the danda `।`.

**Built-in functions:** `দৈৰ্ঘ্য` (length), `প্ৰকাৰ` (type), `সংখ্যা` (to number), `পাঠ` (to text),
`পূৰ্ণাংক` (truncate), `সংযোজন` (append), `সোধা` (read a line of input).

Full details:

- [Language specification](docs/LANGUAGE_SPEC.md): types, operators, scoping, semantics
- [Grammar](docs/GRAMMAR.md): EBNF, precedence table, lexical rules
- [Keyword glossary](docs/KEYWORDS.md): what every word means and why it was chosen
- [Error reference](docs/ERRORS.md): every error code in Assamese and English
- [Architecture](docs/ARCHITECTURE.md): how the interpreter is built

## CLI

```
asomiya run <file> [options]   run a program
asomiya [repl] [options]       start the REPL (default)
asomiya --version | --help

Options:
  -l, --lang <as|en>   language for error messages (default: as)
  --ascii-digits       print numbers with 0-9 instead of ০-৯
  --max-steps <n>      execution step budget, 0 = unlimited (default: 10000000)
  --max-depth <n>      maximum function call depth (default: 500)
```

Exit codes: `0` success, `1` the program had an error, `2` usage error or unreadable file.

Errors show the code, an Assamese message, the location, and the offending line:

```
চলোৱাৰ সময়ৰ ভুল [R001]: "খ" নামৰ কোনো চলক ঘোষণা কৰা হোৱা নাই (প্ৰথমে "ধৰা খ = …" লিখক)
  --> program.asom:2:10
  |
2 | কোৱা(ক + খ)
  |        ^
```

In the REPL, a complete statement runs as soon as you press Enter, and an open `{` or `(` waits
for more lines. `সোধা` works in the REPL too: it reads the next line you type.

| REPL command                | Effect                                 |
| --------------------------- | -------------------------------------- |
| `.সহায়` / `.help`           | show help                              |
| `.বাতিল` / `.cancel`        | discard an unfinished multi-line input |
| `.প্ৰস্থান` / `.exit`, Ctrl+D | quit                                   |
| Ctrl+C                      | quit immediately, even mid-program     |

The REPL deliberately has no arrow-key history. Line editors (such as Node's `readline`) redraw
the line using column arithmetic that does not match how terminals draw Assamese, which garbled the
screen, so input is left to the terminal itself.

## Examples

| File                                              | Shows                                        |
| ------------------------------------------------- | -------------------------------------------- |
| [`hello.asom`](examples/hello.asom)               | variables, concatenation, if/else            |
| [`variables.asom`](examples/variables.asom)       | types, reassignment, scope, separators       |
| [`arithmetic.asom`](examples/arithmetic.asom)     | precedence, decimals, conversions            |
| [`conditionals.asom`](examples/conditionals.asom) | else-if chains, logic words, nesting         |
| [`loops.asom`](examples/loops.asom)               | while, break, nested loops                   |
| [`functions.asom`](examples/functions.asom)       | functions, recursion, higher-order, closures |
| [`lists.asom`](examples/lists.asom)               | lists, grapheme-aware text indexing          |
| [`greet.asom`](examples/greet.asom)               | reading input with `সোধা`                    |

## Playground

The [online playground](https://d43ash1sh.github.io/asomiya/) runs the real interpreter in your browser, and nothing is sent to a
server. It has the examples built in, an input box that `সোধা` reads from (one line per call),
Assamese or English error messages, and share links that carry the program in the URL.

To build and preview it locally: `npm run playground:serve` (needs Python 3), then open
<http://localhost:8080>.

## Use as a library

```ts
import { runSource } from 'asomiya';

const { output, error } = runSource('কোৱা(১০ + ২০)');
console.log(output); // ৩০
```

See [Architecture → Embedding](docs/ARCHITECTURE.md#embedding).

## Development

```sh
npm install
npm test            # vitest: unit + integration (builds the CLI first)
npm run typecheck   # tsc --noEmit, strict
npm run lint        # eslint (type-aware, no `any`, no eval)
npm run format      # prettier
npm run check       # all of the above
npm run build       # tsup → dist/
```

See [CONTRIBUTING.md](CONTRIBUTING.md). Changes to the vocabulary are especially welcome from native
Assamese speakers. Several keywords are marked _provisional_ in the [glossary](docs/KEYWORDS.md).

## Authors & Contributors

- **Debashish Bordoloi** ([@d43ash1sh](https://github.com/d43ash1sh)) — Creator
- **Arnab Sharmah** ([@arnabsmh](https://github.com/arnabsmh)) — Collaborator & Contributor
- **Siddhartha Borah** ([@siddharthaborah](https://github.com/siddharthaborah)) — Collaborator & Contributor

## Acknowledgements

The idea of a playful language with native-language keywords was inspired by
[BhaiLang](https://github.com/DulLabs/bhai-lang). Asomiya has its own grammar, semantics and
implementation.

## License

[MIT](LICENSE)
