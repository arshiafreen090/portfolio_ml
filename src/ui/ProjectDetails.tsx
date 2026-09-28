import type { Project } from '../data/types';
import { ProjectLinks } from './ProjectLinks';
import { StatusBadge } from './StatusBadge';

interface Props {
  project: Project;
  /** id of the heading, for aria-labelledby on dialogs */
  titleId?: string;
  headingLevel?: 'h2' | 'h3';
  /** body only — for places that already show title, status, stack and links */
  compact?: boolean;
}

export function ProjectDetails({ project: p, titleId, headingLevel: H = 'h2', compact = false }: Props) {
  return (
    <article className="project">
      {!compact && (
        <header className="project__head">
          <div><StatusBadge status={p.status} /></div>
          <H className="project__title" id={titleId}>{p.title}</H>
          <p className="project__desc">{p.description}</p>
        </header>
      )}

      <section>
        <h4>Problem</h4>
        <p>{p.problem}</p>
      </section>

      <section>
        <h4>{p.status === 'In Development' ? 'What it’s designed to do' : 'Approach'}</h4>
        <ul className="points">{p.approach.map((a) => <li key={a}>{a}</li>)}</ul>
      </section>

      {p.parts && (
        <section>
          <h4>Inside the collection</h4>
          <div className="project__parts">
            {p.parts.map((part) => (
              <div className="project__part" key={part.title}>
                <h5>{part.title}</h5>
                <ul className="points">{part.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {p.planned && p.planned.length > 0 && (
        <section>
          <h4>Planned — not built yet</h4>
          <ul className="chips">{p.planned.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
      )}

      {p.results && p.results.length > 0 && (
        <section>
          <h4>Results</h4>
          <ul className="points">{p.results.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
      )}

      {!compact && p.stack.length > 0 && (
        <section>
          <h4>Stack</h4>
          <ul className="chips">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
      )}

      {p.note && <p className="project__note">{p.note}</p>}

      {!compact && <ProjectLinks project={p} />}
    </article>
  );
}
