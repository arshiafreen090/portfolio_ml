import type { Design } from './types';

// Exactly two posters live in the Design Archive.
// To add the real artwork: put the files in public/assets/gallery/ and set
// `image` (e.g. 'assets/gallery/poster-1.webp'), `title`, `description` and `alt`.
export const designs: Design[] = [
  {
    id: 'poster-1',
    title: 'Poster 01',
    description: 'Poster artwork coming soon.',
    image: null,
    alt: 'Poster 01',
  },
  {
    id: 'poster-2',
    title: 'Poster 02',
    description: 'Poster artwork coming soon.',
    image: null,
    alt: 'Poster 02',
  },
];

export const designById = Object.fromEntries(designs.map((d) => [d.id, d]));
