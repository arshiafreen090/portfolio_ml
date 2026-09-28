import { assetManifest, assetUrl } from '../../data/assets';
import { profile } from '../../data/profile';
import { LittleThings } from '../../ui/LittleThings';
import { Modal } from '../../ui/Modal';

export function AboutPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} bar="About + Contact · Profile" labelledBy="about-title" size="md">
      <div className="popup">
        <div className="about-head">
          <img className="avatar" src={assetUrl(assetManifest.avatar)} alt="" width="88" height="84" />
          <div>
            <p className="popup__eyebrow">{profile.headline}</p>
            <h2 id="about-title" className="popup__title">{profile.name}</h2>
          </div>
        </div>
        <p>{profile.intro}</p>
        <dl className="facts">
          <div><dt>Education</dt><dd>{profile.education.degree}<br /><span className="facts__sub">{profile.education.school} · {profile.education.dates} · {profile.education.grade}</span></dd></div>
          <div><dt>Location</dt><dd>{profile.location}</dd></div>
          <div><dt>Focus</dt><dd>{profile.focus}</dd></div>
        </dl>
        <LittleThings />
      </div>
    </Modal>
  );
}
