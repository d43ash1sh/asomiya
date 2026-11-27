# Error Reference — ভুলৰ তালিকা

Every diagnostic has a stable code. Messages are in Assamese by default; pass `--lang en` for English.
The messages below come from the real catalogue in [`src/errors/messages.ts`](../src/errors/messages.ts),
filled in with example values.

Exit codes: `0` success · `1` the program had an error · `2` bad command-line usage or unreadable file.

## Lexical errors — শব্দ-বিশ্লেষণৰ ভুল (`L`)

### L001

- **অসমীয়া:** অচিনাকি আখৰ "@" (U+0040) ইয়াত ব্যৱহাৰ কৰিব নোৱাৰি
- **English:** Unexpected character "@" (U+0040)
- **Example:** `ধৰা ক = @`

### L002

- **অসমীয়া:** পাঠটো বন্ধ কৰা হোৱা নাই — একে শাৰীতে শেষত " চিহ্ন লাগিব
- **English:** Unterminated string — a closing " is required on the same line
- **Example:** `ধৰা ক = "অসম`

### L003

- **অসমীয়া:** মন্তব্যটো বন্ধ কৰা হোৱা নাই — শেষত */ লাগিব
- **English:** Unterminated block comment — a closing */ is required
- **Example:** `/* মন্তব্য …`

### L004

- **অসমীয়া:** অবৈধ এস্কেপ চিহ্ন "\q"। ব্যৱহাৰ কৰিব পাৰি: \n \t \r \" \\
- **English:** Invalid escape sequence "\q". Allowed: \n \t \r \" \\
- **Example:** `"\q"`

### L005

- **অসমীয়া:** একেটা সংখ্যাত অসমীয়া আৰু ইংৰাজী অংক মিহলাই লিখিব নোৱাৰি: ১2
- **English:** A number cannot mix Assamese and ASCII digits: ১2
- **Example:** `ধৰা ক = ১2`

### L006

- **অসমীয়া:** অবৈধ সংখ্যা: ১২ক
- **English:** Malformed number: ১২ক
- **Example:** `ধৰা ক = ১২ক`

### L007

- **অসমীয়া:** "া" (U+09BE) চিহ্নটোৰ আগত কোনো আখৰ নাই
- **English:** Combining mark "া" (U+09BE) has no base letter before it
- **Example:** `ধৰা ক = া`

### L008

