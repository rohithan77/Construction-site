# Root & Rise — intro film

A 66-second cinematic 3D intro for Root & Rise Constructions, shot as a
floating architectural diorama in the site's palette (terracotta `#B5694A`,
sage `#9CA88A`, cream `#F7F4ED`) with Fraunces + Inter type.

**Output:** `public/video/root-and-rise-intro.mp4` (1920×1080, 24 fps, H.264 + AAC)

## Story — from root to rise

| Time | Chapter | What you see |
|---|---|---|
| 0–7 s | **01 · The Idea** | A single spark of light in the dark. It falls and touches the earth. |
| 7–14 s | **02 · The Land** | Dawn breaks over an empty plot. Survey lines, pegs and the footprint draw themselves. |
| 14–23 s | **03 · The Roots** | The earth turns to x-ray. Tree roots grow below ground, then piers, footings and the slab go in. |
| 23–33 s | **04 · The Rise** | The structure assembles as glowing blueprint edges that harden into concrete, storey by storey. |
| 33–43 s | **05 · The Light** | A top-down plan. The sun sweeps east → north → west and its shadows move across the floor. Callouts: north-facing living, the stair as a spine, windows for cross-breeze, roots that stay. |
| 43–52 s | **06 · The Life** | Walls, timber cladding and glass rise. The lawn, garden and trees grow over the roots, and the interiors warm up. |
| 52–59 s | **07 · The Sanctuary** | Dusk. A low hero shot of the finished home glowing from inside. |
| 59–66 s | **End card** | A root-and-house mark draws itself, followed by "Root & Rise / Constructions / From the root to the rise — built around you." |

The score in `soundtrack.py` is synthesised from scratch with no samples, so
it is royalty-free. It has warm pads that change chord with each chapter, a
felt-piano motif at each title, a soft impact when the idea lands, a pulse
under the build, and a swell into the logo.

## Re-rendering

```bash
cd video/intro
npm install                     # three.js (+ playwright)
python3 soundtrack.py           # → out/soundtrack.wav   (needs numpy + scipy)
node render.mjs --preview       # → out/stills/*.png     quick look at key moments
node render.mjs                 # → out/root-and-rise-intro.mp4
cp out/root-and-rise-intro.mp4 ../../public/video/
```

- Scrub any frame live by serving this folder and opening `index.html?t=36`,
  or play a low-fidelity real-time preview with `index.html?play`.
- Every frame is a pure function of time, so `render.mjs --from 30 --to 40`
  re-renders just one section.
- Copy and timing live at the top of `scene.js`: `CAPTIONS`, `CALLOUTS`,
  `CAM` (camera path) and `LOOK` (time-of-day lighting). The end-card wording
  is in `index.html`.
- Rendering runs in headless Chromium with SwiftShader and takes about an
  hour on 4 CPU cores. A machine with a GPU is much faster.
