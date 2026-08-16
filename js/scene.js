/**
 * scene.js — KashiScene
 * Three.js cinematic 3D heritage experience.
 * Responds to the custom 'hero:complete' event dispatched by main.js.
 *
 * Flow: loadTemple → animateTempleIn → addGoldenAura → loadArtifacts → orbit
 */

import * as THREE                from 'three';
import { GLTFLoader }            from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader }           from 'three/addons/loaders/DRACOLoader.js';
import { ArtifactManager }       from './artifacts.js';

// ─── Design constants (PRD §4) ─────────────────────────────────────────────
const GOLD  = 0xF4B942;
const AMBER = 0xE09A2D;

// ─── Artifact catalogue ────────────────────────────────────────────────────
const ARTIFACT_DEFS = [
  {
    id: 'bel-patta',
    name: 'Bel Patta',
    icon: '🍃',
    category: 'Spiritual Layer',
    path: 'assets/bel_patta.glb',
    story:
      'The sacred three-leafed bael (Aegle marmelos) is the most beloved ' +
      'offering to Lord Shiva. Kashi\'s faithful carry garlands of bel leaves ' +
      'to Kashi Vishwanath every dawn — a ritual unbroken since antiquity.',
    articles: [
      { title: 'Aegle Marmelos in Vedic Tradition', desc: 'How the bael tree became the preferred offering to Shiva — and why its three leaves represent the Trimurti.' },
      { title: 'Dawn Rituals at Vishwanath', desc: 'The pre-sunrise procession of devotees bearing bel garlands through Vishwanath Gali, unchanged for centuries.' },
      { title: 'Medicinal Heritage of Bael', desc: 'Ayurvedic uses documented in ancient Kashi texts — from digestive remedies to fever treatments still practised today.' },
    ],
  },
  {
    id: 'kamandal',
    name: 'Kamandal',
    icon: '🏺',
    category: 'IKS Knowledge',
    path: 'assets/kamandal.glb',
    rotationFix: { x: -Math.PI / 2, y: 0, z: 0 },
    story:
      'The sage\'s water vessel holds Ganga jal drawn from Manikarnika Ghat at ' +
      'first light — water said to carry twelve centuries of sankalpa within ' +
      'its silent, amber-lit current.',
    articles: [
      { title: 'Ganga Jal: Sacred Science', desc: 'Modern microbiology meets ancient knowledge — why Ganga water from Varanasi retains purity properties other river water does not.' },
      { title: 'The Kashi Kalpa', desc: 'The renunciate tradition of collecting Ganga water at Manikarnika and distributing it across the subcontinent.' },
      { title: 'Copper Vessels in Vedic Practice', desc: 'The metallurgical wisdom behind using copper kamandalas and the antimicrobial properties now confirmed by science.' },
    ],
  },
  {
    id: 'damroo',
    name: 'Damroo',
    icon: '🥁',
    category: 'Cultural Knowledge',
    path: 'assets/damroo.glb',
    story:
      'Shiva\'s hourglass drum whose first beat split cosmic silence into the ' +
      'fourteen foundational Sanskrit syllables — language itself born from rhythm, ' +
      'still reverberating through the lanes of Kashi.',
    articles: [
      { title: 'Maheshvara Sutras: Birth of Sanskrit', desc: 'The fourteen sounds produced by Shiva\'s damroo — how Panini extracted them to form the phonological basis of Sanskrit grammar.' },
      { title: 'Nada Brahma: Sound as Divinity', desc: 'The philosophy that the universe is fundamentally vibrational — explored in Kashi\'s classical music lineages.' },
      { title: 'The Benares Gharana', desc: 'How the tabla and pakhawaj traditions of Varanasi connect to the cosmic percussion of Shiva\'s dance in Kashi.' },
    ],
  },
  {
    id: 'diya',
    name: 'Ganga Diya',
    icon: '🪔',
    category: 'Cultural Knowledge',
    path: 'assets/diya.glb',
    story:
      'Each evening at Dashaswamedh Ghat, hundreds of earthen diyas float upon ' +
      'the Ganga in the grand Aarti — each flame a prayer carried by water, ' +
      'ascending toward the infinite through fire and current.',
    articles: [
      { title: 'Ganga Aarti: Living Liturgy', desc: 'The choreography of Dashaswamedh Aarti — seven priests, 21 lamps, and a ritual unchanged across living memory in Kashi.' },
      { title: 'Earthen Diyas and Folk Craft', desc: 'The Kumhar potters of Varanasi who produce thousands of clay diyas by hand each festival season — an unbroken craft tradition.' },
      { title: 'Fire as Cosmic Element in Kashi', desc: 'From the eternal flame at Manikarnika to the Aarti fires at the ghats — why Agni, fire, is uniquely central to Kashi\'s identity.' },
    ],
  },
];

