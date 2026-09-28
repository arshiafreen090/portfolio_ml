# Afreen Aurshi — Spaceship Portfolio

A game-style ML / analytics portfolio (walk Tobby around a small spaceship) plus a plain
**Professional View** for recruiters. Final URL: **https://lab.afreen.tech/** (main portfolio; `/pro/` is the Professional View).

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

- Every project number and tool comes from the resume (`public/resume/Afreen_Aurshi_Resume.pdf`),
  the repos' `requirements.txt`, or `CLAUDE_BUILD_CONTEXT.md`. Metrics live in `metrics` in
  `src/data/projects.ts` — don't add anything that isn't verified there.
- Only **ReSync AI** shows a status label ("In Development"); shipped projects show none.
- Experience entries are in `src/data/profile.ts` and render as the **last** section of the
  Professional View.
- The resume PDF is the user's own file; its only change is the Portfolio link →
  `https://lab.afreen.tech/` (approved). Replace the file in `public/resume/` to update it.

## Rooms and objects

- **Project Lab** — five different workstations (logistics desk, forecast tower, diagnostic pod,
  tinker bench, ReSync terminal under construction), not in a line; some face sideways.
- **Design Archive** — five framed works (four on the tall back wall, one on a display wall), a
  central gallery computer (browse `1`–`5`), design desk, shelf, sculpture, plants. Artworks open by
  walking up (E), clicking/tapping the frame, or via the computer — all from `src/data/designs.ts`.
- **Navigation Hub** — hologram globe (teleport) and a telescope with ten slowly changing scenes
  (`src/game/art/telescope.ts`).
- **About + Contact** — profile board (education, "a little about me") and comms terminal with
  contact cards (LinkedIn, X, Email, GitHub).
- Any interactive object can also be clicked/tapped on the canvas.

## Music

Explore mode plays quiet, looping background music ("boba date" by Stream Cafe, royalty free,
`public/assets/audio/ambient.mp3`). It starts only after the visitor enters the ship (browser
autoplay rules), fades in at low volume, and the speaker button in the top bar mutes/unmutes it
(remembered per browser). Change the track via `music` in `src/data/assets.ts`.

## GitHub activity

The Professional View shows the contribution calendar via the public image service
`ghchart.rshah.org`; if it fails to load, a plain link to the GitHub profile is shown instead.

## Replacing the art

Everything visual is drawn in code (`src/game/art/`) and is used **only** while the matching
manifest entry is empty. Nothing procedural is baked into image files. To drop in final art, put
files under `public/assets/…` and set the path in **`src/data/assets.ts`**:

| Asset | Manifest key | Notes |
|---|---|---|
| Room backgrounds | `rooms.cockpit / hub / lab / skills / about / gallery` | Stretched to the room rect in `shipMap.ts`: cockpit 360×380, hub 400×460, lab & skills 620×400, about 540×360, gallery 580×400 (or an integer multiple). Top 80 units = back wall (gallery: 128). No text, labels, Tobby or UI. A room with art skips its procedural furniture and wall screens. |
| Whole ship | `hull` | Optional; replaces the procedural shell, covers the world (2360×1140). |
| 5 project workstations | `machines.eta / meal / heart / tiny / resync` | Transparent PNG, drawn bottom-centre on the object's base point. Sizes in `shipMap.ts` (eta 130×96, meal 88×124, heart 92×96, tiny 112×74, resync 100×104). |
| Other interactive props | `props.skillTerminal / contactTerminal / aboutBoard / navConsole / briefingConsole / galleryComputer / telescope` | Same convention as machines. |
| Furniture | `decor.plant / bookshelf / couch / …` | Any `PropKind` from `decor.ts`; bottom-centre. Missing = procedural. |
| Space backdrop | `space` | Tiled with slow parallax (replaces the procedural stars/planets). |
| Design works | `image` in `src/data/designs.ts` | Real artwork for each of the five works. Until set, the `placeholder` illustration (`public/assets/gallery/placeholder-*.svg`, clearly labelled) is shown on the wall, in the popups and in the Professional View. |
| Tobby | `tobby` | Frame strip + JSON (`public/assets/character/tobby.json` shows the format: frame size, foot anchor, `idle-/walk-` × `down/up/left/right`, plus `sit`, `sleep`, `wave`). |
| Avatar | `avatar` | Welcome card, About popup and board, Professional View. |

Room, machine and poster images load lazily when they come near the camera.

`npm run assets` re-generates the current Tobby strip and avatar from the reference sheets in
`assets/` (Tobby is sliced from `assets/character.png`; it has no front-facing walk cycle, so
walking down reuses the idle frames with a bob). A clean, transparent sprite sheet will look better.
Room name signs on the hull and hub signage are drawn by code, not part of any room art.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/`
to **GitHub Pages**. `public/CNAME` sets the custom domain **lab.afreen.tech**.

One-time setup:
1. Repo → Settings → Pages → Source: **GitHub Actions** (the workflow also tries to enable this).
2. DNS for afreen.tech: add `CNAME  lab  →  arshiafreen090.github.io`.
3. After the certificate is issued, tick **Enforce HTTPS** in Settings → Pages.
