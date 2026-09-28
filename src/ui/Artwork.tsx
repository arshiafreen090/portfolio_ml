import { assetUrl } from '../data/assets';
import { artworkSrc, isPlaceholder } from '../data/designs';
import type { Design } from '../data/types';

/** The artwork image — the real work once supplied, otherwise its labelled placeholder. */
export function ArtworkImage({ design, eager = false }: { design: Design; eager?: boolean }) {
  const placeholder = isPlaceholder(design);
  return (
    <figure className={`artwork ${placeholder ? 'artwork--placeholder' : ''}`}>
      <img
        src={assetUrl(artworkSrc(design))}
        alt={placeholder ? `Placeholder illustration for “${design.title}” — the real artwork is coming soon` : design.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      {placeholder && <figcaption className="artwork__tag" title="The real artwork will replace this illustration">Placeholder</figcaption>}
    </figure>
  );
}

/** Number, title, category, description and a link to the source. */
export function ArtworkInfo({ design, titleId, headingLevel: H = 'h2' }: { design: Design; titleId?: string; headingLevel?: 'h2' | 'h3' }) {
  return (
    <div className="artwork-info">
      <p className="artwork-info__meta">
        <span className="artwork-info__num">{String(design.number).padStart(2, '0')}</span>
        <span>{design.category}</span>
      </p>
      <H id={titleId} className="artwork-info__title">{design.title}</H>
      <p>{design.description}</p>
      <a className="btn btn--small" href={design.source} target="_blank" rel="noopener noreferrer">
        View detail on {design.sourceLabel} <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
