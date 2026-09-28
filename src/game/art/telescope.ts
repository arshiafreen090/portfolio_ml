// Scenes for the Navigation Hub telescope. Each one is drawn into a small
// 128×128 buffer and scaled up, so it matches the ship's pixel art.
// The viewer cycles through them slowly with a crossfade.

import { disc, dither, dot, ellipse, ellipseLine, glow, makeCanvas, rect, rng, type Ctx } from './pixel';
import { asteroid, nebula, planet, satellite, shuttle, starTile, station } from './space';
import { P } from './theme';

export const VIEW = 128;

export interface Scene {
  name: string;
  draw: (ctx: Ctx, t: number) => void;
}

let starfield: HTMLCanvasElement | null = null;
function stars(ctx: Ctx, t: number, drift = 0.6) {
  starfield ??= starTile(71, 90, 0.2);
  const ox = -((t * drift) % 128);
  ctx.drawImage(starfield, 0, 0, 128, 128, ox, 0, 128, 128);
  ctx.drawImage(starfield, 0, 0, 128, 128, ox + 128, 0, 128, 128);
}

function bg(ctx: Ctx, color: string = P.spaceDeep) {
  rect(ctx, 0, 0, VIEW, VIEW, color);
}

/** Lazily-built sprites shared by the scenes. */
function buildSprites() {
  return {
    giant: planet(30, '#e3a08e', '#f4c9b0', '#a0667a', ['#d68a7c', '#eeb59c', '#d68a7c', '#f0c3a8'], { front: '#f7dcc0', back: '#b98eaf' }),
    blue: planet(20, '#7fb3de', '#b8dcf2', '#4f76ad', ['#94c4e8', '#6fa2d2']),
    moon: planet(5, '#d8d2ec', '#f2eefb', '#9d96c4', []),
    moon2: planet(4, '#e9c8a4', '#f6e2cc', '#b98457', []),
    neb1: nebula(31, 110, 80, '#6f5db0'),
    neb2: nebula(47, 100, 70, '#b0588f'),
    neb3: nebula(53, 90, 60, '#3f6ab0'),
    station: station(),
    sat: satellite(),
    ship: shuttle(),
    rocks: [3, 4, 5, 6, 7, 9, 10].map((r, i) => asteroid(100 + i, r)),
  };
}
let built: ReturnType<typeof buildSprites> | null = null;
const sprites = () => (built ??= buildSprites());

const rocks = () => sprites().rocks;

