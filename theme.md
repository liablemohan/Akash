# 🎨 KashiVerse Design System & Theme Guidelines

> **“Where Heritage Meets Living Data”**  
> Comprehensive Design System, Design Tokens, Animation Storyboard, and Brand Identity for the KashiVerse / Banarasi Bhaukal platform.

---

## 🎯 1. Design Tokens & CSS Variables

Below are the official design tokens formatted for **Figma Design Variables**, **CSS `:root` Custom Properties**, and component mappings.

### 🌊 Base Palette — River Theme
Cool, deep teal tones representing the calm, spiritual waters of the Ganges.

| Variable Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `--color-bg-deep` | `#070E10` | Darkest background (Hero, canvas deep dark) |
| `--color-bg` | `#0E1A1C` | Primary page background |
| `--color-surface` | `#1F4E52` | Primary cards, surface containers |
| `--color-surface-2` | `#2F6F73` | Secondary elevated surfaces, active states |
| `--color-muted` | `#6FA3A6` | Muted surfaces, borders, subtle lines |

### 🌅 Transition Layer
Warm cream tone bridging the cool river water and warm golden flames.

| Variable Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `--color-transition` | `#F2E3C6` | Dividers, subtle grid lines, sketch outlines |

### 🔥 Accent Palette — Aarti & Gold
Vibrant warm tones representing the evening Ganga Aarti, sacred fire, and digital energy.

| Variable Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `--color-gold` | `#F4B942` | Primary CTA buttons, key glowing nodes |
| `--color-gold-2` | `#E09A2D` | Highlights, secondary CTA, badges |
| `--color-amber` | `#F97316` | Hover states, interactive highlights |
| `--color-amber-deep` | `#C2410C` | Deep flame shadows, contrast accents |

### ⚫ Utility & Typography Colors

| Variable Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `--color-text` | `#FFFFFF` | Primary readable text on dark surfaces |
| `--color-text-muted` | `#A7BFC2` | Subtitles, captions, secondary text |
| `--color-text-dark` | `#0F172A` | High-contrast text on light/gold surfaces |

---

### 💻 CSS `:root` Implementation Block

```css
:root {
  /* River Theme Base */
  --color-bg-deep:     #070E10;
  --color-bg:          #0E1A1C;
  --color-surface:     #1F4E52;
  --color-surface-2:   #2F6F73;
  --color-muted:       #6FA3A6;

  /* Transition Layer */
  --color-transition:  #F2E3C6;

  /* Aarti & Gold Accent */
  --color-gold:        #F4B942;
  --color-gold-2:      #E09A2D;
  --color-amber:       #F97316;
  --color-amber-deep:  #C2410C;

  /* Text & Utility */
  --color-text:        #FFFFFF;
  --color-text-muted:  #A7BFC2;
  --color-text-dark:   #0F172A;

  /* Typography */
  --font-display:      'Playfair Display', Georgia, serif;
  --font-body:         'Inter', system-ui, sans-serif;
  --font-mono:         'IBM Plex Mono', 'Courier New', monospace;
}
```

---

### 💡 Figma & UI Component Usage Mapping

| Element | Applied Token / Hex | Description |
| :--- | :--- | :--- |
| **Page Background** | `var(--color-bg)` (`#0E1A1C`) | Deep canvas background |
| **Cards & Containers** | `var(--color-surface)` (`#1F4E52`) / `var(--color-muted)` (`#A7BFC2`) | Muted blue/teal rounded cards |
| **Dividers & Grids** | `var(--color-transition)` (`#F2E3C6`) | Cream gradient lines & separators |
| **CTA Button** | `var(--color-gold)` (`#F4B942`) | Primary action buttons with outer glow |
| **Hover CTA** | `var(--color-amber)` (`#F97316`) | Active hover and focus states |
| **Highlights & Badges** | `var(--color-gold-2)` (`#E09A2D`) | Secondary focal points & highlights |

---

## 🎬 2. GIF / Comic Transition Frames (Storyboard)

