// Procedural art for everything Tobby can interact with.
// Static bodies are cached; screens and lights animate every frame.
// `on` (0..1) is Tobby's proximity: screens wake up, holograms speed up.

import type { ProjectId } from '../../data/types';
import type { Interactable } from '../world/shipMap';
import { disc, dot, ellipse, ellipseLine, frame, glow, line, makeCanvas, rect, type Ctx } from './pixel';
import { MACHINE_COLOR, P } from './theme';

interface Body { img: HTMLCanvasElement }
const bodies = new Map<string, Body>();

function body(key: string, w: number, h: number, draw: (ctx: Ctx) => void): Body {
  let b = bodies.get(key);
  if (!b) {
    const [img, ctx] = makeCanvas(w, h);
    draw(ctx);
    b = { img };
    bodies.set(key, b);
  }
  return b;
}

const topLeft = (it: Interactable) => ({ x: Math.round(it.base.x - it.size.w / 2), y: Math.round(it.base.y - it.size.h) });

function shadow(ctx: Ctx, it: Interactable) {
  ellipse(ctx, it.base.x, it.base.y - 1, it.size.w / 2 + 4, 5, 'rgba(31,37,80,0.18)');
}

// ------------------------------------------------------------------ icons (12×10)

const ICONS: Record<ProjectId, (ctx: Ctx, x: number, y: number) => void> = {
  eta(ctx, x, y) { disc(ctx, x + 6, y + 3, 3, P.navyDeep); dot(ctx, x + 6, y + 3, P.paper); rect(ctx, x + 5, y + 6, 3, 2, P.navyDeep); dot(ctx, x + 6, y + 8, P.navyDeep); },
  meal(ctx, x, y) { rect(ctx, x + 1, y + 5, 2, 5, P.navyDeep); rect(ctx, x + 5, y + 2, 2, 8, P.navyDeep); rect(ctx, x + 9, y, 2, 10, P.navyDeep); },
  heart(ctx, x, y) {
    rect(ctx, x + 2, y + 1, 3, 2, P.navyDeep); rect(ctx, x + 7, y + 1, 3, 2, P.navyDeep);
    rect(ctx, x + 1, y + 2, 10, 3, P.navyDeep); rect(ctx, x + 2, y + 5, 8, 2, P.navyDeep); rect(ctx, x + 4, y + 7, 4, 2, P.navyDeep);
  },
  tiny(ctx, x, y) { line(ctx, x + 1, y + 2, x + 4, y + 5, P.navyDeep); line(ctx, x + 4, y + 5, x + 1, y + 8, P.navyDeep); rect(ctx, x + 6, y + 8, 5, 2, P.navyDeep); },
  resync(ctx, x, y) { rect(ctx, x + 2, y, 8, 10, P.navyDeep); rect(ctx, x + 3, y + 1, 6, 8, P.paper); rect(ctx, x + 4, y + 3, 4, 1, P.navyDeep); rect(ctx, x + 4, y + 5, 3, 1, P.navyDeep); },
};

// ------------------------------------------------------------------ project machines

const MW = 78, MH = 112;
const SCREEN = { x: 9, y: 25, w: 60, h: 38 };

