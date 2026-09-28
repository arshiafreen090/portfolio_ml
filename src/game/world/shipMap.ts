// The ship layout: rooms, corridors, doors and interactive objects.
// All coordinates are world units (1 unit = 1 source pixel of Tobby's sprite).
//
// Rooms are drawn in a 3/4 top-down view: the top WALL band of every room is
// the back wall (not walkable); the rest is floor. Corridors are floor strips
// that overlap rooms where a doorway is.
//
// Layout (west → east): Cockpit (nose) — main corridor — Project Lab above /
// Design Archive below — Navigation Hub — Skills Database above / About below —
// airlock + engines (tail).
//
// Interactables only reference content by id — the content itself lives in src/data/.
// Purely visual furniture lives in ./decor.ts.

import type { ProjectId } from '../../data/types';

export interface Rect { x: number; y: number; w: number; h: number }
export interface Point { x: number; y: number }

export type RoomId = 'cockpit' | 'hub' | 'lab' | 'skills' | 'about' | 'gallery';

export interface Room {
  id: RoomId;
  name: string;
  rect: Rect;
  spawn: Point;
}

export type InteractKind = 'project' | 'skills' | 'about' | 'contact' | 'poster' | 'map' | 'briefing';

export interface Interactable {
  id: string;
  kind: InteractKind;
  /** id into the matching data source (project id, skill terminal id, design id…) */
  refId: string;
  room: RoomId;
  label: string;
  /** bottom-centre of the object; sprites are drawn up from here */
  base: Point;
  /** visual footprint (w × h, drawn up from base) */
  size: { w: number; h: number };
  /** wall-mounted objects have no collision */
  solid: Rect | null;
  /** Tobby's feet must be inside this to interact */
  zone: Rect;
}

export type DoorKind = 'normal' | 'transition' | 'airlock';

export interface Door {
  id: string;
  rect: Rect;
  /** 'h' = panels slide sideways (doorway in a horizontal wall), 'v' = vertical wall */
  axis: 'h' | 'v';
  kind: DoorKind;
  locked?: boolean;
}

export const WALL = 80;
export const WORLD: Rect = { x: 0, y: 0, w: 2360, h: 1100 };

export const rooms: Room[] = [
  { id: 'cockpit', name: 'Cockpit', rect: { x: 80, y: 360, w: 360, h: 380 }, spawn: { x: 330, y: 650 } },
  { id: 'lab', name: 'Project Lab', rect: { x: 520, y: 40, w: 620, h: 400 }, spawn: { x: 830, y: 390 } },
  { id: 'gallery', name: 'Design Archive', rect: { x: 560, y: 690, w: 540, h: 360 }, spawn: { x: 830, y: 820 } },
  { id: 'hub', name: 'Navigation Hub', rect: { x: 1180, y: 330, w: 400, h: 460 }, spawn: { x: 1380, y: 740 } },
  { id: 'skills', name: 'Skills Database', rect: { x: 1620, y: 40, w: 620, h: 400 }, spawn: { x: 1930, y: 400 } },
  { id: 'about', name: 'About + Contact', rect: { x: 1660, y: 690, w: 540, h: 360 }, spawn: { x: 1930, y: 820 } },
];

export const roomById = Object.fromEntries(rooms.map((r) => [r.id, r])) as Record<RoomId, Room>;

/** Main corridor segments (drawn as the ship's central walkway). */
export const spines: Rect[] = [
  { x: 420, y: 520, w: 780, h: 90 }, // cockpit → hub
  { x: 1560, y: 520, w: 640, h: 90 }, // hub → airlock
];

/** Short vertical links between the main corridor and the rooms. */
export const connectors: Rect[] = [
  { x: 790, y: 420, w: 80, h: 120 }, // lab
  { x: 790, y: 590, w: 80, h: 190 }, // archive (through its back wall)
  { x: 1890, y: 420, w: 80, h: 120 }, // skills
  { x: 1890, y: 590, w: 80, h: 190 }, // about (through its back wall)
];

export const corridors: Rect[] = [...spines, ...connectors];

