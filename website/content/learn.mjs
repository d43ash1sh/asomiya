// The "Learn" section: a step-by-step tutorial. Every example is run when the site is built.

const quickStart = {
  id: 'learn',
  path: 'learn/',
  title: { en: 'Quick start', as: 'দ্ৰুত আৰম্ভণি' },
  eyebrow: { en: 'Learn Asomiya', as: 'অসমীয়া শিকক' },
  description: {
    en: 'Learn the basics of Asomiya, a programming language in Assamese, in a few minutes.',
    as: 'কেইমিনিটমানৰ ভিতৰতে অসমীয়া প্ৰগ্ৰামিং ভাষাৰ মূল কথাবোৰ শিকক।',
  },
  intro: {
    en: 'Welcome to Asomiya! This page shows you the 80% of the language you will use every day. You don’t need to install anything: press <strong>Try it</strong> on any example to run it in your browser.',
    as: 'অসমীয়ালৈ স্বাগতম! এই পৃষ্ঠাত ভাষাটোৰ সেই অংশখিনি দেখুওৱা হৈছে যিখিনি আপুনি সদায় ব্যৱহাৰ কৰিব। একো ইনষ্টল কৰিব নালাগে: যিকোনো উদাহৰণৰ <strong>চলাই চাওক</strong> টিপিলে ব্ৰাউজাৰতে চলিব।',
  },
  body: {
    en: (h) => `
${h.note('tip', `<p>Every example on this site has two tabs: <strong>অসমীয়া</strong> (Assamese script) and <strong>English letters</strong>. They are the same program. Pick one and the whole site follows your choice.</p>`)}
${h.h2('you-will-learn', 'You will learn')}
<ul>
  <li>How to show text on the screen</li>
  <li>How to store values in variables</li>
  <li>How to make decisions and repeat things</li>
  <li>How to write your own functions</li>
</ul>
<p>You don’t need to install anything to follow along: every example has a <strong>Try it</strong> button that opens it in the <a href="${h.playground}">playground</a>, where you can change it and run it again.</p>
${h.figure('playground', 'The playground: write on the left, press Run, and the output appears on the right.')}
${h.h2('hello', 'Say hello')}
<p>A program is a list of instructions. <code>কোৱা</code> (<code>kowa</code>, “say”) prints whatever you give it:</p>
${h.example('কোৱা("নমস্কাৰ, পৃথিৱী!")', 'kowa("Nomoskar, prithibi!")')}
${h.h2('variables', 'Remember values')}
<p><code>ধৰা</code> (<code>dhora</code>, “suppose / let”) creates a variable: a name for a value. Use <code>+</code> to join text.</p>
${h.example('ধৰা নাম = "অসম"\nকোৱা("মোৰ ৰাজ্য " + নাম)', 'dhora naam = "Oxom"\nkowa("mor rajyo " + naam)')}
${h.h2('decisions', 'Make decisions')}
<p><code>যদি</code> (<code>jodi</code>, “if”) runs a block only when a condition is true. <code>নহ'লে</code> (<code>nohole</code>, “otherwise”) runs when it isn’t.</p>
${h.example('ধৰা নম্বৰ = ৭৫\nযদি (নম্বৰ >= ৩০) {\n    কোৱা("উত্তীৰ্ণ")\n} নহ\'লে {\n    কোৱা("আকৌ চেষ্টা কৰক")\n}', 'dhora nombor = 75\njodi (nombor >= 30) {\n    kowa("uttirno")\n} nohole {\n    kowa("akou sesta korok")\n}')}
${h.h2('repeat', 'Repeat things')}
<p><code>যেতিয়ালৈকে</code> (<code>jetialoike</code>, “as long as”) repeats a block while its condition stays true:</p>
${h.example('ধৰা ক = ১\nযেতিয়ালৈকে (ক <= ৩) {\n    কোৱা("বাৰ", ক)\n    ক = ক + ১\n}', 'dhora k = 1\njetialoike (k <= 3) {\n    kowa("bar", k)\n    k = k + 1\n}')}
${h.h2('functions', 'Write functions')}
<p><code>ফাংচন</code> (<code>fangchon</code>) defines a reusable piece of code. <code>ঘূৰাইদিয়া</code> (<code>ghuraidiya</code>, “give back”) returns a result:</p>
${h.example('ফাংচন বৰ্গ(ন) {\n    ঘূৰাইদিয়া ন * ন\n}\nকোৱা(বৰ্গ(৯))', 'fangchon borgo(n) {\n    ghuraidiya n * n\n}\nkowa(borgo(9))')}
${h.h2('next-steps', 'Next steps')}
<p>You now know the core of Asomiya. Continue with <a href="${h.link('learn/installation/')}">Installation</a> to run programs on your computer, or jump straight into the <a href="${h.playground}">playground</a>.</p>`,
    as: (h) => `
${h.note('tip', `<p>এই ছাইটৰ প্ৰতিটো উদাহৰণৰ দুটা টেব আছে: <strong>অসমীয়া</strong> আৰু <strong>ইংৰাজী আখৰ</strong>। দুয়োটা একেটা প্ৰগ্ৰাম। এটা বাছি লওক, গোটেই ছাইটটোৱে সেইটোকে মানিব।</p>`)}
${h.h2('you-will-learn', 'আপুনি শিকিব')}
<ul>
  <li>স্ক্ৰীণত লিখা কেনেকৈ দেখুৱাব</li>
  <li>চলকত মান কেনেকৈ সাঁচি থ’ব</li>
  <li>সিদ্ধান্ত কেনেকৈ ল’ব আৰু কাম কেনেকৈ বাৰে বাৰে কৰিব</li>
  <li>নিজৰ ফাংচন কেনেকৈ লিখিব</li>
</ul>
<p>উদাহৰণবোৰ চেষ্টা কৰিবলৈ একো ইনষ্টল কৰিব নালাগে: প্ৰতিটো উদাহৰণৰ <strong>চলাই চাওক</strong> বুটামে ইয়াক <a href="${h.playground}">প্লেগ্ৰাউণ্ডত</a> খোলে, য’ত আপুনি সলনি কৰি আকৌ চলাব পাৰে।</p>
${h.figure('playground', 'প্লেগ্ৰাউণ্ড: বাওঁফালে লিখক, Run টিপক, আৰু সোঁফালে ফলাফল ওলাব।')}
${h.h2('hello', 'নমস্কাৰ কওক')}
<p>প্ৰগ্ৰাম হৈছে নিৰ্দেশনাৰ এখন তালিকা। <code>কোৱা</code>-ই যি দিয়ে তাকে ছপা কৰে:</p>
${h.example('কোৱা("নমস্কাৰ, পৃথিৱী!")', 'kowa("Nomoskar, prithibi!")')}
${h.h2('variables', 'মান মনত ৰাখক')}
<p><code>ধৰা</code>-ই এটা চলক সৃষ্টি কৰে: এটা মানৰ নাম। লিখা জোৰা দিবলৈ <code>+</code> ব্যৱহাৰ কৰক।</p>
${h.example('ধৰা নাম = "অসম"\nকোৱা("মোৰ ৰাজ্য " + নাম)', 'dhora naam = "Oxom"\nkowa("mor rajyo " + naam)')}
${h.h2('decisions', 'সিদ্ধান্ত লওক')}
<p><code>যদি</code>-ৰ চৰ্ত সঁচা হ’লেহে ব্লকটো চলে। চৰ্ত মিছা হ’লে <code>নহ'লে</code>-ৰ ব্লকটো চলে।</p>
${h.example('ধৰা নম্বৰ = ৭৫\nযদি (নম্বৰ >= ৩০) {\n    কোৱা("উত্তীৰ্ণ")\n} নহ\'লে {\n    কোৱা("আকৌ চেষ্টা কৰক")\n}', 'dhora nombor = 75\njodi (nombor >= 30) {\n    kowa("uttirno")\n} nohole {\n    kowa("akou sesta korok")\n}')}
${h.h2('repeat', 'বাৰে বাৰে কৰক')}
<p>চৰ্ত সঁচা হৈ থকালৈকে <code>যেতিয়ালৈকে</code>-ই ব্লকটো বাৰে বাৰে চলায়:</p>
${h.example('ধৰা ক = ১\nযেতিয়ালৈকে (ক <= ৩) {\n    কোৱা("বাৰ", ক)\n    ক = ক + ১\n}', 'dhora k = 1\njetialoike (k <= 3) {\n    kowa("bar", k)\n    k = k + 1\n}')}
${h.h2('functions', 'ফাংচন লিখক')}
<p><code>ফাংচন</code>-এ বাৰে বাৰে ব্যৱহাৰ কৰিব পৰা ক’ডৰ অংশ এটা বনায়। <code>ঘূৰাইদিয়া</code>-ই ফলাফল ঘূৰাই দিয়ে:</p>
${h.example('ফাংচন বৰ্গ(ন) {\n    ঘূৰাইদিয়া ন * ন\n}\nকোৱা(বৰ্গ(৯))', 'fangchon borgo(n) {\n    ghuraidiya n * n\n}\nkowa(borgo(9))')}
${h.h2('next-steps', 'ইয়াৰ পিছত')}
<p>আপুনি এতিয়া অসমীয়াৰ মূল কথাবোৰ জানে। নিজৰ কম্পিউটাৰত প্ৰগ্ৰাম চলাবলৈ <a href="${h.link('learn/installation/')}">ইনষ্টল কৰা</a> পঢ়ক, বা পোনপটীয়াকৈ <a href="${h.playground}">প্লেগ্ৰাউণ্ড</a> খোলক।</p>`,
  },
};

