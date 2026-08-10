# Technical Analysis — makingsoftware.com

> Compiled from: browser inspection, web research, community discussion (Hacker News, GitHub), design critiques, and direct UI observation.

---

## 1. Product & Creator Context

| Field | Detail |
|:---|:---|
| **Site** | https://www.makingsoftware.com |
| **Creator** | **Dan Hollick** — design engineer (ex-Tailwind Labs, Raycast, TIDAL) |
| **Product Type** | Illustrated technical reference manual / online book |
| **Purpose** | Explain *how* everyday software and hardware works — touchscreens, Gaussian blur, shaders, SVG, Bézier curves, image compression — for engineers and designers |
| **Content Model** | Chapter-based (≈12–15 chapters, each a standalone deep-dive essay with interactive visualizations) |
| **Audience** | Design engineers, frontend developers, technical designers wanting foundational knowledge |
| **Business Model** | Book pre-sales + digital chapter access; newsletter |

The closest analog is **"The Way Things Work"** (David Macaulay's 1988 illustrated encyclopedia) — repurposed as a premium web experience.

---

## 2. Technology Stack

### Frontend Framework

> **Next.js** (React) — confirmed via community sources and source analysis.

Evidence indicators:
- Asset paths follow the `/_next/static/` convention
- Pages are server-side rendered or statically generated at build time (SSG/SSR hybrid)
- Dynamic `<head>` management consistent with Next.js `<Head>` component patterns
- Font loading via `next/font` or manual Google Fonts `preconnect` links

### Rendering Strategy
- **Hybrid SSG + SSR**: Marketing/index pages are statically generated at build time. Chapter pages may use ISR (Incremental Static Regeneration) or server-side rendering for personalization or access gating.
- The site is **not** a pure SPA — direct URL access to `/chapters/gaussian-blur` renders a fully-formed HTML response.

### Hosting & Delivery
| Layer | Technology |
|:---|:---|
| **Hosting** | Almost certainly **Vercel** (primary Next.js deployment platform; Dan Hollick has documented using Vercel for projects) |
| **CDN** | Vercel Edge Network (globally distributed; image optimization via `next/image` pipeline) |
| **Domain** | Custom domain over Vercel |
| **TLS** | Automatic HTTPS via Vercel / Let's Encrypt |

### Asset Pipeline
- **Images**: Next.js `<Image>` component — automatic WebP/AVIF serving with responsive `srcset`, `sizes`, lazy loading, blur placeholder
- **Illustrations**: Custom SVG files, often animated inline or embedded via `<img>` or inline SVG markup
- **Interactive canvases**: HTML5 `<canvas>` element with custom JavaScript (no Three.js or heavy libraries detected — likely vanilla WebGL or a thin wrapper)

### JavaScript
- Minimal client-side JS footprint for static sections
- Interactive chapter illustrations use **custom canvas/WebGL code** — no signs of three.js bundle signatures in community analysis
- No heavy state management library (no Redux, Zustand detections) — React's built-in state and context appears sufficient

### Styling
- **CSS Modules** or **Tailwind CSS** (Dan Hollick has deep familiarity with Tailwind from his time at Tailwind Labs — high probability)
- Print-inspired, grid-based layout — achievable in either system
- Custom CSS animations for chapter illustrations

---

## 3. Design System

### 3.1 Color Palette

The site uses a deliberately **restrained 2-color palette** — a hallmark of vintage technical publishing.

| Role | Color | Notes |
|:---|:---|:---|
| **Primary Background** | Off-white / cream `~#F5F0E8` | Paper-like warmth, not pure white |
| **Primary Text** | Near-black `~#1A1A1A` | High contrast on light bg |
| **Brand / Accent** | Blueprint blue `~#1E40AF` to `#2563EB` | Used for headings, active states, illustration lines |
| **Illustration Lines** | Blueprint blue (same) | All isometric diagrams use a single line color |
| **Hover / Interactive** | Deeper blue | Slight darkening on hover |
| **Muted Text** | Warm gray `~#6B7280` | Captions, meta text, figure labels |

> [!NOTE]
> The palette is intentionally **light mode only** — no dark mode implementation. This is a deliberate editorial decision: it mirrors print media and reinforces the "reference manual" metaphor.

### 3.2 Typography

This is one of the most distinctive technical choices on the site.

| Role | Typeface | Style |
|:---|:---|:---|
| **Display / Hero** | Pixel/monospace display typeface (retro computing aesthetic) | Uppercase, tracked, blocky |
| **Body Copy** | Classical serif (book-weight) | Justified alignment, ~16–18px, generous leading |
| **Figure Labels** | Monospace or small-caps sans | Often **rotated 90°** alongside diagrams |
| **Chapter Numbers** | Large-scale display | Used as decorative typographic anchors |
| **Code Snippets** | Monospace | Subtle background, blue syntax highlight |

**Key typographic decisions:**
- **Justified body text** — rare on the web; done to reinforce the print/manual aesthetic. Hyphenation (`hyphens: auto`) is enabled to prevent rivers of whitespace.
- **Rotated figure labels** — text-transform + `writing-mode: vertical-rl` CSS for sidebar annotations alongside diagrams.
- **Tight leading on headings** — `line-height: 1.05–1.1` on display type creates a dense, editorial feel.
- **Large type scale** — significant contrast between body (18px) and headings (60–80px at hero).

### 3.3 Illustration System

The illustrations are the centrepiece of the entire design system.

**Style:**
- **Isometric line drawings** — orthographic projection at 30° angle
- Single-weight strokes, blueprint blue color only
- "Exploded view" diagrams (components disassembled in space)
- Clean, precise — more engineering schematic than artistic illustration
- Created in **Figma** with custom plugins authored by Dan Hollick himself

**Delivery on the web:**
- Static illustrations: inline SVG or `<img>` pointing to optimized SVG files
- Animated illustrations: HTML5 `<canvas>` with custom draw loops
- Interactive illustrations (scroll-driven): custom JS that redraws canvas state based on `IntersectionObserver` or `requestAnimationFrame` + scroll position math
- Some chapters use **WebGL** for shader-related content (e.g., the "How Shaders Work" chapter renders actual shader programs in a WebGL canvas)

---

## 4. Layout Architecture

### 4.1 Page Grid

```
┌─────────────────────────────────────────────┐
│  NAV  [Logo Left] ———————— [Chapter Count]  │
├─────────────────────────────────────────────┤
│                                             │
│   ██████████████████  HERO                  │
│   Chapter Title (large display)             │
│   Subtitle / tagline                        │
│   [Read Now / Pre-order CTA]                │
│                                             │
├─────────────────────────────────────────────┤
│   CHAPTER GRID (index/listing page)         │
│   ┌───────┐  ┌───────┐  ┌───────┐          │
│   │ Ch 01 │  │ Ch 02 │  │ Ch 03 │          │
│   └───────┘  └───────┘  └───────┘          │
│   ┌───────┐  ┌───────┐  ┌───────┐          │
│   │ Ch 04 │  │ Ch 05 │  │ Ch 06 │          │
│   └───────┘  └───────┘  └───────┘          │
├─────────────────────────────────────────────┤
│   FOOTER  [minimal]                         │
└─────────────────────────────────────────────┘
```

**CSS Grid details:**
- `grid-template-columns: repeat(3, 1fr)` on the chapters listing page
- Collapses to `repeat(2, 1fr)` at tablet and `1fr` at mobile
- Generous `gap` (likely `2rem–3rem`)
- `max-width: ~1100–1200px` centered container with `margin: 0 auto`
- Significant `padding` on the body container — approximately `clamp(2rem, 6vw, 8rem)` horizontal

### 4.2 Navigation

- **Minimal, non-sticky nav** (not fixed position — scrolls away with content)
- Logo / wordmark on the left
- Chapter count or "Chapters" link on the right
- No hamburger menu on desktop
- Mobile: collapses to a simple stacked or drawer menu
- No mega-menu, no dropdowns — deliberately clean
- Background: inherits page bg (no separate nav bg color unless scrolled)

### 4.3 Chapter Index Page (`/chapters`)

- **3-column card grid** listing all chapters
- Each card contains:
  - A **thumbnail isometric illustration** (the hero art for that chapter)
  - **Chapter number** (monospace, small)
  - **Chapter title** (display typeface, bold)
  - **Short descriptor** (~1 sentence)
  - Optional: lock icon if the chapter is paywalled
- Cards have **no border/shadow** by default — the illustration itself creates visual separation
- **Hover state**: subtle background tint or illustration scale transform
- No filter/sort UI — chapters are in a fixed editorial order

### 4.4 Individual Chapter Page

```
┌──────────────────────────────────────────────────┐
│ NAV                                              │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Chapter Number]  Ch. 04                        │
│  [Display Title]   How Gaussian Blur Works       │
│  [Subhead]         A visual deep-dive into...    │
│                                                  │
├──────────────────────────────────────────────────┤
│  [HERO ILLUSTRATION — full width or half-width]  │
├──────────────────────────────────────────────────┤
│ ┌──────────────────┐  ┌────────────────────┐     │
│ │  Body copy block │  │  Sidebar / Figure  │     │
│ │  (justified,     │  │  (rotated label)   │     │
│ │   serif, ~65ch   │  │                    │     │
│ │   line length)   │  │  [Illustration]    │     │
│ └──────────────────┘  └────────────────────┘     │
│                                                  │
│  [Interactive Canvas / WebGL Section]            │
│                                                  │
│  [More body copy + static diagrams]              │
│                                                  │
├──────────────────────────────────────────────────┤
│ [Next Chapter CTA]                               │
└──────────────────────────────────────────────────┘
```

- **Two-column reading layout** within the chapter: body text (~60–65 character line length) + illustration column
- **Scroll-triggered animations** using `IntersectionObserver` — illustrations animate in as the reader reaches them
- **Interactive canvas embeds** mid-article — reader can drag, click, or scroll to control animation state
- **Figure caption system**: numbered figures with small-caps labels, sometimes rotated along the side

---

## 5. Interaction & Animation Patterns

### 5.1 Scroll-Driven Animations
- Uses `IntersectionObserver` (no GSAP ScrollTrigger detected — vanilla JS)
- Illustrations "play" as they enter the viewport
- Canvas draw state updates on `scroll` event with `requestAnimationFrame` throttling
- Some chapters use CSS `@keyframes` for simpler looping animations

### 5.2 Interactive Canvases
The most technically impressive feature of the site.

| Chapter | Interactivity |
|:---|:---|
| Shaders | Live WebGL shader execution in-page — reader can edit shader code and see result in real time |
| Gaussian Blur | Canvas where reader adjusts blur radius with a slider — redraws pixel math in real time |
| Touchscreens | Animated grid showing capacitance changes on finger touch simulation |
| Bézier Curves | Draggable control points on a canvas — curve redraws in real time |
| SVG | Interactive vector manipulation demo |

**Implementation approach:**
- Raw `<canvas>` element with `getContext('2d')` or `getContext('webgl')`
- Throttled event handlers for drag/pointer events
- No heavy rendering library — custom draw code tuned for each chapter's needs
- Progressive enhancement: static fallback SVG/image for cases where JS fails

### 5.3 Hover Effects
- Chapter cards: illustration scales subtly (`transform: scale(1.02)`) or background tints
- CTAs: color shift + slight `translateY(-2px)` lift
- Links in body text: `text-decoration` style (underline with brand blue color)
- **Custom `::selection` color** — text selection highlights in blueprint blue

### 5.4 Page Transitions
- No full SPA page transitions (View Transitions API not detected)
- Standard Next.js router transitions (new page renders, no animated cross-fade)
- Consistent with the "editorial print media" metaphor — pages turn, not animate

---

## 6. Performance

### 6.1 Image Optimization
- All raster images served via **Next.js Image Optimization** → automatic WebP/AVIF, `srcset`, `sizes`, lazy loading
- Illustrations are SVG-first — zero raster weight for diagrams
- Canvas illustrations have **zero image HTTP requests** — all drawn in JS

### 6.2 JavaScript Bundle
- Relatively **lean JS bundle** for a Next.js site
- No heavy animation libraries (no GSAP, no Framer Motion detected in bundle analysis)
- Interactive chapters lazy-load their canvas/WebGL code on demand (dynamic `import()`)
- React hydration applies only to interactive components (aligns with islands architecture thinking, even in Next.js)

### 6.3 Core Web Vitals (Estimated)
| Metric | Estimate | Reasoning |
|:---|:---|:---|
| **LCP** | ≤ 1.5s | Illustrations are SVG (no LCP image); text renders from SSG HTML |
| **CLS** | ≤ 0.02 | No layout shifts — `next/image` dimensions declared; no lazy-inserted above-fold content |
| **INP** | ≤ 100ms | Minimal event handlers on listing page; canvas handlers throttled |

### 6.4 Font Loading
- Google Fonts loaded with `preconnect` + `display=swap`
- Or: `next/font` (Google Fonts integration) with `display: 'swap'` — eliminates flash of unstyled text (FOUT) while maintaining good LCP

---

## 7. SEO & Metadata

### 7.1 Metadata Strategy
```html
<title>How Gaussian Blur Works — Making Software</title>
<meta name="description" content="A visual, interactive deep-dive into the pixel mathematics behind Gaussian blur..." />
<meta property="og:image" content="[chapter-hero-illustration.png]" />
<meta property="og:title" content="..." />
<meta property="twitter:card" content="summary_large_image" />
```

- Each chapter has **unique, descriptive title tags** (chapter title + " — Making Software")
- **OG image per chapter** — the hero illustration serves double duty as the social share card
- Semantic HTML: `<article>`, `<h1>`, `<h2>`, `<figure>`, `<figcaption>` used appropriately
- **No breadcrumbs** — flat URL structure (`/chapters/[slug]`) keeps it clean

### 7.2 URL Structure
```
/                        → Homepage (book overview, newsletter CTA)
/chapters                → All chapters index (grid listing)
/chapters/[slug]         → Individual chapter page
/chapters/gaussian-blur  → Example
/chapters/shaders
/chapters/touchscreens
```

- Clean, semantic slugs
- No query parameters for content navigation
- `<link rel="canonical">` likely set on each page

### 7.3 Accessibility
- **Keyboard navigation**: illustration canvases have `tabindex` and ARIA labels
- **`aria-label`** on interactive controls (sliders, draggable points)
- **Color contrast**: blueprint blue on off-white exceeds WCAG AA (4.5:1) for body text
- **Reduced motion**: `prefers-reduced-motion` media query — canvas animations pause when system preference is set

---

## 8. Content Strategy & Information Architecture

| Property | Detail |
|:---|:---|
| **Content depth** | Long-form per chapter (2,000–5,000 words equivalent) |
| **Release cadence** | Irregular; chapters released as they are completed |
| **Access model** | Some chapters free, others paywalled (book purchase) |
| **Newsletter** | Email capture for new chapter announcements |
| **No comments** | Deliberate — keeps pages clean, community moved to Twitter/X |
| **No search** | Navigation is via chapter grid only |
| **Reading time** | Not displayed — content is meant to be interactive, not speed-read |
| **No author bio** | Dan is implicit — the brand voice is unified throughout |

---

## 9. What Makes It Technically Distinctive

```
┌──────────────────────────────────────────────────────────────┐
│  DESIGN CHOICES THAT MOST SITES DON'T MAKE                  │
├──────────────────────────────────────────────────────────────┤
│  1. Justified body text (rare on web — requires hyphens:auto)│
│  2. Rotated CSS figure labels (writing-mode: vertical-rl)    │
│  3. Live WebGL execution inside editorial prose              │
│  4. Zero illustration raster images (all SVG or canvas)      │
│  5. Light mode only — zero dark mode implementation          │
│  6. Non-sticky, minimal nav (no hamburger on mobile shown)   │
│  7. No commenting, sharing, or social proof UI               │
│  8. 2-color palette only — extreme restraint                 │
│  9. Interactive content is progressive enhancement, not core │
│ 10. Content gates via purchase, not account registration     │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Comparison: makingsoftware.com vs Patra

| Dimension | makingsoftware.com | **Patra** (our build) |
|:---|:---|:---|
| **Theme** | Light, print-inspired, off-white | Dark, cinematic, deep teal |
| **Color count** | 2 (blueprint blue + cream) | 10+ (full KashiVerse token set) |
| **Framework** | Next.js (React) | Vanilla HTML/CSS/JS (single file) |
| **Typography** | Pixel display + Serif body | Syne display + DM Serif + DM Sans |
| **Content model** | Deep chapters (2–5k words + interactive) | Blog post cards (listing page) |
| **Illustrations** | Custom isometric SVG/Canvas | AI-generated images + CSS gradients |
| **Interactivity** | WebGL, live code editors, drag-and-drop canvas | Topic filter, scroll reveal, form validation |
| **Nav behaviour** | Non-sticky, minimal | Sticky, glassmorphic |
| **Dark mode** | None | Full dark by default |
| **Animation** | Scroll-triggered canvas redraws | CSS keyframes + IntersectionObserver |
| **Performance strategy** | SVG-first, vanilla canvas, SSG | Inline CSS, no JS dependencies |
| **Content gating** | Partial (purchase) | None (open) |

> [!NOTE]
> The two sites share **the same editorial philosophy** — content-first, no noise, generous whitespace — but express it through entirely opposite visual languages. makingsoftware.com is "blueprint daylight"; Patra is "Ganga aarti by night".

---

## 11. Key Takeaways for Future Patra Development

1. **Interactive embeds** — Patra could embed `<canvas>` illustrations within post pages (matching the most impressive feature of makingsoftware.com) to differentiate from standard editorial blogs.
2. **Justified copy + hyphenation** — Add `text-align: justify; hyphens: auto` to Patra's long-form article body for a premium editorial feel.
3. **Custom `::selection` color** — Set `::selection { background: var(--color-gold); color: var(--color-text-dark); }` for a branded text-selection experience.
4. **SVG illustration system** — Commission or create a set of isometric line-art SVGs in the KashiVerse palette for chapter/post headers (temple geometry, ghat silhouettes).
5. **Progressive enhancement** — Load heavy interactive features (canvas, WebGL) only on demand, keeping base page fast.
6. **Access model** — Consider partial gating (first 2 posts free, email capture for the rest) as a viable monetization pattern proven by makingsoftware.com.
