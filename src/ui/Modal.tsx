import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}

/**
 * Native <dialog> modal: focus trap, Esc-to-close and focus return come from
 * the browser. Clicking the backdrop also closes it.
 */
export function Modal({ open, onClose, labelledBy, size = 'md', className = '', children }: Props) {
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
      <div className="modal__body">
        <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="3" strokeLinecap="square" /></svg>
        </button>
        {children}
      </div>
    </dialog>
  );
}
