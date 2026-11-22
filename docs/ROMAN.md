# Writing Asomiya in English letters — ৰোমান আখৰ

Every keyword and built-in can also be typed in Latin letters (romanised Assamese, the way people
write Assamese in chats). You don't need an Assamese keyboard:

```
dhora naam = "Rita"
jodi (naam != "") {
    kowa("Nomoskar, " + naam)
} nohole {
    kowa("naam nai")
}
```

Both scripts can be mixed in one program: `ধৰা ক = xosa` is fine.

## The problem: there is no single correct spelling

Assamese has no standard romanisation that everyone uses. The same word gets typed many ways:
কোৱা is `kowa`, `kua` or `koa`, and যদি is `jodi`, `zodi` or `jadi`. Some sounds have no English
letter. স/শ/ষ are usually pronounced as a throaty "kh/h" sound, which chats write as `x` (as in
_Oxom_ for অসম). So no single spelling can be "100% correct".

## How Asomiya handles it

1. **Several spellings are accepted for each word.** The first one in each list below is the
   preferred spelling, used in suggestions and in the docs. The others work the same way.
2. **Roman spellings are lower-case only.** `jodi` means যদি, but `Jodi` or `Misha` are ordinary
   names you can use for variables. Built-in names work the same way.
3. **Near-misses get a suggestion.** If you type a word that is close to a keyword or built-in but
   isn't accepted, the error tells you what you probably meant:

   ```
   চলোৱাৰ সময়ৰ ভুল [R001]: "kowaa" নামৰ কোনো চলক ঘোষণা কৰা হোৱা নাই — আপুনি kowa (কোৱা) লিখিব বিচাৰিছিল নেকি?
   বাক্য-গঠনৰ ভুল [P007]: … পোৱা গ'ল "{" — আপুনি jodi (যদি) লিখিব বিচাৰিছিল নেকি?
   ```

   This works for a misspelt function call (`kowaa(…)`) and for a misspelt keyword at the start of
   a statement (`jodii (…) {`, `dhoraa x = 1`, `fangchun f() {`, `} nohol {`).

The spellings live in one place, [`src/language/glossary.ts`](../src/language/glossary.ts) (the
`roman` field of each keyword, and `BUILTIN_ROMAN`). To accept another spelling, add it there.

## Keywords

| Assamese     | Roman spellings (first = preferred)                                   | Meaning  |
| ------------ | --------------------------------------------------------------------- | -------- |
| `ধৰা`        | `dhora`, `dhara`                                                      | let      |
| `কোৱা`       | `kowa`, `kuwa`, `kua`, `koa`                                          | print    |
| `যদি`        | `jodi`, `zodi`, `jadi`                                                | if       |
| `নহ'লে`      | `nohole`, `noh'le`, `nohle`, `nhole`, `nahole`, `nahale`              | else     |
| `যেতিয়ালৈকে` | `jetialoike`, `zetialoike`, `jetiyaloike`, `zetiyaloike`, `jetialoke` | while    |
| `ফাংচন`      | `fangchon`, `phangchon`, `fanchon`                                    | function |
| `ঘূৰাইদিয়া`   | `ghuraidiya`, `ghuraidia`                                             | return   |
| `ৰখা`        | `rokha`, `rakha`                                                      | break    |
| `আগবাঢ়া`     | `aagbara`, `agbara`, `agobara`, `aagbaara`, `agbarha`                 | continue |
| `সঁচা`        | `xosa`, `xocha`, `hosa`, `sosa`, `socha`, `sacha`                     | true     |
| `মিছা`       | `misa`, `micha`, `misha`                                              | false    |
| `খালী`       | `khali`, `khaali`                                                     | null     |
| `আৰু`         | `aru`, `aaru`                                                         | and      |
| `বা`         | `ba`, `baa`                                                           | or       |
| `নহয়`        | `nohoy`, `nohoi`, `nahoy`                                             | not      |

Because these are keywords, they can't be used as variable names (`dhora jodi = 1` is an error).

## Built-in functions

Built-in names are case-sensitive, like other names.

| Assamese | Roman spellings                             | Meaning     |
| -------- | ------------------------------------------- | ----------- |
| `দৈৰ্ঘ্য`  | `doirghyo`, `dairghya`, `doirgho`           | length      |
| `প্ৰকাৰ`  | `prokar`, `prakar`                          | type        |
| `সংখ্যা`  | `xonkhya`, `sonkhya`, `sankhya`, `xongkhya` | to number   |
| `পাঠ`    | `path`, `paath`                             | to text     |
| `পূৰ্ণাংক` | `purnanko`, `purnanka`, `purnank`           | truncate    |
| `সংযোজন` | `xonjojon`, `sonjojon`, `sanjojan`          | append      |
| `সোধা`   | `xudha`, `sudha`, `xodha`, `sodha`          | read a line |

## Output

- Numbers print with 0-9 when the program's keywords are in English letters (`kowa(10 + 20)` prints
  `30`). Programs in Assamese script keep ০-৯. `--ascii-digits` / `--assamese-digits` force a style.
- Values print in Roman too: `kowa(xosa, misa, khali)` prints `xosa misa khali`, and `prokar()`
  returns `xonkhya`, `path`, `xosa-misa`, `khali`, `talika` or `fangchon`. Programs in Assamese script
  keep `সঁচা`, `মিছা`, `খালী` and `সংখ্যা` ….
- A program counts as "written in Roman" if **any** keyword in it is romanised. In the REPL, the
  switch lasts for the rest of the session.
- Error messages are in Assamese (or English with `--lang en`).

## Words you can't use as names

Because the Roman spellings are keywords, these lower-case words can't be variable or function
names any more: every spelling in the keyword table above (for example `ba`, `aru`, `misa`, `khali`,
`jodi`). A program written for 0.1.x that used one of them as a name needs a new name. Capitalised
forms (`Ba`, `Misa`) are still fine.

## Status

These spellings are a first draft and need review by native speakers. They follow common chat
usage. If a spelling you use is missing, open an issue or add it to the glossary.
