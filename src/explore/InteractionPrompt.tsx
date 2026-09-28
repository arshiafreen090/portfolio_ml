import type { Interactable, InteractKind } from '../game/world/shipMap';
import { PixelIcons } from './PixelIcons';

const VERB: Record<InteractKind, string> = {
  project: 'explore',
  skills: 'open terminal',
  about: 'read',
  contact: 'get in touch',
  poster: 'view poster',
  map: 'open map',
  briefing: 'open briefing',
};

const KIND: Record<InteractKind, string> = {
  project: 'Project machine',
  skills: 'Skill terminal',
  about: 'Profile board',
  contact: 'Comms terminal',
  poster: 'Poster',
  map: 'Navigation',
  briefing: 'Flight console',
};

const ICON: Record<InteractKind, keyof typeof PixelIcons> = {
  project: 'lab', skills: 'skills', about: 'about', contact: 'contact', poster: 'gallery', map: 'map', briefing: 'briefing',
};

interface Props {
  target: Interactable;
  showKey: boolean;
  onActivate: () => void;
}

/** A little ship console panel: what's here + "PRESS E TO …". */
export function InteractionPrompt({ target, showKey, onActivate }: Props) {
  return (
    <div className="prompt" role="status" key={target.id}>
      <span className="prompt__icon">{PixelIcons[ICON[target.kind]]}</span>
      <span className="prompt__text">
        <span className="prompt__kind">{KIND[target.kind]}</span>
        <span className="prompt__label">{target.label}</span>
      </span>
      <button type="button" className="prompt__btn" onClick={onActivate}>
        {showKey && <><span className="prompt__press">Press</span><kbd className="kbd">E</kbd></>}
        <span>{showKey ? `to ${VERB[target.kind]}` : VERB[target.kind]}</span>
      </button>
    </div>
  );
}