- **অসমীয়া:** অদৃশ্য নিয়ন্ত্ৰণ আখৰ U+202E পাঠ বা মন্তব্যত ব্যৱহাৰ কৰিব নোৱাৰি (ই ক'ডটো যিদৰে দেখা যায় তাতকৈ বেলেগ দেখুৱাব পাৰে)
- **English:** Invisible control character U+202E is not allowed in text or comments (it can make code look different from what runs)
- **Example:** `কোৱা("abc<U+202E>cba")`

## Syntax errors — বাক্য-গঠনৰ ভুল (`P`)

### P001

- **অসমীয়া:** ইয়াত ")" আশা কৰা হৈছিল, কিন্তু পোৱা গ'ল "২"
- **English:** Expected ")" but found "২"
- **Example:** `কোৱা(১ ২)`

### P002

- **অসমীয়া:** ইয়াত এটা মান আশা কৰা হৈছিল, কিন্তু পোৱা গ'ল ফাইলৰ শেষ
- **English:** Expected an expression but found end of input
- **Example:** `ধৰা ক =`

### P003

- **অসমীয়া:** "="ৰ বাওঁফালে কেৱল চলকৰ নাম বা তালিকাৰ উপাদান থাকিব পাৰে
- **English:** Invalid assignment target — only a variable or a list element may appear left of "="
- **Example:** `১ = ২`

### P004

- **অসমীয়া:** "ৰখা" কেৱল লুপৰ ("যেতিয়ালৈকে" বা "প্ৰতিটো") ভিতৰত ব্যৱহাৰ কৰিব পাৰি
- **English:** "ৰখা" (break) can only be used inside a loop
- **Example:** `ৰখা  (outside a loop)`

### P005

- **অসমীয়া:** "ঘূৰাইদিয়া" কেৱল ফাংচনৰ ভিতৰত ব্যৱহাৰ কৰিব পাৰি
- **English:** "ঘূৰাইদিয়া" (return) can only be used inside a function
- **Example:** `ঘূৰাইদিয়া ১  (outside a function)`

### P006

- **অসমীয়া:** প্ৰাচল "ক" এবাৰতকৈ বেছি লিখা হৈছে
- **English:** Duplicate parameter "ক"
- **Example:** `ফাংচন ফ(ক, ক) { }`

### P007

- **অসমীয়া:** বাক্যৰ পিছত নতুন শাৰী বা ";" লাগিব, কিন্তু পোৱা গ'ল "খ"
- **English:** Expected a line break or ";" after the statement, but found "খ"
- **Example:** `ক খ`

### P008

- **অসমীয়া:** ইয়াত চলকৰ নাম আশা কৰা হৈছিল, কিন্তু পোৱা গ'ল "="
- **English:** Expected a variable name but found "="
- **Example:** `ধৰা = ৫`

### P009

- **অসমীয়া:** "যদি" এটা সংৰক্ষিত শব্দ; ইয়াক নাম হিচাপে ব্যৱহাৰ কৰিব নোৱাৰি
- **English:** "যদি" is a reserved keyword and cannot be used as a name
- **Example:** `ধৰা যদি = ৫`

### P010

- **অসমীয়া:** প্ৰগ্ৰামটোৰ গঠন অতি গভীৰ: ২৫৬তকৈ বেছি স্তৰৰ বন্ধনী বা ব্লক
- **English:** Program is nested too deeply: more than 256 levels of brackets or blocks
- **Example:** `(((((… ৩০০ levels …)))))`

### P011

- **অসমীয়া:** "আগবাঢ়া" কেৱল লুপৰ ("যেতিয়ালৈকে" বা "প্ৰতিটো") ভিতৰত ব্যৱহাৰ কৰিব পাৰি
- **English:** "আগবাঢ়া" (continue) can only be used inside a loop
- **Example:** `আগবাঢ়া  (outside a loop)`

### P012

- **অসমীয়া:** Python লৈ অনুবাদ কৰিব নোৱাৰি: Python ত এটাৰ ভিতৰত আনটোকৈ সৰ্বোচ্চ ২০টা লুপ থাকিব পাৰে
- **English:** Cannot translate to Python: Python allows at most 20 loops inside each other
- **Example:** `asomiya python, with ২১ loops inside each other`

### P013

- **অসমীয়া:** "মাজত"ৰ আগত তালিকাখন লিখক: প্ৰতিটো ফল তালিকা মাজত { … }
- **English:** Write the list before "মাজত": প্ৰতিটো ফল <list> মাজত { … }
- **Example:** `প্ৰতিটো ফল মাজত ফলবোৰ { … }`

## Runtime errors — চলোৱাৰ সময়ৰ ভুল (`R`)

### R001

- **অসমীয়া:** "খ" নামৰ কোনো চলক ঘোষণা কৰা হোৱা নাই (প্ৰথমে "ধৰা খ = …" লিখক)
- **English:** Undefined variable "খ" (declare it first with "ধৰা")
- **Example:** `কোৱা(খ)  (খ never declared)`

### R002

- **অসমীয়া:** "ক" এই পৰিসৰত ইতিমধ্যে ঘোষণা কৰা হৈছে
- **English:** "ক" is already declared in this scope
- **Example:** `ধৰা ক = ১; ধৰা ক = ২`

### R003

- **অসমীয়া:** "-" ব্যৱহাৰ কৰিব নোৱাৰি: বাওঁফালে পাঠ, সোঁফালে সংখ্যা
- **English:** Cannot apply "-" to text and number
- **Example:** `"ক" - ১`

### R004

- **অসমীয়া:** শূন্যৰে হৰণ কৰিব নোৱাৰি
- **English:** Division by zero
- **Example:** `১ / ০`

### R005

- **অসমীয়া:** সংখ্যা এটা ফাংচন নহয়, গতিকে ইয়াক মাতিব নোৱাৰি
- **English:** Cannot call a value of type number
- **Example:** `ধৰা ক = ৫; ক()`

### R006

- **অসমীয়া:** "যোগ" ফাংচনে ২টা মান বিচাৰে, কিন্তু ১টা দিয়া হৈছে
- **English:** "যোগ" expects 2 argument(s) but got 1
- **Example:** `যোগ(১)`

### R007

- **অসমীয়া:** চৰ্তটো সঁচা বা মিছা হ'ব লাগিব, কিন্তু ইয়াৰ প্ৰকাৰ সংখ্যা
- **English:** A condition must be a boolean (সঁচা/মিছা) but got number
- **Example:** `যদি (১) { }`

### R008

- **অসমীয়া:** ১০০০০০০০টা পদক্ষেপৰ সীমা পাৰ হ'ল — হয়তো লুপটো কেতিয়াও শেষ নহয়
- **English:** Execution step limit of 10000000 exceeded — possible infinite loop
- **Example:** `যেতিয়ালৈকে (সঁচা) { }`

### R009

- **অসমীয়া:** ফাংচন মতাৰ গভীৰতা ৫০০ পাৰ হ'ল — হয়তো ৰিকাৰ্চন কেতিয়াও শেষ নহয়
- **English:** Maximum call depth of 500 exceeded — possible infinite recursion
- **Example:** `ফাংচন ফ() { ঘূৰাইদিয়া ফ() }`

### R010

- **অসমীয়া:** সূচী ৩ সীমাৰ বাহিৰত; দৈৰ্ঘ্য ৩
- **English:** Index 3 is out of range for length 3
- **Example:** `[১, ২, ৩][৩]`

### R011

- **অসমীয়া:** সূচী এটা অখণ্ড সংখ্যা হ'ব লাগিব, কিন্তু পোৱা গ'ল ০.৫
- **English:** An index must be a whole number but got ০.৫
- **Example:** `ল[০.৫]`

### R012

- **অসমীয়া:** সংখ্যাত সূচী ব্যৱহাৰ কৰিব নোৱাৰি
- **English:** Cannot index into a value of type number
- **Example:** `৫[০]`

### R013

- **অসমীয়া:** "-" পাঠৰ ওপৰত প্ৰয়োগ কৰিব নোৱাৰি
- **English:** Cannot apply unary "-" to text
- **Example:** `-"ক"`

### R014

- **অসমীয়া:** "দৈৰ্ঘ্য" ফাংচনৰ ১ নম্বৰ মানটো পাঠ বা তালিকা হ'ব লাগিব, কিন্তু পোৱা গ'ল সংখ্যা
- **English:** Argument 1 of "দৈৰ্ঘ্য" must be text or list but got number
- **Example:** `দৈৰ্ঘ্য(৫)`

### R015

- **অসমীয়া:** ইয়াত ইনপুট পঢ়াৰ সুবিধা উপলব্ধ নহয়
- **English:** Input is not available here
- **Example:** `সোধা()  (in the REPL)`

### R016

- **অসমীয়া:** পাঠৰ আখৰ সলনি কৰিব নোৱাৰি; তাৰ সলনি নতুন পাঠ এটা বনাওক
- **English:** Text values are immutable; build a new text instead
- **Example:** `ধৰা শ = "ক"; শ[০] = "খ"`

### R017

- **অসমীয়া:** "আৰু"ৰ দুয়োফালে সঁচা বা মিছা লাগিব, কিন্তু পোৱা গ'ল সংখ্যা
- **English:** Operands of "আৰু" must be boolean but got number
- **Example:** `১ আৰু সঁচা`

### R018

- **অসমীয়া:** প্ৰগ্ৰামটো অতি গভীৰলৈ সোমাই গ'ল আৰু ইন্টাৰপ্ৰেটাৰৰ ষ্টেক শেষ হ'ল; ৰিকাৰ্চনৰ গভীৰতা কমাওক
- **English:** Nesting too deep: the interpreter ran out of stack space; reduce the recursion depth
- **Example:** `very deep recursion with a raised --max-depth`

### R019

- **অসমীয়া:** তালিকাখন অতি দীঘল হ'ল — সৰ্বোচ্চ দৈৰ্ঘ্য ১০০০০০০
- **English:** List is too long — the maximum length is 1000000
- **Example:** `ধৰা ল = [১]; যেতিয়ালৈকে (সঁচা) { ল = ল + ল }`

### R020

- **অসমীয়া:** "দৈৰ্ঘ্য" এটা অন্তৰ্নিৰ্মিত ফাংচন; ইয়াক সলনি কৰিব নোৱাৰি (নিজৰ বাবে "ধৰা দৈৰ্ঘ্য = …" লিখক)
- **English:** "দৈৰ্ঘ্য" is a built-in and cannot be reassigned (declare your own with "ধৰা")
- **Example:** `দৈৰ্ঘ্য = ৫`

### R021

- **অসমীয়া:** "প্ৰতিটো" লুপে কেৱল তালিকা বা পাঠৰ ওপৰেৰে যাব পাৰে, কিন্তু ইয়াৰ প্ৰকাৰ সংখ্যা
- **English:** "প্ৰতিটো" can only loop over a list or text, but got number
- **Example:** `প্ৰতিটো ক ১০ মাজত { … }`

### R022

- **অসমীয়া:** প্ৰগ্ৰামটোৱে অতি বেছি ছপা কৰিলে — সৰ্বোচ্চ ১০০০০০০ আখৰ; কোনো লুপ শেষ নোহোৱাকৈ চলি আছে নেকি চাওক
- **English:** The program printed too much output — the maximum is 1000000 characters; check for a loop that never ends
- **Example:** `যেতিয়ালৈকে (সঁচা) { কোৱা("নমস্কাৰ") }`
