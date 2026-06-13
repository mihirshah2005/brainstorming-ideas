# Echoes of Aphelion — Expansion Plan

Status legend: [ ] todo · [x] done · [~] in progress
A future session picking this up: read this file, check git log, continue from the first unchecked phase.

## Architecture decision

Move from single-file to a multi-file structure that still runs from `file://` with no
build step: classic `<script>` tags loaded in order (top-level `let/const` share the
global lexical scope across classic scripts, so the split is mechanical and safe —
ES modules are NOT used because they break on `file://` CORS).

```
index.html        — CSS, DOM overlays, script tag manifest
js/core.js        — constants, rng, renderer, scene, camera, resize
js/sky.js         — sky dome, stars, gas giant, aurora, sun, lights
js/world.js       — ground, collision, materials, textures, helpers (glyphs, flora, holo)
js/locations.js   — the 6 walkable locations + world dressing + spores
js/story.js       — all fragment text (FRAGS), TOTAL/REQUIRED
js/player.js      — on-foot controller, interaction, dialog/log UI
js/audio.js       — procedural ambience, tones, footsteps
js/ending.js      — ending cinematic
js/suit.js        — astronaut model, torch, scanner, compass
js/ui.js          — boot sequence, location title cards, holo map, pause menu, typewriter
js/ship.js        — flyable spaceship
js/sky-locations.js — flight-only locations (Breakwater, Tether), ocean
js/render.js      — post-processing pipeline + main loop
```

## Phase 1 — Restructure  [x]
Mechanical split of the monolith into the files above, byte-identical behavior.
Verify with node --check per file + headless playthrough. Commit.

## Phase 2 — UI overhaul  [x]
- [x] Suit boot sequence after START (staggered HUD power-on, status line typewriter)
- [x] Location title cards — serif name + subtitle fade when first entering each zone, chime
- [x] Glyph-decode typewriter on fragment dialogs (scramble settles into text; E skips)
- [x] Holographic map overlay (M) — canvas-drawn, locations, player arrow, ship icon
- [x] Pause menu on ESC — RESUME / QUALITY HIGH-LOW / AUDIO ON-OFF / control reference
- [x] HUD frame corners + scanline overlay, reticle that blooms near interactables
- [x] Objective line that evolves (find memories → return to the chamber)

## Phase 3 — Flyable spaceship  [x]
- [x] Scout ship parked on a pad near the lander (hull, delta wings, canopy, twin engines,
      skids, glowing thrust cones, nav lights)
- [x] E near ship boards it; flight mode: W/S throttle, mouse pitch/yaw with banking,
      Shift boost, Space/C vertical thrusters, X brake, G autoland (low+slow), E exit when landed
- [x] Chase camera with smoothing + speed FOV, cockpit shake at boost
- [x] Engine audio (throttle-following hum), collision bounce off structures below 45m
- [x] Flight HUD: speed / altitude / throttle bar, landing hints; compass + map track ship
- [x] Flight ceiling 240m, world radius 800 (walking stays 460)

## Phase 4 — Flight-only content + realism  [x]
- [x] THE BREAKWATER (0, 520): synthetic ocean (shader water, shared uniforms), curved
      seawall, eroded guardian statues, fragment f15 "The Tide Clock"
- [x] THE TETHER (470, -540): severed orbital elevator stump, fallen cable arc, blinking
      beacons, fragment f16 "The Ladder They Climbed Down"
- [x] TOTAL becomes 16 (REQUIRED stays 10) — both reachable only by ship
- [x] Procedural building facade textures (lit window grids) on skyline + residential slab
- [x] Screen-space god rays from the sun (radial blur pass composited in final shader)

## Phase 5 — Regression  [x]
Headless e2e: on-foot playthrough, ship boarding, flight to Breakwater, landing,
fragment collection, ending. Screenshot review. README update. Push.

## Phase 6 — Engine modernization  [x]
- [x] three r128 -> r160 ES modules via import map (jsdelivr), defer-ordered bootstrap
- [x] EffectComposer: 4x MSAA HDR target, UnrealBloom, FX pass (god rays/CA/vignette/grain), ACES OutputPass, SMAA
- [x] Image-based lighting: PMREM environment generated from the game's own sky
- [x] Outer Wilds palette: warm sun against teal dusk, exposure rebalance
- [x] Photo mode (P) hides all HUD; FIELD OF VIEW setting in pause menu

## Future (not this session)
- Free-camera photo mode with roll + dolly
- Interior of the residential tower: elevator ride, 3 apartment floors
- Weather: drifting rain curtains with wet-ground reflection boost
- The instrument as a playable 5-note synth; secret chord opens a hidden room
- Save/continue via localStorage (needs non-artifact hosting)
- Gamepad support

## v1.1 Ideas
- Weather system (acid rain, dust storms)
- NPC ghost echoes