function machineBody(id: ProjectId): Body {
  return body(`machine-${id}`, MW, MH, (ctx) => {
    const c = MACHINE_COLOR[id];
    // cabinet
    frame(ctx, 0, 14, MW, MH - 20, P.hull, P.navyDeep, 3, 2);
    rect(ctx, 3, 18, 2, MH - 30, P.hullLight);
    rect(ctx, MW - 9, 18, 6, MH - 30, P.hullShade);
    // coloured crown with project icon
    frame(ctx, 5, 0, MW - 10, 20, c.main, P.navyDeep, 3, 2);
    rect(ctx, 9, 3, MW - 18, 2, P.paper);
    rect(ctx, 9, 15, MW - 18, 2, c.deep);
    frame(ctx, MW / 2 - 9, 4, 18, 13, P.paper, P.navyDeep, 1, 1);
    ICONS[id](ctx, MW / 2 - 6, 5);
    // screen bezel
    frame(ctx, 6, 22, MW - 12, 44, P.navy, P.navyDeep, 2, 1);
    // control deck
    frame(ctx, 6, 70, MW - 12, 13, P.lavenderSoft, P.navyDeep, 1, 1);
    rect(ctx, 8, 71, MW - 16, 1, P.paper);
    disc(ctx, 16, 76, 3, P.navyDeep); disc(ctx, 16, 75, 2, c.main);
    rect(ctx, MW - 22, 73, 10, 6, P.navyDeep); rect(ctx, MW - 21, 74, 8, 4, P.lavender);
    // accent stripe + vents
    rect(ctx, 3, 86, MW - 12, 3, c.main);
    for (let i = 0; i < 3; i++) rect(ctx, 14, 92 + i * 4, MW - 34, 1, P.hullDark);
    // plinth
    rect(ctx, 1, MH - 8, MW - 2, 8, P.navyDeep);
    rect(ctx, 3, MH - 7, MW - 6, 5, P.lavender);
    if (id === 'resync') {
      // under construction: hazard stripes on the plinth
      for (let x = 3; x < MW - 3; x += 8) { rect(ctx, x, MH - 7, 4, 5, P.peach); rect(ctx, x + 4, MH - 7, 4, 5, P.navy); }
      rect(ctx, MW - 18, 90, 8, 8, P.navyDeep); rect(ctx, MW - 17, 91, 6, 6, P.peach); rect(ctx, MW - 15, 92, 2, 3, P.navyDeep); dot(ctx, MW - 15, 96, P.navyDeep);
    }
  });
}

type ScreenFn = (ctx: Ctx, x: number, y: number, w: number, h: number, t: number) => void;

const SCREENS: Record<ProjectId, ScreenFn> = {
  eta(ctx, x, y, w, h, t) {
    for (let gx = x + 4; gx < x + w; gx += 8) rect(ctx, gx, y, 1, h, P.screenLine);
    for (let gy = y + 4; gy < y + h; gy += 8) rect(ctx, x, gy, w, 1, P.screenLine);
    const pts = [[4, 30], [16, 29], [20, 19], [34, 17], [38, 9], [51, 8]].map(([a, b]) => [x + a, y + b]);
    for (let i = 0; i < pts.length - 1; i++) line(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], P.lavender);
    // courier moving along the route
    const k = (t * 0.22) % 1, seg = k * (pts.length - 1), si = Math.floor(seg), f = seg - si;
    const cx = pts[si][0] + (pts[si + 1][0] - pts[si][0]) * f, cy = pts[si][1] + (pts[si + 1][1] - pts[si][1]) * f;
    rect(ctx, cx - 1, cy - 1, 3, 3, P.peach);
    disc(ctx, x + 51, y + 6, 3, P.pink); dot(ctx, x + 51, y + 6, P.paper); rect(ctx, x + 50, y + 9, 3, 2, P.pink);
    rect(ctx, x + 4, y + h - 4, w - 8, 2, P.screenLine);
    rect(ctx, x + 4, y + h - 4, Math.round((w - 8) * k), 2, P.peach);
  },
  meal(ctx, x, y, w, h, t) {
    const hs = [10, 14, 12, 18, 16, 22];
    hs.forEach((v, i) => {
      const bh = Math.round(v + Math.sin(t * 1.3 + i) * 2);
      rect(ctx, x + 5 + i * 9, y + h - 4 - bh, 6, bh, i >= 4 ? P.cyanDeep : P.cyan);
    });
    rect(ctx, x + 3, y + h - 4, w - 6, 1, P.lavender);
    let px = x + 8, py = y + 20;
    for (let i = 1; i < 6; i++) {
      const nx = x + 8 + i * 9, ny = y + 20 - i * 2 + Math.round(Math.sin(t + i) * 2);
      if (i < 4) line(ctx, px, py, nx, ny, P.peach);
      else if (Math.floor(t * 4) % 2 === 0 || i === 4) { dot(ctx, (px + nx) / 2, (py + ny) / 2, P.peach); dot(ctx, nx, ny, P.peach); }
      px = nx; py = ny;
    }
  },
  heart(ctx, x, y, w, h, t) {
    const my = y + h / 2 + 5;
    const wave = (i: number) => {
      const p = (i + Math.floor(t * 24)) % 30;
      if (p === 10) return -3; if (p === 13) return -12; if (p === 14) return 6; if (p === 15) return -2;
      if (p > 20 && p < 24) return -2;
      return 0;
    };
    let prev = my + wave(0);
    for (let i = 1; i < w - 4; i++) {
      const cur = my + wave(i);
      line(ctx, x + 2 + i - 1, prev, x + 2 + i, cur, i > w - 12 ? P.pinkSoft : P.pink);
      prev = cur;
    }
    const beat = (t * 1.2) % 1 < 0.15 ? 1 : 0;
    const hx = x + w - 11, hy = y + 5;
    disc(ctx, hx - 2, hy + 2, 2 + beat, P.pink); disc(ctx, hx + 2, hy + 2, 2 + beat, P.pink);
    rect(ctx, hx - 3 - beat, hy + 3, 7 + beat * 2, 2, P.pink); rect(ctx, hx - 1, hy + 5 + beat, 3, 2, P.pink);
  },
  tiny(ctx, x, y, w, h, t) {
    const lines = [[30, P.mint], [42, P.cyan], [20, P.peach], [36, P.mint], [26, P.lavender]] as const;
    const shown = Math.floor(t * 1.6) % (lines.length + 2);
    for (let i = 0; i < Math.min(shown, lines.length); i++) {
      rect(ctx, x + 4, y + 4 + i * 7, 2, 3, P.lavenderDeep);
      rect(ctx, x + 8, y + 4 + i * 7, lines[i][0], 3, lines[i][1]);
    }
    const ly = y + 4 + Math.min(shown, lines.length - 1) * 7;
    const lx = x + 8 + (shown > 0 ? lines[Math.min(shown, lines.length) - 1][0] + 2 : 0);
    if (Math.floor(t * 3) % 2 === 0) rect(ctx, Math.min(lx, x + w - 6), ly, 3, 4, P.paper);
    void h;
  },
  resync(ctx, x, y, w, h, t) {
    rect(ctx, x + 4, y + 3, 22, h - 6, P.paper);
    for (let i = 0; i < 6; i++) rect(ctx, x + 7, y + 7 + i * 5, i % 2 ? 12 : 16, 2, P.lavender);
    const sy = y + 4 + ((t * 14) % (h - 10));
    rect(ctx, x + 5, sy, 20, 2, 'rgba(127,214,238,0.8)');
    // keyword chips + match meter
    const k = Math.floor(t * 1.2) % 4;
    for (let i = 0; i < 3; i++) rect(ctx, x + 31, y + 5 + i * 7, 10 + (i % 2) * 6, 4, i < k ? P.mint : P.screenLine);
    rect(ctx, x + 31, y + h - 9, w - 36, 4, P.screenLine);
    rect(ctx, x + 31, y + h - 9, Math.round((w - 36) * Math.min(0.72, ((t * 0.3) % 1.2))), 4, P.peach);
  },
};

