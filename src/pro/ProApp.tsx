import { assetManifest, assetUrl } from '../data/assets';
import { designs } from '../data/designs';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { skillCategories } from '../data/skills';
import { ContactLinks } from '../ui/ContactLinks';
import { PosterView } from '../ui/PosterView';
import { ProjectLinks } from '../ui/ProjectLinks';
import { ProjectDetails } from '../ui/ProjectDetails';
import { StatusBadge } from '../ui/StatusBadge';

const NAV = [
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['about', 'About'],
  ['designs', 'Designs'],
  ['contact', 'Contact'],
] as const;

const exploreHref = import.meta.env.BASE_URL;

export function ProApp() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="pro-header">
        <div className="pro-wrap pro-header__inner">
          <a className="pro-header__name" href="#top">{profile.name}</a>
          <nav aria-label="Sections">
            <ul className="pro-nav">
              {NAV.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}
            </ul>
          </nav>
          <a className="btn btn--small" href={exploreHref}>Explore spaceship</a>
        </div>
      </header>

      <main id="main">
        <section id="top" className="pro-wrap pro-intro">
          <img className="pro-intro__avatar" src={assetUrl(assetManifest.avatar)} alt="Pixel-art portrait of Afreen" width="160" height="152" />
          <div className="pro-intro__text">
            <p className="pro-eyebrow">{profile.role} · {profile.location}</p>
            <h1>{profile.name}</h1>
            <p className="pro-intro__lead">{profile.intro}</p>
            <div className="pro-intro__links">
              <a className="btn" href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              <a className="btn" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a className="btn" href={`mailto:${profile.email}`}>Email</a>
            </div>
          </div>
        </section>

        <section id="projects" className="pro-wrap pro-section" aria-labelledby="projects-h">
          <h2 id="projects-h" className="section-label">Projects</h2>
          <ul className="pro-projects">
            {projects.map((p) => (
              <li key={p.id} className="pro-card">
                <div className="pro-card__head">
                  <StatusBadge status={p.status} />
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
                {p.stack.length > 0 && <ul className="chips">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>}
                <ProjectLinks project={p} />
                <details className="pro-card__more">
                  <summary>Details</summary>
                  <ProjectDetails project={p} compact />
                </details>
              </li>
            ))}
          </ul>
        </section>

        <section id="skills" className="pro-wrap pro-section" aria-labelledby="skills-h">
          <h2 id="skills-h" className="section-label">Skills</h2>
          <div className="pro-skills">
            {skillCategories.map((c) => (
              <div key={c.id} className="pro-skill">
                <h3>{c.title}</h3>
                <ul className="chips">{c.items.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="pro-wrap pro-section" aria-labelledby="about-h">
          <h2 id="about-h" className="section-label">About</h2>
          <div className="pro-about">
            <p>{profile.intro}</p>
            <dl className="facts">
              <div><dt>Education</dt><dd>B.Tech CSE, 3rd year</dd></div>
              <div><dt>Location</dt><dd>{profile.location}</dd></div>
              <div><dt>Focus</dt><dd>{profile.focus}</dd></div>
            </dl>
          </div>
        </section>

        <section id="designs" className="pro-wrap pro-section" aria-labelledby="designs-h">
          <h2 id="designs-h" className="section-label">Design work</h2>
          <ul className="pro-designs">
            {designs.map((d) => (
              <li key={d.id}>
                <PosterView design={d} />
                <h3>{d.title}</h3>
                <p>{d.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="contact" className="pro-wrap pro-section" aria-labelledby="contact-h">
          <h2 id="contact-h" className="section-label">Contact</h2>
          <ContactLinks />
        </section>
      </main>

      <footer className="pro-wrap pro-footer">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <a href={exploreHref}>Prefer to explore? Board the spaceship →</a>
      </footer>
    </>
  );
}
