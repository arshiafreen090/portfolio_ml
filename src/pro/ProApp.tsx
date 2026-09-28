import { useState } from 'react';
import { assetManifest, assetUrl } from '../data/assets';
import { designs } from '../data/designs';
import { experience, profile } from '../data/profile';
import { projects } from '../data/projects';
import { skillCategories } from '../data/skills';
import { ArtworkImage, ArtworkInfo } from '../ui/Artwork';
import { ContactCards } from '../ui/ContactCards';
import { LittleThings } from '../ui/LittleThings';
import { Metrics, ProjectDetails } from '../ui/ProjectDetails';
import { ProjectLinks } from '../ui/ProjectLinks';
import { StatusBadge } from '../ui/StatusBadge';

// Section order is deliberate: Experience is always the last major section.
const NAV = [
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['about', 'About'],
  ['designs', 'Design'],
  ['resume', 'Resume'],
  ['contact', 'Contact'],
  ['experience', 'Experience'],
] as const;

const exploreHref = import.meta.env.BASE_URL;
const resumeHref = assetUrl(profile.resume.path);

/** Contribution calendar image from a public service; falls back to a plain link. */
function GitHubActivity() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="gh-activity">
      <div className="gh-activity__head">
        <h3>GitHub activity</h3>
        <a href={profile.links.github} target="_blank" rel="noopener noreferrer">@{profile.handles.github} ↗</a>
      </div>
      {failed ? (
        <p className="gh-activity__fallback">
          The contribution calendar couldn’t load here — see it on{' '}
          <a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
      ) : (
        <a className="gh-activity__chart" href={profile.links.github} target="_blank" rel="noopener noreferrer">
          <img
            src={`https://ghchart.rshah.org/6f78c9/${profile.handles.github}`}
            alt={`GitHub contribution calendar for ${profile.handles.github}`}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        </a>
      )}
    </div>
  );
}

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
        {/* 1. Intro */}
        <section id="top" className="pro-wrap pro-intro">
          <img className="pro-intro__avatar" src={assetUrl(assetManifest.avatar)} alt="Pixel-art portrait of Afreen" width="160" height="152" />
          <div className="pro-intro__text">
            <p className="pro-eyebrow">{profile.headline} · {profile.location}</p>
            <h1>{profile.name}</h1>
            <p className="pro-intro__role">{profile.education.degree} · {profile.education.school.split(',')[0]} · {profile.education.dates}</p>
            <p className="pro-intro__lead">{profile.intro}</p>
            <div className="pro-intro__links">
              <a className="btn btn--primary" href={resumeHref} target="_blank" rel="noopener noreferrer">View resume</a>
              <a className="btn" href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              <a className="btn" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a className="btn" href={`mailto:${profile.email}`}>Email</a>
            </div>
          </div>
        </section>

        {/* 2. Projects */}
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
                {p.metrics && <Metrics metrics={p.metrics.filter((m) => m.value.length <= 14).slice(0, 4)} />}
                <ul className="chips">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
                <ProjectLinks project={p} />
                <details className="pro-card__more">
                  <summary>Technical details</summary>
                  <ProjectDetails project={p} compact />
                </details>
              </li>
            ))}
          </ul>
          <GitHubActivity />
        </section>

        {/* 3. Skills */}
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

        {/* 4. About */}
        <section id="about" className="pro-wrap pro-section" aria-labelledby="about-h">
          <h2 id="about-h" className="section-label">About</h2>
          <div className="pro-about">
            <div className="pro-about__main">
              <p>{profile.intro}</p>
              <dl className="facts">
                <div>
                  <dt>Education</dt>
                  <dd>{profile.education.degree}<br /><span className="facts__sub">{profile.education.school} · {profile.education.dates} · {profile.education.grade}</span></dd>
                </div>
                <div><dt>Location</dt><dd>{profile.location}</dd></div>
                <div><dt>Interests</dt><dd>{profile.interests.join(' · ')}</dd></div>
              </dl>
            </div>
            <LittleThings />
          </div>
        </section>

        {/* 5. Design work */}
        <section id="designs" className="pro-wrap pro-section" aria-labelledby="designs-h">
          <h2 id="designs-h" className="section-label">Design work</h2>
          <ul className="pro-designs">
            {designs.map((d) => (
              <li key={d.id}>
                <ArtworkImage design={d} />
                <ArtworkInfo design={d} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </section>

        {/* 6. Resume */}
        <section id="resume" className="pro-wrap pro-section" aria-labelledby="resume-h">
          <h2 id="resume-h" className="section-label">Resume</h2>
          <div className="pro-resume">
            <p>One page: education, technical skills, ML projects with results, and experience.</p>
            <div className="pro-resume__actions">
              <a className="btn btn--primary" href={resumeHref} target="_blank" rel="noopener noreferrer">View resume</a>
              <a className="btn" href={resumeHref} download={profile.resume.fileName}>Download resume</a>
            </div>
          </div>
        </section>

        {/* 7. Contact */}
        <section id="contact" className="pro-wrap pro-section" aria-labelledby="contact-h">
          <h2 id="contact-h" className="section-label">Contact</h2>
          <ContactCards />
        </section>

        {/* 8. Experience — always last */}
        <section id="experience" className="pro-wrap pro-section" aria-labelledby="experience-h">
          <h2 id="experience-h" className="section-label">Experience</h2>
          <ol className="pro-experience">
            {experience.map((e) => (
              <li key={e.org} className="pro-exp">
                <div className="pro-exp__head">
                  <h3>{e.role}</h3>
                  <span className="pro-exp__dates">{e.dates}</span>
                </div>
                <p className="pro-exp__org">{e.org}</p>
                <ul className="points">{e.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="pro-wrap pro-footer">
        <p>© {new Date().getFullYear()} {profile.name} · lab.afreen.tech</p>
        <a href={exploreHref}>Prefer to explore? Board the spaceship →</a>
      </footer>
    </>
  );
}
