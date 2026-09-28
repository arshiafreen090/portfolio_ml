import type { RoomId } from '../game/world/shipMap';

interface Props {
  room: RoomId | null;
  roomName: string;
  onMap: () => void;
  onHelp: () => void;
}

export function Hud({ room, roomName, onMap, onHelp }: Props) {
  return (
    <div className="hud">
      <div className="hud__room" data-room={room ?? 'corridor'} aria-live="polite">
        <i aria-hidden="true" />{roomName}
      </div>
      <div className="hud__actions">
        <button type="button" className="btn btn--small" onClick={onMap}>Map</button>
        <button type="button" className="btn btn--small" onClick={onHelp} aria-label="Help and welcome card">?</button>
        <a className="btn btn--small" href={`${import.meta.env.BASE_URL}pro/`}>Professional View</a>
      </div>
    </div>
  );
}

/** Short "entering …" sign that drops in when Tobby walks into a room. */
export function RoomToast({ room, name, onDone }: { room: RoomId; name: string; onDone: () => void }) {
  return (
    <div className="room-toast" data-room={room} onAnimationEnd={onDone} aria-hidden="true">
      <span className="room-toast__eyebrow">Entering</span>
      <span className="room-toast__name"><i />{name}</span>
    </div>
  );
}
