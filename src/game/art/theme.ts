// Palette for the procedural ship art. Keep in sync with src/styles/tokens.css.
import type { RoomId } from '../world/shipMap';

export const P = {
  space: '#141a36',
  spaceDeep: '#0e1229',
  navy: '#2d3668',
  navyDeep: '#1f2550',
  navyInk: '#181d42',

  hull: '#eee3d4',
  hullLight: '#fbf5ec',
  hullShade: '#d8c8b6',
  hullDark: '#b7a28c',

  lavender: '#b8b2e3',
  lavenderSoft: '#e6e2f6',
  lavenderDeep: '#8e87c6',
  violet: '#6f67b3',

  peach: '#f0a877',
  peachSoft: '#fbe0cc',
  peachDeep: '#d98a57',
  pink: '#e9738f',
  pinkSoft: '#f8c6d2',
  pinkDeep: '#c9536f',

  cyan: '#7fd6ee',
  cyanSoft: '#c9eef8',
  cyanDeep: '#3f9fc4',
  blue: '#6f78c9',
  blueSoft: '#dfe5f6',
  blueDeep: '#4a54a8',
  mint: '#8fd6b4',
  mintDeep: '#4fa585',

  screen: '#1b2350',
  screenOff: '#262e5c',
  screenLine: '#2f3a72',

  warm: '#ffd6a0',
  cream: '#fbf4ea',
  paper: '#fffaf3',

  leaf: '#7cc58a',
  leafDeep: '#4f9a6a',
  leafLight: '#b1e0a4',
  wood: '#d9a878',
  woodDeep: '#b98457',
  woodLight: '#ecc497',
  pot: '#e39a7a',
  potDeep: '#c27658',

  corridor: '#555c98',
  corridorDeep: '#454b86',
  corridorLine: '#6970aa',
  rail: '#e6def3',

  star: '#f6efe6',
} as const;

export type FloorPattern = 'tiles' | 'planks' | 'checker' | 'carpet' | 'hub';

export interface RoomTheme {
  floorA: string;
  floorB: string;
  floorLine: string;
  pattern: FloorPattern;
  tile: number;
  wall: string;
  wallShade: string;
  wallTrim: string;
  /** signature colour: room sign, trims, light strips */
  accent: string;
  /** warm/cool colour of ceiling light pools */
  light: string;
}

export const THEMES: Record<RoomId, RoomTheme> = {
  cockpit: {
    floorA: '#d6d0ee', floorB: '#cdc6e8', floorLine: '#bdb5df', pattern: 'carpet', tile: 16,
    wall: '#5b62a0', wallShade: '#474e8c', wallTrim: '#8e87c6', accent: P.cyan, light: '#bfe9ff',
  },
  hub: {
    floorA: '#f3e8d9', floorB: '#ede0cf', floorLine: '#e0d0bc', pattern: 'hub', tile: 40,
    wall: '#e4dff4', wallShade: '#cfc8ea', wallTrim: P.lavenderDeep, accent: P.lavender, light: P.warm,
  },
  lab: {
    floorA: '#eee9f1', floorB: '#e7e0ec', floorLine: '#d8cfe2', pattern: 'tiles', tile: 32,
    wall: '#f3ebe1', wallShade: '#e2d5c6', wallTrim: P.peach, accent: P.peach, light: P.warm,
  },
  skills: {
    floorA: '#e8e4f3', floorB: '#ddd8ec', floorLine: '#cbc4de', pattern: 'checker', tile: 24,
    wall: '#ece9f7', wallShade: '#d8d2eb', wallTrim: P.blue, accent: P.lavender, light: '#efe4ff',
  },
  gallery: {
    floorA: '#e8c7a3', floorB: '#e1bd97', floorLine: '#cfa47c', pattern: 'planks', tile: 16,
    wall: '#f8e7d6', wallShade: '#ecd3bc', wallTrim: P.peachDeep, accent: P.peach, light: P.warm,
  },
  about: {
    floorA: '#e6c4a2', floorB: '#dfba96', floorLine: '#cca17c', pattern: 'planks', tile: 18,
    wall: '#f6e8dc', wallShade: '#ead4c4', wallTrim: P.pink, accent: P.pink, light: '#ffd9b8',
  },
};

/** Machine colours per project (header, trim) — the machine's identity. */
export const MACHINE_COLOR = {
  eta: { main: P.peach, deep: P.peachDeep },
  meal: { main: P.cyan, deep: P.cyanDeep },
  heart: { main: P.pink, deep: P.pinkDeep },
  tiny: { main: P.mint, deep: P.mintDeep },
  resync: { main: P.lavender, deep: P.violet },
} as const;
