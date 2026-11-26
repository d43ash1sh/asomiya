// "Use with AI" page: the asomiya-mcp server, which lets Claude, ChatGPT, VS Code and other AI apps
// write, check and run Asomiya. Every sample on it is run by the build.
import { readFileSync } from 'node:fs';
import { SITE } from '../site.config.mjs';
import { icon } from '../lib/icons.mjs';

const NPM = 'https://www.npmjs.com/package/asomiya-mcp';
/** The server's version, so the .mcpb file name on this page always matches the release. */
const VERSION = JSON.parse(
  readFileSync(new URL('../../mcp/package.json', import.meta.url), 'utf8'),
).version;
const MCPB = `asomiya-${VERSION}.mcpb`;
const RELEASES = `${SITE.repo}/releases`;
const README = `${SITE.repo}/tree/main/mcp#readme`;
const ext = (href, label) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;

const CONFIG = `{
  "mcpServers": {
    "asomiya": { "command": "npx", "args": ["-y", "asomiya-mcp"] }
  }
}`;

// What Claude wrote, unedited, the first time it was asked with the server installed.
const SUM = `// ১ৰ পৰা ১০লৈকে সংখ্যাবোৰৰ যোগফল
ধৰা যোগফল = ০
ধৰা ক = ১

যেতিয়ালৈকে (ক <= ১০) {
    যোগফল = যোগফল + ক
    ক = ক + ১
}

কোৱা("১ৰ পৰা ১০লৈকে যোগফল: " + যোগফল)`;

