import type { PointerEvent } from 'react';

interface Props {
  onDirection: (x: number, y: number) => void;
  onAction: () => void;
  actionEnabled: boolean;
}

const PAD: { label: string; x: number; y: number; area: string; glyph: string }[] = [
  { label: 'Up', x: 0, y: -1, area: 'up', glyph: '▲' },
  { label: 'Left', x: -1, y: 0, area: 'left', glyph: '◀' },
  { label: 'Right', x: 1, y: 0, area: 'right', glyph: '▶' },
  { label: 'Down', x: 0, y: 1, area: 'down', glyph: '▼' },
];

export function TouchControls({ onDirection, onAction, actionEnabled }: Props) {
  const press = (x: number, y: number) => (e: PointerEvent<HTMLButtonElement>) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic events */ }
    onDirection(x, y);
  };
  const release = () => onDirection(0, 0);

  return (
    <div className="touch">
      <div className="touch__pad">
        {PAD.map((b) => (
          <button
            key={b.area}
            type="button"
            className={`touch__btn touch__btn--${b.area}`}
            aria-label={`Walk ${b.label.toLowerCase()}`}
            onPointerDown={press(b.x, b.y)}
            onPointerUp={release}
            onPointerCancel={release}
            onContextMenu={(e) => e.preventDefault()}
          >
            {b.glyph}
          </button>
        ))}
      </div>
      <button type="button" className="touch__action" onClick={onAction} disabled={!actionEnabled}>
        E
      </button>
    </div>
  );
}
