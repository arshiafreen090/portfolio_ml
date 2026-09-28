// Procedural ship shell — the static layer under everything that moves.
//
// Rendered ONCE into an offscreen canvas at 1 world unit = 1 pixel, then drawn
// every frame with nearest-neighbour scaling. Contains: exterior structure
// (trusses, antennas, engines, cockpit glass), hull plating, corridor floors,
// every room's floor + back wall + fixed wall fittings, baked lighting, room
// signs. Windows are cut out (transparent) so the live space backdrop shows
// through them.
//
// Animated things (screens, blinking lights, doors, hologram…) are NOT here —
// the shell only reports where they are.

import { floorItems, wallItems, type FloorItem, type WallItem } from '../world/decor';
import { corridors, rooms, spines, WALL, WORLD, type Rect, type Room } from '../world/shipMap';
import {
  box, disc, dither, dot, ellipse, ellipseLine, frame, glow, line, makeCanvas, mix, pixelText, rect, rng, textWidth, type Ctx,
} from './pixel';
import { P, THEMES } from './theme';

export const SHELL_MARGIN = 90;

export interface Blinker { x: number; y: number; color: string; period: number; phase: number; size: number }
export interface Nozzle { x: number; y: number; h: number }

export interface ShellArt {
  canvas: HTMLCanvasElement;
  /** offset of world (0,0) inside the canvas */
  margin: number;
  blinkers: Blinker[];
  nozzles: Nozzle[];
}

type Cut =
  | { kind: 'rect'; r: Rect }
  /** `maxX`: only cut left of this x (the cockpit glass stops at the floor) */
  | { kind: 'ellipse'; x: number; y: number; rx: number; ry: number; maxX?: number };

const HULL_PAD = 20;

const grow = (r: Rect, n: number): Rect => ({ x: r.x - n, y: r.y - n, w: r.w + n * 2, h: r.h + n * 2 });

export function buildShell(): ShellArt {
  const M = SHELL_MARGIN;
  const [canvas, ctx] = makeCanvas(WORLD.w + M * 2, WORLD.h + M * 2);
  ctx.translate(M, M);
  const blinkers: Blinker[] = [];
  const cuts: Cut[] = [];
  const nozzles: Nozzle[] = [];

  drawExteriorBack(ctx, blinkers, nozzles);
  drawHull(ctx, blinkers);
  drawCockpitNose(ctx, cuts, blinkers);
  for (const c of corridors) drawCorridor(ctx, c, spines.includes(c));
  for (const room of rooms) drawRoom(ctx, room, cuts);
  cutWindows(ctx, cuts);
  for (const room of rooms) drawRoomSign(ctx, room);

  return { canvas, margin: M, blinkers, nozzles };
}

// ------------------------------------------------------------------ exterior

function truss(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, width = 8) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const nx = (-(y1 - y0) / len) * (width / 2), ny = ((x1 - x0) / len) * (width / 2);
  // navy shadow line 1px under each lavender rail
  for (const [c, o] of [[P.navyDeep, 1], [P.lavenderDeep, 0]] as const) {
    for (const s of [-1, 1]) line(ctx, x0 + nx * s, y0 + ny * s + o, x1 + nx * s, y1 + ny * s + o, c);
  }
  const steps = Math.floor(len / 12);
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps, t1 = (i + 1) / steps;
    const ax = x0 + (x1 - x0) * t0, ay = y0 + (y1 - y0) * t0;
    const bx = x0 + (x1 - x0) * t1, by = y0 + (y1 - y0) * t1;
    line(ctx, ax + nx, ay + ny, bx - nx, by - ny, P.lavenderDeep);
  }
}

function antenna(ctx: Ctx, x: number, y: number, h: number, blinkers: Blinker[], dish = true) {
  rect(ctx, x - 2, y - h, 4, h, P.navyDeep);
  rect(ctx, x - 1, y - h, 2, h, P.lavender);
  if (dish) {
    ellipse(ctx, x + 6, y - h + 6, 9, 5, P.navyDeep);
    ellipse(ctx, x + 6, y - h + 6, 8, 4, P.hullLight);
    ellipse(ctx, x + 7, y - h + 7, 5, 2, P.hullShade);
    rect(ctx, x + 6, y - h - 2, 1, 8, P.navyDeep);
  }
  blinkers.push({ x: x - 1, y: y - h - 4, color: P.pink, period: 2.4, phase: x % 7, size: 3 });
}

