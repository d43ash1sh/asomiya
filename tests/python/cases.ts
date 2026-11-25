/**
 * Hand-written programs for the places where Python and Asomiya differ. Each one is run in
 * Asomiya and, translated, in Python; the output must be identical byte for byte.
 */
import type { Case } from './differential';

const c = (name: string, source: string, stdin = '', digits?: Case['digits']): Case =>
  digits === undefined ? { name, source, stdin } : { name, source, stdin, digits };

export const CASES: readonly Case[] = [
  // ── numbers ────────────────────────────────────────────────────────────
  c(
    'number formatting',
    `কোৱা(0.1 + 0.2, 1 / 3, 2 / 4, 6 / 2, 100000000000000000000, 1000000000000000000000)
কোৱা(0.000001, 0.0000001, 123456789012345678901234, 1.5 * 0.000001, -0, 0 * -1)
কোৱা(9007199254740993, 9007199254740992 + 1, 2 * 4503599627370497, 12345.678)
কোৱা([0.5, -2.25, 1.0])`,
  ),
  c(
    'big integers lose precision exactly like JavaScript',
    `ফাংচন কাৰক(ন) { যদি (ন <= 1) { ঘূৰাইদিয়া 1 } ঘূৰাইদিয়া ন * কাৰক(ন - 1) }
কোৱা(কাৰক(20), কাৰক(25), কাৰক(100), কাৰক(171))
ধৰা a = 0
ধৰা b = 1
ধৰা i = 0
যেতিয়ালৈকে (i < 90) { ধৰা t = a + b; a = b; b = t; i = i + 1 }
কোৱা(a)`,
  ),
  c(
    'huge literals',
    `কোৱা(${'9'.repeat(400)}, ${'1' + '0'.repeat(308)} * 10, 0.${'0'.repeat(400)}1)`,
  ),
  c(
    'infinity and NaN, written out',
    `ধৰা x = 1
ধৰা i = 0
যেতিয়ালৈকে (i < 1100) { x = x * 2; i = i + 1 }
কোৱা(x, -x, x - x, x / x, পূৰ্ণাংক(x), পূৰ্ণাংক(x - x), x % 2, 5 % x, -5 % x)
কোৱা(x == x, x - x == x - x, [x - x] == [x - x])
ধৰা y = x - x
ধৰা l = [y]
কোৱা(l == l, [l] == [l], -x < x)`,
  ),
  c(
    'remainder keeps the sign of the left side',
    `কোৱা(-7 % 3, 7 % -3, -7 % -3, 7.5 % 2, -0.5 % 1, 0 % 5, -4 % 2)`,
  ),
  c('division by zero', `কোৱা(1)\nকোৱা(1 / 0)`),
  c('remainder by zero', `কোৱা(1)\nকোৱা(1 % 0)`),
  c('integer', `কোৱা(পূৰ্ণাংক(3.7), পূৰ্ণাংক(-3.7), পূৰ্ণাংক(-0.5), পূৰ্ণাংক(5))`),
  c(
    'number from text',
    `কোৱা(সংখ্যা("৪২"), সংখ্যা(" 3.5 "), সংখ্যা("-0"), সংখ্যা("1e5"), সংখ্যা("১২a"), সংখ্যা(""))
কোৱা(সংখ্যা("12٫5"), সংখ্যা("\\t7\\n"), সংখ্যা("০৭"), সংখ্যা("-৩.৫"), সংখ্যা("+1"), সংখ্যা(".5"), সংখ্যা(7))
কোৱা(সংখ্যা("１２"), সংখ্যা("1_000"), সংখ্যা("0x10"))`,
  ),
  c(
    'number from text trims only JavaScript spaces',
    `কোৱা(সংখ্যা("\uFEFF7"), সংখ্যা("\u30007\u00a0"))\nকোৱা(সংখ্যা(সোধা()), সংখ্যা(সোধা()), সংখ্যা(সোধা()))`,
    '\x1c5\n\x855\n\u20055\n',
  ),
  c('number of a list fails', `কোৱা(সংখ্যা([1]))`),

  // ── digits and words ──────────────────────────────────────────────────
  c('assamese digits', `কোৱা(১২৩ + 1, [1, 2.5], সঁচা, মিছা, খালী, পাঠ(-12.5) + "!")`),
  c('ascii digits setting', `কোৱা(১২৩ + 1, [1, 2.5], সঁচা)`, '', 'ascii'),
  c('assamese digits setting in a roman program', `kowa(123, xosa, khali)`, '', 'assamese'),
  c(
    'roman program',
    `dhora x = 12
kowa(x * 2, xosa, misa, khali, [x, "a"], prokar(x), prokar("a"), prokar(xosa), prokar(khali), prokar([]), prokar(kowaa))
fangchon kowaa() { ghuraidiya 1 }
kowa(kowaa, doirghyo)`,
  ),
  c(
    'type names',
    `ফাংচন f() {}
কোৱা(প্ৰকাৰ(1), প্ৰকাৰ("ক"), প্ৰকাৰ(সঁচা), প্ৰকাৰ(খালী), প্ৰকাৰ([]), প্ৰকাৰ(f), প্ৰকাৰ(প্ৰকাৰ))`,
  ),

  // ── text ──────────────────────────────────────────────────────────────
  c(
    'joining text with other values',
    `ফাংচন f() {}
কোৱা("a" + 1, 1 + "a", "a" + সঁচা, খালী + "a", "a" + [1, "b"], "a" + f, 1.5 + "" + 2)
কোৱা("" + দৈৰ্ঘ্য)`,
  ),
  c(
    'joining renormalises Assamese vowel signs',
    `ধৰা ক = "কে"
ধৰা আ = "া"
ধৰা যুক্ত = ক + আ
কোৱা(যুক্ত, দৈৰ্ঘ্য(যুক্ত), যুক্ত == "কো", দৈৰ্ঘ্য(ক + "া"), "e" + "́" == "é")
ধৰা l = [ক]
কোৱা(দৈৰ্ঘ্য(l[0] + আ), সংখ্যা("১") + আ)`,
  ),
  c(
    'letters, not code points',
    `ধৰা শব্দ = "প্ৰাপ্তবয়স্ক ক্ষ ৰ‍্য 👨‍👩‍👧 🇮🇳🇮 é a\\r\\nb"
কোৱা(দৈৰ্ঘ্য(শব্দ))
ধৰা i = 0
যেতিয়ালৈকে (i < দৈৰ্ঘ্য(শব্দ)) { কোৱা(i, শব্দ[i]); i = i + 1 }`,
  ),
  c('text index out of range', `কোৱা("কখ"[1])\nকোৱা("কখ"[2])`),
  c('text cannot change', `ধৰা s = "কখ"\ns[0] = "গ"`),
  c(
    'text order is by UTF-16 code units',
    `কোৱা("😀" < "ｚ", "ｚ" < "😀", "a" < "b", "B" < "a", "ক" > "a", "" < "a", "ab" <= "ab", "😀" >= "￿")`,
  ),
  c('quotes and escapes in lists', `কোৱা(["a\\"b", "c\\\\d", "e\\nf", "\\t", "'x'"])`),
  c('escapes in text', `কোৱা("a\\"b", "c\\\\d", "e\\nf\\tg\\rh")`),

  // ── lists ─────────────────────────────────────────────────────────────
  c(
    'lists are shared and can contain themselves',
    `ধৰা a = [1, [2, "দুই"]]
ধৰা b = a
সংযোজন(b, a)
কোৱা(a)
b[0] = "এক"
কোৱা(a[0], a == b, a == [1], দৈৰ্ঘ্য(a))
ধৰা c = a + [3]
কোৱা(দৈৰ্ঘ্য(c), c[3])`,
  ),
  c(
    'list equality never mixes types',
    `কোৱা([1] == [সঁচা], [0] == [মিছা], [1, [2]] == [1, [2]], [] == [], [খালী] == [খালী], ["1"] == [1])
কোৱা(1 == সঁচা, 0 == মিছা, সঁচা != 1, "1" == 1, খালী == মিছা, খালী == খালী, পাঠ == পাঠ, পাঠ == path)`,
  ),
  c(
    'lists that contain themselves compare equal',
    `ধৰা p = [1]
সংযোজন(p, p)
ধৰা q = [1]
সংযোজন(q, q)
কোৱা(p == q, p == [1, p], [p] == [q], p != q)`,
  ),
  c('bad index', `ধৰা l = [1, 2]\nকোৱা(l[1])\nকোৱা(l[1.5])`),
  c('negative index', `ধৰা l = [1, 2]\nকোৱা(l[-1])`),
  c('index out of range', `ধৰা l = [1, 2]\nl[2] = 3`),
  c('index a number', `ধৰা n = 5\nকোৱা(n[0])`),
  c('append to text', `সংযোজন("ক", 1)`),

  // ── conditions and logic ──────────────────────────────────────────────
  c('condition must be a boolean', `ধৰা x = 1\nকোৱা("আগত")\nযদি (x) { কোৱা("হয়") }`),
  c('while condition must be a boolean', `ধৰা l = []\nযেতিয়ালৈকে (l) { ৰখা }`),
  c(
    'short circuit',
    `ফাংচন বিফল() { কোৱা("নচলিব লাগে"); ঘূৰাইদিয়া 1 }
কোৱা(মিছা && বিফল(), সঁচা || বিফল(), মিছা আৰু বিফল(), সঁচা বা বিফল())
ধৰা n = 1
কোৱা(n > 0 && n < 5, !(n == 1))`,
  ),
  c('logic needs booleans', `ধৰা x = 1\nকোৱা(সঁচা && x)`),
  c('not needs a boolean', `ধৰা x = 1\nকোৱা(!x)`),
  c('minus needs a number', `ধৰা x = "a"\nকোৱা(-x)`),
  c('comparison chain is not Python chaining', `ধৰা a = 1\nকোৱা(a < 2 == সঁচা)\nকোৱা(a < 2 < 3)`),
  c('mixed comparison', `কোৱা("a" < 1)`),
  c('mixed arithmetic', `ধৰা x = "3"\nকোৱা(x * 2)`),
  c('list times number', `ধৰা x = [1]\nকোৱা(x * 2)`),
  c('boolean plus number', `ধৰা x = সঁচা\nকোৱা(x + 1)`),

  // ── names and scopes ──────────────────────────────────────────────────
  c(
    'block scopes',
    `ধৰা x = 1
{ ধৰা x = 2; কোৱা(x) }
কোৱা(x)
যদি (সঁচা) { ধৰা x = 3; x = x + 1; কোৱা(x) } নহ'লে { ধৰা x = 9 }
কোৱা(x)
ধৰা i = 0
যেতিয়ালৈকে (i < 2) { ধৰা y = i; কোৱা(y); i = i + 1 }`,
  ),
  c(
    'a name used before its declaration in the same block means the outer one',
    `ধৰা x = "বাহিৰ"
{ কোৱা(x); ধৰা x = "ভিতৰ"; কোৱা(x) }`,
  ),
  c(
    'functions see variables declared after them',
    `ফাংচন দেখুওৱা() { কোৱা(মুঠ) }
ধৰা মুঠ = 5
দেখুওৱা()
মুঠ = 6
দেখুওৱা()`,
  ),
  c('a function called too early', `ফাংচন দেখুওৱা() { কোৱা(মুঠ) }\nদেখুওৱা()\nধৰা মুঠ = 5`),
  c('assigning too early', `ফাংচন সলনি() { মুঠ = 1 }\nসলনি()\nধৰা মুঠ = 5`),
  c(
    'a later inner declaration shadows only once it exists',
    `ধৰা x = "বাহিৰ"
{
  ফাংচন f() { ঘূৰাইদিয়া x }
  ফাংচন set(v) { x = v }
  কোৱা(f())
  set("বাহিৰ২")
  ধৰা x = "ভিতৰ"
  কোৱা(f())
  set("ভিতৰ২")
  কোৱা(f())
}
কোৱা(x)`,
  ),
  c(
    'mutual recursion',
    `ফাংচন যুগ্ম(ন) { যদি (ন == 0) { ঘূৰাইদিয়া সঁচা } ঘূৰাইদিয়া অযুগ্ম(ন - 1) }
ফাংচন অযুগ্ম(ন) { যদি (ন == 0) { ঘূৰাইদিয়া মিছা } ঘূৰাইদিয়া যুগ্ম(ন - 1) }
কোৱা(যুগ্ম(10), অযুগ্ম(7))`,
  ),
  c(
    'closures',
    `ফাংচন গণক() { ধৰা ন = 0; ফাংচন বঢ়োৱা() { ন = ন + 1; ঘূৰাইদিয়া ন }; ঘূৰাইদিয়া বঢ়োৱা }
ধৰা a = গণক()
ধৰা b = গণক()
a()
a()
কোৱা(a(), b())`,
  ),
  c(
    'each loop iteration has its own variables',
    `ধৰা কামবোৰ = []
ধৰা i = 0
যেতিয়ালৈকে (i < 3) {
  ধৰা j = i * 10
  ফাংচন কাম() { j = j + 1; ঘূৰাইদিয়া j }
  সংযোজন(কামবোৰ, কাম)
  i = i + 1
}
কোৱা(কামবোৰ[0](), কামবোৰ[0](), কামবোৰ[2](), কামবোৰ[1]())`,
  ),
  c(
    'a recursive function made in a loop',
    `ধৰা l = []
ধৰা i = 0
যেতিয়ালৈকে (i < 3) {
  ধৰা k = i
  ফাংচন গণা(ন) { যদি (ন <= 0) { ঘূৰাইদিয়া k } ঘূৰাইদিয়া গণা(ন - 1) }
  সংযোজন(l, গণা)
  i = i + 1
}
কোৱা(l[0](3), l[1](2), l[2](1), l[0])`,
  ),
  c(
    'loop iteration variables and closures defined before them',
    `ধৰা fs = []
ধৰা i = 0
যেতিয়ালৈকে (i < 2) {
  ফাংচন f() { ঘূৰাইদিয়া v }
  সংযোজন(fs, f)
  ধৰা v = i
  i = i + 1
}
কোৱা(fs[0](), fs[1]())`,
  ),
  c('declared twice', `ধৰা x = 1\nকোৱা("আগত")\nধৰা x = 2`),
  c('declared twice in a function', `ফাংচন f(a) { কোৱা(a); ধৰা a = 2 }\nf(1)`),
  c('function declared twice', `ফাংচন f() {}\nফাংচন f() {}`),
  c('undefined name', `কোৱা("আগত")\nকোৱা(নাই)`),
  c('assign undefined name', `নাই = 5`),
  c(
    'built-ins can be shadowed but not changed',
    `ধৰা দৈৰ্ঘ্য = 5\nকোৱা(দৈৰ্ঘ্য)\n{ কোৱা(doirghyo("abc")) }`,
  ),
  c('changing a built-in', `পাঠ = 5`),
  c(
    'names that are special in Python',
    `ধৰা print = 1
ধৰা len = 2
ধৰা None = 3
ধৰা True = "t"
ধৰা in = 4
ধৰা text = 5
ধৰা add = 6
ধৰা kind = 7
ধৰা UNSET = 8
ধৰা sys = 9
ফাংচন str(x) { ঘূৰাইদিয়া x + print }
কোৱা(print, len, None, True, in, text, add, kind, UNSET, sys, str(1), str)
ফাংচন উপায়(print) { ধৰা math = print; ঘূৰাইদিয়া math * len }
কোৱা(উপায়(10))`,
  ),
  c(
    'Assamese names, joiners and apostrophes',
    `ধৰা ৰ‍্যালী = 1
ধৰা হ'ব = 2
ধৰা হ’ব২ = 3
ধৰা ক১ = 4
কোৱা(ৰ‍্যালী + হ'ব + হ’ব২ + ক১)`,
  ),
  c(
    'same name in sibling functions',
    `ফাংচন a(n) { ঘূৰাইদিয়া n + 1 }
ফাংচন b(n) { ঘূৰাইদিয়া n * 2 }
ধৰা n = 5
কোৱা(a(n), b(n), n)`,
  ),

  // ── functions ─────────────────────────────────────────────────────────
  c('wrong number of arguments', `ফাংচন f(a) {}\nকোৱা("আগত")\nf(1, 2)`),
  c('built-in with wrong number of arguments', `কোৱা(দৈৰ্ঘ্য())`),
  c('calling a number', `ধৰা x = 1\nx()`),
  c(
    'functions as values',
    `ফাংচন দুবাৰ(f, x) { ঘূৰাইদিয়া f(f(x)) }
ফাংচন যোগ১(n) { ঘূৰাইদিয়া n + 1 }
কোৱা(দুবাৰ(যোগ১, 5), দুবাৰ(পাঠ, 5), যোগ১, পাঠ, sonjojon)
ধৰা যোগ = সংযোজন
ধৰা l = []
যোগ(l, 1)
কোৱা(l, যোগ == সংযোজন, যোগ == যোগ১)
ফাংচন print() {}
কোৱা(print)`,
  ),
  c(
    'return values',
    `ফাংচন একো_নাই() {}
ফাংচন কেতিয়াবা(x) { যদি (x) { ঘূৰাইদিয়া 1 } }
কোৱা(একো_নাই(), কেতিয়াবা(সঁচা), কেতিয়াবা(মিছা))`,
  ),

  // ── evaluation order ──────────────────────────────────────────────────
  c(
    'evaluation order',
    `ফাংচন f(x) { কোৱা("f", x); ঘূৰাইদিয়া x }
ধৰা l = [0, 0]
l[f(0)] = f(5)
কোৱা(l)
কোৱা(f(1) + f(2), f(3) == f(4))
ধৰা m = 1
কোৱা(m = m + 1, m)
l[1] = (l = [9, 9])
কোৱা(l)`,
  ),
  c(
    'index assignment to a non-list evaluates everything first',
    `ফাংচন f() { কোৱা("f"); ঘূৰাইদিয়া 1 }\nধৰা x = 5\nx[0] = f()`,
  ),
  c(
    'append to a non-list evaluates the value first',
    `ফাংচন f() { কোৱা("f"); ঘূৰাইদিয়া 1 }\nসংযোজন(5, f())`,
  ),

  // ── input ─────────────────────────────────────────────────────────────
  c(
    'input',
    `ধৰা নাম = সোধা("নাম? ")
কোৱা("নমস্কাৰ, " + নাম + "!")
ধৰা বয়স = সংখ্যা(সোধা(১২))
কোৱা(বয়স + 1)
কোৱা(সোধা(), সোধা(), সোধা())`,
    'ৰীতা\r\n২০\nকো\n',
  ),
  c('input without a final newline', `কোৱা(সোধা(), সোধা())`, 'a\nb'),

  // ── loops ─────────────────────────────────────────────────────────────
  c(
    'break and continue',
    `ধৰা i = 0
যেতিয়ালৈকে (সঁচা) {
  i = i + 1
  যদি (i % 2 == 0) { আগবাঢ়া }
  যদি (i > 7) { ৰখা }
  কোৱা(i)
}`,
  ),
  // ── প্ৰতিটো (for-each) ───────────────────────────────────────────────
  c(
    'for-each over lists and text',
    `ধৰা ফলবোৰ = ["আম", "কল", "লিচু"]
প্ৰতিটো ফল ফলবোৰ মাজত { কোৱা(ফল) }
প্ৰতিটো (আখৰ "অসমীয়া মই 👍🏽" মাজত) { কোৱা(আখৰ, দৈৰ্ঘ্য(আখৰ)) }
প্ৰতিটো ক [] মাজত { কোৱা("never") }
প্ৰতিটো ক "" মাজত { কোৱা("never") }
প্ৰতিটো ক [[১, ২], [৩]] মাজত { প্ৰতিটো খ ক মাজত { কোৱা(খ) } }`,
  ),
  c(
    'for-each goes over a copy of the list',
    `ধৰা ল = [১, ২, ৩]
প্ৰতিটো ক ল মাজত { সংযোজন(ল, ক * ১০); ল[০] = ক }
কোৱা(ল)
ধৰা ম = [১, ২]
প্ৰতিটো ক ম মাজত { ম = [৯]; কোৱা(ক) }
কোৱা(ম)`,
  ),
  c(
    'for-each with break, continue and return',
    `প্ৰতিটো ক [১, ২, ৩, ৪, ৫, ৬] মাজত {
    যদি (ক % ২ == ০) { আগবাঢ়া }
    যদি (ক > ৪) { ৰখা }
    কোৱা(ক)
}
ফাংচন প্ৰথম_ডাঙৰ(ল, সীমা) {
    প্ৰতিটো ক ল মাজত { যদি (ক > সীমা) { ঘূৰাইদিয়া ক } }
}
কোৱা(প্ৰথম_ডাঙৰ([১, ৫, ৯], ৪), প্ৰথম_ডাঙৰ([১], ৪))`,
  ),
  c(
    'for-each makes a new variable each time round',
    `ধৰা ফ = []
প্ৰতিটো ক [১, ২, ৩] মাজত {
    ফাংচন দেখুওৱা() { ক = ক + ১০০; ঘূৰাইদিয়া ক }
    সংযোজন(ফ, দেখুওৱা)
    ক = ক * ২
}
কোৱা(ফ[০](), ফ[১](), ফ[২](), ফ[০]())
ধৰা ক = "বাহিৰৰ"
প্ৰতিটো ক [১] মাজত { কোৱা(ক) }
কোৱা(ক)`,
  ),
  c(
    'for-each over a number is R021',
    `কোৱা("আগত")
প্ৰতিটো ক ১০ মাজত { কোৱা(ক) }`,
  ),
  c(
    'for-each over null is R021',
    `ধৰা খ
protito k khali majot { kowa(k) }`,
  ),
  c(
    'for-each in English letters',
    `dhora folbor = ["aam", "kol"]
protito fol folbor majot { kowa(fol) }
pratito (k [1, 2] majat) { kowa(k * 2) }`,
  ),
];
