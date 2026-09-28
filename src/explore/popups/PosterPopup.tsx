import { designById } from '../../data/designs';
import { Modal } from '../../ui/Modal';
import { PosterView } from '../../ui/PosterView';

export function PosterPopup({ refId, onClose }: { refId: string | null; onClose: () => void }) {
  const design = refId ? designById[refId] : null;
  return (
    <Modal open={!!design} onClose={onClose} bar="Design Archive" labelledBy="poster-title" size="lg" className="modal--poster">
      {design && (
        <div className="popup poster-popup">
          <div className="poster-popup__art"><PosterView design={design} /></div>
          <div>
            <p className="popup__eyebrow">Design Archive</p>
            <h2 id="poster-title" className="popup__title">{design.title}</h2>
            <p>{design.description}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