function screenOff(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  rect(ctx, x, y, w, h, P.screenOff);
  for (let k = 0; k < 10; k++) rect(ctx, x + 8 + k, y + h - 4 - k * 2, 1, 2, 'rgba(255,255,255,0.08)');
  if (Math.floor(t * 1.2) % 2 === 0) rect(ctx, x + w - 5, y + h - 4, 2, 2, P.lavenderDeep);
}

export function drawMachine(ctx: Ctx, it: Interactable, on: number, t: number) {
  const id = it.refId as ProjectId;
  const { x, y } = topLeft(it);
  shadow(ctx, it);
  ctx.drawImage(machineBody(id).img, x, y);
  const sx = x + SCREEN.x, sy = y + SCREEN.y;
  screenOff(ctx, sx, sy, SCREEN.w, SCREEN.h, t);
  if (on > 0.02) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, on * 1.2);
    rect(ctx, sx, sy, SCREEN.w, SCREEN.h, P.screen);
    ctx.beginPath(); ctx.rect(sx, sy, SCREEN.w, SCREEN.h); ctx.clip();
    SCREENS[id](ctx, sx, sy, SCREEN.w, SCREEN.h, t);
    ctx.restore();
  }
  // deck buttons + plinth light wake up with proximity
  const c = MACHINE_COLOR[id];
  const blink = Math.floor(t * 2 + x) % 3;
  rect(ctx, x + 26, y + 74, 4, 3, on > 0.3 && blink === 0 ? c.main : P.lavender);
  rect(ctx, x + 32, y + 74, 4, 3, on > 0.3 && blink === 1 ? P.pink : P.lavender);
  rect(ctx, x + 38, y + 74, 4, 3, on > 0.3 && blink === 2 ? P.cyan : P.lavender);
  if (id !== 'resync') rect(ctx, x + 8, y + MH - 5, MW - 16, 2, on > 0.1 ? c.main : P.lavenderDeep);
  else if (Math.floor(t * 1.5) % 2 === 0) rect(ctx, x + MW - 15, y + 92, 2, 3, P.pink);
}

