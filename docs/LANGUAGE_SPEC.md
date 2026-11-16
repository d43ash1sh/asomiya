# অসমীয়া (Asomiya) — Language Specification

Version 0.1 · Status: draft, implemented by this repository

This document describes **what programs mean**. The exact syntax is in [GRAMMAR.md](GRAMMAR.md). The
vocabulary, with the meaning of every keyword, is in [KEYWORDS.md](KEYWORDS.md).

## 1. Source files

- Source is UTF-8 text. A leading byte-order mark is ignored.
- The file extension is **`.asom`**. `.as` is already used by ActionScript and AngelScript, and `.asm`
  is assembly language, so editors and GitHub would mis-highlight either. The CLI runs any file it is
  given, whatever the extension.
- Statements are separated by a newline, `;` or the danda `।`.
- Comments: `// to end of line` and `/* block */`.

## 2. Values and types

| Type (`প্ৰকাৰ`) | Literals                   | Notes                                                        |
| -------------- | -------------------------- | ------------------------------------------------------------ |
| `সংখ্যা`        | `২৪`, `24`, `৩.১৪`, `3.14` | IEEE-754 double. A single literal can't mix digit sets.      |
| `পাঠ`          | `"নমস্কাৰ"`                 | Immutable. Contents are normalised to NFC.                   |
| `সঁচা-মিছা`     | `সঁচা`, `মিছা`              |                                                              |
| `খালী`         | `খালী`                     | The single "no value" value.                                 |
| `তালিকা`       | `[১, "দুই", সঁচা]`           | Mutable, ordered, can hold mixed types. Shared by reference. |
| `ফাংচন`        | declared with `ফাংচন`      | First-class: can be stored, passed and returned. Closures.   |

### 2.1 Display form

When a value is printed with `কোৱা`, joined to a পাঠ with `+`, or converted with `পাঠ(…)`:

- Numbers use **Assamese digits** by default: `১০ + ২০` prints `৩০`. The host can choose ASCII digits
  instead (`--ascii-digits` on the CLI). Integers have no decimal point. Other numbers use the shortest
  round-trip form, e.g. `০.৫`.
- `সঁচা`, `মিছা` and `খালী` print as those words.
- A পাঠ prints as-is at top level. Inside a list it is quoted: `["ক", ১]`.
- A list that contains itself prints the inner reference as `[…]`.
- A function prints as `<ফাংচন নাম>`.

## 3. Variables and scope

- `ধৰা নাম = মান` declares a variable in the **current scope**. Without `= মান` the value is `খালী`.
- Declaring the same name twice in one scope is an error (R002). An inner scope can shadow an outer one.
- `নাম = মান` assigns to the nearest enclosing declaration. Assigning to an undeclared name is an error
  (R001). Assignment is an expression and evaluates to the assigned value.
- Every `{ … }` block, including the bodies of `যদি`, `যেতিয়ালৈকে` and functions, opens a new scope.
- Scoping is lexical: a function sees the variables of the place where it was **declared**.
- There is no hoisting. A name must be declared before the code that uses it runs. A function body runs
  only when it is called, so mutually recursive functions work as long as both are declared before the
  first call.

Built-in functions live in a scope outside the program's global scope, so a program may declare its own
`দৈৰ্ঘ্য` and shadow the built-in.

## 4. Operators

Operands are evaluated left to right. There are **no implicit conversions** except for `+` with a পাঠ.

| Operator          | Operands                   | Result / rule                                                                                    |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| `+`               | সংখ্যা, সংখ্যা               | sum                                                                                              |
| `+`               | পাঠ on either side         | concatenation; the other side uses its display form                                              |
| `+`               | তালিকা, তালিকা             | a new list with both lists' elements                                                             |
| `-` `*`           | সংখ্যা, সংখ্যা               | difference, product                                                                              |
| `/`               | সংখ্যা, সংখ্যা               | true division (`৭ / ২` is `৩.৫`). Dividing by zero is an error (R004).                           |
| `%`               | সংখ্যা, সংখ্যা               | remainder, with the sign of the left operand. `% ০` is an error.                                 |
| `==` `!=`         | any                        | No type coercion: `১ == "১"` is `মিছা`. Lists compare element by element; functions by identity. |
| `<` `>` `<=` `>=` | two সংখ্যা or two পাঠ       | numeric order, or UTF-16 code-unit order for text (identical to code-point order for Assamese)   |
| `&&` / `আৰু`       | two সঁচা-মিছা               | short-circuit AND                                                                                |
| `\|\|` / `বা`     | two সঁচা-মিছা               | short-circuit OR                                                                                 |
| `!`               | সঁচা-মিছা                   | NOT                                                                                              |
| unary `-`         | সংখ্যা                      | negation                                                                                         |
| `x[i]`            | তালিকা or পাঠ, integer `i` | zero-based element. For a পাঠ, the `i`-th **grapheme cluster**.                                  |
| `x[i] = v`        | তালিকা                     | replaces an element. A পাঠ can't be changed.                                                     |

