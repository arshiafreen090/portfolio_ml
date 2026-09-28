// Canvas game engine: world rendering, Tobby movement/collision, camera,
// interaction detection. It knows nothing about React — it reports through
// callbacks and is controlled through public methods. All popups/prompts are DOM.

import { assetManifest, assetUrl, type PropId } from '../data/assets';
import { designById } from '../data/designs';
import type { ProjectId } from '../data/types';
import { Input } from './input';
import { C } from './palette';
import {
  drawBoard, drawConsole, drawCorridors, drawDoor, drawFocusMarker, drawHull,
  drawPosterFrame, drawRoom, drawRoomLabel, drawTerminal,
} from './placeholders';
import { drawSpace } from './space';
import { Animator, loadImage, loadSpriteSheet } from './sprite';
import {
  doors, floors, inRect, interactables, rectsTouch, roomById, rooms, WORLD,
  type Interactable, type Rect, type RoomId,
} from './world/shipMap';

export interface EngineCallbacks {
  onReady?: () => void;
  onFocus?: (it: Interactable | null) => void;
  onInteract?: (it: Interactable) => void;
  onRoom?: (room: RoomId | null) => void;
}

type Dir = 'down' | 'up' | 'left' | 'right';

const SPEED = 190; // world units / second
const FOOT_W = 30;
const FOOT_H = 12;
const PRELOAD_MARGIN = 400;

const MACHINE_ACCENT: Record<ProjectId, string> = {
  eta: C.peach, meal: C.lavender, heart: C.pink, tiny: C.peach, resync: C.lavender,
};

const PROP_FOR: Partial<Record<Interactable['kind'], PropId>> = {
  skills: 'skillTerminal', contact: 'contactTerminal', about: 'aboutBoard', map: 'navConsole',
};

export class Engine {
  private ctx: CanvasRenderingContext2D;
  private input: Input;
  private animator: Animator | null = null;
  private tobby = { x: roomById.hub.spawn.x, y: roomById.hub.spawn.y, dir: 'up' as Dir, moving: false };
  private cam = { x: roomById.hub.spawn.x, y: roomById.hub.spawn.y - 60 };
  private view = { w: 0, h: 0, dpr: 1, zoom: 1 };
  private paused = true;
  private focus: Interactable | null = null;
  private room: RoomId | null = null;
  private doorOpen = new Map<string, number>();
  private images = new Map<string, HTMLImageElement | 'loading' | 'error'>();
  private time = 0;
  private last = 0;
  private raf = 0;
  private resizeObserver: ResizeObserver;
  private solids: Rect[] = interactables.flatMap((i) => (i.solid ? [i.solid] : []));

  constructor(private canvas: HTMLCanvasElement, private cb: EngineCallbacks = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.ctx = ctx;
    this.input = new Input(() => this.interact());
    this.input.enabled = false;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    this.raf = requestAnimationFrame(this.frame);
    void this.load();
  }

  private async load() {
    try {
      const sheet = await loadSpriteSheet(assetUrl(assetManifest.tobby.atlas), assetUrl(assetManifest.tobby.image));
      this.animator = new Animator(sheet);
    } catch (err) {
      console.warn('[engine] Tobby sprite unavailable, using placeholder', err);
    }
    // canvas text needs the pixel font before labels look right
    await document.fonts?.ready;
    this.cb.onReady?.();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.input.destroy();
  }

  /** Pause while popups/welcome card are open. Rendering continues. */
  setPaused(paused: boolean) {
    this.paused = paused;
    this.input.enabled = !paused;
    if (paused) this.input.clear();
  }

  setVirtualDirection(x: number, y: number) {
    this.input.setVirtual(x, y);
  }

  teleport(room: RoomId) {
    const s = roomById[room].spawn;
    this.tobby.x = s.x;
    this.tobby.y = s.y;
    this.tobby.dir = 'up';
    this.cam = { x: s.x, y: s.y - 60 };
    this.clampCamera();
    this.updateFocus();
  }

  /** Called by E/Enter/Space or the on-screen action button. */
  interact() {
    if (!this.paused && this.focus) this.cb.onInteract?.(this.focus);
  }