const installation = {
  id: 'installation',
  path: 'learn/installation/',
  title: { en: 'Installation', as: 'ইনষ্টল কৰা' },
  description: {
    en: 'Install the Asomiya command-line tool with npm and run your first program.',
    as: 'npm ৰে অসমীয়াৰ কমাণ্ড-লাইন সঁজুলি ইনষ্টল কৰক আৰু প্ৰথম প্ৰগ্ৰামটো চলাওক।',
  },
  intro: {
    en: 'You can use Asomiya in the browser without installing anything. To run programs on your own computer, install the <code>asomiya</code> command.',
    as: 'একো ইনষ্টল নকৰাকৈ ব্ৰাউজাৰতে অসমীয়া ব্যৱহাৰ কৰিব পাৰি। নিজৰ কম্পিউটাৰত প্ৰগ্ৰাম চলাবলৈ <code>asomiya</code> কমাণ্ডটো ইনষ্টল কৰক।',
  },
  body: {
    en: (h) => `
${h.h2('try-online', 'Try it online')}
<p>The <a href="${h.playground}">playground</a> runs the real interpreter in your browser. Nothing is sent to a server.</p>
${h.h2('requirements', 'Requirements')}
<p>You need <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">Node.js</a> 20 or newer. Check your version:</p>
${h.shell('node --version')}
${h.h2('install', 'Install')}
${h.shell('npm install -g asomiya')}
<p>The <code>-g</code> makes the <code>asomiya</code> command available everywhere. Check that it works:</p>
${h.shell('asomiya --version')}
${h.note('warning', `<p><strong><code>asomiya: command not found</code>?</strong> You probably installed without <code>-g</code>. Run <code>npm install -g asomiya</code>, or use it once without installing: <code>npx asomiya</code>.</p>`)}
${h.h2('run-a-file', 'Run a file')}
<p>Create a file called <code>hello.asom</code> with this line:</p>
${h.example('কোৱা("নমস্কাৰ, অসম!")', 'kowa("Nomoskar, Oxom!")', { run: false })}
<p>Then run it:</p>
${h.shell('asomiya run hello.asom')}
${h.h2('repl', 'The interactive REPL')}
<p>Type <code>asomiya</code> on its own to start the REPL, where each line runs as soon as you press Enter. It’s the fastest way to experiment. Type <code>.help</code> for help and <code>.exit</code> (or Ctrl+D) to quit.</p>
${h.shell('asomiya')}
${h.note('warning', `<p>Many terminals, including the one inside VS Code, can’t join Assamese letters, so text like <code>যুগ্ম</code> may look broken there. The program is still right. For clean Assamese output, run it in the <a href="${h.link('extension/')}">VS Code extension</a> (its Asomiya panel) or in the <a href="${h.playground}">playground</a>, or write in English letters.</p>`)}
${h.h2('update', 'Update or uninstall')}
${h.shell('npm install -g asomiya@latest\nnpm uninstall -g asomiya')}
${h.h2('editor', 'Writing code')}
<p>Any text editor works. Save files as UTF-8 with the <code>.asom</code> extension. To type Assamese script, add an Assamese keyboard in your system settings, or write in <a href="${h.link('learn/english-letters/')}">English letters</a>.</p>
${h.figure('vscode-run', 'An Asomiya program in VS Code. ▶ Run shows the output in the Asomiya panel.')}
<p>For the best experience, install the <a href="${h.link('extension/')}">Asomiya extension</a> for VS Code, Cursor, Windsurf or VSCodium: colours for your code, errors as you type, a ▶ Run button and Show in Python. In Cursor, Windsurf and VSCodium, search “Asomiya” in Extensions.</p>`,
    as: (h) => `
${h.h2('try-online', 'অনলাইনত চলাই চাওক')}
<p><a href="${h.playground}">প্লেগ্ৰাউণ্ড</a>-এ আপোনাৰ ব্ৰাউজাৰতে সঁচা ইণ্টাৰপ্ৰেটাৰটো চলায়। কোনো চাৰ্ভাৰলৈ একো নাযায়।</p>
${h.h2('requirements', 'কি লাগিব')}
<p><a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">Node.js</a> ২০ বা তাতকৈ নতুন সংস্কৰণ লাগিব। আপোনাৰ সংস্কৰণ চাওক:</p>
${h.shell('node --version')}
${h.h2('install', 'ইনষ্টল কৰক')}
${h.shell('npm install -g asomiya')}
<p><code>-g</code>-ৰ বাবে <code>asomiya</code> কমাণ্ডটো সকলোতে ব্যৱহাৰ কৰিব পাৰি। চলিছে নে নাই চাওক:</p>
${h.shell('asomiya --version')}
${h.note('warning', `<p><strong><code>asomiya: command not found</code> দেখুৱাইছে?</strong> হয়তো <code>-g</code> নিদিয়াকৈ ইনষ্টল কৰিলে। <code>npm install -g asomiya</code> চলাওক, বা ইনষ্টল নকৰাকৈ এবাৰ ব্যৱহাৰ কৰক: <code>npx asomiya</code>।</p>`)}
${h.h2('run-a-file', 'ফাইল চলাওক')}
<p><code>hello.asom</code> নামৰ এটা ফাইল বনাওক আৰু তাত এই শাৰীটো লিখক:</p>
${h.example('কোৱা("নমস্কাৰ, অসম!")', 'kowa("Nomoskar, Oxom!")', { run: false })}
<p>তাৰ পিছত চলাওক:</p>
${h.shell('asomiya run hello.asom')}
${h.h2('repl', 'REPL')}
<p>অকল <code>asomiya</code> লিখিলে REPL আৰম্ভ হয়, য’ত Enter টিপাৰ লগে লগে প্ৰতিটো শাৰী চলে। পৰীক্ষা কৰাৰ আটাইতকৈ সহজ উপায়। সহায়ৰ বাবে <code>.সহায়</code> আৰু ওলাই যাবলৈ <code>.প্ৰস্থান</code> (বা Ctrl+D) লিখক।</p>
${h.shell('asomiya')}
${h.note('warning', `<p>বহুতো টাৰ্মিনেলে, VS Code ৰ ভিতৰৰটোকে ধৰি, অসমীয়া আখৰ জোৰা লগাব নোৱাৰে, গতিকে <code>যুগ্ম</code> ৰ দৰে লিখা তাত ভঙা যেন লাগিব পাৰে। প্ৰগ্ৰামটো কিন্তু শুদ্ধ। পৰিষ্কাৰ অসমীয়া ফলাফলৰ বাবে <a href="${h.link('extension/')}">VS Code এক্সটেনশ্যনত</a> (ইয়াৰ অসমীয়া পেনেলত) বা <a href="${h.playground}">প্লেগ্ৰাউণ্ডত</a> চলাওক, বা ইংৰাজী আখৰত লিখক।</p>`)}
${h.h2('update', 'আপডেট বা আনইনষ্টল')}
${h.shell('npm install -g asomiya@latest\nnpm uninstall -g asomiya')}
${h.h2('editor', 'ক’ড লিখা')}
<p>যিকোনো টেক্সট এডিটৰ চলিব। ফাইলবোৰ UTF-8 ত <code>.asom</code> এক্সটেনচনৰে সাঁচক। অসমীয়া লিপিত লিখিবলৈ ছিষ্টেম ছেটিংছত অসমীয়া কীব’ৰ্ড যোগ কৰক, বা <a href="${h.link('learn/english-letters/')}">ইংৰাজী আখৰত</a> লিখক।</p>
${h.figure('vscode-run', 'VS Code ত এটা অসমীয়া প্ৰগ্ৰাম। ▶ চলাওক টিপিলে অসমীয়া পেনেলত ফলাফল ওলায়।')}
<p>সবাতোকৈ ভাল অভিজ্ঞতাৰ বাবে VS Code, Cursor, Windsurf বা VSCodium ত <a href="${h.link('extension/')}">অসমীয়া এক্সটেনশ্যন</a> ইনষ্টল কৰক: ক’ডৰ ৰং, লিখোঁতেই ভুল, ▶ চলোৱা বুটাম আৰু Python ত দেখুওৱা। Cursor, Windsurf আৰু VSCodium ত Extensions ত “Asomiya” বিচাৰক।</p>`,
  },
};

const englishLetters = {
  id: 'english-letters',
  path: 'learn/english-letters/',
  title: { en: 'Writing in English letters', as: 'ইংৰাজী আখৰত লিখা' },
  description: {
    en: 'Write Asomiya programs in romanised Assamese (dhora, kowa, jodi) without an Assamese keyboard.',
    as: 'অসমীয়া কীব’ৰ্ড নোহোৱাকৈ ইংৰাজী আখৰত (dhora, kowa, jodi) অসমীয়া প্ৰগ্ৰাম লিখক।',
  },
  intro: {
    en: 'Every keyword and built-in function also has spellings in English letters, the way people type Assamese in chats. You don’t need an Assamese keyboard.',
    as: 'প্ৰতিটো মূল শব্দ আৰু অন্তৰ্নিৰ্মিত ফাংচনৰ ইংৰাজী আখৰতো বানান আছে, মানুহে চেটত অসমীয়া যিদৰে লিখে। অসমীয়া কীব’ৰ্ড নালাগে।',
  },
  body: {
    en: (h) => `
${h.sample('dhora naam = "Rita"\njodi (naam != "") {\n    kowa("Nomoskar, " + naam)\n} nohole {\n    kowa("naam nai")\n}')}
${h.h2('spelling', 'There is no single “correct” spelling')}
<p>Assamese has no standard way of writing it in English letters. কোৱা can be <code>kowa</code>, <code>kuwa</code>, <code>kua</code> or <code>koa</code>. Many speakers write স as <code>x</code> (as in <em>Oxom</em> for অসম). So Asomiya accepts several common spellings for every word. The first one in each list is the preferred spelling.</p>
${h.table(
  ['Assamese', 'English letters', 'Meaning'],
  [
    ['<code>ধৰা</code>', '<code>dhora</code>, <code>dhara</code>', 'let (variable)'],
    [
      '<code>কোৱা</code>',
      '<code>kowa</code>, <code>kuwa</code>, <code>kua</code>, <code>koa</code>',
      'print',
    ],
    ['<code>যদি</code>', '<code>jodi</code>, <code>zodi</code>, <code>jadi</code>', 'if'],
    [
      "<code>নহ'লে</code>",
      "<code>nohole</code>, <code>noh'le</code>, <code>nohle</code>, <code>nhole</code> …",
      'else',
    ],
    [
      '<code>যেতিয়ালৈকে</code>',
      '<code>jetialoike</code>, <code>zetialoike</code>, <code>jetiyaloike</code> …',
      'while',
    ],
    [
      '<code>প্ৰতিটো</code> … <code>মাজত</code>',
      '<code>protito</code> … <code>majot</code>',
      'for each … in',
    ],
    ['<code>ৰখা</code>', '<code>rokha</code>, <code>rakha</code>', 'break'],
    ['<code>আগবাঢ়া</code>', '<code>aagbara</code>, <code>agbara</code> …', 'continue'],
    [
      '<code>ফাংচন</code>',
      '<code>fangchon</code>, <code>phangchon</code>, <code>fanchon</code>',
      'function',
    ],
    ['<code>ঘূৰাইদিয়া</code>', '<code>ghuraidiya</code>, <code>ghuraidia</code>', 'return'],
    [
      '<code>সঁচা</code> / <code>মিছা</code>',
      '<code>xosa</code>, <code>hosa</code>, <code>sosa</code> … / <code>misa</code>, <code>micha</code> …',
      'true / false',
    ],
    ['<code>খালী</code>', '<code>khali</code>, <code>khaali</code>', 'null'],
    ['<code>আৰু</code> / <code>বা</code>', '<code>aru</code> / <code>ba</code>', 'and / or'],
  ],
)}
<p>The complete list, including built-in functions, is in the <a href="${h.link('reference/keywords/')}">keyword reference</a>.</p>
${h.h2('rules', 'Three rules')}
<ol>
  <li><strong>Lower-case only.</strong> <code>jodi</code> means যদি, but <code>Jodi</code> is an ordinary name you can use for a variable.</li>
  <li><strong>Mix freely.</strong> Assamese script and English letters work in the same program.</li>
  <li><strong>Keywords are reserved.</strong> You can’t name a variable <code>ba</code> or <code>misa</code>, because those are keywords.</li>
</ol>
${h.sample('ধৰা ফল = xosa aru !misa\nkowa(ফল)', { title: 'mixed.asom' })}
${h.h2('typos', 'Typos get a hint')}
<p>If a word is close to a keyword but not quite right, the error suggests what you meant:</p>
${h.sample('dhora x = 5\njodii (x > 1) {\n    kowa("dangor")\n}', { expectError: true })}
${h.h2('output', 'Output in English letters')}
<p>A program whose keywords are in English letters also prints in English letters: numbers as <code>123</code> and true/false/null as <code>xosa</code>, <code>misa</code>, <code>khali</code>. Programs in Assamese script print <code>১২৩</code>, <code>সঁচা</code>, <code>মিছা</code>, <code>খালী</code>.</p>
${h.example('কোৱা(১০ + ২০, সঁচা, খালী)', 'kowa(10 + 20, xosa, khali)')}`,
    as: (h) => `
${h.sample('dhora naam = "Rita"\njodi (naam != "") {\n    kowa("Nomoskar, " + naam)\n} nohole {\n    kowa("naam nai")\n}')}
${h.h2('spelling', 'এটাই “শুদ্ধ” বানান নাই')}
<p>ইংৰাজী আখৰত অসমীয়া লিখাৰ কোনো নিৰ্দিষ্ট নিয়ম নাই। কোৱা হ’ব পাৰে <code>kowa</code>, <code>kuwa</code>, <code>kua</code> বা <code>koa</code>। বহুতে স-ক <code>x</code> লিখে (যেনে অসমৰ বাবে <em>Oxom</em>)। সেয়েহে অসমীয়াই প্ৰতিটো শব্দৰ কেইবাটাও প্ৰচলিত বানান মানি লয়। প্ৰতিখন তালিকাৰ প্ৰথমটো পছন্দৰ বানান।</p>
${h.table(
  ['অসমীয়া', 'ইংৰাজী আখৰ', 'অৰ্থ'],
  [
    ['<code>ধৰা</code>', '<code>dhora</code>, <code>dhara</code>', 'চলক ঘোষণা'],
    [
      '<code>কোৱা</code>',
      '<code>kowa</code>, <code>kuwa</code>, <code>kua</code>, <code>koa</code>',
      'ছপা কৰা',
    ],
    ['<code>যদি</code>', '<code>jodi</code>, <code>zodi</code>, <code>jadi</code>', 'যদি'],
    [
      "<code>নহ'লে</code>",
      "<code>nohole</code>, <code>noh'le</code>, <code>nohle</code>, <code>nhole</code> …",
      'নহ’লে',
    ],
    [
      '<code>যেতিয়ালৈকে</code>',
      '<code>jetialoike</code>, <code>zetialoike</code>, <code>jetiyaloike</code> …',
      'লুপ',
    ],
    [
      '<code>প্ৰতিটো</code> … <code>মাজত</code>',
      '<code>protito</code> … <code>majot</code>',
      'প্ৰতিটো উপাদানৰ বাবে লুপ',
    ],
    ['<code>ৰখা</code>', '<code>rokha</code>, <code>rakha</code>', 'লুপ ৰখোৱা'],
    ['<code>আগবাঢ়া</code>', '<code>aagbara</code>, <code>agbara</code> …', 'পৰৱৰ্তী পাকলৈ যোৱা'],
    [
      '<code>ফাংচন</code>',
      '<code>fangchon</code>, <code>phangchon</code>, <code>fanchon</code>',
      'ফাংচন',
    ],
    ['<code>ঘূৰাইদিয়া</code>', '<code>ghuraidiya</code>, <code>ghuraidia</code>', 'মান ঘূৰাই দিয়া'],
    [
      '<code>সঁচা</code> / <code>মিছা</code>',
      '<code>xosa</code>, <code>hosa</code>, <code>sosa</code> … / <code>misa</code>, <code>micha</code> …',
      'সঁচা / মিছা',
    ],
    ['<code>খালী</code>', '<code>khali</code>, <code>khaali</code>', 'খালী'],
    ['<code>আৰু</code> / <code>বা</code>', '<code>aru</code> / <code>ba</code>', 'আৰু / বা'],
  ],
)}
<p>অন্তৰ্নিৰ্মিত ফাংচনসহ সম্পূৰ্ণ তালিকা <a href="${h.link('reference/keywords/')}">মূল শব্দৰ সন্দৰ্ভত</a> আছে।</p>
${h.h2('rules', 'তিনিটা নিয়ম')}
<ol>
  <li><strong>সৰু আখৰত লিখক।</strong> <code>jodi</code> মানে যদি, কিন্তু <code>Jodi</code> এটা সাধাৰণ নাম, চলকৰ নাম হিচাপে ব্যৱহাৰ কৰিব পাৰি।</li>
  <li><strong>মিহলাই লিখিব পাৰি।</strong> একেটা প্ৰগ্ৰামতে অসমীয়া লিপি আৰু ইংৰাজী আখৰ দুয়োটা চলে।</li>
  <li><strong>মূল শব্দবোৰ সংৰক্ষিত।</strong> চলকৰ নাম <code>ba</code> বা <code>misa</code> ৰাখিব নোৱাৰি, কাৰণ সেইবোৰ মূল শব্দ।</li>
</ol>
${h.sample('ধৰা ফল = xosa aru !misa\nkowa(ফল)', { title: 'mixed.asom' })}
${h.h2('typos', 'বানান ভুল হ’লে সহায়')}
<p>কোনো শব্দ মূল শব্দৰ কাষ চাপিছে কিন্তু হুবহু মিলা নাই, তেন্তে ভুলৰ বাৰ্তাই শুদ্ধ শব্দটো কৈ দিয়ে:</p>
${h.sample('dhora x = 5\njodii (x > 1) {\n    kowa("dangor")\n}', { expectError: true })}
${h.h2('output', 'ইংৰাজী আখৰত ফলাফল')}
<p>যি প্ৰগ্ৰামৰ মূল শব্দ ইংৰাজী আখৰত, তাৰ ফলাফলো ইংৰাজী আখৰত: সংখ্যা <code>123</code>, আৰু সঁচা/মিছা/খালী <code>xosa</code>, <code>misa</code>, <code>khali</code>। অসমীয়া লিপিৰ প্ৰগ্ৰামে <code>১২৩</code>, <code>সঁচা</code>, <code>মিছা</code>, <code>খালী</code> দেখুৱায়।</p>
${h.example('কোৱা(১০ + ২০, সঁচা, খালী)', 'kowa(10 + 20, xosa, khali)')}`,
  },
};

