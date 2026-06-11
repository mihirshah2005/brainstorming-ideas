# Echoes of Aphelion

A playable 3D browser exploration game in a single HTML file (Three.js).

You land on a planet that is an exact copy of Earth, ten thousand years after
humanity became something unrecognizable and vanished. Explore six ruined
megastructures, recover 14 memory fragments, and reach the final chamber to
learn what actually happened.

## Play

Open `index.html` in any modern browser (needs internet for the Three.js CDN).

| Key | Action |
|---|---|
| WASD | Move |
| Mouse | Look (click to capture) |
| Shift | Sprint |
| Space | Jump |
| C / Ctrl | Crouch |
| E / Left click | Examine, close text |
| Right mouse (hold) | Visor zoom |
| F | Suit light |
| Q | Scanner pulse (reveals nearby undiscovered memories) |
| V | First / third person |
| Tab | Toggle memory log |
| ESC | Release mouse |

Collect at least 10 memories to unseal the final chamber, far north beyond the spire.

## Rendering

Custom post-processing pipeline (bloom, ACES filmic tonemapping, chromatic
aberration, vignette, film grain), real-time shadow maps, procedural textures,
shader-displaced water, star field, ringed gas giant, animated aurora —
all hand-rolled on Three.js r128 in one file with no build step.
