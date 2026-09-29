// Procedural art for everything Tobby can interact with.
// Static bodies are cached; screens and lights animate every frame.
// `on` (0..1) is Tobby's proximity: screens wake up, holograms speed up.

import type { Interactable } from '../world/shipMap';
import { disc, dot, ellipse, ellipseLine, frame, glow, line, makeCanvas, rect, type Ctx } from './pixel';
import { P } from './theme';

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

type ScreenFn = (ctx: Ctx, x: number, y: number, w: number, h: number, t: number) => void;

function screenOff(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  rect(ctx, x, y, w, h, P.screenOff);
  for (let k = 0; k < 10; k++) rect(ctx, x + 8 + k, y + h - 4 - k * 2, 1, 2, 'rgba(255,255,255,0.08)');
  if (Math.floor(t * 1.2) % 2 === 0) rect(ctx, x + w - 5, y + h - 4, 2, 2, P.lavenderDeep);
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
  const color =
    it.kind === 'contact' ? P.pink
      : it.kind === 'poster' || it.kind === 'gallery' ? P.warm
        : it.kind === 'about' ? P.peach
          : it.kind === 'jokes' ? P.warm
          : P.cyan;

  // Wall-mounted interactables need an aura around the object, not on the floor.
  if (!it.solid) {
    const cx = it.base.x;
    const cy = it.base.y - it.size.h * 0.48;
    glow(ctx, cx, cy, it.size.w * 0.62, it.size.h * 0.72, color, 0.045 + on * 0.2);
    return;
  }

  const base = it.kind === 'map' ? 0.15 : 0.08;
  glow(ctx, it.base.x, it.base.y + 6, it.size.w * 0.82, 16, color, base + on * 0.28);
}
