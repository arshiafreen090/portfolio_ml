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
- **`src/game/world/shipMap.ts`** — rooms, corridors, doors and object positions.
  Objects only reference data by id.

Controls: WASD / arrow keys to walk, **E** (or Enter/Space) to interact, on-screen pad on touch
devices. The **Map** button (and the cockpit console) jumps to any room, so nothing requires playing.

## Content rules baked into the data

- Project **Results** sections render only when `results` is set — none are set, because there
  are no verified metrics yet.
- `stack` lists only what is confirmed for each project; extend it in `projects.ts` if needed.
- **ReSync AI** is "In Development" with no links. Add them to `links` in `projects.ts` when ready.
- There is no Journey timeline yet; add one when the content is final.

## Replacing the placeholder art

All placeholder visuals are drawn in code (`src/game/placeholders.ts`, `src/game/space.ts`) and
are used **only** while the matching manifest entry is `null`. Nothing placeholder is baked into
an image file. To drop in final art, put files under `public/assets/…` and set the path in
**`src/data/assets.ts`**:

| Asset | Manifest key | Notes |
|---|---|---|
| Room backgrounds | `rooms.hub / lab / skills / about / gallery` | Stretched to the room rect in `shipMap.ts`: hub 320×360, lab & skills 600×380, about & gallery 520×320 (or an integer multiple). Top 80 units = back wall. No text, labels, Tobby or UI. |
| Ship hull + corridors | `hull` | Optional, covers the whole world (1800×1060). |
| 5 project machines | `machines.eta / meal / heart / tiny / resync` | Transparent PNG, drawn bottom-centre on the machine's base point. ~74 wide. |
| Other props | `props.skillTerminal / contactTerminal / aboutBoard / navConsole` | Same convention as machines. |
| Space backdrop | `space` | Tiled with slow parallax. |
| Posters | `image` in `src/data/designs.ts` | Shown in the gallery frames and the poster popup; also set title/description/alt. |
| Tobby | `tobby` | Frame strip + JSON (`public/assets/character/tobby.json` shows the format: frame size, foot anchor, `idle-/walk-` × `down/up/left/right`). |
| Avatar | `avatar` | Welcome card, About popup, Professional View. |

Room and machine images load lazily when Tobby gets close to them.

`npm run assets` re-generates the current Tobby strip and avatar from the reference sheets in
`assets/` (Tobby is sliced from `assets/character.png`; it has no front-facing walk cycle, so
walking down reuses the idle frames with a bob). A clean, transparent sprite sheet will look better.
The room names on the hull are a UI label layer drawn by code, not part of the room art.

## Deployment (not done yet)

Static site: deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages)
and point a `lab` CNAME record at it. Nothing has been pushed or deployed.
