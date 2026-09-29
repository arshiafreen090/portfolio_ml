// Procedural furniture sprites. Each kind is painted once into a cached canvas
// (anchored bottom-centre); small per-frame touches are layered on top:
// plants sway, shelves pull a book forward, the lamp brightens, rack LEDs blink,
// the bean bag squishes — mostly when Tobby is near.

import { PROP_SIZE, type Prop, type PropKind } from '../world/decor';
import { box, disc, dot, ellipse, frame, glow, makeCanvas, rect, rng, type Ctx } from './pixel';
import { P } from './theme';

interface Sprite { img: HTMLCanvasElement; ax: number; ay: number }

const PAD = 4;
const cache = new Map<string, Sprite>();

function paint(kind: string, w: number, h: number, draw: (ctx: Ctx, w: number, h: number) => void): Sprite {
  let s = cache.get(kind);
  if (s) return s;
  const [img, ctx] = makeCanvas(w + PAD * 2, h + PAD);
  ctx.translate(PAD, 0);
  draw(ctx, w, h);
  s = { img, ax: PAD + w / 2, ay: h };
  cache.set(kind, s);
  return s;
}

function blit(ctx: Ctx, s: Sprite, x: number, y: number, flip = false, squashY = 0) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(s.img, -s.ax, -s.ay + squashY, s.img.width, s.img.height - squashY);
  ctx.restore();
}

function shadow(ctx: Ctx, x: number, y: number, w: number) {
  ellipse(ctx, x, y - 1, w / 2 + 3, 4, 'rgba(31,37,80,0.16)');
}

// ------------------------------------------------------------------ plant parts

function leaves(ctx: Ctx, cx: number, top: number, spread: number, height: number, seed: number) {
  const r = rng(seed);
  for (let i = 0; i < 9; i++) {
    const lx = cx + (r() - 0.5) * spread, ly = top + r() * height;
    const lw = 5 + r() * 5, lh = 3 + r() * 3;
    ellipse(ctx, lx, ly + 1, lw, lh, P.leafDeep);
    ellipse(ctx, lx, ly, lw - 1, lh - 1, i % 3 === 0 ? P.leafLight : P.leaf);
    dot(ctx, lx - lw / 3, ly - 1, P.leafLight);
  }
}

function pot(ctx: Ctx, cx: number, bottom: number, w: number, h: number) {
  for (let i = 0; i < h; i++) {
    const ww = Math.round(w - (i / h) * 4);
    rect(ctx, cx - ww / 2, bottom - h + i, ww, 1, i < 3 ? P.potDeep : P.pot);
  }
  rect(ctx, cx - w / 2 - 1, bottom - h, w + 2, 3, P.potDeep);
  rect(ctx, cx - w / 2, bottom - h, w, 1, P.peachSoft);
  rect(ctx, cx - w / 2 + 2, bottom - h + 5, 2, h - 7, '#ecb094');
}

const plantParts = {
  plant: () => ({
    base: paint('plant-pot', 26, 34, (ctx, w, h) => pot(ctx, w / 2, h, 14, 11)),
    top: paint('plant-leaves', 26, 34, (ctx, w) => leaves(ctx, w / 2, 6, 18, 14, 3)),
  }),
  plantTall: () => ({
    base: paint('plantTall-pot', 34, 62, (ctx, w, h) => {
      pot(ctx, w / 2, h, 18, 15);
      rect(ctx, w / 2 - 1, h - 36, 2, 22, P.leafDeep);
    }),
    top: paint('plantTall-leaves', 34, 62, (ctx, w) => {
      leaves(ctx, w / 2, 4, 28, 30, 11);
      leaves(ctx, w / 2 + 2, 18, 20, 16, 12);
    }),
  }),
  planter: () => ({
    base: paint('planter-box', 56, 40, (ctx, w, h) => {
      frame(ctx, 0, h - 18, w, 18, P.hull, P.navyDeep, 2, 1);
      rect(ctx, 1, h - 17, w - 2, 3, P.lavender);
      rect(ctx, 2, h - 4, w - 4, 2, P.hullShade);
    }),
    top: paint('planter-leaves', 56, 40, (ctx, w) => {
      leaves(ctx, w / 2, 6, 46, 14, 21);
      disc(ctx, 14, 12, 2, P.pink); disc(ctx, 40, 9, 2, P.peach); disc(ctx, 30, 15, 2, P.pinkSoft);
    }),
  }),
};