export const SCENES: Scene[] = [
  {
    name: 'Ringed gas giant',
    draw(ctx, t) {
      bg(ctx); stars(ctx, t, 0.3);
      const g = sprites().giant;
      ctx.drawImage(g, Math.round(64 - g.width / 2 + Math.sin(t * 0.08) * 6), Math.round(64 - g.height / 2));
    },
  },
  {
    name: 'Moon system',
    draw(ctx, t) {
      bg(ctx); stars(ctx, t, 0.2);
      const sp = sprites();
      const moons = [{ r: 34, s: 0.5, img: sp.moon }, { r: 46, s: -0.32, img: sp.moon2 }, { r: 26, s: 0.8, img: sp.moon }];
      const pos = moons.map((m, i) => ({ ...m, a: t * m.s + i * 2 }));
      for (const m of pos) if (Math.sin(m.a) < 0) ctx.drawImage(m.img, Math.round(64 + Math.cos(m.a) * m.r - m.img.width / 2), Math.round(64 + Math.sin(m.a) * m.r * 0.35 - m.img.height / 2));
      ctx.drawImage(sp.blue, 64 - sp.blue.width / 2, 64 - sp.blue.height / 2);
      for (const m of pos) if (Math.sin(m.a) >= 0) ctx.drawImage(m.img, Math.round(64 + Math.cos(m.a) * m.r - m.img.width / 2), Math.round(64 + Math.sin(m.a) * m.r * 0.35 - m.img.height / 2));
    },
  },
  {
    name: 'Asteroid field',
    draw(ctx, t) {
      bg(ctx); stars(ctx, t, 0.4);
      const list = rocks();
      const r = rng(9);
      for (let i = 0; i < 16; i++) {
        const img = list[i % list.length];
        const speed = 3 + img.width * 0.6;
        const x = ((r() * 200 + t * speed) % 180) - 30;
        const y = r() * 128 + Math.sin(t * 0.3 + i) * 2;
        ctx.drawImage(img, Math.round(x), Math.round(y - img.height / 2));
      }
    },
  },
  {
    name: 'Violet nebula',
    draw(ctx, t) {
      bg(ctx, '#120f2e'); stars(ctx, t, 0.15);
      const sp = sprites();
      ctx.globalAlpha = 0.55; ctx.drawImage(sp.neb1, Math.round(-10 + Math.sin(t * 0.05) * 6), 10);
      ctx.globalAlpha = 0.45; ctx.drawImage(sp.neb2, Math.round(30 - Math.sin(t * 0.04) * 5), 50);
      ctx.globalAlpha = 0.4; ctx.drawImage(sp.neb3, 10, 70);
      ctx.globalAlpha = 1;
      for (let i = 0; i < 5; i++) {
        const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + i * 1.7));
        ctx.globalAlpha = a;
        const x = 20 + i * 22, y = 20 + ((i * 37) % 90);
        rect(ctx, x, y, 1, 1, P.star); rect(ctx, x - 2, y, 5, 1, P.star); rect(ctx, x, y - 2, 1, 5, P.star);
      }
      ctx.globalAlpha = 1;
    },
  },
  {
    name: 'Distant spiral galaxy',
    draw(ctx, t) {
      bg(ctx); stars(ctx, t, 0.1);
      glow(ctx, 64, 64, 34, 20, '#c9b8ff', 0.35);
      const rot = t * 0.12;
      for (let arm = 0; arm < 2; arm++) {
        for (let i = 0; i < 90; i++) {
          const th = i * 0.09 + arm * Math.PI + rot;
          const rr = 3 + i * 0.5;
          const x = 64 + Math.cos(th) * rr, y = 64 + Math.sin(th) * rr * 0.5;
          const c = i < 20 ? P.warm : i % 3 ? '#b6aee2' : P.pinkSoft;
          dot(ctx, x, y, c, i < 30 ? 2 : 1);
        }
      }
      disc(ctx, 64, 64, 4, P.paper);
    },
  },
  {
    name: 'Orbital station',
    draw(ctx, t) {
      bg(ctx); stars(ctx, t, 0.25);
      const sp = sprites();
      const sx = Math.round(20 + ((t * 3) % 60)), sy = 50;
      ctx.drawImage(sp.station, 0, 0, sp.station.width, sp.station.height, sx, sy, sp.station.width * 1.5, sp.station.height * 1.5);
      const k = (t * 12) % 200;
      ctx.drawImage(sp.sat, Math.round(140 - k), 18);
      if (Math.floor(t * 2) % 2 === 0) rect(ctx, sx + 33, sy + 2, 2, 2, P.pink);
    },
  },
  {
    name: 'Passing spacecraft',
    draw(ctx, t) {
      bg(ctx); stars(ctx, t, 1.5);
      const sp = sprites();
      const k = (t * 24) % 190;
      const x = Math.round(k - 40), y = Math.round(70 - k * 0.12);
      for (let i = 1; i < 10; i++) {
        ctx.globalAlpha = 1 - i / 10;
        rect(ctx, x - i * 3, y + 6, 2, 1, P.cyanSoft);
      }
      ctx.globalAlpha = 1;
      ctx.drawImage(sp.ship, 0, 0, sp.ship.width, sp.ship.height, x, y, sp.ship.width * 1.5, sp.ship.height * 1.5);
    },
  },
  {
    name: 'Meteor shower',
    draw(ctx, t) {
      bg(ctx, '#100c28'); stars(ctx, t, 0.2);
      for (let i = 0; i < 7; i++) {
        const period = 2.2 + i * 0.37;
        const k = ((t + i * 0.9) % period) / period;
        if (k > 0.5) continue;
        const x0 = 20 + ((i * 41) % 110), y0 = -10 + ((i * 23) % 30);
        const x = x0 - k * 160, y = y0 + k * 160;
        for (let j = 0; j < 12; j++) {
          ctx.globalAlpha = 1 - j / 12;
          rect(ctx, x + j * 1.5, y - j * 1.5, 2, 1, j < 2 ? P.paper : P.peachSoft);
        }
      }
      ctx.globalAlpha = 1;
    },
  },
  {
    name: 'Comet',
    draw(ctx, t) {
      bg(ctx); stars(ctx, t, 0.3);
      const cx = 88 - Math.sin(t * 0.08) * 12, cy = 44 + Math.sin(t * 0.08) * 8;
      for (let i = 0; i < 70; i++) {
        const spread = i * 0.22;
        ctx.globalAlpha = Math.max(0, 0.6 - i / 110);
        dither(ctx, cx + i * 0.9, cy + i * 0.55 - spread / 2, 2, Math.max(1, spread), i < 30 ? P.cyanSoft : P.lavender, i % 2);
      }
      ctx.globalAlpha = 1;
      glow(ctx, cx, cy, 10, 10, P.cyanSoft, 0.7);
      disc(ctx, cx, cy, 3, P.paper);
    },
  },
  {
    name: 'Black hole',
    draw(ctx, t) {
      bg(ctx, '#0b0a20'); stars(ctx, t, 0.08);
      const rot = t * 0.9;
      for (let ring = 0; ring < 5; ring++) {
        const rx = 34 - ring * 4, ry = 10 - ring * 1.2;
        const col = [P.peach, P.warm, P.pinkSoft, P.peachSoft, P.paper][ring];
        for (let i = 0; i < 60; i++) {
          const a = (i / 60) * Math.PI * 2 + rot * (1 + ring * 0.2);
          if (Math.sin(a) < 0 && ring < 3) continue;
          dot(ctx, 64 + Math.cos(a) * rx, 64 + Math.sin(a) * ry, col);
        }
      }
      ellipseLine(ctx, 64, 64, 15, 15, P.peach);
      disc(ctx, 64, 64, 13, '#05040f');
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2 + rot;
        if (Math.sin(a) >= 0) dot(ctx, 64 + Math.cos(a) * 30, 64 + Math.sin(a) * 8, P.warm);
      }
      ellipse(ctx, 64, 64, 1, 1, P.spaceDeep);
    },
  },
];

/** Renders a scene into a reusable 128×128 buffer. */
export function sceneBuffer() {
  const [canvas, ctx] = makeCanvas(VIEW, VIEW);
  return { canvas, ctx };
}
