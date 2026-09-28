// Purely visual furniture and fittings. Nothing here opens a popup; some items
// react when Tobby is near (plants sway, shelves highlight a book, lamps brighten).
//
// - `props`   standing objects, y-sorted with Tobby, with a small collision footprint
// - `wallItems` things fixed to a room's back wall (windows, screens, shelves, lights…)
// - `floorItems` rugs, inlays, light strips and cable runs baked into the floor

import type { RoomId } from './shipMap';

export type PropKind =
  | 'plant' | 'plantTall' | 'planter' | 'bookshelf' | 'couch' | 'lamp' | 'sideTable'
  | 'artDesk' | 'easel' | 'seat' | 'crates' | 'serverRack' | 'workbench' | 'beanBag';

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
  easel: { w: 50, h: 88, depth: 14 },
  seat: { w: 34, h: 44, depth: 18 },
  crates: { w: 44, h: 42, depth: 20 },
  serverRack: { w: 44, h: 104, depth: 22 },
  workbench: { w: 72, h: 60, depth: 24 },
  beanBag: { w: 46, h: 30, depth: 20 },
};

/** Props that respond to Tobby being close. */
export const REACTIVE: Partial<Record<PropKind, true>> = {
  plant: true, plantTall: true, planter: true, bookshelf: true, lamp: true, serverRack: true, beanBag: true,
};

export const props: Prop[] = [
  // Cockpit
  { id: 'ck-seat-1', kind: 'seat', room: 'cockpit', x: 268, y: 560 },
  { id: 'ck-seat-2', kind: 'seat', room: 'cockpit', x: 268, y: 690 },
  { id: 'ck-plant', kind: 'plantTall', room: 'cockpit', x: 412, y: 478 },
  { id: 'ck-plant-2', kind: 'plant', room: 'cockpit', x: 108, y: 728 },
  { id: 'ck-crates', kind: 'crates', room: 'cockpit', x: 408, y: 732 },

  // Project Lab
  { id: 'lab-rack', kind: 'serverRack', room: 'lab', x: 548, y: 330 },
  { id: 'lab-bench', kind: 'workbench', room: 'lab', x: 1100, y: 340 },
  { id: 'lab-plant', kind: 'plantTall', room: 'lab', x: 546, y: 432 },
  { id: 'lab-plant-2', kind: 'plant', room: 'lab', x: 1118, y: 432 },
  { id: 'lab-crates', kind: 'crates', room: 'lab', x: 1112, y: 262 },

  // Skills Database
  { id: 'sk-shelf-1', kind: 'bookshelf', room: 'skills', x: 1662, y: 196 },
  { id: 'sk-shelf-2', kind: 'bookshelf', room: 'skills', x: 2198, y: 196 },
  { id: 'sk-plant', kind: 'plantTall', room: 'skills', x: 1648, y: 432 },
  { id: 'sk-bag', kind: 'beanBag', room: 'skills', x: 2170, y: 405 },
  { id: 'sk-plant-2', kind: 'plant', room: 'skills', x: 2222, y: 330 },

  // Design Archive
  { id: 'ga-desk', kind: 'artDesk', room: 'gallery', x: 648, y: 822 },
  { id: 'ga-easel', kind: 'easel', room: 'gallery', x: 1044, y: 836 },
  { id: 'ga-plant', kind: 'plantTall', room: 'gallery', x: 586, y: 1042 },
  { id: 'ga-plant-2', kind: 'plant', room: 'gallery', x: 1078, y: 1042 },

  // About + Contact
  { id: 'ab-couch', kind: 'couch', room: 'about', x: 2072, y: 830 },
  { id: 'ab-lamp', kind: 'lamp', room: 'about', x: 1984, y: 832 },
  { id: 'ab-table', kind: 'sideTable', room: 'about', x: 2166, y: 832 },
  { id: 'ab-shelf', kind: 'bookshelf', room: 'about', x: 1694, y: 896 },
  { id: 'ab-plant', kind: 'plantTall', room: 'about', x: 1684, y: 1042 },
  { id: 'ab-plant-2', kind: 'plant', room: 'about', x: 2182, y: 1042 },

  // Navigation Hub — four corner planters
  { id: 'hub-pl-1', kind: 'planter', room: 'hub', x: 1214, y: 452 },
  { id: 'hub-pl-2', kind: 'planter', room: 'hub', x: 1546, y: 452 },
  { id: 'hub-pl-3', kind: 'plantTall', room: 'hub', x: 1204, y: 784 },
  { id: 'hub-pl-4', kind: 'plantTall', room: 'hub', x: 1556, y: 784 },
];

