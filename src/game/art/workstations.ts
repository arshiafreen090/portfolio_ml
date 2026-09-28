// The five Project Lab workstations. Each project gets its own kind of
// equipment rather than five copies of one cabinet:
//
//   eta     logistics desk — two monitors (route map + ETA board), parcels
//   meal    forecast tower — tall cabinet, demand chart, forecast calendar
//   heart   diagnostic pod — capsule with a side console, faces left
//   tiny    tinker bench   — workbench with a little robot and a terminal, faces right
//   resync  ReSync terminal — under construction: scaffold poles, "IN DEV" plate
//
// Static bodies are cached; screens animate and wake up with proximity (`on`).

import type { ProjectId } from '../../data/types';
import type { Interactable } from '../world/shipMap';
import { disc, dot, ellipse, frame, glow, line, makeCanvas, pixelText, rect, type Ctx } from './pixel';
import { MACHINE_COLOR, P } from './theme';

const cache = new Map<string, HTMLCanvasElement>();
function body(key: string, w: number, h: number, draw: (ctx: Ctx) => void) {
  let c = cache.get(key);
  if (!c) {
    const [img, ctx] = makeCanvas(w, h);
    draw(ctx);
    c = img;
    cache.set(key, c);
  }
  return c;
}

type Screen = (ctx: Ctx, x: number, y: number, w: number, h: number, t: number) => void;

/** Screen that is dim when Tobby is away and lights up as he approaches. */
function screen(ctx: Ctx, x: number, y: number, w: number, h: number, on: number, t: number, fn: Screen) {
  rect(ctx, x, y, w, h, P.screenOff);
  for (let k = 0; k < Math.min(10, h / 2); k++) rect(ctx, x + 6 + k, y + h - 3 - k * 2, 1, 2, 'rgba(255,255,255,0.08)');
  const a = 0.22 + on * 0.78;
  ctx.save();
  ctx.globalAlpha = a;
  rect(ctx, x, y, w, h, P.screen);
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  fn(ctx, x, y, w, h, t * (0.4 + on * 0.6));
  ctx.restore();
}

// ------------------------------------------------------------------ screen contents

const etaMap: Screen = (ctx, x, y, w, h, t) => {
  for (let gx = x + 3; gx < x + w; gx += 6) rect(ctx, gx, y, 1, h, P.screenLine);
  for (let gy = y + 3; gy < y + h; gy += 6) rect(ctx, x, gy, w, 1, P.screenLine);
  const pts = [[0.1, 0.8], [0.32, 0.76], [0.4, 0.46], [0.62, 0.42], [0.7, 0.22], [0.86, 0.2]].map(([a, b]) => [x + a * w, y + b * h]);
  for (let i = 0; i < pts.length - 1; i++) line(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], P.lavender);
  const k = (t * 0.22) % 1, seg = k * (pts.length - 1), si = Math.floor(seg), f = seg - si;
  const cx = pts[si][0] + (pts[si + 1][0] - pts[si][0]) * f, cy = pts[si][1] + (pts[si + 1][1] - pts[si][1]) * f;
  rect(ctx, pts[0][0] - 2, pts[0][1] - 2, 4, 4, P.cyan); // dark store
  rect(ctx, cx - 1, cy - 1, 3, 3, P.peach); // courier
  disc(ctx, pts[5][0], pts[5][1] - 2, 3, P.pink); dot(ctx, pts[5][0], pts[5][1] - 2, P.paper);
};

const etaBoard: Screen = (ctx, x, y, w, h, t) => {
  const hi = Math.floor(t * 0.8) % 4;
  for (let i = 0; i < 4; i++) {
    const ry = y + 3 + i * 6;
    if (i === hi) rect(ctx, x + 1, ry - 1, w - 2, 6, P.screenLine);
    rect(ctx, x + 3, ry, 3, 3, [P.peach, P.cyan, P.mint, P.pink][i]);
    rect(ctx, x + 8, ry + 1, [14, 20, 10, 17][i], 2, P.lavender);
    rect(ctx, x + w - 8, ry, 5, 3, i === hi ? P.peach : P.lavenderDeep);
  }
  void h;
};

