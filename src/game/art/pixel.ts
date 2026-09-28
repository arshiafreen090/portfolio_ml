// Tiny pixel-art drawing kit. Everything draws on integer coordinates with
// fillRect so shapes stay crisp when the world is scaled up nearest-neighbour.

export type Ctx = CanvasRenderingContext2D;

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

export function rect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function dot(ctx: Ctx, x: number, y: number, color: string, s = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), s, s);
}

/** Filled ellipse built from horizontal runs. */
export function ellipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  const r = Math.round(ry);
  for (let y = -r; y <= r; y++) {
    const t = 1 - (y * y) / (ry * ry);
    if (t < 0) continue;
    const hw = Math.round(rx * Math.sqrt(t));
    ctx.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2, 1);
  }
}

export const disc = (ctx: Ctx, cx: number, cy: number, r: number, color: string) => ellipse(ctx, cx, cy, r, r, color);

/** 1px ellipse outline (optionally only an arc between a0..a1 radians). */
export function ellipseLine(
  ctx: Ctx, cx: number, cy: number, rx: number, ry: number, color: string, a0 = 0, a1 = Math.PI * 2,
) {
  ctx.fillStyle = color;
  const steps = Math.ceil((Math.max(rx, ry) * 2 * Math.PI * (a1 - a0)) / (Math.PI * 2)) + 4;
  let px = NaN, py = NaN;
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    const x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * ry);
    if (x !== px || y !== py) ctx.fillRect(x, y, 1, 1);
    px = x; py = y;
  }
}

/** Box with stepped (pixel-rounded) corners. `r` = number of corner steps. */
export function box(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, r = 2) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  ctx.fillStyle = fill;
  for (let i = 0; i < h; i++) {
    const cut = i < r ? r - i : i >= h - r ? r - (h - 1 - i) : 0;
    ctx.fillRect(x + cut, y + i, w - cut * 2, 1);
  }
}

/** Outlined pixel box: outline colour, then fill inset by `t`. */
export function frame(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, outline: string, r = 2, t = 1) {
  box(ctx, x, y, w, h, outline, r);
  box(ctx, x + t, y + t, w - t * 2, h - t * 2, fill, Math.max(0, r - 1));
}

export function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, color: string) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  ctx.fillStyle = color;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    ctx.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

/** Checkerboard dither fill — used for soft shading and glass. */
export function dither(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, phase = 0) {
  ctx.fillStyle = color;
  x = Math.round(x); y = Math.round(y);
  for (let j = 0; j < h; j++) {
    for (let i = (j + phase) % 2; i < w; i += 2) ctx.fillRect(x + i, y + j, 1, 1);
  }
}

/** Soft radial light (not pixel-snapped — used sparingly for glow). */
export function glow(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string, alpha: number) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function mix(a: string, b: string, t: number) {
  const pa = parse(a), pb = parse(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function parse(hex: string) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

// ---------------------------------------------------------------- pixel text

const textCache = new Map<string, HTMLCanvasElement>();

/**
 * Crisp pixel text: renders with the pixel font, then snaps alpha to 0/1 so
 * it scales up like the rest of the art. Cached per string/colour/size.
 */
export function pixelText(
  ctx: Ctx, text: string, x: number, y: number, color: string, size = 10, align: 'left' | 'center' | 'right' = 'left',
) {
  const key = `${text}|${color}|${size}`;
  let c = textCache.get(key);
  if (!c) {
    const [m, mctx] = makeCanvas(1, 1);
    mctx.font = `600 ${size}px "Pixelify Sans", monospace`;
    const w = Math.ceil(mctx.measureText(text).width) + 2;
    const h = Math.ceil(size * 1.4);
    m.width = w; m.height = h;
    const tctx = m.getContext('2d')!;
    tctx.font = `600 ${size}px "Pixelify Sans", monospace`;
    tctx.textBaseline = 'top';
    tctx.fillStyle = color;
    tctx.fillText(text, 1, Math.round(size * 0.15));
    const img = tctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0;
    tctx.putImageData(img, 0, 0);
    c = m;
    textCache.set(key, c);
  }
  const dx = align === 'center' ? Math.round(x - c.width / 2) : align === 'right' ? Math.round(x - c.width) : Math.round(x);
  ctx.drawImage(c, dx, Math.round(y));
  return c.width;
}

export function textWidth(text: string, size = 10) {
  const [, mctx] = makeCanvas(1, 1);
  mctx.font = `600 ${size}px "Pixelify Sans", monospace`;
  return Math.ceil(mctx.measureText(text).width) + 2;
}

/** Deterministic PRNG so procedural art is identical every load. */
export function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
