// One-off asset pipeline: turns the flattened reference sheets in assets/
// into game-ready files in public/assets/. Re-run with `npm run assets`.
//
// Outputs
//   public/assets/character/tobby.png   horizontal strip of equal-size frames (transparent)
//   public/assets/character/tobby.json  frame size, anchor and animation table
//   public/assets/ui/avatar.png         welcome-card portrait cropped from the pop-card reference
//
// When clean, transparent Tobby sprites are supplied, replace tobby.png/json
// directly (keeping the JSON shape) and stop using this script for Tobby.

import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const SHEET = 'assets/character.png';
const OUT_CHAR = 'public/assets/character';
const OUT_UI = 'public/assets/ui';

// Source rectangles [x, y, w, h] in assets/character.png (1536x1024).
const FRAMES = {
  idle0: [38, 410, 64, 69], idle1: [120, 410, 65, 68], idle2: [203, 409, 65, 69], idle3: [286, 409, 65, 69],
  walk0: [384, 412, 73, 68], walk1: [466, 412, 73, 68], walk2: [548, 412, 73, 68], walk3: [630, 412, 74, 69],
  back0: [327, 744, 58, 75], back1: [393, 744, 57, 75], back2: [459, 744, 57, 75], back3: [524, 744, 58, 75],
  sit0: [745, 554, 62, 75], sit1: [827, 555, 62, 74], sit2: [911, 555, 71, 75],
  sleep0: [37, 763, 72, 46], sleep1: [116, 762, 76, 47], sleep2: [201, 762, 81, 47],
  wave0: [1290, 744, 64, 73], wave1: [1363, 743, 61, 74], wave2: [1431, 739, 71, 78],
};

// Animation names are `${state}-${direction}`; `flip` mirrors horizontally.
const ANIMATIONS = {
  'idle-down': { frames: ['idle0', 'idle1', 'idle2', 'idle3'], fps: 3 },
  'walk-down': { frames: ['idle0', 'idle1', 'idle2', 'idle3'], fps: 8, bob: true },
  'idle-up': { frames: ['back0'], fps: 1 },
  'walk-up': { frames: ['back0', 'back1', 'back2', 'back3'], fps: 8 },
  'idle-right': { frames: ['walk1'], fps: 1 },
  'walk-right': { frames: ['walk0', 'walk1', 'walk2', 'walk3'], fps: 9 },
  'idle-left': { frames: ['walk1'], fps: 1, flip: true },
  'walk-left': { frames: ['walk0', 'walk1', 'walk2', 'walk3'], fps: 9, flip: true },
  // reactions (direction-less)
  sit: { frames: ['sit0', 'sit1', 'sit2', 'sit1'], fps: 2 },
  sleep: { frames: ['sleep0', 'sleep2'], fps: 0.8 },
  wave: { frames: ['wave0', 'wave1', 'wave2', 'wave1'], fps: 7 },
};

const CELL_W = 84;
const CELL_H = 84;
const FOOT_PAD = 2; // transparent rows under the feet

const PAD = 6; // grab a little background around each rectangle for flood-filling
const BG_TOLERANCE = 42;

async function cutFrame(img, [x, y, w, h]) {
  const { data, info } = await img
    .clone()
    .extract({ left: x - PAD, top: y - PAD, width: w + PAD * 2, height: h + PAD * 2 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const at = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
  const bg = at(0);
  const isBg = (i) => {
    const [r, g, b] = at(i);
    return Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2]) < BG_TOLERANCE;
  };

  // 1. flood-fill background from the border
  const bgMask = new Uint8Array(W * H);
  const stack = [];
  for (let px = 0; px < W; px++) stack.push(px, (H - 1) * W + px);
  for (let py = 0; py < H; py++) stack.push(py * W, py * W + W - 1);
  while (stack.length) {
    const i = stack.pop();
    if (bgMask[i] || !isBg(i)) continue;
    bgMask[i] = 1;
    const px = i % W, py = (i / W) | 0;
    if (px > 0) stack.push(i - 1);
    if (px < W - 1) stack.push(i + 1);
    if (py > 0) stack.push(i - W);
    if (py < H - 1) stack.push(i + W);
  }

  // 2. keep only the largest foreground component (drops sparkles / stray marks)
  const label = new Int32Array(W * H);
  let best = 0, bestSize = 0, n = 0;
  for (let s = 0; s < W * H; s++) {
    if (bgMask[s] || label[s]) continue;
    n++;
    let size = 0;
    const q = [s];
    label[s] = n;
    while (q.length) {
      const i = q.pop();
      size++;
      const px = i % W, py = (i / W) | 0;
      for (const j of [px > 0 ? i - 1 : -1, px < W - 1 ? i + 1 : -1, py > 0 ? i - W : -1, py < H - 1 ? i + W : -1]) {
        if (j >= 0 && !bgMask[j] && !label[j]) { label[j] = n; q.push(j); }
      }
    }
    if (size > bestSize) { bestSize = size; best = n; }
  }

  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let i = 0; i < W * H; i++) {
    if (label[i] === best) {
      const px = i % W, py = (i / W) | 0;
      if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
    } else {
      data[i * 4 + 3] = 0;
    }
  }
  const trimmed = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .png()
    .toBuffer();
  return { buf: trimmed, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

async function buildTobby() {
  const img = sharp(SHEET);
  const names = Object.keys(FRAMES);
  const composites = [];
  for (const [index, name] of names.entries()) {
    const f = await cutFrame(img, FRAMES[name]);
    if (f.w > CELL_W || f.h > CELL_H - FOOT_PAD) throw new Error(`${name} (${f.w}x${f.h}) exceeds cell`);
    composites.push({
      input: f.buf,
      left: index * CELL_W + Math.round((CELL_W - f.w) / 2),
      top: CELL_H - FOOT_PAD - f.h,
    });
  }
  await mkdir(OUT_CHAR, { recursive: true });
  await sharp({ create: { width: CELL_W * names.length, height: CELL_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(`${OUT_CHAR}/tobby.png`);

  const animations = Object.fromEntries(
    Object.entries(ANIMATIONS).map(([k, a]) => [k, { ...a, frames: a.frames.map((f) => names.indexOf(f)) }]),
  );
  const atlas = {
    image: 'tobby.png',
    frameWidth: CELL_W,
    frameHeight: CELL_H,
    anchor: { x: CELL_W / 2, y: CELL_H - FOOT_PAD - 4 },
    animations,
  };
  await writeFile(`${OUT_CHAR}/tobby.json`, JSON.stringify(atlas, null, 2) + '\n');
  console.log(`tobby: ${names.length} frames -> ${OUT_CHAR}/tobby.png`);
}

async function buildAvatar() {
  await mkdir(OUT_UI, { recursive: true });
  await sharp('assets/pop card.png')
    .extract({ left: 208, top: 219, width: 208, height: 198 })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT_UI}/avatar.png`);
  console.log(`avatar -> ${OUT_UI}/avatar.png`);
}

await buildTobby();
await buildAvatar();
