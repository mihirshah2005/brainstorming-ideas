# Echoes of Aphelion

A playable 3D browser exploration game built on Three.js. No build step — open
`index.html` in any modern browser (needs internet for the Three.js CDN).

You land on a planet that is an exact copy of Earth, ten thousand years after
humanity became something unrecognizable and vanished. Explore eight ruined
megastructures on foot and by ship, recover up to 16 memory fragments, and reach
the final chamber to learn what actually happened.

## Controls

### On foot
| Key | Action |
|---|---|
| WASD | Move |
| Mouse | Look (click to capture) |
| Shift | Sprint |
| Space | Jump |
| C / Ctrl | Crouch |
| E / Left click | Examine · close / skip text |
| Right mouse (hold) | Visor zoom |
| F | Suit light |
| Q | Scanner pulse (pings nearby undiscovered memories through walls) |
| V | First / third person |
| M | Survey map |
| P | Photo mode (hides HUD) |
| Tab | Toggle memory log |
| ESC | Pause menu (quality / audio settings) |

### Flight
Walk onto the landing pad near the lander and press **E** to board the recon dart.

| Key | Action |
|---|---|
| W / S | Throttle up / down |
| Mouse | Pitch & yaw (the ship banks into turns) |
| Shift | Boost |
| Space / C | Vertical thrusters up / down |
| X | Air brake |
| G | Autoland (fly low and slow) |
| E | Disembark (when landed) |

Collect at least **10** of the 16 memories to unseal the final chamber, due north
beyond the spire. Two memories (**The Breakwater** out over the sea, **The Tether**
to the far northeast) are reachable only by ship.

## Architecture

Multi-file, `file://`-safe (classic script tags in dependency order, no modules
so it runs by double-clicking):

```
index.html          CSS, DOM overlays, script manifest
js/core.js          renderer, scene, camera, constants
js/sky.js           sky dome, stars, ringed gas giant, aurora, sun, lights
js/world.js         collision, materials, procedural textures, flora/glyph helpers
js/locations.js     the 6 walkable locations + world dressing
js/story.js         all fragment text
js/player.js        on-foot controller, interaction, dialog/log
js/audio.js         procedural ambience, tones, footsteps
js/ending.js        ending cinematic
js/suit.js          astronaut model, torch, scanner, compass
js/ui.js            boot sequence, title cards, holo map, pause menu, typewriter
js/ship.js          flyable recon dart
js/sky-locations.js Breakwater + Tether + ocean
js/render.js        post-processing pipeline + main loop
```

## Rendering

Three.js r160 (ES modules via import map, still no build step) with the official
EffectComposer pipeline: 4x MSAA HDR render target, UnrealBloom, a custom FX pass
(screen-space god rays, chromatic aberration, vignette, film grain), ACES filmic
tonemapping via OutputPass, and SMAA. The world is lit by image-based lighting:
a PMREM environment map generated from the game's own sky, so every material
reflects the dusk it stands in. Plus real-time shadow maps, procedural
concrete/ground/facade textures, shader-displaced water and ocean, a star field,
a textured ringed gas giant, and animated aurora shaders.

Extras: photo mode (P) hides the HUD for clean captures; the pause menu has
QUALITY (drops bloom/SMAA/shadows/pixel ratio) and FIELD OF VIEW settings.

See `PLAN.md` for the expansion roadmap and remaining future ideas.

## Tips
- Use Q (scanner pulse) early — it reveals hidden memories through walls
- Visit the Breakwater at dusk for the best view
