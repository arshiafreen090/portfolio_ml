export type ProjectId = 'eta' | 'meal' | 'heart' | 'tiny' | 'resync';

export type ProjectStatus = 'Completed' | 'Learning / Collection' | 'In Development';

export interface ProjectLinks {
  github?: string;
  live?: string;
}

export interface SubProject {
  title: string;
  points: string[];
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
  /** Verified results only. Leave undefined when there are none — the section is omitted. */
  results?: string[];
  /** Only tools confirmed for this project. Empty = section omitted. */
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
  title: string;
  description: string;
  /** Path under public/, e.g. "assets/gallery/poster-1.webp". null = placeholder. */
  image: string | null;
  alt: string;
}
