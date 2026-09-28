// Canvas game engine: world rendering, Tobby movement/collision, camera,
// interaction detection. It knows nothing about React — it reports through
// callbacks and is controlled through public methods. All popups/prompts are DOM.
//
// Art lives in ./art/ and is procedural unless src/data/assets.ts supplies an
// image for that piece.

import { assetManifest, assetUrl, type PropId } from '../data/assets';
import { artworkSrc, designById, designs } from '../data/designs';
import type { ProjectId } from '../data/types';
import { drawBlinkers, drawCorridorPulses, drawFan, drawNozzles, drawPanelLights, drawWallScreen } from './art/ambient';
import { drawDoor } from './art/doors';
import { drawEmote, drawFocusMarker, type Emote } from './art/fx';
import { drawArtwork, drawGalleryComputer, drawTelescope } from './art/gallery';
import {
  drawAboutBoard, drawBriefingConsole, drawContactTerminal, drawGlobe, drawInteractableGlow, drawSkillTerminal,
} from './art/machines';
import { drawWorkstation, drawWorkstationGlow } from './art/workstations';
import { drawProp } from './art/props';
import { buildShell, type ShellArt } from './art/shell';
import { SpaceBackdrop, vignette } from './art/space';
import { P, THEMES } from './art/theme';
import { Input } from './input';
import { Animator, loadImage, loadSpriteSheet } from './sprite';
import { PROP_SIZE, props, REACTIVE, wallItems, type Prop } from './world/decor';
import {
  doors, floors, inRect, interactables, rectsTouch, roomById, rooms, spines, WORLD,
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
const START: RoomId = 'cockpit';

const SIT_AFTER = 8; // seconds idle
const SLEEP_AFTER = 20;

const PROP_ART: Partial<Record<Interactable['kind'], PropId>> = {
  skills: 'skillTerminal', contact: 'contactTerminal', about: 'aboutBoard', map: 'navConsole', briefing: 'briefingConsole',
  gallery: 'galleryComputer', telescope: 'telescope',
};

const propSolid = (p: Prop): Rect => {
  const s = PROP_SIZE[p.kind];
  return { x: p.x - s.w / 2, y: p.y - s.depth, w: s.w, h: s.depth };
};

export class Engine {
  private ctx: CanvasRenderingContext2D;
  private input: Input;
  private animator: Animator | null = null;
  private shell: ShellArt | null = null;
  private space = new SpaceBackdrop();
  private calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  private tobby = { x: roomById[START].spawn.x, y: roomById[START].spawn.y, dir: 'up' as Dir, moving: false };
  private idle = 0;
  private wave = 0;
  private emote: { kind: Emote; age: number; life: number } | null = null;
  private interacted = false;
  private warned = new Set<string>();

  private cam = { x: roomById[START].spawn.x, y: roomById[START].spawn.y - 60 };
  private view = { w: 0, h: 0, dpr: 1, zoom: 1 };
  private paused = true;
  private focus: Interactable | null = null;
  private room: RoomId | null = null;

  /** eased proximity per object id (0 far … 1 close) */
  private near = new Map<string, number>();
  private doorOpen = new Map<string, number>();
  private images = new Map<string, HTMLImageElement | 'loading' | 'error'>();
  private time = 0;
  private last = 0;
  private raf = 0;
  private resizeObserver: ResizeObserver;
  private solids: Rect[] = [
    ...interactables.flatMap((i) => (i.solid ? [i.solid] : [])),
    ...props.map(propSolid),
  ];

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
    // signs are rendered with the pixel font, so it must be ready before the shell is baked
    try { await document.fonts?.load('600 10px "Pixelify Sans"'); } catch { /* fall back to monospace */ }
    this.shell = buildShell();
    this.cb.onReady?.();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.input.destroy();
  }

  /** Pause while popups/welcome card are open. Rendering continues. */
  setPaused(paused: boolean) {
    if (!paused && this.paused && this.interacted) {
      // back from a popup: a small happy reaction
      this.interacted = false;
      this.wave = 1.1;
      this.setEmote('happy', 1.4);
    }
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
    this.idle = 0;
    this.cam = { x: s.x, y: s.y - 60 };
    this.clampCamera();
    this.updateFocus();
  }

  /** The interactive object drawn under a client (screen) point, front-most first. */
  pick(clientX: number, clientY: number): Interactable | null {
    const r = this.canvas.getBoundingClientRect();
    const { w, h, zoom } = this.view;
    const wx = this.cam.x + (clientX - r.left - w / 2) / zoom;
    const wy = this.cam.y + (clientY - r.top - h / 2) / zoom;
    let best: Interactable | null = null;
    for (const it of interactables) {
      const box = { x: it.base.x - it.size.w / 2, y: it.base.y - it.size.h, w: it.size.w, h: it.size.h };
      if (inRect({ x: wx, y: wy }, box) && (!best || it.base.y > best.base.y)) best = it;
    }
    return best;
  }

  /** Open an object directly (e.g. it was clicked) — counts as an interaction. */
  activate(it: Interactable) {
    if (this.paused) return;
    this.interacted = true;
    this.idle = 0;
    this.cb.onInteract?.(it);
  }

  /** Called by E/Enter/Space or the on-screen action button. */
  interact() {
    if (!this.paused && this.focus) {
      this.interacted = true;
      this.idle = 0;
      this.cb.onInteract?.(this.focus);
    }
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

  private setEmote(kind: Emote, life: number) {
    if (this.emote?.kind === kind && life < 0) return;
    this.emote = { kind, age: 0, life };
  }

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
      this.idle = 0;
      this.wave = 0;
      if (this.emote?.kind === 'sleepy') this.emote = null;
    } else if (!this.paused) {
      this.idle += dt;
    }

    // Tobby's pose: wave (after an interaction) → sit → sleep when left alone
    this.wave = Math.max(0, this.wave - dt);
    let anim = `${t.moving ? 'walk' : 'idle'}-${t.dir}`;
    if (!t.moving) {
      if (this.wave > 0) anim = 'wave';
      else if (this.idle > SLEEP_AFTER) { anim = 'sleep'; this.setEmote('sleepy', -1); }
      else if (this.idle > SIT_AFTER) anim = 'sit';
    }
    this.animator?.play(anim);
    this.animator?.update(dt);
    if (this.emote) {
      this.emote.age += dt;
      if (this.emote.life > 0 && this.emote.age > this.emote.life) this.emote = null;
    }

    // proximity for reactive objects
    const ease = Math.min(1, dt * 5);
    const approach = (id: string, target: number) => {
      const cur = this.near.get(id) ?? 0;
      this.near.set(id, cur + (target - cur) * ease);
    };
    for (const it of interactables) {
      const close = it.kind === 'poster' ? this.focus?.id === it.id : Math.hypot(t.x - it.base.x, t.y - it.base.y) < 140;
      approach(it.id, close ? 1 : 0);
    }
    for (const p of props) if (REACTIVE[p.kind]) approach(p.id, Math.hypot(t.x - p.x, t.y - p.y) < 70 ? 1 : 0);

    for (const door of doors) {
      const cx = door.rect.x + door.rect.w / 2, cy = door.rect.y + door.rect.h / 2;
      const dist = Math.hypot(t.x - cx, t.y - cy);
      approach(`alert:${door.id}`, dist < 170 ? 1 : 0);
      const target = !door.locked && dist < 115 ? 1 : 0;
      const cur = this.doorOpen.get(door.id) ?? 0;
      // snappy mechanical open, slightly slower close
      const speed = target > cur ? 7 : 4;
      this.doorOpen.set(door.id, cur + Math.sign(target - cur) * Math.min(Math.abs(target - cur), dt * speed));
      if (door.locked) {
        // walking up to a locked door: one surprised '!' per approach
        if (dist < 120 && !this.warned.has(door.id)) { this.warned.add(door.id); this.setEmote('surprised', 1.3); }
        else if (dist > 220) this.warned.delete(door.id);
      }
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
      if (best && !this.paused) this.setEmote('curious', 1.1);
      this.focus = best;
      this.cb.onFocus?.(best);
    }
  }

  private clampCamera() {
    const { w, h, zoom } = this.view;
    const hw = w / zoom / 2, hh = h / zoom / 2, m = 150;
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
  private image(path: string | null | undefined, wanted = true): HTMLImageElement | null {
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

  private viewRect(margin: number): Rect {
    const { w, h, zoom } = this.view;
    return {
      x: this.cam.x - w / zoom / 2 - margin, y: this.cam.y - h / zoom / 2 - margin,
      w: w / zoom + margin * 2, h: h / zoom + margin * 2,
    };
  }

  private inView(r: Rect, margin = 40) {
    return rectsTouch(this.viewRect(margin), r);
  }

  // ---------------------------------------------------------------- render

  private render() {
    const { ctx } = this;
    const { w, h, dpr, zoom } = this.view;
    const t = this.time;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const spaceArt = this.image(assetManifest.space);
    if (spaceArt) {
      ctx.fillStyle = P.space;
      ctx.fillRect(0, 0, w, h);
      const iw = spaceArt.width, ih = spaceArt.height, p = 0.3;
      const ox = -((this.cam.x * p * zoom) % iw) - iw, oy = -((this.cam.y * p * zoom) % ih) - ih;
      for (let x = ox; x < w; x += iw) for (let y = oy; y < h; y += ih) ctx.drawImage(spaceArt, x, y);
    } else {
      this.space.draw(ctx, this.cam, zoom, w, h, t, this.calm);
    }
    if (!this.shell) return;

    const s = dpr * zoom;
    ctx.setTransform(s, 0, 0, s, dpr * (w / 2 - this.cam.x * zoom), dpr * (h / 2 - this.cam.y * zoom));
    ctx.imageSmoothingEnabled = false;

    // static ship (or supplied hull art), then any supplied room art over it
    const hullArt = this.image(assetManifest.hull);
    if (hullArt) ctx.drawImage(hullArt, WORLD.x, WORLD.y, WORLD.w, WORLD.h);
    else ctx.drawImage(this.shell.canvas, -this.shell.margin, -this.shell.margin);
    const replaced = new Set<RoomId>();
    for (const room of rooms) {
      const art = this.image(assetManifest.rooms[room.id], this.inView(room.rect, PRELOAD_MARGIN));
      if (art) { ctx.drawImage(art, room.rect.x, room.rect.y, room.rect.w, room.rect.h); replaced.add(room.id); }
    }

    // ambient life
    for (const it of wallItems) if (it.kind === 'screen' && !replaced.has(it.room) && this.inView(it)) drawWallScreen(ctx, it, t);
    for (const it of wallItems) {
      if (replaced.has(it.room) || !this.inView(it)) continue;
      if (it.kind === 'panel') drawPanelLights(ctx, it, t);
      else if (it.kind === 'fan') drawFan(ctx, it, this.calm ? 0 : t);
    }
    if (!this.calm) drawCorridorPulses(ctx, spines, t);
    drawNozzles(ctx, this.shell.nozzles, this.calm ? 0 : t);
    drawBlinkers(ctx, this.shell.blinkers, t);

    for (const door of doors) {
      if (!this.inView(door.rect)) continue;
      const room = door.id.split('-')[0] as RoomId;
      drawDoor(ctx, door, this.doorOpen.get(door.id) ?? 0, this.near.get(`alert:${door.id}`) ?? 0, THEMES[room]?.accent ?? P.lavender, t);
    }

    // floor glows, wall-mounted objects, then y-sorted props / machines / Tobby
    for (const it of interactables) {
      if (!this.inView(this.boundsOf(it))) continue;
      const on = this.near.get(it.id) ?? 0;
      if (it.kind === 'project') drawWorkstationGlow(ctx, it, on);
      else drawInteractableGlow(ctx, it, on);
    }
    for (const it of interactables) if (!it.solid) this.drawInteractable(it);

    const sorted: { y: number; draw: () => void }[] = [];
    for (const it of interactables) {
      if (it.solid && this.inView(this.boundsOf(it))) sorted.push({ y: it.base.y, draw: () => this.drawInteractable(it) });
    }
    for (const p of props) {
      if (replaced.has(p.room)) continue;
      const sz = PROP_SIZE[p.kind];
      if (!this.inView({ x: p.x - sz.w / 2, y: p.y - sz.h, w: sz.w, h: sz.h })) continue;
      sorted.push({ y: p.y, draw: () => this.drawDecor(p) });
    }
    sorted.push({ y: this.tobby.y, draw: () => this.drawTobby() });
    sorted.sort((a, b) => a.y - b.y);
    for (const item of sorted) item.draw();

    if (this.emote) drawEmote(ctx, this.emote.kind, this.tobby.x, this.tobby.y - 78, this.emote.age, this.emote.life);
    if (this.focus && !this.paused) drawFocusMarker(ctx, this.focus, t);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    vignette(ctx, w, h);
  }

  private boundsOf(it: Interactable): Rect {
    return { x: it.base.x - it.size.w / 2 - 30, y: it.base.y - it.size.h - 30, w: it.size.w + 60, h: it.size.h + 50 };
  }

  private drawDecor(p: Prop) {
    const art = this.image(assetManifest.decor[p.kind], true);
    if (art) {
      this.ctx.drawImage(art, Math.round(p.x - art.width / 2), Math.round(p.y - art.height));
      return;
    }
    drawProp(this.ctx, p, this.near.get(p.id) ?? 0, this.calm ? 0 : this.time);
  }

  private drawInteractable(it: Interactable) {
    const { ctx } = this;
    const on = this.near.get(it.id) ?? 0;
    const t = this.time;
    const path = it.kind === 'project'
      ? assetManifest.machines[it.refId as ProjectId]
      : it.kind === 'poster' ? null : assetManifest.props[PROP_ART[it.kind]!];
    const art = this.image(path, this.inView(this.boundsOf(it), PRELOAD_MARGIN));
    if (art) {
      ctx.drawImage(art, Math.round(it.base.x - art.width / 2), Math.round(it.base.y - art.height));
      return;
    }
    switch (it.kind) {
      case 'project': drawWorkstation(ctx, it, on, t); break;
      case 'skills': drawSkillTerminal(ctx, it, on, t); break;
      case 'contact': drawContactTerminal(ctx, it, on, t); break;
      case 'about': drawAboutBoard(ctx, it, on, this.image(assetManifest.avatar)); break;
      case 'map': drawGlobe(ctx, it, on, this.calm ? 0 : t); break;
      case 'briefing': drawBriefingConsole(ctx, it, on, t); break;
      case 'poster': {
        const d = designById[it.refId];
        if (d) drawArtwork(ctx, it, d.number, this.image(artworkSrc(d)), on);
        break;
      }
      case 'gallery': drawGalleryComputer(ctx, it, designs.map((d) => this.image(artworkSrc(d))), on, t); break;
      case 'telescope': drawTelescope(ctx, it, on, this.calm ? 0 : t); break;
    }
  }

  private drawTobby() {
    const { ctx } = this;
    const t = this.tobby;
    ctx.fillStyle = 'rgba(31, 37, 80, 0.2)';
    ctx.beginPath();
    ctx.ellipse(t.x, t.y - 2, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (this.animator) {
      this.animator.draw(ctx, t.x, t.y);
      return;
    }
    // placeholder Tobby if the sprite sheet fails to load
    ctx.fillStyle = P.peach;
    ctx.beginPath(); ctx.arc(t.x, t.y - 26, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P.navy; ctx.lineWidth = 3; ctx.stroke();
  }
}
