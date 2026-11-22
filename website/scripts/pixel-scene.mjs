// Draws the pixel-art scenes on the home page, all from Assam:
//   scene-valley — the Brahmaputra valley: a Kamakhya-style temple on a hill, a country boat on the
//                  river, a one-horned rhino in the tall grass, a chang ghar and tamul palms.
//   scene-tea    — a tea garden on rolling slopes, shade trees and pluckers in japi hats.
//   scene-dusk   — sunset on the Brahmaputra, a boat and palms in silhouette.
//   clouds-day / clouds-dusk — a separate, see-through cloud layer that tiles sideways, so the page
//                  can let the clouds drift slowly over the scene.
// Run with `node website/scripts/pixel-scene.mjs`. The PNGs are small (400×225); the page scales them
// up with `image-rendering: pixelated`, so every pixel stays sharp on any screen.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const W = 400;
const H = 225;

/** Small seeded random generator, so every run draws the same picture. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fixed pseudo-random value in [0, 1) for a pixel, so textures look natural, not striped. */
function noise(x, y, k = 0) {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** Water: short horizontal ripples on a base colour. */
function ripple(x, y, k, base, light, dark, density = 0.07) {
  const r = noise(Math.floor((x + (y % 3) * 2) / 5), y, k);
  if (r < density) return light;
  if (r > 1 - density / 2) return dark;
  return base;
}

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
  255,
];

/** A canvas of RGBA pixels with a few drawing helpers. */
function canvas(w = W, h = H) {
  const px = new Uint8Array(w * h * 4);
  const c = {
    w,
    h,
    px,
    set(x, y, col) {
      x = Math.round(x);
      y = Math.round(y);
      if (x < 0 || y < 0 || x >= w || y >= h || col === undefined) return;
      const i = (y * w + x) * 4;
      px.set(col, i);
    },
    rect(x, y, rw, rh, col) {
      for (let j = 0; j < rh; j += 1) for (let i = 0; i < rw; i += 1) c.set(x + i, y + j, col);
    },
    /** Draws a sprite: rows of characters, each mapped to a colour ('.' is see-through). */
    sprite(x, y, rows, colours, flip = false) {
      rows.forEach((row, j) => {
        [...row].forEach((ch, i) => {
          if (ch === '.' || ch === ' ') return;
          c.set(flip ? x + row.length - 1 - i : x + i, y + j, colours[ch]);
        });
      });
    },
    line(x0, y0, x1, y1, col) {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let k = 0; k <= n; k += 1)
        c.set(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, col);
    },
  };
  return c;
}

/** A ridge line from a few sine waves. */
const ridge =
  (base, amp, k, phase = 0) =>
  (x) =>
    Math.round(
      base +
        amp * Math.sin(x * 0.019 * k + 1.3 + phase) +
        amp * 0.5 * Math.sin(x * 0.051 * k + 0.4 + phase * 2) +
        amp * 0.22 * Math.sin(x * 0.13 * k + phase),
    );

/** Sky in dithered bands from top to `bottom`. */
function sky(c, colours, bottom) {
  for (let y = 0; y < c.h; y += 1) {
    const f = (y / bottom) * (colours.length - 1);
    for (let x = 0; x < c.w; x += 1) {
      const band = Math.min(colours.length - 1, Math.floor(f + ((x + y) % 2 === 0 ? 0.3 : -0.3)));
      c.set(x, y, colours[Math.max(0, band)]);
    }
  }
}

/** Fills everything below a ridge; `pick(x, y, depth)` chooses the colour. */
function fillBelow(c, top, pick, until = c.h) {
  for (let x = 0; x < c.w; x += 1) {
    const t = top(x);
    for (let y = Math.max(0, t); y < until; y += 1) c.set(x, y, pick(x, y, y - t));
  }
}

// ── sprites ───────────────────────────────────────────────────────────

