/**
 * artifacts.js — ArtifactManager  (v3 — Carousel Mode)
 *
 * Five sacred objects sit in a fixed circle.  After their spawn animation
 * completes, auto-orbit STOPS.  The user navigates with ← / → arrows.
 * Only the "front" item (closest to the camera, at angle = π/2) is
 * interactive (hover cursor + click-to-open modal).
 *
 * Architecture
 * ─────────────
 * · Each item has a fixed `baseAngle` in the circle.
 * · A single `_carouselAngle` offset is GSAP-animated when the user taps
 *   an arrow — `update()` reads it every frame to compute positions.
 * · No per-item angle mutation → scrub-safe and easy to reason about.
 */

import * as THREE from 'three';

const ARTIFACT_DIAMETER = 0.38;          // normalised target size (world units)
const FRONT_ANGLE       = Math.PI / 2;  // π/2 = +Z = closest to camera
const TWO_PI            = Math.PI * 2;

// ─── ArtifactManager ───────────────────────────────────────────────────────
export class ArtifactManager {
  constructor(scene, loader, defs, camera) {
    this.scene          = scene;
    this.loader         = loader;
    this.defs           = defs;
    this.camera         = camera;

    this.items          = [];
    this.orbitRadius    = 2.1;
    this._hovered       = null;

    // GSAP animates _carouselAngle; update() reads it each frame
    this._carouselAngle = 0;
    this._isAnimating   = false;

    this.PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ── Load ───────────────────────────────────────────────────────────────────

  async loadAll() {
    await Promise.all(this.defs.map((def, i) => this._loadOne(def, i)));
  }

  _loadOne(def, index) {
    return new Promise(resolve => {
      const onLoaded = gltf => {
        const model = gltf.scene;

        // Apply orientation fix FIRST so bounding-box is computed on correct axes
        // (Trishool + Kamandal are exported lying flat — X -90° stands them upright)
        if (def.rotationFix) {
          model.rotation.x = def.rotationFix.x ?? 0;
          model.rotation.y = def.rotationFix.y ?? 0;
          model.rotation.z = def.rotationFix.z ?? 0;
          model.updateWorldMatrix(false, true); // flush rotation before box calc
        }

        // Normalise to target diameter (on the already-rotated model)
        const box  = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(ARTIFACT_DIAMETER / maxDim);

        // Centre at own origin
        const centre = new THREE.Vector3();
        new THREE.Box3().setFromObject(model).getCenter(centre);
        model.position.sub(centre);

        // Emissive channel for hover/front glow
        model.traverse(child => {
          if (!child.isMesh) return;
          child.material                   = child.material.clone();
          child.material.emissive          = new THREE.Color(0xF4B942);
          child.material.emissiveIntensity = 0;
        });

        this._registerItem(model, def, index);
        resolve();
      };

      const onError = () => {
        console.warn(`[ArtifactManager] Could not load ${def.path} — using placeholder.`);
        const geo = new THREE.OctahedronGeometry(ARTIFACT_DIAMETER * 0.5, 1);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xF4B942, emissive: new THREE.Color(0xF4B942),
          emissiveIntensity: 0.4, metalness: 0.6, roughness: 0.25,
        });
        this._registerItem(new THREE.Mesh(geo, mat), def, index);
        resolve();
      };

      this.loader.load(def.path, onLoaded, undefined, onError);
    });
  }

  _registerItem(model, def, index) {
    const group = new THREE.Group();
    group.add(model);
    group.visible = false;
    group.scale.setScalar(0);
    this.scene.add(group);

    // Item 0 starts at front (FRONT_ANGLE = π/2); others evenly spaced CW
    const baseAngle = FRONT_ANGLE + (index / this.defs.length) * TWO_PI;

    this.items.push({
      group,
      model,
      data:        def,
      baseAngle,
      phaseOffset: index * 1.27,   // unique bobbing phase per item
    });
  }

  // ── Spawn ──────────────────────────────────────────────────────────────────

  /**
   * Positions all items at their carousel spots then pops them in one by one.
   * Returns a Promise that resolves when the last item finishes scaling in.
   */
  async spawnAll(orbitRadius) {
    this.orbitRadius = orbitRadius;

    this.items.forEach(item => {
      const a = item.baseAngle + this._carouselAngle;
      item.group.position.set(
        Math.cos(a) * this.orbitRadius,
        0,
        Math.sin(a) * this.orbitRadius,
      );
      item.group.visible = true;
    });

    if (this.PRM) {
      this.items.forEach(item => item.group.scale.setScalar(1));
      return;
    }

    return new Promise(resolve => {
      const tl = window.gsap.timeline({ onComplete: resolve });
      this.items.forEach((item, i) => {
        tl.to(item.group.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.85,
          ease: 'back.out(1.7)',
        }, i * 0.18);
      });
    });
  }

  /**
   * Called after spawnAll().  No auto-orbit in v3 — just highlights front item.
   */
  startOrbiting(radius) {
    this.orbitRadius = radius;
    this._highlightFront();
  }

  // ── Update (every frame) ───────────────────────────────────────────────────

  update(delta, elapsed) {
    this.items.forEach(item => {
      const a = item.baseAngle + this._carouselAngle;

      // XZ position — reads GSAP-animated _carouselAngle smoothly
      item.group.position.x = Math.cos(a) * this.orbitRadius;
      item.group.position.z = Math.sin(a) * this.orbitRadius;

      // Y bobbing (continues even during carousel animation)
      item.group.position.y = Math.sin(elapsed * Math.PI + item.phaseOffset) * 0.055;

      // Gentle self-spin so models don't look frozen
      item.model.rotation.y += delta * 0.35;
    });
  }

  // ── Carousel navigation ────────────────────────────────────────────────────

  /**
   * Rotate the carousel one step in the given direction.
   * 'left'  → next counter-clockwise item comes to front  (angle -=  step)
   * 'right' → next clockwise item comes to front           (angle +=  step)
   */
  rotateCarousel(dir) {
    if (this._isAnimating) return;
    this._isAnimating = true;

    const step        = TWO_PI / this.items.length;   // 72° for 5 items
    const sign        = dir === 'right' ? 1 : -1;
    const targetAngle = this._carouselAngle + sign * step;

    // GSAP animates the scalar offset; update() reads it each frame for XZ
    window.gsap.to(this, {
      _carouselAngle: targetAngle,
      duration:       0.65,
      ease:           'power2.inOut',
      onComplete: () => {
        this._isAnimating = false;
        this._highlightFront();
      },
    });
  }

  // ── Front item helpers ─────────────────────────────────────────────────────

  /** The item with the largest Z value (sin of its effective angle) = front. */
  getFrontItem() {
    let best = null, bestZ = -Infinity;
    this.items.forEach(item => {
      const z = Math.sin(item.baseAngle + this._carouselAngle);
      if (z > bestZ) { bestZ = z; best = item; }
    });
    return best;
  }

  /** Scale up front artifact (1.22×); shrink others (0.88×); glow front. */
  _highlightFront() {
    const front = this.getFrontItem();
    if (!front) return;

    this.items.forEach(item => {
      const isFront = item === front;
      window.gsap.to(item.group.scale, {
        x: isFront ? 1.22 : 0.88,
        y: isFront ? 1.22 : 0.88,
        z: isFront ? 1.22 : 0.88,
        duration: 0.4,
        ease:     'power2.out',
      });
      item.group.traverse(child => {
        if (child.isMesh && child.material) {
          window.gsap.to(child.material, {
            emissiveIntensity: isFront ? 0.40 : 0,
            duration: 0.4,
          });
        }
      });
    });
  }

  // ── Hover (front item only) ────────────────────────────────────────────────

  updateHover(raycaster) {
    const front   = this.getFrontItem();
    const meshes  = this._collectMeshes();
    const hits    = raycaster.intersectObjects(meshes, false);
    const hitItem = hits.length ? this._itemFromObject(hits[0].object) : null;

    // Only the front item receives hover treatment
    const effective = (hitItem && hitItem === front) ? hitItem : null;
    document.body.style.cursor = effective ? 'pointer' : '';

    if (effective !== this._hovered) {
      if (this._hovered) this._applyHover(this._hovered, false);
      if (effective)     this._applyHover(effective,     true);
      this._hovered = effective;
    }
  }

  _applyHover(item, on) {
    if (this.PRM) return;
    window.gsap.to(item.group.scale, {
      x: on ? 1.34 : 1.22,
      y: on ? 1.34 : 1.22,
      z: on ? 1.34 : 1.22,
      duration: 0.22,
      ease:     'power2.out',
    });
    item.group.traverse(child => {
      if (child.isMesh && child.material) {
        window.gsap.to(child.material, {
          emissiveIntensity: on ? 0.75 : 0.40,
          duration: 0.22,
        });
      }
    });
  }

  // ── Click (front item only) ────────────────────────────────────────────────

  getClickedItem(raycaster) {
    const hits = raycaster.intersectObjects(this._collectMeshes(), false);
    if (!hits.length) return null;
    const hitItem = this._itemFromObject(hits[0].object);
    const front   = this.getFrontItem();
    return (hitItem && hitItem === front) ? hitItem : null;
  }

  // ── Radial click-pulse (PRD §3.6 C) ───────────────────────────────────────

  spawnPulse(position, scene, camera) {
    const geo  = new THREE.RingGeometry(0.06, 0.15, 40);
    const mat  = new THREE.MeshBasicMaterial({
      color:   0xF4B942,
      transparent: true,
      opacity: 1.0,
      side:    THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.copy(position);
    const toCamera = new THREE.Vector3()
      .subVectors(camera.position, position).normalize();
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), toCamera);
    scene.add(ring);

    window.gsap.timeline({
      onComplete: () => { scene.remove(ring); geo.dispose(); mat.dispose(); },
    })
      .to(ring.scale, { x: 14, y: 14, z: 14, duration: 0.65, ease: 'power2.out' }, 0)
      .to(mat,        { opacity: 0,           duration: 0.65, ease: 'power2.out' }, 0);
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  _collectMeshes() {
    const out = [];
    this.items.forEach(item =>
      item.group.traverse(c => { if (c.isMesh) out.push(c); }),
    );
    return out;
  }

  _itemFromObject(obj) {
    return this.items.find(item => {
      let hit = false;
      item.group.traverse(c => { if (c === obj) hit = true; });
      return hit;
    }) ?? null;
  }
}
