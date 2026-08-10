# 📄 Product Requirement Document (PRD)

## 📌 Feature Specification: Post-Hero Interactive Transition & Immersive 3D Model Experience

---

## 🎯 1. Objective & Overview
To create a seamless, cinematic transition from the hero video section into an interactive 3D scene centered around the **Vishwanath (VT) Temple Corridor Model**. This experience bridges video storytelling with interactive exploration, reinforcing the platform's core identity: *"Where Heritage Meets Living Data"*.

---

## 🧩 2. User Flow Overview

```
┌─────────────────────────┐
│ 1. Hero Video Auto-Play │
└───────────┬─────────────┘
            │ (First playback completes)
            ▼
┌─────────────────────────┐
│ 2. Video Exit Fade-Out  │
└───────────┬─────────────┘
            │ (800ms - 1200ms)
            ▼
┌─────────────────────────┐
│ 3. 3D Model Emergence   │ (Scale + 180° Y-Rotation)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 4. Golden Aura Highlight│ (Soft pulse glow #F4B942)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 5. Symbolic Items Spawn │ (Radial dispersal: Bel Patta, Damroo, etc.)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 6. Orbital Motion &     │ (Interactive hover & click states)
│    Interactivity Active │
└─────────────────────────┘
```

---

## 🎬 3. Detailed Interaction Sequence Breakdown

### 3.1 Hero Video Exit Transition
- **Trigger**: Completion of first full hero video playback.
- **Behavior**: Video smoothly fades out using `ease-in-out` opacity transition.
- **Duration**: `800ms – 1200ms`.
- **Result**: Canvas is cleared and prepared for 3D WebGL scene introduction.

---

### 3.2 VT Temple Corridor 3D Model Emergence

#### A. Initial State
- **Position**: Center aligned (optional `5% – 10%` left offset allowed for layout balance).
- **Scale**: Scaled down (`0.6` / `60%–70%` of final target scale).
- **Lighting**: Subtle ambient lighting.

#### B. Animation Specifications

| Animation Step | Properties | Duration | Easing |
| :--- | :--- | :--- | :--- |
| **Scale Up** | `0.6` → `1.0` | `1200ms – 1500ms` | `ease-out` |
| **Y-Axis Rotation** | `0°` → `180°` (Y-axis) | `1500ms – 2000ms` | Smooth cinematic curve |

#### C. Final State
- Model rests at target scale, centered/left-balanced, facing the user directly post-rotation.

---

### 3.3 Golden Aura Highlight Effect
- **Trigger**: Completion of 3D model rotation animation.
- **Behavior**:
  - Soft golden glow outline appears around the temple model.
  - Subtle pulsing effect (opacity variation `0.4` ↔ `0.8` + blur aura).
  - Uses warm brand tones (`#F4B942` Gold, `#E09A2D` Amber).
- **Duration**: `500ms` fade-in, followed by continuous subtle ambient pulse.
- **Purpose**: Visually anchors the focal point and signals entry into interactive mode.

---

### 3.4 Emergence of Sacred Symbolic Elements

#### A. Sacred Artifacts Set
1. 🍃 **Bel Patta** (Sacred Bael Leaf)
2. 🏺 **Kamandal** (Water Vessel)
3. 🥁 **Damroo** (Sacred Drum)
4. 🔱 **Trishool** (Trident)
5. 🛶 **Boat** (Ganga Rivercraft)

#### B. Spawn & Dispersal Behavior
- **Motion**: Elements emerge radially from the center of the temple corridor model (outward energy dispersal effect).
- **Animation**: Simultaneous opacity fade-in (`0` → `1`) and scale (`0` → `1.0`).
- **Duration**: `800ms – 1200ms`.

---

### 3.5 Orbital Motion System

#### A. Movement Pattern
- Revolve around the VT Temple model in a continuous circular/elliptical orbital path.
- Maintain equal angular spacing (`72°` separation between 5 objects).
- Orbit radius: Proportional to temple model size (`~1.2x – 1.5x` model radius).

#### B. Motion Specs
- **Speed**: Slow, meditative rotation (`~15s – 20s` per full cycle).
- **Direction**: Clockwise rotation (default).
- **Loop**: Infinite smooth loop.
- **Organic Motion**: Add subtle vertical floating/bobbing sine wave variation (`±10px`, `2s` period).

---

### 3.6 Interactivity & Hover States

#### A. Clickable Targets
- Each orbiting artifact acts as a 3D raycast target / interactive trigger linked to dedicated story/data drawers.

#### B. Hover Interactions
- **Visual Feedback**:
  - Emissive golden glow outline intensifies.
  - Scale up from `1.0` → `1.15`.
  - Increase material brightness / emissive intensity.
- **Transition**: `200ms – 300ms`, `ease-out`.

#### C. Click Feedback
- Brief radiant pulse / wave effect radiating outward from the clicked artifact.
- Triggers camera focus / zoom transition into selected object data modal.

---

## 🎨 4. Visual & Lighting Guidelines

| Aspect | Specification |
| :--- | :--- |
| **Color Language** | Base: Muted stone / neutral dark (`#070E10`, `#0E1A1C`) <br> Accents: Gold (`#F4B942`), Amber (`#F97316`) |
| **Lighting Setup** | Soft ambient light + directional rim lighting + golden emissive point lights on interactive objects |
| **Atmospheric Mood** | Sacred, calm, digital-heritage immersion — sophisticated and non-distracting |

---

## ⚙️ 5. Technical Architecture & Performance

### 5.1 Technology Stack
- **Framework**: Three.js / React Three Fiber (R3F) + GSAP for timeline animations.
- **Asset Formats**: Compressed GLTF / GLB with Draco compression.

### 5.2 Performance Optimization
- **Lazy Loading**: Defer loading heavy 3D mesh assets until hero video playback starts.
- **Level of Detail (LOD)**: Use simplified geometry meshes for low-power mobile devices.
- **Target Frame Rate**: Maintain solid `60 FPS` on mid-tier desktop and mobile devices.

### 5.3 Fallback Mechanism
- Devices with WebGL disabled or low hardware specs fallback to high-res pre-rendered animated WebP / video loop with touch-to-explore cards.

---

## 📱 6. Responsiveness & Device Adaptations

| Device Class | Layout Adaptations | Interaction Model |
| :--- | :--- | :--- |
| **Desktop** | Full interactive WebGL canvas, wide orbital radius | Hover state preview + Click inspection |
| **Tablet** | Medium orbital radius, scaled canvas | Touch tap selection with visual halo |
| **Mobile** | Concentric stacked orbit / reduced radius | Tap-to-focus object selector slider |

---

## ✅ 7. Success Criteria & KPIs

1. **Transition Quality**: Smooth, zero-stutter transition from 2D video to WebGL 3D scene.
2. **Visual Hierarchy**: VT Temple corridor model clearly established as primary focal point.
3. **Discoverability**: High user interaction rate with orbiting symbolic elements (>70% engagement).
4. **Performance**: Consistent `50–60 FPS` rendering across target devices.

---

## 🚀 8. Future Roadmap Extensions

- 🔍 **Interactive Deep-Dive**: Click object → smooth camera zoom into 3D asset → slide-over story & data panel.
- 🔊 **Spatial Audio Layering**: Dynamic distance-based spatial audio (ambient river soundscape + subtle temple bell chimes).
- 🌅 **Time-of-Day Dynamic Theme**: Real-time lighting shift from River Dawn Blue (`#1F4E52`) to Evening Aarti Gold (`#F4B942`).