// A one-horned rhino, facing left. d dark, m body, l light, h horn, e eye.
const RHINO = [
  '.............lllll..............',
  '...........llmmmmmlllllll.......',
  '......d...lmmmmmmmmmmmmmmlll....',
  '...h..dd.lmmmmmmmmmmmmmmmmmml...',
  '..hh..mmmmmdmmmmmmmmmmmmmmmmml..',
  '..hhmmmmmmmdmmmmmmmmdmmmmmmmmm..',
  '.hhmmemmmmmdmmmmmmmmdmmmmmmmmmd.',
  '.hmmmmmmmmmdmmmmmmmmdmmmmmmmmmd.',
  'mmmmmmmmmmmmdmmmmmmmdmmmmmmmmdd.',
  'mmmmmmmmmmmmdddmmmmmmdmmmmmmmdd.',
  '.mmmmmmd..mmmmmmmmmmmmmmmmmmddd.',
  '..dddd....ddmmmmmmmmmmmmmmmddd..',
  '..........dmmdddddddddddddmmdd..',
  '..........dmmd.dd....dd..dmmd...',
  '..........dmmd.dd....dd..dmmd...',
  '..........dmmd.dd....dd..dmmd...',
  '.........ddddd.ddd...ddd.dddd...',
];

// A country boat (nao) with a bamboo canopy (chhoi) and a boatman with a pole.
const BOAT = [
  '......................k.',
  '.......k.............k..',
  '......kkk...........k...',
  '......rrr..........k....',
  '......rrr.........k.....',
  '......ccc...ttttt.k.....',
  '......c.c..tttttttk.....',
  'b.....c.c..tt...ttk....b',
  'bb...........b...k....bb',
  '.bbbbbbbbbbbbbbbbbbbbbb.',
  '..BBBBBBBBBBBBBBBBBBBB..',
  '....BBBBBBBBBBBBBBBB....',
];

// A tea plucker: a japi hat, a red-and-cream mekhela chador, a basket on the back.
const PLUCKER = [
  '...yyy...',
  '.yyyyyyy.',
  'yyYYYYYyy',
  '...sss...',
  '..rrrrw..',
  '.srrrrww.',
  '..ccccww.',
  '..cccc...',
  '..rrrr...',
  '..cccc...',
];

// A white egret.
const EGRET = ['.ww', 'ww.', 'www', '.w.'];

// A little bird in flight.
const BIRD = ['k.k', '.k.'];

// ── the scenes ────────────────────────────────────────────────────────

function templeOnHill(c, cx, groundY, P) {
  // Walls and steps.
  c.rect(cx - 15, groundY - 9, 31, 9, P.wall);
  c.rect(cx - 15, groundY - 9, 31, 1, P.wallLight);
  for (let x = cx - 15; x <= cx + 15; x += 3) c.rect(x, groundY - 7, 1, 7, P.wallShade);
  c.rect(cx - 2, groundY - 6, 4, 6, P.door);
  c.rect(cx - 17, groundY, 35, 2, P.wallShade);
  // Side domes.
  const dome = (dx, r, ribs) => {
    for (let dy = -r * 1.25; dy <= 0; dy += 1) {
      const half = Math.round(r * Math.sqrt(Math.max(0, 1 - (dy * dy) / (r * 1.25 * r * 1.25))));
      for (let x = -half; x <= half; x += 1) {
        const rib = ribs && (x + 64) % 3 === 0;
        c.set(dx + x, groundY - 9 + dy, rib ? P.domeShade : x > half / 3 ? P.domeShade : P.dome);
      }
    }
    c.set(dx, groundY - 10 - Math.round(r * 1.25), P.gold);
  };
  dome(cx - 11, 3, false);
  dome(cx + 11, 3, false);
  // The beehive dome, with ribs.
  const r = 8;
  for (let dy = -Math.round(r * 1.7); dy <= 0; dy += 1) {
    const f = -dy / (r * 1.7);
    const half = Math.round(r * Math.pow(Math.max(0, 1 - Math.pow(f, 2.6)), 0.5));
    for (let x = -half; x <= half; x += 1) {
      const rib = (x + 64) % 3 === 0;
      const shade = x > half / 2 ? P.domeShade : rib ? P.domeRib : P.dome;
      c.set(cx + x, groundY - 10 + dy, shade);
    }
  }
  const top = groundY - 10 - Math.round(r * 1.7);
  c.rect(cx - 1, top - 2, 3, 2, P.gold);
  c.set(cx, top - 3, P.gold);
  c.line(cx, top - 4, cx, top - 9, P.pole);
  c.rect(cx + 1, top - 9, 4, 2, P.flag);
  c.set(cx + 5, top - 8, P.flag);
}

