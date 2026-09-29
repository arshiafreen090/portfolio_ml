import { ContactCards } from '../../ui/ContactCards';
import { Modal } from '../../ui/Modal';

export function ContactPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} bar="About + Contact · Comms" labelledBy="contact-title" size="lg">
      <div className="popup">
        <p className="popup__eyebrow">Comms terminal</p>
        <h2 id="contact-title" className="popup__title">Contact me</h2>
        <ContactCards />
      </div>
    </Modal>
  );
}