const variables = {
  id: 'variables',
  path: 'learn/variables/',
  title: { en: 'Variables', as: 'চলক' },
  description: {
    en: 'Store values in variables with ধৰা (dhora), change them, and understand scope.',
    as: 'ধৰা ব্যৱহাৰ কৰি চলকত মান সাঁচি থওক, সলনি কৰক, আৰু পৰিসৰ বুজি লওক।',
  },
  intro: {
    en: 'A variable is a name for a value. Create one with <code>ধৰা</code> (<code>dhora</code>), which means “suppose” or “let”, just like in Assamese maths books: <em>ধৰা হওক x = ৫</em>.',
    as: 'চলক হৈছে এটা মানৰ নাম। <code>ধৰা</code> দি চলক বনোৱা হয়, ঠিক অসমীয়া অংকৰ কিতাপৰ দৰে: <em>ধৰা হওক x = ৫</em>।',
  },
  body: {
    en: (h) => `
${h.h2('declare', 'Create a variable')}
${h.example('ধৰা নগৰ = "গুৱাহাটী"\nধৰা জনসংখ্যা = ১১২৮০০০\nকোৱা(নগৰ, জনসংখ্যা)', 'dhora nogor = "Guwahati"\ndhora jonoxonkhya = 1128000\nkowa(nogor, jonoxonkhya)')}
<p>Names can use Assamese or English letters, digits and <code>_</code>, but can’t start with a digit. Assamese conjuncts like <code>ক্ষ</code> work as you’d expect.</p>
${h.h2('change', 'Change a value')}
<p>After a variable exists, assign a new value with <code>=</code> (without <code>ধৰা</code>):</p>
${h.example('ধৰা গণনা = ০\nগণনা = গণনা + ১\nগণনা = গণনা + ১\nকোৱা(গণনা)', 'dhora gonona = 0\ngonona = gonona + 1\ngonona = gonona + 1\nkowa(gonona)')}
${h.note('warning', `<p>Using a name before creating it is an error (<code>R001</code>). So is creating the same name twice in the same block (<code>R002</code>).</p>`)}
${h.h2('empty', 'Variables without a value')}
<p>A variable created without a value holds <code>খালী</code> (<code>khali</code>, “empty”):</p>
${h.example('ধৰা ফল\nকোৱা(ফল)', 'dhora fol\nkowa(fol)')}
${h.h2('scope', 'Scope')}
<p>A variable lives inside the block <code>{ … }</code> where it was created. Code inside a block can see the variables outside it, but not the other way round:</p>
${h.example('ধৰা বাহিৰ = "বাহিৰ"\nযদি (সঁচা) {\n    ধৰা ভিতৰ = "ভিতৰ"\n    কোৱা(বাহিৰ, ভিতৰ)\n}\nকোৱা(বাহিৰ)', 'dhora bahir = "bahir"\njodi (xosa) {\n    dhora bhitor = "bhitor"\n    kowa(bahir, bhitor)\n}\nkowa(bahir)')}
${h.h2('statements', 'Ending statements')}
<p>Each statement ends at the end of the line. To put several on one line, separate them with <code>;</code> or the danda <code>।</code>:</p>
${h.example('ধৰা ক = ১। ধৰা খ = ২। কোৱা(ক + খ)', 'dhora k = 1; dhora kh = 2; kowa(k + kh)')}`,
    as: (h) => `
${h.h2('declare', 'চলক বনাওক')}
${h.example('ধৰা নগৰ = "গুৱাহাটী"\nধৰা জনসংখ্যা = ১১২৮০০০\nকোৱা(নগৰ, জনসংখ্যা)', 'dhora nogor = "Guwahati"\ndhora jonoxonkhya = 1128000\nkowa(nogor, jonoxonkhya)')}
<p>নামত অসমীয়া বা ইংৰাজী আখৰ, অংক আৰু <code>_</code> থাকিব পাৰে, কিন্তু অংকেৰে আৰম্ভ হ’ব নোৱাৰে। <code>ক্ষ</code>-ৰ দৰে যুক্তাক্ষৰো ঠিকেই চলে।</p>
${h.h2('change', 'মান সলনি কৰক')}
<p>চলক এটা বনোৱাৰ পিছত <code>=</code> দি নতুন মান দিয়ক (<code>ধৰা</code> নিদিয়াকৈ):</p>
${h.example('ধৰা গণনা = ০\nগণনা = গণনা + ১\nগণনা = গণনা + ১\nকোৱা(গণনা)', 'dhora gonona = 0\ngonona = gonona + 1\ngonona = gonona + 1\nkowa(gonona)')}
${h.note('warning', `<p>নাম বনোৱাৰ আগতে ব্যৱহাৰ কৰাটো ভুল (<code>R001</code>)। একেটা ব্লকত একেটা নাম দুবাৰ বনোৱাটোও ভুল (<code>R002</code>)।</p>`)}
${h.h2('empty', 'মান নথকা চলক')}
<p>মান নিদিয়াকৈ বনোৱা চলকত <code>খালী</code> থাকে:</p>
${h.example('ধৰা ফল\nকোৱা(ফল)', 'dhora fol\nkowa(fol)')}
${h.h2('scope', 'পৰিসৰ')}
<p>চলক এটা যি ব্লক <code>{ … }</code>-ত বনোৱা হয়, তাৰ ভিতৰতে থাকে। ব্লকৰ ভিতৰৰ ক’ডে বাহিৰৰ চলক দেখা পায়, কিন্তু বাহিৰৰ ক’ডে ভিতৰৰ চলক দেখা নাপায়:</p>
${h.example('ধৰা বাহিৰ = "বাহিৰ"\nযদি (সঁচা) {\n    ধৰা ভিতৰ = "ভিতৰ"\n    কোৱা(বাহিৰ, ভিতৰ)\n}\nকোৱা(বাহিৰ)', 'dhora bahir = "bahir"\njodi (xosa) {\n    dhora bhitor = "bhitor"\n    kowa(bahir, bhitor)\n}\nkowa(bahir)')}
${h.h2('statements', 'বাক্য শেষ কৰা')}
<p>প্ৰতিটো বাক্য শাৰীৰ শেষত শেষ হয়। এটা শাৰীত কেইবাটাও লিখিবলৈ <code>;</code> বা দাড়ি <code>।</code> ব্যৱহাৰ কৰক:</p>
${h.example('ধৰা ক = ১। ধৰা খ = ২। কোৱা(ক + খ)', 'dhora k = 1; dhora kh = 2; kowa(k + kh)')}`,
  },
};

