export type ProjectId = 'eta' | 'meal' | 'heart' | 'tiny' | 'resync';

/** Only 'In Development' is ever shown as a label. */
export type ProjectStatus = 'Shipped' | 'Collection' | 'In Development';

export interface ProjectLinks {
  github?: string;
  live?: string;
}

export interface SubProject {
  title: string;
  points: string[];
}

/** A group of verified tools/methods, e.g. { label: 'Models', items: ['XGBoost'] }. */
export interface TechGroup {
  label: string;
  items: string[];
}

/** A verified evaluation figure. `note` explains what it is measured on. */
export interface Metric {
  label: string;
  value: string;
  note?: string;
}

export interface Project {
  id: ProjectId;
  title: string;
  status: ProjectStatus;
  /** One line, used on cards and machine prompts. */
  tagline: string;
  description: string;
  problem: string;
  approach: string[];
  /** Smaller builds inside a collection (Tiny Projects). */
  parts?: SubProject[];
  /** Ideas that are planned but NOT built. Always rendered as "planned". */
  planned?: string[];
  /** Verified model performance only (from the resume / repo). Omitted when none. */
  metrics?: Metric[];
  /** Verified technical breakdown. */
  tech: TechGroup[];
  /** Short list for cards. */
  stack: string[];
  links: ProjectLinks;
  /** Shown under the links when a project has none yet. */
  linksNote?: string;
  note?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  items: string[];
}

export interface SkillTerminal {
  id: string;
  title: string;
  categories: string[]; // SkillCategory ids
}

export interface Design {
  id: string;
  number: number;
  /** e.g. "Skincare Ad" */
  category: string;
  /** e.g. "Fashwash Commercial" */
  title: string;
  description: string;
  /** Where the real work lives (Drive / Canva). */
  source: string;
  sourceLabel: string;
  /** Path under public/ for the REAL artwork. null until supplied. */
  image: string | null;
  /** Path under public/ for the stand-in illustration shown until `image` is set. */
  placeholder: string;
  alt: string;
}

export interface Experience {
  org: string;
  role: string;
  dates: string;
  points: string[];
}
