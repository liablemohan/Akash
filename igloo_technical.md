# 🧊 igloo.inc — Hero 3D Element: Deep Technical Analysis

> **Source**: `https://www.igloo.inc` — analyzed via JS bundle inspection (`index-2eb69c09.js` + `App3D-f554a111.js`, ~1.4MB minified)

---

## 1. Technology Stack Overview

| Layer | Technology | Evidence |
|---|---|---|
| **Framework** | **Svelte** (compiled) | `SvelteComponent`, `$$.ctx`, `$$.fragment`, Svelte lifecycle internals in bundle |
| **Build Tool** | **Vite** | `modulepreload` polyfill, `vite:preloadError` event, hashed chunk filenames |
| **3D Engine** | **Three.js** | 213× `THREE`, `WebGLRenderer`, `Scene`, `PerspectiveCamera`, `BufferGeometry`, `ShaderMaterial` |
| **Animation** | **GSAP** | 51× `gsap`, `ScrollTrigger`, `TweenMax`, `TweenLite`, `TimelineMax` |
| **Post FX** | **pmndrs/postprocessing** | `EffectComposer`, `BloomEffect`, `ChromaticAberration`, `DepthOfField`, `BlurPass` |
| **3D Assets** | **GLTF + Draco** | `GLTFLoader` (27×), `DRACOLoader` (20×), `draco_wasm` decoder in worker |
| **Textures** | **KTX2 / Basis Universal** | `KTX2Loader` (18×), `basis_transcoder` (5×), all textures `.ktx2` format |
| **Concurrency** | **Web Workers + SharedArrayBuffer** | `Worker` (41×), `SharedArrayBuffer` (10×), `OffscreenCanvas` (3×) |

---

## 2. Loading Sequence — From First Byte to Full Interactivity

### Phase 1 — Preloader (CSS-only, instant)
The very first thing rendered is a **Svelte-managed fullscreen overlay** (`div#loader`) — it contains a single `.ascii` pseudo-element that runs a pure-CSS `@keyframes` animation cycling through characters like `---===+++` at 5-second infinite loop:

```css
@keyframes head {
  0%  { content: '---===+++=' }
  1%  { content: '----===+++' }
  /* ... 100 keyframes total */
}
```

- Background color matches the page's CSS variable `--bgColor: #A0A5B1`
- No JS needed — visible immediately while JS parses
- `pointer-events: none` so it never blocks interaction
- `will-change: opacity` pre-composites the layer

### Phase 2 — Async 3D Module Load
The main `index.js` uses a **dynamic `import()`** to lazy-load `App3D-f554a111.js`:

```js
const o = (await import("./App3D-f554a111.js")).default;
const i = await new o({ target: n, ... }).ready;
```

- `App3D` is a Svelte component whose `ready` property is a **Promise** that resolves when the 3D scene is fully initialized
- Blocks the preloader until that Promise resolves

### Phase 3 — Asset Pipeline (Workers)
While the main thread waits on `.ready`, the 3D system in the worker thread:
1. **Draco WASM decoder** decompresses GLTF geometry (off main thread)
2. **KTX2 / Basis transcoder** (WASM) transcodes textures to GPU-native format (BC7/ASTC/ETC2 depending on device)
3. Results sent back via **SharedArrayBuffer** zero-copy transfer
4. Uploaded to GPU via `KTX2Loader`

### Phase 4 — Preloader Fade Out
Once `.ready` resolves, Svelte triggers a two-stage opacity fade:
- `.ascii` element fades out: `duration: 250ms`, cubic easing
- `#loader` overlay fades out: `duration: 750ms`, cubic easing `(.5 * Math.pow(2t-2, 3) + 1)`
- On `outroend` event, `e.$destroy()` removes it from DOM entirely

---

## 3. Scene Architecture — Two Distinct 3D Worlds

### Scene A: `igloo/` — The Hero Scene
The primary landing hero. Assets detected:

| Texture File | Role |
|---|---|
| `igloo/igloo_scene.ktx2` | Baked lightmap / scene atlas for the whole igloo environment |
| `igloo/igloo_color.ktx2` | Igloo structure albedo/color map |
| `igloo/igloo_exploded_color.ktx2` | **Exploded-state** color map (separate UV islands for explode animation) |
| `igloo/ground_color.ktx2` | Snow/ground terrain color |
| `igloo/ground_glow.ktx2` | Emissive glow map on the ground (rim/halo effect) |
| `igloo/ground_sansigloo_color.ktx2` | Ground without igloo — used during explode transition |
| `igloo/mountain_color.ktx2` | Background mountain terrain |
| `igloo/numbers.ktx2` | Numeric texture (possibly data labels or UI overlay in 3D) |
| `igloo/triangles_tiling.ktx2` | Tiling surface detail / noise pattern |
| `cubes_env.exr` | EXR environment map for IBL (Image-Based Lighting) reflections |

