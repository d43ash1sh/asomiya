# Keyword & Vocabulary Glossary — শব্দকোষ

This glossary is the source of truth for the language vocabulary. The same data lives in code at
[`src/language/glossary.ts`](../src/language/glossary.ts); the keyword table used by the lexer is derived from it.

**Status** means:

- **stable** — natural, unambiguous Assamese; not expected to change.
- **provisional** — works and is documented, but a better native term may exist. Changes need
  native-speaker review and a CHANGELOG entry. Old spellings would be kept as aliases for one release.

## Keywords — মূল শব্দ

| Keyword      | Concept                     | Literal meaning / usage                                                                                  | Status      |
| ------------ | --------------------------- | -------------------------------------------------------------------------------------------------------- | ----------- |
| `ধৰা`        | variable declaration        | "suppose / let". Assamese maths texts say _ধৰা হওক x = ৫_ ("let x = 5"). `ধৰা ক = ৫` reads the same way. | stable      |
| `কোৱা`       | print a line                | "say / tell" (imperative of কোৱ).                                                                        | stable      |
| `যদি`        | if                          | "if" — the ordinary conditional conjunction.                                                             | stable      |
| `নহ'লে`      | else                        | "otherwise / if not" (নহয় + হ'লে). Also accepted: `নহলে`, and `নহ’লে` with a typographic apostrophe.     | stable      |
| `যেতিয়ালৈকে` | while loop                  | "for as long as". With a positive clause (_মই যেতিয়ালৈকে জীয়াই থাকিম_) it means "as long as".            | provisional |
| `ফাংচন`      | function declaration        | Loanword ("function"), widely understood in Assamese technical writing.                                  | provisional |
| `ঘূৰাইদিয়া`   | return from a function      | "give back". Standard spelling is two words (ঘূৰাই দিয়া); written as one token here.                      | provisional |
| `ৰখা`        | break out of a loop         | "stop / halt" (imperative of ৰখ).                                                                        | stable      |
| `সঁচা`        | boolean true                | "true".                                                                                                  | stable      |
| `মিছা`       | boolean false               | "false / untrue".                                                                                        | stable      |
| `খালী`       | null (absence of a value)   | "empty".                                                                                                 | stable      |
| `আৰু`         | logical AND (same as `&&`)  | "and".                                                                                                   | stable      |
| `বা`         | logical OR (same as `\|\|`) | "or".                                                                                                    | stable      |

### Notes on provisional keywords

- **`যেতিয়ালৈকে`** — With a negated clause, `…লৈকে` can mean "until" (_তুমি নহালৈকে_ = "until you
  come"), which is the opposite of what a loop does. In this language the condition is always read
  positively: the loop runs **as long as** it is `সঁচা`. Candidates that have been considered: `যিমানলৈকে`.
- **`ফাংচন`** — Chosen because programmers recognise it straight away. Native candidates: `ফলন` (the
  mathematics term) and `কাৰ্য` ("task / act"). Needs review.
- **`ঘূৰাইদিয়া`** — A keyword has to be one token, so the two words are joined. A two-word form
  `ঘূৰাই দিয়া` could be supported later.

### Words reserved for later

These are **not** keywords yet. They are listed here so they are not given conflicting meanings:

| Candidate | Possible meaning                              |
| --------- | --------------------------------------------- |
| `নহয়`     | logical NOT (currently only `!` is supported) |
| `আগবাঢ়া`  | continue (skip to the next loop iteration)    |
| `প্ৰতিটো`  | for-each loop                                 |

## Built-in functions — অন্তৰ্নিৰ্মিত ফাংচন

Built-ins are ordinary names, not keywords. A program can shadow them with its own `ধৰা` declaration,
but cannot reassign them (R020).

| Name     | Meaning     | Behaviour                                                                   |
| -------- | ----------- | --------------------------------------------------------------------------- |
| `দৈৰ্ঘ্য`  | "length"    | `দৈৰ্ঘ্য(x)` — length of a পাঠ (in grapheme clusters) or a তালিকা.            |
| `প্ৰকাৰ`  | "type/kind" | `প্ৰকাৰ(x)` — the type name of `x` as a পাঠ, e.g. `"সংখ্যা"`.                 |
| `সংখ্যা`  | "number"    | `সংখ্যা(x)` — converts a পাঠ to a সংখ্যা. Returns `খালী` if it can't.         |
| `পাঠ`    | "text"      | `পাঠ(x)` — converts any value to its display text.                          |
| `পূৰ্ণাংক` | "integer"   | `পূৰ্ণাংক(x)` — drops the fractional part (truncates toward zero).            |
| `সংযোজন` | "appending" | `সংযোজন(তালিকা, মান)` — adds a value to the end of a list.                  |
| `সোধা`   | "ask"       | `সোধা()` or `সোধা(প্ৰশ্ন)` — reads one line of input. `খালী` at end of input. |

## Type names — মানৰ প্ৰকাৰ

| Type name  | Meaning       | Corresponds to |
| ---------- | ------------- | -------------- |
| `সংখ্যা`    | number        | number         |
| `পাঠ`      | text          | string         |
| `সঁচা-মিছা` | true-or-false | boolean        |
| `খালী`     | empty         | null           |
| `তালিকা`   | list          | list / array   |
| `ফাংচন`    | function      | function       |

## Other terminology used in messages and docs

| Assamese | English          |
| -------- | ---------------- |
| চলক      | variable         |
| মান      | value            |
| প্ৰাচল    | parameter        |
| সূচী      | index            |
| পৰিসৰ    | scope            |
| লুপ       | loop             |
| বাক্য     | statement        |
| মন্তব্য    | comment          |
| পদক্ষেপ   | (execution) step |
| বাক্য-গঠন | syntax           |
