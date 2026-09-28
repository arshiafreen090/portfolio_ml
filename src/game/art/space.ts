// Procedural space backdrop (used while assetManifest.space is null).
//
// Layers, far → near:
//   1. three tiled star layers with different densities and parallax
//   2. soft dithered nebula clouds
//   3. distant planets / moon / station — pinned to the screen with gentle parallax
//   4. asteroids and a satellite — anchored in the world, drifting slowly
// Everything is pre-rendered once into small pixel sprites.

import { disc, ellipseLine, makeCanvas, rect, rng } from './pixel';
import { P } from './theme';

interface StarLayer { tile: HTMLCanvasElement; depth: number }
interface Twinkle { x: number; y: number; phase: number; speed: number; color: string }
interface Sky { img: HTMLCanvasElement; ax: number; ay: number; depth: number; scale: number; alpha?: number }
interface Drifter {
  img: HTMLCanvasElement; x: number; y: number; depth: number; vx: number; vy: number;
  blink?: { x: number; y: number };
  /** wrap distance for the drift (default 600) */
  span?: number;
}

const TILE = 512;
const SHIP_CENTRE = { x: 1180, y: 550 };

export function starTile(seed: number, count: number, bigShare: number): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(TILE, TILE);
  const r = rng(seed);
  const tints = [P.star, P.star, P.star, P.cyanSoft, P.peachSoft, P.pinkSoft, P.lavenderSoft];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(r() * TILE), y = Math.floor(r() * TILE);
    ctx.globalAlpha = 0.35 + r() * 0.6;
    const color = tints[Math.floor(r() * tints.length)];
    rect(ctx, x, y, 1, 1, color);
    if (r() < bigShare) { rect(ctx, x + 1, y, 1, 1, color); rect(ctx, x, y + 1, 1, 1, color); rect(ctx, x + 1, y + 1, 1, 1, color); }
  }
  ctx.globalAlpha = 1;
  return c;
}

export function nebula(seed: number, w: number, h: number, color: string): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(w, h);
  const r = rng(seed);
  const blobs = Array.from({ length: 7 }, () => ({
    x: w * (0.2 + r() * 0.6), y: h * (0.25 + r() * 0.5), rx: w * (0.12 + r() * 0.22), ry: h * (0.12 + r() * 0.25),
  }));
  ctx.fillStyle = color;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let d = 0;
      for (const b of blobs) {
        const dx = (x - b.x) / b.rx, dy = (y - b.y) / b.ry;
        d += Math.exp(-(dx * dx + dy * dy) * 1.6);
      }
      if (d > 1.05) ctx.fillRect(x, y, 1, 1);
      else if (d > 0.7 && (x + y) % 2 === 0) ctx.fillRect(x, y, 1, 1);
      else if (d > 0.45 && x % 2 === 0 && y % 2 === 0) ctx.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

export function planet(
  r: number, base: string, light: string, shadow: string, bands: string[], ring?: { front: string; back: string },
): HTMLCanvasElement {
  const pad = ring ? Math.round(r * 0.9) : 2;
  const size = r * 2 + pad * 2 + 2;
  const [c, ctx] = makeCanvas(size, size);
  const cx = size / 2, cy = size / 2;
  if (ring) {
    ellipseLine(ctx, cx, cy, r * 1.75, r * 0.42, ring.back, Math.PI, Math.PI * 2);
    ellipseLine(ctx, cx, cy - 1, r * 1.65, r * 0.38, ring.back, Math.PI, Math.PI * 2);
  }
  disc(ctx, cx, cy, r, base);
  // bands
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  bands.forEach((b, i) => rect(ctx, cx - r, cy - r * 0.6 + i * r * 0.45, r * 2, Math.max(2, r * 0.14), b));
  // light rim top-left, dithered terminator bottom-right
  disc(ctx, cx - r * 0.35, cy - r * 0.35, r * 0.45, light);
  ctx.globalAlpha = 0.9;
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r) continue;
      const k = (x + y) / (r * 1.4);
      if (k > 0.55) rect(ctx, cx + x, cy + y, 1, 1, shadow);
      else if (k > 0.3 && (x + y) % 2 === 0) rect(ctx, cx + x, cy + y, 1, 1, shadow);
    }
  }
  ctx.restore();
  if (ring) {
    ellipseLine(ctx, cx, cy, r * 1.75, r * 0.42, ring.front, 0, Math.PI);
    ellipseLine(ctx, cx, cy + 1, r * 1.65, r * 0.38, ring.front, 0, Math.PI);
  }
  return c;
}