const S = {
  en: {
    title: 'Use Asomiya with AI',
    lead: 'Ask Claude, ChatGPT or Copilot to write Asomiya, and it gets it right. The Asomiya MCP server gives AI assistants the language itself: they look up keywords, run every program before showing it, and explain errors in Assamese or English.',
    howTitle: 'What changes',
    how: 'AI models have seen very little Asomiya, so on their own they guess keywords and write code that doesn’t run. With the server, they read a guide made for them, test each program in the real interpreter and fix their own mistakes. In apps that support it, the program appears in a small playground inside the chat, where you can edit and run it.',
    askTitle: 'Asked in English letters, answered in Assamese',
    ask: 'Asked: “Asomiyat ekhon program likha jiye 1 ru 10 loike sonkhyabur jog kore.” Claude read the guide, wrote this, ran it and showed the real output:',
    setupTitle: 'Set it up',
    needs: `You need ${ext('https://nodejs.org', 'Node.js')} 20 or newer. Then pick your app:`,
    apps: [
      [
        'Claude Desktop',
        `Download <code>${MCPB}</code> from the ${ext(RELEASES, 'releases page')} and double-click it. Or open Settings → Developer → Edit Config and add:`,
      ],
      ['Claude Code', 'Run this once in a terminal:'],
      ['VS Code (Copilot agent mode)', 'Run this once in a terminal:'],
      [
        'Cursor, Windsurf, Goose and others',
        'Add an MCP server with the command <code>npx</code> and the arguments <code>-y asomiya-mcp</code> (the same JSON as for Claude Desktop).',
      ],
    ],
    tryTitle: 'Things to ask',
    tries: [
      'Teach me loops in Asomiya, in Assamese.',
      'Write a program in Asomiya that checks whether a number is even.',
      'Translate this Python program to Asomiya: …',
      'What does error P013 mean?',
      'Show this Asomiya program in Python.',
    ],
    toolsTitle: 'What the AI can do',
    toolHead: ['Tool', 'What it does'],
    tools: [
      ['run_asomiya', 'Runs a program and shows the output or the error, in English and Assamese.'],
      ['check_asomiya', 'Finds spelling and syntax mistakes without running the program.'],
      ['asomiya_to_python', 'Shows the same program in Python.'],
      [
        'lookup_keyword',
        'Looks up any keyword or built-in, in Assamese script, English letters or English.',
      ],
      ['explain_error', 'Explains an error code and how to fix it.'],
    ],
    toolsNote:
      'It can also read the whole language reference and the example programs, and has two ready-made prompts: a lesson on any topic, and translating a program to Asomiya.',
    safeTitle: 'Safe to run',
    safe: 'Programs run in the Asomiya interpreter, which can’t touch your files, the network or the system, and stops runaway loops. The server runs on your computer, makes no network requests and collects nothing.',
    links: 'Source and docs',
  },
  as: {
    title: 'AI-ৰ সৈতে অসমীয়া',
    lead: 'Claude, ChatGPT বা Copilot-ক অসমীয়াত ক’ড লিখিবলৈ কওক, সিহঁতে শুদ্ধকৈ লিখিব। অসমীয়া MCP ছাৰ্ভাৰে AI সহায়কক ভাষাটো নিজেই দিয়ে: সিহঁতে মূল শব্দ বিচাৰি লয়, দেখুওৱাৰ আগতে প্ৰতিটো প্ৰগ্ৰাম চলাই চায়, আৰু ভুল অসমীয়া বা ইংৰাজীত বুজায়।',
    howTitle: 'কি সলনি হয়',
    how: 'AI মডেলে অসমীয়া ক’ড খুব কমেই দেখিছে, সেয়ে নিজে নিজে সিহঁতে মূল শব্দ অনুমান কৰে আৰু নচলা ক’ড লিখে। ছাৰ্ভাৰটোৰ সৈতে সিহঁতে নিজৰ বাবে বনোৱা নিৰ্দেশিকা পঢ়ে, প্ৰতিটো প্ৰগ্ৰাম সঁচা ইণ্টাৰপ্ৰেটাৰত চলাই চায় আৰু নিজৰ ভুল নিজে শুধৰায়। যিবোৰ এপে সমৰ্থন কৰে, তাত প্ৰগ্ৰামটো চেটৰ ভিতৰতে এটা সৰু প্লেগ্ৰাউণ্ডত ওলায়, য’ত আপুনি সলনি কৰি চলাব পাৰে।',
    askTitle: 'ইংৰাজী আখৰত সোধা, অসমীয়াত উত্তৰ',
    ask: 'সোধা হ’ল: “Asomiyat ekhon program likha jiye 1 ru 10 loike sonkhyabur jog kore.” Claude-এ নিৰ্দেশিকা পঢ়িলে, এইটো লিখিলে, চলালে আৰু সঁচা ফলাফল দেখুৱালে:',
    setupTitle: 'ব্যৱহাৰ কৰিবলৈ সাজু কৰক',
    needs: `${ext('https://nodejs.org', 'Node.js')} ২০ বা তাতকৈ নতুন সংস্কৰণ লাগিব। তাৰ পিছত আপোনাৰ এপটো বাছক:`,
    apps: [
      [
        'Claude Desktop',
        `${ext(RELEASES, 'ৰিলিজ পৃষ্ঠা')}ৰ পৰা <code>${MCPB}</code> ডাউনলোড কৰি দুবাৰ ক্লিক কৰক। নহ’লে Settings → Developer → Edit Config খুলি এইখিনি যোগ কৰক:`,
      ],
      ['Claude Code', 'টাৰ্মিনেলত এবাৰ এইটো চলাওক:'],
      ['VS Code (Copilot agent mode)', 'টাৰ্মিনেলত এবাৰ এইটো চলাওক:'],
      [
        'Cursor, Windsurf, Goose আৰু আন',
        '<code>npx</code> কমাণ্ড আৰু <code>-y asomiya-mcp</code> আৰ্গুমেণ্টৰে এটা MCP ছাৰ্ভাৰ যোগ কৰক (Claude Desktop-ৰ দৰে একেটা JSON)।',
      ],
    ],
    tryTitle: 'কি সুধিব পাৰে',
    tries: [
      'মোক অসমীয়াত অসমীয়া প্ৰগ্ৰামিঙৰ লুপ শিকাওক।',
      'এটা সংখ্যা যুগ্ম নে নহয় চোৱা অসমীয়া প্ৰগ্ৰাম লিখক।',
      'এই Python প্ৰগ্ৰামটো অসমীয়ালৈ অনুবাদ কৰক: …',
      'P013 ভুলৰ অৰ্থ কি?',
      'এই অসমীয়া প্ৰগ্ৰামটো Python-ত দেখুৱাওক।',
    ],
    toolsTitle: 'AI-এ কি কৰিব পাৰে',
    toolHead: ['সঁজুলি', 'কাম'],
    tools: [
      ['run_asomiya', 'প্ৰগ্ৰাম চলায় আৰু ফলাফল বা ভুল দেখুৱায়, ইংৰাজী আৰু অসমীয়াত।'],
      ['check_asomiya', 'প্ৰগ্ৰাম নচলোৱাকৈ বানান আৰু বাক্য-গঠনৰ ভুল বিচাৰে।'],
      ['asomiya_to_python', 'একেটা প্ৰগ্ৰাম Python-ত দেখুৱায়।'],
      [
        'lookup_keyword',
        'যিকোনো মূল শব্দ বা অন্তৰ্নিৰ্মিত ফাংচন বিচাৰে, অসমীয়া লিপি, ইংৰাজী আখৰ বা ইংৰাজীত।',
      ],
      ['explain_error', 'ভুলৰ ক’ড এটা আৰু তাক কেনেকৈ শুধৰাব বুজায়।'],
    ],
    toolsNote:
      'ই ভাষাটোৰ সম্পূৰ্ণ নথি আৰু উদাহৰণ প্ৰগ্ৰামবোৰো পঢ়িব পাৰে, আৰু দুটা সাজু প্ৰম্পট আছে: যিকোনো বিষয়ৰ পাঠ, আৰু প্ৰগ্ৰাম অসমীয়ালৈ অনুবাদ।',
    safeTitle: 'চলাবলৈ সুৰক্ষিত',
    safe: 'প্ৰগ্ৰামবোৰ অসমীয়া ইণ্টাৰপ্ৰেটাৰত চলে, যিয়ে আপোনাৰ ফাইল, নেটৱৰ্ক বা ছিষ্টেম চুব নোৱাৰে, আৰু অন্তহীন লুপ ৰখায়। ছাৰ্ভাৰটো আপোনাৰ কম্পিউটাৰত চলে, কোনো নেটৱৰ্ক অনুৰোধ নকৰে আৰু একো সংগ্ৰহ নকৰে।',
    links: 'উৎস আৰু নথি',
  },
};

