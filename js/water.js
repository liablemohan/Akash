/**
 * water.js — WaterField
 *
 * A shell of small golden sphere "water" particles that slowly revolves
 * close around the model. Particles near the pointer get a spring-damped
 * outward/upward disturbance (a "ripple") that eases back to rest, paired
 * with a synthesised "clinging chimes" sound (Web Audio — no external SFX
 * asset) — small bell-like tones rather than a splash.
 *
 * Pointer proximity is resolved by raycasting against a large invisible
 * sphere centred on the model to recover a 3D world point near the shell,
 * then measuring each particle's 3D distance to that point.
 *
 * Sound is gated by a bottom-left radio on/off control (markup lives in the
 * host page; KashiScene wires the change events to `setSoundOn()`).
 */

import * as THREE from 'three';

const WATER_COLOR   = 0xF2C14E; // warm gold — matches the site's palette
const PARTICLE_SIZE = 0.028;    // sphere radius, world units — smaller than before
const RIPPLE_RADIUS  = 0.42;    // world units — how close the pointer must be to disturb a particle
const RIPPLE_IMPULSE = 1.1;
const SPRING_K        = 20;     // spring stiffness for the ease-back
const SPRING_DAMPING  = 7;

// Bright pentatonic-ish cluster (Hz) for the "clinging chime" sound — each
// trigger picks 2 of these so successive chimes feel varied, like a real
// wind chime rather than a single repeated note.
const CHIME_NOTES = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0];

export class WaterField {
  constructor(scene, camera, renderer, options = {}) {
    this.scene    = scene;
    this.camera   = camera;
    this.renderer = renderer;

    this.count  = options.count  ?? 600;
    this.radius = options.radius ?? 3.0;
    this.center = options.center ?? new THREE.Vector3();

    this.soundOn = options.soundOn !== false;
    this.PRM     = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._particles     = [];
    this._pointerNDC     = new THREE.Vector2(-2, -2);
    this._pointerWorld   = new THREE.Vector3();
    this._hasPointer     = false;

    this._audioCtx           = null;
    this._lastRippleSoundAt  = 0;

    this._buildMesh();
    this._buildHitSphere();
    this._setupPointerEvents();
  }