export function asteroid(seed: number, r: number): HTMLCanvasElement {
  const size = r * 2 + 4;
  const [c, ctx] = makeCanvas(size, size);
  const rand = rng(seed);
  const k = [rand(), rand(), rand()];
  const cx = size / 2, cy = size / 2;
  for (let y = -r - 1; y <= r + 1; y++) {
    for (let x = -r - 1; x <= r + 1; x++) {
      const a = Math.atan2(y, x);
      const rr = r * (0.78 + 0.12 * Math.sin(a * 3 + k[0] * 6) + 0.08 * Math.sin(a * 5 + k[1] * 6));
      const d = Math.hypot(x, y);
      if (d > rr) continue;
      const lit = (x + y) / rr;
      const col = lit < -0.55 ? '#b3acd6' : lit > 0.45 ? '#5e5791' : '#8b83b5';
      rect(ctx, cx + x, cy + y, 1, 1, col);
    }
  }
  if (r > 5) { rect(ctx, cx - 1, cy + 1, 2, 2, '#6f689f'); rect(ctx, cx + r * 0.3, cy - r * 0.3, 1, 1, '#6f689f'); }
  return c;
}

export function satellite(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(34, 16);
  // solar panels
  for (const x of [1, 23]) {
    rect(ctx, x, 4, 10, 8, P.navyDeep);
    rect(ctx, x + 1, 5, 8, 6, P.blue);
    rect(ctx, x + 1, 7, 8, 1, P.blueDeep); rect(ctx, x + 5, 5, 1, 6, P.blueDeep);
  }
  rect(ctx, 11, 7, 12, 2, P.lavenderDeep);
  // body
  rect(ctx, 13, 3, 8, 10, P.navyDeep);
  rect(ctx, 14, 4, 6, 8, P.hull);
  rect(ctx, 14, 10, 6, 2, P.hullShade);
  rect(ctx, 16, 0, 1, 3, P.lavenderDeep);
  return c;
}

export function station(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(46, 30);
  ellipseLine(ctx, 23, 15, 20, 7, P.lavenderDeep);
  ellipseLine(ctx, 23, 15, 19, 6, P.lavender, Math.PI * 0.1, Math.PI * 0.9);
  rect(ctx, 19, 6, 8, 18, P.navyDeep);
  rect(ctx, 20, 7, 6, 16, P.lavenderSoft);
  rect(ctx, 20, 12, 6, 2, P.peach);
  rect(ctx, 22, 1, 2, 5, P.lavenderDeep);
  return c;
}

/** Small passenger shuttle, flying right. */
export function shuttle(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(30, 12);
  rect(ctx, 2, 3, 22, 7, P.navyDeep);
  rect(ctx, 3, 4, 20, 5, P.hull);
  rect(ctx, 3, 7, 20, 2, P.hullShade);
  rect(ctx, 22, 4, 5, 4, P.navyDeep); rect(ctx, 23, 5, 3, 2, P.cyan);
  rect(ctx, 8, 5, 2, 2, P.cyan); rect(ctx, 12, 5, 2, 2, P.cyan); rect(ctx, 16, 5, 2, 2, P.cyan);
  rect(ctx, 6, 0, 8, 3, P.navyDeep); rect(ctx, 7, 1, 6, 2, P.pink);
  rect(ctx, 0, 5, 2, 3, P.peach);
  return c;
}

export class SpaceBackdrop {
  private stars: StarLayer[] = [
    { tile: starTile(11, 260, 0), depth: 0.04 },
    { tile: starTile(23, 110, 0.15), depth: 0.1 },
    { tile: starTile(37, 34, 0.5), depth: 0.18 },
  ];
  private twinkles: Twinkle[] = [];
  private sky: Sky[];
  private drifters: Drifter[];

  constructor() {
    const r = rng(99);
    for (let i = 0; i < 9; i++) {
      this.twinkles.push({
        x: r() * 1024, y: r() * 1024, phase: r() * Math.PI * 2, speed: 0.4 + r() * 0.6,
        color: [P.star, P.cyanSoft, P.peachSoft][i % 3],
      });
    }
    this.sky = [
      { img: nebula(5, 180, 110, '#5d4f9c'), ax: 0.18, ay: 0.78, depth: 0.03, scale: 3, alpha: 0.28 },
      { img: nebula(8, 160, 100, '#8a4f86'), ax: 0.86, ay: 0.3, depth: 0.03, scale: 3, alpha: 0.22 },
      { img: nebula(13, 140, 90, '#3f5aa0'), ax: 0.55, ay: 0.95, depth: 0.03, scale: 3, alpha: 0.2 },
      {
        img: planet(30, '#e3a08e', '#f4c9b0', '#a0667a', ['#d68a7c', '#eeb59c', '#d68a7c'], { front: '#f7dcc0', back: '#b98eaf' }),
        ax: 0.07, ay: 0.16, depth: 0.05, scale: 2,
      },
      { img: planet(64, '#8f86c9', '#b6aee2', '#5c5496', ['#9d94d2', '#8279bf']), ax: 0.97, ay: 1.02, depth: 0.04, scale: 2 },
      { img: planet(14, '#7fb3de', '#b8dcf2', '#4f76ad', ['#94c4e8']), ax: 0.8, ay: 0.1, depth: 0.06, scale: 2 },
      { img: planet(6, '#d8d2ec', '#f2eefb', '#9d96c4', []), ax: 0.86, ay: 0.17, depth: 0.07, scale: 2 },
      { img: station(), ax: 0.45, ay: 0.06, depth: 0.06, scale: 2 },
    ];
    const rock = (seed: number, rr: number, x: number, y: number, vx: number, vy: number, depth = 0.5): Drifter =>
      ({ img: asteroid(seed, rr), x, y, depth, vx, vy });
    this.drifters = [
      rock(1, 9, 330, 150, 3, 1),
      rock(2, 5, 470, 280, -2, 1),
      rock(3, 12, 1170, 150, 2, -1),
      rock(4, 6, 1210, 960, -3, 0),
      rock(5, 8, 260, 960, 2, -1),
      rock(6, 5, 1520, 1070, 3, 1),
      rock(7, 10, 2300, 260, -2, 2),
      rock(8, 6, 2360, 900, -3, -1),
      rock(9, 4, -40, 420, 2, 1),
      { img: satellite(), x: 900, y: -40, depth: 0.55, vx: 7, vy: 0, blink: { x: 16, y: 0 } },
      // a shuttle that crosses the view every so often
      { img: shuttle(), x: 1300, y: 1180, depth: 0.6, vx: 38, vy: -4, span: 2600 },
      { img: shuttle(), x: 400, y: -120, depth: 0.45, vx: 24, vy: 2, span: 3200 },
    ];
  }

