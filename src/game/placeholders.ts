// TEMPORARY placeholder art, drawn in code.
//
// Every function here is only used when the matching entry in
// src/data/assets.ts is null. Supplying real art in the manifest bypasses it —
// nothing here is baked into image files.

import { C, PIXEL_FONT } from './palette';
import { corridors, rooms, WALL, type Door, type Interactable, type Rect, type Room } from './world/shipMap';

function roundRect(ctx: CanvasRenderingContext2D, r: Rect, radius: number) {
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
}

const grow = (r: Rect, n: number): Rect => ({ x: r.x - n, y: r.y - n, w: r.w + n * 2, h: r.h + n * 2 });

/** Outer hull behind all rooms and corridors (union drawn by overpainting). */
export function drawHull(ctx: CanvasRenderingContext2D) {
  const shapes = [...rooms.map((r) => r.rect), ...corridors];
  ctx.fillStyle = C.hullDark;
  for (const s of shapes) { roundRect(ctx, grow(s, 16), 22); ctx.fill(); }
  ctx.fillStyle = C.hull;
  for (const s of shapes) { roundRect(ctx, grow(s, 9), 16); ctx.fill(); }
}

export function drawCorridors(ctx: CanvasRenderingContext2D) {
  for (const c of corridors) {
    ctx.fillStyle = C.floor;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    // centre runner
    ctx.fillStyle = C.floorLine;
    if (c.w > c.h) ctx.fillRect(c.x, c.y + c.h / 2 - 3, c.w, 6);
    else ctx.fillRect(c.x + c.w / 2 - 3, c.y, 6, c.h);
  }
}

export function drawRoom(ctx: CanvasRenderingContext2D, room: Room) {
  const { x, y, w, h } = room.rect;
  // floor with a quiet tile grid
  ctx.fillStyle = C.floor;
  ctx.fillRect(x, y + WALL, w, h - WALL);
  ctx.fillStyle = C.floorLine;
  for (let gx = x + 40; gx < x + w; gx += 40) ctx.fillRect(gx, y + WALL, 1, h - WALL);
  for (let gy = y + WALL + 40; gy < y + h; gy += 40) ctx.fillRect(x, gy, w, 1);
  // back wall
  ctx.fillStyle = C.wall;
  ctx.fillRect(x, y, w, WALL);
  ctx.fillStyle = C.lavenderSoft;
  for (let px = x + 80; px < x + w; px += 80) ctx.fillRect(px, y + 6, 2, WALL - 16);
  ctx.fillStyle = C.lavender;
  ctx.fillRect(x, y + WALL - 8, w, 8);
}

/** Room name signage on the hull above each room — a UI layer, drawn over room art too. */
export function drawRoomLabel(ctx: CanvasRenderingContext2D, room: Room) {
  const { x, y, w } = room.rect;
  ctx.font = `600 13px ${PIXEL_FONT}`;
  const text = room.name.toUpperCase();
  const tw = ctx.measureText(text).width;
  const bw = tw + 22, bh = 22;
  const bx = Math.round(x + w / 2 - bw / 2), by = y - 24;
  ctx.fillStyle = C.cream;
  roundRect(ctx, { x: bx, y: by, w: bw, h: bh }, 6);
  ctx.fill();
  ctx.strokeStyle = C.navy;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = C.navy;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, by + bh / 2 + 1);
}

