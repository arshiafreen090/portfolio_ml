# Afreen Aurshi — Spaceship Portfolio

A game-style ML / analytics portfolio (walk Tobby around a small spaceship) plus a plain
**Professional View** for recruiters. Target domain: `lab.afreen.tech` (separate from afreen.tech).

```
npm install
npm run dev        # http://localhost:5173  (game)  ·  /pro/  (Professional View)
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ locally
```

## How it's built

- **Vite + React + TypeScript**, no game framework. Two real pages:
  `index.html` (Explore) and `pro/index.html` (Professional View — never loads the game code).
- **`src/game/`** — a small Canvas 2D engine: world rendering, Tobby movement + collision,
  camera, interaction zones. It reports to React through callbacks (`onFocus`, `onInteract`,
  `onRoom`) and is driven by `setPaused`, `teleport`, `interact`, `setVirtualDirection`.
- **`src/explore/`** — everything you read or click in the game is DOM: welcome card, HUD,
  interaction prompt, touch controls and popups (native `<dialog>`: focus trap + Esc).
- **`src/data/`** — the single source of truth used by both views:
  `profile.ts`, `projects.ts`, `skills.ts`, `designs.ts`, `assets.ts`.
- **`src/game/world/shipMap.ts`** — rooms, corridors, doors and interactive object positions.
  Objects only reference data by id. **`src/game/world/decor.ts`** — purely visual furniture,
  wall fittings and floor details.
- **`src/game/art/`** — procedural pixel art: `shell.ts` (static ship layer, baked once),
  `space.ts` (parallax backdrop), `props.ts` (furniture), `machines.ts` (interactive objects),
  `doors.ts`, `ambient.ts` (screens, lights, engine glow), `fx.ts` (Tobby's emotes), `theme.ts`
  (palette + per-room themes), `pixel.ts` (drawing kit).

The ship: Cockpit (start, nose) → main corridor → Project Lab above / Design Archive below →
Navigation Hub → Skills Database above / About + Contact below → locked airlock + engines.
Tobby reacts: "?" when he reaches something interactive, a wave + heart after closing a popup,
"!" at the locked airlock, sits after 8 s idle and naps after 20 s.

Controls: WASD / arrow keys to walk, **E** (or Enter/Space) to interact, on-screen pad on touch
devices. The **Map** button (and the hub's globe) jumps to any room, so nothing requires playing;
the cockpit's flight console reopens the welcome card.

## Content rules baked into the data

- Project **Results** sections render only when `results` is set — none are set, because there
  are no verified metrics yet.
- `stack` lists only what is confirmed for each project; extend it in `projects.ts` if needed.
- **ReSync AI** is "In Development" with no links. Add them to `links` in `projects.ts` when ready.
- There is no Journey timeline yet; add one when the content is final.

## Replacing the art

Everything visual is drawn in code (`src/game/art/`) and is used **only** while the matching
manifest entry is empty. Nothing procedural is baked into image files. To drop in final art, put
files under `public/assets/…` and set the path in **`src/data/assets.ts`**:

| Asset | Manifest key | Notes |
|---|---|---|
| Room backgrounds | `rooms.cockpit / hub / lab / skills / about / gallery` | Stretched to the room rect in `shipMap.ts`: cockpit 360×380, hub 400×460, lab & skills 620×400, about & gallery 540×360 (or an integer multiple). Top 80 units = back wall. No text, labels, Tobby or UI. A room with art skips its procedural furniture and wall screens. |
| Whole ship | `hull` | Optional; replaces the procedural shell, covers the world (2360×1100). |
| 5 project machines | `machines.eta / meal / heart / tiny / resync` | Transparent PNG, drawn bottom-centre on the machine's base point. ~78×112. |
| Other interactive props | `props.skillTerminal / contactTerminal / aboutBoard / navConsole / briefingConsole` | Same convention as machines. |
| Furniture | `decor.plant / bookshelf / couch / …` | Any `PropKind` from `decor.ts`; bottom-centre. Missing = procedural. |
| Space backdrop | `space` | Tiled with slow parallax (replaces the procedural stars/planets). |
| Posters | `image` in `src/data/designs.ts` | Shown on the two poster stands and in the poster popup; also set title/description/alt. |
| Tobby | `tobby` | Frame strip + JSON (`public/assets/character/tobby.json` shows the format: frame size, foot anchor, `idle-/walk-` × `down/up/left/right`, plus `sit`, `sleep`, `wave`). |
| Avatar | `avatar` | Welcome card, About popup and board, Professional View. |

Room, machine and poster images load lazily when they come near the camera.

`npm run assets` re-generates the current Tobby strip and avatar from the reference sheets in
`assets/` (Tobby is sliced from `assets/character.png`; it has no front-facing walk cycle, so
walking down reuses the idle frames with a bob). A clean, transparent sprite sheet will look better.
Room name signs on the hull and hub signage are drawn by code, not part of any room art.

## Deployment (not done yet)

Static site: deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages)
and point a `lab` CNAME record at it. Nothing has been pushed or deployed.