// ------------------------------------------------------------------ static sprites

function books(ctx: Ctx, x: number, y: number, w: number, seed: number) {
  const r = rng(seed);
  const cols = [P.pink, P.blue, P.peach, P.mint, P.lavenderDeep, P.cyanDeep, P.pinkSoft];
  let bx = x;
  while (bx < x + w - 3) {
    const bw = 3 + Math.floor(r() * 3), bh = 11 + Math.floor(r() * 6);
    const col = cols[Math.floor(r() * cols.length)];
    if (r() < 0.12) { rect(ctx, bx, y - 5, 12, 5, P.navyDeep); rect(ctx, bx + 1, y - 4, 10, 3, col); bx += 13; continue; }
    rect(ctx, bx, y - bh, bw, bh, P.navyDeep);
    rect(ctx, bx + 1, y - bh + 1, bw - 1, bh - 1, col);
    rect(ctx, bx + 1, y - bh + 3, bw - 1, 1, P.paper);
    bx += bw + (r() < 0.15 ? 3 : 0);
  }
}

const statics: Partial<Record<PropKind, () => Sprite>> = {
  bookshelf: () => paint('bookshelf', 60, 108, (ctx, w, h) => {
    frame(ctx, 0, 6, w, h - 6, P.woodDeep, P.navyDeep, 1, 1);
    rect(ctx, 3, 9, w - 6, h - 14, '#8f6545');
    for (let i = 0; i < 4; i++) {
      const sy = 30 + i * 24;
      books(ctx, 4, sy - 1, w - 8, 7 + i);
      rect(ctx, 3, sy, w - 6, 3, P.wood);
      rect(ctx, 3, sy, w - 6, 1, P.woodLight);
    }
    rect(ctx, 0, 6, w, 3, P.woodLight);
    // plant on top
    pot(ctx, 14, 7, 10, 7);
    leaves(ctx, 14, -2, 12, 5, 31);
    rect(ctx, 36, 0, 16, 6, P.navyDeep); rect(ctx, 37, 1, 14, 4, P.lavender);
  }),
  couch: () => paint('couch', 150, 58, (ctx, w, h) => {
    box(ctx, 0, 6, w, 36, P.navyDeep, 6);
    box(ctx, 1, 7, w - 2, 34, P.pinkSoft, 5);
    rect(ctx, 8, 10, w - 16, 3, '#fbdde5');
    box(ctx, 0, 26, 20, h - 30, P.navyDeep, 4); box(ctx, 1, 27, 18, h - 33, P.pinkSoft, 3);
    box(ctx, w - 20, 26, 20, h - 30, P.navyDeep, 4); box(ctx, w - 19, 27, 18, h - 33, P.pinkSoft, 3);
    box(ctx, 18, 30, w - 36, 20, P.navyDeep, 3); box(ctx, 19, 31, w - 38, 18, '#f2b3c3', 2);
    rect(ctx, w / 2, 31, 1, 18, P.pink);
    rect(ctx, 20, 31, w - 40, 2, '#fbd1dc');
    // pillows
    frame(ctx, 26, 16, 22, 18, P.lavender, P.navyDeep, 3, 1);
    frame(ctx, w - 50, 16, 22, 18, P.peachSoft, P.navyDeep, 3, 1);
    dot(ctx, 36, 24, P.lavenderDeep, 2); dot(ctx, w - 40, 24, P.peach, 2);
    rect(ctx, 10, h - 4, 4, 4, P.woodDeep); rect(ctx, w - 14, h - 4, 4, 4, P.woodDeep);
  }),
  sideTable: () => paint('sideTable', 30, 34, (ctx, w, h) => {
    ellipse(ctx, w / 2, 14, 15, 5, P.navyDeep);
    ellipse(ctx, w / 2, 13, 14, 4, P.woodLight);
    rect(ctx, w / 2 - 2, 17, 4, h - 19, P.woodDeep);
    rect(ctx, w / 2 - 7, h - 3, 14, 3, P.woodDeep);
    rect(ctx, 6, 4, 8, 8, P.navyDeep); rect(ctx, 7, 5, 6, 6, P.paper); rect(ctx, 13, 6, 3, 3, P.navyDeep);
    rect(ctx, 16, 8, 10, 3, P.navyDeep); rect(ctx, 17, 8, 8, 2, P.blue);
  }),
  artDesk: () => paint('artDesk', 100, 58, (ctx, w, h) => {
    rect(ctx, 0, 22, w, 7, P.navyDeep);
    rect(ctx, 1, 23, w - 2, 5, P.wood);
    rect(ctx, 1, 23, w - 2, 1, P.woodLight);
    frame(ctx, 4, 29, 30, h - 29, P.woodDeep, P.navyDeep, 0, 1);
    rect(ctx, 8, 36, 22, 1, P.navyDeep); rect(ctx, 8, 46, 22, 1, P.navyDeep);
    dot(ctx, 18, 40, P.warm, 2); dot(ctx, 18, 50, P.warm, 2);
    rect(ctx, w - 8, 29, 4, h - 29, P.navyDeep);
    // small display screen
    frame(ctx, 58, 0, 34, 22, P.screen, P.navyDeep, 1, 2);
    rect(ctx, 73, 22, 4, 2, P.navyDeep);
    // sketch paper + pencil cup
    rect(ctx, 10, 17, 26, 6, P.navyDeep); rect(ctx, 11, 17, 24, 5, P.paper);
    rect(ctx, 14, 19, 12, 1, P.lavender); rect(ctx, 16, 20, 8, 1, P.pinkSoft);
    rect(ctx, 42, 12, 8, 11, P.navyDeep); rect(ctx, 43, 13, 6, 9, P.cyanSoft);
    rect(ctx, 44, 6, 1, 7, P.pink); rect(ctx, 46, 8, 1, 5, P.blue); rect(ctx, 47, 5, 1, 8, P.peach);
  }),
  seat: () => paint('seat', 34, 44, (ctx, w, h) => {
    rect(ctx, w / 2 - 2, h - 12, 4, 10, P.navy);
    rect(ctx, w / 2 - 10, h - 3, 20, 3, P.navyDeep);
    box(ctx, 4, h - 22, w - 8, 12, P.navyDeep, 3);
    box(ctx, 5, h - 21, w - 10, 10, P.lavender, 2);
    box(ctx, w - 12, 2, 10, h - 20, P.navyDeep, 3);
    box(ctx, w - 11, 3, 8, h - 22, P.lavender, 2);
    rect(ctx, w - 10, 5, 2, h - 28, P.lavenderSoft);
    rect(ctx, 6, h - 21, w - 12, 2, P.lavenderSoft);
  }),
  crates: () => paint('crates', 44, 42, (ctx, w, h) => {
    const crate = (x: number, y: number, s: number, label: string) => {
      frame(ctx, x, y, s, s, P.hull, P.navyDeep, 1, 1);
      rect(ctx, x + 1, y + s - 4, s - 2, 3, P.hullShade);
      rect(ctx, x + 3, y + 1, 2, s - 2, P.lavender); rect(ctx, x + s - 5, y + 1, 2, s - 2, P.lavender);
      rect(ctx, x + s / 2 - 4, y + s / 2 - 3, 8, 5, label);
    };
    crate(2, h - 22, 22, P.peach);
    crate(22, h - 20, 20, P.cyan);
    crate(10, h - 40, 18, P.pink);
    void w;
  }),
  serverRack: () => paint('serverRack', 44, 104, (ctx, w, h) => {
    frame(ctx, 0, 0, w, h, P.navy, P.navyDeep, 2, 1);
    for (let i = 0; i < 7; i++) {
      const y = 6 + i * 13;
      rect(ctx, 4, y, w - 8, 10, P.navyInk);
      rect(ctx, 4, y, w - 8, 1, P.violet);
      for (let v = 0; v < 4; v++) rect(ctx, 20 + v * 4, y + 3, 2, 5, P.navy);
    }
    rect(ctx, 2, h - 8, w - 4, 6, P.navyDeep);
  }),
  cone: () => paint('cone', 14, 18, (ctx, w, h) => {
    rect(ctx, 0, h - 3, w, 3, P.navyDeep);
    for (let i = 0; i < h - 3; i++) {
      const ww = Math.max(2, Math.round((i / (h - 3)) * (w - 4)) + 2);
      rect(ctx, w / 2 - ww / 2, i, ww, 1, i > 5 && i < 9 ? P.paper : P.peach);
    }
  }),
  plinth: () => paint('plinth', 30, 58, (ctx, w, h) => {
    frame(ctx, 2, 26, w - 4, h - 26, P.hull, P.navyDeep, 1, 1);
    rect(ctx, 3, 27, w - 6, 2, P.hullLight);
    rect(ctx, w - 8, 29, 4, h - 31, P.hullShade);
    // a small abstract sculpture
    ellipse(ctx, w / 2, 16, 8, 9, P.navyDeep);
    ellipse(ctx, w / 2, 16, 7, 8, P.lavender);
    ellipse(ctx, w / 2 - 2, 13, 3, 3, P.lavenderSoft);
    rect(ctx, w / 2 - 5, 23, 10, 3, P.navyDeep);
    disc(ctx, w / 2 + 5, 6, 3, P.pink);
  }),
  beanBag: () => paint('beanBag', 46, 30, (ctx, w, h) => {
    ellipse(ctx, w / 2, h - 11, w / 2, 11, P.navyDeep);
    ellipse(ctx, w / 2, h - 12, w / 2 - 1, 10, P.lavender);
    ellipse(ctx, w / 2 - 6, h - 16, 10, 5, P.lavenderSoft);
    ellipse(ctx, w / 2 + 4, h - 6, 14, 3, P.lavenderDeep);
  }),
  lamp: () => paint('lamp', 22, 78, (ctx, w, h) => {
    ellipse(ctx, w / 2, h - 3, 8, 3, P.navyDeep);
    rect(ctx, w / 2 - 1, 20, 2, h - 22, P.navy);
    for (let i = 0; i < 16; i++) {
      const ww = 10 + Math.round(i * 0.7);
      rect(ctx, w / 2 - ww / 2, 4 + i, ww, 1, i === 0 || i === 15 ? P.navyDeep : P.peachSoft);
    }
    rect(ctx, w / 2 - 4, 20, 8, 2, P.warm);
  }),
};