// ------------------------------------------------------------------ skill terminals

const SKILL_SCREEN: Record<string, ScreenFn> = {
  'code-data'(ctx, x, y, w, h, t) {
    const off = Math.floor(t * 4) % 6;
    const widths = [18, 30, 24, 12, 34, 20, 26, 16, 28];
    for (let i = 0; i < 5; i++) {
      const wv = widths[(i + off) % widths.length];
      rect(ctx, x + 3 + ((i + off) % 3) * 3, y + 3 + i * 5, wv, 2, [P.cyan, P.mint, P.peach][(i + off) % 3]);
    }
    void w; void h;
  },
  'ml-analytics'(ctx, x, y, w, h, t) {
    const pts = [[6, 20], [10, 17], [14, 18], [19, 14], [24, 13], [28, 10], [33, 9], [38, 7], [44, 5]];
    pts.forEach(([a, b], i) => dot(ctx, x + a, y + b + Math.round(Math.sin(t * 2 + i) * 1), i % 3 ? P.cyan : P.pink, 2));
    line(ctx, x + 4, y + h - 5, x + w - 5, y + 4, P.peach);
    rect(ctx, x + 3, y + h - 3, w - 6, 1, P.lavender);
  },
  'build-tools'(ctx, x, y, w, h, t) {
    const n = Math.floor(t * 3) % 16;
    for (let i = 0; i < 12; i++) {
      const bx = x + 4 + (i % 6) * 8, by = y + h - 9 - Math.floor(i / 6) * 8;
      rect(ctx, bx, by, 6, 6, i < n ? [P.mint, P.cyan, P.peach, P.lavender][i % 4] : P.screenLine);
    }
    rect(ctx, x + 4, y + 3, Math.min(w - 8, n * 3), 2, P.pink);
  },
};

export function drawSkillTerminal(ctx: Ctx, it: Interactable, on: number, t: number) {
  const { x, y } = topLeft(it);
  const w = it.size.w, h = it.size.h;
  shadow(ctx, it);
  const b = body('skill-terminal', w, h, (c) => {
    // pedestal
    rect(c, w / 2 - 16, h - 8, 32, 8, P.navyDeep);
    rect(c, w / 2 - 14, h - 7, 28, 5, P.blue);
    frame(c, w / 2 - 9, 40, 18, h - 46, P.lavenderSoft, P.navyDeep, 1, 1);
    rect(c, w / 2 - 7, 42, 3, h - 50, P.paper);
    // console head
    frame(c, 0, 0, w, 42, P.blueSoft, P.navyDeep, 3, 2);
    rect(c, 4, 3, w - 8, 2, P.paper);
    frame(c, 5, 5, w - 10, 30, P.navy, P.navyDeep, 1, 1);
    rect(c, 6, 36, w - 12, 3, P.lavender);
    for (let i = 0; i < 8; i++) rect(c, 8 + i * 7, 37, 5, 1, P.lavenderDeep);
  });
  ctx.drawImage(b.img, x, y);
  const sx = x + 7, sy = y + 7, sw = w - 14, sh = 26;
  screenOff(ctx, sx, sy, sw, sh, t);
  ctx.save();
  ctx.globalAlpha = 0.35 + on * 0.65;
  rect(ctx, sx, sy, sw, sh, P.screen);
  ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  SKILL_SCREEN[it.refId]?.(ctx, sx, sy, sw, sh, t * (0.5 + on));
  ctx.restore();
  rect(ctx, x + w / 2 - 3, y + h - 6, 6, 2, on > 0.2 ? P.cyan : P.blueDeep);
}

// ------------------------------------------------------------------ contact terminal