Any other combination is a type error (R003 / R013).

### 4.1 Grapheme clusters

`দৈৰ্ঘ্য("নাম")` is `২`, not `৩`: the text has three code points (ন, া, ম) but two user-perceived
characters (না, ম). Conjuncts such as `ক্ষ` count as one cluster. This uses the Unicode
extended-grapheme-cluster rules of the host runtime, so a combining mark is never split from its base
letter.

## 5. Control flow

### 5.1 `যদি` / `নহ'লে`

```
যদি (চৰ্ত) { … } নহ'লে যদি (আন চৰ্ত) { … } নহ'লে { … }
```

The condition must be a `সঁচা-মিছা` value. Anything else is an error (R007). There is no "truthiness",
so `যদি (০)` is rejected instead of being silently false. The parentheses are customary but optional.

### 5.2 `যেতিয়ালৈকে`

```
যেতিয়ালৈকে (চৰ্ত) { … }
```

Runs the body **as long as** the condition is `সঁচা`. The condition is re-checked before every iteration
and must be a `সঁচা-মিছা`.

### 5.3 `ৰখা`

Leaves the innermost enclosing loop immediately. It is a syntax error outside a loop (P004), including
inside a function that is itself inside a loop.

## 6. Functions

```
ফাংচন যোগ(ক, খ) {
    ঘূৰাইদিয়া ক + খ
}
```

- A declaration binds the name in the current scope, like `ধৰা`.
- A call must pass exactly as many arguments as there are parameters (R006). Arguments are evaluated
  left to right before the body runs.
- Each call gets a fresh scope whose parent is the scope where the function was declared.
- `ঘূৰাইদিয়া মান` returns `মান`. A bare `ঘূৰাইদিয়া`, or reaching the end of the body, returns `খালী`.
  `ঘূৰাইদিয়া` outside a function is a syntax error (P005).
- Recursion is supported, up to a maximum call depth (default 500, R009). If the host stack runs out first (only possible when the limit is raised) the error is R018.

## 7. Output and input

- `কোৱা(ক, খ, …)` prints its arguments' display forms separated by single spaces, then a newline.
  `কোৱা()` prints an empty line. `কোৱা` is a keyword, not a function value.
- `সোধা()` / `সোধা(প্ৰশ্ন)` prints the optional prompt without a newline, then reads one line. It returns
  the line without its line ending, or `খালী` at end of input.

## 8. Execution limits

The interpreter counts **steps**: one for each statement executed and each expression evaluated. When a
run exceeds the budget (default 10,000,000 steps; set by the host) it stops with R008. This protects
against accidental infinite loops. A call-depth limit (R009) protects against runaway recursion.

## 9. Safety

Programs can reach nothing outside the interpreter. There is no file, network, process or module
access, and no way to run JavaScript. The interpreter never uses `eval` or `Function`. The only effects
are `কোৱা` output and `সোধা` input, and the host supplies both.

## 10. Errors

Every error has a stable code, a phase, a source position and a message in Assamese (English is also
available). The full catalogue is in [ERRORS.md](ERRORS.md).

| Prefix | Phase                 |
| ------ | --------------------- |
| `L`    | lexical (শব্দ বিশ্লেষণ) |
| `P`    | syntax (বাক্য-গঠন)     |
| `R`    | runtime (চলোৱাৰ সময়)  |

A program stops at the first error. Output printed before a runtime error is kept.

## 11. Grammar changes from the original proposal

The initial examples run unchanged. These decisions were added:

1. **File extension** `.asom` instead of `.as`, to avoid the ActionScript/AngelScript clash.
2. **Logical words** `আৰু` / `বা` were added next to `&&` / `||`.
3. **`নহলে` and `নহ’লে`** are accepted as alternative spellings of `নহ'লে`.
4. **Strings use double quotes only**, because the apostrophe is part of identifiers such as `নহ'লে`.
5. **Conditions must be booleans** (no truthiness).
6. **The danda `।`** is accepted as a statement separator.
