// Overhead effects: Tobby's emote bubbles and the focus marker.

import type { Interactable } from '../world/shipMap';
import { dot, frame, rect, type Ctx } from './pixel';
import { P } from './theme';

export type Emote = 'curious' | 'happy' | 'surprised' | 'sleepy';

/**
 * Pixel speech bubble above Tobby. `age` is seconds since it appeared;
 * bubbles pop in, bob gently and fade out near `life`.
 */
export function drawEmote(ctx: Ctx, kind: Emote, x: number, y: number, age: number, life: number) {
  const popIn = Math.min(1, age / 0.12);
  const fade = life > 0 ? Math.min(1, (life - age) / 0.25) : 1;
  if (fade <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, fade);
  const bob = Math.round(Math.sin(age * 4) * 1);
  const bx = Math.round(x + 8), by = Math.round(y - 12 + bob - (1 - popIn) * 4);

  if (kind === 'sleepy') {
    // rising z's instead of a bubble
    for (let i = 0; i < 3; i++) {
      const k = ((age * 0.6 + i / 3) % 1);
      const zx = bx + 4 + i * 5 + Math.round(Math.sin(k * 6) * 2), zy = by + 8 - k * 18;
      ctx.globalAlpha = Math.max(0, fade * (1 - k));
      const s = i === 2 ? 5 : 4;
      rect(ctx, zx, zy, s, 1, P.lavender); rect(ctx, zx + s - 2, zy + 1, 1, 1, P.lavender);
      rect(ctx, zx + 1, zy + 2, 1, s - 3, P.lavender); rect(ctx, zx, zy + s - 1, s, 1, P.lavender);
    }
    ctx.restore();
    return;
  }

  frame(ctx, bx, by, 15, 13, P.paper, P.navyDeep, 2, 1);
  rect(ctx, bx + 3, by + 13, 3, 1, P.navyDeep); rect(ctx, bx + 3, by + 12, 2, 1, P.paper);
  dot(ctx, bx + 2, by + 14, P.navyDeep);
  const gx = bx + 5, gy = by + 3;
  if (kind === 'curious') {
    rect(ctx, gx, gy, 4, 1, P.navy); rect(ctx, gx + 4, gy + 1, 1, 2, P.navy); rect(ctx, gx + 2, gy + 3, 2, 1, P.navy);
    rect(ctx, gx + 2, gy + 4, 1, 1, P.navy); rect(ctx, gx + 2, gy + 6, 1, 1, P.navy);
  } else if (kind === 'surprised') {
    rect(ctx, gx + 2, gy, 2, 5, P.peachDeep); rect(ctx, gx + 2, gy + 6, 2, 1, P.peachDeep);
  } else {
    // heart
    rect(ctx, gx, gy + 1, 2, 2, P.pink); rect(ctx, gx + 3, gy + 1, 2, 2, P.pink);
    rect(ctx, gx - 0, gy + 2, 5, 2, P.pink); rect(ctx, gx + 1, gy + 4, 3, 1, P.pink); rect(ctx, gx + 2, gy + 5, 1, 1, P.pink);
    dot(ctx, gx, gy + 1, P.pinkSoft);
  }
  ctx.restore();
}

/** Bouncing pixel chevron above whatever Tobby can interact with. */
export function drawFocusMarker(ctx: Ctx, it: Interactable, t: number) {
  const x = Math.round(it.base.x);
  const y = Math.round(it.base.y - it.size.h - 12 + Math.sin(t * 3.3) * 1.5);
  rect(ctx, x - 6, y - 5, 13, 3, P.navyDeep);
  rect(ctx, x - 4, y - 2, 9, 2, P.navyDeep);
  rect(ctx, x - 2, y, 5, 2, P.navyDeep);
  rect(ctx, x, y + 2, 1, 1, P.navyDeep);
  rect(ctx, x - 5, y - 4, 11, 1, P.peach);
  rect(ctx, x - 3, y - 2, 7, 1, P.peach);
  rect(ctx, x - 1, y, 3, 1, P.peach);
}
