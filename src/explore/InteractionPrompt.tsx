import type { Interactable, InteractKind } from '../game/world/shipMap';

const VERB: Record<InteractKind, string> = {
  project: 'explore',
  skills: 'open terminal',
  about: 'read',
  contact: 'get in touch',
  poster: 'view poster',
  map: 'open map',
};

interface Props {
  target: Interactable;
  showKey: boolean;
  onActivate: () => void;
}

export function InteractionPrompt({ target, showKey, onActivate }: Props) {
  return (
    <div className="prompt" role="status">
      <span className="prompt__label">{target.label}</span>
      <button type="button" className="btn btn--small prompt__btn" onClick={onActivate}>
        {showKey && <kbd className="kbd">E</kbd>}
        <span>{showKey ? `to ${VERB[target.kind]}` : VERB[target.kind].replace(/^./, (c) => c.toUpperCase())}</span>
      </button>
    </div>
  );
}
