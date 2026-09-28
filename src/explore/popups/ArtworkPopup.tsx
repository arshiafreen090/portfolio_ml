import { designById } from '../../data/designs';
import { ArtworkImage, ArtworkInfo } from '../../ui/Artwork';
import { Modal } from '../../ui/Modal';

/** Detail view for one framed work (opened from the wall, a click, or the gallery computer). */
export function ArtworkPopup({ refId, onClose }: { refId: string | null; onClose: () => void }) {
  const design = refId ? designById[refId] : null;
  return (
    <Modal open={!!design} onClose={onClose} bar="Design Archive · Artwork" labelledBy="artwork-title" size="lg">
      {design && (
        <div className="artwork-popup">
          <ArtworkImage design={design} eager />
          <ArtworkInfo design={design} titleId="artwork-title" />
        </div>
      )}
    </Modal>
  );
}
