// Frame-strip sprite atlas (see public/assets/character/tobby.json).

export interface Animation {
  frames: number[];
  fps: number;
  flip?: boolean;
  /** add a small vertical bounce (used where no dedicated walk frames exist) */
  bob?: boolean;
}

export interface Atlas {
  image: string;
  frameWidth: number;
  frameHeight: number;
  anchor: { x: number; y: number };
  animations: Record<string, Animation>;
}

export interface SpriteSheet {
  atlas: Atlas;
  img: HTMLImageElement;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function loadSpriteSheet(atlasUrl: string, imageUrl: string): Promise<SpriteSheet> {
  const res = await fetch(atlasUrl);
  if (!res.ok) throw new Error(`Failed to load ${atlasUrl}`);
  const atlas = (await res.json()) as Atlas;
  return { atlas, img: await loadImage(imageUrl) };
}

export class Animator {
  private name = '';
  private time = 0;

  constructor(private sheet: SpriteSheet) {}

  play(name: string) {
    if (name === this.name) return;
    if (!this.sheet.atlas.animations[name]) return;
    this.name = name;
    this.time = 0;
  }

  update(dt: number) {
    this.time += dt;
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const { atlas, img } = this.sheet;
    const anim = atlas.animations[this.name];
    if (!anim) return;
    const step = Math.floor(this.time * anim.fps);
    const frame = anim.frames[step % anim.frames.length];
    const bob = anim.bob ? (step % 2 === 0 ? 0 : -3) : 0;
    const { frameWidth: fw, frameHeight: fh, anchor } = atlas;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y + bob));
    if (anim.flip) ctx.scale(-1, 1);
    ctx.drawImage(img, frame * fw, 0, fw, fh, -anchor.x, -anchor.y, fw, fh);
    ctx.restore();
  }
}