export function drawContactTerminal(ctx: Ctx, it: Interactable, on: number, t: number) {
  const { x, y } = topLeft(it);
  const w = it.size.w, h = it.size.h;
  shadow(ctx, it);
  const b = body('contact', w, h, (c) => {
    // antenna dish
    rect(c, w - 16, 2, 2, 16, P.navy);
    ellipse(c, w - 12, 6, 7, 4, P.navyDeep); ellipse(c, w - 12, 6, 6, 3, P.hullLight);
    frame(c, 2, 16, w - 4, h - 22, P.hull, P.navyDeep, 3, 2);
    rect(c, w - 10, 20, 5, h - 32, P.hullShade);
    frame(c, 7, 22, w - 18, 30, P.navy, P.navyDeep, 1, 1);
    frame(c, 7, 56, w - 18, 10, P.pinkSoft, P.navyDeep, 1, 1);
    for (let i = 0; i < 4; i++) rect(c, 11 + i * 9, 59, 6, 4, P.paper);
    rect(c, 0, h - 7, w, 7, P.navyDeep); rect(c, 2, h - 6, w - 4, 4, P.pink);
  });
  ctx.drawImage(b.img, x, y);
  const sx = x + 9, sy = y + 24, sw = w - 22, sh = 26;
  rect(ctx, sx, sy, sw, sh, on > 0.1 ? P.screen : P.screenOff);
  // envelope + signal arcs
  const ex = sx + sw / 2 - 9, ey = sy + 8;
  rect(ctx, ex, ey, 18, 12, on > 0.1 ? P.paper : P.lavenderDeep);
  line(ctx, ex, ey, ex + 9, ey + 6, P.navy); line(ctx, ex + 17, ey, ex + 9, ey + 6, P.navy);
  if (on > 0.1) {
    const k = Math.floor(t * 3) % 4;
    for (let i = 0; i < k; i++) ellipseLine(ctx, ex + 22, ey + 2, 2 + i * 2, 2 + i * 2, P.cyan, -Math.PI / 2, 0);
  }
  if (Math.floor(t * 2) % 2 === 0) rect(ctx, x + w - 14, y + 58, 3, 3, on > 0.1 ? P.pink : P.pinkSoft);
}

// ------------------------------------------------------------------ About board (wall)

export function drawAboutBoard(ctx: Ctx, it: Interactable, on: number, avatar: HTMLImageElement | null) {
  const { x, y } = topLeft(it);
  const w = it.size.w, h = it.size.h;
  if (on > 0.05) glow(ctx, x + w / 2, y + h / 2, w * 0.7, h * 0.8, P.warm, on * 0.35);
  frame(ctx, x, y, w, h, P.paper, P.woodDeep, 2, 3);
  rect(ctx, x + 3, y + 3, w - 6, 1, P.woodLight);
  // portrait
  frame(ctx, x + 8, y + 8, 38, 40, P.peachSoft, P.navyDeep, 1, 1);
  if (avatar) ctx.drawImage(avatar, x + 9, y + 9, 36, 38);
  else disc(ctx, x + 27, y + 24, 8, P.pink);
  // text lines + tiny icons
  for (let i = 0; i < 4; i++) rect(ctx, x + 54, y + 12 + i * 8, [40, 32, 44, 26][i], 3, [P.navy, P.lavender, P.lavender, P.lavender][i]);
  disc(ctx, x + 58, y + 50, 3, P.pink); rect(ctx, x + 57, y + 52, 3, 2, P.pink);
  rect(ctx, x + 66, y + 48, 8, 4, P.navy); rect(ctx, x + 68, y + 46, 4, 2, P.navy);
  // push pin
  disc(ctx, x + w - 10, y + 8, 3, P.pink); dot(ctx, x + w - 11, y + 7, P.paper);
}

// ------------------------------------------------------------------ poster stands

