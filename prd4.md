# PRD: Post-Hero Interactive Transition & Immersive 3D Model Experience


The experience should reinforce the narrative of:

> **Heritage + Digital Immersion**

The transition should feel **cinematic, sacred, calm, and immersive**, rather than flashy.

---

# 2. User Flow

```text
hero state
     │
     ▼
Temple Rotation + Scale Animation
     │
     ▼
Golden Aura Appears
     │
     ▼
Symbolic Elements Emerge
     │
     ▼
Elements Begin Orbital Motion
     │
     ▼
User Can Interact
     │
     ├── Hover → Highlight
     │
     └── Click → Expanded Content View
                         │
                         ▼
                  Content Panel + Focused Object
                         │
                         ▼
                  Back / Outside Click
                         │
                         ▼
                  Return to Orbital State
```

---

# 3. Phase 1 — VT Temple becomes dominant

## Initial State

The VT Temple model should initially be:

* Centered or approximately **5–10% left of center**.
* Scaled to approximately **60–70%** of its final size.
* Illuminated with subtle ambient lighting.

## Scale Animation

```text
Scale:     0.6 → 1.0
Duration:  1200–1500 ms
Easing:    ease-out
```

## Rotation Animation

The model performs a horizontal rotation:

```text
Axis:      Y
Rotation:  180°
Duration:  1500–2000 ms
```

The rotation should feel:

* Smooth
* Cinematic
* Organic
* Non-mechanical

## Final State

The model:

* Reaches full scale.
* Remains centered or slightly left.
* Faces the user.

---

# 4. Phase 2 — Golden Aura

### Trigger

The temple's rotation animation completes.

### Effect

A soft golden glow appears around the temple model.

### Visual Properties

Colors:

```text
#F4B942
#E09A2D
```

The glow should:

* Fade in over approximately **500 ms**.
* Pulse subtly.
* Vary slightly in opacity.
* Vary slightly in blur.

### Purpose

The aura should:

* Visually anchor the temple.
* Signal completion of the introduction.
* Indicate that the scene has entered its interactive state.

---

# 5. Phase 3 — Symbolic Elements

The following five objects emerge from the temple:

1. **Bel Patta**
2. **Kamandal**
3. **Damroo**
4. **Trishool**
5. **Boat**

## Spawn Animation

Each object:

* Emerges radially from the temple.
* Moves slightly outward.
* Fades in.
* Scales from `0 → 1`.

```text
Duration: 800–1200 ms
```

The movement should resemble **gentle energy dispersal** rather than explosive particle movement.

---

# 6. Phase 4 — Orbital Motion

Once the symbolic elements have emerged, they begin orbiting the temple.

## Movement

All five elements:

* Revolve around the temple.
* Follow a circular/orbital path.
* Maintain approximately equal spacing.
* Use an orbit radius proportional to the temple's size.

## Motion Properties

```text
Speed:       Slow / meditative
Direction:   Clockwise
Loop:        Infinite
Spacing:     Approximately equal
```

### Organic Movement

Add subtle floating/bobbing movement to prevent the objects from appearing mechanically attached to the orbital path.

The movement should remain:

> **Meditative rather than distracting.**

---

# 7. Phase 5 — Hover Interaction

Each orbital object is interactive.

## Hover Behavior

When the cursor enters an object:

```text
Scale:             1.0 → 1.1
Glow:              Increase
Brightness:        Increase
Emissive intensity: Increase
Duration:          200–300 ms
Easing:            ease-out
```

The object should receive a **golden glow highlight**.

## Click Feedback

Optional but recommended:

* Brief glow intensification.
* Ripple effect.
* Pulse effect.

---

# 8. Phase 6 — Expanded Object Interaction

## Trigger

The user clicks one of the orbital elements:

* Bel Patta
* Kamandal
* Damroo
* Trishool
* Boat

The selected element becomes the focal point.

---

# 9. Element Expansion

The selected object:

* Scales up approximately **1.5×–2×**.
* Leaves its orbital position.
* Moves smoothly toward a fixed position on the **right side of the screen**.

```text
Duration: 600–900 ms
Easing:   ease-in-out
```

---

# 10. Scene Recomposition

When an element is selected:

### Other Objects

The remaining orbital elements should either:

* Fade out, or
* Reduce opacity to approximately **20–30%**.

### Orbital Motion

Pause orbital movement.

### Temple

The temple should either:

* Dim slightly, or
* Shift subtly to preserve visual balance.

The selected object becomes the dominant visual element.

---

# 11. Content Panel

A content panel appears on the **left side** of the screen.

The overall composition becomes:

```text
┌──────────────────────────────────────────────┐
│                                              │
│  CONTENT PANEL            TEMPLE / OBJECT    │
│  ─────────────            ───────────────    │
│  Category Title                              │
│  Description                                 │
│                                              │
│  Article 1                    Selected       │
│  Article 2                    Object         │
│  Article 3                                   │
│  Article 4                                   │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 12. Content Panel Structure

## Header

Contains:

* Selected category title.
* Optional subtitle.
* Optional description.

Example categories may include:

* Spiritual Layer
* IKS Knowledge
* Heritage
* Cultural Knowledge

---

## Article List

Display a vertical list of articles/cards.

Each card may contain:

* Title
* 2–3 line description
* Optional thumbnail
* Optional icon

### Interaction

On hover:

* Highlight the article/card.

On click:

* Open the detailed content view.

---

# 14. Content Panel Scrolling

The panel should:

* Be vertically scrollable.
* Support smooth scrolling.
* Use inertial scrolling.

The panel itself should be implemented as an **HTML overlay**, rather than inside WebGL.

---

# 13. Exit / Reset Behavior

The user can exit the focused state by:

* Clicking outside the focused content/object.
* Clicking a back control.

The system then:

1. Collapses the selected object.
2. Returns it to its orbital position.
3. Restores orbital motion.
4. Hides the content panel.
5. Restores the default interactive state.

```text
Focused State
     │
     ├── Back
     │
     └── Outside Click
             │
             ▼
      Collapse Object
             │
             ▼
      Restore Orbit
             │
             ▼
      Hide Content Panel
             │
             ▼
      Default State
```

---

# 14. Visual Design

## Color Language

### Base

Muted stone / neutral tones.

### Accent

Golden tones:

```text
#F4B942
#F97316
```

Additional glow tones:

```text
#E09A2D
```

### Content Panel

Soft cream:

```text
#F2E3C6
```

---

# 14. Lighting

Use:

* Soft ambient lighting.
* Directional highlights.
* Golden emissive accents for interactive objects.
* Subtle lighting variation.

The overall visual mood should be:

> **Sacred + Calm + Immersive**

Avoid:

> **Flashy + Aggressive + Overstimulating**

---

# 15. Spatial Hierarchy

The interface should maintain a clear division:

```text
LEFT                         RIGHT
────────────────────────────────────────
Information                  Immersive
Content                      3D Model
Articles                     Selected Object
Navigation                   Visual Experience
```

When an object is selected:

> **Information occupies the left; the selected 3D object dominates the right.**

---

# 16. Technical Architecture

## Recommended Stack

```text
React
  │
  ├── React Three Fiber
  │       │
  │       └── Three.js
  │
  └── HTML/CSS UI Overlay
