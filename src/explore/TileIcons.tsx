// Small pixel icons for the welcome-card tiles (16×16 grid, crisp edges).
// Colours come from the CSS tokens so they stay in the palette.

const svg = (children: React.ReactNode) => (
  <svg width="32" height="32" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">{children}</svg>
);

export const TileIcons = {
  lab: svg(<>
    <rect x="2" y="3" width="12" height="8" fill="var(--navy)" />
    <rect x="3" y="4" width="10" height="6" fill="#6f78c9" />
    <path d="M6 6h1v1h2V6h1v2H9v1H7V8H6z" fill="var(--pink)" />
    <rect x="1" y="11" width="14" height="2" fill="var(--navy)" />
  </>),
  skills: svg(<>
    <rect x="2" y="9" width="3" height="5" fill="#6f78c9" />
    <rect x="6" y="6" width="3" height="8" fill="var(--pink)" />
    <rect x="10" y="3" width="3" height="11" fill="var(--lavender)" />
    <rect x="1" y="14" width="14" height="1" fill="var(--navy)" />
  </>),
  gallery: svg(<>
    <rect x="2" y="2" width="12" height="12" fill="var(--navy)" />
    <rect x="3" y="3" width="10" height="10" fill="var(--paper)" />
    <rect x="4" y="9" width="8" height="3" fill="var(--lavender)" />
    <rect x="5" y="7" width="3" height="2" fill="var(--peach)" />
    <rect x="10" y="4" width="2" height="2" fill="var(--pink)" />
  </>),
  about: svg(<>
    <rect x="5" y="2" width="6" height="6" fill="var(--peach)" />
    <rect x="4" y="3" width="1" height="4" fill="var(--peach)" />
    <rect x="11" y="3" width="1" height="4" fill="var(--peach)" />
    <rect x="6" y="4" width="1" height="1" fill="var(--navy)" />
    <rect x="9" y="4" width="1" height="1" fill="var(--navy)" />
    <rect x="3" y="10" width="10" height="4" fill="#6f78c9" />
    <rect x="4" y="9" width="8" height="1" fill="#6f78c9" />
  </>),
};
