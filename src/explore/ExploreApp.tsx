import { useCallback, useEffect, useRef, useState } from 'react';
import { Engine } from '../game/engine';
import { roomById, type Interactable, type InteractKind, type RoomId } from '../game/world/shipMap';
import { Hud, RoomToast } from './Hud';
import { InteractionPrompt } from './InteractionPrompt';
import { TouchControls } from './TouchControls';
import { WelcomeCard } from './WelcomeCard';
import { music } from './music';
import { AboutPopup } from './popups/AboutPopup';
import { ContactPopup } from './popups/ContactPopup';
import { MapPopup } from './popups/MapPopup';
import { ArtworkPopup } from './popups/ArtworkPopup';
import { GalleryViewer } from './popups/GalleryViewer';
import { TelescopePopup } from './popups/TelescopePopup';
import { ProjectPopup } from './popups/ProjectPopup';
import { SkillsPopup } from './popups/SkillsPopup';
import { JokesPopup } from './popups/JokesPopup';

export type Popup = { kind: 'welcome' } | { kind: InteractKind; refId: string };

const useCoarsePointer = () => {
  const [coarse, setCoarse] = useState(() => matchMedia('(pointer: coarse)').matches);
  useEffect(() => {
    const mq = matchMedia('(pointer: coarse)');
    const on = () => setCoarse(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return coarse;
};

export function ExploreApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [ready, setReady] = useState(false);
  const [focus, setFocus] = useState<Interactable | null>(null);
  const [room, setRoom] = useState<RoomId | null>('cockpit');
  const [popup, setPopup] = useState<Popup | null>({ kind: 'welcome' });
  const [toast, setToast] = useState<{ room: RoomId; key: number } | null>(null);
  const coarse = useCoarsePointer();

  useEffect(() => {
    const engine = new Engine(canvasRef.current!, {
      onReady: () => setReady(true),
      onFocus: setFocus,
      onRoom: (r) => {
        setRoom(r);
        if (r) setToast({ room: r, key: Date.now() });
      },
      // the cockpit flight console replays the welcome briefing
      onInteract: (it) => setPopup(it.kind === 'briefing' ? { kind: 'welcome' } : { kind: it.kind, refId: it.refId }),
    });
    engineRef.current = engine;
    if (import.meta.env.DEV) Object.assign(window, { __engine: engine, __music: music });
    return () => engine.destroy();
  }, []);

  useEffect(() => {
    engineRef.current?.setPaused(popup !== null);
  }, [popup]);

  const close = useCallback(() => setPopup(null), []);
  // leaving the welcome card is the explicit gesture that starts the music
  const enterShip = useCallback(() => { music.start(); setPopup(null); }, []);
  const goTo = useCallback((r: RoomId) => {
    engineRef.current?.teleport(r);
    music.start();
    setPopup(null);
  }, []);

  // click / tap an object on the canvas to open it directly
  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (popup) return;
    const it = engineRef.current?.pick(e.clientX, e.clientY);
    if (it) engineRef.current?.activate(it);
  };
  const onCanvasMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType !== 'mouse') return;
    const it = popup ? null : engineRef.current?.pick(e.clientX, e.clientY);
    e.currentTarget.style.cursor = it ? 'pointer' : '';
  };

  const blurred = popup?.kind === 'welcome';

  return (
    <div className="explore">
      <canvas
        ref={canvasRef}
        className={`explore__canvas ${ready ? 'is-ready' : ''} ${blurred ? 'is-blurred' : ''}`}
        role="img"
        aria-label="Pixel-art spaceship with Tobby the cat. Use the Map button to jump between rooms."
        onClick={onCanvasClick}
        onPointerMove={onCanvasMove}
      />

      {!ready && !popup && <div className="explore__loading">Loading spaceship…</div>}

      {!popup && (
        <>
          {toast && (
            <RoomToast key={toast.key} room={toast.room} name={roomById[toast.room].name} onDone={() => setToast(null)} />
          )}
          <Hud
            room={room}
            roomName={room ? roomById[room].name : 'Corridor'}
            onMap={() => setPopup({ kind: 'map', refId: 'map' })}
            onHelp={() => setPopup({ kind: 'welcome' })}
          />
          {focus && (
            <InteractionPrompt
              target={focus}
              showKey={!coarse}
              onActivate={() => engineRef.current?.interact()}
            />
          )}
          {coarse && (
            <TouchControls
              onDirection={(x, y) => engineRef.current?.setVirtualDirection(x, y)}
              onAction={() => engineRef.current?.interact()}
              actionEnabled={!!focus}
            />
          )}
        </>
      )}

      <WelcomeCard open={popup?.kind === 'welcome'} onClose={enterShip} onGoTo={goTo} />
      <ProjectPopup refId={popup?.kind === 'project' ? popup.refId : null} onClose={close} />
      <SkillsPopup refId={popup?.kind === 'skills' ? popup.refId : null} onClose={close} />
      <JokesPopup open={popup?.kind === 'jokes'} onClose={close} />
      <AboutPopup open={popup?.kind === 'about'} onClose={close} />
      <ContactPopup open={popup?.kind === 'contact'} onClose={close} />
      <ArtworkPopup refId={popup?.kind === 'poster' ? popup.refId : null} onClose={close} />
      <GalleryViewer
        open={popup?.kind === 'gallery'}
        onClose={close}
        onDetail={(id) => setPopup({ kind: 'poster', refId: id })}
      />
      <TelescopePopup open={popup?.kind === 'telescope'} onClose={close} />
      <MapPopup
        open={popup?.kind === 'map'}
        onClose={close}
        onGoTo={goTo}
        onWelcome={() => setPopup({ kind: 'welcome' })}
      />
    </div>
  );
}