function body(lang) {
  const s = S[lang];
  return (h) => `
<section class="page-hero">
  <h1>${s.title}</h1>
  <p>${s.lead}</p>
</section>
<section class="section narrow">
  ${h.h2('how', s.howTitle)}
  <p>${s.how}</p>
  ${h.h3('example', s.askTitle)}
  <p>${s.ask}</p>
  ${h.sample(SUM)}
</section>
<section class="section narrow">
  ${h.h2('setup', s.setupTitle)}
  <p>${s.needs}</p>
  ${h.h3('claude-desktop', s.apps[0][0])}
  <p>${s.apps[0][1]}</p>
  ${h.pre(CONFIG)}
  ${h.h3('claude-code', s.apps[1][0])}
  <p>${s.apps[1][1]}</p>
  ${h.shell('claude mcp add asomiya -- npx -y asomiya-mcp')}
  ${h.h3('vs-code', s.apps[2][0])}
  <p>${s.apps[2][1]}</p>
  ${h.shell(`code --add-mcp '{"name":"asomiya","command":"npx","args":["-y","asomiya-mcp"]}'`)}
  ${h.h3('others', s.apps[3][0])}
  <p>${s.apps[3][1]}</p>
</section>
<section class="section narrow">
  ${h.h2('try', s.tryTitle)}
  <ul>${s.tries.map((t) => `<li>${t}</li>`).join('')}</ul>
</section>
<section class="section narrow">
  ${h.h2('tools', s.toolsTitle)}
  ${h.table(
    s.toolHead,
    s.tools.map(([name, text]) => [h.code(name), text]),
  )}
  <p>${s.toolsNote}</p>
  ${h.h2('safety', s.safeTitle)}
  <p>${s.safe}</p>
  <div class="hero-cta">
    <a class="btn btn-primary" href="${README}" target="_blank" rel="noopener noreferrer">${icon('github')}${s.links}</a>
    <a class="btn btn-secondary" href="${NPM}" target="_blank" rel="noopener noreferrer">${icon('npm')}asomiya-mcp</a>
  </div>
</section>`;
}

export const AI_PAGE = {
  id: 'ai',
  path: 'ai/',
  section: 'ai',
  layout: 'page',
  title: { en: 'Use with AI', as: 'AI-ৰ সৈতে' },
  description: {
    en: 'Let Claude, ChatGPT, VS Code and other AI apps write, check and run Asomiya with the Asomiya MCP server.',
    as: 'অসমীয়া MCP ছাৰ্ভাৰৰ সহায়ত Claude, ChatGPT, VS Code আৰু আন AI এপক অসমীয়া লিখিবলৈ, পৰীক্ষা কৰিবলৈ আৰু চলাবলৈ দিয়ক।',
  },
  body: { en: body('en'), as: body('as') },
};