const values = {
  id: 'values',
  path: 'learn/values/',
  title: { en: 'Values and types', as: 'মান আৰু প্ৰকাৰ' },
  description: {
    en: 'Numbers, text, true/false, empty, lists and functions: the six kinds of values in Asomiya.',
    as: 'সংখ্যা, পাঠ, সঁচা-মিছা, খালী, তালিকা আৰু ফাংচন: অসমীয়াৰ ছয় প্ৰকাৰৰ মান।',
  },
  intro: {
    en: 'Every value in Asomiya has one of six types. <code>প্ৰকাৰ</code> (<code>prokar</code>) tells you which.',
    as: 'অসমীয়াত প্ৰতিটো মান ছয়টা প্ৰকাৰৰ এটা। <code>প্ৰকাৰ</code>-এ কোনটো সেইটো কৈ দিয়ে।',
  },
  body: {
    en: (h) => `
${h.table(
  ['Type', 'English letters', 'Examples'],
  [
    [
      '<code>সংখ্যা</code> number',
      '<code>xonkhya</code>',
      '<code>৪২</code>, <code>3.14</code>, <code>-৭</code>',
    ],
    ['<code>পাঠ</code> text', '<code>path</code>', '<code>"নমস্কাৰ"</code>'],
    [
      '<code>সঁচা-মিছা</code> boolean',
      '<code>xosa-misa</code>',
      '<code>সঁচা</code>, <code>মিছা</code>',
    ],
    ['<code>খালী</code> empty', '<code>khali</code>', '<code>খালী</code>'],
    ['<code>তালিকা</code> list', '<code>talika</code>', '<code>[১, ২, ৩]</code>'],
    ['<code>ফাংচন</code> function', '<code>fangchon</code>', '<code>ফাংচন যোগ(ক, খ) { … }</code>'],
  ],
)}
${h.example('কোৱা(প্ৰকাৰ(৪২), প্ৰকাৰ("অসম"), প্ৰকাৰ(সঁচা), প্ৰকাৰ(খালী), প্ৰকাৰ([১, ২]))', 'kowa(prokar(42), prokar("Oxom"), prokar(xosa), prokar(khali), prokar([1, 2]))')}
${h.h2('numbers', 'Numbers')}
<p>Write numbers with Assamese digits (<code>২৪</code>) or ASCII digits (<code>24</code>), but don’t mix them in one number. Whole numbers and decimals are the same type.</p>
${h.example('কোৱা(১০ / ৪, ৭ % ৩, ২.৫ * ২)', 'kowa(10 / 4, 7 % 3, 2.5 * 2)')}
${h.h2('text', 'Text')}
<p>Text goes inside double quotes. Use <code>\\n</code> for a new line, <code>\\t</code> for a tab and <code>\\"</code> for a quote. See <a href="${h.link('learn/text/')}">Working with text</a>.</p>
${h.h2('booleans', 'True and false')}
<p><code>সঁচা</code> and <code>মিছা</code> (<code>xosa</code>, <code>misa</code>) are the results of comparisons. Conditions in <code>যদি</code> and loops must be one of these: Asomiya has no “truthy” values, so <code>যদি (১)</code> is an error. This catches many mistakes early.</p>
${h.h2('convert', 'Converting between types')}
${h.example('ধৰা লিখা = "৪২"\nধৰা সংখ্যাটো = সংখ্যা(লিখা)\nকোৱা(সংখ্যাটো + ১)\nকোৱা(পাঠ(১০) + "০")\nকোৱা(পূৰ্ণাংক(৩.৯))', 'dhora likha = "42"\ndhora xonkhyato = xonkhya(likha)\nkowa(xonkhyato + 1)\nkowa(path(10) + "0")\nkowa(purnanko(3.9))')}
<p><code>সংখ্যা()</code> gives <code>খালী</code> if the text isn’t a number, so you can check user input safely.</p>`,
    as: (h) => `
${h.table(
  ['প্ৰকাৰ', 'ইংৰাজী আখৰত', 'উদাহৰণ'],
  [
    [
      '<code>সংখ্যা</code>',
      '<code>xonkhya</code>',
      '<code>৪২</code>, <code>3.14</code>, <code>-৭</code>',
    ],
    ['<code>পাঠ</code>', '<code>path</code>', '<code>"নমস্কাৰ"</code>'],
    ['<code>সঁচা-মিছা</code>', '<code>xosa-misa</code>', '<code>সঁচা</code>, <code>মিছা</code>'],
    ['<code>খালী</code>', '<code>khali</code>', '<code>খালী</code>'],
    ['<code>তালিকা</code>', '<code>talika</code>', '<code>[১, ২, ৩]</code>'],
    ['<code>ফাংচন</code>', '<code>fangchon</code>', '<code>ফাংচন যোগ(ক, খ) { … }</code>'],
  ],
)}
${h.example('কোৱা(প্ৰকাৰ(৪২), প্ৰকাৰ("অসম"), প্ৰকাৰ(সঁচা), প্ৰকাৰ(খালী), প্ৰকাৰ([১, ২]))', 'kowa(prokar(42), prokar("Oxom"), prokar(xosa), prokar(khali), prokar([1, 2]))')}
${h.h2('numbers', 'সংখ্যা')}
<p>সংখ্যা অসমীয়া অংক (<code>২৪</code>) বা ইংৰাজী অংকত (<code>24</code>) লিখিব পাৰি, কিন্তু এটা সংখ্যাত দুয়োটা মিহলাব নোৱাৰি। পূৰ্ণ সংখ্যা আৰু দশমিক একে প্ৰকাৰৰ।</p>
${h.example('কোৱা(১০ / ৪, ৭ % ৩, ২.৫ * ২)', 'kowa(10 / 4, 7 % 3, 2.5 * 2)')}
${h.h2('text', 'পাঠ')}
<p>পাঠ দুটা উদ্ধৃতি চিহ্নৰ ভিতৰত লিখা হয়। নতুন শাৰীৰ বাবে <code>\\n</code>, টেবৰ বাবে <code>\\t</code> আৰু উদ্ধৃতি চিহ্নৰ বাবে <code>\\"</code>। চাওক <a href="${h.link('learn/text/')}">পাঠৰ সৈতে কাম</a>।</p>
${h.h2('booleans', 'সঁচা আৰু মিছা')}
<p>তুলনাৰ ফলাফল <code>সঁচা</code> বা <code>মিছা</code>। <code>যদি</code> আৰু লুপৰ চৰ্ত এই দুটাৰ এটা হ’বই লাগিব: <code>যদি (১)</code> লিখাটো ভুল। ইয়াৰ ফলত বহুতো ভুল আগতেই ধৰা পৰে।</p>
${h.h2('convert', 'এক প্ৰকাৰৰ পৰা আন প্ৰকাৰলৈ')}
${h.example('ধৰা লিখা = "৪২"\nধৰা সংখ্যাটো = সংখ্যা(লিখা)\nকোৱা(সংখ্যাটো + ১)\nকোৱা(পাঠ(১০) + "০")\nকোৱা(পূৰ্ণাংক(৩.৯))', 'dhora likha = "42"\ndhora xonkhyato = xonkhya(likha)\nkowa(xonkhyato + 1)\nkowa(path(10) + "0")\nkowa(purnanko(3.9))')}
<p>পাঠটো সংখ্যা নহ’লে <code>সংখ্যা()</code>-এ <code>খালী</code> দিয়ে, সেয়েহে ব্যৱহাৰকাৰীৰ ইনপুট নিৰাপদে পৰীক্ষা কৰিব পাৰি।</p>`,
  },
};

const operators = {
  id: 'operators',
  path: 'learn/operators/',
  title: { en: 'Operators', as: 'অপাৰেটৰ' },
  description: {
    en: 'Arithmetic, comparison and logical operators in Asomiya, and their precedence.',
    as: 'অসমীয়াৰ গাণিতিক, তুলনামূলক আৰু যুক্তিমূলক অপাৰেটৰ, আৰু সিহঁতৰ অগ্ৰাধিকাৰ।',
  },
  intro: {
    en: 'Operators work the same way as in most languages. Only the words <code>আৰু</code> (and) and <code>বা</code> (or) are in Assamese.',
    as: 'অপাৰেটৰবোৰ বেছিভাগ ভাষাৰ দৰেই কাম কৰে। কেৱল <code>আৰু</code> আৰু <code>বা</code> শব্দ দুটা অসমীয়াত।',
  },
  body: {
    en: (h) => `
${h.h2('arithmetic', 'Arithmetic')}
${h.table(
  ['Operator', 'Meaning', 'Example'],
  [
    ['<code>+</code>', 'add (or join text)', '<code>২ + ৩</code> → <code>৫</code>'],
    ['<code>-</code>', 'subtract', '<code>৯ - ৪</code> → <code>৫</code>'],
    ['<code>*</code>', 'multiply', '<code>৬ * ৭</code> → <code>৪২</code>'],
    ['<code>/</code>', 'divide', '<code>৭ / ২</code> → <code>৩.৫</code>'],
    ['<code>%</code>', 'remainder', '<code>৭ % ২</code> → <code>১</code>'],
  ],
)}
${h.example('কোৱা(২ + ৩ * ৪)\nকোৱা((২ + ৩) * ৪)', 'kowa(2 + 3 * 4)\nkowa((2 + 3) * 4)')}
<p>Dividing by zero is an error (<code>R004</code>), not infinity.</p>
${h.h2('comparison', 'Comparison')}
<p><code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code> compare values and give <code>সঁচা</code> or <code>মিছা</code>. <code>==</code> works on any two values; the others need two numbers or two texts.</p>
${h.example('কোৱা(৫ > ৩, ৫ == ৫.০, "ক" != "খ")', 'kowa(5 > 3, 5 == 5.0, "k" != "kh")')}
${h.h2('logic', 'Logic')}
${h.table(
  ['Assamese', 'English letters', 'Symbol', 'Meaning'],
  [
    ['<code>আৰু</code>', '<code>aru</code>', '<code>&amp;&amp;</code>', 'both are true'],
    ['<code>বা</code>', '<code>ba</code>', '<code>||</code>', 'at least one is true'],
    ['<code>নহয়</code>', '<code>nohoy</code>', '<code>!</code>', 'not'],
  ],
)}
${h.example('ধৰা বয়স = ২০\nকোৱা(বয়স >= ১৮ আৰু বয়স < ৬০)\nকোৱা(নহয় (বয়স > ১০))', 'dhora boyox = 20\nkowa(boyox >= 18 aru boyox < 60)\nkowa(nohoy (boyox > 10))')}
<p><code>আৰু</code> and <code>বা</code> stop early: if the left side already decides the answer, the right side isn’t evaluated.</p>
${h.h2('precedence', 'Precedence')}
<p>From strongest to weakest:</p>
<ol>
  <li><code>!</code> / <code>নহয়</code> and unary <code>-</code></li>
  <li><code>* / %</code></li>
  <li><code>+ -</code></li>
  <li><code>&lt; &lt;= &gt; &gt;=</code></li>
  <li><code>== !=</code></li>
  <li><code>আৰু</code></li>
  <li><code>বা</code></li>
  <li><code>=</code></li>
</ol>
<p>When in doubt, use brackets.</p>`,
    as: (h) => `
${h.h2('arithmetic', 'গাণিতিক')}
${h.table(
  ['অপাৰেটৰ', 'অৰ্থ', 'উদাহৰণ'],
  [
    ['<code>+</code>', 'যোগ (বা পাঠ জোৰা)', '<code>২ + ৩</code> → <code>৫</code>'],
    ['<code>-</code>', 'বিয়োগ', '<code>৯ - ৪</code> → <code>৫</code>'],
    ['<code>*</code>', 'পূৰণ', '<code>৬ * ৭</code> → <code>৪২</code>'],
    ['<code>/</code>', 'হৰণ', '<code>৭ / ২</code> → <code>৩.৫</code>'],
    ['<code>%</code>', 'ভাগশেষ', '<code>৭ % ২</code> → <code>১</code>'],
  ],
)}
${h.example('কোৱা(২ + ৩ * ৪)\nকোৱা((২ + ৩) * ৪)', 'kowa(2 + 3 * 4)\nkowa((2 + 3) * 4)')}
<p>শূন্যৰে হৰণ কৰাটো ভুল (<code>R004</code>)।</p>
${h.h2('comparison', 'তুলনা')}
<p><code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>-এ মান তুলনা কৰি <code>সঁচা</code> বা <code>মিছা</code> দিয়ে। <code>==</code> যিকোনো দুটা মানত চলে; বাকীবোৰৰ বাবে দুটা সংখ্যা বা দুটা পাঠ লাগে।</p>
${h.example('কোৱা(৫ > ৩, ৫ == ৫.০, "ক" != "খ")', 'kowa(5 > 3, 5 == 5.0, "k" != "kh")')}
${h.h2('logic', 'যুক্তি')}
${h.table(
  ['অসমীয়া', 'ইংৰাজী আখৰ', 'চিহ্ন', 'অৰ্থ'],
  [
    ['<code>আৰু</code>', '<code>aru</code>', '<code>&amp;&amp;</code>', 'দুয়োটা সঁচা'],
    ['<code>বা</code>', '<code>ba</code>', '<code>||</code>', 'অন্ততঃ এটা সঁচা'],
    ['<code>নহয়</code>', '<code>nohoy</code>', '<code>!</code>', 'উলটা (সঁচা ↔ মিছা)'],
  ],
)}
${h.example('ধৰা বয়স = ২০\nকোৱা(বয়স >= ১৮ আৰু বয়স < ৬০)\nকোৱা(নহয় (বয়স > ১০))', 'dhora boyox = 20\nkowa(boyox >= 18 aru boyox < 60)\nkowa(nohoy (boyox > 10))')}
<p>বাওঁফালৰ অংশই উত্তৰ ঠিক কৰি দিলে <code>আৰু</code> আৰু <code>বা</code>-এ সোঁফালৰ অংশ চলায়েই নাই।</p>
${h.h2('precedence', 'অগ্ৰাধিকাৰ')}
<p>আটাইতকৈ শক্তিশালীৰ পৰা দুৰ্বললৈ:</p>
<ol>
  <li><code>!</code> / <code>নহয়</code> আৰু একক <code>-</code></li>
  <li><code>* / %</code></li>
  <li><code>+ -</code></li>
  <li><code>&lt; &lt;= &gt; &gt;=</code></li>
  <li><code>== !=</code></li>
  <li><code>আৰু</code></li>
  <li><code>বা</code></li>
  <li><code>=</code></li>
</ol>
<p>সন্দেহ হ’লে বন্ধনী ব্যৱহাৰ কৰক।</p>`,
  },
};

