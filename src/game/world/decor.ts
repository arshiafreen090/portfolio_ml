// Purely visual furniture and fittings. Nothing here opens a popup; some items
// react when Tobby is near (plants sway, shelves highlight a book, lamps brighten).
//
// - `props`      standing objects, y-sorted with Tobby, with a small collision footprint
// - `wallItems`  things fixed to a room's back wall (windows, screens, shelves, lights…)
// - `floorItems` rugs, inlays, light strips and cable runs baked into the floor

import type { RoomId } from './shipMap';

export type PropKind =
  | 'plant' | 'plantTall' | 'planter' | 'bookshelf' | 'couch' | 'lamp' | 'sideTable'
  | 'artDesk' | 'seat' | 'crates' | 'serverRack' | 'beanBag' | 'cone' | 'plinth';

export interface Prop {
  id: string;
  kind: PropKind;
  room: RoomId;
  /** bottom-centre */
  x: number;
  y: number;
  /** mirror horizontally */
  flip?: boolean;
}

/** Sprite footprint: width, height (drawn up from the base) and collision depth. */
export const PROP_SIZE: Record<PropKind, { w: number; h: number; depth: number }> = {
  plant: { w: 26, h: 34, depth: 12 },
  plantTall: { w: 34, h: 62, depth: 14 },
  planter: { w: 56, h: 40, depth: 18 },
  bookshelf: { w: 60, h: 108, depth: 22 },
  couch: { w: 150, h: 58, depth: 30 },
  lamp: { w: 22, h: 78, depth: 10 },
  sideTable: { w: 30, h: 34, depth: 14 },
  artDesk: { w: 100, h: 58, depth: 24 },
  seat: { w: 34, h: 44, depth: 18 },
  crates: { w: 44, h: 42, depth: 20 },
  serverRack: { w: 44, h: 104, depth: 22 },
  beanBag: { w: 46, h: 30, depth: 20 },
  cone: { w: 14, h: 18, depth: 8 },
  plinth: { w: 30, h: 58, depth: 16 },
};

/** Props that respond to Tobby being close. */
export const REACTIVE: Partial<Record<PropKind, true>> = {
  plant: true, plantTall: true, planter: true, bookshelf: true, lamp: true, serverRack: true, beanBag: true, plinth: true,
};