function drawExteriorBack(ctx: Ctx, blinkers: Blinker[], nozzles: Nozzle[]) {
  // structural trusses between modules
  truss(ctx, 330, 352, 512, 236);
  truss(ctx, 330, 748, 552, 880);
  truss(ctx, 1150, 150, 1190, 322, 6);
  truss(ctx, 1590, 322, 1612, 160, 6);
  truss(ctx, 1110, 1000, 1180, 800, 6);
  truss(ctx, 1600, 800, 1660, 1000, 6);

  // antennas
  antenna(ctx, 640, 20, 44, blinkers);
  antenna(ctx, 2160, 20, 36, blinkers, false);
  antenna(ctx, 1548, 310, 30, blinkers, false);

  // engine block at the tail
  const ex = 2214, ey = 486;
  frame(ctx, ex, ey, 78, 158, P.hull, P.navyDeep, 6, 2);
  rect(ctx, ex + 4, ey + 4, 70, 3, P.hullLight);
  rect(ctx, ex + 4, ey + 146, 70, 6, P.hullShade);
  for (let i = 0; i < 5; i++) rect(ctx, ex + 14, ey + 30 + i * 22, 44, 2, P.hullShade);
  rect(ctx, ex + 60, ey + 20, 8, 118, P.lavender);
  rect(ctx, ex + 60, ey + 20, 1, 118, P.navyDeep);
  for (const ny of [ey + 18, ey + 64, ey + 110]) {
    // nozzle bell
    for (let i = 0; i < 26; i++) {
      const hh = 26 + Math.round(i * 0.5);
      rect(ctx, ex + 76 + i, ny + 15 - hh / 2, 1, hh, i < 2 || i > 23 ? P.navyDeep : i < 8 ? P.lavenderDeep : P.navy);
    }
    rect(ctx, ex + 76, ny + 2, 26, 1, P.navyDeep);
    nozzles.push({ x: ex + 102, y: ny + 15, h: 34 });
  }
  blinkers.push({ x: ex + 30, y: ey + 8, color: P.peach, period: 1.6, phase: 0.3, size: 3 });
}

// ------------------------------------------------------------------ hull

function hullShapes(): Rect[] {
  return [...rooms.map((r) => r.rect), ...corridors];
}

function drawHull(ctx: Ctx, blinkers: Blinker[]) {
  const shapes = hullShapes();
  for (const s of shapes) { const e = grow(s, HULL_PAD); box(ctx, e.x, e.y, e.w, e.h, P.navyDeep, 8); }
  for (const s of shapes) { const e = grow(s, HULL_PAD - 2); box(ctx, e.x, e.y, e.w, e.h, P.hull, 7); }
  for (const s of shapes) {
    const e = grow(s, HULL_PAD - 2);
    // lit top edge, shaded underside
    rect(ctx, e.x + 7, e.y + 1, e.w - 14, 2, P.hullLight);
    rect(ctx, e.x + 5, e.y + e.h - 5, e.w - 10, 4, P.hullShade);
    rect(ctx, e.x + 1, e.y + 8, 2, e.h - 16, P.hullLight);
    rect(ctx, e.x + e.w - 3, e.y + 8, 2, e.h - 16, P.hullShade);
    // plate seams + rivets on the ring
    for (let x = e.x + 40; x < e.x + e.w - 20; x += 48) {
      rect(ctx, x, e.y + 3, 1, 14, P.hullShade);
      rect(ctx, x, e.y + e.h - 17, 1, 12, P.hullDark);
      dot(ctx, x + 6, e.y + 9, P.hullDark);
      dot(ctx, x + 6, e.y + e.h - 11, P.hullDark);
    }
    for (let y = e.y + 40; y < e.y + e.h - 20; y += 48) {
      rect(ctx, e.x + 3, y, 14, 1, P.hullShade);
      rect(ctx, e.x + e.w - 17, y, 14, 1, P.hullShade);
    }
  }
  // lavender trim + navy inner frame around each interior
  for (const s of shapes) { const e = grow(s, 6); box(ctx, e.x, e.y, e.w, e.h, P.lavender, 3); }
  for (const s of shapes) { const e = grow(s, 3); box(ctx, e.x, e.y, e.w, e.h, P.navyDeep, 2); }

  // running lights on the outer corners of the big modules
  for (const r of rooms) {
    if (r.id === 'cockpit' || r.id === 'hub') continue;
    const e = grow(r.rect, HULL_PAD - 8);
    const top = r.rect.y < 300;
    const y = top ? e.y : e.y + e.h - 2;
    blinkers.push({ x: e.x + 14, y, color: top ? P.pink : P.cyan, period: 3, phase: r.rect.x / 300, size: 3 });
    blinkers.push({ x: e.x + e.w - 17, y, color: top ? P.pink : P.cyan, period: 3, phase: r.rect.x / 300 + 1.5, size: 3 });
  }
}