function arecaPalm(c, x, base, height, P, rand) {
  const lean = rand() < 0.5 ? -1 : 1;
  for (let y = 0; y < height; y += 1) {
    const ox = Math.round((lean * y * y) / (height * height * 0.5));
    c.set(x + ox, base - y, y % 4 === 0 ? P.trunkRing : P.trunk);
  }
  const tx = x + Math.round((lean * height) / (height * 0.5));
  const ty = base - height;
  const fronds = [
    [-7, 2],
    [-5, -3],
    [0, -5],
    [5, -3],
    [7, 2],
    [-4, 4],
    [4, 4],
  ];
  for (const [dx, dy] of fronds) {
    const n = 7;
    for (let k = 1; k <= n; k += 1) {
      const fx = tx + (dx * k) / n;
      const fy = ty + (dy * k) / n + (k * k) / 14;
      c.set(fx, fy, k > n - 2 ? P.leafDark : P.leaf);
      if (k > 2) c.set(fx, fy + 1, P.leafDark);
    }
  }
  c.set(tx, ty, P.leafDark);
  c.set(tx - 1, ty + 2, P.nut);
  c.set(tx + 1, ty + 2, P.nut);
}

function bamboo(c, x, base, P, rand) {
  for (let s = 0; s < 6; s += 1) {
    const h = 26 + Math.floor(rand() * 16);
    const lean = (s - 2.5) * 0.18;
    for (let y = 0; y < h; y += 1) {
      const bx = x + s * 2 + Math.round(lean * y * (y / h));
      c.set(bx, base - y, y % 6 === 0 ? P.bambooNode : P.bamboo);
      if (y > h * 0.45 && rand() < 0.35) {
        const dir = rand() < 0.5 ? -1 : 1;
        c.set(bx + dir, base - y, P.leaf);
        c.set(bx + dir * 2, base - y + 1, P.leafDark);
      }
    }
  }
}

function changGhar(c, x, groundY, P) {
  // Stilts.
  for (const sx of [1, 8, 15, 22]) c.rect(x + sx, groundY - 8, 1, 8, P.post);
  // Floor and bamboo walls.
  c.rect(x - 1, groundY - 9, 26, 2, P.post);
  for (let i = 0; i < 20; i += 1) {
    c.rect(x + 2 + i, groundY - 17, 1, 8, i % 2 === 0 ? P.bambooWall : P.bambooWallDark);
  }
  c.rect(x + 9, groundY - 15, 4, 6, P.door);
  // Thatched roof.
  for (let r = 0; r < 9; r += 1) {
    const half = 4 + r * 2;
    for (let i = -half; i <= half; i += 1) {
      c.set(x + 12 + i, groundY - 26 + r, (i + r) % 4 === 0 ? P.thatchDark : P.thatch);
    }
  }
  // Ladder.
  c.line(x + 24, groundY - 9, x + 28, groundY, P.post);
  c.line(x + 26, groundY - 9, x + 30, groundY, P.post);
}