// ------------------------------------------------------------------ draw

export function drawProp(ctx: Ctx, p: Prop, near: number, t: number) {
  const size = PROP_SIZE[p.kind];
  if (p.kind !== 'lamp') shadow(ctx, p.x, p.y, size.w * 0.85);

  if (p.kind === 'plant' || p.kind === 'plantTall' || p.kind === 'planter') {
    const parts = plantParts[p.kind]();
    blit(ctx, parts.base, p.x, p.y, p.flip);
    const seed = p.x * 0.013;
    const sway = Math.round(Math.sin(t * 1.4 + seed) * (0.35 + near * 1.4));
    blit(ctx, parts.top, p.x + sway, p.y, p.flip);
    return;
  }

  const sprite = statics[p.kind]!();
  if (p.kind === 'beanBag') {
    const squish = near > 0.5 ? 2 : Math.round(Math.sin(t * 1.2) * 0.6 + 0.4);
    blit(ctx, sprite, p.x, p.y, p.flip, squish);
    return;
  }
  if (p.kind === 'lamp') {
    glow(ctx, p.x, p.y - 58, 40, 36, P.warm, 0.25 + near * 0.25);
    glow(ctx, p.x, p.y - 2, 30, 10, P.warm, 0.18 + near * 0.2);
  }
  blit(ctx, sprite, p.x, p.y, p.flip);

  const left = p.x - size.w / 2, top = p.y - size.h;
  if (p.kind === 'serverRack') {
    for (let i = 0; i < 7; i++) {
      const y = top + 6 + i * 13 + 4;
      const on = Math.floor(t * (2 + near * 4) + i * 1.7) % 3 !== 0;
      rect(ctx, left + 8, y, 2, 2, on ? P.mint : P.navy);
      rect(ctx, left + 12, y, 2, 2, Math.floor(t * 3 + i) % 4 === 0 ? P.pink : P.navy);
      rect(ctx, left + 36, y, 3, 2, on ? P.cyan : P.screenLine);
    }
  } else if (p.kind === 'bookshelf' && near > 0.2) {
    // one book slides forward and glows when Tobby is close
    const shelfY = top + 30 + 24 * (Math.abs(Math.round(p.x)) % 3) - 1;
    const bx = left + 20 + (Math.round(p.y) % 20);
    const lift = Math.round(near * 3);
    rect(ctx, bx - 1, shelfY - 17 - lift, 6, 17, P.navyDeep);
    rect(ctx, bx, shelfY - 16 - lift, 4, 15, P.peach);
    rect(ctx, bx, shelfY - 13 - lift, 4, 1, P.paper);
    glow(ctx, bx + 2, shelfY - 8, 10, 12, P.warm, near * 0.5);
  } else if (p.kind === 'plinth' && near > 0.3) {
    const k = Math.floor(t * 6) % 4;
    if (k < 2) { rect(ctx, left + 11, top + 8, 2, 2, P.paper); rect(ctx, left + 10, top + 9, 4, 1, P.paper); }
  } else if (p.kind === 'artDesk') {
    // tiny display: slow colour-swatch cycle
    const sx = left + 60, sy = top + 2;
    const k = Math.floor(t * 0.8) % 3;
    rect(ctx, sx, sy, 30, 18, P.screen);
    rect(ctx, sx + 3, sy + 3, 7, 7, [P.pink, P.peach, P.lavender][k]);
    rect(ctx, sx + 12, sy + 3, 7, 7, [P.peach, P.lavender, P.pink][k]);
    rect(ctx, sx + 21, sy + 3, 6, 7, [P.lavender, P.pink, P.peach][k]);
    rect(ctx, sx + 3, sy + 13, 24, 2, P.screenLine);
    rect(ctx, sx + 3, sy + 13, ((t * 6) % 24) | 0, 2, P.cyan);
  }
}

export function drawBookshelfInteractable(ctx: Ctx, x: number, y: number, near: number, t: number) {
  const sprite = statics.bookshelf!();
  shadow(ctx, x, y, 52);
  blit(ctx, sprite, x, y);
  const left = x - 30, top = y - 108;
  const shelfY = top + 30 + 24 * (Math.abs(Math.round(x)) % 3) - 1;
  const bx = left + 20 + (Math.round(y) % 20);
  const lift = Math.round(near * 3);
  rect(ctx, bx - 1, shelfY - 17 - lift, 6, 17, P.navyDeep);
  rect(ctx, bx, shelfY - 16 - lift, 4, 15, P.peach);
  rect(ctx, bx, shelfY - 13 - lift, 4, 1, P.paper);
  glow(ctx, bx + 2, shelfY - 8, 10, 12, P.warm, 0.35 + near * 0.45);
  if (near > 0.35) {
    const blink = Math.floor(t * 2.5) % 4;
    rect(ctx, bx + 8, top + 14 + blink, 10, 2, P.lavender);
  }
}
