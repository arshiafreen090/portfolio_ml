import type { Experience } from './types';

export const SITE_URL = 'https://lab.afreen.tech/';

export const profile = {
  name: 'Afreen Aurshi',
  firstName: 'Afreen',
  headline: 'Machine Learning & Product Analytics',
  role: '3rd year B.Tech CSE student',
  shortRole: '3rd Yr CSE',
  location: 'Lucknow, India',
  focus: 'Machine Learning, Analytics and practical technical projects',
  education: {
    school: 'University of Lucknow, Faculty of Engineering and Technology',
    degree: 'B.Tech. in Computer Science and Engineering',
    dates: '2024 – 2028',
    grade: 'CGPA 8.0 / 10',
  },
  intro:
    'I’m Afreen, a 3rd year CSE student exploring machine learning, analytics, and practical technical projects. I like building things that connect data with real problems, while keeping a strong eye for design and user experience.',
  interests: ['Machine Learning', 'Data Science', 'Forecasting', 'Geospatial Analytics', 'Product Analytics', 'Quick-Commerce Operations', 'AI/ML Systems'],
  /** Small personal details — "a little about me". */
  littleThings: [
    { id: 'cats', label: 'Cats' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'autumn', label: 'Autumn' },
    { id: 'pink', label: 'Pink', note: 'favourite colour' },
  ],
  email: 'arshiafreen090@gmail.com',
  handles: {
    github: 'arshiafreen090',
    linkedin: 'afreen-aurshi-60477b331',
    x: 'A_feening',
  },
  links: {
    github: 'https://github.com/arshiafreen090',
    linkedin: 'https://www.linkedin.com/in/afreen-aurshi-60477b331/',
    x: 'https://x.com/A_feening',
  },
  resume: {
    path: 'resume/Afreen_Aurshi_Resume.pdf',
    fileName: 'Afreen_Aurshi_Resume.pdf',
  },
} as const;

// From the resume. Keep entries factual — no invented responsibilities.
export const experience: Experience[] = [
  {
    org: 'AWS Cloud Club, University of Lucknow',
    role: 'Tech Team Member',
    dates: 'Oct 2025 – Present',
    points: [
      'Supported a hands-on cloud learning workshop and coordinated across design and technical teams.',
      'Previously contributed event materials as a Design Team Member.',
    ],
  },
  {
    org: 'Connecttly',
    role: 'UX Design & Content Intern',
    dates: 'Feb 2026 – Mar 2026',
    points: [
      'Designed website UI assets and product-update content in Figma.',
      'Maintained consistent layouts and iterated based on team feedback.',
    ],
  },
];