export const props: Prop[] = [
  // Cockpit
  { id: 'ck-seat-1', kind: 'seat', room: 'cockpit', x: 268, y: 560 },
  { id: 'ck-seat-2', kind: 'seat', room: 'cockpit', x: 268, y: 690 },
  { id: 'ck-plant', kind: 'plantTall', room: 'cockpit', x: 412, y: 478 },
  { id: 'ck-plant-2', kind: 'plant', room: 'cockpit', x: 108, y: 728 },
  { id: 'ck-crates', kind: 'crates', room: 'cockpit', x: 408, y: 732 },

  // Project Lab — rack + shelf along the back wall, construction cones by ReSync
  { id: 'lab-rack', kind: 'serverRack', room: 'lab', x: 738, y: 152 },
  { id: 'lab-shelf', kind: 'bookshelf', room: 'lab', x: 932, y: 150 },
  { id: 'lab-cone-1', kind: 'cone', room: 'lab', x: 768, y: 262 },
  { id: 'lab-cone-2', kind: 'cone', room: 'lab', x: 893, y: 262 },
  { id: 'lab-crates', kind: 'crates', room: 'lab', x: 1112, y: 262 },
  { id: 'lab-plant', kind: 'plantTall', room: 'lab', x: 546, y: 432 },
  { id: 'lab-plant-2', kind: 'plant', room: 'lab', x: 1118, y: 432 },
  { id: 'lab-plant-3', kind: 'plant', room: 'lab', x: 546, y: 240 },

  // Skills Database
  { id: 'sk-shelf-1', kind: 'bookshelf', room: 'skills', x: 1662, y: 196 },
  { id: 'sk-shelf-2', kind: 'bookshelf', room: 'skills', x: 2198, y: 196 },
  { id: 'sk-plant', kind: 'plantTall', room: 'skills', x: 1648, y: 432 },
  { id: 'sk-bag', kind: 'beanBag', room: 'skills', x: 2170, y: 405 },
  { id: 'sk-plant-2', kind: 'plant', room: 'skills', x: 2222, y: 330 },

  // Design Archive — design desk, bookshelf, a small sculpture, plants
  { id: 'ga-desk', kind: 'artDesk', room: 'gallery', x: 1040, y: 910 },
  { id: 'ga-shelf', kind: 'bookshelf', room: 'gallery', x: 1082, y: 1080 },
  { id: 'ga-plinth', kind: 'plinth', room: 'gallery', x: 960, y: 1070 },
  { id: 'ga-plant', kind: 'plantTall', room: 'gallery', x: 562, y: 866 },
  { id: 'ga-plant-2', kind: 'plant', room: 'gallery', x: 560, y: 1084 },
  { id: 'ga-plant-3', kind: 'plant', room: 'gallery', x: 1104, y: 850 },

  // About + Contact
  { id: 'ab-couch', kind: 'couch', room: 'about', x: 2072, y: 830 },
  { id: 'ab-lamp', kind: 'lamp', room: 'about', x: 1984, y: 832 },
  { id: 'ab-table', kind: 'sideTable', room: 'about', x: 2166, y: 832 },
  { id: 'ab-shelf', kind: 'bookshelf', room: 'about', x: 1694, y: 896 },
  { id: 'ab-plant', kind: 'plantTall', room: 'about', x: 1684, y: 1042 },
  { id: 'ab-plant-2', kind: 'plant', room: 'about', x: 2182, y: 1042 },

  // Navigation Hub — corner planters
  { id: 'hub-pl-1', kind: 'planter', room: 'hub', x: 1214, y: 452 },
  { id: 'hub-pl-2', kind: 'planter', room: 'hub', x: 1546, y: 452 },
  { id: 'hub-pl-3', kind: 'plantTall', room: 'hub', x: 1204, y: 784 },
  { id: 'hub-pl-4', kind: 'plantTall', room: 'hub', x: 1556, y: 784 },
];

export type WallKind =
  | 'window' | 'screen' | 'shelf' | 'sconce' | 'vent' | 'frame' | 'sign' | 'porthole' | 'spot' | 'panel' | 'fan';

export type ScreenVariant = 'bigdata' | 'code' | 'chart' | 'map' | 'radar' | 'stars';

export interface WallItem {
  id: string;
  kind: WallKind;
  room: RoomId;
  x: number;
  y: number;
  w: number;
  h: number;
  /** screen content, sign text, frame picture… */
  variant?: string;
}