Horizontal 4-stage animation storyboard designed for comic strip transitions, hero animations, or dynamic GIF exports:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRAME 1:      │ ──>│   FRAME 2:      │ ──>│   FRAME 3:      │ ──>│   FRAME 4:      │
│   River         │    │   Sketch        │    │   Data Connected│    │   Aarti / Glow  │
│   (Calm Origin) │    │   (Emergence)   │    │   (Golden Net)  │    │   (Full Energy) │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🧩 Frame 1 — River (Calm Origin)
- **Palette**: Cool teal & deep water darks (`#070E10`, `#1F4E52`)
- **Visuals**: Still water, minimal motion, silhouette of ghats
- **Effects**: No glow, no highlights
- **Vibe / Feeling**: Silence / Spiritual Calm

### 🧩 Frame 2 — Sketch (Emergence)
- **Palette**: Desaturated sepia & cream tones (`#F2E3C6`, `#6FA3A6`)
- **Visuals**: Architectural wireframes and line drawings emerge
- **Effects**: Fade-in of structural outlines and temple geometry
- **Vibe / Feeling**: Memory / Blueprint

### 🧩 Frame 3 — Data Connected (Golden Network)
- **Palette**: Teal background with gold node overlays (`#F4B942`, `#E09A2D`)
- **Visuals**: Animated golden nodes and data connections across temples & ghats
- **Effects**: Subtle pulse animation, digital pathways connecting points
- **Vibe / Feeling**: Digital Awakening

### 🧩 Frame 4 — Aarti / Full Glow
- **Palette**: Warm gold, fiery amber, and deep orange (`#F4B942`, `#F97316`, `#C2410C`)
- **Visuals**: River reflecting golden lamps (diya), fire energy, crowd vibrancy
- **Effects**: Full radiant glow, dynamic reflections on water
- **Vibe / Feeling**: Life / Energy / Divinity

### 🎞️ Animation Timing (for GIF & CSS Scroll Motion)
- **Frame Delays**: `0.6s` → `0.8s` → `0.8s` → `1.0s`
- **Loop**: Enabled (`infinite`)
- **Camera Motion**: Subtle 5% smooth zoom-in across the sequence

---

## 🧠 3. Brand Identity — KashiVerse

### 🔷 Core Brand Concept
> **“Where Heritage Meets Living Data”**

### 🎨 Visual Identity & Logo Concept
- **Logo Concept**: Minimalist temple silhouette resting atop a gentle river wave line, centered by a single radiant golden data node.
- **Dual-Tone Signature**:
  - **Left (Cool River Teal)**: Calm, Deep Knowledge, History, Silence
  - **Right (Warm Aarti Gold)**: Living Energy, Culture, Digital Connection, Divinity

---

### 🔤 Typography Hierarchy

| Style Role | Font Family | Character / Vibe |
| :--- | :--- | :--- |
| **Headings (`h1`, `h2`, `h3`)** | `Playfair Display` | Classic, elegant, heritage feel |
| **Body & UI Text** | `Inter` / `Poppins` | Modern, clean, highly readable |
| **Code & Technical Data** | `IBM Plex Mono` | Precision, data structure |

---

### 🧱 UI Language Guide

| Component | Design Style |
| :--- | :--- |
| **Cards** | Soft-rounded corners (`16px`), glassmorphic backdrop, muted teal borders |
| **Buttons** | Warm gold background (`#F4B942`), dark text (`#0F172A`), golden box-shadow glow |
| **Icons** | Clean stroke line-icons with gold accenting on dark surfaces |
| **Dividers** | Gradient lines transitioning from cream (`#F2E3C6`) to transparent |

---

### 📦 Product & 3D Physical Artifact Identity
- **Base Material**: Sandstone / matte neutral texture
- **Highlight Detail**: Metallic gold leafing / accent inlay
- **Premium Edition**: Deep teal matte finish + polished gold combo

---

### 🚀 Brand Positioning & Tagline Options

**Positioning**: Cultural Tech Platform — Digital Heritage + Physical Artifacts + Craft Economy & Smart Tourism.

#### 🔥 Tagline Options:
1. **“Digitising Devotion.”**
2. **“From Ghat to Global.”**
3. **“Sacred. Scanned. Shared.”**
4. **“Kashi, Reimagined.”**

---

## 💡 Next Steps & Action Plan

- [ ] **Homepage UI Implementation** (Cinematic Igloo-style scroll layers)
- [ ] **Logo Vector Concepts** (SVG assets based on dual-tone palette)
- [ ] **GIF Export from Comic Frames** (Storyboard rendering)
- [ ] **Pitch Deck Visual Templates** (Startup presentation slides)
