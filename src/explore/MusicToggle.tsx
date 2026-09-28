import { useEffect, useState } from 'react';
import { music } from './music';

/** Tiny speaker button in the HUD. Hidden when no music track is configured. */
export function MusicToggle() {
  const [state, setState] = useState({ available: false, muted: false, playing: false });
  useEffect(() => music.subscribe(setState), []);
  if (!state.available) return null;
  const off = state.muted;
  return (
    <button
      type="button"
      className="btn btn--small btn--icon"
      onClick={() => music.toggle()}
      aria-pressed={!off}
      aria-label={off ? 'Turn music on' : 'Mute music'}
      title={off ? 'Music off' : 'Music on'}
    >
      <svg className="pxicon" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="1" y="6" width="3" height="4" fill="currentColor" />
        <path d="M4 6h1V5h1V4h1V3h1v10H7v-1H6v-1H5v-1H4z" fill="currentColor" />
        {off ? (
          <path d="M10 5h1v1h1v1h1V6h1V5h1v1h-1v1h-1v1h1v1h1v1h-1v1h-1v-1h-1v-1h-1v1h-1v-1h1V9h1V8h-1V7h-1z" fill="var(--pink)" />
        ) : (
          <>
            <rect x="10" y="6" width="1" height="4" fill="currentColor" />
            <rect x="12" y="4" width="1" height="8" fill="currentColor" />
            <rect x="14" y="3" width="1" height="10" fill="currentColor" opacity="0.6" />
          </>
        )}
      </svg>
    </button>
  );
}