export const wallItems: WallItem[] = [
  // Cockpit: wide front-facing windows
  { id: 'ck-win-1', kind: 'window', room: 'cockpit', x: 104, y: 372, w: 144, h: 54 },
  { id: 'ck-win-2', kind: 'window', room: 'cockpit', x: 272, y: 372, w: 144, h: 54 },

  // Project Lab
  { id: 'lab-sc-1', kind: 'sconce', room: 'lab', x: 548, y: 60, w: 12, h: 10 },
  { id: 'lab-sc-2', kind: 'sconce', room: 'lab', x: 1112, y: 60, w: 12, h: 10 },
  { id: 'lab-screen', kind: 'screen', room: 'lab', x: 796, y: 56, w: 68, h: 40, variant: 'code' },
  { id: 'lab-panel', kind: 'panel', room: 'lab', x: 872, y: 64, w: 26, h: 30 },
  { id: 'lab-panel-2', kind: 'panel', room: 'lab', x: 668, y: 62, w: 22, h: 30 },
  { id: 'lab-fan', kind: 'fan', room: 'lab', x: 574, y: 70, w: 26, h: 26 },
  { id: 'lab-vent', kind: 'vent', room: 'lab', x: 1098, y: 84, w: 28, h: 14 },

  // Skills Database
  { id: 'sk-big', kind: 'screen', room: 'skills', x: 1830, y: 50, w: 200, h: 60, variant: 'bigdata' },
  { id: 'sk-code', kind: 'screen', room: 'skills', x: 1730, y: 62, w: 56, h: 38, variant: 'code' },
  { id: 'sk-chart', kind: 'screen', room: 'skills', x: 2074, y: 62, w: 56, h: 38, variant: 'chart' },
  { id: 'sk-sc-1', kind: 'sconce', room: 'skills', x: 1806, y: 60, w: 12, h: 10 },
  { id: 'sk-sc-2', kind: 'sconce', room: 'skills', x: 2042, y: 60, w: 12, h: 10 },
  { id: 'sk-fan', kind: 'fan', room: 'skills', x: 2146, y: 72, w: 24, h: 24 },

  // Design Archive — warm spotlights over the four wall-mounted works, a small supplies shelf
  { id: 'ga-spot-1', kind: 'spot', room: 'gallery', x: 632, y: 698, w: 112, h: 100 },
  { id: 'ga-spot-2', kind: 'spot', room: 'gallery', x: 734, y: 698, w: 58, h: 70 },
  { id: 'ga-spot-3', kind: 'spot', room: 'gallery', x: 930, y: 698, w: 66, h: 96 },
  { id: 'ga-spot-4', kind: 'spot', room: 'gallery', x: 1044, y: 698, w: 74, h: 106 },
  { id: 'ga-shelf', kind: 'shelf', room: 'gallery', x: 1086, y: 744, w: 30, h: 28, variant: 'supplies' },

  // About + Contact
  { id: 'ab-win', kind: 'window', room: 'about', x: 2000, y: 702, w: 110, h: 50 },
  { id: 'ab-frame-1', kind: 'frame', room: 'about', x: 2130, y: 708, w: 22, h: 26, variant: 'plant' },
  { id: 'ab-frame-2', kind: 'frame', room: 'about', x: 2160, y: 716, w: 22, h: 22, variant: 'star' },
  { id: 'ab-sc', kind: 'sconce', room: 'about', x: 1846, y: 704, w: 12, h: 10 },

  // Navigation Hub
  { id: 'hub-porthole', kind: 'porthole', room: 'hub', x: 1350, y: 338, w: 60, h: 60 },
  { id: 'hub-sc-l', kind: 'screen', room: 'hub', x: 1226, y: 344, w: 64, h: 40, variant: 'map' },
  { id: 'hub-sc-r', kind: 'screen', room: 'hub', x: 1470, y: 344, w: 64, h: 40, variant: 'radar' },
  { id: 'hub-panel', kind: 'panel', room: 'hub', x: 1304, y: 352, w: 24, h: 30 },
  { id: 'hub-sign-l', kind: 'sign', room: 'hub', x: 1196, y: 390, w: 124, h: 14, variant: '◀ LAB · ARCHIVE' },
  { id: 'hub-sign-r', kind: 'sign', room: 'hub', x: 1440, y: 390, w: 124, h: 14, variant: 'SKILLS · ABOUT ▶' },
];

export type FloorKind = 'rug' | 'roundRug' | 'hubRings' | 'strip' | 'cable';

export interface FloorItem {
  kind: FloorKind;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
}

export const floorItems: FloorItem[] = [
  { kind: 'strip', x: 250, y: 600, w: 190, h: 4 },
  // Lab: walkway from the door, a rug, cable runs to the workstations
  { kind: 'strip', x: 828, y: 318, w: 3, h: 122 },
  { kind: 'rug', x: 900, y: 300, w: 110, h: 64, color: 'lavender' },
  { kind: 'cable', x: 736, y: 154, w: 12, h: 90 },
  { kind: 'cable', x: 1000, y: 196, w: 12, h: 130 },
  { kind: 'strip', x: 1928, y: 360, w: 3, h: 80 },
  { kind: 'roundRug', x: 1760, y: 248, w: 340, h: 110, color: 'blue' },
  // Archive: rug under the gallery computer
  { kind: 'roundRug', x: 740, y: 912, w: 220, h: 120, color: 'peach' },
  { kind: 'roundRug', x: 1790, y: 880, w: 250, h: 110, color: 'pink' },
  { kind: 'hubRings', x: 1380, y: 650, w: 150, h: 96 },
];