export const doors: Door[] = [
  { id: 'cockpit-e', rect: { x: 432, y: 520, w: 16, h: 90 }, axis: 'v', kind: 'normal' },
  { id: 'lab-s', rect: { x: 790, y: 432, w: 80, h: 16 }, axis: 'h', kind: 'transition' },
  { id: 'gallery-n', rect: { x: 790, y: 690, w: 80, h: WALL }, axis: 'h', kind: 'transition' },
  { id: 'hub-w', rect: { x: 1172, y: 520, w: 16, h: 90 }, axis: 'v', kind: 'normal' },
  { id: 'hub-e', rect: { x: 1572, y: 520, w: 16, h: 90 }, axis: 'v', kind: 'normal' },
  { id: 'skills-s', rect: { x: 1890, y: 432, w: 80, h: 16 }, axis: 'h', kind: 'transition' },
  { id: 'about-n', rect: { x: 1890, y: 690, w: 80, h: WALL }, axis: 'h', kind: 'transition' },
  { id: 'airlock', rect: { x: 2192, y: 520, w: 16, h: 90 }, axis: 'v', kind: 'airlock', locked: true },
];

/** Walkable floor = room floors (minus back wall) + corridors. */
export const floors: Rect[] = [
  ...rooms.map((r) => ({ x: r.rect.x, y: r.rect.y + WALL, w: r.rect.w, h: r.rect.h - WALL })),
  ...corridors,
];

function standing(
  id: string, kind: InteractKind, refId: string, room: RoomId, label: string,
  cx: number, baseY: number, w: number, h: number,
): Interactable {
  return {
    id, kind, refId, room, label,
    base: { x: cx, y: baseY },
    size: { w, h },
    solid: { x: cx - w / 2, y: baseY - 26, w, h: 26 },
    zone: { x: cx - w / 2 - 22, y: baseY - 30, w: w + 44, h: 86 },
  };
}

function wallMounted(
  id: string, kind: InteractKind, refId: string, room: RoomId, label: string,
  cx: number, w: number, h: number,
): Interactable {
  const r = roomById[room].rect;
  const floorTop = r.y + WALL;
  return {
    id, kind, refId, room, label,
    base: { x: cx, y: floorTop - 10 },
    size: { w, h },
    solid: null,
    zone: { x: cx - w / 2 - 10, y: floorTop, w: w + 20, h: 70 },
  };
}

const LAB_MACHINES: { id: ProjectId; label: string }[] = [
  { id: 'eta', label: 'Delivery ETA Prediction' },
  { id: 'meal', label: 'Meal Demand Forecasting' },
  { id: 'heart', label: 'Heart Disease Prediction' },
  { id: 'tiny', label: 'Tiny Projects' },
  { id: 'resync', label: 'ReSync AI' },
];

export const interactables: Interactable[] = [
  // Cockpit — flight console opens the welcome briefing
  standing('console-briefing', 'briefing', 'briefing', 'cockpit', 'Flight console', 170, 590, 96, 64),
  // Project Lab — exactly five machines along the back wall
  ...LAB_MACHINES.map((m, i) =>
    standing(`machine-${m.id}`, 'project', m.id, 'lab', m.label, 600 + i * 115, 205, 78, 112),
  ),
  // Skills Database — three terminals in a shallow arc
  standing('terminal-code-data', 'skills', 'code-data', 'skills', 'Code & Data', 1770, 270, 70, 96),
  standing('terminal-ml-analytics', 'skills', 'ml-analytics', 'skills', 'ML & Analytics', 1930, 300, 70, 96),
  standing('terminal-build-tools', 'skills', 'build-tools', 'skills', 'Build & Tools', 2090, 270, 70, 96),
  // About + Contact
  wallMounted('board-about', 'about', 'about', 'about', 'About Afreen', 1760, 110, 60),
  standing('terminal-contact', 'contact', 'contact', 'about', 'Contact', 2110, 960, 64, 88),
  // Design Archive — exactly two poster stands
  standing('poster-1', 'poster', 'poster-1', 'gallery', 'Poster 01', 700, 900, 72, 108),
  standing('poster-2', 'poster', 'poster-2', 'gallery', 'Poster 02', 960, 900, 72, 108),
  // Navigation Hub — holographic globe (teleport map)
  standing('console-nav', 'map', 'map', 'hub', 'Navigation globe', 1380, 670, 100, 124),
];

export const inRect = (p: Point, r: Rect) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h;
export const rectsTouch = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