  // ---------------------------------------------------------------- loop

  private frame = (now: number) => {
    const dt = Math.min(0.05, this.last ? (now - this.last) / 1000 : 0);
    this.last = now;
    this.time += dt;
    this.update(dt);
    this.render();
    this.raf = requestAnimationFrame(this.frame);
  };

  private update(dt: number) {
    const t = this.tobby;
    const d = this.paused ? { x: 0, y: 0 } : this.input.direction();
    t.moving = d.x !== 0 || d.y !== 0;
    if (t.moving) {
      if (Math.abs(d.x) > Math.abs(d.y)) t.dir = d.x > 0 ? 'right' : 'left';
      else t.dir = d.y > 0 ? 'down' : 'up';
      // axis-separated so Tobby slides along walls
      const nx = t.x + d.x * SPEED * dt;
      if (this.canStand(nx, t.y)) t.x = nx;
      const ny = t.y + d.y * SPEED * dt;
      if (this.canStand(t.x, ny)) t.y = ny;
      this.updateFocus();
    }
    this.animator?.play(`${t.moving ? 'walk' : 'idle'}-${t.dir}`);
    this.animator?.update(dt);

    for (const door of doors) {
      const cx = door.rect.x + door.rect.w / 2, cy = door.rect.y + door.rect.h / 2;
      const near = Math.hypot(t.x - cx, t.y - cy) < 110 ? 1 : 0;
      const cur = this.doorOpen.get(door.id) ?? 0;
      this.doorOpen.set(door.id, cur + (near - cur) * Math.min(1, dt * 8));
    }

    const room = rooms.find((r) => inRect(t, r.rect))?.id ?? null;
    if (room !== this.room) {
      this.room = room;
      this.cb.onRoom?.(room);
    }

    // camera follow
    const k = Math.min(1, dt * 6);
    this.cam.x += (t.x - this.cam.x) * k;
    this.cam.y += (t.y - 40 - this.cam.y) * k;
    this.clampCamera();
  }

  private canStand(x: number, y: number) {
    const corners = [
      { x: x - FOOT_W / 2, y: y - FOOT_H }, { x: x + FOOT_W / 2, y: y - FOOT_H },
      { x: x - FOOT_W / 2, y }, { x: x + FOOT_W / 2, y },
    ];
    if (!corners.every((p) => floors.some((f) => inRect(p, f)))) return false;
    const foot = { x: x - FOOT_W / 2, y: y - FOOT_H, w: FOOT_W, h: FOOT_H };
    return !this.solids.some((s) => rectsTouch(foot, s));
  }

  private updateFocus() {
    const t = this.tobby;
    let best: Interactable | null = null, bestD = Infinity;
    for (const it of interactables) {
      if (!inRect(t, it.zone)) continue;
      const d = Math.hypot(t.x - it.base.x, t.y - it.base.y);
      if (d < bestD) { bestD = d; best = it; }
    }
    if (best !== this.focus) {
      this.focus = best;
      this.cb.onFocus?.(best);
    }
  }

