import type { ReactNode } from 'react';
import { profile } from '../data/profile';

const px = (children: ReactNode) => (
  <svg className="pxicon" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">{children}</svg>
);

const ICONS: Record<string, ReactNode> = {
  cats: px(<>
    <rect x="3" y="2" width="2" height="3" fill="var(--peach)" /><rect x="11" y="2" width="2" height="3" fill="var(--peach)" />
    <rect x="2" y="4" width="12" height="9" fill="var(--peach)" /><rect x="5" y="9" width="6" height="4" fill="var(--paper)" />
    <rect x="5" y="7" width="2" height="2" fill="var(--navy)" /><rect x="9" y="7" width="2" height="2" fill="var(--navy)" />
    <rect x="7" y="10" width="2" height="1" fill="var(--pink)" />
  </>),
  coffee: px(<>
    <rect x="5" y="1" width="1" height="3" fill="var(--lavender)" /><rect x="8" y="2" width="1" height="3" fill="var(--lavender)" />
    <rect x="2" y="6" width="10" height="7" fill="var(--navy)" /><rect x="3" y="7" width="8" height="5" fill="var(--paper)" />
    <rect x="3" y="7" width="8" height="2" fill="#b98457" /><rect x="12" y="7" width="2" height="4" fill="var(--navy)" />
    <rect x="1" y="13" width="12" height="2" fill="var(--navy)" />
  </>),
  autumn: px(<>
    <rect x="7" y="1" width="2" height="2" fill="var(--peach-deep, #d98a57)" /><rect x="5" y="3" width="6" height="2" fill="var(--peach)" />
    <rect x="3" y="5" width="10" height="3" fill="var(--peach)" /><rect x="4" y="8" width="8" height="2" fill="#d98a57" />
    <rect x="6" y="10" width="4" height="2" fill="#d98a57" /><rect x="7" y="4" width="2" height="10" fill="#b98457" />
  </>),
  pink: px(<>
    <rect x="2" y="3" width="5" height="4" fill="var(--pink)" /><rect x="9" y="3" width="5" height="4" fill="var(--pink)" />
    <rect x="1" y="5" width="14" height="3" fill="var(--pink)" /><rect x="3" y="8" width="10" height="2" fill="var(--pink)" />
    <rect x="5" y="10" width="6" height="2" fill="var(--pink)" /><rect x="7" y="12" width="2" height="2" fill="var(--pink)" />
    <rect x="3" y="4" width="2" height="1" fill="#fde4ea" />
  </>),
};

/** "A little about me" — small, charming, secondary. */
export function LittleThings({ headingLevel: H = 'h3' }: { headingLevel?: 'h2' | 'h3' | 'h4' }) {
  return (
    <section className="little-things" aria-label="A little about me">
      <H className="little-things__title">A little about me</H>
      <ul>
        {profile.littleThings.map((l) => (
          <li key={l.id}>
            <span className="little-things__icon">{ICONS[l.id]}</span>
            <span className="little-things__label">{l.label}</span>
            {'note' in l && l.note && <span className="little-things__note">{l.note}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