// ─── KashiScene ────────────────────────────────────────────────────────────
class KashiScene {
  constructor() {
    this.canvas      = document.getElementById('three-canvas');
    this.section     = document.getElementById('scene-section');
    this.scene       = new THREE.Scene();
    this.renderer    = null;
    this.camera      = null;
    this.clock       = new THREE.Clock();
    this.gltfLoader  = null;

    // Temple state
    this.temple      = null;
    this._normScale  = 1.5;   // world units, set after load

    // Lighting
    this.auraLight   = null;

    // Interaction
    this.artifactMgr = null;
    this.raycaster   = new THREE.Raycaster();
    this.pointer     = new THREE.Vector2(-2, -2); // off-screen default

    // Drag-to-orbit camera state (mouse-driven; object itself never moves)
    this._orbit = {
      theta: 0, phi: 1.2, targetTheta: 0, targetPhi: 1.2,
      radius: 7, target: new THREE.Vector3(0, 0, 0),
    };
    this._dragging  = false;
    this._dragMoved = false;
    this._lastPtr   = { x: 0, y: 0 };

    this.isReady     = false;
    this.PRM         = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  init() {
    if (!this._webGLAvailable()) return;

    this._setupRenderer();
    this._setupCamera();
    this._setupLights();
    this._addSceneBackground();
    this._addStarfield();
    this._setupLoader();
    this._setupEvents();
    this._renderLoop();

    // Wait for main.js to signal that hero has faded out
    window.addEventListener('hero:complete', () => this._begin(), { once: true });
  }

  // ── Scene background — responsive: portrait 9:16 space backdrop on
  //    phones, widescreen 16:9 backdrop on everything else. ─────────────
  _addSceneBackground() {
    const isPhone = window.matchMedia('(max-width: 600px)').matches;
    const file = isPhone ? 'assets/BG_Space_916.png' : 'assets/BG_Space_169.png';
    const loader = new THREE.TextureLoader();
    loader.load(file, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      this.scene.background = texture;
    });
  }

  // ── Starfield + fog ──────────────────────────────────────────────────────
  _addStarfield() {
    // Warm amber haze — matches the BG.png sunrise backdrop instead of the
    // flat white it replaced, so distant geometry blends into the image.
    this.scene.fog = new THREE.FogExp2(0xE3A34E, 0.02);

    // ~800 amber/gold flecks distributed in a large sphere — recoloured
    // away from gold↔white toward gold↔deep-amber so they still read as
    // visible flecks against the new white background instead of vanishing.
    const count    = 800;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const goldVec   = new THREE.Color(0xC8973A);
    const amberVec  = new THREE.Color(0x8B5E1F);

    for (let i = 0; i < count; i++) {
      const r     = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Mix gold ↔ deep-amber randomly for visual richness
      const c = goldVec.clone().lerp(amberVec, Math.random() * 0.6);
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size:         0.06,
      vertexColors: true,
      transparent:  true,
      opacity:      0.55,
      sizeAttenuation: true,
      depthWrite:   false,
    });

