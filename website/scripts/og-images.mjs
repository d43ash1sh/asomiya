// Draws the preview image (og:image, 1200×630) for every page: the card WhatsApp, Facebook, X and
// LinkedIn show when someone shares a link to asomiya.codes.
//
// Run with `npm run website:og` (it builds the library first) and commit website/og/*.png. The cards
// are drawn by Chrome, so Assamese text is shaped by a real browser engine with the site's own fonts.
// Set CHROME=/path/to/chrome if Chrome is not in the usual place.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { allPages, ogImageFile } from '../lib/pages.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'og');
const WIDTH = 1200;
const HEIGHT = 630;

const CHROME =
  process.env.CHROME ??
  [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].find((p) => existsSync(p));
if (!CHROME) throw new Error('Chrome not found. Set CHROME=/path/to/chrome.');

// `display=block` so the screenshot never catches a fallback font.
const FONTS =
  'https://fonts.googleapis.com/css2?family=Geist:wght@500;600&family=Red+Hat+Display:wght@700&family=Geist+Mono:wght@500&family=Noto+Sans+Bengali:wght@500;600;700&display=block';

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** The small label above the title. */
function label(def, lang, section) {
  if (def.id === 'home') return lang === 'as' ? 'অসমীয়াত ক’ড লিখক' : 'Code in Assamese';
  if (section?.id === 'learn') return lang === 'as' ? 'শিকক' : 'Learn';
  if (section?.id === 'reference') return section.title[lang];
  return lang === 'as' ? 'অসমীয়াত প্ৰগ্ৰামিং' : 'Programming in Assamese';
}

/** Plain text of a description (some contain <code> tags). */
const plain = (html) => {
  let text = html;
  let previous;
  do {
    previous = text;
    text = text.replace(/<[^<>]*>/g, '');
  } while (text !== previous);
  return text.replace(/[<>]/g, '');
};

// The sample on every card: the for-each loop, highlighted like the site's code blocks.
const kw = (s) => `<span class="kw">${s}</span>`;
const st = (s) => `<span class="st">${s}</span>`;
const SAMPLE = [
  `${kw('ধৰা')} ফলবোৰ = [${st('"আম"')}, ${st('"কল"')}, ${st('"লিচু"')}]`,
  `${kw('প্ৰতিটো')} ফল ফলবোৰ ${kw('মাজত')} {`,
  `    ${kw('কোৱা')}(${st('"মোৰ "')} + ফল + ${st('" ভাল লাগে"')})`,
  `}`,
].join('\n');
const OUTPUT = 'মোৰ আম ভাল লাগে\nমোৰ কল ভাল লাগে\nমোৰ লিচু ভাল লাগে';

function card(def, lang, section) {
  const title = def.title[lang];
  const description = plain(def.description[lang]);
  const scene = pathToFileURL(join(ROOT, 'screens', 'scene-valley.png')).href;
  const logo = pathToFileURL(join(ROOT, 'public', 'favicon.svg')).href;
  const asFont = "'Noto Sans Bengali', 'Geist', sans-serif";
  const textFont = lang === 'as' ? asFont : "'Geist', 'Noto Sans Bengali', sans-serif";
  const titleFont = lang === 'as' ? asFont : "'Red Hat Display', 'Noto Sans Bengali', sans-serif";
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8" />
<link rel="stylesheet" href="${FONTS}" />
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body { background: #fafaf9; color: #292524; font-family: ${textFont}; position: relative; }
  .scene { position: absolute; left: 0; right: 0; bottom: 0; height: 150px;
    background: url('${scene}') center 78% / ${WIDTH}px auto no-repeat; image-rendering: pixelated; }
  .scene::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 46px;
    background: linear-gradient(#fafaf9, rgb(250 250 249 / 0)); }
  .brand { position: absolute; left: 64px; top: 52px; display: flex; align-items: center; gap: 16px; }
  .brand img { width: 56px; height: 56px; }
  .brand b { font: 700 34px 'Red Hat Display', sans-serif; letter-spacing: -0.5px; }
  .brand span { font: 600 24px ${asFont}; color: #78716c; }
  .text { position: absolute; left: 64px; top: 150px; width: 528px; }
  .label { font: 600 22px ${textFont}; color: #3f40fa; margin-bottom: 14px; }
  h1 { font: 700 ${title.length > 26 ? 52 : 64}px/1.12 ${titleFont}; letter-spacing: ${lang === 'as' ? 0 : -1}px;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  p { margin-top: 18px; font-size: 24px; line-height: 1.4; color: #57534e;
    display: -webkit-box; -webkit-line-clamp: ${title.length > 26 ? 2 : 3}; -webkit-box-orient: vertical; overflow: hidden; }
  .code { position: absolute; right: 56px; top: 64px; width: 520px; background: #fff;
    border: 1px solid #e7e5e4; border-radius: 16px; box-shadow: 0 18px 40px -18px rgb(41 37 36 / 0.35); overflow: hidden; }
  .bar { display: flex; gap: 8px; padding: 14px 18px; border-bottom: 1px solid #f0efee; }
  .bar i { width: 12px; height: 12px; border-radius: 50%; background: #e7e5e4; }
  pre { padding: 18px 22px; font: 500 19px/1.65 'Geist Mono', ${asFont}; white-space: pre; color: #292524; }
  .kw { color: #3f40fa; font-weight: 600; } .st { color: #4d7c0f; }
  .out { border-top: 1px solid #f0efee; background: #fafaf9; padding: 14px 22px 18px;
    font: 500 18px/1.6 ${asFont}; color: #57534e; white-space: pre; }
  .out small { display: block; font: 600 14px 'Geist', sans-serif; letter-spacing: 1px; color: #a8a29e;
    text-transform: uppercase; margin-bottom: 4px; }
  .url { position: absolute; right: 56px; bottom: 26px; background: #292524; color: #fafaf9;
    font: 600 22px 'Geist', sans-serif; padding: 10px 20px; border-radius: 999px; }
</style></head>
<body>
  <div class="scene"></div>
  <div class="brand"><img src="${logo}" alt="" /><b>asomiya</b><span>অসমীয়া</span></div>
  <div class="text">
    <div class="label">${esc(label(def, lang, section))}</div>
    <h1>${esc(title)}</h1>
    <p>${esc(description)}</p>
  </div>
  <div class="code">
    <div class="bar"><i></i><i></i><i></i></div>
    <pre>${SAMPLE}</pre>
    <div class="out"><small>${lang === 'as' ? 'ফলাফল' : 'Output'}</small>${esc(OUTPUT)}</div>
  </div>
  <div class="url">asomiya.codes</div>
</body></html>`;
}

const only = process.argv[2]; // e.g. `learn-loops`, to redraw one card while designing
mkdirSync(OUT, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'asomiya-og-'));
try {
  let n = 0;
  for (const { def, lang, section } of allPages()) {
    const file = ogImageFile(def.localUrl(lang));
    const name = file.slice('og/'.length, -'.png'.length);
    if (only && name !== only) continue;
    const html = join(work, `${name}.html`);
    writeFileSync(html, card(def, lang, section));
    execFileSync(
      CHROME,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--allow-file-access-from-files',
        '--force-device-scale-factor=1',
        `--window-size=${WIDTH},${HEIGHT}`,
        '--virtual-time-budget=8000',
        `--screenshot=${join(ROOT, file)}`,
        pathToFileURL(html).href,
      ],
      { stdio: 'ignore' },
    );
    n++;
    console.log(file);
  }
  console.log(`${n} preview images in website/og/`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