const mealChart: Screen = (ctx, x, y, w, h, t) => {
  const n = 8, bw = Math.floor((w - 8) / n) - 1;
  for (let i = 0; i < n; i++) {
    const v = [12, 16, 13, 19, 17, 22, 20, 24][i] * (h / 44);
    const bh = Math.round(v + Math.sin(t * 1.2 + i) * 1.5);
    const future = i >= 6;
    rect(ctx, x + 4 + i * (bw + 1), y + h - 4 - bh, bw, bh, future ? P.cyanDeep : P.cyan);
  }
  // forecast region + line
  rect(ctx, x + 4 + 6 * (bw + 1) - 1, y + 3, 1, h - 6, P.lavenderDeep);
  let px = x + 6, py = y + h * 0.55;
  for (let i = 1; i < n; i++) {
    const nx = x + 6 + i * (bw + 1), ny = y + h * 0.55 - i * (h * 0.05) + Math.round(Math.sin(t + i) * 1.5);
    if (i < 7) line(ctx, px, py, nx, ny, P.peach);
    else if (Math.floor(t * 3) % 2 === 0) dot(ctx, nx, ny, P.peach, 2);
    px = nx; py = ny;
  }
  rect(ctx, x + 3, y + h - 4, w - 6, 1, P.lavender);
};

const heartScreen: Screen = (ctx, x, y, w, h, t) => {
  const my = y + h * 0.6;
  const wave = (i: number) => {
    const p = (i + Math.floor(t * 22)) % 26;
    if (p === 8) return -2; if (p === 11) return -10; if (p === 12) return 5; if (p === 13) return -2;
    if (p > 17 && p < 20) return -2;
    return 0;
  };
  let prev = my + wave(0);
  for (let i = 1; i < w - 3; i++) {
    const cur = my + wave(i);
    line(ctx, x + 1 + i - 1, prev, x + 1 + i, cur, P.pink);
    prev = cur;
  }
  const beat = (t * 1.2) % 1 < 0.15 ? 1 : 0;
  const hx = x + w - 9, hy = y + 4;
  disc(ctx, hx - 2, hy + 2, 2 + beat, P.pink); disc(ctx, hx + 2, hy + 2, 2 + beat, P.pink);
  rect(ctx, hx - 3 - beat, hy + 3, 7 + beat * 2, 2, P.pink); rect(ctx, hx - 1, hy + 5 + beat, 3, 2, P.pink);
  // two small evaluation bars (no numbers — those live in the popup)
  rect(ctx, x + 3, y + 4, 16, 2, P.screenLine); rect(ctx, x + 3, y + 4, 14, 2, P.mint);
  rect(ctx, x + 3, y + 8, 16, 2, P.screenLine); rect(ctx, x + 3, y + 8, 13, 2, P.cyan);
};

const tinyTerminal: Screen = (ctx, x, y, w, h, t) => {
  const lines = [[16, P.mint], [24, P.cyan], [12, P.peach], [20, P.mint]] as const;
  const shown = Math.floor(t * 1.6) % (lines.length + 2);
  for (let i = 0; i < Math.min(shown, lines.length); i++) {
    rect(ctx, x + 3, y + 3 + i * 5, 2, 2, P.lavenderDeep);
    rect(ctx, x + 7, y + 3 + i * 5, Math.min(lines[i][0], w - 10), 2, lines[i][1]);
  }
  if (Math.floor(t * 3) % 2 === 0) rect(ctx, x + 7, y + 3 + Math.min(shown, lines.length - 1) * 5 + 4, 3, 2, P.paper);
  void h;
};

const resyncScreen: Screen = (ctx, x, y, w, h, t) => {
  const pw = Math.round(w * 0.3);
  // resume page
  rect(ctx, x + 3, y + 3, pw, h - 6, P.paper);
  for (let i = 0; i < 6; i++) rect(ctx, x + 6, y + 7 + i * 5, i % 2 ? pw - 10 : pw - 6, 2, P.lavender);
  rect(ctx, x + 4, y + 4 + ((t * 12) % (h - 10)), pw - 2, 2, 'rgba(127,214,238,0.8)');
  // job description page
  const jx = x + w - pw - 3;
  rect(ctx, jx, y + 3, pw, h - 6, P.lavenderSoft);
  for (let i = 0; i < 6; i++) rect(ctx, jx + 3, y + 7 + i * 5, i % 3 ? pw - 8 : pw - 12, 2, P.lavenderDeep);
  // matching in the middle
  const mx = x + pw + 6, mw = w - pw * 2 - 12;
  const k = Math.floor(t * 1.2) % 4;
  for (let i = 0; i < 3; i++) rect(ctx, mx, y + 6 + i * 6, mw, 3, i < k ? P.mint : P.screenLine);
  rect(ctx, mx, y + h - 9, mw, 3, P.screenLine);
  rect(ctx, mx, y + h - 9, Math.round(mw * Math.min(1, (t * 0.3) % 1.2)), 3, P.peach);
};

