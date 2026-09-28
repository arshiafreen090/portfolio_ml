// Asset manifest — every piece of final art is swapped in here.
//
// Paths are relative to public/. `null` means "draw the built-in placeholder".
// The procedural pixel art is drawn in code (src/game/art/) and never baked
// into image files, so setting an entry below fully replaces that piece.
//
// Room images are stretched to the room's rectangle in src/game/world/shipMap.ts,
// so export them at that aspect ratio (any integer multiple of the size).
// Machine images are drawn with their bottom-centre on the machine's base point.

import type { ProjectId } from './types';
import type { PropKind } from '../game/world/decor';
import type { RoomId } from '../game/world/shipMap';

export interface AssetManifest {
  tobby: { image: string; atlas: string };
  avatar: string;
  /** Optional tiled space backdrop. null = procedural starfield. */
  space: string | null;
  /** Optional full ship image (hull, corridors, rooms) replacing the procedural shell; covers the world rect. */
  hull: string | null;
  rooms: Record<RoomId, string | null>;
  machines: Record<ProjectId, string | null>;
  /** Other interactive props, drawn bottom-centre on their base point like machines. */
  props: Record<PropId, string | null>;
  /** Furniture sprites (plants, shelves, couch…), drawn bottom-centre. Missing = procedural. */
  decor: Partial<Record<PropKind, string>>;
}

export type PropId = 'skillTerminal' | 'contactTerminal' | 'aboutBoard' | 'navConsole' | 'briefingConsole';

export const assetManifest: AssetManifest = {
  tobby: { image: 'assets/character/tobby.png', atlas: 'assets/character/tobby.json' },
  avatar: 'assets/ui/avatar.png',
  space: null,
  hull: null,
  rooms: {
    cockpit: null,
    hub: null,
    lab: null,
    skills: null,
    about: null,
    gallery: null,
  },
  machines: {
    eta: null,
    meal: null,
    heart: null,
    tiny: null,
    resync: null,
  },
  props: {
    skillTerminal: null,
    contactTerminal: null,
    aboutBoard: null,
    navConsole: null,
    briefingConsole: null,
  },
  decor: {},
};

export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
