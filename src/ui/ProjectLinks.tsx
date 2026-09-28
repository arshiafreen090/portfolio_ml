import type { Project } from '../data/types';

export function ProjectLinks({ project: p }: { project: Project }) {
  const { github, live } = p.links;
  if (!github && !live) {
    return <p className="project__links-note">{p.linksNote ?? 'Links coming soon.'}</p>;
  }
  return (
    <div className="project__links">
      {github && (
        <a className="btn btn--small" href={github} target="_blank" rel="noopener noreferrer">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      )}
      {live && (
        <a className="btn btn--small" href={live} target="_blank" rel="noopener noreferrer">
          Live demo <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}
