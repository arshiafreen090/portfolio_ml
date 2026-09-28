import { assetManifest, assetUrl } from '../../data/assets';
import { profile } from '../../data/profile';
import { Modal } from '../../ui/Modal';

export function AboutPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="about-title" size="md">
      <div className="popup">
        <div className="about-head">
          <img className="avatar" src={assetUrl(assetManifest.avatar)} alt="" width="88" height="84" />
          <div>
            <p className="popup__eyebrow">About</p>
            <h2 id="about-title" className="popup__title">{profile.name}</h2>
          </div>
        </div>
        <p>{profile.intro}</p>
        <dl className="facts">
          <div><dt>Education</dt><dd>B.Tech CSE, 3rd year</dd></div>
          <div><dt>Location</dt><dd>{profile.location}</dd></div>
          <div><dt>Focus</dt><dd>{profile.focus}</dd></div>
        </dl>
      </div>
    </Modal>
  );
}