function drawCockpitNose(ctx: Ctx, cuts: Cut[], blinkers: Blinker[]) {
  const cx = 78, cy = 550, rx = 74, ry = 176;
  // thick canopy frame: navy / cream hull / lavender trim / navy
  ellipse(ctx, cx, cy, rx + 12, ry + 12, P.navyDeep);
  ellipse(ctx, cx, cy, rx + 10, ry + 10, P.hull);
  ellipse(ctx, cx - 2, cy + 2, rx + 8, ry + 8, P.hullShade);
  ellipse(ctx, cx, cy, rx + 5, ry + 5, P.lavender);
  ellipse(ctx, cx, cy, rx + 2, ry + 2, P.navyDeep);
  cuts.push({ kind: 'ellipse', x: cx, y: cy, rx: rx - 2, ry: ry - 2, maxX: 76 });
  blinkers.push({ x: cx - rx - 4, y: cy - 1, color: P.pink, period: 2, phase: 0, size: 3 });
}

// ------------------------------------------------------------------ corridors

function drawCorridor(ctx: Ctx, c: Rect, isSpine: boolean) {
  rect(ctx, c.x, c.y, c.w, c.h, P.corridor);
  if (isSpine) {
    // back wall strip with warm lamps
    const wallH = 16;
    rect(ctx, c.x, c.y, c.w, wallH, P.lavenderSoft);
    rect(ctx, c.x, c.y + wallH - 3, c.w, 3, P.lavender);
    rect(ctx, c.x, c.y, c.w, 1, P.navyDeep);
    for (let x = c.x + 32; x < c.x + c.w - 8; x += 64) {
      rect(ctx, x, c.y + 4, 8, 4, P.navyDeep);
      rect(ctx, x + 1, c.y + 5, 6, 2, P.warm);
      glow(ctx, x + 4, c.y + wallH + 6, 26, 10, P.warm, 0.18);
    }
    // floor plates
    const fy = c.y + wallH;
    for (let x = c.x; x < c.x + c.w; x += 32) rect(ctx, x, fy, 1, c.h - wallH, P.corridorDeep);
    rect(ctx, c.x, fy + 18, c.w, 1, P.corridorDeep);
    rect(ctx, c.x, c.y + c.h - 20, c.w, 1, P.corridorDeep);
    for (let x = c.x + 4; x < c.x + c.w; x += 32) {
      dot(ctx, x, fy + 3, P.corridorLine); dot(ctx, x + 24, fy + 3, P.corridorLine);
    }
    // centre light strip (animated pulses are drawn on top by the engine)
    const my = Math.round(fy + (c.h - wallH) / 2) - 1;
    for (let x = c.x + 6; x < c.x + c.w - 6; x += 12) rect(ctx, x, my, 7, 2, '#8ec9e6');
    // front rail
    rect(ctx, c.x, c.y + c.h - 4, c.w, 3, P.rail);
    rect(ctx, c.x, c.y + c.h - 1, c.w, 1, P.navyDeep);
  } else {
    for (let y = c.y; y < c.y + c.h; y += 30) rect(ctx, c.x, y, c.w, 1, P.corridorDeep);
    rect(ctx, c.x, c.y, 4, c.h, P.rail);
    rect(ctx, c.x + c.w - 4, c.y, 4, c.h, P.rail);
    const mx = Math.round(c.x + c.w / 2) - 1;
    for (let y = c.y + 6; y < c.y + c.h - 6; y += 12) rect(ctx, mx, y, 2, 7, '#8ec9e6');
  }
}