const text = {
  id: 'text',
  path: 'learn/text/',
  title: { en: 'Working with text', as: 'পাঠৰ সৈতে কাম' },
  description: {
    en: 'Join, measure and index text in Asomiya. Lengths count whole Assamese letters.',
    as: 'পাঠ জোৰা, দৈৰ্ঘ্য জোখা আৰু আখৰ উলিওৱা। দৈৰ্ঘ্যই গোটা অসমীয়া আখৰ গণনা কৰে।',
  },
  intro: {
    en: 'Text (<code>পাঠ</code>) is written in double quotes. Asomiya understands Assamese properly: a letter with its vowel sign, or a conjunct like <code>ক্ষ</code>, counts as one character.',
    as: 'পাঠ দুটা উদ্ধৃতি চিহ্নৰ ভিতৰত লিখা হয়। অসমীয়াই অসমীয়া লিপি ঠিককৈ বুজে: কাৰ-চিহ্নসহ আখৰ বা <code>ক্ষ</code>-ৰ দৰে যুক্তাক্ষৰ এটা আখৰ হিচাপে গণ্য হয়।',
  },
  body: {
    en: (h) => `
${h.h2('join', 'Joining text')}
<p><code>+</code> joins text with any value:</p>
${h.example('ধৰা নাম = "অসম"\nকোৱা("নমস্কাৰ, " + নাম + "! বছৰ: " + ২০২৬)', 'dhora naam = "Oxom"\nkowa("Nomoskar, " + naam + "! bosor: " + 2026)')}
${h.h2('length', 'Length')}
${h.example('কোৱা(দৈৰ্ঘ্য("অসমীয়া"))\nকোৱা(দৈৰ্ঘ্য("ক্ষমা"))', 'kowa(doirghyo("অসমীয়া"))\nkowa(doirghyo("Oxom"))')}
<p>“অসমীয়া” has 5 characters as you would count them (অ, স, মী, য়া … ), not the 7 Unicode code points underneath.</p>
${h.h2('index', 'Getting one character')}
<p>Use <code>[ ]</code> with a position starting at <code>০</code>:</p>
${h.example('ধৰা শব্দ = "অসমীয়া"\nকোৱা(শব্দ[০], শব্দ[৩])', 'dhora xobdo = "Oxomiya"\nkowa(xobdo[0], xobdo[3])')}
${h.note('note', `<p>Text can’t be changed in place: <code>শব্দ[০] = "ক"</code> is an error (<code>R016</code>). Build a new text with <code>+</code> instead.</p>`)}
${h.h2('escapes', 'Special characters')}
${h.example('কোৱা("প্ৰথম শাৰী\\nদ্বিতীয় শাৰী")\nকোৱা("তেওঁ ক\'লে: \\"নমস্কাৰ\\"")', 'kowa("prothom xari\\ndwitiyo xari")\nkowa("tew kole: \\"Nomoskar\\"")')}`,
    as: (h) => `
${h.h2('join', 'পাঠ জোৰা')}
<p><code>+</code>-এ পাঠৰ সৈতে যিকোনো মান জোৰা দিয়ে:</p>
${h.example('ধৰা নাম = "অসম"\nকোৱা("নমস্কাৰ, " + নাম + "! বছৰ: " + ২০২৬)', 'dhora naam = "Oxom"\nkowa("Nomoskar, " + naam + "! bosor: " + 2026)')}
${h.h2('length', 'দৈৰ্ঘ্য')}
${h.example('কোৱা(দৈৰ্ঘ্য("অসমীয়া"))\nকোৱা(দৈৰ্ঘ্য("ক্ষমা"))', 'kowa(doirghyo("অসমীয়া"))\nkowa(doirghyo("Oxom"))')}
<p>“অসমীয়া”-ত আমি গণনা কৰাৰ দৰে ৫টা আখৰ আছে, ভিতৰৰ ৭টা ইউনিক’ড ক’ড পইণ্ট নহয়।</p>
${h.h2('index', 'এটা আখৰ উলিওৱা')}
<p><code>০</code>-ৰ পৰা আৰম্ভ হোৱা স্থানৰ সৈতে <code>[ ]</code> ব্যৱহাৰ কৰক:</p>
${h.example('ধৰা শব্দ = "অসমীয়া"\nকোৱা(শব্দ[০], শব্দ[৩])', 'dhora xobdo = "Oxomiya"\nkowa(xobdo[0], xobdo[3])')}
${h.note('note', `<p>পাঠ ঠাইতে সলনি কৰিব নোৱাৰি: <code>শব্দ[০] = "ক"</code> লিখাটো ভুল (<code>R016</code>)। তাৰ সলনি <code>+</code> দি নতুন পাঠ বনাওক।</p>`)}
${h.h2('escapes', 'বিশেষ চিহ্ন')}
${h.example('কোৱা("প্ৰথম শাৰী\\nদ্বিতীয় শাৰী")\nকোৱা("তেওঁ ক\'লে: \\"নমস্কাৰ\\"")', 'kowa("prothom xari\\ndwitiyo xari")\nkowa("tew kole: \\"Nomoskar\\"")')}`,
  },
};

const conditions = {
  id: 'conditions',
  path: 'learn/conditions/',
  title: { en: 'Conditions', as: 'চৰ্ত' },
  description: {
    en: "Make decisions with যদি (jodi) and নহ'লে (nohole), including else-if chains.",
    as: "যদি আৰু নহ'লে ব্যৱহাৰ কৰি সিদ্ধান্ত লওক, “নহ'লে যদি” শিকলিসহ।",
  },
  intro: {
    en: "<code>যদি</code> (<code>jodi</code>) runs a block of code only when a condition is <code>সঁচা</code>. Add <code>নহ'লে</code> (<code>nohole</code>) for what should happen otherwise.",
    as: "চৰ্ত <code>সঁচা</code> হ’লেহে <code>যদি</code>-ৰ ব্লকটো চলে। অন্যথা কি হ’ব লাগে তাৰ বাবে <code>নহ'লে</code> যোগ কৰক।",
  },
  body: {
    en: (h) => `
${h.h2('if', 'If')}
${h.example('ধৰা বৰষুণ = সঁচা\nযদি (বৰষুণ) {\n    কোৱা("ছাতি লৈ যাওক")\n}', 'dhora boroxun = xosa\njodi (boroxun) {\n    kowa("chati loi jaok")\n}')}
${h.h2('else', 'If … else')}
${h.example('ধৰা তাপমাত্ৰা = ১২\nযদি (তাপমাত্ৰা < ১৫) {\n    কোৱা("ঠাণ্ডা")\n} নহ\'লে {\n    কোৱা("ভাল বতৰ")\n}', 'dhora tapmatra = 12\njodi (tapmatra < 15) {\n    kowa("thanda")\n} nohole {\n    kowa("bhal botor")\n}')}
${h.h2('else-if', 'Several choices')}
<p>Chain conditions with <code>নহ'লে যদি</code> (<code>nohole jodi</code>). The first true condition wins:</p>
${h.example('ধৰা নম্বৰ = ৮২\nযদি (নম্বৰ >= ৯০) {\n    কোৱা("ক")\n} নহ\'লে যদি (নম্বৰ >= ৭৫) {\n    কোৱা("খ")\n} নহ\'লে যদি (নম্বৰ >= ৬০) {\n    কোৱা("গ")\n} নহ\'লে {\n    কোৱা("ঘ")\n}', 'dhora nombor = 82\njodi (nombor >= 90) {\n    kowa("A")\n} nohole jodi (nombor >= 75) {\n    kowa("B")\n} nohole jodi (nombor >= 60) {\n    kowa("C")\n} nohole {\n    kowa("D")\n}')}
${h.h2('rules', 'Rules')}
<ul>
  <li>The condition goes in round brackets <code>( )</code>, and the code in curly brackets <code>{ }</code>, even for one line.</li>
  <li>The condition must be <code>সঁচা</code> or <code>মিছা</code>. <code>যদি (১)</code> is an error (<code>R007</code>).</li>
  <li><code>নহ'লে</code> can also be written <code>নহলে</code> (without the apostrophe).</li>
</ul>
${h.example('ধৰা বছৰ = ২০২৪\nযদি ((বছৰ % ৪ == ০ আৰু বছৰ % ১০০ != ০) বা বছৰ % ৪০০ == ০) {\n    কোৱা(বছৰ, "অধিবৰ্ষ")\n}', 'dhora bosor = 2024\njodi ((bosor % 4 == 0 aru bosor % 100 != 0) ba bosor % 400 == 0) {\n    kowa(bosor, "adhibarxa")\n}', { title: 'leap-year.asom' })}`,
    as: (h) => `
${h.h2('if', 'যদি')}
${h.example('ধৰা বৰষুণ = সঁচা\nযদি (বৰষুণ) {\n    কোৱা("ছাতি লৈ যাওক")\n}', 'dhora boroxun = xosa\njodi (boroxun) {\n    kowa("chati loi jaok")\n}')}
${h.h2('else', 'যদি … নহ’লে')}
${h.example('ধৰা তাপমাত্ৰা = ১২\nযদি (তাপমাত্ৰা < ১৫) {\n    কোৱা("ঠাণ্ডা")\n} নহ\'লে {\n    কোৱা("ভাল বতৰ")\n}', 'dhora tapmatra = 12\njodi (tapmatra < 15) {\n    kowa("thanda")\n} nohole {\n    kowa("bhal botor")\n}')}
${h.h2('else-if', 'কেইবাটাও বিকল্প')}
<p><code>নহ'লে যদি</code> দি চৰ্তবোৰ শিকলিৰ দৰে লিখক। প্ৰথম সঁচা চৰ্তটোৱেই জিকে:</p>
${h.example('ধৰা নম্বৰ = ৮২\nযদি (নম্বৰ >= ৯০) {\n    কোৱা("ক")\n} নহ\'লে যদি (নম্বৰ >= ৭৫) {\n    কোৱা("খ")\n} নহ\'লে যদি (নম্বৰ >= ৬০) {\n    কোৱা("গ")\n} নহ\'লে {\n    কোৱা("ঘ")\n}', 'dhora nombor = 82\njodi (nombor >= 90) {\n    kowa("A")\n} nohole jodi (nombor >= 75) {\n    kowa("B")\n} nohole jodi (nombor >= 60) {\n    kowa("C")\n} nohole {\n    kowa("D")\n}')}
${h.h2('rules', 'নিয়ম')}
<ul>
  <li>চৰ্ত ঘূৰণীয়া বন্ধনী <code>( )</code>-ত, আৰু ক’ড কোঁচা বন্ধনী <code>{ }</code>-ত লিখিব লাগে, এটা শাৰী হ’লেও।</li>
  <li>চৰ্ত <code>সঁচা</code> বা <code>মিছা</code> হ’বই লাগিব। <code>যদি (১)</code> ভুল (<code>R007</code>)।</li>
  <li><code>নহ'লে</code>-ক <code>নহলে</code> (এপষ্ট্ৰফি নোহোৱাকৈ) লিখিব পাৰি।</li>
</ul>
${h.example('ধৰা বছৰ = ২০২৪\nযদি ((বছৰ % ৪ == ০ আৰু বছৰ % ১০০ != ০) বা বছৰ % ৪০০ == ০) {\n    কোৱা(বছৰ, "অধিবৰ্ষ")\n}', 'dhora bosor = 2024\njodi ((bosor % 4 == 0 aru bosor % 100 != 0) ba bosor % 400 == 0) {\n    kowa(bosor, "adhibarxa")\n}', { title: 'leap-year.asom' })}`,
  },
};