export function drawPosterStand(ctx: Ctx, it: Interactable, on: number, image: HTMLImageElement | null) {
  const { x, y } = topLeft(it);
  const w = it.size.w, h = it.size.h;
  shadow(ctx, it);
  // legs
  rect(ctx, x + 10, y + h - 26, 3, 26, P.navyDeep);
  rect(ctx, x + w - 13, y + h - 26, 3, 26, P.navyDeep);
  rect(ctx, x + 6, y + h - 3, 12, 3, P.navyDeep); rect(ctx, x + w - 18, y + h - 3, 12, 3, P.navyDeep);
  // frame
  const fx = x + 2, fy = y + 2, fw = w - 4, fh = h - 26;
  if (on > 0.05) glow(ctx, x + w / 2, fy + fh / 2, fw, fh * 0.8, P.warm, on * 0.35);
  frame(ctx, fx, fy, fw, fh, P.paper, P.navyDeep, 1, 2);
  rect(ctx, fx + 2, fy + 2, fw - 4, 3, P.woodLight);
  const ix = fx + 5, iy = fy + 5, iw = fw - 10, ih = fh - 10;
  if (image) {
    const s = Math.max(iw / image.width, ih / image.height);
    const sw = iw / s, sh = ih / s;
    ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, ix, iy, iw, ih);
  } else {
    // waiting for the real poster: soft pastel card with a "?" mark
    rect(ctx, ix, iy, iw, ih, P.lavenderSoft);
    for (let k = 0; k < ih; k += 6) rect(ctx, ix, iy + k, iw, 2, '#efebfa');
    frame(ctx, ix + iw / 2 - 9, iy + ih / 2 - 11, 18, 22, P.paper, P.lavenderDeep, 2, 1);
    rect(ctx, ix + iw / 2 - 3, iy + ih / 2 - 6, 6, 2, P.lavenderDeep);
    rect(ctx, ix + iw / 2 + 1, iy + ih / 2 - 5, 2, 4, P.lavenderDeep);
    rect(ctx, ix + iw / 2 - 1, iy + ih / 2 - 1, 2, 3, P.lavenderDeep);
    rect(ctx, ix + iw / 2 - 1, iy + ih / 2 + 4, 2, 2, P.lavenderDeep);
  }
  // plaque
  frame(ctx, x + w / 2 - 12, y + h - 22, 24, 7, P.peach, P.navyDeep, 1, 1);
}

// ------------------------------------------------------------------ navigation globe