// ------------------------------------------------------------------ rooms

function drawFloor(ctx: Ctx, room: Room) {
  const t = THEMES[room.id];
  const { x, y, w, h } = room.rect;
  const fy = y + WALL, fh = h - WALL;
  rect(ctx, x, fy, w, fh, t.floorA);
  const s = t.tile;
  switch (t.pattern) {
    case 'tiles':
    case 'checker':
    case 'hub': {
      for (let ty = 0; ty * s < fh; ty++) {
        for (let tx = 0; tx * s < w; tx++) {
          const px = x + tx * s, py = fy + ty * s;
          if ((tx + ty) % 2 === 1) rect(ctx, px, py, Math.min(s, x + w - px), Math.min(s, fy + fh - py), t.floorB);
          rect(ctx, px, py, 1, Math.min(s, fy + fh - py), t.floorLine);
          rect(ctx, px, py, Math.min(s, x + w - px), 1, t.floorLine);
          if (t.pattern !== 'checker') dot(ctx, px + 2, py + 2, t.floorLine);
          if (t.pattern === 'checker') rect(ctx, px + 1, py + 1, Math.min(s, x + w - px) - 1, 1, P.paper);
        }
      }
      break;
    }
    case 'planks': {
      const r = rng(room.rect.x);
      for (let py = fy; py < fy + fh; py += s) {
        rect(ctx, x, py, w, 1, t.floorLine);
        let px = x - Math.floor(r() * 60);
        while (px < x + w) {
          const len = 60 + Math.floor(r() * 50);
          if (px > x) rect(ctx, px, py, 1, s, t.floorLine);
          if (r() < 0.35) rect(ctx, Math.max(x, px + 4), py + 1, Math.min(len - 8, x + w - px - 4), 1, t.floorB);
          if (r() < 0.15) dot(ctx, px + len / 2, py + s / 2, t.floorLine);
          px += len;
        }
      }
      break;
    }
    case 'carpet': {
      dither(ctx, x, fy, w, fh, t.floorB);
      frame(ctx, x + 10, fy + 10, w - 20, fh - 20, t.floorA, t.floorLine, 3, 2);
      dither(ctx, x + 12, fy + 12, w - 24, fh - 24, t.floorB, 1);
      break;
    }
  }
}