// ------------------------------------------------------------------ bodies

function etaBody(w: number, h: number) {
  return body('ws-eta', w, h, (c) => {
    const col = MACHINE_COLOR.eta;
    // parcels on the floor
    frame(c, w - 26, h - 26, 24, 24, P.peachSoft, P.navyDeep, 1, 1);
    rect(c, w - 15, h - 25, 2, 22, P.peach); rect(c, w - 25, h - 15, 22, 2, P.peach);
    frame(c, w - 22, h - 40, 16, 14, P.woodLight, P.navyDeep, 1, 1);
    rect(c, w - 15, h - 39, 2, 12, P.woodDeep);
    // desk
    rect(c, 0, 52, w - 28, 8, P.navyDeep);
    rect(c, 1, 53, w - 30, 6, P.wood); rect(c, 1, 53, w - 30, 1, P.woodLight);
    frame(c, 4, 60, 38, h - 62, P.hull, P.navyDeep, 1, 1);
    rect(c, 8, 70, 30, 1, P.navyDeep); rect(c, 8, 82, 30, 1, P.navyDeep);
    rect(c, 20, 65, 6, 2, col.main); rect(c, 20, 76, 6, 2, col.main);
    rect(c, w - 36, 60, 4, h - 62, P.navy);
    rect(c, 42, 64, w - 78, 3, P.lavender);
    // monitors
    frame(c, 6, 10, 50, 38, P.navy, P.navyDeep, 2, 1);
    rect(c, 29, 48, 4, 5, P.navyDeep);
    frame(c, 60, 16, 40, 32, P.navy, P.navyDeep, 2, 1);
    rect(c, 78, 48, 4, 5, P.navyDeep);
    // keyboard + mug
    rect(c, 28, 50, 40, 3, P.lavenderSoft); rect(c, 28, 52, 40, 1, P.navy);
    rect(c, 86, 44, 7, 8, P.navyDeep); rect(c, 87, 45, 5, 6, col.main); rect(c, 92, 46, 2, 3, P.navyDeep);
  });
}

function mealBody(w: number, h: number) {
  return body('ws-meal', w, h, (c) => {
    const col = MACHINE_COLOR.meal;
    frame(c, 4, 10, w - 8, h - 16, P.hull, P.navyDeep, 3, 2);
    rect(c, 7, 14, 2, h - 26, P.hullLight);
    rect(c, w - 14, 14, 6, h - 26, P.hullShade);
    // crown
    frame(c, 8, 0, w - 16, 16, col.main, P.navyDeep, 3, 2);
    rect(c, 12, 3, w - 24, 2, P.paper);
    // calendar-grid icon on the crown
    frame(c, w / 2 - 8, 2, 16, 12, P.paper, P.navyDeep, 0, 1);
    for (let i = 0; i < 3; i++) rect(c, w / 2 - 5 + i * 4, 7, 2, 2, P.navyDeep);
    // big chart bezel
    frame(c, 9, 18, w - 18, 48, P.navy, P.navyDeep, 2, 1);
    // forecast calendar panel
    frame(c, 9, 70, w - 18, 24, P.lavenderSoft, P.navyDeep, 1, 1);
    // inventory drawers
    for (let i = 0; i < 2; i++) {
      frame(c, 10 + i * 34, 98, 32, 14, P.hull, P.navyDeep, 0, 1);
      rect(c, 22 + i * 34, 103, 8, 2, col.deep);
    }
    rect(c, 2, h - 6, w - 4, 6, P.navyDeep); rect(c, 4, h - 5, w - 8, 3, P.lavender);
  });
}