```

## 3D

Use:

* Three.js
* React Three Fiber

## UI

Use standard:

* React
* HTML
* CSS

The content panel should **not** be rendered inside WebGL.

---

# 17. Performance Requirements

Target:

> **50–60 FPS on mid-tier devices**

### Optimization

* Lazy-load 3D assets after the hero video.
* Use LODs where appropriate.
* Avoid loading the 3D model before it is required.
* Pause unnecessary animations when the user enters focused mode.
* Avoid unnecessary React re-renders.
* Keep HTML UI separate from the WebGL rendering pipeline.

---

# 18. Responsive Behavior

## Desktop

Full experience:

* Full orbital system.
* Hover interactions.
* Click interactions.
* Full content panel.
* Full 3D animation.

---

## Tablet

Maintain full interaction where practical.

Adjust:

* Model scale.
* Orbit radius.
* Content panel dimensions.

---

## Mobile

Use a simplified interaction model.

### Adjustments

* Reduce orbit radius.
* Reduce object size.
* Support touch interactions.
* Replace hover interactions with tap interactions.

Optional:

> **Tap-to-focus instead of hover-to-highlight.**

---

# 19. Fallback Experience

For low-end devices:

```text
Full 3D Experience
       ↓
Device capability detection
       ↓
Low-performance device
       ↓
Reduced animation / static representation
```

Possible fallback:

* Static temple image.
* Reduced 3D animation.
* Simplified symbolic elements.
* Reduced lighting effects.

---

# 20. Complete State Model

The experience can be implemented as the following states:

```text
STATE 1
TEMPLE_EMERGENCE
    │
    │ scale + rotation complete
    ▼
STATE 2
TEMPLE_AURA
    │
    │ aura complete
    ▼
STATE 3
SYMBOL_EMERGENCE
    │
    │ spawn complete
    ▼
STATE 4
ORBITAL_INTERACTION
    │
    ├── hover → HIGHLIGHT
    │
    └── click
          ▼
STATE 5
FOCUSED_OBJECT
    │
    ├── content interaction
    │
    └── back/outside click
             ▼
STATE 6
RESET
    │
    ▼
ORBITAL_INTERACTION
```

---

# 24. Interaction Timing Summary

| Interaction         |          Duration |
| ------------------- | ----------------: |
| Temple rotation     |      1500–2000 ms |
| Golden aura fade-in |           ~500 ms |
| Symbol emergence    |       800–1200 ms |
| Hover transition    |        200–300 ms |
| Object expansion    |        600–900 ms |
| Orbital motion      |          Infinite |
| Aura pulse          | Continuous/subtle |

---

# 25. Primary Success Criteria

The implementation is successful when:
1. The temple is clearly established as the primary visual focal point.
2. Symbolic objects emerge naturally from the temple.
3. Orbital movement is slow and meditative.
4. Interactive objects are visually discoverable.
5. Hover/touch states clearly communicate interactivity.
6. Clicking an object creates a clear transition from **exploration → focused content**.
7. The selected object becomes visually dominant.
8. The content panel provides clear information architecture.
9. Returning to the default state feels seamless.
10. No significant layout shifts occur.
11. The experience maintains approximately **50–60 FPS on mid-tier devices**.
12. A functional fallback exists for low-end devices.

---

# 26. Optional Future Extensions

The architecture should leave room for:

* Object → zoom-in → detailed story/data layer.
* Temple bells.
* River ambience.
* Contextual audio.
* Time-of-day visual themes.
* River-blue → Aarti-gold transition.
* Additional cultural/heritage objects.
* Deeper content navigation.

### Conceptual final experience

```text
          ┌─────────────────┐
          │  TEMPLE EMERGES │
          └────────┬────────┘
                   │
              GOLDEN AURA
                   │
       ┌───────────┼───────────┐
       │           │           │
     Bel         Temple      Boat
    Patta                    │
       │                     │
    Kamandal ───────────── Damroo
                   │
                Trishool
                   │
                   ▼
            ORBITAL STATE
                   │
              USER CLICKS
                   │
       ┌───────────┴───────────┐
       │                       │
 INFORMATION              3D OBJECT
 LEFT PANEL              RIGHT SIDE
       │                       │
       └───────────┬───────────┘
                   │
              USER EXITS
                   │
                   ▼
            ORBITAL STATE
```

This converts the original PRD into a **state-driven implementation specification**, which should be easier to hand to a frontend/Three.js developer or a local coding model such as Qwen for incremental implementation.