function drawFloorItem(ctx: Ctx, f: FloorItem) {
  const tone = {
    lavender: [P.lavender, P.lavenderSoft, P.violet],
    blue: [P.blue, P.blueSoft, P.blueDeep],
    peach: [P.peach, P.peachSoft, P.peachDeep],
    pink: [P.pinkSoft, '#fbe6ec', P.pink],
  }[f.color ?? 'lavender'] ?? [P.lavender, P.lavenderSoft, P.violet];
  switch (f.kind) {
    case 'rug': {
      frame(ctx, f.x, f.y, f.w, f.h, tone[0], tone[2], 4, 2);
      frame(ctx, f.x + 6, f.y + 6, f.w - 12, f.h - 12, tone[1], tone[0], 3, 1);
      // woven stripes
      for (let y = f.y + 12; y < f.y + f.h - 10; y += 6) rect(ctx, f.x + 10, y, f.w - 20, 2, mixTone(tone[1], tone[0]));
      for (let x = f.x + 12; x < f.x + f.w - 12; x += 8) dot(ctx, x, f.y + 3, tone[1]);
      for (let x = f.x + 12; x < f.x + f.w - 12; x += 8) dot(ctx, x, f.y + f.h - 4, tone[1]);
      // small planet emblem
      const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
      ellipseLine(ctx, cx, cy, 22, 6, tone[2]);
      disc(ctx, cx, cy, 10, tone[0]);
      disc(ctx, cx - 3, cy - 3, 4, tone[1]);
      ellipseLine(ctx, cx, cy, 22, 6, tone[2], 0, Math.PI);
      break;
    }
    case 'roundRug': {
      const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
      ellipse(ctx, cx, cy, f.w / 2, f.h / 2, tone[2]);
      ellipse(ctx, cx, cy, f.w / 2 - 2, f.h / 2 - 2, tone[0]);
      ellipse(ctx, cx, cy, f.w / 2 - 10, f.h / 2 - 8, tone[1]);
      ellipseLine(ctx, cx, cy, f.w / 2 - 16, f.h / 2 - 13, tone[0]);
      break;
    }
    case 'hubRings': {
      const cx = f.x, cy = f.y;
      ellipse(ctx, cx, cy, f.w + 4, f.h + 3, P.lavenderDeep);
      ellipse(ctx, cx, cy, f.w, f.h, P.lavenderSoft);
      ellipse(ctx, cx, cy, f.w - 14, f.h - 9, '#efe9fb');
      ellipseLine(ctx, cx, cy, f.w - 7, f.h - 5, P.peach);
      ellipseLine(ctx, cx, cy, f.w - 30, f.h - 20, P.lavender);
      ellipseLine(ctx, cx, cy, f.w - 52, f.h - 34, P.lavender);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        dot(ctx, cx + Math.cos(a) * (f.w - 20), cy + Math.sin(a) * (f.h - 13), P.lavenderDeep, 2);
      }
      // room indicators: coloured pips on the outer ring pointing at each area
      const pips: [number, string][] = [
        [Math.PI * 1.25, P.peach], [Math.PI * 0.75, P.peachDeep], [Math.PI * 1.75, P.cyan],
        [Math.PI * 0.25, P.pink], [Math.PI, P.lavenderDeep], [0, P.violet],
      ];
      for (const [a, col] of pips) {
        const px = cx + Math.cos(a) * (f.w - 1), py = cy + Math.sin(a) * (f.h - 1);
        rect(ctx, px - 3, py - 2, 6, 4, P.navyDeep);
        rect(ctx, px - 2, py - 1, 4, 2, col);
      }
      break;
    }
    case 'strip': {
      if (f.h > f.w) {
        rect(ctx, f.x - 1, f.y, f.w + 2, f.h, 'rgba(127,214,238,0.25)');
        for (let y = f.y; y < f.y + f.h; y += 10) rect(ctx, f.x, y, f.w, 6, P.cyanSoft);
      } else {
        rect(ctx, f.x, f.y - 1, f.w, f.h + 2, 'rgba(127,214,238,0.25)');
        for (let x = f.x; x < f.x + f.w; x += 10) rect(ctx, x, f.y, 6, f.h, P.cyanSoft);
      }
      break;
    }
    case 'cable': {
      for (let i = 0; i < f.h; i++) {
        const o = Math.round(Math.sin(i / 9) * 1.5);
        dot(ctx, f.x + o, f.y + i, P.navy);
        dot(ctx, f.x + 5 + o, f.y + i, P.violet);
      }
      break;
    }
  }
}

function drawWall(ctx: Ctx, room: Room) {
  const t = THEMES[room.id];
  const { x, y, w } = room.rect;
  rect(ctx, x, y, w, WALL, t.wall);
  // top trim
  rect(ctx, x, y, w, 6, t.wallTrim);
  rect(ctx, x, y + 6, w, 1, P.navyDeep);
  // panels
  for (let px = x + 64; px < x + w; px += 64) {
    rect(ctx, px, y + 10, 1, WALL - 24, t.wallShade);
    dot(ctx, px - 4, y + 12, t.wallShade); dot(ctx, px + 4, y + 12, t.wallShade);
  }
  rect(ctx, x, y + Math.round(WALL * 0.55), w, 1, t.wallShade);
  // baseboard with a dotted accent light strip
  rect(ctx, x, y + WALL - 12, w, 12, t.wallShade);
  rect(ctx, x, y + WALL - 12, w, 1, P.navyDeep);
  for (let px = x + 4; px < x + w - 4; px += 10) rect(ctx, px, y + WALL - 7, 6, 2, t.accent);
  rect(ctx, x, y + WALL - 1, w, 1, P.navyDeep);
}

