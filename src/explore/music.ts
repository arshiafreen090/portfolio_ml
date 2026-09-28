// Quiet background music for Explore mode.
//
// Plays a self-hosted audio file (assetManifest.music). It only ever starts
// from a user gesture (entering Explore), fades in to a low volume, loops,
// and remembers the viewer's mute choice in this browser.
//
// Why not the YouTube video directly: YouTube's embed terms require a visible
// player (≥200×200) and don't allow separating the audio from the video, so a
// hidden audio-only YouTube player isn't an allowed approach.

import { assetManifest, assetUrl } from '../data/assets';

const VOLUME = 0.16;
const KEY = 'afreen-lab:music-muted';

const readMuted = () => {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
};
const writeMuted = (m: boolean) => {
  try { localStorage.setItem(KEY, m ? '1' : '0'); } catch { /* storage unavailable */ }
};

type Listener = (state: { available: boolean; muted: boolean; playing: boolean }) => void;

class AmbientMusic {
  private audio: HTMLAudioElement | null = null;
  private muted = readMuted();
  private playing = false;
  private listeners = new Set<Listener>();
  readonly available = !!assetManifest.music;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.state());
    return () => { this.listeners.delete(fn); };
  }

  private state() {
    return { available: this.available, muted: this.muted, playing: this.playing };
  }

  private emit() {
    for (const fn of this.listeners) fn(this.state());
  }

  /** Call from a click/tap handler only. */
  start() {
    if (!this.available || this.playing || this.muted) return;
    this.audio ??= Object.assign(new Audio(assetUrl(assetManifest.music!)), { loop: true, volume: 0, preload: 'auto' });
    this.audio.play().then(() => {
      this.playing = true;
      this.fadeTo(VOLUME);
      this.emit();
    }).catch(() => { /* blocked by the browser: stay silent until the next gesture */ });
  }

  toggle() {
    this.muted = !this.muted;
    writeMuted(this.muted);
    if (this.muted) {
      if (this.audio) this.fadeTo(0, () => this.audio?.pause());
      this.playing = false;
      this.emit();
    } else {
      this.emit();
      this.start();
    }
  }

  private fadeTo(target: number, done?: () => void) {
    const a = this.audio;
    if (!a) return;
    const from = a.volume, t0 = performance.now(), dur = 900;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      a.volume = from + (target - from) * k;
      if (k < 1) requestAnimationFrame(step);
      else done?.();
    };
    requestAnimationFrame(step);
  }
}

export const music = new AmbientMusic();
