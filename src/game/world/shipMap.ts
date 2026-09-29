// The ship layout: rooms, corridors, doors and interactive objects.
// All coordinates are world units (1 unit = 1 source pixel of Tobby's sprite).
//
// Rooms are drawn in a 3/4 top-down view: the top band of every room is the
// back wall (not walkable; height = wallOf(room)); the rest is floor.
// Corridors are floor strips that overlap rooms where a doorway is.
//
// Layout (west → east): Cockpit (nose) — main corridor — Project Lab above /
// Skills Database below — Navigation Hub — Design Archive above / About below —
// airlock + engines (tail).
//
// Interactables only reference content by id — the content itself lives in src/data/.
// Purely visual furniture lives in ./decor.ts.


export interface Rect { x: number; y: number; w: number; h: number }
export interface Point { x: number; y: number }

export type RoomId = 'cockpit' | 'hub' | 'lab' | 'skills' | 'about' | 'gallery';

export interface Room {
  id: RoomId;
  name: string;
  rect: Rect;
  spawn: Point;
  /** back-wall height; defaults to WALL */
  wall?: number;
}

export type InteractKind =
  | 'project' | 'skills' | 'about' | 'contact' | 'poster' | 'map' | 'briefing' | 'gallery' | 'telescope' | 'jokes';

/** Which way an object faces — decides where Tobby stands to use it. */
export type Facing = 'down' | 'left' | 'right';

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
  facing: Facing;
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
const GALLERY_WALL = 128;
export const WORLD: Rect = { x: 0, y: 0, w: 2360, h: 1140 };

export const rooms: Room[] = [
  { id: 'cockpit', name: 'Cockpit', rect: { x: 80, y: 360, w: 360, h: 380 }, spawn: { x: 330, y: 650 } },
  { id: 'lab', name: 'Project Lab', rect: { x: 520, y: 40, w: 620, h: 400 }, spawn: { x: 830, y: 400 } },
  { id: 'skills', name: 'Skills Database', rect: { x: 540, y: 690, w: 580, h: 400 }, spawn: { x: 830, y: 850 } },
  { id: 'hub', name: 'Navigation Hub', rect: { x: 1180, y: 330, w: 400, h: 460 }, spawn: { x: 1380, y: 740 } },
  {
    id: 'gallery', name: 'Design Archive', rect: { x: 1620, y: 40, w: 620, h: 400 }, spawn: { x: 1930, y: 400 },
    wall: GALLERY_WALL,
  },
  { id: 'about', name: 'About + Contact', rect: { x: 1660, y: 690, w: 540, h: 360 }, spawn: { x: 1930, y: 820 } },
];

export const roomById = Object.fromEntries(rooms.map((r) => [r.id, r])) as Record<RoomId, Room>;
export const wallOf = (room: Room | RoomId) => (typeof room === 'string' ? roomById[room] : room).wall ?? WALL;

/** Main corridor segments (drawn as the ship's central walkway). */
export const spines: Rect[] = [
  { x: 420, y: 520, w: 780, h: 90 }, // cockpit → hub
  { x: 1560, y: 520, w: 640, h: 90 }, // hub → airlock
];

/** Short vertical links between the main corridor and the rooms. */
export const connectors: Rect[] = [
  { x: 790, y: 420, w: 80, h: 120 }, // lab
  { x: 790, y: 590, w: 80, h: 690 + WALL + 10 - 590 }, // skills
  { x: 1890, y: 420, w: 80, h: 120 }, // archive
  { x: 1890, y: 590, w: 80, h: 190 }, // about (through its back wall)
];

export const corridors: Rect[] = [...spines, ...connectors];

export const doors: Door[] = [
  { id: 'cockpit-e', rect: { x: 432, y: 520, w: 16, h: 90 }, axis: 'v', kind: 'normal' },
  { id: 'lab-s', rect: { x: 790, y: 432, w: 80, h: 16 }, axis: 'h', kind: 'transition' },
  { id: 'skills-n', rect: { x: 790, y: 690, w: 80, h: WALL }, axis: 'h', kind: 'transition' },
  { id: 'hub-w', rect: { x: 1172, y: 520, w: 16, h: 90 }, axis: 'v', kind: 'normal' },
  { id: 'hub-e', rect: { x: 1572, y: 520, w: 16, h: 90 }, axis: 'v', kind: 'normal' },
  { id: 'gallery-s', rect: { x: 1890, y: 432, w: 80, h: 16 }, axis: 'h', kind: 'transition' },
  { id: 'about-n', rect: { x: 1890, y: 690, w: 80, h: WALL }, axis: 'h', kind: 'transition' },
  { id: 'airlock', rect: { x: 2192, y: 520, w: 16, h: 90 }, axis: 'v', kind: 'airlock', locked: true },
];