  draw(ctx: CanvasRenderingContext2D, cam: { x: number; y: number }, zoom: number, w: number, h: number, t: number, still: boolean) {
    ctx.fillStyle = P.space;
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;

    for (const layer of this.stars) {
      const s = TILE * zoom;
      const ox = (((-cam.x * layer.depth * zoom) % s) + s) % s;
      const oy = (((-cam.y * layer.depth * zoom) % s) + s) % s;
      for (let x = ox - s; x < w; x += s) for (let y = oy - s; y < h; y += s) ctx.drawImage(layer.tile, x, y, s, s);
    }

    // a few slowly twinkling cross stars
    const ts = 1024 * zoom;
    for (const tw of this.twinkles) {
      const a = still ? 0.8 : 0.45 + 0.45 * Math.sin(t * tw.speed + tw.phase);
      const bx = ((((tw.x - cam.x * 0.14) * zoom) % ts) + ts) % ts;
      const by = ((((tw.y - cam.y * 0.14) * zoom) % ts) + ts) % ts;
      for (let x = bx - ts; x < w; x += ts) for (let y = by - ts; y < h; y += ts) {
        if (x < -8 || y < -8 || x > w + 8 || y > h + 8) continue;
        const p = Math.max(1, Math.round(zoom));
        ctx.globalAlpha = a;
        ctx.fillStyle = tw.color;
        ctx.fillRect(x, y, p, p);
        ctx.globalAlpha = a * 0.6;
        ctx.fillRect(x - p * 2, y, p * 2, p); ctx.fillRect(x + p, y, p * 2, p);
        ctx.fillRect(x, y - p * 2, p, p * 2); ctx.fillRect(x, y + p, p, p * 2);
      }
    }
    ctx.globalAlpha = 1;

    for (const s of this.sky) {
      const k = s.scale * zoom;
      const x = w * s.ax - (cam.x - SHIP_CENTRE.x) * s.depth * zoom - (s.img.width * k) / 2;
      const y = h * s.ay - (cam.y - SHIP_CENTRE.y) * s.depth * zoom - (s.img.height * k) / 2;
      ctx.globalAlpha = s.alpha ?? 1;
      ctx.drawImage(s.img, Math.round(x), Math.round(y), s.img.width * k, s.img.height * k);
    }
    ctx.globalAlpha = 1;

    for (const d of this.drifters) {
      const time = still ? 0 : t;
      // wrap drift inside a band around the anchor so objects never leave for good
      const span = d.span ?? 600;
      const dx = ((((d.vx * time) % span) + span * 1.5) % span) - span / 2;
      const dy = ((((d.vy * time) % span) + span * 1.5) % span) - span / 2;
      const wx = d.x + dx, wy = d.y + dy;
      // nearer than the sky, farther than the ship: slides by at `depth` × camera speed
      const sx = w / 2 + (wx - cam.x) * d.depth * zoom;
      const sy = h / 2 + (wy - cam.y) * d.depth * zoom;
      const iw = d.img.width * zoom, ih = d.img.height * zoom;
      if (sx + iw < 0 || sy + ih < 0 || sx - iw > w || sy - ih > h) continue;
      ctx.drawImage(d.img, Math.round(sx - iw / 2), Math.round(sy - ih / 2), iw, ih);
      if (d.blink && Math.floor(t * 1.5) % 2 === 0) {
        ctx.fillStyle = P.pink;
        const p = Math.max(1, Math.round(zoom));
        ctx.fillRect(Math.round(sx - iw / 2 + d.blink.x * zoom), Math.round(sy - ih / 2 + d.blink.y * zoom), p * 2, p * 2);
      }
    }
  }
}

/** Screen-space vignette to add depth; drawn after the world. */
export function vignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(14,18,41,0)');
  g.addColorStop(1, 'rgba(14,18,41,0.35)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