function valley(P, seed) {
  const rand = rng(seed);
  const c = canvas();
  sky(c, P.sky, 120);

  // Far blue hills with a hazy top line.
  fillBelow(c, ridge(104, 14, 1, 0.4), (x, y, d) =>
    d < 2 ? P.haze : noise(x, y, 1) < 0.12 ? P.far[1] : P.far[0],
  );
  // Nearer hills, darker.
  fillBelow(c, ridge(122, 9, 1.5, 2.1), (x, y) => (noise(x, y, 2) < 0.1 ? P.mid[1] : P.mid[0]));

  // The Brahmaputra.
  const riverTop = 150;
  for (let y = riverTop; y < 184; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const col =
        y - riverTop < 2 ? P.river[2] : ripple(x, y, 7, P.river[0], P.river[1], P.river[3]);
      c.set(x, y, col);
    }
  }
  // Nilachal-like hill on the left, forested, with the temple on top.
  const hill = (x) => Math.round(116 + ((x - 62) * (x - 62)) / 70);
  fillBelow(
    c,
    hill,
    (x, y, d) => {
      if (d === 0) return P.forest[2];
      const n = noise(x >> 1, y >> 1, 5);
      return n < 0.18 ? P.forest[2] : n < 0.55 ? P.forest[1] : P.forest[0];
    },
    156,
  );
  // Where the hill meets the water.
  for (let x = 0; x < W; x += 1) if (hill(x) < 156) c.rect(x, 155, 1, 2, P.sand);
  templeOnHill(c, 62, 117, P);

  // Far bank: a thin sandbar.
  for (let x = 170; x < 290; x += 1) {
    const d = Math.abs(x - 230) / 60;
    if (d < 1) c.rect(x, riverTop + 7, 1, d < 0.6 ? 2 : 1, P.sand);
  }

  // The boat, on the right half of the river.
  c.sprite(256, 160, BOAT, {
    k: P.ink,
    r: P.gamosa,
    c: P.cloth,
    t: P.thatchDark,
    b: P.hull,
    B: P.hullDark,
  });

  // Near bank and Kaziranga grassland.
  const near = ridge(182, 3, 1.2, 1);
  fillBelow(c, near, (x, y, d) => {
    if (d < 2) return P.sand;
    const n = noise(x, y >> 1, 6);
    return n < 0.15 ? P.grass[2] : n < 0.5 ? P.grass[1] : P.grass[0];
  });
  // Tall elephant grass.
  for (let x = 0; x < W; x += 2) {
    if (x > 110 && x < 280 && rand() < 0.6) continue;
    const h = 4 + Math.floor(rand() * 10);
    const base = near(x) + 3 + Math.floor(rand() * 30);
    const sway = rand() < 0.5 ? 0 : 1;
    for (let y = 0; y < h; y += 1) {
      c.set(x + (y > h / 2 ? sway : 0), base - y, y > h - 3 ? P.reed[1] : P.reed[0]);
    }
  }

  // Bamboo, a chang ghar and tamul palms on the right.
  bamboo(c, 300, 192, P, rand);
  changGhar(c, 346, 200, P);
  arecaPalm(c, 334, 196, 44, P, rand);
  arecaPalm(c, 382, 198, 50, P, rand);
  arecaPalm(c, 394, 200, 36, P, rand);

  // The rhino and a couple of egrets, bottom left.
  c.sprite(26, 196, RHINO, { d: P.rhino[0], m: P.rhino[1], l: P.rhino[2], h: P.horn, e: P.ink });
  c.sprite(68, 206, EGRET, { w: P.white });
  c.sprite(14, 210, EGRET, { w: P.white }, true);
  c.sprite(226, 203, EGRET, { w: P.white });

  // Birds over the hills.
  for (const [bx, by] of [
    [180, 70],
    [190, 66],
    [198, 72],
  ])
    c.sprite(bx, by, BIRD, { k: P.birds });
  return c;
}

