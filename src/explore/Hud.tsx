interface Props {
  roomName: string;
  onMap: () => void;
  onHelp: () => void;
}

export function Hud({ roomName, onMap, onHelp }: Props) {
  return (
    <div className="hud">
      <div className="hud__room" aria-live="polite">{roomName}</div>
      <div className="hud__actions">
        <button type="button" className="btn btn--small" onClick={onMap}>Map</button>
        <button type="button" className="btn btn--small" onClick={onHelp} aria-label="Help and welcome card">?</button>
        <a className="btn btn--small" href={`${import.meta.env.BASE_URL}pro/`}>Professional View</a>
      </div>
    </div>
  );
}