    this.scene.add(new THREE.Points(geo, mat));
  }

  // ── WebGL check ──────────────────────────────────────────────────────────
  _webGLAvailable() {
    try {
      const c = document.createElement('canvas');
      return !!(
        c.getContext('webgl2') ||
        c.getContext('webgl') ||
        c.getContext('experimental-webgl')
      );
    } catch {
      this._showFallback();
      return false;
    }
  }

  _showFallback() {
    this.section.innerHTML = `
      <div class="webgl-fallback">
        <h3>🙏 Sacred Kashi Awaits</h3>
        <p>Enable WebGL in your browser to experience the interactive 3D heritage scene of the Vishwanath Temple Corridor.</p>
      </div>`;
    this.section.classList.add('active');
  }

  // ── Renderer ─────────────────────────────────────────────────────────────
  _setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:           this.canvas,
      antialias:        true,
      powerPreference:  'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    // Warm amber fallback (matches BG.png) shown only in the brief window
    // before the background texture finishes loading.
    this.renderer.setClearColor(0xE3A34E, 1);
  }

  // ── Camera ───────────────────────────────────────────────────────────────
  _setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.01,
      500,
    );
    // Pull back for good framing of the larger model
    this.camera.position.set(0, 1.4, 7);
    this.camera.lookAt(0, 0, 0);

    // Derive the initial orbit spherical coordinates from that starting
    // position so drag-to-orbit picks up exactly where the fixed camera
    // used to sit (see _setupOrbitControls / render loop).
    const p = this.camera.position;
    this._orbit.radius = p.length();
    this._orbit.theta  = Math.atan2(p.x, p.z);
    this._orbit.phi    = Math.acos(THREE.MathUtils.clamp(p.y / this._orbit.radius, -1, 1));
    this._orbit.targetTheta = this._orbit.theta;
    this._orbit.targetPhi   = this._orbit.phi;
  }

  // ── Lights ───────────────────────────────────────────────────────────────
  _setupLights() {
    // Soft neutral ambient — lets the model's own material colors read through
    // instead of being washed in a single warm tint
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    // Hemisphere light (cool sky / warm ground) adds gentle color variation
    // and depth without dominating the model with one hue
    const hemi = new THREE.HemisphereLight(0xf4f6fb, 0x3a2f1a, 0.5);
    this.scene.add(hemi);

    // Key directional — neutral daylight white, brighter for clearer definition
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 4, 3);
    this.scene.add(key);

    // Front light — positioned near the camera's line of sight so the face
    // of the model the viewer actually sees is well lit, not just its top/sides.
    // Boosted intensity + a soft second front source for fuller, flatter-shadow
    // frontal coverage of the temple face.
    const front = new THREE.DirectionalLight(0xffffff, 2.2);
    front.position.set(0, 1.6, 6);
    this.scene.add(front);

    const frontFill = new THREE.DirectionalLight(0xfff6e6, 1.1);
    frontFill.position.set(1.2, 1.0, 6.5);
    this.scene.add(frontFill);

    // Secondary fill directional (neutral, opposite side) — softens shadows
    // and adds coverage the original single-key setup was missing
    const fillSide = new THREE.DirectionalLight(0xeef2ff, 0.65);
    fillSide.position.set(-2, 2, 4);
    this.scene.add(fillSide);

    // Rim / backlight — kept as a subtle amber accent, dialed back so it
    // no longer overpowers the model's true colors
    const rim = new THREE.DirectionalLight(AMBER, 0.45);
    rim.position.set(-3, 1, -2);
    this.scene.add(rim);

    // Fill from below — neutral bounce (previously gold-tinted)
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(0, -2, 2);
    this.scene.add(fill);

    // Golden point light for aura effect (off until temple lands) —
    // kept as an intentional accent moment, not baseline lighting
    this.auraLight = new THREE.PointLight(GOLD, 0, 12);
    this.scene.add(this.auraLight);
  }

  // ── GLTF + Draco loader ──────────────────────────────────────────────────
  _setupLoader() {
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    draco.preload();

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(draco);
  }

  // ── Events ───────────────────────────────────────────────────────────────
  _setupEvents() {
    const updatePointer = (x, y) => {
      this.pointer.x =  (x / window.innerWidth)  * 2 - 1;
      this.pointer.y = -(y / window.innerHeight) * 2 + 1;
    };

    this.canvas.addEventListener('mousemove', e => updatePointer(e.clientX, e.clientY));

    this.canvas.addEventListener('click', e => {
      // A drag that just ended shouldn't also register as an artifact click.
      if (this._dragMoved) { this._dragMoved = false; return; }
      updatePointer(e.clientX, e.clientY);
      if (this.isReady) this._handleClick();
    });

    this.canvas.addEventListener('touchend', e => {
      const t = e.changedTouches[0];
      updatePointer(t.clientX, t.clientY);
      if (this.isReady) this._handleClick();
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    document.getElementById('panel-close')
      .addEventListener('click', () => this._closeModal());

    // Keyboard close for accessibility
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this._closeModal();
    });

    this._setupOrbitControls();
  }

  // ── Drag-to-orbit camera (mouse only) ───────────────────────────────────
  // The temple never moves — only the camera swings around it on a sphere,
  // so users can drag to rotate the model, including down to a top view,
  // while its place in the scene stays fixed.
  _setupOrbitControls() {
    const ORBIT_SPEED = 0.006;
    // How close to straight up/down the camera may swing.
    const PHI_MIN = 0.08;                 // near top-down view
    const PHI_MAX = Math.PI - 0.35;       // stop just short of straight underneath

    this.canvas.addEventListener('mousedown', e => {
      this._dragging  = true;
      this._dragMoved = false;
      this._lastPtr.x = e.clientX;
      this._lastPtr.y = e.clientY;
    });

    window.addEventListener('mousemove', e => {
      if (!this._dragging) return;
      const dx = e.clientX - this._lastPtr.x;
      const dy = e.clientY - this._lastPtr.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this._dragMoved = true;
      this._lastPtr.x = e.clientX;
      this._lastPtr.y = e.clientY;

      this._orbit.targetTheta -= dx * ORBIT_SPEED;
      this._orbit.targetPhi   -= dy * ORBIT_SPEED;
      this._orbit.targetPhi   = THREE.MathUtils.clamp(this._orbit.targetPhi, PHI_MIN, PHI_MAX);
    });

    window.addEventListener('mouseup', () => { this._dragging = false; });
    window.addEventListener('mouseleave', () => { this._dragging = false; });

    this.canvas.style.cursor = 'grab';
    this.canvas.addEventListener('mousedown', () => { this.canvas.style.cursor = 'grabbing'; });
    window.addEventListener('mouseup', () => { this.canvas.style.cursor = 'grab'; });
  }

  // Recompute camera position from spherical coords each frame, with a
  // light damping ease toward the drag target for a smooth feel.
  _updateOrbitCamera() {
    const o = this._orbit;
    o.theta += (o.targetTheta - o.theta) * 0.12;
    o.phi   += (o.targetPhi   - o.phi)   * 0.12;

    this.camera.position.set(
      o.target.x + o.radius * Math.sin(o.phi) * Math.sin(o.theta),
      o.target.y + o.radius * Math.cos(o.phi),
      o.target.z + o.radius * Math.sin(o.phi) * Math.cos(o.theta),
    );
    this.camera.lookAt(o.target);
  }

  // ── Cinematic entrance sequence ──────────────────────────────────────────
  async _begin() {
    this._hint('Loading sacred space…');

    try {
      await this._loadTemple();
      this._addTempleGlow();
    } catch (err) {
      console.warn('[KashiScene] Temple model failed to load:', err);
      this._hint('Press any artifact to explore');
    }

    await this._animateTempleIn();
    this._addGoldenAura();
    await this._sleep(700);

    // Load + spawn artifacts
    this._hint('Summoning sacred objects…');
    this.artifactMgr = new ArtifactManager(
      this.scene, this.gltfLoader, ARTIFACT_DEFS, this.camera,
    );
    await this.artifactMgr.loadAll();

    // Artifacts orbit close enough to fill the scene around the temple
    const orbitRadius = this._normScale * 1.4;
    await this.artifactMgr.spawnAll(orbitRadius);
    this.artifactMgr.startOrbiting(orbitRadius);
    this._setupCarouselArrows();

    this.isReady = true;
    this._hint('Tap ← → to explore · touch the glowing object to learn more');
    setTimeout(() => this._hint(''), 5500);
  }

  // ── Carousel arrow buttons ────────────────────────────────────────────────
  _setupCarouselArrows() {
    const prev = document.getElementById('carousel-prev');
    const next = document.getElementById('carousel-next');
    if (!prev || !next) return;

    // Fade the arrows in, then pulse them to draw attention
    window.gsap.to([prev, next], {
      opacity: 1,
      duration: 0.7,
      ease:     'power2.out',
      stagger:  0.1,
      onComplete: () => {
        prev.classList.add('pulsed');
        next.classList.add('pulsed');
      },
    });

    prev.addEventListener('click', () => {
      if (this.artifactMgr) this.artifactMgr.rotateCarousel('left');
    });
    next.addEventListener('click', () => {
      if (this.artifactMgr) this.artifactMgr.rotateCarousel('right');
    });

    // Touch swipe on the canvas as shortcut
    let _swipeX = 0;
    this.canvas.addEventListener('touchstart', e => {
      _swipeX = e.changedTouches[0].clientX;
    }, { passive: true });
    this.canvas.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - _swipeX;
      if (Math.abs(dx) > 50 && this.artifactMgr) {
        this.artifactMgr.rotateCarousel(dx < 0 ? 'right' : 'left');
      }
    }, { passive: true });
  }

  // ── Load temple GLB ──────────────────────────────────────────────────────
  _loadTemple() {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        'assets/kashi.glb',
        gltf => {
          this.temple = gltf.scene;

          // Normalise: fit inside a sphere of radius 2.2 world units (larger fill)
          const box  = new THREE.Box3().setFromObject(this.temple);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim       = Math.max(size.x, size.y, size.z);
          this._normScale    = 2.2 / (maxDim * 0.5);

          // Start at 60% of final scale (PRD §3.2)
          this.temple.scale.setScalar(this._normScale * 0.6);

          // Centre the model at origin
          const centre = new THREE.Vector3();
          new THREE.Box3().setFromObject(this.temple).getCenter(centre);
          this.temple.position.sub(centre);
          this.temple.position.y -= 0.25; // slight downward offset for framing

          // Subtle material polish
          this.temple.traverse(child => {
            if (!child.isMesh || !child.material) return;
            const m = child.material;
            if (m.roughness !== undefined) m.roughness = Math.min(m.roughness, 0.75);
            if (m.metalness !== undefined) m.metalness = Math.max(m.metalness, 0.08);
          });

          this.scene.add(this.temple);
          resolve();
        },
        undefined,
        reject,
      );
    });
  }

  // ── Glowy outline (rim-glow silhouette) ──────────────────────────────────
  // Reusable on any loaded object: clones the whole hierarchy (transforms
  // preserved), swaps every mesh's material for a back-face additive glow
  // material, then puffs it out slightly — the original mesh occludes the
  // front faces, leaving only a glowing rim. Parented under `object` so the
  // glow inherits its transform/animation automatically.
  _addGlowOutline(object, opts = {}) {
    if (!object) return null;

    const glowMat = new THREE.MeshBasicMaterial({
      color:       opts.color   ?? GOLD,
      side:        THREE.BackSide,
      transparent: true,
      opacity:     opts.opacity ?? 0.5,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });

    const glow = object.clone(true);
    glow.traverse(child => {
      if (child.isMesh) child.material = glowMat;
    });
    glow.position.set(0, 0, 0);
    glow.rotation.set(0, 0, 0);
    glow.scale.setScalar(opts.scale ?? 1.035);

    object.add(glow);
    return glow;
  }

  _addTempleGlow() {
    if (!this.temple) return;
    this._templeGlow = this._addGlowOutline(this.temple, { color: GOLD, opacity: 0.5, scale: 1.035 });
  }

  // ── Temple entrance animation ────────────────────────────────────────────
  _animateTempleIn() {
    if (!this.temple) return Promise.resolve();

    const target = this._normScale;

    if (this.PRM) {
      this.temple.scale.setScalar(target);
      return Promise.resolve();
    }

    return new Promise(resolve => {
      // Scale 0.6→1.0 and Y-rotate 0→270° so the lower/ghat side faces front
      window.gsap.timeline({
        onComplete: () => resolve(),   // no drift flag — temple stays put
      })
        .to(this.temple.scale, {
          x: target, y: target, z: target,
          duration: 1.4,
          ease: 'power2.out',
        }, 0)
        .to(this.temple.rotation, {
          y: Math.PI * 2.5, // 450° total (270° + 180° flip) — lower/ghat face front
          duration: 1.8,
          ease: 'power3.inOut',
        }, 0);
    });
  }

  // ── Golden aura (PRD §3.3) ───────────────────────────────────────────────
  // Inner revolving halo — a ring of small bel patra (bael leaf) clusters
  // orbiting the temple, replacing the earlier plain gold spheres. This is
  // the only revolving particle layer left around the model; the outer
  // water-sphere shell (and its chime sound) has been removed entirely.
  _addGoldenAura() {
    const gsap = window.gsap;

    // 1. Pulsing golden PointLight
    gsap.to(this.auraLight, { intensity: 2.5, duration: 0.5, ease: 'power2.out' });
    if (!this.PRM) {
      gsap.to(this.auraLight, {
        intensity: 4.0,
        duration:  2.2,
        ease:      'sine.inOut',
        yoyo:      true,
        repeat:    -1,
        delay:     0.5,
      });
    }

    // 2. Equatorial halo — ring of small bel patra leaf clusters
    const count = 90;
    const r     = this._normScale * 1.18;
    const baseY = this.temple ? this.temple.position.y : 0;

    const leafMat = new THREE.MeshStandardMaterial({
      color:             GOLD,
      emissive:          new THREE.Color(GOLD),
      emissiveIntensity: 0.55,
      metalness:         0.85,
      roughness:         0.28,
      transparent:       true,
      opacity:           0,
      depthWrite:        false,
      side:              THREE.DoubleSide,
    });

    const ring = new THREE.Group();
    this._auraRing = ring;
    this.scene.add(this._auraRing);

    this.gltfLoader.load(
      'assets/bel_patta.glb',
      gltf => {
        const template = gltf.scene;
        template.traverse(child => {
          if (child.isMesh) child.material = leafMat;
        });

        // Normalise a single leaf cluster to a small, consistent size.
        const box  = new THREE.Box3().setFromObject(template);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim    = Math.max(size.x, size.y, size.z) || 1;
        const leafScale = 0.16 / maxDim;

        for (let i = 0; i < count; i++) {
          const theta = (i / count) * Math.PI * 2;
          const leaf  = template.clone(true);
          leaf.position.set(
            r * Math.cos(theta),
            baseY + (Math.random() - 0.5) * 0.20,
            r * Math.sin(theta),
          );
          leaf.rotation.set(
            Math.random() * Math.PI,
            theta + Math.PI / 2,
            Math.random() * 0.4 - 0.2,
          );
          leaf.scale.setScalar(leafScale * (0.85 + Math.random() * 0.3));
          ring.add(leaf);
        }

        // Fade halo in
        gsap.to(leafMat, { opacity: 0.92, duration: 0.9, ease: 'power2.out', delay: 0.2 });

        // Gentle pulse on halo opacity too
        if (!this.PRM) {
          gsap.to(leafMat, {
            opacity:  0.55,
            duration: 2.5,
            ease:     'sine.inOut',
            yoyo:     true,
            repeat:   -1,
            delay:    1.2,
          });
        }
      },
      undefined,
      err => console.warn('[KashiScene] bel_patta aura ring failed to load:', err),
    );
  }

  // ── Click handler ────────────────────────────────────────────────────────
  // Clicking ANY artifact — front or not — brings it to front (rotating the
  // carousel there first if needed) and then opens it exactly as a
  // front-item click always has.
  _handleClick() {
    if (!this.artifactMgr) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.artifactMgr.getClickedItem(this.raycaster);
    if (!hit) return;

    const openHitItem = () => {
      // Radial pulse from artifact position (PRD §3.6 C)
      this.artifactMgr.spawnPulse(
        hit.group.position.clone(),
        this.scene,
        this.camera,
      );
      this._openModal(hit.data, hit);
    };

    if (this.artifactMgr.isFrontItem(hit)) {
      openHitItem();
      return;
    }

    // Not front yet — rotate the carousel straight to it, then open.
    this.isReady = false; // pause hover/click handling during the spin
    this.artifactMgr.rotateToItem(hit).then(() => {
      this.isReady = true;
      openHitItem();
    });
  }

  // ── Focused state: open (PRD §9–15) ──────────────────────────────────────────────────
  _openModal(data, hitItem) {
    if (this._focused) return;
    this._focused = hitItem;
    this.isReady  = false; // pause hover detection during focus

    const gsap = window.gsap;

    // ─ 1. Populate content panel ───────────────────────────────────────────────
    document.getElementById('panel-icon').textContent     = data.icon;
    document.getElementById('panel-title').textContent    = data.name;
    document.getElementById('panel-category').textContent = data.category || 'Sacred Object';
    document.getElementById('panel-story').textContent    = data.story;
    document.getElementById('object-label').textContent   = data.name;

    // Build article cards
    const articlesEl = document.getElementById('panel-articles');
    articlesEl.innerHTML = (data.articles || []).map(a => `
      <article class="article-card">
        <h3 class="article-title">${a.title}</h3>
        <p  class="article-desc">${a.desc}</p>
      </article>
    `).join('');

    // ─ 2. Show panels ─────────────────────────────────────────────────────
    const contentPanel = document.getElementById('content-panel');
    const objectPanel  = document.getElementById('object-panel');
    contentPanel.classList.add('open');
    objectPanel.classList.add('open');

    // ─ 3. Hide carousel arrows while focused ───────────────────────────────
    gsap.to(['#carousel-prev', '#carousel-next'], { opacity: 0, duration: 0.25 });

    // ─ 4. Dim other artifacts + temple (PRD §11) ───────────────────────────
    this.artifactMgr.items.forEach(item => {
      if (item !== hitItem) {
        gsap.to(item.group, { opacity: 0, duration: 0.5 });
        // Three.js doesn’t have group.opacity — traverse children
        item.group.traverse(c => {
          if (c.isMesh && c.material) {
            gsap.to(c.material, { opacity: 0.18, transparent: true, duration: 0.5 });
          }
        });
      }
    });
    if (this.temple) {
      this.temple.traverse(c => {
        if (c.isMesh && c.material) {
          gsap.to(c.material, { opacity: 0.30, transparent: true, duration: 0.5 });
        }
      });
    }

    // ─ 5. Float selected artifact toward camera & right (PRD §10) ───────────
    this._focusedOrigPos = hitItem.group.position.clone();
    this._focusedOrigScale = hitItem.group.scale.clone();

    // Target: right side of scene, pulled toward camera
    gsap.to(hitItem.group.position, {
      x:        2.2,
      y:        0.2,
      z:        3.0,          // much closer to camera
      duration: 0.85,
      ease:     'power2.inOut',
    });
    gsap.to(hitItem.group.scale, {
      x: this._normScale * 0.9,
      y: this._normScale * 0.9,
      z: this._normScale * 0.9,
      duration: 0.85,
      ease:     'power2.inOut',
    });
  }

  // ── Focused state: close (PRD §15) ──────────────────────────────────────────────────
  _closeModal() {
    if (!this._focused) return;
    const gsap      = window.gsap;
    const hitItem   = this._focused;
    this._focused   = null;

    // Hide panels
    document.getElementById('content-panel').classList.remove('open');
    document.getElementById('object-panel').classList.remove('open');

    // Restore carousel arrows
    gsap.to(['#carousel-prev', '#carousel-next'], { opacity: 1, duration: 0.4, delay: 0.5 });

    // Restore artifact position + scale
    if (this._focusedOrigPos) {
      gsap.to(hitItem.group.position, {
        x: this._focusedOrigPos.x,
        y: this._focusedOrigPos.y,
        z: this._focusedOrigPos.z,
        duration: 0.75,
        ease:     'power2.inOut',
      });
    }
    // Restore scale back to front-highlight size (1.22)
    gsap.to(hitItem.group.scale, {
      x: 1.22, y: 1.22, z: 1.22,
      duration: 0.75,
      ease:     'power2.inOut',
    });

    // Restore opacity of all artifacts + temple
    this.artifactMgr.items.forEach(item => {
      item.group.traverse(c => {
        if (c.isMesh && c.material) {
          gsap.to(c.material, { opacity: 1, duration: 0.55 });
        }
      });
    });
    if (this.temple) {
      this.temple.traverse(c => {
        if (c.isMesh && c.material) {
          gsap.to(c.material, { opacity: 1, duration: 0.55 });
        }
      });
    }

    // Resume interactivity
    setTimeout(() => { this.isReady = true; }, 800);
  }

  // ── Render loop ──────────────────────────────────────────────────────────
  _renderLoop() {
    const tick = () => {
      requestAnimationFrame(tick);
      const delta   = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Slowly rotate the aura particle ring — clockwise (as viewed from
      // the camera / from above), reversed from its original anti-clockwise spin.
      if (this._auraRing && !this.PRM) {
        this._auraRing.rotation.y -= 0.0015;
      }

      // Note: temple no longer drifts — it stays at its entrance-spin endpoint

      // Camera orbit — recompute every frame so the drag ease stays smooth
      // even when the pointer isn't moving.
      this._updateOrbitCamera();

      if (this.isReady && this.artifactMgr) {
        this.artifactMgr.update(delta, elapsed);

        // Hover detection (desktop)
        this.raycaster.setFromCamera(this.pointer, this.camera);
        this.artifactMgr.updateHover(this.raycaster);
      }

      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  _hint(text) {
    const el = document.getElementById('scene-hint');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('visible', text.length > 0);
  }
}

// ─── Boot ──────────────────────────────────────────────────────────────────
new KashiScene().init();
