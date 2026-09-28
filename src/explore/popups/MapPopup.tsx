import { rooms, type RoomId } from '../../game/world/shipMap';
import { Modal } from '../../ui/Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  onGoTo: (room: RoomId) => void;
  onWelcome: () => void;
}

export function MapPopup({ open, onClose, onGoTo, onWelcome }: Props) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="map-title" size="sm">
      <div className="popup">
        <p className="popup__eyebrow">Navigation console</p>
        <h2 id="map-title" className="popup__title">Where to?</h2>
        <ul className="room-list">
          {rooms.map((r) => (
            <li key={r.id}>
              <button type="button" className="btn room-list__btn" onClick={() => onGoTo(r.id)}>
                <span>{r.name}</span><span aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="popup__footer">
          <button type="button" className="link-btn" onClick={onWelcome}>Show welcome card</button>
          <a href={`${import.meta.env.BASE_URL}pro/`}>Professional View ↗</a>
        </div>
      </div>
    </Modal>
  );
}
