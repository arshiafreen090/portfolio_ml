# Afreen Aurshi — Interactive ML / Analytics Game Portfolio

## Source of truth

Afreen Aurshi is a 3rd-year B.Tech CSE student based in India. The goal is an interactive game-style portfolio focused on ML, analytics, practical projects, and technical learning, while preserving a smaller UI/UX and graphic-design archive.

Reference for interaction model:
https://ozgurguler.tech/en

Use the reference for the idea of a game-like portfolio, character exploration, welcome card, entering areas, and a separate Professional View. Do not copy its character, village, assets, text, branding, or visual design.

## Final creative direction

Theme: **peaceful arcade / cozy space**.

The world is a spaceship floating in open space. Tobby, a small orange-and-white tabby cat wearing ONLY a transparent astronaut helmet, walks around the ship.

Visual language:
- pastel pixel-art / chibi
- cream and off-white surfaces
- navy / muted blue outlines and text
- soft lavender
- muted peach/orange
- pink as a restrained accent
- calm, clean, sparse
- retro arcade feeling
- space atmosphere

Do NOT make it cyberpunk, neon-heavy, pink-heavy, crowded, or object-filled.

## World structure

The spaceship contains:
1. Project Lab / ML Facility
2. Skills Database
3. About Me + Contact
4. Design Archive / Gallery
5. Central navigation / corridors / supporting ship areas

Outside the ship:
- stars
- planets
- moons
- asteroids
- subtle nebulae
- distant space objects

The environment should be atmospheric but sparse.

## Start popup

On initial load:
- spaceship visible behind the popup
- background softly blurred/dimmed
- centered clean onboarding card
- card is inspired by the structure of the reference site
- use a separate female avatar, NOT Tobby
- avatar: brown hair, brown eyes, fair-to-medium skin tone, simple pixel-art/chibi portrait

Card content:
- HELLO / welcome
- Afreen Aurshi
- 3rd Year CSE student
- short introduction
- Projects
- Skills
- Designs
- Journey / About
- WASD + arrow controls
- Explore Spaceship
- Professional View

Do not turn this into a giant marketing hero.

## Project Lab

The Project Lab contains exactly five physical project machines. Tobby approaches a machine, sees a small interaction prompt such as “Press E to explore”, and a large readable project popup opens.

Every project popup should show:
- title
- status
- concise description
- problem
- approach
- verified results/metrics only
- stack
- GitHub
- live demo when available
- close button

### 1. Delivery ETA Prediction
GitHub:
https://github.com/arshiafreen090/Delivery-ETA-Prediction-Dark-Store-Analysis
Live:
https://food-delivery-eta-prediction.streamlit.app/
Description: end-to-end delivery ETA prediction using ML, extended with geographic dark-store analysis and nearest-store comparison across Blinkit, Zepto, and Instamart.
Machine visual: delivery route, map, package, location marker, ETA.

### 2. Meal Demand Forecasting
GitHub:
https://github.com/arshiafreen090/Meal-Demand-Forecasting-XGBoost
Live:
https://meal-demand-forecasting-and-inventory-planning.streamlit.app/
Description: time-series demand forecasting for a meal-delivery business using XGBoost.
Concepts: lag features, rolling statistics, meal/center metadata, pricing, promotions, Center × Meal historical demand.
Machine visual: forecast chart, demand curve, calendar, inventory.

### 3. Heart Disease Prediction
GitHub:
https://github.com/arshiafreen090/Heart-Disease-Prediction-Streamlit
Live:
https://disease-heart.streamlit.app/
Description: ML web application predicting likelihood of heart disease using a trained classification model and interactive Streamlit interface.
Machine visual: heart, ECG, classification/prediction terminal.
Do not make clinical/diagnostic claims beyond the project.

### 4. Tiny Projects
GitHub:
https://github.com/arshiafreen090/Tiny-Projects
Live: none. GitHub only.
Collection of small Python projects, including:
- Jarvis voice assistant: Google speech-to-text, pyttsx3 text-to-speech, websites, local music, live news, OpenRouter fallback, silence timeout.
- WhatsApp AI Auto-Reply Bot: PyAutoGUI desktop automation, latest-message detection, AI persona replies, in-memory conversation history, inactivity timeout.
Present this as a learning/experimentation collection, not a polished SaaS.
Machine visual: Python terminal, small robot, voice waveform, automation screen.