function drawWallItem(ctx: Ctx, it: WallItem, room: Room, cuts: Cut[]) {
  const t = THEMES[room.id];
  const { x, y, w, h } = it;
  switch (it.kind) {
    case 'window': {
      frame(ctx, x - 4, y - 4, w + 8, h + 8, P.lavender, P.navyDeep, 3, 2);
      rect(ctx, x - 1, y - 1, w + 2, h + 2, P.navyDeep);
      cuts.push({ kind: 'rect', r: { x, y, w, h } });
      // mullions (drawn after the cut by cutWindows via frame colour)
      break;
    }
    case 'porthole': {
      const cx = x + w / 2, cy = y + h / 2, r = w / 2;
      disc(ctx, cx, cy, r + 4, P.navyDeep);
      disc(ctx, cx, cy, r + 2, P.lavender);
      disc(ctx, cx, cy, r, P.navyDeep);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        dot(ctx, cx + Math.cos(a) * (r + 2), cy + Math.sin(a) * (r + 2), P.lavenderDeep, 2);
      }
      cuts.push({ kind: 'ellipse', x: cx, y: cy, rx: r - 1, ry: r - 1 });
      break;
    }
    case 'screen': {
      frame(ctx, x - 4, y - 4, w + 8, h + 8, P.navy, P.navyDeep, 3, 1);
      rect(ctx, x - 2, y - 2, w + 4, 1, P.lavenderDeep);
      rect(ctx, x, y, w, h, P.screen);
      dot(ctx, x - 2, y + h + 1, P.lavender); dot(ctx, x + w + 1, y + h + 1, P.lavender);
      glow(ctx, x + w / 2, y + h + 14, w * 0.6, 10, P.cyan, 0.12);
      break;
    }
    case 'shelf': {
      rect(ctx, x, y + h - 4, w, 4, P.woodDeep);
      rect(ctx, x, y + h - 4, w, 1, P.woodLight);
      rect(ctx, x + 4, y + h, 3, 5, P.navy); rect(ctx, x + w - 7, y + h, 3, 5, P.navy);
      const r = rng(x);
      if (it.variant === 'books') {
        const cols = [P.pink, P.blue, P.peach, P.mint, P.lavenderDeep, P.cyanDeep];
        let bx = x + 4;
        while (bx < x + w - 10) {
          const bw = 4 + Math.floor(r() * 3), bh = 12 + Math.floor(r() * 10);
          const col = cols[Math.floor(r() * cols.length)];
          rect(ctx, bx, y + h - 4 - bh, bw, bh, P.navyDeep);
          rect(ctx, bx + 1, y + h - 3 - bh, bw - 2, bh - 1, col);
          rect(ctx, bx + 1, y + h - 3 - bh + 3, bw - 2, 1, P.paper);
          bx += bw + (r() < 0.2 ? 4 : 0);
        }
        disc(ctx, x + w - 8, y + h - 9, 5, P.leaf);
        rect(ctx, x + w - 11, y + h - 8, 7, 4, P.pot);
      } else {
        // jars of brushes, paint tubes, a small plant
        for (const [jx, col] of [[x + 6, P.cyanSoft], [x + 26, P.pinkSoft], [x + 46, P.peachSoft]] as const) {
          rect(ctx, jx, y + h - 16, 12, 12, P.navyDeep);
          rect(ctx, jx + 1, y + h - 15, 10, 11, col);
          rect(ctx, jx + 3, y + h - 26, 1, 11, P.woodDeep); rect(ctx, jx + 7, y + h - 24, 1, 9, P.woodDeep);
          rect(ctx, jx + 2, y + h - 28, 3, 3, [P.pink, P.blue, P.peach][Math.floor(r() * 3)]);
        }
        rect(ctx, x + 66, y + h - 12, 16, 8, P.navyDeep);
        rect(ctx, x + 67, y + h - 11, 14, 6, P.paper);
        rect(ctx, x + 67, y + h - 11, 4, 6, P.pink);
      }
      break;
    }
    case 'sconce': {
      glow(ctx, x + w / 2, y + 30, 34, 40, t.light, 0.35);
      rect(ctx, x, y, w, h, P.navyDeep);
      rect(ctx, x + 2, y + 2, w - 4, h - 5, P.warm);
      rect(ctx, x + 2, y + h - 3, w - 4, 1, P.peach);
      break;
    }
    case 'vent': {
      frame(ctx, x, y, w, h, t.wallShade, P.navyDeep, 1, 1);
      for (let vy = y + 3; vy < y + h - 2; vy += 3) rect(ctx, x + 3, vy, w - 6, 1, P.navy);
      break;
    }
    case 'frame': {
      frame(ctx, x, y, w, h, P.paper, P.woodDeep, 1, 2);
      if (it.variant === 'plant') {
        rect(ctx, x + w / 2 - 3, y + h - 8, 6, 4, P.pot);
        disc(ctx, x + w / 2, y + h - 12, 5, P.leaf);
      } else {
        rect(ctx, x + 2, y + 2, w - 4, h - 4, P.navy);
        const cx = x + w / 2, cy = y + h / 2;
        rect(ctx, cx - 1, cy - 4, 2, 8, P.warm); rect(ctx, cx - 4, cy - 1, 8, 2, P.warm);
      }
      break;
    }
    case 'sign': {
      frame(ctx, x, y, w, h, P.navy, P.navyDeep, 2, 1);
      pixelText(ctx, it.variant ?? '', x + w / 2, y + 2, P.cream, 9, 'center');
      break;
    }
  }
}

