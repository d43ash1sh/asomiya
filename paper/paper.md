---
title: "Asomiya: a programming language in Assamese for learning to code in one's own language"
tags:
  - Assamese
  - programming language
  - computing education
  - localization
  - interpreter
  - TypeScript
authors:
  - name: Debashish Bordoloi
    orcid: 0009-0006-0473-0774
    corresponding: true
    affiliation: 1
  - name: Arnab Sharmah
    affiliation: 1
  - name: Siddhartha Borah
    affiliation: 2
  - name: Bigratom Saikia
    affiliation: 1
affiliations:
  - name: Rajiv Gandhi University, Arunachal Pradesh, India
    index: 1
  - name: Independent Researcher, India
    index: 2
date: 22 November 2026
bibliography: paper.bib
---

# Summary

Asomiya is an open-source educational programming language in which every word a
learner reads or writes can be Assamese: keywords, built-in functions, numerals and
error messages. A first program looks like this:

```
ধৰা নাম = "অসম"
যদি (দৈৰ্ঘ্য(নাম) > ১) {
    কোৱা("নমস্কাৰ, " + নাম)
}
```

Learners who do not have an Assamese keyboard can write the same program in Latin
letters, the way Assamese is typed in chat (`dhora`, `jodi`, `kowa`). Because there is
no standard romanisation, Asomiya accepts several common spellings for each word, 68
in total for 21 keywords and built-ins, and suggests the intended word when a learner
types a near-miss.

The software can be used in three ways, all from the same interpreter. A browser
playground at <https://asomiya.codes> needs no installation, sends nothing to a server,
and includes the course examples. A command-line tool and REPL are published on npm.
A VS Code extension adds syntax colouring for both scripts, errors as the learner types,
and hover help for every keyword. In all three, a _Show in Python_ view translates the
learner's program into equivalent Python, so the language leads on to a mainstream
language instead of being a dead end. The source code is archived on Zenodo
[@asomiya_zenodo].

# Statement of need

Assamese is spoken by more than 15 million people [@census2011], yet nearly every
introductory programming course in Assam uses languages whose keywords, compiler
messages and documentation are in English. For students who studied in
Assamese-medium schools this adds a vocabulary barrier on top of the subject itself.
Surveys of non-native English speakers report that English-centred tools and error
messages hinder learning [@guo2018], and novices using a programming environment
localised into their own language have been found to learn new concepts faster than
comparable learners using the English version [@dasgupta2017]. Localising the language
itself, not only the tutorials, is therefore a meaningful step for these learners
[@swidan2023].

Existing educational languages address other needs. Hedy introduces Python syntax
gradually [@hermans2020], and localised block-based environments avoid typed syntax
altogether. To our knowledge no text-based language offered Assamese keywords,
Assamese diagnostics and correct handling of Assamese text, together with a path to a
mainstream language. Asomiya is designed for:

- **teachers** in Assam who want to introduce variables, conditions, loops, functions
  and lists in the language their students think in, using the playground in a lab or
  on phones without any installation;
- **students** who want to practise at home, in Assamese script or in English letters;
- **instructors of compilers or programming-languages courses**, who can use a small,
  readable, well-tested interpreter (lexer, parser, tree-walking evaluator and a
  translator to Python) as a case study of how a language handles a non-Latin script.

# Features for teaching and learning

**Errors that teach.** Error messages are among the most difficult parts of
programming for novices [@becker2019]. Every Asomiya error has a code, a message in
Assamese (or English, on request), and a caret under the exact position in the line.
Conditions must be `সঁচা` or `মিছা` (true or false); there is no implicit "truthiness",
so a common class of beginner mistakes becomes an explicit, explained error.

**Assamese text behaves as the learner sees it.** Names are compared after Unicode
normalisation [@uax15], and the length and indexing of text count user-perceived
characters [@uax29], so `দৈৰ্ঘ্য("নাম")` is `২` and a conjunct such as `ক্ষ` is never
split. Numbers can be written with Assamese or ASCII digits and are printed in the
script of the program, so `১০ + ২০` prints `৩০`.

**Safe for classrooms.** Programs cannot access files or the network, and loops,
recursion depth and memory are bounded, so a learner's infinite loop stops with an
explanation instead of freezing the browser.

**A bridge to Python.** The Python view is a real translation: the generated program
prints exactly what the Asomiya program prints and stops where it stops. Where Python
behaves differently, for example `-7 % 3`, or counting characters in Assamese text, the
generated code calls a small helper, so the rest remains plain Python a learner can
read.

**Course material.** The repository includes nine example programs, from a first
greeting to recursion, closures and lists, which are also built into the playground,
together with a language reference, a keyword glossary explaining why each Assamese word
was chosen, a guide to romanised spelling, and a reference for every error code, all in
Assamese and English.

# Quality and reuse

The interpreter is written in TypeScript and released under the MIT licence. Its
372 automated tests run on Linux, macOS and Windows in continuous integration. The
Python translation is checked by differential testing: thousands of randomly generated
programs are run by both the interpreter and CPython, and their output must match byte
for byte. Contributions, especially from native speakers who can suggest more natural
keywords, are welcome through the guidelines in `CONTRIBUTING.md`.

Asomiya has not yet been evaluated in a classroom study. We plan to use it with
Assamese-medium students and to report on learning outcomes in future work.

# Acknowledgements

The idea of a playful language with native-language keywords was inspired by BhaiLang
[@bhailang]; Asomiya has its own grammar, semantics and implementation.

# References