export function drawDoor(ctx: CanvasRenderingContext2D, door: Door, open: number) {
  const { x, y, w, h } = door.rect;
  ctx.fillStyle = C.navyDeep;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.lavender;
  if (door.axis === 'h') {
    const pw = (w / 2) * (1 - open);
    ctx.fillRect(x, y, pw, h);
    ctx.fillRect(x + w - pw, y, pw, h);
    if (open < 0.05) { ctx.fillStyle = C.pink; ctx.fillRect(x + w / 2 - 2, y + h / 2 - 4, 4, 8); }
    if (open > 0.05) { ctx.fillStyle = C.floor; ctx.fillRect(x + pw, y + h - 6, w - pw * 2, 6); }
  } else {
    const ph = (h / 2) * (1 - open);
    ctx.fillRect(x, y, w, ph);
    ctx.fillRect(x, y + h - ph, w, ph);
    if (open < 0.05) { ctx.fillStyle = C.pink; ctx.fillRect(x + w / 2 - 4, y + h / 2 - 2, 8, 4); }
  }
  ctx.strokeStyle = C.navy;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function shadow(ctx: CanvasRenderingContext2D, cx: number, by: number, w: number) {
  ctx.fillStyle = 'rgba(45, 54, 104, 0.14)';
  ctx.beginPath();
  ctx.ellipse(cx, by, w / 2 + 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Screen glyphs so each placeholder machine is still recognisable. */
const glyphs: Record<string, (ctx: CanvasRenderingContext2D, r: Rect) => void> = {
  eta(ctx, r) { // route + location pin
    ctx.strokeStyle = C.lavender; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(r.x + 6, r.y + r.h - 6); ctx.lineTo(r.x + r.w / 2, r.y + r.h - 12); ctx.lineTo(r.x + r.w - 12, r.y + 14); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(r.x + r.w - 12, r.y + 12, 5, 0, Math.PI * 2); ctx.fill();
  },
  meal(ctx, r) { // forecast bars + line
    ctx.fillStyle = C.lavender;
    [10, 16, 12, 20].forEach((bh, i) => ctx.fillRect(r.x + 7 + i * 10, r.y + r.h - 4 - bh, 6, bh));
    ctx.strokeStyle = C.peach; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(r.x + 6, r.y + 16); ctx.lineTo(r.x + 22, r.y + 10); ctx.lineTo(r.x + r.w - 6, r.y + 6); ctx.stroke();
  },
  heart(ctx, r) { // ECG line + heart
    ctx.strokeStyle = C.lavender; ctx.lineWidth = 2;
    const my = r.y + r.h / 2 + 4;
    ctx.beginPath(); ctx.moveTo(r.x + 4, my); ctx.lineTo(r.x + 16, my); ctx.lineTo(r.x + 20, my - 10); ctx.lineTo(r.x + 25, my + 6); ctx.lineTo(r.x + 29, my); ctx.lineTo(r.x + r.w - 4, my); ctx.stroke();
    ctx.fillStyle = C.pink;
    const hx = r.x + r.w - 13, hy = r.y + 9;
    ctx.beginPath(); ctx.arc(hx - 3, hy, 3.5, 0, Math.PI * 2); ctx.arc(hx + 3, hy, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - 6.5, hy + 1); ctx.lineTo(hx, hy + 8); ctx.lineTo(hx + 6.5, hy + 1); ctx.fill();
  },
  tiny(ctx, r) { // python prompt
    ctx.fillStyle = C.peach; ctx.font = `600 13px ${PIXEL_FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('>_', r.x + 6, r.y + 6);
    ctx.fillStyle = C.lavender; ctx.fillRect(r.x + 6, r.y + 24, r.w - 16, 3); ctx.fillRect(r.x + 6, r.y + 30, r.w - 24, 3);
  },
  resync(ctx, r) { // resume page + match marks
    ctx.fillStyle = C.cream; ctx.fillRect(r.x + 7, r.y + 5, 18, r.h - 10);
    ctx.fillStyle = C.lavender; for (let i = 0; i < 4; i++) ctx.fillRect(r.x + 10, r.y + 9 + i * 6, 12, 2);
    ctx.fillStyle = C.peach; ctx.fillRect(r.x + r.w - 20, r.y + 10, 12, 4); ctx.fillRect(r.x + r.w - 20, r.y + 18, 8, 4);
  },
  skills(ctx, r) { // database rows
    ctx.fillStyle = C.lavender;
    for (let i = 0; i < 3; i++) ctx.fillRect(r.x + 6, r.y + 6 + i * 9, r.w - 12 - i * 8, 4);
  },
  contact(ctx, r) { // envelope
    ctx.strokeStyle = C.cream; ctx.lineWidth = 2;
    const e = { x: r.x + r.w / 2 - 12, y: r.y + 7, w: 24, h: 16 };
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + e.w / 2, e.y + 9); ctx.lineTo(e.x + e.w, e.y); ctx.stroke();
  },
};

/** Standing machine / terminal. `glyph` picks the screen icon. */
export function drawTerminal(ctx: CanvasRenderingContext2D, it: Interactable, glyph: string, accent: string) {
  const { x: cx, y: by } = it.base;
  const { w, h } = it.size;
  const x = cx - w / 2, y = by - h;
  shadow(ctx, cx, by - 2, w);
  // body
  ctx.fillStyle = C.cream;
  roundRect(ctx, { x, y, w, h: h - 4 }, 8); ctx.fill();
  ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.stroke();
  // base plate
  ctx.fillStyle = C.lavender;
  ctx.fillRect(x + 4, by - 16, w - 8, 8);
  // accent light
  ctx.fillStyle = accent;
  ctx.fillRect(cx - 8, by - 26, 16, 4);
  // screen
  const s = { x: x + 7, y: y + 8, w: w - 14, h: Math.min(44, h - 44) };
  ctx.fillStyle = C.navy;
  roundRect(ctx, s, 4); ctx.fill();
  glyphs[glyph]?.(ctx, s);
}

export function drawConsole(ctx: CanvasRenderingContext2D, it: Interactable) {
  const { x: cx, y: by } = it.base;
  const { w } = it.size;
  shadow(ctx, cx, by - 2, w);
  ctx.fillStyle = C.lavender;
  roundRect(ctx, { x: cx - w / 2, y: by - 28, w, h: 24 }, 8); ctx.fill();
  ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.stroke();
  // hologram globe
  ctx.fillStyle = 'rgba(184, 178, 227, 0.55)';
  ctx.beginPath(); ctx.arc(cx, by - 52, 20, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.navy; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = C.peach;
  ctx.beginPath(); ctx.ellipse(cx, by - 52, 30, 8, -0.2, 0, Math.PI * 2); ctx.stroke();
}

export function drawBoard(ctx: CanvasRenderingContext2D, it: Interactable) {
  const { x: cx, y: by } = it.base;
  const { w, h } = it.size;
  const r = { x: cx - w / 2, y: by - h, w, h };
  ctx.fillStyle = C.cream;
  roundRect(ctx, r, 6); ctx.fill();
  ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.stroke();
  // little portrait + text lines
  ctx.fillStyle = C.peachSoft; ctx.fillRect(r.x + 10, r.y + 12, 30, 36);
  ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(r.x + 25, r.y + 26, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.lavender;
  for (let i = 0; i < 4; i++) ctx.fillRect(r.x + 50, r.y + 14 + i * 9, w - 62 - (i % 2) * 14, 4);
}

export function drawPosterFrame(ctx: CanvasRenderingContext2D, it: Interactable, image: HTMLImageElement | null) {
  const { x: cx, y: by } = it.base;
  const { w, h } = it.size;
  const r = { x: cx - w / 2, y: by - h, w, h };
  ctx.fillStyle = C.navy;
  ctx.fillRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);
  if (image) {
    // cover-fit the real poster into the frame
    const s = Math.max(r.w / image.width, r.h / image.height);
    const sw = r.w / s, sh = r.h / s;
    ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, r.x, r.y, r.w, r.h);
    return;
  }
  ctx.fillStyle = C.lavenderSoft;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = C.lavender;
  ctx.font = `600 22px ${PIXEL_FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('?', cx, r.y + r.h / 2);
}

/** Small bouncing marker above the object Tobby can interact with. */
export function drawFocusMarker(ctx: CanvasRenderingContext2D, it: Interactable, t: number) {
  const x = it.base.x;
  const y = it.base.y - it.size.h - 16 + Math.round(Math.sin(t * 5) * 2);
  ctx.fillStyle = C.peach;
  ctx.strokeStyle = C.navy;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 8); ctx.lineTo(x + 8, y - 8); ctx.lineTo(x, y + 2); ctx.closePath();
  ctx.fill(); ctx.stroke();
}