### Scene B: `cubes/` — Secondary Scroll Section
| Texture File | Role |
|---|---|
| `cubes/cube_scene.ktx2` | Baked lightmap for cube environment |
| `cubes/blurrytext_atlas.ktx2` | Blurred text texture atlas (likely text floating on cube faces) |
| `cubes/dot_pattern.ktx2` | Dot/grid surface pattern on cubes |

### Shared Procedural Textures
| File | Purpose |
|---|---|
| `caustics.ktx2` | Animated caustic light patterns (water/ice refraction sim) |
| `clouds_noise.ktx2` | Cloud/fog volumetric noise |
| `frost-datatexture.ktx2` | Frost/ice surface shader data |
| `perlin-datatexture.ktx2` | Perlin noise for procedural displacement |
| `noises/blue-8-128-rgb.ktx2` | Blue noise for dithering / temporal AA |
| `bokeh.ktx2` | Bokeh kernel for Depth of Field effect |
| `mosaic.ktx2` | Mosaic/pixelation effect texture |
| `IBMPlexMono-Medium-datatexture.ktx2` | Font baked as a data texture (SDF or bitmap font for 3D text) |

---

## 4. Rendering Pipeline

### WebGLRenderer Configuration
- `antialias: true`
- `shadowMap` enabled (109 references) — real-time shadows cast on snow/ground
- `toneMapping: ACESFilmicToneMapping` — cinematic tone curve
- `logarithmicDepthBuffer` enabled (10×) — prevents Z-fighting on thin ice geometry
- **IBL**: `envMap` (95×) + `envMapIntensity` (14×) — full PBR reflections from EXR cubemap
- `physicallyCorrectLights` mode implied by IBL usage

### Post-Processing Stack (pmndrs/postprocessing)
```
RenderPass (main scene)
  ↓
BlurPass ×19 (multi-pass separable blur — used for DoF + Bloom)
  ↓
BloomEffect (selective glow on emissive ground, igloo rim)
  ↓
DepthOfField (bokeh.ktx2 kernel, shallow focus)
  ↓
ChromaticAberration ×5 (RGB channel split at edges — "lens" feel)
  ↓
Output (canvas)
```

### Custom GLSL Shaders
The bundle contains **massive inline GLSL** (hand-written custom shaders):

| Signal | Count | What it means |
|---|---|---|
| `uniform` | 1448 | Hundreds of GPU-side uniforms — time, mouse, scroll, material params |
| `vUv` | 690 | UV coordinates passed from vertex → fragment shaders |
| `void main` | 243 | ~120+ unique shader programs (vertex + fragment pairs) |
| `gl_FragColor` | 140 | Custom fragment outputs (not relying on Three.js standard materials) |
| `gl_Position` | 112 | Custom vertex displacement shaders |
| `uMouse` | 7 | Mouse position passed as GPU uniform — drives ripple/distortion effects |
| `fragCoord` | 9 | Screen-space effects (chromatic aberration, vignette) |

---

## 5. Animation System

### GSAP Orchestration
GSAP orchestrates **all timed transitions** — it drives Three.js object properties (position, rotation, material uniforms, morphTargetInfluences) through its tweening engine:

```
GSAP Timeline
├── Intro: camera fly-in + igloo fade-in (gsap.from / gsap.to)
├── Idle: gentle rotation / breathing (gsap.to, repeat:-1, yoyo:true)
├── ScrollTrigger: scrub-linked animations as user scrolls
└── Hover: pointer-driven tilt (raycaster → gsap.to on rotation)
```

### Animation States Detected

| State | Count | Description |
|---|---|---|
| `intro` | 88 | Entry camera animation + asset reveal after preloader |
| `enter` | 165 | Per-section enter triggers (scroll-based) |
| `morph` | 260 | **Morph target blending** — geometry morphs between shapes |
| `hover` | 46 | Mouse-over interactive tilt/response |
| `idle` | 16 | Looping breathing animation when no interaction |
| `leave` | 38 | Exit transitions when scrolling past sections |
| `exploded` | 4 | Igloo "explode" state — pieces separate outward |

### Morph Target Animation (Key Technique)
`morph` has the highest frequency (260 hits). The igloo mesh has **morph targets baked into the GLTF** — separate vertex positions for each state (assembled → exploded). GSAP tweens `morphTargetInfluences[0..n]` from 0→1 on scroll, creating the seamless "explosion" of the igloo into floating pieces. This is why there are two color maps: `igloo_color.ktx2` (assembled) and `igloo_exploded_color.ktx2` (exploded).