function teaGarden(P, seed) {
  const rand = rng(seed);
  const c = canvas();
  sky(c, P.sky, 120);
  fillBelow(c, ridge(100, 16, 1, 0.2), (x, y, d) =>
    d < 2 ? P.haze : noise(x, y, 3) < 0.12 ? P.far[1] : P.far[0],
  );
  fillBelow(c, ridge(124, 10, 1.6, 1.7), (x, y) => (noise(x, y, 4) < 0.1 ? P.mid[1] : P.mid[0]));

  // Rows of tea bushes that follow the slope, with paths between blocks.
  const near = ridge(140, 8, 0.8, 0.9);
  fillBelow(c, near, (x, y, d) => {
    const wob = Math.round(Math.sin(x * 0.05) * 2);
    const row = Math.floor((d + wob) / 4);
    const inRow = (d + wob) % 4;
    if (row % 6 === 5 && inRow === 3) return P.path;
    if (inRow === 3) return P.tea[0];
    if (inRow === 0) return (x + row) % 3 === 0 ? P.tea[4] : P.tea[3];
    return rand() < 0.2 ? P.tea[1] : P.tea[2];
  });

  // Shade trees (the tall, thin-crowned kind planted in gardens).
  const tree = (tx, base) => {
    const h = 18 + Math.floor(rand() * 12);
    for (let y = base - h; y < base; y += 1) c.set(tx, y, P.trunk);
    const r = 4 + Math.floor(rand() * 3);
    const cy = base - h;
    for (let dy = -r; dy <= 1; dy += 1) {
      for (let dx = -r - 4; dx <= r + 4; dx += 1) {
        if ((dx * dx) / ((r + 4) * (r + 4)) + (dy * dy) / (r * r) <= 1) {
          const shade = dy > -1 ? 0 : dx < -2 ? 2 : 1;
          c.set(tx + dx, cy + dy, P.crown[rand() < 0.1 ? Math.max(0, shade - 1) : shade]);
        }
      }
    }
  };
  for (let i = 0; i < 9; i += 1) {
    const tx = 8 + Math.floor(rand() * (W - 16));
    tree(tx, near(tx) + 8 + Math.floor(rand() * 40));
  }

  // Pluckers in the rows, at the edges where cards won't cover them.
  const pc = { y: P.japi, Y: P.japiDark, s: P.skin, r: P.gamosa, c: P.cloth, w: P.basket };
  for (const [x, y, flip] of [
    [22, 176, false],
    [44, 192, true],
    [350, 184, false],
    [372, 168, true],
  ])
    c.sprite(x, y, PLUCKER, pc, flip);
  return c;
}

function dusk(P, seed) {
  const rand = rng(seed);
  const c = canvas();
  sky(c, P.sky, 150);
  // The sun, low over the hills.
  const sx = 250;
  const sy = 112;
  for (let y = -14; y <= 14; y += 1)
    for (let x = -14; x <= 14; x += 1) {
      const d = x * x + y * y;
      if (d <= 196) c.set(sx + x, sy + y, d < 120 ? P.sun[0] : P.sun[1]);
    }
  fillBelow(c, ridge(116, 10, 1.1, 0.6), (x, y, d) => (d < 2 ? P.haze : P.far[0]), 150);
  fillBelow(c, ridge(132, 7, 1.7, 2.4), () => P.mid[0], 150);

  // Wide river with the sun's path on it.
  for (let y = 150; y < H; y += 1) {
    const depth = (y - 150) / (H - 150);
    for (let x = 0; x < W; x += 1) {
      const width = 8 + depth * 30;
      const onPath = Math.abs(x - sx) < width * (0.6 + noise(y, 0, 8) * 0.4);
      const col = onPath
        ? ripple(x, y, 9, P.river[1], P.sun[1], P.sun[0], 0.35)
        : ripple(x, y, 10, depth < 0.15 ? P.river[1] : P.river[0], P.river[2], P.river[1], 0.05);
      c.set(x, y, col);
    }
  }
  // Silhouettes: a boat, palms and reeds on the left bank.
  c.sprite(150, 176, BOAT, {
    k: P.ink,
    r: P.ink,
    c: P.ink,
    t: P.ink,
    b: P.ink,
    B: P.ink,
  });
  fillBelow(
    c,
    (x) => (x < 110 ? Math.round(176 + ((x - 40) * (x - 40)) / 160) : H),
    () => P.ink,
  );
  const shadow = { trunk: P.ink, trunkRing: P.ink, leaf: P.ink, leafDark: P.ink, nut: P.ink };
  arecaPalm(c, 30, 182, 52, shadow, rand);
  arecaPalm(c, 58, 184, 44, shadow, rand);
  arecaPalm(c, 84, 190, 36, shadow, rand);
  for (let x = 0; x < 120; x += 2) {
    const h = 3 + Math.floor(rand() * 7);
    for (let y = 0; y < h; y += 1) c.set(x + (y > h / 2 ? 1 : 0), 186 + (x * x) / 900 - y, P.ink);
  }
  for (const [bx, by] of [
    [196, 82],
    [206, 78],
    [214, 84],
    [300, 64],
    [309, 68],
  ])
    c.sprite(bx, by, BIRD, { k: P.ink });
  return c;
}