export function drawGlobe(ctx: Ctx, it: Interactable, on: number, t: number) {
  const cx = it.base.x, by = it.base.y;
  const speed = 0.6 + on * 1.4;
  // projector base
  ellipse(ctx, cx, by - 8, 44, 12, P.navyDeep);
  ellipse(ctx, cx, by - 10, 42, 10, P.lavender);
  ellipse(ctx, cx, by - 11, 34, 7, P.lavenderSoft);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const lit = Math.floor(t * 4 * speed) % 10 === i;
    dot(ctx, cx + Math.cos(a) * 38, by - 10 + Math.sin(a) * 8, lit ? P.cyan : P.lavenderDeep, 2);
  }
  ellipse(ctx, cx, by - 16, 16, 5, P.navyDeep);
  ellipse(ctx, cx, by - 17, 14, 4, P.cyan);
  // light cone
  ctx.save();
  ctx.globalAlpha = 0.14 + on * 0.1;
  for (let yy = 0; yy < 46; yy++) {
    const ww = 10 + yy * 0.6;
    rect(ctx, cx - ww, by - 18 - yy, ww * 2, 1, P.cyan);
  }
  ctx.restore();
  // globe
  const gy = by - 82 + Math.round(Math.sin(t * 1.5) * 2), r = 28;
  glow(ctx, cx, gy, 58, 52, P.cyan, 0.22 + on * 0.18);
  ctx.save();
  ctx.globalAlpha = 0.55 + on * 0.25;
  disc(ctx, cx, gy, r, '#5bb8e0');
  disc(ctx, cx - 6, gy - 6, 9, '#8fd3f0');
  ctx.globalAlpha = 0.85;
  ellipseLine(ctx, cx, gy, r, r, P.cyanSoft);
  ellipseLine(ctx, cx, gy, r, 6, P.cyanSoft);
  for (let k = 0; k < 3; k++) {
    const ph = t * speed + (k * Math.PI) / 3;
    ellipseLine(ctx, cx, gy, Math.abs(Math.cos(ph)) * r, r, P.cyanSoft);
  }
  ctx.restore();
  // two orbits with satellites
  ellipseLine(ctx, cx, gy + 2, 48, 12, P.peach, 0, Math.PI * 2);
  ellipseLine(ctx, cx, gy - 4, 38, 19, P.lavender, 0, Math.PI * 2);
  const a1 = t * speed * 1.3, a2 = -t * speed * 0.9 + 2;
  rect(ctx, cx + Math.cos(a1) * 48 - 2, gy + 2 + Math.sin(a1) * 12 - 2, 4, 4, P.peach);
  rect(ctx, cx + Math.cos(a2) * 38 - 1, gy - 4 + Math.sin(a2) * 19 - 1, 3, 3, P.pink);
  // a few sparkles when Tobby is close
  if (on > 0.3) {
    for (let i = 0; i < 4; i++) {
      const ph = (t * 0.8 + i * 0.25) % 1;
      const sx = cx + Math.cos(i * 1.7) * 28, sy = gy + 24 - ph * 50;
      ctx.globalAlpha = (1 - ph) * on;
      rect(ctx, sx, sy, 2, 2, P.cyanSoft);
    }
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------------ cockpit flight console

export function drawBriefingConsole(ctx: Ctx, it: Interactable, on: number, t: number) {
  const { x, y } = topLeft(it);
  const w = it.size.w, h = it.size.h;
  shadow(ctx, it);
  const b = body('briefing', w, h, (c) => {
    frame(c, 0, 26, w, h - 26, P.navy, P.navyDeep, 3, 2);
    rect(c, 3, 29, w - 6, 3, P.violet);
    frame(c, 4, 34, w - 8, 12, P.lavender, P.navyDeep, 1, 1);
    for (let i = 0; i < 9; i++) rect(c, 8 + i * 9, 38, 5, 4, P.lavenderSoft);
    rect(c, 2, h - 6, w - 4, 4, P.navyDeep);
    // three angled screens
    for (let i = 0; i < 3; i++) frame(c, 4 + i * 30, 0 + (i === 1 ? 0 : 4), 28, 24, P.navy, P.navyDeep, 1, 1);
  });
  ctx.drawImage(b.img, x, y);
  const k = 0.4 + on * 0.6;
  ctx.save();
  ctx.globalAlpha = k;
  // left: radar sweep
  const rx = x + 6, ry = y + 6;
  rect(ctx, rx, ry, 24, 18, P.screen);
  ellipseLine(ctx, rx + 12, ry + 9, 8, 8, P.mintDeep);
  const a = t * 2;
  line(ctx, rx + 12, ry + 9, rx + 12 + Math.cos(a) * 8, ry + 9 + Math.sin(a) * 8, P.mint);
  if (Math.floor(t * 2) % 3 === 0) dot(ctx, rx + 16, ry + 6, P.pink, 2);
  // centre: star map
  const mx = x + 36, my = y + 2;
  rect(ctx, mx, my, 24, 20, P.screen);
  for (const [a2, b2] of [[4, 5], [10, 12], [17, 6], [20, 15], [7, 16]]) dot(ctx, mx + a2, my + b2, P.cyanSoft);
  line(ctx, mx + 4, my + 5, mx + 10, my + 12, P.lavender); line(ctx, mx + 10, my + 12, mx + 20, my + 15, P.lavender);
  if (Math.floor(t * 3) % 2 === 0) rect(ctx, mx + 19, my + 14, 3, 3, P.peach);
  // right: status text
  const sx = x + 66, sy = y + 6;
  rect(ctx, sx, sy, 24, 18, P.screen);
  for (let i = 0; i < 3; i++) rect(ctx, sx + 3, sy + 3 + i * 5, [16, 12, 18][i], 2, [P.cyan, P.peach, P.mint][i]);
  ctx.restore();
  const blink = Math.floor(t * 2.5) % 9;
  rect(ctx, x + 8 + blink * 9, y + 38, 5, 4, on > 0.2 ? P.pink : P.lavenderDeep);
}

// ------------------------------------------------------------------ floor glow under screens

export function drawInteractableGlow(ctx: Ctx, it: Interactable, on: number) {
  if (it.kind === 'about') return;
  const color = it.kind === 'project' ? MACHINE_COLOR[it.refId as ProjectId].main
    : it.kind === 'poster' ? P.warm : it.kind === 'contact' ? P.pink : P.cyan;
  const base = it.kind === 'map' ? 0.2 : 0.06;
  glow(ctx, it.base.x, it.base.y + 6, it.size.w * 0.8, 16, color, base + on * 0.3);
}