function heartBody(w: number, h: number) {
  return body('ws-heart', w, h, (c) => {
    const col = MACHINE_COLOR.heart;
    // capsule pod
    ellipse(c, 60, h - 8, 30, 6, P.navyDeep);
    frame(c, 30, 18, 60, h - 26, P.paper, P.navyDeep, 10, 2);
    rect(c, 36, 24, 48, 4, P.pinkSoft);
    rect(c, 80, 30, 6, h - 44, P.hullShade);
    // scanner ring on top
    ellipse(c, 60, 20, 30, 7, P.navyDeep);
    ellipse(c, 60, 20, 28, 5, P.lavender);
    ellipse(c, 60, 20, 22, 3, P.lavenderSoft);
    // window + heart emblem
    frame(c, 40, 34, 40, 20, P.cyanSoft, P.navyDeep, 3, 1);
    rect(c, 44, 38, 16, 2, P.paper);
    const hx = 60, hy = 64;
    disc(c, hx - 4, hy, 4, P.navyDeep); disc(c, hx + 4, hy, 4, P.navyDeep);
    rect(c, hx - 8, hy, 16, 3, P.navyDeep); rect(c, hx - 6, hy + 3, 12, 3, P.navyDeep); rect(c, hx - 3, hy + 6, 6, 3, P.navyDeep);
    disc(c, hx - 4, hy, 3, col.main); disc(c, hx + 4, hy, 3, col.main);
    rect(c, hx - 7, hy, 14, 3, col.main); rect(c, hx - 5, hy + 3, 10, 2, col.main); rect(c, hx - 2, hy + 5, 4, 3, col.main);
    // side console facing left
    rect(c, 18, 48, 4, h - 52, P.navy);
    rect(c, 10, h - 6, 20, 4, P.navyDeep);
    frame(c, 0, 8, 44, 40, P.navy, P.navyDeep, 2, 1);
    rect(c, 22, 48, 10, 3, P.lavenderDeep);
  });
}

function tinyBody(w: number, h: number) {
  return body('ws-tiny', w, h, (c) => {
    const col = MACHINE_COLOR.tiny;
    // bench
    rect(c, 0, 36, w, 8, P.navyDeep);
    rect(c, 1, 37, w - 2, 6, P.wood); rect(c, 1, 37, w - 2, 1, P.woodLight);
    rect(c, 4, 44, 4, h - 44, P.woodDeep); rect(c, w - 8, 44, 4, h - 44, P.woodDeep);
    rect(c, 4, h - 14, w - 8, 3, P.woodDeep);
    frame(c, 14, h - 11, 22, 10, col.main, P.navyDeep, 0, 1);
    rect(c, 22, h - 13, 6, 2, P.navyDeep);
    // little robot
    frame(c, 10, 16, 24, 20, P.lavender, P.navyDeep, 2, 1);
    frame(c, 12, 2, 20, 15, P.lavenderSoft, P.navyDeep, 2, 1);
    rect(c, 21, -1, 2, 4, P.navy);
    rect(c, 4, 22, 6, 3, P.navy); rect(c, 34, 22, 6, 3, P.navy);
    frame(c, 15, 20, 14, 9, P.screen, P.navyDeep, 0, 1);
    // monitor on the right end (faces the right-hand side of the room)
    frame(c, w - 50, 4, 44, 30, P.navy, P.navyDeep, 2, 1);
    rect(c, w - 30, 34, 4, 3, P.navyDeep);
    // wires + soldering bits
    line(c, 34, 30, w - 50, 30, P.violet);
    rect(c, 52, 32, 8, 4, P.navyDeep); rect(c, 53, 33, 6, 2, P.peach);
  });
}