const loops = {
  id: 'loops',
  path: 'learn/loops/',
  title: { en: 'Loops', as: 'লুপ' },
  description: {
    en: 'Repeat code with যেতিয়ালৈকে (jetialoike), go through a list with প্ৰতিটো … মাজত (protito … majot), stop with ৰখা (rokha) and skip with আগবাঢ়া (aagbara).',
    as: 'যেতিয়ালৈকে দি ক’ড বাৰে বাৰে চলাওক, প্ৰতিটো … মাজত দি তালিকাৰ প্ৰতিটো উপাদান চাওক, ৰখা দি ৰখাওক আৰু আগবাঢ়া দি এৰি যাওক।',
  },
  intro: {
    en: '<code>যেতিয়ালৈকে</code> (<code>jetialoike</code>) means “for as long as”. It runs its block again and again while the condition stays <code>সঁচা</code>.',
    as: '<code>যেতিয়ালৈকে</code> মানে “যিমান সময়লৈকে”। চৰ্ত <code>সঁচা</code> হৈ থকালৈকে ব্লকটো বাৰে বাৰে চলে।',
  },
  body: {
    en: (h) => `
${h.h2('while', 'Repeat while true')}
${h.example('ধৰা ক = ১\nধৰা যোগফল = ০\nযেতিয়ালৈকে (ক <= ১০) {\n    যোগফল = যোগফল + ক\n    ক = ক + ১\n}\nকোৱা("১ ৰ পৰা ১০ লৈ যোগফল:", যোগফল)', 'dhora k = 1\ndhora jugfol = 0\njetialoike (k <= 10) {\n    jugfol = jugfol + k\n    k = k + 1\n}\nkowa("1-10 jugfol:", jugfol)')}
${h.note('warning', `<p>Remember to change the variable in the condition, or the loop never ends. Asomiya stops runaway programs after about 10 million steps (<code>R008</code>), and the playground has a Stop button.</p>`)}
${h.h2('break', 'Stop early: ৰখা')}
<p><code>ৰখা</code> (<code>rokha</code>, “stop”) leaves the loop immediately:</p>
${h.example('ধৰা ন = ১\nযেতিয়ালৈকে (সঁচা) {\n    যদি (ন * ন > ৫০) {\n        ৰখা\n    }\n    ন = ন + ১\n}\nকোৱা("প্ৰথম সংখ্যা যাৰ বৰ্গ ৫০ তকৈ বেছি:", ন)', 'dhora n = 1\njetialoike (xosa) {\n    jodi (n * n > 50) {\n        rokha\n    }\n    n = n + 1\n}\nkowa("first number whose square > 50:", n)')}
${h.h2('continue', 'Skip ahead: আগবাঢ়া')}
<p><code>আগবাঢ়া</code> (<code>aagbara</code>, “go forward”) skips the rest of this round and starts the next one:</p>
${h.example('ধৰা ক = ০\nযেতিয়ালৈকে (ক < ১০) {\n    ক = ক + ১\n    যদি (ক % ২ == ০) {\n        আগবাঢ়া\n    }\n    কোৱা(ক)\n}', 'dhora k = 0\njetialoike (k < 10) {\n    k = k + 1\n    jodi (k % 2 == 0) {\n        aagbara\n    }\n    kowa(k)\n}')}
${h.h2('foreach', 'Go through a list: প্ৰতিটো … মাজত')}
<p><code>প্ৰতিটো</code> (<code>protito</code>, “each”) runs its block once for every item of a list. The list comes before <code>মাজত</code> (<code>majot</code>, “among”), just as you would say <em>ফলবোৰৰ মাজত</em>:</p>
${h.example('ধৰা ফলবোৰ = ["আম", "কল", "লিচু"]\nপ্ৰতিটো ফল ফলবোৰ মাজত {\n    কোৱা("মোৰ " + ফল + " ভাল লাগে")\n}', 'dhora folbor = ["aam", "kol", "lichu"]\nprotito fol folbor majot {\n    kowa("I like " + fol)\n}')}
<p>No counter to set up or forget to increase. Adding up a list:</p>
${h.example('ধৰা নম্বৰ = [৭৫, ৮২, ৯১, ৬৮]\nধৰা মুঠ = ০\nপ্ৰতিটো ন নম্বৰ মাজত {\n    মুঠ = মুঠ + ন\n}\nকোৱা("গড়:", মুঠ / দৈৰ্ঘ্য(নম্বৰ))', 'dhora nombor = [75, 82, 91, 68]\ndhora mut = 0\nprotito n nombor majot {\n    mut = mut + n\n}\nkowa("average:", mut / doirghyo(nombor))')}
<p>With text, it goes letter by letter, keeping each Assamese letter whole (<code>মী</code>, <code>য়া</code>):</p>
${h.example('প্ৰতিটো আখৰ "অসমীয়া" মাজত {\n    কোৱা(আখৰ)\n}', 'protito akhor "Asom" majot {\n    kowa(akhor)\n}')}
${h.note('note', `<p>The loop goes over the items the list had when it started, so adding to the list inside the loop is safe. <code>ৰখা</code> and <code>আগবাঢ়া</code> work here too.</p>`)}
${h.h2('nested', 'Loops inside loops')}
${h.example('ধৰা শাৰী = ১\nযেতিয়ালৈকে (শাৰী <= ৪) {\n    ধৰা ৰেখা = ""\n    ধৰা গণনা = ০\n    যেতিয়ালৈকে (গণনা < শাৰী) {\n        ৰেখা = ৰেখা + "★"\n        গণনা = গণনা + ১\n    }\n    কোৱা(ৰেখা)\n    শাৰী = শাৰী + ১\n}', 'dhora xari = 1\njetialoike (xari <= 4) {\n    dhora rekha = ""\n    dhora gonona = 0\n    jetialoike (gonona < xari) {\n        rekha = rekha + "★"\n        gonona = gonona + 1\n    }\n    kowa(rekha)\n    xari = xari + 1\n}')}
<p><code>ৰখা</code> and <code>আগবাঢ়া</code> only affect the innermost loop. Using them outside a loop is an error.</p>`,
    as: (h) => `
${h.h2('while', 'সঁচা হৈ থকালৈকে')}
${h.example('ধৰা ক = ১\nধৰা যোগফল = ০\nযেতিয়ালৈকে (ক <= ১০) {\n    যোগফল = যোগফল + ক\n    ক = ক + ১\n}\nকোৱা("১ ৰ পৰা ১০ লৈ যোগফল:", যোগফল)', 'dhora k = 1\ndhora jugfol = 0\njetialoike (k <= 10) {\n    jugfol = jugfol + k\n    k = k + 1\n}\nkowa("1-10 jugfol:", jugfol)')}
${h.note('warning', `<p>চৰ্তৰ চলকটো সলনি কৰিবলৈ নাপাহৰিব, নহ’লে লুপটো কেতিয়াও শেষ নহয়। প্ৰায় ১ কোটি খোজৰ পিছত অসমীয়াই এনে প্ৰগ্ৰাম ৰখাই দিয়ে (<code>R008</code>), আৰু প্লেগ্ৰাউণ্ডত ৰখোৱা বুটাম আছে।</p>`)}
${h.h2('break', 'আগতেই ৰখাওক: ৰখা')}
<p><code>ৰখা</code>-ই লগে লগে লুপৰ পৰা ওলাই আহে:</p>
${h.example('ধৰা ন = ১\nযেতিয়ালৈকে (সঁচা) {\n    যদি (ন * ন > ৫০) {\n        ৰখা\n    }\n    ন = ন + ১\n}\nকোৱা("প্ৰথম সংখ্যা যাৰ বৰ্গ ৫০ তকৈ বেছি:", ন)', 'dhora n = 1\njetialoike (xosa) {\n    jodi (n * n > 50) {\n        rokha\n    }\n    n = n + 1\n}\nkowa("first number whose square > 50:", n)')}
${h.h2('continue', 'এৰি যাওক: আগবাঢ়া')}
<p><code>আগবাঢ়া</code>-ই এই পাকৰ বাকী অংশ এৰি পৰৱৰ্তী পাক আৰম্ভ কৰে:</p>
${h.example('ধৰা ক = ০\nযেতিয়ালৈকে (ক < ১০) {\n    ক = ক + ১\n    যদি (ক % ২ == ০) {\n        আগবাঢ়া\n    }\n    কোৱা(ক)\n}', 'dhora k = 0\njetialoike (k < 10) {\n    k = k + 1\n    jodi (k % 2 == 0) {\n        aagbara\n    }\n    kowa(k)\n}')}
${h.h2('foreach', 'তালিকাৰ প্ৰতিটো উপাদান: প্ৰতিটো … মাজত')}
<p><code>প্ৰতিটো</code>-এ তালিকাৰ প্ৰতিটো উপাদানৰ বাবে ব্লকটো এবাৰকৈ চলায়। তালিকাখন <code>মাজত</code>ৰ আগত বহে, ঠিক যেনেকৈ আমি কওঁ <em>ফলবোৰৰ মাজত</em>:</p>
${h.example('ধৰা ফলবোৰ = ["আম", "কল", "লিচু"]\nপ্ৰতিটো ফল ফলবোৰ মাজত {\n    কোৱা("মোৰ " + ফল + " ভাল লাগে")\n}', 'dhora folbor = ["aam", "kol", "lichu"]\nprotito fol folbor majot {\n    kowa("I like " + fol)\n}')}
<p>গণনাৰ চলক ৰাখিব নালাগে। তালিকাৰ যোগফল:</p>
${h.example('ধৰা নম্বৰ = [৭৫, ৮২, ৯১, ৬৮]\nধৰা মুঠ = ০\nপ্ৰতিটো ন নম্বৰ মাজত {\n    মুঠ = মুঠ + ন\n}\nকোৱা("গড়:", মুঠ / দৈৰ্ঘ্য(নম্বৰ))', 'dhora nombor = [75, 82, 91, 68]\ndhora mut = 0\nprotito n nombor majot {\n    mut = mut + n\n}\nkowa("average:", mut / doirghyo(nombor))')}
<p>পাঠৰ ক্ষেত্ৰত ই আখৰে আখৰে যায়, অসমীয়া আখৰ গোটেইটোকৈ ৰাখি (<code>মী</code>, <code>য়া</code>):</p>
${h.example('প্ৰতিটো আখৰ "অসমীয়া" মাজত {\n    কোৱা(আখৰ)\n}', 'protito akhor "Asom" majot {\n    kowa(akhor)\n}')}
${h.note('note', `<p>লুপ আৰম্ভ হোৱাৰ সময়ত তালিকাত যিবোৰ উপাদান আছিল, লুপটোৱে সেইবোৰৰ ওপৰেৰেহে যায়; সেয়ে লুপৰ ভিতৰত তালিকাত যোগ কৰাটো নিৰাপদ। <code>ৰখা</code> আৰু <code>আগবাঢ়া</code>-ও ইয়াত চলে।</p>`)}
${h.h2('nested', 'লুপৰ ভিতৰত লুপ')}
${h.example('ধৰা শাৰী = ১\nযেতিয়ালৈকে (শাৰী <= ৪) {\n    ধৰা ৰেখা = ""\n    ধৰা গণনা = ০\n    যেতিয়ালৈকে (গণনা < শাৰী) {\n        ৰেখা = ৰেখা + "★"\n        গণনা = গণনা + ১\n    }\n    কোৱা(ৰেখা)\n    শাৰী = শাৰী + ১\n}', 'dhora xari = 1\njetialoike (xari <= 4) {\n    dhora rekha = ""\n    dhora gonona = 0\n    jetialoike (gonona < xari) {\n        rekha = rekha + "★"\n        gonona = gonona + 1\n    }\n    kowa(rekha)\n    xari = xari + 1\n}')}
<p><code>ৰখা</code> আৰু <code>আগবাঢ়া</code>-এ কেৱল আটাইতকৈ ভিতৰৰ লুপটোতহে প্ৰভাৱ পেলায়। লুপৰ বাহিৰত ব্যৱহাৰ কৰাটো ভুল।</p>`,
  },
};

