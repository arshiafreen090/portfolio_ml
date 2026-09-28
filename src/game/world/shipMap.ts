// The ship layout: rooms, corridors, doors and interactive objects.
// All coordinates are world units (1 unit = 1 source pixel of Tobby's sprite).
//
// Rooms are drawn in a 3/4 top-down view: the top WALL band of every room is
// the back wall (not walkable); the rest is floor. Corridors are plain floor
// strips that overlap rooms where a doorway is.
//
// Interactables only reference content by id — the content itself lives in src/data/.

import type { ProjectId } from '../../data/types';

export interface Rect { x: number; y: number; w: number; h: number }
export interface Point { x: number; y: number }

export type RoomId = 'hub' | 'lab' | 'skills' | 'about' | 'gallery';

export interface Room {
  id: RoomId;
  name: string;
  rect: Rect;
  spawn: Point;
}

export type InteractKind = 'project' | 'skills' | 'about' | 'contact' | 'poster' | 'map';

export interface Interactable {
  id: string;
  kind: InteractKind;
  /** id into the matching data source (project id, skill terminal id, design id…) */
  refId: string;
  room: RoomId;
  label: string;
  /** bottom-centre of the object; sprites are drawn up from here */
  base: Point;
  /** visual footprint used by placeholders (w × h, drawn up from base) */
  size: { w: number; h: number };
  /** wall-mounted objects (posters) have no collision */
  solid: Rect | null;
  /** Tobby's feet must be inside this to interact */
  zone: Rect;
}

export interface Door {
  id: string;
  rect: Rect;
  /** 'h' = panels slide sideways (doorway in a horizontal wall), 'v' = vertical wall */
  axis: 'h' | 'v';
}

export const WALL = 80;
export const WORLD: Rect = { x: 0, y: 0, w: 1800, h: 1060 };

export const rooms: Room[] = [
  { id: 'hub', name: 'Cockpit', rect: { x: 740, y: 360, w: 320, h: 360 }, spawn: { x: 900, y: 670 } },
  { id: 'lab', name: 'Project Lab', rect: { x: 40, y: 40, w: 600, h: 380 }, spawn: { x: 340, y: 340 } },
  { id: 'gallery', name: 'Design Archive', rect: { x: 120, y: 700, w: 520, h: 320 }, spawn: { x: 380, y: 950 } },
  { id: 'skills', name: 'Skills Database', rect: { x: 1160, y: 40, w: 600, h: 380 }, spawn: { x: 1460, y: 340 } },
  { id: 'about', name: 'About + Contact', rect: { x: 1160, y: 700, w: 520, h: 320 }, spawn: { x: 1420, y: 950 } },
];

export const roomById = Object.fromEntries(rooms.map((r) => [r.id, r])) as Record<RoomId, Room>;

export const corridors: Rect[] = [
  { x: 560, y: 400, w: 80, h: 400 }, // west spine: lab ↔ archive
  { x: 620, y: 520, w: 140, h: 80 }, // west corridor → hub
  { x: 1160, y: 400, w: 80, h: 400 }, // east spine: skills ↔ about
  { x: 1040, y: 520, w: 140, h: 80 }, // east corridor → hub
];

export const doors: Door[] = [
  { id: 'lab-s', rect: { x: 560, y: 412, w: 80, h: 16 }, axis: 'h' },
  { id: 'gallery-n', rect: { x: 560, y: 700, w: 80, h: WALL }, axis: 'h' },
  { id: 'skills-s', rect: { x: 1160, y: 412, w: 80, h: 16 }, axis: 'h' },
  { id: 'about-n', rect: { x: 1160, y: 700, w: 80, h: WALL }, axis: 'h' },
  { id: 'hub-w', rect: { x: 732, y: 520, w: 16, h: 80 }, axis: 'v' },
  { id: 'hub-e', rect: { x: 1052, y: 520, w: 16, h: 80 }, axis: 'v' },
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
    base: { x: cx, y: floorTop - 8 },
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
  // Project Lab — exactly five machines along the back wall
  ...LAB_MACHINES.map((m, i) =>
    standing(`machine-${m.id}`, 'project', m.id, 'lab', m.label, 100 + i * 115, 175, 74, 104),
  ),
  // Skills Database — three terminals
  standing('terminal-code-data', 'skills', 'code-data', 'skills', 'Code & Data', 1320, 175, 70, 92),
  standing('terminal-ml-analytics', 'skills', 'ml-analytics', 'skills', 'ML & Analytics', 1470, 175, 70, 92),
  standing('terminal-build-tools', 'skills', 'build-tools', 'skills', 'Build & Tools', 1620, 175, 70, 92),
  // About + Contact
  wallMounted('board-about', 'about', 'about', 'about', 'About Afreen', 1330, 110, 62),
  standing('terminal-contact', 'contact', 'contact', 'about', 'Contact', 1560, 850, 64, 84),
  // Design Archive — exactly two posters
  wallMounted('poster-1', 'poster', 'poster-1', 'gallery', 'Poster 01', 240, 56, 62),
  wallMounted('poster-2', 'poster', 'poster-2', 'gallery', 'Poster 02', 520, 56, 62),
  // Cockpit — navigation console (teleport map)
  standing('console-nav', 'map', 'map', 'hub', 'Navigation console', 900, 560, 96, 70),
];

export const inRect = (p: Point, r: Rect) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h;
export const rectsTouch = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