/** Soft warm light pool in the middle, darker corners — gives rooms depth. */
function lightRoom(ctx: Ctx, room: Room) {
  const t = THEMES[room.id];
  const { x, y, w, h } = room.rect;
  const fy = y + WALL, fh = h - WALL;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, fy, w, fh);
  ctx.clip();
  glow(ctx, x + w / 2, fy + fh * 0.45, w * 0.55, fh * 0.6, t.light, 0.22);
  const g = ctx.createRadialGradient(x + w / 2, fy + fh / 2, Math.min(w, fh) * 0.35, x + w / 2, fy + fh / 2, Math.max(w, fh) * 0.75);
  g.addColorStop(0, 'rgba(31,37,80,0)');
  g.addColorStop(1, 'rgba(31,37,80,0.16)');
  ctx.fillStyle = g;
  ctx.fillRect(x, fy, w, fh);
  // contact shadow under the back wall + thin side walls
  rect(ctx, x, fy, w, 4, 'rgba(31,37,80,0.18)');
  rect(ctx, x, fy + 4, w, 4, 'rgba(31,37,80,0.08)');
  ctx.restore();
  rect(ctx, x, fy, 4, fh, THEMES[room.id].wallShade);
  rect(ctx, x + w - 4, fy, 4, fh, THEMES[room.id].wallShade);
}

function drawRoom(ctx: Ctx, room: Room, cuts: Cut[]) {
  drawFloor(ctx, room);
  for (const f of floorItems) {
    const inside = f.x >= room.rect.x - 1 && f.x < room.rect.x + room.rect.w && f.y >= room.rect.y && f.y < room.rect.y + room.rect.h;
    if (inside) drawFloorItem(ctx, f);
  }
  lightRoom(ctx, room);
  drawWall(ctx, room);
  for (const it of wallItems) if (it.room === room.id) drawWallItem(ctx, it, room, cuts);
}

const mixTone = (a: string, b: string) => (a.startsWith('#') && b.startsWith('#') ? mix(a, b, 0.35) : b);

// ------------------------------------------------------------------ windows

