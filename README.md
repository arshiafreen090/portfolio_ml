# Afreen Aurshi — Spaceship Portfolio 🪐

A game-style **ML / Analytics portfolio** built as an interactive spaceship. Visitors can walk around the ship with Tobby, an astronaut cat, and explore projects, skills, design work, and personal information.

Alongside the interactive experience, the portfolio includes a conventional **Professional View** designed for recruiters.

**Live Portfolio:** https://lab.afreen.tech/  
**Professional View:** https://lab.afreen.tech/pro/

---

## Overview

The portfolio combines a small 2D exploration game with a traditional portfolio website.

Visitors can:

- Explore a spaceship using keyboard or touch controls
- Interact with project workstations
- Browse technical skills
- Explore five design works
- Use a holographic navigation globe
- Look through an interactive telescope
- Open About and Contact information
- Listen to ambient background music
- Switch to a recruiter-friendly Professional View

The game is intentionally lightweight and does not use a game framework such as Phaser or Three.js.

---

## Tech Stack

### Frontend

- **React** — UI and application structure
- **TypeScript** — typed application and game logic
- **Vite** — development server and production bundling
- **CSS** — interface styling and responsive layouts

### Interactive Engine

The spaceship is rendered using a custom **Canvas 2D engine**.

It handles:

- World rendering
- Tobby movement
- Collision detection
- Camera movement
- Interaction zones
- Room transitions
- Interactive objects
- Ambient animations
- Touch controls

React is used separately for the interface layer, including popups, HUD elements, interaction prompts, and dialogs.

### Deployment

- GitHub Actions
- GitHub Pages
- Custom domain: `lab.afreen.tech`

---

## Architecture

The project uses two real pages:

```text
index.html
└── Explore Mode
    ├── Canvas 2D game world
    └── React DOM interface

pro/index.html
└── Professional View
    └── Recruiter-focused portfolio
```

Both views use the same centralized portfolio data.

### Main Source Structure

```text
src/
├── data/
│   ├── assets.ts
│   ├── designs.ts
│   ├── profile.ts
│   ├── projects.ts
│   └── skills.ts
│
├── explore/
│   └── Game interface and popups
│
├── game/
│   ├── art/
│   └── world/
│
├── pro/
│   └── Professional View
│
└── styles/
    └── Global styling
```

### Game Rendering

```text
src/game/art/
├── shell.ts       # Spaceship shell
├── space.ts       # Space backdrop
├── props.ts       # Furniture and props
├── machines.ts    # Project workstations
├── doors.ts       # Doors and transitions
├── ambient.ts     # Screens, lights and effects
├── fx.ts          # Tobby reactions
├── theme.ts       # Room palettes and themes
├── pixel.ts       # Pixel drawing utilities
└── telescope.ts   # Telescope scenes
```

World layout and interactive object positions are maintained separately in:

```text
src/game/world/
├── shipMap.ts
└── decor.ts
```

This keeps **game logic, content, and visual decoration separated**.

---

## Spaceship

The ship is divided into several interactive areas:

```text
Cockpit
   ↓
Main Corridor
   ├── Project Lab
   └── Design Archive
          ↓
    Navigation Hub
       ├── Skills Database
       └── About + Contact
              ↓
        Locked Airlock
              ↓
            Engines
```

### Cockpit

The starting area of the spaceship. The flight console can reopen the welcome card and provide navigation into the portfolio.

### Project Lab

Contains five visually different workstations:

1. Delivery ETA Prediction
2. Meal Demand Forecasting
3. Heart Disease Prediction
4. Tiny Projects
5. ReSync AI

Each workstation can be approached and interacted with using `E`, or clicked/tapped directly.

### Design Archive

A small spaceship gallery containing five design works.

Artwork can be opened by walking to it and pressing `E`, clicking/tapping the artwork, or using the central gallery computer. The gallery computer allows navigation between works using `1`–`5`.

### Navigation Hub

The central navigation room contains an interactive holographic globe and telescope. The telescope contains ten slowly changing space scenes.

### Skills Database

An interactive terminal for exploring technical skills and tools used across the portfolio.

### About + Contact

Contains education, personal introduction, small personal details, LinkedIn, X, Email, and GitHub.

---

## Tobby

Tobby is the interactive astronaut cat used throughout the spaceship.

He supports:

- Four-direction movement
- Idle animation
- Interaction reactions
- Wave and heart reactions
- Sitting after inactivity
- Sleeping after extended inactivity
- Locked-area reaction

### Controls

```text
W / ↑        Move up
S / ↓        Move down
A / ←        Move left
D / →        Move right

E            Interact
Enter        Interact
Space        Interact
```

Touch devices receive an on-screen movement controller.

---

## Centralized Data

Portfolio content is kept in:

```text
src/data/
├── profile.ts
├── projects.ts
├── skills.ts
├── designs.ts
└── assets.ts
```

This allows the Explore Mode and Professional View to use the same information.

Project metrics and technical information are only added when verified from the project's source data, repositories, resume, or project documentation.

---

## Assets

Visual assets can replace the procedural artwork without changing the underlying game logic.

Configured through:

```text
src/data/assets.ts
```

Supported asset categories include:

```text
Room backgrounds
Spaceship hull
Project workstations
Interactive props
Furniture
Space backdrop
Design artwork
Tobby
Avatar
```

Tobby's sprite configuration is stored in:

```text
public/assets/character/tobby.json
```

The current generated assets can be regenerated with:

```bash
npm run assets
```

---

## Music

Explore Mode includes quiet looping ambient music. It starts after the visitor enters the spaceship, plays at low volume, fades in, can be muted/unmuted, and remembers the mute preference.

The track can be changed through:

```text
src/data/assets.ts
```

---

## GitHub Activity

The Professional View includes GitHub contribution activity using `ghchart.rshah.org`. If the contribution calendar fails to load, the portfolio falls back to a link to the GitHub profile.

---

## Local Development

Clone the repository:

```bash
git clone https://github.com/arshiafreen090/portfolio_ml.git
cd portfolio_ml
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Explore Mode:

```text
http://localhost:5173/
```

Professional View:

```text
http://localhost:5173/pro/
```

### Production Build

```bash
npm run build
```

The production files are generated in `dist/`.

Preview the production build:

```bash
npm run preview
```

---

## Deployment

The portfolio is deployed using **GitHub Actions and GitHub Pages**.

---

## Links

- **Portfolio:** https://lab.afreen.tech/
- **Professional View:** https://lab.afreen.tech/pro/
- **GitHub:** https://github.com/arshiafreen090
- **LinkedIn:** https://www.linkedin.com/in/afreen-aurshi-60477b331/
- **Email:** arshiafreen090@gmail.com

---

## License

This is a personal portfolio project.

The portfolio content, resume, artwork, personal assets, and other original materials should not be reused without permission.
