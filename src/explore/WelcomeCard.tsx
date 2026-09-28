import { assetManifest, assetUrl } from '../data/assets';
import { profile } from '../data/profile';
import type { RoomId } from '../game/world/shipMap';
import { Modal } from '../ui/Modal';
import { PixelIcons } from './PixelIcons';

interface Props {
  open: boolean;
  onClose: () => void;
  onGoTo: (room: RoomId) => void;
}

const TILES: { room: 'lab' | 'skills' | 'gallery' | 'about'; title: string; sub: string; tone: string }[] = [
  { room: 'lab', title: 'Projects', sub: 'What I built', tone: 'pink' },
  { room: 'skills', title: 'Skills', sub: 'What I work with', tone: 'blue' },
  { room: 'gallery', title: 'Designs', sub: 'Creative work', tone: 'peach' },
  { room: 'about', title: 'About', sub: 'Who I am & contact', tone: 'lavender' },
];

export function WelcomeCard({ open, onClose, onGoTo }: Props) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="welcome-title" size="md" bar="Afreen’s Lab · Welcome aboard" className="modal--welcome">
      <div className="welcome">
        <div className="welcome__top">
          <img className="welcome__avatar" src={assetUrl(assetManifest.avatar)} alt="" width="104" height="99" />
          <div>
            <h1 id="welcome-title" className="welcome__hello">
              HELLO! <span className="welcome__heart" aria-hidden="true">♥</span>
            </h1>
            <p className="welcome__name">{profile.name} · {profile.shortRole}</p>
          </div>
        </div>

        <p className="welcome__intro">{profile.intro}</p>

        <h2 className="section-label">What’s in my spaceship?</h2>
        <div className="welcome__tiles">
          {TILES.map((t) => (
            <button key={t.room} type="button" className={`welcome__tile tone-${t.tone}`} onClick={() => onGoTo(t.room)}>
              <span className="welcome__tile-icon">{PixelIcons[t.room]}</span>
              <span className="welcome__tile-title">{t.title}</span>
              <span className="welcome__tile-sub">{t.sub}</span>
            </button>
          ))}
        </div>

        <h2 className="section-label">Controls</h2>
        <p className="welcome__hint">Use the on-screen pad to walk, then tap <strong>E</strong> when a prompt appears.</p>
        <div className="welcome__controls">
          <span className="welcome__keys" aria-label="W A S D or arrow keys">
            <kbd className="kbd">W</kbd><kbd className="kbd">A</kbd><kbd className="kbd">S</kbd><kbd className="kbd">D</kbd>
            <span className="welcome__or">or</span>
            <kbd className="kbd">↑</kbd><kbd className="kbd">←</kbd><kbd className="kbd">↓</kbd><kbd className="kbd">→</kbd>
          </span>
          <span>to walk · <kbd className="kbd">E</kbd> to interact</span>
        </div>

        <button type="button" className="btn btn--primary welcome__cta" onClick={onClose}>
          Explore spaceship <span aria-hidden="true">→</span>
        </button>
        <p className="welcome__pro">
          In a hurry? <a href={`${import.meta.env.BASE_URL}pro/`}>Professional View ↗</a>
        </p>
      </div>
    </Modal>
  );
}
