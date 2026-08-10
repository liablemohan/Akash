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
    id: 'trishool',
    name: 'Trishool',
    icon: '🔱',
    category: 'Heritage',
    path: 'assets/trishool.glb',
    rotationFix: { x: -Math.PI / 2, y: 0, z: 0 },
    story:
      'The divine trident embodies the Trimurti — creation, preservation, and ' +
      'dissolution. Planted in the sacred soil of Kashi, it marks the cosmic axis ' +
      'where all three states of time converge into the eternal present.',
    articles: [
      { title: 'Kashi as the Axis Mundi', desc: 'Why the ancient texts call Varanasi the navel of the universe — and how the trishool planted by Shiva anchors that cosmological claim.' },
      { title: 'The Trimurti in Stone', desc: 'Sculptural evolution of the trishool from Indus Valley seals to the monumental iconography of the Vishwanath Corridor.' },
      { title: 'Shakti Peethas of Kashi', desc: 'The 64 sacred spots of the city and how each relates to one of the three prongs: creative force, sustaining force, dissolving force.' },
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

    this.isReady     = false;
    this.PRM         = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  init() {
    if (!this._webGLAvailable()) return;

    this._setupRenderer();
    this._setupCamera();
    this._setupLights();
    this._addStarfield();
    this._setupLoader();
    this._setupEvents();
    this._renderLoop();

    // Wait for main.js to signal that hero has faded out
    window.addEventListener('hero:complete', () => this._begin(), { once: true });
  }

  // ── Starfield + fog ──────────────────────────────────────────────────────
  _addStarfield() {
    // Subtle exponential fog: deepens sense of sacred space
    this.scene.fog = new THREE.FogExp2(0x070E10, 0.035);

    // ~800 gold-tinted stars distributed in a large sphere
    const count    = 800;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const goldVec   = new THREE.Color(0xF4B942);
    const whiteVec  = new THREE.Color(0xfff8e0);

    for (let i = 0; i < count; i++) {
      const r     = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Mix gold ↔ white randomly for visual richness
      const c = goldVec.clone().lerp(whiteVec, Math.random() * 0.6);
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
      opacity:      0.7,
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
    this.renderer.setClearColor(0x070E10, 1);
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
  }

  // ── Lights ───────────────────────────────────────────────────────────────
  _setupLights() {
    // Warm ambient fill
    this.scene.add(new THREE.AmbientLight(GOLD, 0.55));

    // Key directional (warm white)
    const key = new THREE.DirectionalLight(0xfff8e8, 1.4);
    key.position.set(2, 4, 3);
    this.scene.add(key);

    // Rim / backlight (amber from behind-left)
    const rim = new THREE.DirectionalLight(AMBER, 0.8);
    rim.position.set(-3, 1, -2);
    this.scene.add(rim);

    // Fill from below (bounce light warmth)
    const fill = new THREE.DirectionalLight(0xF4B942, 0.3);
    fill.position.set(0, -2, 2);
    this.scene.add(fill);

    // Golden point light for aura effect (off until temple lands)
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
  }

  // ── Cinematic entrance sequence ──────────────────────────────────────────
  async _begin() {
    this._hint('Loading sacred space…');

    try {
      await this._loadTemple();
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
        'assets/vt_corridor.glb',
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
  _addGoldenAura() {
    // Approach: pure PointLight pulse + a thin equatorial particle ring.
    // No solid sphere mesh — that was rendering as an opaque dome over the scene.
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

    // 2. Equatorial particle halo — 180 golden points in a ring
    const count     = 180;
    const r         = this._normScale * 1.18;
    const positions = new Float32Array(count * 3);
    const baseY     = this.temple ? this.temple.position.y : 0;

    for (let i = 0; i < count; i++) {
      const theta          = (i / count) * Math.PI * 2;
      positions[i * 3]     = r * Math.cos(theta);
      positions[i * 3 + 1] = baseY + (Math.random() - 0.5) * 0.20;
      positions[i * 3 + 2] = r * Math.sin(theta);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color:           0xF4B942,
      size:            0.045,
      transparent:     true,
      opacity:         0,
      depthWrite:      false,
      blending:        THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this._auraRing = new THREE.Points(geo, mat);
    this.scene.add(this._auraRing);

    // Fade halo in
    gsap.to(mat, { opacity: 0.75, duration: 0.9, ease: 'power2.out', delay: 0.2 });

    // Gentle pulse on halo opacity too
    if (!this.PRM) {
      gsap.to(mat, {
        opacity: 0.35,
        duration: 2.5,
        ease:     'sine.inOut',
        yoyo:     true,
        repeat:   -1,
        delay:    1.2,
      });
    }
  }

  // ── Click handler ────────────────────────────────────────────────────────
  _handleClick() {
    if (!this.artifactMgr) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.artifactMgr.getClickedItem(this.raycaster);
    if (!hit) return;

    // Radial pulse from artifact position (PRD §3.6 C)
    this.artifactMgr.spawnPulse(
      hit.group.position.clone(),
      this.scene,
      this.camera,
    );
    this._openModal(hit.data, hit);
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

      // Slowly rotate the aura particle ring
      if (this._auraRing && !this.PRM) {
        this._auraRing.rotation.y += 0.0015;
      }

      // Note: temple no longer drifts — it stays at its entrance-spin endpoint

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
