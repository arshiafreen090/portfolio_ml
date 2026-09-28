import { ContactLinks } from '../../ui/ContactLinks';
import { Modal } from '../../ui/Modal';

export function ContactPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="contact-title" size="sm">
      <div className="popup">
        <p className="popup__eyebrow">Comms terminal</p>
        <h2 id="contact-title" className="popup__title">Get in touch</h2>
        <p>Happy to talk about projects, internships or anything ML and analytics.</p>
        <ContactLinks />
      </div>
    </Modal>
  );
}
