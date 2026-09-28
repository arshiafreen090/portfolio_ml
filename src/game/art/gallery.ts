// Design Archive + Navigation Hub objects:
//   - framed artworks on the wall, and one on a freestanding display wall
//   - the central gallery computer (cycles through all five works)
//   - the hub telescope (slowly sweeping, steadies when Tobby is close)
//
// Artwork images come from src/data/designs.ts: the real image once supplied,
// otherwise its placeholder illustration.

import type { Interactable } from '../world/shipMap';
import { disc, dot, ellipse, frame, glow, rect, type Ctx } from './pixel';
import { P, THEMES } from './theme';

/** Cover-fit an image into a rect (crop, don't stretch). */
function cover(ctx: Ctx, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const s = Math.max(w / iw, h / ih);
  const sw = w / s, sh = h / s;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
  ctx.restore();
}

const FRAME_STYLES = [
  { outer: P.navyDeep, band: P.woodDeep, inner: P.woodLight },
  { outer: P.navyDeep, band: P.navy, inner: P.violet },
  { outer: P.navyDeep, band: P.paper, inner: P.lavender },
  { outer: P.navyDeep, band: P.peachDeep, inner: P.peach },
  { outer: P.navyDeep, band: P.lavenderDeep, inner: P.lavenderSoft },
];

function framedArt(
  ctx: Ctx, x: number, y: number, w: number, h: number, number: number, img: HTMLImageElement | null, on: number,
) {
  const s = FRAME_STYLES[(number - 1) % FRAME_STYLES.length];
  // soft drop shadow on the wall
  rect(ctx, x + 3, y + 3, w, h, 'rgba(31,37,80,0.18)');
  frame(ctx, x, y, w, h, s.band, s.outer, 1, 1);
  rect(ctx, x + 1, y + 1, w - 2, 1, s.inner);
  // mat + picture
  rect(ctx, x + 4, y + 4, w - 8, h - 8, P.paper);
  const ix = x + 6, iy = y + 6, iw = w - 12, ih = h - 12;
  rect(ctx, ix, iy, iw, ih, P.lavenderSoft);
  if (img) cover(ctx, img, ix, iy, iw, ih);
  // number tag on the bottom-right corner
  frame(ctx, x + w - 12, y + h - 9, 12, 11, P.navy, P.navyDeep, 0, 1);
  const n = String(number);
  rect(ctx, x + w - 7, y + h - 6, 2, 5, P.cream);
  if (n !== '1') { rect(ctx, x + w - 8, y + h - 6, 4, 1, P.cream); rect(ctx, x + w - 8, y + h - 2, 4, 1, P.cream); }
  if (on > 0.05) {
    ctx.save();
    ctx.globalAlpha = on;
    rect(ctx, x - 2, y - 2, w + 4, 2, P.peach); rect(ctx, x - 2, y + h, w + 4, 2, P.peach);
    rect(ctx, x - 2, y, 2, h, P.peach); rect(ctx, x + w, y, 2, h, P.peach);
    ctx.restore();
  }
}

export function drawArtwork(ctx: Ctx, it: Interactable, number: number, img: HTMLImageElement | null, on: number) {
  const { w, h } = it.size;
  if (!it.solid) {
    framedArt(ctx, Math.round(it.base.x - w / 2), Math.round(it.base.y - h), w, h, number, img, on);
    return;
  }
  // freestanding display wall with the work hung on its face
  const x = Math.round(it.base.x - w / 2), y = Math.round(it.base.y - h);
  const t = THEMES.gallery;
  ellipse(ctx, it.base.x, it.base.y - 1, w / 2 + 6, 6, 'rgba(31,37,80,0.18)');
  frame(ctx, x, y, w, h - 4, t.wall, P.navyDeep, 2, 2);
  rect(ctx, x + 2, y + 2, w - 4, 4, t.wallTrim);
  rect(ctx, x + 2, y + 6, w - 4, 1, P.navyDeep);
  rect(ctx, x + 2, y + h - 18, w - 4, 12, t.wallShade);
  rect(ctx, x + 2, y + h - 18, w - 4, 1, P.navyDeep);
  rect(ctx, x + w - 8, y + 8, 5, h - 26, t.wallShade);
  rect(ctx, x + 10, y + h - 4, 12, 4, P.navyDeep); rect(ctx, x + w - 22, y + h - 4, 12, 4, P.navyDeep);
  glow(ctx, it.base.x, y + 44, w * 0.5, 40, P.warm, 0.22 + on * 0.2);
  const fw = w - 40, fh = Math.round(fw * 0.75);
  framedArt(ctx, x + 18, y + 14, fw, fh, number, img, on);
}

// ------------------------------------------------------------------ gallery computer