function cutWindows(ctx: Ctx, cuts: Cut[]) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (const c of cuts) {
    if (c.kind === 'rect') rect(ctx, c.r.x, c.r.y, c.r.w, c.r.h, '#000');
    else {
      ctx.save();
      if (c.maxX !== undefined) { ctx.beginPath(); ctx.rect(c.x - c.rx - 2, c.y - c.ry - 2, c.maxX - (c.x - c.rx - 2), c.ry * 2 + 4); ctx.clip(); }
      ellipse(ctx, c.x, c.y, c.rx, c.ry, '#000');
      ctx.restore();
    }
  }
  ctx.restore();
  // glass: faint dithered tint + diagonal reflections
  for (const c of cuts) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    if (c.kind === 'rect') {
      dither(ctx, c.r.x, c.r.y, c.r.w, c.r.h, P.lavender);
      ctx.globalAlpha = 0.28;
      for (let i = 0; i < 2; i++) {
        const ox = c.r.x + 10 + i * 14;
        for (let k = 0; k < c.r.h; k++) rect(ctx, ox + k * 0.6, c.r.y + c.r.h - 1 - k, 3 - i, 1, P.paper);
      }
      ctx.globalAlpha = 1;
      // mullions
      const n = Math.max(1, Math.round(c.r.w / 70));
      for (let i = 1; i < n + 1; i++) rect(ctx, c.r.x + Math.round((c.r.w / (n + 1)) * i) - 1, c.r.y, 2, c.r.h, P.navyDeep);
      rect(ctx, c.r.x, c.r.y + c.r.h - 3, c.r.w, 3, P.lavenderDeep);
    } else {
      if (c.maxX !== undefined) { ctx.beginPath(); ctx.rect(c.x - c.rx - 2, c.y - c.ry - 2, c.maxX - (c.x - c.rx - 2), c.ry * 2 + 4); ctx.clip(); }
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.clip();
      dither(ctx, c.x - c.rx, c.y - c.ry, c.rx * 2, c.ry * 2, P.lavender);
      ctx.globalAlpha = 0.25;
      const streak = Math.min(c.ry, 26);
      for (let k = 0; k < streak; k++) rect(ctx, c.x - c.rx * 0.45 + k * 0.6, c.y + c.ry * 0.2 - k, 2, 1, P.paper);
      ctx.globalAlpha = 1;
      if (c.ry > 60) {
        // cockpit canopy ribs + a soft highlight band
        ctx.globalAlpha = 0.12;
        ellipse(ctx, c.x - c.rx * 0.35, c.y - c.ry * 0.35, c.rx * 0.35, c.ry * 0.3, P.paper);
        ctx.globalAlpha = 1;
        for (const k of [0.45, 0.8]) {
          for (let d = 0; d < 3; d++) ellipseLine(ctx, c.x, c.y, c.rx * k + d, c.ry - 1, d === 1 ? P.lavender : P.navyDeep, Math.PI * 0.5, Math.PI * 1.5);
        }
        for (const oy of [-0.55, 0.55]) {
          rect(ctx, c.x - c.rx, c.y + c.ry * oy - 1, c.rx * 2, 3, P.navyDeep);
          rect(ctx, c.x - c.rx, c.y + c.ry * oy, c.rx * 2, 1, P.lavender);
        }
      }
    }
    ctx.restore();
  }
}

// ------------------------------------------------------------------ signs

const SIGN_ICON: Record<Room['id'], string> = {
  cockpit: P.cyan, hub: P.lavender, lab: P.peach, skills: P.cyan, gallery: P.peach, about: P.pink,
};

function drawRoomSign(ctx: Ctx, room: Room) {
  const text = room.name.toUpperCase();
  const tw = textWidth(text, 10);
  const w = tw + 28, h = 17;
  // rooms entered through their back wall keep the centre of the hull clear for the corridor
  const offCentre = room.id === 'gallery' || room.id === 'about';
  const x = offCentre ? room.rect.x + 24 : Math.round(room.rect.x + room.rect.w / 2 - w / 2);
  const y = room.rect.y - 22;
  frame(ctx, x, y, w, h, P.navy, P.navyDeep, 2, 1);
  rect(ctx, x + 2, y + 1, w - 4, 1, P.violet);
  frame(ctx, x + 5, y + 5, 7, 7, SIGN_ICON[room.id], P.navyDeep, 0, 1);
  pixelText(ctx, text, x + 16, y + 2, P.cream, 10);
  dot(ctx, x + w - 5, y + 8, P.lavenderDeep, 2);
}