/** Walkable floor = room floors (minus back wall) + corridors. */
export const floors: Rect[] = [
  ...rooms.map((r) => ({ x: r.rect.x, y: r.rect.y + wallOf(r), w: r.rect.w, h: r.rect.h - wallOf(r) })),
  ...corridors,
];

function standing(
  id: string, kind: InteractKind, refId: string, room: RoomId, label: string,
  cx: number, baseY: number, w: number, h: number, facing: Facing = 'down',
): Interactable {
  const zone = facing === 'down'
    ? { x: cx - w / 2 - 22, y: baseY - 30, w: w + 44, h: 86 }
    : facing === 'left'
      ? { x: cx - w / 2 - 72, y: baseY - 64, w: 76, h: 96 }
      : { x: cx + w / 2 - 4, y: baseY - 64, w: 76, h: 96 };
  return {
    id, kind, refId, room, label, facing,
    base: { x: cx, y: baseY },
    size: { w, h },
    solid: { x: cx - w / 2, y: baseY - 26, w, h: 26 },
    zone,
  };
}

/** Wall-mounted object whose frame hangs with its bottom at `bottomY`. */
function wallMounted(
  id: string, kind: InteractKind, refId: string, room: RoomId, label: string,
  cx: number, w: number, h: number, bottomY?: number,
): Interactable {
  const r = roomById[room].rect;
  const floorTop = r.y + wallOf(room);
  return {
    id, kind, refId, room, label, facing: 'down',
    base: { x: cx, y: bottomY ?? floorTop - 10 },
    size: { w, h },
    solid: null,
    zone: { x: cx - Math.max(w, 44) / 2 - 8, y: floorTop, w: Math.max(w, 44) + 16, h: 70 },
  };
}

export const interactables: Interactable[] = [
  // Cockpit — flight console opens the welcome briefing
  standing('console-briefing', 'briefing', 'briefing', 'cockpit', 'Flight console', 170, 590, 96, 64),

  // Project Lab — five distinct workstations spread around the room
  standing('machine-eta', 'project', 'eta', 'lab', 'Delivery ETA Prediction', 632, 200, 130, 96),
  standing('machine-meal', 'project', 'meal', 'lab', 'Meal Demand Forecasting', 1040, 190, 88, 124),
  standing('machine-resync', 'project', 'resync', 'lab', 'ReSync AI', 830, 256, 100, 104),
  standing('machine-tiny', 'project', 'tiny', 'lab', 'Tiny Projects', 592, 372, 112, 74, 'right'),
  standing('machine-heart', 'project', 'heart', 'lab', 'Heart Disease Prediction', 1072, 368, 92, 96, 'left'),

  // Skills Database — three terminals in a shallow arc
  standing('terminal-code-data', 'skills', 'code-data', 'skills', 'Code & Data', 700, 930, 70, 96),
  standing('terminal-ml-analytics', 'skills', 'ml-analytics', 'skills', 'ML & Forecasting', 850, 900, 70, 96),
  standing('terminal-build-tools', 'skills', 'build-tools', 'skills', 'Build & Tools', 1000, 930, 70, 96),
  standing('joke-shelf', 'jokes', 'jokes', 'skills', 'Joke shelf', 850, 1030, 60, 108, 'right'),

  // About + Contact
  wallMounted('board-about', 'about', 'about', 'about', 'About Afreen', 1760, 110, 60),
  standing('terminal-contact', 'contact', 'contact', 'about', 'Contact', 2110, 960, 64, 88),

  // Design Archive — five framed works (four on the back wall, one on a display wall) + gallery computer
  wallMounted('art-internship', 'poster', 'internship', 'gallery', 'Internship Experience', 1712, 112, 86, 150),
  wallMounted('art-brand', 'poster', 'brand', 'gallery', 'Personal Brand', 1814, 58, 58, 120),
  wallMounted('art-skincare', 'poster', 'skincare', 'gallery', 'Fashwash Commercial', 2010, 66, 88, 146),
  wallMounted('art-nike', 'poster', 'nike', 'gallery', 'NIKE AIR', 2124, 74, 98, 156),
  standing('art-assignment', 'poster', 'assignment', 'gallery', 'Internship Selection Task', 1758, 360, 150, 118),
  standing('gallery-computer', 'gallery', 'gallery', 'gallery', 'Gallery computer', 1940, 334, 124, 104),

  // Navigation Hub — holographic globe (teleport map) and a telescope
  standing('console-nav', 'map', 'map', 'hub', 'Navigation globe', 1380, 670, 100, 124),
  standing('telescope', 'telescope', 'telescope', 'hub', 'Telescope', 1484, 500, 54, 80),
];

export const inRect = (p: Point, r: Rect) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h;
export const rectsTouch = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