### Mouse Interaction (Raycaster)
```
pointermove event
  → Raycaster.setFromCamera(mouse, camera)
  → raycast() against scene objects
  → onMouseMove handler fires
  → uMouse uniform updated on GPU
  → gsap.to(igloo.rotation, { x, y }) — smooth tilt follows cursor
```

---

## 6. Performance Architecture

| Technique | Purpose |
|---|---|
| **KTX2 textures** | GPU-native compressed format — zero CPU decode, direct GPU upload (BC7 on desktop, ASTC on mobile, ETC2 fallback) |
| **Draco GLTF compression** | 5–10× smaller geometry files; decompressed via WASM worker off main thread |
| **Web Workers (41)** | All heavy asset processing (KTX2 transcoding, Draco decompression) runs off main thread |
| **SharedArrayBuffer (10)** | Zero-copy buffer transfer between worker and main thread |
| **OffscreenCanvas (3)** | WebGL rendering context transferred to worker — GPU draw calls possible off main thread |
| **Basis Universal WASM** | Single transcoder handles all texture format targets per device |
| **Dynamic import()** | `App3D` chunk only loaded after preloader is shown — first paint is instant |
| **logarithmicDepthBuffer** | Prevents Z-fighting at no performance cost on modern GPUs |

---

## 7. DOM & Layer Structure

The page is a **fully client-side SPA** — `<body>` is empty on server; everything is JS-rendered:

```html
<body>
  <div id="app">                          <!-- Svelte mount target -->
    <div id="loader">                     <!-- Phase 1: ASCII preloader (Svelte) -->
      <div class="ascii"></div>           <!-- CSS ::before animates content: -->
      <style>/* injected keyframes */</style>
    </div>
    <canvas>                              <!-- Phase 2+: WebGL surface (Three.js) -->
      <!-- WebGL context — no DOM children -->
    </canvas>
    <!-- Svelte HTML overlay components for text/UI (above canvas, z-indexed) -->
  </div>
</body>
```

**Z-index layering:**
1. `canvas` (z: 0) — WebGL 3D render
2. Svelte HTML overlays (z: 1+) — text labels, navigation, UI
3. `#loader` (z: top, `position: absolute`) — covers everything during load, then destroyed

---

## 8. Summary — How the Full Effect Is Achieved

```
┌─────────────────────────────────────────────────────────────────┐
│  LOADING                                                        │
│  CSS @keyframes ASCII spinner → no JS blocking                  │
│  Draco WASM + KTX2 WASM decode in Web Worker                   │
│  SharedArrayBuffer zero-copy → GPU upload                       │
├─────────────────────────────────────────────────────────────────┤
│  INTRO ANIMATION                                                │
│  GSAP timeline: camera fly-in + igloo materializes             │
│  Preloader fades (750ms cubic ease) + is destroyed             │
├─────────────────────────────────────────────────────────────────┤
│  IDLE STATE                                                     │
│  GSAP looping: gentle yoyo rotation (breathes)                 │
│  Caustics shader: animated UV-shifted light patterns on ground  │
│  Clouds noise shader: subtle atmospheric fog                    │
│  Ground glow emissive map: pulsing rim halo                    │
├─────────────────────────────────────────────────────────────────┤
│  MOUSE INTERACTION                                              │
│  Raycaster: detects hover on igloo mesh                        │
│  uMouse uniform → GPU ripple/frost distortion shader           │
│  GSAP: smooth rotation.x/y tilt follows cursor                 │
├─────────────────────────────────────────────────────────────────┤
│  SCROLL                                                        │
│  GSAP ScrollTrigger: scrub-linked progress 0→1                 │
│  morphTargetInfluences tweened: igloo assembles / explodes      │
│  Camera position animated along scroll                         │
│  Enter/Leave states: per-section reveal/exit animations        │
├─────────────────────────────────────────────────────────────────┤
│  RENDERING (every frame ~16ms)                                  │
│  Three.js WebGLRenderer → custom GLSL shaders                  │
│  Post: Bloom → DepthOfField → ChromaticAberration              │
│  ACESFilmic tone mapping + IBL PBR reflections (EXR envmap)    │
│  Real-time shadows (shadowMap)                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

> **In one sentence**: igloo.inc renders a **fully custom Three.js WebGL scene** (Svelte-driven, Vite-built), using **Draco-compressed GLTF models + KTX2 GPU textures** decoded in **Web Workers**, animated via **GSAP timelines + morph targets** for scroll-driven explode effects, **raycaster mouse interaction**, and a cinematic post-processing pipeline of **Bloom + DoF + Chromatic Aberration** — all behind a pure-CSS ASCII preloader.
