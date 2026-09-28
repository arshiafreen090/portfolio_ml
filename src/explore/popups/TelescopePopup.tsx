import { useEffect, useRef, useState } from 'react';
import { SCENES, sceneBuffer, VIEW } from '../../game/art/telescope';
import { Modal } from '../../ui/Modal';

const SCENE_SECONDS = 9;
const FADE_SECONDS = 1.2;

/** Look outside the ship: slowly changing views through the hub telescope. */
export function TelescopePopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const sinceRef = useRef(0);
  const prevRef = useRef(SCENES.length - 1);

  const go = (i: number) => {
    const n = (i + SCENES.length) % SCENES.length;
    prevRef.current = indexRef.current;
    indexRef.current = n;
    sinceRef.current = 0;
    setIndex(n);
  };

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const out = canvas.getContext('2d')!;
    const a = sceneBuffer(), b = sceneBuffer();
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last = performance.now(), t = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += calm ? 0 : dt;
      sinceRef.current += dt;
      if (sinceRef.current > SCENE_SECONDS) go(indexRef.current + 1);

      const cur = SCENES[indexRef.current];
      const prev = SCENES[prevRef.current];
      const fade = Math.min(1, sinceRef.current / FADE_SECONDS);
      cur.draw(a.ctx, t);
      out.imageSmoothingEnabled = false;
      out.clearRect(0, 0, canvas.width, canvas.height);
      if (fade < 1 && sinceRef.current < FADE_SECONDS && t > FADE_SECONDS) {
        prev.draw(b.ctx, t);
        out.drawImage(b.canvas, 0, 0, canvas.width, canvas.height);
        out.globalAlpha = fade;
      }
      out.drawImage(a.canvas, 0, 0, canvas.width, canvas.height);
      out.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} bar="Navigation Hub · Telescope" labelledBy="telescope-title" size="md">
      <div className="telescope">
        <h2 id="telescope-title" className="visually-hidden">Telescope view</h2>
        <div className="telescope__eyepiece">
          <canvas ref={canvasRef} width={VIEW * 3} height={VIEW * 3} role="img" aria-label={`Telescope view: ${SCENES[index].name}`} />
          <span className="telescope__reticle" aria-hidden="true" />
        </div>
        <div className="telescope__bar">
          <p className="telescope__caption" aria-live="polite">
            <span className="telescope__scan">Viewing</span> {SCENES[index].name}
          </p>
          <div className="telescope__controls">
            <button type="button" className="btn btn--small" onClick={() => go(indexRef.current - 1)} aria-label="Previous view">◀</button>
            <button type="button" className="btn btn--small" onClick={() => go(indexRef.current + 1)}>Next view ▶</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
