import type { Design } from './types';

// The five works in the Design Archive. Used by the framed artworks on the
// wall, the central gallery computer and the Professional View.
//
// To add the real artwork: put the file in public/assets/gallery/ and set
// `image` (e.g. 'assets/gallery/skincare-ad.webp'). Until then the matching
// `placeholder` illustration is shown — it is a stand-in, clearly labelled as
// such, not the actual work.
export const designs: Design[] = [
  {
    id: 'internship',
    number: 1,
    category: 'Internship Experience',
    title: 'Previous work Assets',
    description:
      'An eye-catching collection of web surfaces and dynamic static posts driving digital engagement during my internship.',
    source: 'https://drive.google.com/drive/folders/1NiVgqUu2Abazks7QbQ-2T8RauxMYrMv3',
    sourceLabel: 'Google Drive',
    image: null,
    placeholder: 'assets/gallery/placeholder-internship.svg',
    alt: 'Internship Experience — web surfaces and social posts',
  },
  {
    id: 'skincare',
    number: 2,
    category: 'Skincare Ad',
    title: 'Fashwash Commercial',
    description: 'Skincare Ad (Niacinamide Bottle) showcasing product elegance.',
    source: 'https://www.canva.com/design/DAGxkdHoI9Y/4FOujOgAuHclfljfWHJ4Tw/edit',
    sourceLabel: 'Canva',
    image: null,
    placeholder: 'assets/gallery/placeholder-skincare.svg',
    alt: 'Skincare advertisement featuring a niacinamide bottle',
  },
  {
    id: 'nike',
    number: 3,
    category: 'Marketing Poster',
    title: 'NIKE AIR',
    description: 'Nike SB Dunk Ad Poster. A dynamic marketing poster design.',
    source: 'https://www.canva.com/design/DAG0uU9jkro/mo13FafxKIfOAk4bPH8xHQ/edit',
    sourceLabel: 'Canva',
    image: null,
    placeholder: 'assets/gallery/placeholder-sneaker.svg',
    alt: 'Nike SB Dunk marketing poster',
  },
  {
    id: 'brand',
    number: 4,
    category: 'Illustration',
    title: 'Personal Brand',
    description: 'Custom illustration card for personal identity.',
    source: 'https://www.canva.com/design/DAGu0GeA6Cc/JFv8Vs_bnt-nEFQdC-SLzw/edit',
    sourceLabel: 'Canva',
    image: null,
    placeholder: 'assets/gallery/placeholder-brand.svg',
    alt: 'Personal brand illustration card',
  },
  {
    id: 'assignment',
    number: 5,
    category: 'Creative Assignment',
    title: 'Internship Selection Task',
    description:
      'Assignment for the internship where I got selected, showcasing high-impact design and creative execution.',
    source: 'https://www.canva.com/design/DAHFtFRh8pI/tN3LhlOdSjLrFP4fZKvEYw/edit',
    sourceLabel: 'Canva',
    image: null,
    placeholder: 'assets/gallery/placeholder-assignment.svg',
    alt: 'Internship selection design assignment',
  },
];

export const designById = Object.fromEntries(designs.map((d) => [d.id, d]));

/** The artwork to show: the real image once supplied, otherwise the placeholder. */
export const artworkSrc = (d: Design) => d.image ?? d.placeholder;
export const isPlaceholder = (d: Design) => !d.image;