  private clampCamera() {
    const { w, h, zoom } = this.view;
    const hw = w / zoom / 2, hh = h / zoom / 2, m = 120;
    const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)));
    this.cam.x = clamp(this.cam.x, WORLD.x - m + hw, WORLD.x + WORLD.w + m - hw);
    this.cam.y = clamp(this.cam.y, WORLD.y - m + hh, WORLD.y + WORLD.h + m - hh);
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    // desktop: fit ~1000×640 world units; narrow/portrait screens: ~480 units wide
    const raw = rect.width < 700 ? rect.width / 480 : Math.min(rect.width / 1000, rect.height / 640);
    const zoom = Math.max(0.5, Math.min(2, Math.round(raw * 4) / 4));
    this.view = { w: rect.width, h: rect.height, dpr, zoom };
    this.clampCamera();
  }

  // ---------------------------------------------------------------- assets

  /** Returns the image if ready; starts loading it when `wanted`. */
  private image(path: string | null, wanted = true): HTMLImageElement | null {
    if (!path) return null;
    const entry = this.images.get(path);
    if (entry instanceof HTMLImageElement) return entry;
    if (!entry && wanted) {
      this.images.set(path, 'loading');
      loadImage(assetUrl(path)).then(
        (img) => this.images.set(path, img),
        (err) => { console.warn('[engine]', err); this.images.set(path, 'error'); },
      );
    }
    return null;
  }

  private near(r: Rect) {
    const { w, h, zoom } = this.view;
    const view = {
      x: this.cam.x - w / zoom / 2 - PRELOAD_MARGIN, y: this.cam.y - h / zoom / 2 - PRELOAD_MARGIN,
      w: w / zoom + PRELOAD_MARGIN * 2, h: h / zoom + PRELOAD_MARGIN * 2,
    };
    return rectsTouch(view, r);
  }

  // ---------------------------------------------------------------- render

  private render() {
    const { ctx } = this;
    const { w, h, dpr, zoom } = this.view;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    drawSpace(ctx, this.cam, zoom, w, h, this.image(assetManifest.space));

    const s = dpr * zoom;
    ctx.setTransform(s, 0, 0, s, dpr * (w / 2 - this.cam.x * zoom), dpr * (h / 2 - this.cam.y * zoom));
    ctx.imageSmoothingEnabled = false;

    const hull = this.image(assetManifest.hull);
    if (hull) ctx.drawImage(hull, WORLD.x, WORLD.y, WORLD.w, WORLD.h);
    else { drawHull(ctx); drawCorridors(ctx); }

    for (const room of rooms) {
      const art = this.image(assetManifest.rooms[room.id], this.near(room.rect));
      if (art) ctx.drawImage(art, room.rect.x, room.rect.y, room.rect.w, room.rect.h);
      else drawRoom(ctx, room);
    }
    for (const door of doors) drawDoor(ctx, door, this.doorOpen.get(door.id) ?? 0);
    for (const room of rooms) drawRoomLabel(ctx, room);

    // wall-mounted first, then standing objects and Tobby sorted by their base
    const wall = interactables.filter((i) => !i.solid);
    for (const it of wall) this.drawInteractable(it);
    const sorted: { y: number; draw: () => void }[] = interactables
      .filter((i) => i.solid)
      .map((it) => ({ y: it.base.y, draw: () => this.drawInteractable(it) }));
    sorted.push({ y: this.tobby.y, draw: () => this.drawTobby() });
    sorted.sort((a, b) => a.y - b.y);
    for (const item of sorted) item.draw();

    if (this.focus && !this.paused) drawFocusMarker(ctx, this.focus, this.time);
  }

  private drawInteractable(it: Interactable) {
    const { ctx } = this;
    const near = this.near({ x: it.base.x - 100, y: it.base.y - 150, w: 200, h: 200 });
    const path = it.kind === 'project'
      ? assetManifest.machines[it.refId as ProjectId]
      : it.kind === 'poster' ? null : assetManifest.props[PROP_FOR[it.kind]!];
    const art = this.image(path, near);
    if (art) {
      ctx.drawImage(art, Math.round(it.base.x - art.width / 2), Math.round(it.base.y - art.height));
      return;
    }
    switch (it.kind) {
      case 'project': drawTerminal(ctx, it, it.refId, MACHINE_ACCENT[it.refId as ProjectId]); break;
      case 'skills': drawTerminal(ctx, it, 'skills', C.lavender); break;
      case 'contact': drawTerminal(ctx, it, 'contact', C.pink); break;
      case 'about': drawBoard(ctx, it); break;
      case 'map': drawConsole(ctx, it); break;
      case 'poster': drawPosterFrame(ctx, it, this.image(designById[it.refId]?.image ?? null, near)); break;
    }
  }

  private drawTobby() {
    const { ctx } = this;
    const t = this.tobby;
    ctx.fillStyle = 'rgba(45, 54, 104, 0.16)';
    ctx.beginPath();
    ctx.ellipse(t.x, t.y - 2, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (this.animator) {
      this.animator.draw(ctx, t.x, t.y);
      return;
    }
    // placeholder Tobby if the sprite sheet fails to load
    ctx.fillStyle = C.peach;
    ctx.beginPath(); ctx.arc(t.x, t.y - 26, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.stroke();
  }
}
