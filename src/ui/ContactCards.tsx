import type { ReactNode } from 'react';
import { profile } from '../data/profile';

const px = (children: ReactNode) => (
  <svg className="pxicon" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">{children}</svg>
);

const ICONS = {
  linkedin: px(<>
    <rect x="1" y="1" width="14" height="14" fill="var(--navy)" />
    <rect x="3" y="6" width="2" height="7" fill="var(--paper)" /><rect x="3" y="3" width="2" height="2" fill="var(--paper)" />
    <rect x="7" y="6" width="2" height="7" fill="var(--paper)" /><rect x="9" y="6" width="3" height="2" fill="var(--paper)" />
    <rect x="11" y="7" width="2" height="6" fill="var(--paper)" />
  </>),
  x: px(<>
    <rect x="1" y="1" width="14" height="14" fill="var(--navy)" />
    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => <rect key={`a${i}`} x={i} y={i} width="2" height="1" fill="var(--paper)" />)}
    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => <rect key={`b${i}`} x={15 - i - 1} y={i} width="1" height="1" fill="var(--paper)" />)}
  </>),
  email: px(<>
    <rect x="1" y="3" width="14" height="10" fill="var(--navy)" />
    <rect x="2" y="4" width="12" height="8" fill="var(--paper)" />
    <path d="M2 4h2v1h2v1h1v1h2V6h1V5h2V4h2v2h-2v1h-2v1H9v1H7V8H6V7H4V6H2z" fill="var(--pink)" />
  </>),
  github: px(<>
    <rect x="3" y="2" width="2" height="3" fill="var(--navy)" /><rect x="11" y="2" width="2" height="3" fill="var(--navy)" />
    <rect x="2" y="4" width="12" height="8" fill="var(--navy)" /><rect x="4" y="12" width="8" height="2" fill="var(--navy)" />
    <rect x="5" y="7" width="2" height="2" fill="var(--paper)" /><rect x="9" y="7" width="2" height="2" fill="var(--paper)" />
    <rect x="7" y="10" width="2" height="1" fill="var(--pink)" />
  </>),
};

const CARDS = [
  { id: 'linkedin', label: 'LinkedIn', note: 'Connect professionally', handle: `in/${profile.handles.linkedin}`, href: profile.links.linkedin },
  { id: 'x', label: 'X', note: 'Say hi', handle: `@${profile.handles.x}`, href: profile.links.x },
  { id: 'email', label: 'Email', note: 'Write to me', handle: profile.email, href: `mailto:${profile.email}` },
  { id: 'github', label: 'GitHub', note: 'Code & projects', handle: `@${profile.handles.github}`, href: profile.links.github },
] as const;

export function ContactCards() {
  return (
    <ul className="contact-cards">
      {CARDS.map((c) => (
        <li key={c.id}>
          <a
            className={`contact-card contact-card--${c.id}`}
            href={c.href}
            {...(c.id === 'email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          >
            <span className="contact-card__icon">{ICONS[c.id]}</span>
            <span className="contact-card__text">
              <span className="contact-card__label">{c.label}</span>
              <span className="contact-card__note">{c.note}</span>
              <span className="contact-card__handle">{c.handle}</span>
            </span>
            <span className="contact-card__go" aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