export function drawGalleryComputer(ctx: Ctx, it: Interactable, images: (HTMLImageElement | null)[], on: number, t: number) {
  const { w, h } = it.size;
  const x = Math.round(it.base.x - w / 2), y = Math.round(it.base.y - h);
  ellipse(ctx, it.base.x, it.base.y - 1, w / 2 + 4, 6, 'rgba(31,37,80,0.18)');
  glow(ctx, it.base.x, it.base.y + 6, w * 0.7, 16, P.peach, 0.1 + on * 0.25);
  // desk / pedestal
  frame(ctx, x + 12, y + 66, w - 24, h - 70, P.hull, P.navyDeep, 3, 2);
  rect(ctx, x + 15, y + 70, 2, h - 80, P.hullLight);
  rect(ctx, x + w - 22, y + 70, 6, h - 80, P.hullShade);
  frame(ctx, x + 22, y + 72, w - 44, 8, P.lavenderSoft, P.navyDeep, 0, 1);
  for (let i = 0; i < 9; i++) rect(ctx, x + 25 + i * 8, y + 74, 5, 3, P.lavender);
  rect(ctx, x + 8, y + h - 5, w - 16, 5, P.navyDeep); rect(ctx, x + 10, y + h - 4, w - 20, 2, P.peach);
  // big display
  frame(ctx, x, y, w, 64, P.navy, P.navyDeep, 3, 2);
  rect(ctx, x + 3, y + 2, w - 6, 2, P.peach);
  rect(ctx, it.base.x - 4, y + 64, 8, 4, P.navyDeep);
  const sx = x + 5, sy = y + 6, sw = w - 10, sh = 54;
  rect(ctx, sx, sy, sw, sh, P.screen);
  const idx = Math.floor(t / 2.6) % Math.max(1, images.length);
  const img = images[idx];
  const pw = Math.round(sw * 0.58);
  ctx.save();
  ctx.globalAlpha = 0.45 + on * 0.55;
  if (img) cover(ctx, img, sx + 3, sy + 3, pw, sh - 6);
  else rect(ctx, sx + 3, sy + 3, pw, sh - 6, P.screenLine);
  // number buttons [1]..[5]
  for (let i = 0; i < images.length; i++) {
    const bx = sx + pw + 8 + (i % 3) * 13, by = sy + 6 + Math.floor(i / 3) * 13;
    rect(ctx, bx, by, 10, 10, i === idx ? P.peach : P.screenLine);
    rect(ctx, bx + 4, by + 2, 2, 6, i === idx ? P.navy : P.lavenderDeep);
  }
  rect(ctx, sx + pw + 8, sy + 36, sw - pw - 14, 3, P.lavender);
  rect(ctx, sx + pw + 8, sy + 42, sw - pw - 22, 3, P.lavenderDeep);
  ctx.restore();
}

// ------------------------------------------------------------------ telescope

export function drawTelescope(ctx: Ctx, it: Interactable, on: number, t: number) {
  const cx = it.base.x, by = it.base.y;
  ellipse(ctx, cx, by - 1, 22, 5, 'rgba(31,37,80,0.18)');
  // tripod
  for (const dx of [-16, 0, 16]) {
    const steps = 30;
    for (let i = 0; i < steps; i++) {
      const k = i / steps;
      rect(ctx, cx + dx * k - 1, by - 32 + i, 3, 1, i % 6 === 0 ? P.navyDeep : P.navy);
    }
  }
  disc(ctx, cx, by - 34, 5, P.navyDeep);
  disc(ctx, cx, by - 34, 3, P.lavender);
  // tube sweeps slowly; points higher and steadier when Tobby is close
  const a = -0.55 - on * 0.35 + Math.sin(t * 0.35) * 0.18 * (1 - on * 0.7);
  const len = 46;
  const dx = Math.cos(a), dy = Math.sin(a);
  const ox = cx - dx * 14, oy = by - 36 - dy * 14;
  const thick = (w: number, color: string, from: number, to: number) => {
    for (let i = from; i < to; i++) {
      const px = ox + dx * i, py = oy + dy * i;
      rect(ctx, px - w / 2, py - w / 2, w, w, color);
    }
  };
  thick(12, P.navyDeep, 0, len);
  thick(9, P.lavender, 1, len - 1);
  thick(4, P.lavenderSoft, 3, len - 6);
  thick(10, P.peach, 30, 34);
  thick(14, P.navyDeep, len - 4, len + 2);
  thick(11, P.hullLight, len - 3, len + 1);
  // lens glint + eyepiece
  const lx = ox + dx * (len + 1), ly = oy + dy * (len + 1);
  dot(ctx, lx - 1, ly - 1, Math.floor(t * 2) % 5 === 0 ? P.paper : P.cyanSoft, 2);
  rect(ctx, ox - 3, oy - 3, 6, 6, P.navyDeep);
  if (Math.floor(t * 1.5) % 3 === 0) rect(ctx, cx - 1, by - 42, 2, 2, on > 0.2 ? P.cyan : P.pink);
}
