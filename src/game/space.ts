// TEMPORARY procedural space backdrop (used while assetManifest.space is null).
// Sparse on purpose: a static starfield and a few distant bodies, slow parallax.

import { C } from './palette';

interface Star { x: number; y: number; r: number; a: number }
interface Body { x: number; y: number; r: number; color: string; ring?: string; depth: number }

const TILE = 900;
const CENTRE = { x: 900, y: 530 };

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const rand = rng(7);
const stars: Star[] = Array.from({ length: 70 }, () => ({
  x: rand() * TILE,
  y: rand() * TILE,
  r: rand() < 0.85 ? 1 : 2,
  a: 0.35 + rand() * 0.55,
}));

// positions in world units; `depth` < 1 moves slower than the ship
const bodies: Body[] = [
  { x: -120, y: 60, r: 70, color: '#c98f8a', ring: '#e8b9a4', depth: 0.25 },
  { x: 1650, y: 980, r: 110, color: '#8f86c9', depth: 0.2 },
  { x: 1500, y: -40, r: 18, color: '#d8d2ec', depth: 0.35 },
  { x: 260, y: 1180, r: 10, color: '#a39cc9', depth: 0.45 },
];

/**
 * Draws in screen space. `cam` is the camera centre in world units,
 * `zoom` world→screen scale, (w, h) the viewport in CSS pixels.
 */
export function drawSpace(
  ctx: CanvasRenderingContext2D,
  cam: { x: number; y: number },
  zoom: number,
  w: number,
  h: number,
  image: HTMLImageElement | null,
) {
  ctx.fillStyle = C.space;
  ctx.fillRect(0, 0, w, h);

  if (image) {
    // tile the supplied backdrop with gentle parallax
    const p = 0.3, iw = image.width, ih = image.height;
    const ox = -((cam.x * p * zoom) % iw) - iw, oy = -((cam.y * p * zoom) % ih) - ih;
    for (let x = ox; x < w; x += iw) for (let y = oy; y < h; y += ih) ctx.drawImage(image, x, y);
    return;
  }

  // stars: repeating tile, parallax 0.15, drawn at screen scale
  const p = 0.15;
  const ox = ((-cam.x * p) % TILE + TILE) % TILE;
  const oy = ((-cam.y * p) % TILE + TILE) % TILE;
  ctx.fillStyle = C.star;
  for (let tx = ox - TILE; tx < w; tx += TILE) {
    for (let ty = oy - TILE; ty < h; ty += TILE) {
      for (const s of stars) {
        const sx = tx + s.x, sy = ty + s.y;
        if (sx < -2 || sy < -2 || sx > w + 2 || sy > h + 2) continue;
        ctx.globalAlpha = s.a;
        ctx.fillRect(Math.round(sx), Math.round(sy), s.r, s.r);
      }
    }
  }
  ctx.globalAlpha = 1;

  for (const b of bodies) {
    // sits at (b.x, b.y) when the camera is at the ship's centre, drifts by `depth` from there
    const sx = w / 2 + (b.x - CENTRE.x - (cam.x - CENTRE.x) * b.depth) * zoom;
    const sy = h / 2 + (b.y - CENTRE.y - (cam.y - CENTRE.y) * b.depth) * zoom;
    const r = b.r * zoom;
    if (sx + r * 2 < 0 || sy + r * 2 < 0 || sx - r * 2 > w || sy - r * 2 > h) continue;
    if (b.ring) {
      ctx.strokeStyle = b.ring; ctx.lineWidth = Math.max(2, 5 * zoom);
      ctx.beginPath(); ctx.ellipse(sx, sy, r * 1.7, r * 0.45, -0.35, Math.PI, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(16, 20, 42, 0.18)';
    ctx.beginPath(); ctx.arc(sx + r * 0.3, sy + r * 0.25, r * 0.85, 0, Math.PI * 2); ctx.fill();
    if (b.ring) {
      ctx.strokeStyle = b.ring;
      ctx.beginPath(); ctx.ellipse(sx, sy, r * 1.7, r * 0.45, -0.35, 0, Math.PI); ctx.stroke();
    }
  }
}