const functions = {
  id: 'functions',
  path: 'learn/functions/',
  title: { en: 'Functions', as: 'ফাংচন' },
  description: {
    en: 'Define functions with ফাংচন (fangchon), return values with ঘূৰাইদিয়া (ghuraidiya), recursion and closures.',
    as: 'ফাংচন দি ফাংচন বনাওক, ঘূৰাইদিয়া দি মান ঘূৰাই দিয়ক, ৰিকাৰ্চন আৰু ক্ল’জাৰ।',
  },
  intro: {
    en: 'A function is a named piece of code you can use again and again. Define one with <code>ফাংচন</code> (<code>fangchon</code>) and give back a result with <code>ঘূৰাইদিয়া</code> (<code>ghuraidiya</code>).',
    as: 'ফাংচন হৈছে নাম থকা ক’ডৰ এটা অংশ, যাক বাৰে বাৰে ব্যৱহাৰ কৰিব পাৰি। <code>ফাংচন</code> দি বনাওক আৰু <code>ঘূৰাইদিয়া</code> দি ফলাফল ঘূৰাই দিয়ক।',
  },
  body: {
    en: (h) => `
${h.h2('define', 'Define and call')}
${h.example('ফাংচন যোগ(ক, খ) {\n    ঘূৰাইদিয়া ক + খ\n}\nকোৱা(যোগ(১০, ২০))', 'fangchon jog(k, kh) {\n    ghuraidiya k + kh\n}\nkowa(jog(10, 20))')}
<p>A function without <code>ঘূৰাইদিয়া</code> gives back <code>খালী</code>. Calling it with the wrong number of values is an error (<code>R006</code>).</p>
${h.h2('greet', 'Functions that do something')}
${h.example('ফাংচন অভিবাদন(নাম) {\n    কোৱা("নমস্কাৰ, " + নাম + "!")\n}\nঅভিবাদন("ৰীতা")\nঅভিবাদন("কমল")', 'fangchon obhibadon(naam) {\n    kowa("Nomoskar, " + naam + "!")\n}\nobhibadon("Rita")\nobhibadon("Komol")')}
${h.h2('recursion', 'Recursion')}
<p>A function can call itself. Here is the factorial, <em>n! = n × (n − 1)!</em>:</p>
${h.example('ফাংচন কাৰক(ন) {\n    যদি (ন <= ১) {\n        ঘূৰাইদিয়া ১\n    }\n    ঘূৰাইদিয়া ন * কাৰক(ন - ১)\n}\nকোৱা("৫! =", কাৰক(৫))', 'fangchon karok(n) {\n    jodi (n <= 1) {\n        ghuraidiya 1\n    }\n    ghuraidiya n * karok(n - 1)\n}\nkowa("5! =", karok(5))')}
${h.h2('values', 'Functions are values')}
<p>You can store a function in a variable or pass it to another function:</p>
${h.example('ফাংচন দুবাৰ(কাম, মান) {\n    ঘূৰাইদিয়া কাম(কাম(মান))\n}\nফাংচন দুগুণ(x) { ঘূৰাইদিয়া x * ২ }\nকোৱা(দুবাৰ(দুগুণ, ৫))', 'fangchon dubar(kam, man) {\n    ghuraidiya kam(kam(man))\n}\nfangchon dugun(x) { ghuraidiya x * 2 }\nkowa(dubar(dugun, 5))')}
${h.h2('closures', 'Closures')}
<p>A function remembers the variables around it, even after the outer function has finished:</p>
${h.example('ফাংচন গণক_বনোৱা() {\n    ধৰা গণনা = ০\n    ফাংচন বঢ়োৱা() {\n        গণনা = গণনা + ১\n        ঘূৰাইদিয়া গণনা\n    }\n    ঘূৰাইদিয়া বঢ়োৱা\n}\nধৰা গণক = গণক_বনোৱা()\nগণক()\nগণক()\nকোৱা(গণক())', 'fangchon gonok_banowa() {\n    dhora gonona = 0\n    fangchon barhowa() {\n        gonona = gonona + 1\n        ghuraidiya gonona\n    }\n    ghuraidiya barhowa\n}\ndhora gonok = gonok_banowa()\ngonok()\ngonok()\nkowa(gonok())')}`,
    as: (h) => `
${h.h2('define', 'বনাওক আৰু মাতক')}
${h.example('ফাংচন যোগ(ক, খ) {\n    ঘূৰাইদিয়া ক + খ\n}\nকোৱা(যোগ(১০, ২০))', 'fangchon jog(k, kh) {\n    ghuraidiya k + kh\n}\nkowa(jog(10, 20))')}
<p><code>ঘূৰাইদিয়া</code> নথকা ফাংচনে <code>খালী</code> ঘূৰাই দিয়ে। ভুল সংখ্যক মান দি মাতিলে ভুল হয় (<code>R006</code>)।</p>
${h.h2('greet', 'কাম কৰা ফাংচন')}
${h.example('ফাংচন অভিবাদন(নাম) {\n    কোৱা("নমস্কাৰ, " + নাম + "!")\n}\nঅভিবাদন("ৰীতা")\nঅভিবাদন("কমল")', 'fangchon obhibadon(naam) {\n    kowa("Nomoskar, " + naam + "!")\n}\nobhibadon("Rita")\nobhibadon("Komol")')}
${h.h2('recursion', 'ৰিকাৰ্চন')}
<p>ফাংচনে নিজকে মাতিব পাৰে। ইয়াত কাৰক (factorial), <em>ন! = ন × (ন − ১)!</em>:</p>
${h.example('ফাংচন কাৰক(ন) {\n    যদি (ন <= ১) {\n        ঘূৰাইদিয়া ১\n    }\n    ঘূৰাইদিয়া ন * কাৰক(ন - ১)\n}\nকোৱা("৫! =", কাৰক(৫))', 'fangchon karok(n) {\n    jodi (n <= 1) {\n        ghuraidiya 1\n    }\n    ghuraidiya n * karok(n - 1)\n}\nkowa("5! =", karok(5))')}
${h.h2('values', 'ফাংচনো এটা মান')}
<p>ফাংচন চলকত ৰাখিব পাৰি বা আন ফাংচনলৈ পঠিয়াব পাৰি:</p>
${h.example('ফাংচন দুবাৰ(কাম, মান) {\n    ঘূৰাইদিয়া কাম(কাম(মান))\n}\nফাংচন দুগুণ(x) { ঘূৰাইদিয়া x * ২ }\nকোৱা(দুবাৰ(দুগুণ, ৫))', 'fangchon dubar(kam, man) {\n    ghuraidiya kam(kam(man))\n}\nfangchon dugun(x) { ghuraidiya x * 2 }\nkowa(dubar(dugun, 5))')}
${h.h2('closures', 'ক্ল’জাৰ')}
<p>বাহিৰৰ ফাংচনটো শেষ হোৱাৰ পিছতো ফাংচন এটাই চাৰিওফালৰ চলকবোৰ মনত ৰাখে:</p>
${h.example('ফাংচন গণক_বনোৱা() {\n    ধৰা গণনা = ০\n    ফাংচন বঢ়োৱা() {\n        গণনা = গণনা + ১\n        ঘূৰাইদিয়া গণনা\n    }\n    ঘূৰাইদিয়া বঢ়োৱা\n}\nধৰা গণক = গণক_বনোৱা()\nগণক()\nগণক()\nকোৱা(গণক())', 'fangchon gonok_banowa() {\n    dhora gonona = 0\n    fangchon barhowa() {\n        gonona = gonona + 1\n        ghuraidiya gonona\n    }\n    ghuraidiya barhowa\n}\ndhora gonok = gonok_banowa()\ngonok()\ngonok()\nkowa(gonok())')}`,
  },
};

const lists = {
  id: 'lists',
  path: 'learn/lists/',
  title: { en: 'Lists', as: 'তালিকা' },
  description: {
    en: 'Store many values in a list, read and change items, and add new ones with সংযোজন (xonjojon).',
    as: 'তালিকাত বহুতো মান ৰাখক, উপাদান পঢ়ক আৰু সলনি কৰক, সংযোজন দি নতুন উপাদান যোগ কৰক।',
  },
  intro: {
    en: 'A list (<code>তালিকা</code>) holds several values in order, inside square brackets.',
    as: 'তালিকাত বৰ্গ বন্ধনীৰ ভিতৰত ক্ৰমানুসাৰে কেইবাটাও মান থাকে।',
  },
  body: {
    en: (h) => `
${h.h2('create', 'Create and read')}
${h.example('ধৰা ফল = ["আম", "কল", "লিচু"]\nকোৱা(ফল)\nকোৱা(ফল[০], দৈৰ্ঘ্য(ফল))', 'dhora fol = ["aam", "kol", "lisu"]\nkowa(fol)\nkowa(fol[0], doirghyo(fol))')}
<p>Positions start at <code>০</code>. Reading past the end is an error (<code>R010</code>).</p>
${h.h2('change', 'Change and add')}
${h.example('ধৰা সংখ্যাবোৰ = [১, ২, ৩]\nসংখ্যাবোৰ[০] = ১০\nসংযোজন(সংখ্যাবোৰ, ৪)\nকোৱা(সংখ্যাবোৰ)', 'dhora xonkhyabur = [1, 2, 3]\nxonkhyabur[0] = 10\nxonjojon(xonkhyabur, 4)\nkowa(xonkhyabur)')}
${h.h2('loop', 'Go through a list')}
${h.example('ধৰা নম্বৰ = [৭২, ৮৫, ৯০, ৬৪]\nধৰা মুঠ = ০\nধৰা ক = ০\nযেতিয়ালৈকে (ক < দৈৰ্ঘ্য(নম্বৰ)) {\n    মুঠ = মুঠ + নম্বৰ[ক]\n    ক = ক + ১\n}\nকোৱা("গড়:", মুঠ / দৈৰ্ঘ্য(নম্বৰ))', 'dhora nombor = [72, 85, 90, 64]\ndhora mut = 0\ndhora k = 0\njetialoike (k < doirghyo(nombor)) {\n    mut = mut + nombor[k]\n    k = k + 1\n}\nkowa("gor:", mut / doirghyo(nombor))')}
${h.h2('shared', 'Lists are shared')}
<p>Assigning a list to another variable doesn’t copy it. Both names refer to the same list:</p>
${h.example('ধৰা ক = [১, ২]\nধৰা খ = ক\nসংযোজন(খ, ৩)\nকোৱা(ক)', 'dhora k = [1, 2]\ndhora kh = k\nxonjojon(kh, 3)\nkowa(k)')}
<p>Lists can hold any values, including other lists. <code>==</code> compares lists item by item.</p>`,
    as: (h) => `
${h.h2('create', 'বনাওক আৰু পঢ়ক')}
${h.example('ধৰা ফল = ["আম", "কল", "লিচু"]\nকোৱা(ফল)\nকোৱা(ফল[০], দৈৰ্ঘ্য(ফল))', 'dhora fol = ["aam", "kol", "lisu"]\nkowa(fol)\nkowa(fol[0], doirghyo(fol))')}
<p>স্থান <code>০</code>-ৰ পৰা আৰম্ভ হয়। শেষৰ পিছৰ স্থান পঢ়াটো ভুল (<code>R010</code>)।</p>
${h.h2('change', 'সলনি আৰু যোগ কৰক')}
${h.example('ধৰা সংখ্যাবোৰ = [১, ২, ৩]\nসংখ্যাবোৰ[০] = ১০\nসংযোজন(সংখ্যাবোৰ, ৪)\nকোৱা(সংখ্যাবোৰ)', 'dhora xonkhyabur = [1, 2, 3]\nxonkhyabur[0] = 10\nxonjojon(xonkhyabur, 4)\nkowa(xonkhyabur)')}
${h.h2('loop', 'তালিকাৰ প্ৰতিটো উপাদান')}
${h.example('ধৰা নম্বৰ = [৭২, ৮৫, ৯০, ৬৪]\nধৰা মুঠ = ০\nধৰা ক = ০\nযেতিয়ালৈকে (ক < দৈৰ্ঘ্য(নম্বৰ)) {\n    মুঠ = মুঠ + নম্বৰ[ক]\n    ক = ক + ১\n}\nকোৱা("গড়:", মুঠ / দৈৰ্ঘ্য(নম্বৰ))', 'dhora nombor = [72, 85, 90, 64]\ndhora mut = 0\ndhora k = 0\njetialoike (k < doirghyo(nombor)) {\n    mut = mut + nombor[k]\n    k = k + 1\n}\nkowa("gor:", mut / doirghyo(nombor))')}
${h.h2('shared', 'তালিকা ভাগ-বতৰা হয়')}
<p>তালিকা এটা আন চলকলৈ দিলে কপি নহয়। দুয়োটা নামে একেটা তালিকাকে বুজায়:</p>
${h.example('ধৰা ক = [১, ২]\nধৰা খ = ক\nসংযোজন(খ, ৩)\nকোৱা(ক)', 'dhora k = [1, 2]\ndhora kh = k\nxonjojon(kh, 3)\nkowa(k)')}
<p>তালিকাত যিকোনো মান থাকিব পাৰে, আন তালিকাও। <code>==</code>-এ তালিকাৰ প্ৰতিটো উপাদান তুলনা কৰে।</p>`,
  },
};