  // ── Instanced sphere mesh ───────────────────────────────────────────────
  _buildMesh() {
    const geo = new THREE.SphereGeometry(PARTICLE_SIZE, 8, 6);
    const mat = new THREE.MeshPhysicalMaterial({
      color:             WATER_COLOR,
      transparent:       true,
      opacity:           0.62,
      roughness:         0.12,
      metalness:         0.15,
      transmission:      0.45,
      thickness:         0.25,
      emissive:          new THREE.Color(WATER_COLOR),
      emissiveIntensity: 0.22,
    });

    this.mesh = new THREE.InstancedMesh(geo, mat, this.count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.mesh);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.count; i++) {
      const p = {
        angle:      Math.random() * Math.PI * 2,
        speed:      0.07 + Math.random() * 0.12,
        // Tighter band, close around the model rather than a wide cloud.
        radius:     this.radius * (0.78 + Math.random() * 0.34),
        height:     (Math.random() - 0.5) * 1.5,
        phase:      Math.random() * Math.PI * 2,
        bobSpeed:   0.4 + Math.random() * 0.6,
        baseScale:  0.5 + Math.random() * 0.75,
        // Ripple spring state
        disp:       0,
        dispVel:    0,
      };
      this._particles.push(p);

      dummy.position.set(
        this.center.x + Math.cos(p.angle) * p.radius,
        this.center.y + p.height,
        this.center.z + Math.sin(p.angle) * p.radius,
      );
      dummy.scale.setScalar(p.baseScale);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  // Invisible large sphere used purely so we can raycast to a 3D world
  // point near the water shell (screen-space pointer -> world-space point).
  _buildHitSphere() {
    const geo = new THREE.SphereGeometry(this.radius * 1.1, 20, 14);
    const mat = new THREE.MeshBasicMaterial({ visible: false });
    this._hitSphere = new THREE.Mesh(geo, mat);
    this._hitSphere.position.copy(this.center);
    this.scene.add(this._hitSphere);
  }

  // ── Pointer tracking (hover + slow passes trigger ripples) ─────────────
  _setupPointerEvents() {
    this._raycaster = new THREE.Raycaster();

    const update = (x, y) => {
      this._pointerNDC.x =  (x / window.innerWidth)  * 2 - 1;
      this._pointerNDC.y = -(y / window.innerHeight) * 2 + 1;
    };

    this._onPointerMove  = e => update(e.clientX, e.clientY);
    this._onPointerLeave = () => { this._hasPointer = false; };

    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerout', this._onPointerLeave);
  }

  _updatePointerWorld() {
    this._raycaster.setFromCamera(this._pointerNDC, this.camera);
    const hits = this._raycaster.intersectObject(this._hitSphere, false);
    if (hits.length) {
      this._pointerWorld.copy(hits[0].point);
      this._hasPointer = true;
    } else {
      this._hasPointer = false;
    }
  }

  // ── Per-frame update ─────────────────────────────────────────────────
  update(delta, elapsed) {
    this._updatePointerWorld();

    const dummy = new THREE.Object3D();
    let rippleThisFrame = false;

    for (let i = 0; i < this.count; i++) {
      const p = this._particles[i];

      if (!this.PRM) p.angle += delta * p.speed;

      const baseX = this.center.x + Math.cos(p.angle) * p.radius;
      const baseZ = this.center.z + Math.sin(p.angle) * p.radius;
      const bob   = this.PRM ? 0 : Math.sin(elapsed * p.bobSpeed + p.phase) * 0.12;
      const baseY = this.center.y + p.height + bob;

      // Proximity-based disturbance
      if (this._hasPointer) {
        const dx = baseX - this._pointerWorld.x;
        const dy = baseY - this._pointerWorld.y;
        const dz = baseZ - this._pointerWorld.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < RIPPLE_RADIUS * RIPPLE_RADIUS) {
          const dist     = Math.sqrt(distSq) || 0.0001;
          const strength = 1 - dist / RIPPLE_RADIUS;
          p.dispVel += strength * RIPPLE_IMPULSE;
          if (!p._rippling) {
            p._rippling      = true;
            rippleThisFrame  = true;
          }
        } else {
          p._rippling = false;
        }
      } else {
        p._rippling = false;
      }

      // Spring-damper ease back toward rest (disp -> 0)
      p.disp    += p.dispVel * delta;
      p.dispVel += (-p.disp * SPRING_K - p.dispVel * SPRING_DAMPING) * delta;
      if (Math.abs(p.disp) < 0.001 && Math.abs(p.dispVel) < 0.001) {
        p.disp = 0;
        p.dispVel = 0;
      }

      // Outward + upward push driven by the spring displacement
      const dirX = p.radius > 0 ? (baseX - this.center.x) / p.radius : 0;
      const dirZ = p.radius > 0 ? (baseZ - this.center.z) / p.radius : 0;

      const x = baseX + dirX * p.disp * 0.45;
      const z = baseZ + dirZ * p.disp * 0.45;
      const y = baseY + p.disp * 0.55;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(Math.max(0.12, p.baseScale * (1 + p.disp * 0.7)));
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;

    if (rippleThisFrame) this._playChimeSound();
  }

  // ── Synthesised "clinging chime" sound (Web Audio, no external asset) ──
  _ensureAudioContext() {
    if (this._audioCtx) return this._audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    this._audioCtx = new Ctx();
    return this._audioCtx;
  }

  /**
   * Small bell-like chime — two bright tones (a fundamental + a slightly
   * detuned partner for shimmer), each with a fast attack and a long
   * exponential bell-decay. Notes are picked at random from a pentatonic
   * cluster each trigger so repeated interaction sounds like a real wind
   * chime rather than one note looping.
   */
  _playChimeSound() {
    if (!this.soundOn) return;

    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    if (now - this._lastRippleSoundAt < 90) return; // throttle rapid triggers
    this._lastRippleSoundAt = now;

    const ctx = this._ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const t0 = ctx.currentTime;
    const idx = Math.floor(Math.random() * CHIME_NOTES.length);
    const note = CHIME_NOTES[idx];

    // Two partials per chime: the note itself, and a soft octave-ish
    // partner slightly detuned for shimmer/beating.
    const partials = [
      { freq: note,       gain: 0.16, decay: 0.9  },
      { freq: note * 2.01, gain: 0.07, decay: 0.55 },
    ];

    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t0);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);   // fast bell attack
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay); // long tail decay

      // Gentle high-shelf-ish brightness via a bandpass keeps it bell-like
      // rather than a plain sine buzz.
      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 3;
      filter.gain.value = 4;

      osc.connect(filter).connect(g).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + decay + 0.05);
    });
  }

  // ── Public API ──────────────────────────────────────────────────────────
  setSoundOn(on) {
    this.soundOn = !!on;
    if (this.soundOn) this._ensureAudioContext();
  }

  dispose() {
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerout', this._onPointerLeave);
    this.scene.remove(this.mesh);
    this.scene.remove(this._hitSphere);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
