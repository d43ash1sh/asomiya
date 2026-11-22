// Home page motion: sections that fade in on scroll, the hero demo that types a program and shows
// its output, numbers that count up, and the drifting cloud layer over the pixel-art scenes.
// Everything here is decoration: the page reads the same without it.

const motionOk = (): boolean => document.documentElement.classList.contains('js-motion');

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Adds `is-in` to each [data-reveal] element the first time it scrolls into view. */
function setupReveal(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!motionOk()) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // In view: a tenth of it shows, or its top is well inside the window. (Short things at the
        // very end of the page, like the footer wordmark, can never get far into view.)
        const shown =
          entry.intersectionRatio >= 0.1 ||
          (entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight * 0.85);
        if (!shown) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
        for (const n of entry.target.querySelectorAll<HTMLElement>('[data-count]')) countUp(n);
      }
    },
    { threshold: [0, 0.1] },
  );
  for (const item of items) observer.observe(item);
  document.documentElement.classList.add('reveal-ready');
}

function countUp(el: HTMLElement): void {
  const target = Number(el.dataset['count']);
  if (!Number.isFinite(target) || target < 2) return;
  const start = performance.now();
  const duration = 1100;
  const step = (now: number): void => {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = String(Math.round(target * (1 - (1 - t) ** 3)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** How many screen pixels one picture pixel takes, so the clouds drift by exactly one tile. */
function setupScenes(): void {
  const scenes = document.querySelectorAll<HTMLElement>('.ds-scene, .ds-stage');
  if (scenes.length === 0 || !('ResizeObserver' in window)) return;
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      const { width, height } = entry.contentRect;
      const box = el.getBoundingClientRect();
      const px = Math.max((box.width || width) / 400, (box.height || height) / 225);
      el.style.setProperty('--px', px.toFixed(4));
      el.classList.add('has-px');
    }
  });
  for (const scene of scenes) observer.observe(scene);
}

/** The hero card: types a one-line program, "sends" it, and shows what it printed. */
function setupDemo(): void {
  const root = document.querySelector<HTMLElement>('[data-demo]');
  if (root === null || !motionOk()) return;
  const code = root.querySelector<HTMLElement>('[data-demo-code]');
  const out = root.querySelector<HTMLElement>('[data-demo-out]');
  const answer = root.querySelector<HTMLElement>('[data-demo-answer]');
  const send = root.querySelector<HTMLAnchorElement>('[data-demo-send]');
  const items = [...root.querySelectorAll<HTMLTemplateElement>('template[data-demo-item]')];
  if (code === null || out === null || answer === null || send === null || items.length === 0) {
    return;
  }

  let visible = false;
  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
  }).observe(root);
  /** Resolves once the card is on screen and the tab is in front. */
  const whenShown = async (): Promise<void> => {
    while (!visible || document.hidden) await wait(400);
  };

  const play = async (item: HTMLTemplateElement): Promise<void> => {
    const highlighted = item.content.querySelector('code');
    const result = item.content.querySelector('p');
    if (highlighted === null || result === null) return;
    const text = highlighted.textContent;

    answer.classList.add('is-hidden');
    await wait(450);
    await whenShown();
    code.textContent = '';
    code.classList.add('is-typing');
    // Type grapheme by grapheme, so joined Assamese letters appear whole.
    const parts =
      'Segmenter' in Intl
        ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(
            (s) => s.segment,
          )
        : Array.from(text);
    let typed = '';
    for (const part of parts) {
      typed += part;
      code.textContent = typed;
      await wait(45 + Math.random() * 55);
    }
    code.replaceChildren(...[...highlighted.cloneNode(true).childNodes]);
    code.classList.remove('is-typing');
    send.href = item.dataset['href'] ?? send.href;
    send.classList.add('is-pressed');
    await wait(320);
    send.classList.remove('is-pressed');
    out.textContent = result.textContent;
    answer.classList.remove('is-hidden');
    await wait(4200);
  };

  void (async () => {
    // The first program is already on the page; start with the next one after a pause.
    await wait(3200);
    for (let i = 1; ; i = (i + 1) % items.length) {
      const item = items[i];
      if (item !== undefined) await play(item);
    }
  })();
}

setupScenes();
setupReveal();
setupDemo();