/** A see-through layer of clouds that wraps around left to right, so it can scroll forever. */
function clouds(P, seed) {
  const rand = rng(seed);
  const c = canvas();
  const set = (x, y, col) => c.set(((x % W) + W) % W, y, col);
  const puff = (cx, cy, w) => {
    const rows = [
      [0.38, 0.62],
      [0.22, 0.86],
      [0.06, 1],
      [0, 1],
    ];
    // a bump on top
    for (let x = Math.round(0.5 * w); x < Math.round(0.72 * w); x += 1)
      set(cx + x, cy - 2, P.cloud);
    for (let x = Math.round(0.44 * w); x < Math.round(0.8 * w); x += 1)
      set(cx + x, cy - 1, P.cloud);
    rows.forEach(([a, b], r) => {
      for (let x = Math.round(a * w); x < Math.round(b * w); x += 1) {
        set(cx + x, cy + r, r === rows.length - 1 ? P.cloudShade : P.cloud);
      }
    });
  };
  for (let i = 0; i < 8; i += 1) {
    puff(
      Math.floor((i / 8) * W + rand() * 30),
      10 + Math.floor(rand() * 50),
      22 + Math.floor(rand() * 36),
    );
  }
  return c;
}

// ── palettes ──────────────────────────────────────────────────────────

const COMMON = {
  ink: hex('#2b2a33'),
  white: hex('#fbfbf7'),
  birds: hex('#5b6475'),
  wall: hex('#efe5cf'),
  wallLight: hex('#fbf4e4'),
  wallShade: hex('#cbb38a'),
  door: hex('#5b3a2a'),
  dome: hex('#eadcbc'),
  domeRib: hex('#d8c59c'),
  domeShade: hex('#c4ab7e'),
  gold: hex('#e0aa2e'),
  pole: hex('#6b4a32'),
  flag: hex('#d23a32'),
  gamosa: hex('#c8323a'),
  cloth: hex('#f3ead2'),
  hull: hex('#6a4630'),
  hullDark: hex('#4b3122'),
  thatch: hex('#cfa85c'),
  thatchDark: hex('#a37c3a'),
  post: hex('#6d4c33'),
  bambooWall: hex('#d9be7c'),
  bambooWallDark: hex('#bf9f5e'),
  trunk: hex('#8a7a66'),
  trunkRing: hex('#6f6150'),
  leaf: hex('#4f9a3c'),
  leafDark: hex('#2f6e2b'),
  nut: hex('#e08a2c'),
  bamboo: hex('#7fae3f'),
  bambooNode: hex('#5d8a2b'),
  rhino: [hex('#55535b'), hex('#7c7a82'), hex('#9e9ca3')],
  horn: hex('#d9cfb8'),
  japi: hex('#e2bd6a'),
  japiDark: hex('#b48a3c'),
  skin: hex('#9a6a48'),
  basket: hex('#a77f45'),
  trunkTea: hex('#5b4030'),
};