export type WallKind = 'window' | 'screen' | 'shelf' | 'sconce' | 'vent' | 'frame' | 'sign' | 'porthole';

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
  { id: 'lab-vent-1', kind: 'vent', room: 'lab', x: 538, y: 84, w: 28, h: 14 },
  { id: 'lab-vent-2', kind: 'vent', room: 'lab', x: 1098, y: 84, w: 28, h: 14 },

  // Skills Database
  { id: 'sk-big', kind: 'screen', room: 'skills', x: 1830, y: 50, w: 200, h: 60, variant: 'bigdata' },
  { id: 'sk-code', kind: 'screen', room: 'skills', x: 1730, y: 62, w: 56, h: 38, variant: 'code' },
  { id: 'sk-chart', kind: 'screen', room: 'skills', x: 2074, y: 62, w: 56, h: 38, variant: 'chart' },
  { id: 'sk-sc-1', kind: 'sconce', room: 'skills', x: 1806, y: 60, w: 12, h: 10 },
  { id: 'sk-sc-2', kind: 'sconce', room: 'skills', x: 2042, y: 60, w: 12, h: 10 },

  // Design Archive
  { id: 'ga-shelf-1', kind: 'shelf', room: 'gallery', x: 600, y: 716, w: 90, h: 30, variant: 'supplies' },
  { id: 'ga-shelf-2', kind: 'shelf', room: 'gallery', x: 930, y: 716, w: 110, h: 30, variant: 'books' },
  { id: 'ga-sc-1', kind: 'sconce', room: 'gallery', x: 760, y: 704, w: 12, h: 10 },
  { id: 'ga-sc-2', kind: 'sconce', room: 'gallery', x: 888, y: 704, w: 12, h: 10 },

  // About + Contact
  { id: 'ab-win', kind: 'window', room: 'about', x: 2000, y: 702, w: 110, h: 50 },
  { id: 'ab-frame-1', kind: 'frame', room: 'about', x: 2130, y: 708, w: 22, h: 26, variant: 'plant' },
  { id: 'ab-frame-2', kind: 'frame', room: 'about', x: 2160, y: 716, w: 22, h: 22, variant: 'star' },
  { id: 'ab-sc', kind: 'sconce', room: 'about', x: 1846, y: 704, w: 12, h: 10 },

  // Navigation Hub
  { id: 'hub-porthole', kind: 'porthole', room: 'hub', x: 1350, y: 338, w: 60, h: 60 },
  { id: 'hub-sc-l', kind: 'screen', room: 'hub', x: 1226, y: 344, w: 64, h: 40, variant: 'map' },
  { id: 'hub-sc-r', kind: 'screen', room: 'hub', x: 1470, y: 344, w: 64, h: 40, variant: 'radar' },
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
  { kind: 'rug', x: 720, y: 292, w: 220, h: 92, color: 'lavender' },
  { kind: 'strip', x: 560, y: 226, w: 540, h: 3 },
  { kind: 'strip', x: 828, y: 386, w: 3, h: 54 },
  { kind: 'strip', x: 1928, y: 360, w: 3, h: 80 },
  { kind: 'cable', x: 560, y: 214, w: 12, h: 110 },
  { kind: 'roundRug', x: 1760, y: 248, w: 340, h: 110, color: 'blue' },
  { kind: 'rug', x: 752, y: 880, w: 156, h: 96, color: 'peach' },
  { kind: 'roundRug', x: 1790, y: 880, w: 250, h: 110, color: 'pink' },
  { kind: 'hubRings', x: 1380, y: 650, w: 150, h: 96 },
];
