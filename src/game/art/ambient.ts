// Small ambient animations layered over the static shell: wall screens,
// blinking running lights, light pulses along the corridor, engine glow.
// Each is cheap and most are slow — the ship should feel alive, not busy.

import type { WallItem } from '../world/decor';
import type { Rect } from '../world/shipMap';
import { dot, ellipseLine, glow, line, rect, type Ctx } from './pixel';
import type { Blinker, Nozzle } from './shell';
import { P } from './theme';

type ScreenFn = (ctx: Ctx, x: number, y: number, w: number, h: number, t: number) => void;

const WALL_SCREENS: Record<string, ScreenFn> = {
  bigdata(ctx, x, y, _w, h, t) {
    // header, a line chart that slowly redraws, bar strip and a scrolling ticker
    rect(ctx, x + 4, y + 4, 40, 3, P.cyan);
    rect(ctx, x + 48, y + 4, 20, 3, P.lavender);
    const cw = 110, chh = h - 20, cx = x + 6, cy = y + 12;
    rect(ctx, cx, cy + chh, cw, 1, P.screenLine);
    let px = cx, py = cy + chh - 4;
    const reveal = ((t * 0.25) % 1.3) * cw;
    for (let i = 1; i <= 22; i++) {
      const nx = cx + (i / 22) * cw;
      const ny = cy + chh - 4 - (i / 22) * (chh - 10) - Math.sin(i * 1.3) * 5;
      if (nx - cx <= reveal) line(ctx, px, py, nx, ny, P.cyan);
      px = nx; py = ny;
    }
    for (let i = 0; i < 7; i++) {
      const bh = 6 + ((i * 7 + Math.floor(t * 1.5)) % 5) * 4;
      rect(ctx, x + 126 + i * 10, y + h - 6 - bh, 6, bh, [P.peach, P.pink, P.lavender][i % 3]);
    }
    const off = Math.floor(t * 8) % 20;
    for (let i = 0; i < 8; i++) rect(ctx, x + 124 + ((i * 10 - off + 80) % 80), y + 5, 6, 2, P.mint);
  },
  code(ctx, x, y, w, h, t) {
    const off = Math.floor(t * 2.5);
    for (let i = 0; i < 5; i++) {
      const k = (i + off) % 7;
      rect(ctx, x + 3 + (k % 3) * 3, y + 3 + i * 7, 12 + ((k * 13) % 30), 2, [P.mint, P.cyan, P.peach, P.lavender][k % 4]);
    }
    if (Math.floor(t * 3) % 2 === 0) rect(ctx, x + w - 8, y + h - 7, 3, 4, P.paper);
  },
  chart(ctx, x, y, w, h, t) {
    const cx = x + w / 2 - 8, cy = y + h / 2;
    const a = (t * 0.4) % (Math.PI * 2);
    for (let i = 0; i < 12; i++) {
      const s = (i / 12) * Math.PI * 2 + a;
      const col = i < 5 ? P.cyan : i < 9 ? P.pink : P.peach;
      line(ctx, cx, cy, cx + Math.cos(s) * 11, cy + Math.sin(s) * 11, col);
    }
    for (let i = 0; i < 3; i++) rect(ctx, x + w - 16, y + 8 + i * 8, 10, 3, [P.cyan, P.pink, P.peach][i]);
  },
  map(ctx, x, y, w, h, t) {
    const pts: [number, number, string][] = [[12, 12, P.peach], [16, 28, P.peachDeep], [48, 12, P.cyan], [48, 28, P.pink], [6, 20, P.lavender]];
    line(ctx, x + 6, y + 20, x + 32, y + 20, P.screenLine);
    line(ctx, x + 32, y + 20, x + 58, y + 20, P.screenLine);
    for (const [a, b] of pts) line(ctx, x + 32, y + 20, x + a, y + b, P.screenLine);
    ellipseLine(ctx, x + 32, y + 20, 5, 5, P.cyan);
    pts.forEach(([a, b, col], i) => rect(ctx, x + a - 2, y + b - 2, 4, 4, Math.floor(t * 1.5) % 5 === i ? P.paper : col));
    void w; void h;
  },
  radar(ctx, x, y, w, h, t) {
    const cx = x + w / 2, cy = y + h / 2;
    ellipseLine(ctx, cx, cy, 16, 16, P.mintDeep);
    ellipseLine(ctx, cx, cy, 8, 8, P.mintDeep);
    const a = t * 1.6;
    line(ctx, cx, cy, cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, P.mint);
    line(ctx, cx, cy, cx + Math.cos(a - 0.15) * 16, cy + Math.sin(a - 0.15) * 16, P.mintDeep);
    if (Math.floor(t * 1.2) % 3 !== 0) dot(ctx, cx + 9, cy - 6, P.peach, 2);
    dot(ctx, cx - 11, cy + 4, P.cyan, 2);
  },
};