const VALLEY = {
  ...COMMON,
  sky: ['#86bde9', '#9dcaee', '#b4d7f1', '#cbe3f3', '#dfedf4', '#ecf3f3'].map(hex),
  haze: hex('#d4e0ec'),
  far: [hex('#8fa7c7'), hex('#9fb4d0')],
  mid: [hex('#6f8fa8'), hex('#7d9bb2')],
  forest: [hex('#2f6a3a'), hex('#3c7d42'), hex('#58964d')],
  river: [hex('#6aa6c8'), hex('#a7d2e6'), hex('#8bbcd6'), hex('#4f8db3')],
  sand: hex('#dcc896'),
  grass: [hex('#6f9a3e'), hex('#7ea847'), hex('#5e8a35')],
  reed: [hex('#a9b85a'), hex('#d6cf86')],
};

const TEA = {
  ...COMMON,
  sky: ['#9fd0f0', '#b4dbf3', '#c8e5f5', '#dcedf6', '#eaf3f6'].map(hex),
  haze: hex('#e1ebf3'),
  far: [hex('#8fa9c6'), hex('#a3bad2')],
  mid: [hex('#5f8f7d'), hex('#6e9e88')],
  tea: [hex('#2f6b2f'), hex('#3f8236'), hex('#57983f'), hex('#6fae4a'), hex('#8cc25a')],
  path: hex('#c9a878'),
  trunk: hex('#5b4030'),
  crown: [hex('#1f4f2a'), hex('#2c6634'), hex('#3d7c3d')],
};

const DUSK = {
  ...COMMON,
  ink: hex('#3a2d3f'),
  sky: ['#e98d6b', '#f0a275', '#f5b780', '#f8c98f', '#fad9a6', '#fbe6bf'].map(hex),
  sun: [hex('#fff3cf'), hex('#ffd98a')],
  haze: hex('#e7b9a8'),
  far: [hex('#a07f9c')],
  mid: [hex('#7c6383')],
  river: [hex('#8a6f8e'), hex('#b48c97'), hex('#d4a4a0')],
};

const CLOUDS_DAY = { cloud: hex('#ffffff'), cloudShade: hex('#e3ecf3') };
const CLOUDS_DUSK = { cloud: hex('#fff1df'), cloudShade: hex('#f3c9a8') };

// ── a minimal PNG encoder (RGBA, 8 bits per channel) ─────────────────

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/** Encodes a canvas; opaque pictures are written as RGB, which is smaller. */
function png(c, alpha) {
  const bpp = alpha ? 4 : 3;
  const stride = 1 + c.w * bpp;
  const raw = Buffer.alloc(c.h * stride);
  for (let y = 0; y < c.h; y += 1) {
    for (let x = 0; x < c.w; x += 1) {
      const i = (y * c.w + x) * 4;
      raw.set(c.px.subarray(i, i + bpp), y * stride + 1 + x * bpp);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.w, 0);
  ihdr.writeUInt32BE(c.h, 4);
  ihdr[8] = 8;
  ihdr[9] = alpha ? 6 : 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const OUT = new URL('../screens/', import.meta.url);
const files = {
  'scene-valley.png': png(valley(VALLEY, 7), false),
  'scene-tea.png': png(teaGarden(TEA, 11), false),
  'scene-dusk.png': png(dusk(DUSK, 21), false),
  'clouds-day.png': png(clouds(CLOUDS_DAY, 5), true),
  'clouds-dusk.png': png(clouds(CLOUDS_DUSK, 9), true),
};
for (const [name, data] of Object.entries(files)) writeFileSync(new URL(name, OUT), data);
console.log(`Wrote ${Object.keys(files).join(', ')} to website/screens`);
