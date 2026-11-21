// Draws the pixel-art scenes used on the home page: an Assam tea garden under blue hills.
// Run with `node website/scripts/pixel-scene.mjs`. Writes small PNGs to website/screens; the page
// scales them up with `image-rendering: pixelated`, so they stay crisp and tiny.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const W = 320;
const H = 180;

/** Small seeded random generator, so the scene is the same on every run. */
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

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const PALETTES = {
  day: {
    sky: ['#9fd0f0', '#b4dbf3', '#c8e5f5', '#dcedf6', '#eaf3f6'],
    cloud: '#ffffff',
    cloudShade: '#dfe9f0',
    far: ['#8fa9c6', '#a3bad2'],
    snow: '#e9f0f6',
    mid: ['#5f8f7d', '#6e9e88'],
    tea: ['#2f6b2f', '#3f8236', '#57983f', '#6fae4a'],
    path: '#c9a878',
    trunk: '#5b4030',
    crown: ['#1f4f2a', '#2c6634', '#3d7c3d'],
  },
  dusk: {
    sky: ['#f3b27a', '#f6c08c', '#f8cfa0', '#f9ddb6', '#fae8cc'],
    cloud: '#fff3e2',
    cloudShade: '#f1cfaa',
    far: ['#9c88a8', '#b39dba'],
    snow: '#f3e3e6',
    mid: ['#6f7f86', '#7f8f92'],
    tea: ['#34552f', '#456a37', '#5a8040', '#6e9447'],
    path: '#d0a77c',
    trunk: '#4a3328',
    crown: ['#253d27', '#31502f', '#40623a'],
  },
};

function draw(name, seed) {
  const P = Object.fromEntries(
    Object.entries(PALETTES[name]).map(([k, v]) => [k, Array.isArray(v) ? v.map(hex) : hex(v)]),
  );
  const rand = rng(seed);
  const px = new Uint8Array(W * H * 3);
  const set = (x, y, c) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    px[i] = c[0];
    px[i + 1] = c[1];
    px[i + 2] = c[2];
  };

  // Sky: bands with a dithered edge between them.
  for (let y = 0; y < H; y += 1) {
    const f = (y / (H * 0.62)) * (P.sky.length - 1);
    for (let x = 0; x < W; x += 1) {
      const band = Math.min(P.sky.length - 1, Math.floor(f + ((x + y) % 2 === 0 ? 0.25 : -0.25)));
      set(x, y, P.sky[Math.max(0, band)]);
    }
  }

  // Clouds: stacked rounded rows of pixels.
  const cloud = (cx, cy, w) => {
    const rows = [
      [0.35, 0.65],
      [0.2, 0.85],
      [0.05, 1],
      [0, 1],
    ];
    rows.forEach(([a, b], r) => {
      for (let x = Math.round(cx + a * w); x < Math.round(cx + b * w); x += 1) {
        set(x, cy + r, r === rows.length - 1 ? P.cloudShade : P.cloud);
      }
    });
    // a second puff on top
    for (let x = Math.round(cx + 0.45 * w); x < Math.round(cx + 0.7 * w); x += 1)
      set(x, cy - 1, P.cloud);
  };
  for (let i = 0; i < 9; i += 1) {
    cloud(Math.floor(rand() * W) - 20, 8 + Math.floor(rand() * 46), 18 + Math.floor(rand() * 34));
  }

  // A ridge line from a few sine waves.
  const ridge = (base, amp, k) => (x) =>
    Math.round(
      base +
        amp * Math.sin(x * 0.021 * k + 1.3) +
        amp * 0.5 * Math.sin(x * 0.057 * k + 0.4) +
        amp * 0.25 * Math.sin(x * 0.13 * k),
    );

  // Far blue hills with pale tops.
  const far = ridge(88, 16, 1);
  for (let x = 0; x < W; x += 1) {
    const top = far(x);
    for (let y = top; y < H; y += 1) {
      const c = y - top < 3 ? P.snow : (x + y) % 7 === 0 ? P.far[1] : P.far[0];
      set(x, y, c);
    }
  }

  // Middle hills.
  const mid = ridge(112, 10, 1.6);
  for (let x = 0; x < W; x += 1) {
    const top = mid(x);
    for (let y = top; y < H; y += 1) set(x, y, (x * 3 + y) % 11 === 0 ? P.mid[1] : P.mid[0]);
  }

  // Tea garden: rows of bushes that follow the slope.
  const near = ridge(128, 7, 0.8);
  for (let x = 0; x < W; x += 1) {
    const top = near(x);
    for (let y = top; y < H; y += 1) {
      const depth = y - top;
      const row = Math.floor((depth + Math.round(Math.sin(x * 0.05) * 2)) / 4);
      const inRow = (depth + Math.round(Math.sin(x * 0.05) * 2)) % 4;
      let c;
      if (inRow === 3) c = P.tea[0];
      else if (inRow === 0) c = P.tea[3];
      else c = rand() < 0.22 ? P.tea[1] : P.tea[2];
      if (row % 5 === 4 && inRow === 3) c = P.path;
      set(x, y, c);
    }
  }

  // Shade trees standing in the garden.
  const tree = (tx, base) => {
    const h = 14 + Math.floor(rand() * 10);
    for (let y = base - h; y < base; y += 1) set(tx, y, P.trunk);
    const r = 5 + Math.floor(rand() * 3);
    const cy = base - h;
    for (let dy = -r; dy <= Math.floor(r / 2); dy += 1) {
      for (let dx = -r - 2; dx <= r + 2; dx += 1) {
        if ((dx * dx) / ((r + 2) * (r + 2)) + (dy * dy) / (r * r) <= 1) {
          const shade = dy > 0 ? 0 : dx < -1 ? 2 : 1;
          set(tx + dx, cy + dy, P.crown[rand() < 0.12 ? Math.max(0, shade - 1) : shade]);
        }
      }
    }
  };
  for (let i = 0; i < 7; i += 1) {
    const tx = 10 + Math.floor(rand() * (W - 20));
    tree(tx, near(tx) + 10 + Math.floor(rand() * 26));
  }

  return png(px);
}

// ── a minimal PNG encoder (RGB, 8 bits per channel) ──────────────────────

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

function png(px) {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y += 1) {
    raw[y * (1 + W * 3)] = 0;
    Buffer.from(px.buffer, y * W * 3, W * 3).copy(raw, y * (1 + W * 3) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const OUT = new URL('../screens/', import.meta.url);
writeFileSync(new URL('scene-day.png', OUT), draw('day', 7));
writeFileSync(new URL('scene-dusk.png', OUT), draw('dusk', 21));
console.log('Wrote website/screens/scene-day.png and scene-dusk.png');
