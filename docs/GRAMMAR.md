# Grammar — ব্যাকৰণ

The grammar is written in EBNF. Terminals are quoted. `IDENT`, `NUMBER`, `STRING` and `NEWLINE` are
produced by the lexer (see "Lexical grammar" below).

## Syntactic grammar

```ebnf
program        = statementList , EOF ;

statementList  = { separator } , [ statement , { separator , { separator } , statement } , { separator } ] ;
separator      = NEWLINE | ";" | "।" ;
(* A statement also ends right before a closing "}" or at EOF. *)

statement      = varDecl
               | funcDecl
               | ifStmt
               | whileStmt
               | forEachStmt
               | breakStmt
               | continueStmt
               | returnStmt
               | printStmt
               | block
               | exprStmt ;

varDecl        = "ধৰা" , IDENT , [ "=" , expression ] ;
funcDecl       = "ফাংচন" , IDENT , "(" , [ identList ] , ")" , block ;
ifStmt         = "যদি" , expression , block , [ { NEWLINE } , elseKw , ( ifStmt | block ) ] ;
elseKw         = "নহ'লে" | "নহলে" ;
whileStmt      = "যেতিয়ালৈকে" , expression , block ;
forEachStmt    = "প্ৰতিটো" , ( forEachHead | "(" , forEachHead , ")" ) , block ;
forEachHead    = IDENT , expression , "মাজত" ;
breakStmt      = "ৰখা" ;                    (* only inside a loop *)
continueStmt   = "আগবাঢ়া" ;                 (* only inside a loop *)
returnStmt     = ( "ঘূৰাইদিয়া" | "ঘূৰাই দিয়া" ) , [ expression ] ; (* only inside a function *)
printStmt      = "কোৱা" , "(" , [ exprList ] , ")" ;
block          = "{" , statementList , "}" ;
exprStmt       = expression ;

identList      = IDENT , { "," , IDENT } , [ "," ] ;
exprList       = expression , { "," , expression } , [ "," ] ;

expression     = assignment ;
assignment     = assignTarget , "=" , assignment
               | logicOr ;
assignTarget   = IDENT | postfix , "[" , expression , "]" ;
logicOr        = logicAnd , { ( "||" | "বা" ) , logicAnd } ;
logicAnd       = equality , { ( "&&" | "আৰু" ) , equality } ;
equality       = comparison , { ( "==" | "!=" ) , comparison } ;
comparison     = additive , { ( "<" | ">" | "<=" | ">=" ) , additive } ;
additive       = multiplicative , { ( "+" | "-" ) , multiplicative } ;
multiplicative = unary , { ( "*" | "/" | "%" ) , unary } ;
unary          = ( "!" | "নহয়" | "-" ) , unary
               | postfix ;
postfix        = primary , { "(" , [ exprList ] , ")" | "[" , expression , "]" } ;
primary        = NUMBER | STRING
               | "সঁচা" | "মিছা" | "খালী"
               | IDENT
               | "(" , expression , ")"
               | "[" , [ exprList ] , "]" ;
```

### Precedence and associativity

From lowest to highest:

| Level | Operators                 | Associativity |
| ----- | ------------------------- | ------------- |
| 1     | `=`                       | right         |
| 2     | `\|\|` `বা`               | left          |
| 3     | `&&` `আৰু`                 | left          |
| 4     | `==` `!=`                 | left          |
| 5     | `<` `>` `<=` `>=`         | left          |
| 6     | `+` `-`                   | left          |
| 7     | `*` `/` `%`               | left          |
| 8     | prefix `!` `-`            | right         |
| 9     | call `f(…)`, index `x[…]` | left          |

The parser is recursive descent for statements and Pratt (precedence climbing) for expressions. The
table above lives in [`src/parser/precedence.ts`](../src/parser/precedence.ts).

### Newlines

Newlines end statements. A few rules keep this predictable:

1. Inside `( … )` and `[ … ]` newlines are ignored, so long calls and lists can span lines.
2. A line that ends with a binary operator (`+`, `আৰু`, `==` …) continues on the next line.
3. `নহ'লে` may sit on the line after the `}` that closes the `যদি` block.
4. A call or index must start on the same line as the thing being called. `ক` followed by `(খ)` on
   the next line is two statements, not a call.

## Lexical grammar

```ebnf
NEWLINE     = "\n" | "\r\n" | "\r" ;
whitespace  = " " | "\t" | "\r" (only before "\n") | U+FEFF | any Unicode space separator (Zs) ;
comment     = "//" , { any char except newline }
            | "/*" , { any char } , "*/" ;           (* block comments do not nest *)

IDENT       = identStart , { identPart | joiner } ;
identStart  = Unicode letter (L, Nl) | "_" ;
identPart   = Unicode letter (L, Nl) | combining mark (M) | decimal digit (Nd)
            | connector punctuation (Pc) | ZWNJ U+200C | ZWJ U+200D ;
joiner      = ( "'" | "’" ) ;   (* only between two identifier characters, followed by a letter *)

NUMBER      = digits , [ "." , digits ] ;              (* all digits from ONE set *)
digits      = asciiDigit , { asciiDigit } | asDigit , { asDigit } ;
asciiDigit  = "0" … "9" ;
asDigit     = "০" … "৯" ;                              (* U+09E6 … U+09EF *)

STRING      = '"' , { stringChar | escape } , '"' ;    (* may not contain a raw newline *)
escape      = "\" , ( "n" | "t" | "r" | '"' | "\" ) ;
```

### Identifier and keyword resolution

1. The lexer reads the **longest** identifier first, then checks the keyword table. `ধৰাটো` and
   `যদিও` are therefore ordinary identifiers, even though they start with a keyword.
2. Before the keyword check and before name binding, the identifier text is normalised to **Unicode
   NFC** and `’` is replaced with `'`. So `য়` written as one code point (U+09DF) or as two (U+09AF
   U+09BC) is the same name.
3. Source positions (line and column) always refer to the original, un-normalised text.
4. Keywords also have romanised spellings (`jodi` = `যদি`, see [ROMAN.md](ROMAN.md)). They are
   matched exactly and are lower-case only, so `Jodi` is an ordinary identifier.
5. `ঘূৰাই` followed by horizontal whitespace and `দিয়া` (and Roman `ghurai diya` / `ghurai dia`)
   joins into the same return token as `ঘূৰাইদিয়া`. It does not join across a line break.
6. ZWJ (U+200D) and ZWNJ (U+200C) may appear in an identifier only right after an Assamese
   character, where they shape conjuncts (`ক্‍ষ`). Elsewhere they are an error (L001), so two names
   that look the same are the same name.

### Characters not allowed in text or comments

Strings and comments may contain any character except invisible controls: C0 controls other than
tab, DEL, C1 controls, the bidirectional controls (U+061C, U+200E, U+200F, U+202A–U+202E,
U+2066–U+2069) and U+2028/U+2029. These can make code display differently from how it runs
("Trojan Source") or send escape sequences to a terminal, so they are an error (L008). Use the
escapes `\n`, `\t`, `\r` instead.
