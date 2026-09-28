// Sliding spaceship doors.
//
//   normal     — lavender frame, cyan light when open
//   transition — room entrance: frame + light in the room's accent colour
//   airlock    — hazard stripes, stays shut (locked); light blinks pink when approached
//
// `open` is 0..1 (eased by the engine), `alert` is 0..1 proximity used for
// the "ready" light before the panels actually move.

import type { Door } from '../world/shipMap';
import { frame, glow, rect, type Ctx } from './pixel';
import { P } from './theme';

const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

function panelFill(ctx: Ctx, x: number, y: number, w: number, h: number, door: Door, vertical: boolean) {
  if (w <= 0 || h <= 0) return;
  rect(ctx, x, y, w, h, P.navyDeep);
  if (door.kind === 'airlock') {
    rect(ctx, x + 1, y + 1, w - 2, h - 2, P.peach);
    ctx.save();
    ctx.beginPath(); ctx.rect(x + 1, y + 1, w - 2, h - 2); ctx.clip();
    for (let k = -h; k < w + h; k += 8) {
      for (let j = 0; j < h; j++) rect(ctx, x + k + j * 0.6, y + j, 4, 1, P.navy);
    }
    ctx.restore();
    return;
  }
  rect(ctx, x + 1, y + 1, w - 2, h - 2, P.lavenderSoft);
  if (vertical) rect(ctx, x + 1, y + 1, w - 2, 2, P.paper);
  else rect(ctx, x + 1, y + 1, 2, h - 2, P.paper);
  rect(ctx, x + (vertical ? 2 : Math.max(1, w - 5)), y + (vertical ? Math.max(1, h - 5) : 2), 3, 3, P.lavender);
}

export function drawDoor(ctx: Ctx, door: Door, open: number, alert: number, accent: string, t: number) {
  const { x, y, w, h } = door.rect;
  const k = ease(Math.max(0, Math.min(1, open)));
  const locked = !!door.locked;
  let light: string = door.kind === 'transition' ? accent : P.lavender;
  if (locked) light = alert > 0.3 && Math.floor(t * 4) % 2 === 0 ? P.pink : P.pinkDeep;
  else if (k > 0.1) light = P.cyan;
  else if (alert > 0.3) light = Math.floor(t * 5) % 2 === 0 ? P.cyanSoft : light;

  if (door.axis === 'h') {
    const tall = h > 30; // doorway through a back wall
    // doorway (what's behind: corridor floor)
    rect(ctx, x, y, w, h, P.corridorDeep);
    const pw = Math.round((w / 2) * (1 - k));
    panelFill(ctx, x, y, pw, h, door, false);
    panelFill(ctx, x + w - pw, y, pw, h, door, false);
    if (k > 0.02 && tall) rect(ctx, x + pw, y + h - 10, w - pw * 2, 10, P.corridor);
    // frame
    frame(ctx, x - 5, y - (tall ? 6 : 3), 5, h + (tall ? 6 : 6), P.lavender, P.navyDeep, 0, 1);
    frame(ctx, x + w, y - (tall ? 6 : 3), 5, h + (tall ? 6 : 6), P.lavender, P.navyDeep, 0, 1);
    if (tall) {
      frame(ctx, x - 5, y - 6, w + 10, 7, P.lavender, P.navyDeep, 0, 1);
      rect(ctx, x + w / 2 - 6, y - 4, 12, 3, light);
      if (k > 0.1 || alert > 0.3 || locked) glow(ctx, x + w / 2, y - 2, 18, 8, light, 0.5);
    } else {
      rect(ctx, x - 4, y + h / 2 - 2, 3, 4, light);
      rect(ctx, x + w + 1, y + h / 2 - 2, 3, 4, light);
    }
  } else {
    rect(ctx, x, y, w, h, P.corridorDeep);
    const ph = Math.round((h / 2) * (1 - k));
    panelFill(ctx, x, y, w, ph, door, true);
    panelFill(ctx, x, y + h - ph, w, ph, door, true);
    frame(ctx, x - 2, y - 8, w + 4, 8, P.lavender, P.navyDeep, 0, 1);
    frame(ctx, x - 2, y + h, w + 4, 6, P.lavender, P.navyDeep, 0, 1);
    rect(ctx, x + w / 2 - 2, y - 6, 4, 4, light);
    if (k > 0.1 || alert > 0.3 || locked) glow(ctx, x + w / 2, y - 4, 12, 8, light, 0.55);
    if (locked) {
      // lock plate
      frame(ctx, x - 1, y + h / 2 - 7, w + 2, 14, P.navy, P.navyDeep, 1, 1);
      rect(ctx, x + w / 2 - 3, y + h / 2 - 2, 6, 5, light);
      rect(ctx, x + w / 2 - 2, y + h / 2 - 5, 4, 3, P.lavender);
    }
  }
}