export function drawWallScreen(ctx: Ctx, it: WallItem, t: number) {
  const fn = WALL_SCREENS[it.variant ?? ''];
  if (!fn) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(it.x, it.y, it.w, it.h);
  ctx.clip();
  rect(ctx, it.x, it.y, it.w, it.h, P.screen);
  fn(ctx, it.x, it.y, it.w, it.h, t);
  // faint scanline shimmer
  rect(ctx, it.x, it.y + ((t * 12) % it.h), it.w, 1, 'rgba(201,238,248,0.08)');
  ctx.restore();
}

export function drawBlinkers(ctx: Ctx, blinkers: Blinker[], t: number) {
  for (const b of blinkers) {
    const k = ((t + b.phase) % b.period) / b.period;
    const on = k < 0.18;
    rect(ctx, b.x, b.y, b.size, b.size, on ? b.color : P.navy);
    if (on) glow(ctx, b.x + b.size / 2, b.y + b.size / 2, 8, 8, b.color, 0.5);
  }
}

/** A soft light pulse travelling along each corridor's centre strip every few seconds. */
export function drawCorridorPulses(ctx: Ctx, spines: Rect[], t: number) {
  for (const [i, s] of spines.entries()) {
    const k = ((t * 0.35 + i * 0.5) % 1.6) / 1.2;
    if (k > 1) continue;
    const px = i % 2 === 0 ? s.x + k * s.w : s.x + s.w - k * s.w;
    const my = s.y + 16 + Math.round((s.h - 16) / 2) - 1;
    for (let j = 0; j < 5; j++) {
      ctx.globalAlpha = 1 - j * 0.18;
      rect(ctx, px - j * 12 * (i % 2 === 0 ? 1 : -1), my, 7, 2, P.cyanSoft);
    }
    ctx.globalAlpha = 1;
    glow(ctx, px, my, 22, 8, P.cyan, 0.35);
  }
}

export function drawNozzles(ctx: Ctx, nozzles: Nozzle[], t: number) {
  for (const [i, n] of nozzles.entries()) {
    const f = 0.8 + Math.sin(t * 9 + i * 2) * 0.1 + Math.sin(t * 23 + i) * 0.05;
    glow(ctx, n.x + 10, n.y, 34 * f, n.h * 0.45, P.cyan, 0.45);
    glow(ctx, n.x + 4, n.y, 16 * f, n.h * 0.28, P.cyanSoft, 0.8);
    rect(ctx, n.x, n.y - n.h / 2 + 6, 3, n.h - 12, P.cyanSoft);
  }
}

/** Control panel lights: a slow, staggered pattern (not all at once). */
export function drawPanelLights(ctx: Ctx, it: WallItem, t: number) {
  const cols = [P.mint, P.peach, P.cyan];
  for (let i = 0; i < 3; i++) {
    const on = Math.floor(t * 1.3 + i * 0.7 + it.x * 0.01) % 4 !== i;
    rect(ctx, it.x + 4 + i * 6, it.y + it.h - 7, 3, 3, on ? cols[i] : P.lavenderDeep);
  }
  // tiny readout bar
  const k = ((t * 0.5 + it.y * 0.01) % 1) * (it.w - 8);
  rect(ctx, it.x + 4, it.y + 5, it.w - 8, 2, P.lavender);
  rect(ctx, it.x + 4, it.y + 5, Math.max(1, Math.round(k)), 2, P.violet);
  rect(ctx, it.x + 4, it.y + 10, it.w - 12, 1, P.lavender);
}

/** Vent fan: four blades turning slowly inside a round housing. */
export function drawFan(ctx: Ctx, it: WallItem, t: number) {
  const cx = it.x + it.w / 2, cy = it.y + it.h / 2, r = it.w / 2 - 5;
  const a0 = t * 2.2;
  for (let b = 0; b < 4; b++) {
    const a = a0 + (b * Math.PI) / 2;
    for (let k = 1; k <= r; k++) {
      rect(ctx, Math.round(cx + Math.cos(a) * k), Math.round(cy + Math.sin(a) * k), 2, 2, P.lavenderSoft);
    }
  }
  rect(ctx, cx - 2, cy - 2, 4, 4, P.navyDeep);
}