### 5. ReSync AI
Status: **In Development**
Concept: AI resume-tailoring / job-assistance product.
Core concepts:
- resume analysis
- job-description analysis
- missing keywords
- truthful bullet rewriting
- ATS alignment
- feedback
- tailored output
Previously planned: ATS scoring, PDF output, similar-job discovery, job-hunt automation.
Do not represent planned/unfinished features as completed.
The exact current GitHub/live URLs were not reliably recoverable from the public search in this pass. Use the actual URLs from the user's ReSync project materials; never invent them.
Machine visual: resume document, AI terminal, matching score, JD panel.

## Skills Database

Use a few clean interactive terminals/cards rather than a wall of text.

Programming:
Python, C++, SQL

Data Science:
Pandas, NumPy, Matplotlib, Seaborn, EDA, Statistics

Machine Learning:
Scikit-learn, XGBoost, Feature Engineering, Model Evaluation, SHAP

Analytics:
Demand Forecasting, Time-Series Analysis, ETA Prediction, Logistics Analytics

Development:
Streamlit, React, Tailwind CSS, Git, GitHub

Tools:
Jupyter, VS Code, MySQL, WSL, n8n, Figma, Canva

## About + Contact

Name: Afreen Aurshi
Education: B.Tech CSE, 3rd year
Location: India
Focus: Machine Learning + Analytics + practical technical projects

Suggested concise intro:
“I’m Afreen, a 3rd year CSE student exploring machine learning, analytics, and practical technical projects. I like building things that connect data with real problems, while keeping a strong eye for design and user experience.”

Contact:
Email: arshiafreen090@gmail.com
GitHub: https://github.com/arshiafreen090
LinkedIn: https://www.linkedin.com/in/afreen-aurshi-60477b331/
Existing portfolio: https://www.afreen.tech/

## Design Archive / Gallery

Small creative room containing exactly two physical posters/artworks.
Tobby approaches a poster -> interaction prompt -> real poster opens in a clean large popup.
Do not fill the room with many frames.
Actual poster assets will be supplied separately.

## Professional View

A separate conventional recruiter-friendly portfolio view using the same underlying content:
1. intro
2. projects
3. skills
4. about
5. design work
6. contact
7. GitHub / LinkedIn

Recruiters must not be forced to play the game.

## UX / architecture rules

- Keep the interface plain, clean and sparse.
- Every object needs a purpose.
- No excessive particles, glow, gradients, animations, floating objects or HUD elements.
- Pink is an accent only.
- Keep project popups large enough to read.
- Do not hardcode project data into multiple components.
- Use one centralized project data source.
- The implementation agent should choose the best current technology for this experience rather than being forced into a named stack.
- Prioritize performance, maintainability, responsive behavior, asset handling, clean game/UI communication and easy deployment.
- Do not add unnecessary dependencies.
- Lazy-load heavy rooms/assets.
- Support WASD and arrow keys.
- Keep important controls accessible by click/tap as well.
- Do not rely on hover for essential information.

## Asset architecture

Treat generated images as art-direction/reference assets first. Later separate them into:
character/
spaceship/
rooms/
machines/
props/
ui/
gallery/
background/

Tobby must be independently animatable. Machines must be independent objects. Rooms must be composable, not one giant flattened screenshot.

## Core gameplay loop

Open -> welcome popup -> Explore Spaceship -> Tobby appears -> walk -> enter room -> approach interactive object -> prompt -> popup -> GitHub/live link -> close -> continue exploring.

## Primary links

GitHub: https://github.com/arshiafreen090
LinkedIn: https://www.linkedin.com/in/afreen-aurshi-60477b331/
Email: arshiafreen090@gmail.com
Portfolio: https://www.afreen.tech/
Reference: https://ozgurguler.tech/en