const input = {
  id: 'input',
  path: 'learn/input/',
  title: { en: 'Reading input', as: 'ইনপুট পঢ়া' },
  description: {
    en: 'Ask the user a question with সোধা (xudha) and turn the answer into a number.',
    as: 'সোধা দি ব্যৱহাৰকাৰীক প্ৰশ্ন সোধক আৰু উত্তৰটো সংখ্যালৈ সলনি কৰক।',
  },
  intro: {
    en: '<code>সোধা</code> (<code>xudha</code>, “ask”) shows a question and reads one line that the user types.',
    as: '<code>সোধা</code>-ই এটা প্ৰশ্ন দেখুৱায় আৰু ব্যৱহাৰকাৰীয়ে লিখা এটা শাৰী পঢ়ে।',
  },
  body: {
    en: (h) => `
${h.example('ধৰা নাম = সোধা("আপোনাৰ নাম কি? ")\nকোৱা("নমস্কাৰ, " + নাম)', 'dhora naam = xudha("Tomar naam ki? ")\nkowa("Nomoskar, " + naam)', { stdin: 'Rita' })}
${h.h2('numbers', 'Numbers from input')}
<p><code>সোধা</code> always gives back text. Convert it with <code>সংখ্যা</code> (<code>xonkhya</code>), which gives <code>খালী</code> if the answer isn’t a number:</p>
${h.example('ধৰা উত্তৰ = সংখ্যা(সোধা("এটা সংখ্যা দিয়ক: "))\nযদি (উত্তৰ == খালী) {\n    কোৱা("সেইটো সংখ্যা নহয়")\n} নহ\'লে {\n    কোৱা("দুগুণ:", উত্তৰ * ২)\n}', 'dhora uttor = xonkhya(xudha("Ekta xonkhya diok: "))\njodi (uttor == khali) {\n    kowa("eitu xonkhya nohoy")\n} nohole {\n    kowa("dugun:", uttor * 2)\n}', { stdin: '21' })}
${h.h2('where', 'Where input comes from')}
<ul>
  <li><strong>Terminal:</strong> the program waits for you to type a line and press Enter.</li>
  <li><strong>VS Code:</strong> a box appears at the bottom of the Asomiya panel; type the answer and press Enter.</li>
  <li><strong>Playground:</strong> type answers in the <em>Input</em> box before you press Run, one answer per line.</li>
  <li>When there is nothing left to read, <code>সোধা</code> gives <code>খালী</code>.</li>
</ul>
${h.figure('vscode-ask', 'In VS Code, the program waits for your answer in the Asomiya panel.')}`,
    as: (h) => `
${h.example('ধৰা নাম = সোধা("আপোনাৰ নাম কি? ")\nকোৱা("নমস্কাৰ, " + নাম)', 'dhora naam = xudha("Tomar naam ki? ")\nkowa("Nomoskar, " + naam)', { stdin: 'ৰীতা' })}
${h.h2('numbers', 'ইনপুটৰ পৰা সংখ্যা')}
<p><code>সোধা</code>-ই সদায় পাঠ ঘূৰাই দিয়ে। <code>সংখ্যা</code> দি সলনি কৰক; উত্তৰটো সংখ্যা নহ’লে ই <code>খালী</code> দিয়ে:</p>
${h.example('ধৰা উত্তৰ = সংখ্যা(সোধা("এটা সংখ্যা দিয়ক: "))\nযদি (উত্তৰ == খালী) {\n    কোৱা("সেইটো সংখ্যা নহয়")\n} নহ\'লে {\n    কোৱা("দুগুণ:", উত্তৰ * ২)\n}', 'dhora uttor = xonkhya(xudha("Ekta xonkhya diok: "))\njodi (uttor == khali) {\n    kowa("eitu xonkhya nohoy")\n} nohole {\n    kowa("dugun:", uttor * 2)\n}', { stdin: '২১' })}
${h.h2('where', 'ইনপুট ক’ৰ পৰা আহে')}
<ul>
  <li><strong>টাৰ্মিনেল:</strong> প্ৰগ্ৰামটোৱে আপুনি এটা শাৰী লিখি Enter টিপালৈকে অপেক্ষা কৰে।</li>
  <li><strong>VS Code:</strong> অসমীয়া পেনেলৰ তলত এটা বাকচ ওলায়; উত্তৰ লিখি Enter টিপক।</li>
  <li><strong>প্লেগ্ৰাউণ্ড:</strong> চলাওক টিপাৰ আগতে <em>ইনপুট</em> বাকচত উত্তৰবোৰ লিখক, প্ৰতি শাৰীত এটা।</li>
  <li>পঢ়িবলৈ একো নাথাকিলে <code>সোধা</code>-ই <code>খালী</code> দিয়ে।</li>
</ul>
${h.figure('vscode-ask', 'VS Code ত প্ৰগ্ৰামটোৱে অসমীয়া পেনেলত আপোনাৰ উত্তৰলৈ অপেক্ষা কৰে।')}`,
  },
};

const errors = {
  id: 'errors',
  path: 'learn/errors/',
  title: { en: 'Understanding errors', as: 'ভুল বুজি পোৱা' },
  description: {
    en: 'How to read Asomiya error messages: the code, the message, and the arrow that points at the problem.',
    as: 'অসমীয়াৰ ভুলৰ বাৰ্তা কেনেকৈ পঢ়িব: ক’ড, বাৰ্তা, আৰু সমস্যাটো দেখুওৱা কাঁড়চিহ্ন।',
  },
  intro: {
    en: 'Everyone makes mistakes when programming. Asomiya’s error messages are designed to help you fix them quickly.',
    as: 'প্ৰগ্ৰামিং কৰোঁতে সকলোৱে ভুল কৰে। অসমীয়াৰ ভুলৰ বাৰ্তাবোৰ সেইবোৰ সোনকালে শুধৰাবলৈ সহায় কৰিবলৈ বনোৱা হৈছে।',
  },
  body: {
    en: (h) => `
${h.h2('anatomy', 'Reading an error')}
${h.sample('ধৰা ক = ৫\nকোৱা(ক + খ)', { expectError: true })}
<ol>
  <li><strong>The kind and code</strong>, like <code>R001</code>. The letter says when it happened: <code>L</code> while reading the text, <code>P</code> while understanding the grammar, <code>R</code> while running.</li>
  <li><strong>The message</strong>, in Assamese or English (choose with <code>--lang en</code>, or the switch in the playground).</li>
  <li><strong>The place</strong>: file, line and column, and the line itself with <code>^</code> under the problem.</li>
</ol>
<p>In VS Code you don’t have to run the program to see grammar mistakes: they are underlined as you type, and the code links to its explanation.</p>
${h.figure('vscode-errors', 'A missing ) in VS Code: the mistake is underlined and listed under Problems with its code, P001.')}
${h.h2('common', 'Common mistakes')}
${h.table(
  ['Code', 'What it means', 'Fix'],
  [
    [
      '<code>R001</code>',
      'A name was used before it was created.',
      'Create it with <code>ধৰা</code> first, or check the spelling.',
    ],
    [
      '<code>P007</code>',
      'Two statements on one line, or a typo in a keyword.',
      'Put them on separate lines, or fix the keyword.',
    ],
    [
      '<code>R003</code>',
      'An operator was used on the wrong kind of value, like <code>"ক" - ১</code>.',
      'Convert with <code>সংখ্যা()</code> or <code>পাঠ()</code>.',
    ],
    [
      '<code>R007</code>',
      'A condition isn’t <code>সঁচা</code> or <code>মিছা</code>.',
      'Compare: <code>যদি (ক > ০)</code>.',
    ],
    [
      '<code>R008</code>',
      'The program ran too long (probably an endless loop).',
      'Make sure the loop’s condition can become <code>মিছা</code>.',
    ],
  ],
)}
${h.h2('hints', 'Hints for typos')}
${h.sample('dhora x = 5\nkowaa(x)', { expectError: true })}
<p>Every error code is listed in the <a href="${h.link('reference/errors/')}">error reference</a>, with an example of what causes it.</p>`,
    as: (h) => `
${h.h2('anatomy', 'ভুল এটা পঢ়া')}
${h.sample('ধৰা ক = ৫\nকোৱা(ক + খ)', { expectError: true })}
<ol>
  <li><strong>প্ৰকাৰ আৰু ক’ড</strong>, যেনে <code>R001</code>। আখৰটোৱে কয় কেতিয়া ভুলটো হ’ল: <code>L</code> লিখা পঢ়োঁতে, <code>P</code> বাক্য-গঠন বুজোঁতে, <code>R</code> চলোৱাৰ সময়ত।</li>
  <li><strong>বাৰ্তা</strong>, অসমীয়া বা ইংৰাজীত (<code>--lang en</code> দি বা প্লেগ্ৰাউণ্ডৰ বুটামেৰে বাছি লওক)।</li>
  <li><strong>স্থান</strong>: ফাইল, শাৰী আৰু স্তম্ভ, আৰু সমস্যাটোৰ তলত <code>^</code> থকা শাৰীটো।</li>
</ol>
<p>VS Code ত বাক্য-গঠনৰ ভুল চাবলৈ প্ৰগ্ৰাম চলাব নালাগে: লিখোঁতেই তলত ৰেখা পৰে, আৰু ক’ডটোৱে ব্যাখ্যালৈ লৈ যায়।</p>
${h.figure('vscode-errors', 'VS Code ত এটা ) নাই: ভুলটোৰ তলত ৰেখা পৰিছে আৰু Problems ত ইয়াৰ ক’ড P001 ৰ সৈতে দেখুৱাইছে।')}
${h.h2('common', 'সাধাৰণ ভুল')}
${h.table(
  ['ক’ড', 'অৰ্থ', 'সমাধান'],
  [
    [
      '<code>R001</code>',
      'নাম এটা বনোৱাৰ আগতে ব্যৱহাৰ কৰা হ’ল।',
      'আগতে <code>ধৰা</code> দি বনাওক, বা বানান চাওক।',
    ],
    [
      '<code>P007</code>',
      'এটা শাৰীত দুটা বাক্য, বা মূল শব্দৰ বানান ভুল।',
      'বেলেগ শাৰীত লিখক, বা মূল শব্দটো শুধৰাওক।',
    ],
    [
      '<code>R003</code>',
      'ভুল প্ৰকাৰৰ মানত অপাৰেটৰ ব্যৱহাৰ, যেনে <code>"ক" - ১</code>।',
      '<code>সংখ্যা()</code> বা <code>পাঠ()</code> দি সলনি কৰক।',
    ],
    [
      '<code>R007</code>',
      'চৰ্তটো <code>সঁচা</code> বা <code>মিছা</code> নহয়।',
      'তুলনা কৰক: <code>যদি (ক > ০)</code>।',
    ],
    [
      '<code>R008</code>',
      'প্ৰগ্ৰামটো বহু সময় চলিল (হয়তো অন্তহীন লুপ)।',
      'লুপৰ চৰ্তটো এসময়ত <code>মিছা</code> হ’ব পৰাকৈ লিখক।',
    ],
  ],
)}
${h.h2('hints', 'বানান ভুলৰ বাবে সহায়')}
${h.sample('dhora x = 5\nkowaa(x)', { expectError: true })}
<p>প্ৰতিটো ভুলৰ ক’ড উদাহৰণসহ <a href="${h.link('reference/errors/')}">ভুলৰ তালিকাত</a> আছে।</p>`,
  },
};

export const LEARN = {
  id: 'learn',
  groups: [
    {
      title: { en: 'Get started', as: 'আৰম্ভণি' },
      pages: [quickStart, installation, englishLetters],
    },
    {
      title: { en: 'The basics', as: 'মূল কথা' },
      pages: [variables, values, operators, text],
    },
    {
      title: { en: 'Control flow', as: 'নিয়ন্ত্ৰণ' },
      pages: [conditions, loops],
    },
    {
      title: { en: 'Going further', as: 'আগবাঢ়ক' },
      pages: [functions, lists, input, errors],
    },
  ].map((g) => ({ ...g, pages: g.pages.map((p) => ({ ...p, section: 'learn' })) })),
  title: { en: 'Learn', as: 'শিকক' },
};
