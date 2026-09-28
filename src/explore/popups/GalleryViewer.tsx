import { useEffect, useState } from 'react';
import { designs } from '../../data/designs';
import { ArtworkImage } from '../../ui/Artwork';
import { Modal } from '../../ui/Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  /** open the full detail popup for one work */
  onDetail: (id: string) => void;
}

/** The central gallery computer: browse all five works with [1]…[5]. */
export function GalleryViewer({ open, onClose, onDetail }: Props) {
  const [index, setIndex] = useState(0);
  const d = designs[index];

  // ←/→ also switch works while the viewer is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % designs.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + designs.length) % designs.length);
      const n = Number(e.key);
      if (n >= 1 && n <= designs.length) setIndex(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} bar="Design Archive · Gallery computer" labelledBy="gallery-title" size="lg">
      <div className="gallery-viewer">
        <div className="gallery-viewer__screen">
          <ArtworkImage key={d.id} design={d} eager />
        </div>
        <div className="gallery-viewer__side">
          <nav className="gallery-viewer__nav" aria-label="Choose an artwork">
            {designs.map((x, i) => (
              <button
                key={x.id}
                type="button"
                className={`gallery-viewer__num ${i === index ? 'is-active' : ''}`}
                aria-pressed={i === index}
                aria-label={`${x.number}. ${x.title}`}
                onClick={() => setIndex(i)}
              >
                {x.number}
              </button>
            ))}
          </nav>
          <p className="artwork-info__meta">
            <span className="artwork-info__num">{String(d.number).padStart(2, '0')}</span>
            <span>{d.category}</span>
          </p>
          <h2 id="gallery-title" className="artwork-info__title">{d.title}</h2>
          <p>{d.description}</p>
          <div className="gallery-viewer__actions">
            <button type="button" className="btn btn--small btn--primary" onClick={() => onDetail(d.id)}>View detail</button>
            <button type="button" className="btn btn--small" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
