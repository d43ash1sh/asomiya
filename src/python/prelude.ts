/**
 * The Python helper functions a translated program may need. Each one makes a Python operation
 * behave exactly like the Asomiya one (number formatting, Assamese digits, letter counting,
 * strict types …). A program only gets the helpers it uses, plus their dependencies.
 */
import { UNICODE_TABLES } from './unicode-tables';

export interface Helper {
  readonly code: string;
  readonly needs: readonly string[];
  readonly imports: readonly string[];
}

const h = (
  code: string,
  needs: readonly string[] = [],
  imports: readonly string[] = [],
): Helper => ({
  code: code.trim(),
  needs,
  imports,
});

/** Names that generated code calls. Every one is reserved, so user names never hide them. */
export const HELPERS: Readonly<Record<string, Helper>> = {
  UNSET: h(`UNSET = object()  # stands for a variable that is not declared yet`),

  fail: h(`
class AsomiyaError(Exception):
    """Raised where Asomiya would stop the program with an error."""


def fail(code, message):
    raise AsomiyaError(f"[{code}] {message}")`),

  kind: h(`
def kind(value):
    """The Asomiya type of a value."""
    if value is None:
        return "null"
    if type(value) is bool:
        return "boolean"
    if type(value) is float:
        return "number"
    if type(value) is str:
        return "string"
    if type(value) is list:
        return "list"
    return "function"`),

  number_text: h(
    `
def number_text(n):
    """Writes a number the way Asomiya does: 3 (not 3.0), 0.5, 1e+21."""
    if n != n:
        return NAN_WORD
    if n in (math.inf, -math.inf):
        return "-" + INFINITY_WORD if n < 0 else INFINITY_WORD
    if n == 0:
        result = "0"
    else:
        mantissa, _, exponent = repr(abs(n)).partition("e")
        whole, _, fraction = mantissa.partition(".")
        digits = (whole + fraction).lstrip("0")
        point = len(whole) + int(exponent or 0) - (len(whole + fraction) - len(digits))
        digits = digits.rstrip("0")
        size = len(digits)
        if size <= point <= 21:
            result = digits + "0" * (point - size)
        elif 0 < point <= 21:
            result = digits[:point] + "." + digits[point:]
        elif -6 < point <= 0:
            result = "0." + "0" * -point + digits
        else:
            e = point - 1
            result = digits[0] + ("." + digits[1:] if size > 1 else "")
            result += ("e+" if e >= 0 else "e-") + str(abs(e))
        if n < 0:
            result = "-" + result
    return result.translate(DIGIT_TABLE)`,
    ['settings'],
    ['math'],
  ),

  quote: h(`
def quote(s):
    """Text inside a list is shown in quotes."""
    for old, new in (("\\\\", "\\\\\\\\"), ('"', '\\\\"'), ("\\n", "\\\\n"), ("\\t", "\\\\t"), ("\\r", "\\\\r")):
        s = s.replace(old, new)
    return '"' + s + '"'`),

  show: h(
    `
def show(value, quoted, open_lists):
    k = kind(value)
    if k == "number":
        return number_text(value)
    if k == "string":
        return quote(value) if quoted else value
    if k == "boolean":
        return TRUE_WORD if value else FALSE_WORD
    if k == "null":
        return NULL_WORD
    if k == "function":
        return f"<{FUNCTION_WORD} {value.__name__}>"
    if any(item is value for item in open_lists):
        return "[…]"  # a list that contains itself
    open_lists.append(value)
    result = "[" + ", ".join(show(item, True, open_lists) for item in value) + "]"
    open_lists.pop()
    return result`,
    ['kind', 'number_text', 'quote', 'settings'],
  ),

  text: h(
    `
def text(value):
    """পাঠ: any value as text, exactly as কোৱা prints it."""
    return show(value, False, [])`,
    ['show'],
  ),

  add: h(
    `
def add(a, b):
    """+ adds numbers, joins text (turning the other side into text) and joins lists."""
    ka, kb = kind(a), kind(b)
    if ka == kb == "number":
        return a + b
    if ka == "string" or kb == "string":
        return unicodedata.normalize("NFC", text(a) + text(b))
    if ka == kb == "list":
        return a + b
    fail("R003", f"cannot use + with {ka} and {kb}")`,
    ['kind', 'text', 'fail'],
    ['unicodedata'],
  ),

  numbers: h(
    `
def numbers(op, a, b):
    if kind(a) != "number" or kind(b) != "number":
        fail("R003", f"cannot use {op} with {kind(a)} and {kind(b)}")`,
    ['kind', 'fail'],
  ),

  subtract: h(
    `
def subtract(a, b):
    numbers("-", a, b)
    return a - b`,
    ['numbers'],
  ),

  multiply: h(
    `
def multiply(a, b):
    numbers("*", a, b)
    return a * b`,
    ['numbers'],
  ),

  divide: h(
    `
def divide(a, b):
    numbers("/", a, b)
    if b == 0:
        fail("R004", "division by zero")
    return a / b`,
    ['numbers', 'fail'],
  ),

  remainder: h(
    `
def remainder(a, b):
    """% keeps the sign of the left number: -7 % 3 is -1 (in plain Python it is 2)."""
    numbers("%", a, b)
    if b == 0:
        fail("R004", "division by zero")
    if a != a or b != b or a in (math.inf, -math.inf):
        return math.nan
    return math.fmod(a, b)`,
    ['numbers', 'fail'],
    ['math'],
  ),

  negate: h(
    `
def negate(value):
    if kind(value) != "number":
        fail("R013", f"cannot use - with {kind(value)}")
    return -value`,
    ['kind', 'fail'],
  ),

  compare: h(
    `
def compare(a, op, b):
    """< <= > >= work on two numbers or two texts, nothing else."""
    if kind(a) == kind(b) == "number":
        x, y = a, b
    elif kind(a) == kind(b) == "string":
        x, y = a.encode("utf-16-be", "surrogatepass"), b.encode("utf-16-be", "surrogatepass")
    else:
        fail("R003", f"cannot use {op} with {kind(a)} and {kind(b)}")
    if op == "<":
        return x < y
    if op == "<=":
        return x <= y
    if op == ">":
        return x > y
    return x >= y`,
    ['kind', 'fail'],
  ),

  same: h(
    `
def same(a, b, open_lists=None):
    """== never mixes types: 1 == সঁচা is মিছা, and lists are compared item by item."""
    k = kind(a)
    if k in ("number", "string", "boolean"):
        return kind(b) == k and a == b
    if k == "null":
        return b is None
    if k == "function":
        return a is b
    if kind(b) != "list":
        return False
    open_lists = [] if open_lists is None else open_lists
    if a is b or any(item is a for item in open_lists):
        return True
    if len(a) != len(b):
        return False
    open_lists.append(a)
    result = all(same(x, y, open_lists) for x, y in zip(a, b))
    open_lists.pop()
    return result`,
    ['kind'],
  ),

  is_true: h(
    `
def is_true(value):
    """Conditions must be সঁচা or মিছা; Python would accept anything."""
    if type(value) is not bool:
        fail("R007", f"expected a boolean, got {kind(value)}")
    return value`,
    ['kind', 'fail'],
  ),

  graphemes: h(
    `
def ranges(spec):
    starts, ends = [], []
    for part in spec.split():
        first, _, last = part.partition("-")
        starts.append(int(first, 16))
        ends.append(int(last or first, 16))
    return starts, ends


def within(code, table):
    i = bisect.bisect_right(table[0], code) - 1
    return i >= 0 and code <= table[1][i]


PICTOGRAPHIC = ranges("${UNICODE_TABLES.PICTOGRAPHIC}")
EXTRA_EXTEND = ranges("${UNICODE_TABLES.EXTRA_EXTEND}")
PREPEND = ranges("${UNICODE_TABLES.PREPEND}")
LINKER = ranges("${UNICODE_TABLES.LINKER}")
CONSONANT = ranges("${UNICODE_TABLES.CONSONANT}")
NOT_SPACING = ranges("102b-102c 1038 1062-1064 1067-106d 1083 1087-108c 108f 109a-109c 1a61 1a63-1a64 aa7b aa7d 11720-11721")


def letter_part(c):
    o = ord(c)
    if c == "\\r":
        return "CR"
    if c == "\\n":
        return "LF"
    if o == 0x200D:
        return "ZWJ"
    if 0x1F1E6 <= o <= 0x1F1FF:
        return "RI"
    if 0x1100 <= o <= 0x115F or 0xA960 <= o <= 0xA97C:
        return "L"
    if 0x1160 <= o <= 0x11A7 or 0xD7B0 <= o <= 0xD7C6 or o == 0x16D63 or 0x16D67 <= o <= 0x16D6A:
        return "V"
    if 0x11A8 <= o <= 0x11FF or 0xD7CB <= o <= 0xD7FB:
        return "T"
    if 0xAC00 <= o <= 0xD7A3:
        return "LV" if (o - 0xAC00) % 28 == 0 else "LVT"
    if within(o, PREPEND):
        return "Prepend"
    category = unicodedata.category(c)
    if category in ("Mn", "Me") or 0x1F3FB <= o <= 0x1F3FF or within(o, EXTRA_EXTEND):
        return "Extend"
    if category in ("Cc", "Cf", "Zl", "Zp", "Cs"):
        return "Control"
    if (category == "Mc" and not within(o, NOT_SPACING)) or o in (0xE33, 0xEB3):
        return "SpacingMark"
    return "Other"


def graphemes(s):
    """Splits text into letters as people see them: ক্ষ is one letter, not three characters."""
    letters, start, prev = [], 0, None
    picto = picto_zwj = False
    regional = conjunct = 0
    for i, c in enumerate(s):
        part, o = letter_part(c), ord(c)
        if prev is not None:
            if prev == "CR" and part == "LF":
                joined = True
            elif prev in ("Control", "CR", "LF") or part in ("Control", "CR", "LF"):
                joined = False
            elif prev == "L" and part in ("L", "V", "LV", "LVT"):
                joined = True
            elif prev in ("LV", "V") and part in ("V", "T"):
                joined = True
            elif prev in ("LVT", "T") and part == "T":
                joined = True
            elif part in ("Extend", "ZWJ", "SpacingMark") or prev == "Prepend":
                joined = True
            elif conjunct == 2 and within(o, CONSONANT):
                joined = True
            elif prev == "ZWJ" and picto_zwj and within(o, PICTOGRAPHIC):
                joined = True
            elif prev == "RI" and part == "RI":
                joined = regional % 2 == 1
            else:
                joined = False
            if not joined:
                letters.append(s[start:i])
                start = i
        if within(o, PICTOGRAPHIC):
            picto, picto_zwj = True, False
        elif part == "Extend" and picto:
            picto_zwj = False
        elif part == "ZWJ" and picto:
            picto, picto_zwj = False, True
        else:
            picto = picto_zwj = False
        regional = regional + 1 if part == "RI" else 0
        if within(o, CONSONANT):
            conjunct = 1
        elif conjunct and within(o, LINKER):
            conjunct = 2
        elif not (conjunct and part in ("ZWJ", "Extend") and o != 0x200C):
            conjunct = 0
        prev = part
    if s:
        letters.append(s[start:])
    return letters`,
    [],
    ['bisect', 'unicodedata'],
  ),

  check_index: h(
    `
def check_index(index, size):
    if type(index) is not float or not index.is_integer():
        fail("R011", "an index must be a whole number")
    if index < 0 or index >= size:
        fail("R010", f"index {number_text(index)} is outside 0..{size - 1}")
    return int(index)`,
    ['fail', 'number_text'],
  ),

  item: h(
    `
def item(value, index):
    """value[index]: counts from 0; text is indexed by letters, not by code points."""
    k = kind(value)
    if k == "list":
        return value[check_index(index, len(value))]
    if k == "string":
        letters = graphemes(value)
        return unicodedata.normalize("NFC", letters[check_index(index, len(letters))])
    fail("R012", f"cannot index a {k}")`,
    ['kind', 'check_index', 'graphemes', 'fail'],
    ['unicodedata'],
  ),

  each: h(
    `
def each(value):
    """What প্ৰতিটো loops over: a copy of a list, or the letters of a text."""
    k = kind(value)
    if k == "list":
        return value[:]
    if k == "string":
        return [unicodedata.normalize("NFC", letter) for letter in graphemes(value)]
    fail("R021", f"can only loop over a list or text, not {k}")`,
    ['kind', 'graphemes', 'fail'],
    ['unicodedata'],
  ),

  put: h(
    `
def put(value, index, new):
    """value[index] = new"""
    k = kind(value)
    if k == "list":
        value[check_index(index, len(value))] = new
        return new
    if k == "string":
        fail("R016", "text cannot be changed")
    fail("R012", f"cannot index a {k}")`,
    ['kind', 'check_index', 'fail'],
  ),

  store: h(`
def store(box, value):
    box[0] = value
    return value`),

  length: h(
    `
def length(value):
    """দৈৰ্ঘ্য: the number of letters in a text, or of items in a list."""
    k = kind(value)
    if k == "string":
        return float(len(graphemes(value)))
    if k == "list":
        return float(len(value))
    fail("R014", f"length needs text or a list, not {k}")`,
    ['kind', 'graphemes', 'fail'],
  ),

  type_name: h(
    `
def type_name(value):
    """প্ৰকাৰ"""
    return TYPE_NAMES[kind(value)]`,
    ['kind', 'settings'],
  ),

  number: h(
    `
SPACES = "\\t\\n\\v\\f\\r \\xa0\\u1680\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff"
NUMBER = re.compile(r"-?[0-9]+(\\.[0-9]+)?|-?[০-৯]+(\\.[০-৯]+)?")


def number(value):
    """সংখ্যা: "২৪" or "3.5" as a number, খালী if the text is not a number."""
    k = kind(value)
    if k == "number":
        return value
    if k != "string":
        fail("R014", f"number needs text or a number, not {k}")
    value = value.strip(SPACES)
    if not NUMBER.fullmatch(value):
        return None
    return float(value.translate(str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")))`,
    ['kind', 'fail'],
    ['re'],
  ),

  integer: h(
    `
def integer(value):
    """পূৰ্ণাংক: drops the part after the decimal point."""
    if kind(value) != "number":
        fail("R014", f"integer needs a number, not {kind(value)}")
    if value != value or value in (math.inf, -math.inf):
        return value
    return float(math.trunc(value))`,
    ['kind', 'fail'],
    ['math'],
  ),

  append: h(
    `
def append(items, value):
    """সংযোজন: adds a value at the end of a list."""
    if kind(items) != "list":
        fail("R014", f"append needs a list, not {kind(items)}")
    items.append(value)`,
    ['kind', 'fail'],
  ),

  ask: h(
    `
def ask(prompt=UNSET):
    """সোধা: reads one line typed by the user (খালী when there is nothing left to read)."""
    if prompt is not UNSET:
        print(text(prompt), end="", flush=True)
    stream = getattr(sys.stdin, "buffer", None)
    if stream is None:
        line = sys.stdin.readline()
    else:
        line = stream.readline().decode("utf-8", "replace")
    if not line:
        return None
    line = line[:-1] if line.endswith("\\n") else line
    line = line[:-1] if line.endswith("\\r") else line
    return unicodedata.normalize("NFC", line)`,
    ['UNSET', 'text'],
    ['sys', 'unicodedata'],
  ),

  undefined: h(
    `
def undefined(name, *values):
    fail("R001", f'"{name}" is not declared (declare it first)')`,
    ['fail'],
  ),

  read_only: h(
    `
def read_only(name, *values):
    fail("R020", f'"{name}" is built in and cannot be changed')`,
    ['fail'],
  ),

  redeclared: h(
    `
def redeclared(name, *values):
    fail("R002", f'"{name}" is already declared here')`,
    ['fail'],
  ),
};

/** Internal names defined by the helpers (also reserved). */
export const HELPER_INTERNALS = [
  'AsomiyaError',
  'TRUE_WORD',
  'FALSE_WORD',
  'NULL_WORD',
  'FUNCTION_WORD',
  'NAN_WORD',
  'INFINITY_WORD',
  'DIGIT_TABLE',
  'TYPE_NAMES',
  'PICTOGRAPHIC',
  'EXTRA_EXTEND',
  'PREPEND',
  'LINKER',
  'CONSONANT',
  'NOT_SPACING',
  'SPACES',
  'NUMBER',
  'ranges',
  'within',
  'letter_part',
  'math',
  'unicodedata',
  'bisect',
  're',
  'sys',
] as const;
