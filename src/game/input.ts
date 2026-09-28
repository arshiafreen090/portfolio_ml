// Keyboard (WASD + arrows, E/Enter/Space to interact) plus a virtual
// direction set by the on-screen touch controls.

const DIRS: Record<string, [number, number]> = {
  KeyW: [0, -1], ArrowUp: [0, -1],
  KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0],
};

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/** Enter/Space should only trigger the game when no control has focus. */
const nothingFocused = () => {
  const a = document.activeElement;
  return !a || a === document.body || a instanceof HTMLCanvasElement;
};

export class Input {
  private held = new Set<string>();
  private virtual = { x: 0, y: 0 };
  enabled = true;

  constructor(private onInteract: () => void) {
    window.addEventListener('keydown', this.down);
    window.addEventListener('keyup', this.up);
    window.addEventListener('blur', this.clear);
  }

  destroy() {
    window.removeEventListener('keydown', this.down);
    window.removeEventListener('keyup', this.up);
    window.removeEventListener('blur', this.clear);
  }

  clear = () => {
    this.held.clear();
    this.virtual = { x: 0, y: 0 };
  };

  setVirtual(x: number, y: number) {
    this.virtual = { x, y };
  }

  /** Normalised movement vector. */
  direction() {
    let x = this.virtual.x, y = this.virtual.y;
    if (this.enabled) {
      for (const code of this.held) {
        const d = DIRS[code];
        if (d) { x += d[0]; y += d[1]; }
      }
    }
    x = Math.max(-1, Math.min(1, x));
    y = Math.max(-1, Math.min(1, y));
    const len = Math.hypot(x, y);
    return len > 1 ? { x: x / len, y: y / len } : { x, y };
  }

  private down = (e: KeyboardEvent) => {
    if (!this.enabled || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (DIRS[e.code]) {
      this.held.add(e.code);
      e.preventDefault();
      return;
    }
    if (e.repeat) return;
    if (e.code === 'KeyE' || ((e.code === 'Enter' || e.code === 'Space') && nothingFocused())) {
      e.preventDefault();
      this.onInteract();
    }
  };

  private up = (e: KeyboardEvent) => {
    this.held.delete(e.code);
  };
}
