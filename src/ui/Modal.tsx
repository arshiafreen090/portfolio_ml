import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  size?: 'sm' | 'md' | 'lg';
  /** small label in the panel's title bar, e.g. the room the panel belongs to */
  bar?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Native <dialog> modal: focus trap, Esc-to-close and focus return come from
 * the browser. Clicking the backdrop also closes it. Styled as a pixel
 * spaceship panel with a title bar.
 */
export function Modal({ open, onClose, labelledBy, size = 'md', bar, className = '', children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal modal--${size} ${className}`}
      aria-labelledby={labelledBy}
      // The native `close` event is async. Only report closes the browser did on
      // its own (e.g. a repeated Esc) while this modal is still meant to be open —
      // never our own effect-driven close, which may land after another popup opened.
      onClose={() => { if (openRef.current && !ref.current?.open) onClose(); }}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal__inner">
        <div className="modal__bar">
          <span className="modal__lights" aria-hidden="true"><i /><i /><i /></span>
          {bar && <span className="modal__bar-label" aria-hidden="true">{bar}</span>}
          <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
              <path d="M0 0h3v3H0zM3 3h2v2H3zM5 5h2v2H5zM7 7h2v2H7zM9 9h3v3H9zM9 0h3v3H9zM7 3h2v2H7zM3 7h2v2H3zM0 9h3v3H0z" fill="currentColor" />
            </svg>
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </dialog>
  );
}