function resyncBody(w: number, h: number) {
  return body('ws-resync', w, h, (c) => {
    const col = MACHINE_COLOR.resync;
    // console
    frame(c, 12, 40, w - 24, h - 46, P.hull, P.navyDeep, 3, 2);
    rect(c, 15, 44, 2, h - 56, P.hullLight);
    rect(c, w - 20, 44, 5, h - 56, P.hullShade);
    frame(c, 20, 58, w - 40, 8, P.lavenderSoft, P.navyDeep, 0, 1);
    for (let i = 0; i < 7; i++) rect(c, 23 + i * 8, 60, 5, 3, P.lavender);
    // big screen
    frame(c, 12, 2, w - 24, 52, P.navy, P.navyDeep, 2, 1);
    rect(c, 14, 3, w - 28, 2, col.main);
    // "IN DEV" plate
    frame(c, w / 2 - 20, 74, 40, 12, P.navy, P.navyDeep, 1, 1);
    pixelText(c, 'IN DEV', w / 2, 74, P.peach, 8, 'center');
    // hazard base
    rect(c, 8, h - 6, w - 16, 6, P.navyDeep);
    for (let x = 10; x < w - 10; x += 8) { rect(c, x, h - 5, 4, 3, P.peach); rect(c, x + 4, h - 5, 4, 3, P.navy); }
    // scaffold poles + crossbar
    for (const px of [2, w - 6]) {
      rect(c, px, 0, 4, h, P.navyDeep);
      for (let y = 1; y < h; y += 8) rect(c, px + 1, y, 2, 4, P.peach);
    }
    rect(c, 2, 0, w - 4, 3, P.navyDeep); rect(c, 3, 1, w - 6, 1, P.lavender);
  });
}

// ------------------------------------------------------------------ draw

const topLeft = (it: Interactable) => ({ x: Math.round(it.base.x - it.size.w / 2), y: Math.round(it.base.y - it.size.h) });

export function drawWorkstation(ctx: Ctx, it: Interactable, on: number, t: number) {
  const id = it.refId as ProjectId;
  const { x, y } = topLeft(it);
  const { w, h } = it.size;
  ellipse(ctx, it.base.x, it.base.y - 1, w / 2 + 4, 5, 'rgba(31,37,80,0.18)');
  const blink = Math.floor(t * 2 + x) % 3;
  switch (id) {
    case 'eta':
      ctx.drawImage(etaBody(w, h), x, y);
      screen(ctx, x + 9, y + 13, 44, 32, on, t, etaMap);
      screen(ctx, x + 63, y + 19, 34, 26, on, t, etaBoard);
      break;
    case 'meal': {
      ctx.drawImage(mealBody(w, h), x, y);
      screen(ctx, x + 12, y + 21, w - 24, 42, on, t, mealChart);
      // forecast calendar: 10 cells light up week by week
      const lit = Math.floor(t * (1 + on * 2)) % 11;
      for (let i = 0; i < 14; i++) {
        const cx = x + 13 + (i % 7) * 9, cy = y + 74 + Math.floor(i / 7) * 9;
        rect(ctx, cx, cy, 7, 7, i < 4 ? P.lavender : i - 4 < lit ? P.cyan : P.paper);
      }
      break;
    }
    case 'heart':
      ctx.drawImage(heartBody(w, h), x, y);
      screen(ctx, x + 3, y + 11, 38, 34, on, t, heartScreen);
      rect(ctx, x + 50, y + 18, 4, 3, on > 0.3 && blink === 0 ? P.pink : P.lavender);
      rect(ctx, x + 66, y + 18, 4, 3, on > 0.3 && blink === 1 ? P.cyan : P.lavender);
      break;
    case 'tiny': {
      ctx.drawImage(tinyBody(w, h), x, y);
      screen(ctx, x + w - 47, y + 7, 38, 24, on, t, tinyTerminal);
      // robot's eyes blink, chest waveform follows the "voice"
      const eyes = Math.floor(t * 0.7) % 6 === 0 ? P.navy : P.cyan;
      rect(ctx, x + 16, y + 7, 3, 3, eyes); rect(ctx, x + 25, y + 7, 3, 3, eyes);
      for (let i = 0; i < 12; i++) {
        const a = Math.round(Math.abs(Math.sin(t * 6 + i * 0.9)) * (1 + on * 2));
        rect(ctx, x + 16 + i, y + 24 - a, 1, 1 + a * 2, P.mint);
      }
      break;
    }
    case 'resync':
      ctx.drawImage(resyncBody(w, h), x, y);
      screen(ctx, x + 15, y + 6, w - 30, 46, on, t, resyncScreen);
      if (Math.floor(t * 1.5) % 2 === 0) rect(ctx, x + w / 2 + 16, y + 78, 2, 2, P.pink);
      break;
  }
}

export function drawWorkstationGlow(ctx: Ctx, it: Interactable, on: number) {
  const c = MACHINE_COLOR[it.refId as ProjectId].main;
  glow(ctx, it.base.x, it.base.y + 6, it.size.w * 0.75, 16, c, 0.06 + on * 0.3);
}
