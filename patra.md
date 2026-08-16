# Making Software — Design Specification

## 1. Reference

**Reference site:** Making Software — https://www.makingsoftware.com/

**Design subject:** Landing / home page for *Making Software*, an illustrated reference manual by Dan Hollick.

**Primary design objective:** Present a technical reference book as an editorial, interactive, almost printed-manual-like experience rather than as a conventional SaaS/product landing page.

> Note: the live domain returned a 403 to the inspection client, so this specification is based on the indexed site content plus current design-reference screenshots and descriptions of the site. Where implementation details cannot be directly verified, they are marked as inferred.

---

## 2. Design Character

The visual language combines:

- technical documentation
- vintage computer/manual aesthetics
- editorial book design
- engineering diagrams
- blueprint / graph-paper drawing
- pixel typography
- restrained monochrome layouts
- a single strong blue accent
- generous whitespace
- long-form scrolling

The result should feel **like a technical book that has been turned into a website**, not a website decorated to look technical.

The design deliberately avoids:

- conventional SaaS hero sections
- gradients
- glassmorphism
- card-heavy layouts
- large photographic imagery
- excessive rounded corners
- generic icon libraries
- glossy 3D renders
- dark-mode-first presentation

---

## 3. Visual System

### 3.1 Base background

**[CONFIRMED from live site]** The background is a light, cool blue-grey — noticeably tinted, not white:

```css
--background: #E8ECF5;  /* confirmed approximately from live site */
```

There is also a subtle gradient: the top of the viewport is slightly lighter and the edges / bottom have more blue tint. This is most visible when sections separate with whitespace.

### 3.2 Primary ink

Use a dark neutral for normal text:

```css
--ink: #171717;
```

### 3.3 Signature blue

Blue is the defining accent of the identity.

Suggested working palette:

```css
--blue: #324CC3;
--blue-light: #93A8F4;
--blue-soft: #EAEBF8;
--blue-bright: #6C94FC;
--muted: #777777;
--muted-light: #848484;
```

The exact palette can be tuned after sampling the original assets.

Blue should be used for:

- title/logo lettering
- diagram highlights
- selected text
- links
- interactive annotations
- underlines
- selected states
- important diagram components

Do not use blue as a general page background.

---

## 4. Typography

The typography is one of the most important parts of the recreation.

### Display / technical type

Use **Departure Mono** for:

- site title
- diagram labels
- technical annotations
- navigation where appropriate
- section labels
- small metadata
- interactive technical UI

Departure Mono gives the site its pixel/terminal/technical character.

### Editorial body type

Use **New York** or a comparable high-quality serif for:

- explanatory paragraphs
- article copy
- longer descriptions
- editorial notes

The serif should contrast strongly with the monospaced technical type.

### Typography hierarchy

Approximate hierarchy:

```text
SITE TITLE
large / uppercase / monospaced / blue

SECTION LABEL
small / monospaced / uppercase

ARTICLE TITLE
large / serif or editorial display

BODY
serif / highly readable / relatively narrow measure

ANNOTATION
tiny / monospaced / uppercase

MICROCOPY
small / monospaced / muted
```

The site should feel typographically dense in the content areas while maintaining substantial whitespace around major sections.

---

## 5. Page Composition

The page is intentionally long-scrolling.

Think of the homepage as a sequence of printed/manual spreads:

```text
┌────────────────────────────────────────────┐
│ Header / identity                          │
├────────────────────────────────────────────┤
│ Hero / introduction                        │
│                                            │
│ Making Software                            │
│ short description                          │
│                                            │
├────────────────────────────────────────────┤
│ Visual / technical content preview         │
│                                            │
│ diagrams + explanatory text                │
│                                            │
├────────────────────────────────────────────┤
│ What the manual covers                     │
│                                            │
│ chapter / topic navigation                 │
│                                            │
├────────────────────────────────────────────┤
│ Featured technical explanations             │
│                                            │
│ illustrations + text                      │
│                                            │
├────────────────────────────────────────────┤
│ Newsletter / early-access CTA              │
├────────────────────────────────────────────┤
│ FAQ                                        │
├────────────────────────────────────────────┤
│ Footer                                     │
└────────────────────────────────────────────┘
```

The important principle is that sections should **flow vertically like pages in a book**, rather than appearing as independent marketing cards.

---

## 5b. Stipple Separator Rows

**[CONFIRMED from live site]** The site uses a very distinctive repeating horizontal separator between sections.

It consists of a full-width row of `░` characters (Unicode U+2591 LIGHT SHADE), rendered in a very light muted blue:

```text
░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░
```

A more prominent version adds the title in the center:

```text
░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░   MAKING SOFTWARE   ░ ░ ░ ░ ░ ░ ░ ░ ░
```

These separators:

- span the full viewport width
- use `overflow: hidden` so the characters tile edge to edge
- use Departure Mono for the characters
- color: approximately `rgba(50, 76, 195, 0.18)` — same blue as the grid, very faint
- the centered title version uses `--muted` colored text for `MAKING SOFTWARE`

Separators appear:
1. Immediately below the header
2. Between the hero section and the editorial/about section
3. Between the about section and the Early Access / CTA section

---

## 5c. Rotated Figure Labels

**[CONFIRMED from live site]** Every diagram is identified by a vertically-rotated label.

Left-margin labels:

```css
.fig-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue);  /* or var(--muted) for some */
  position: absolute;
  left: 0;
}
```

Examples seen: `FIG.001`, `FIG.002`, `FIG.003`, `FIG.004`, `FIG.006`

Right-edge vertical labels for the diagram subject:

```text
[ 3.5" FLOPPY DISK ]
[ CATHODE RAY TUBE DISPLAY ]
```

These also use `writing-mode: vertical-rl` (NOT rotated 180°), so text reads bottom-to-top and the bracket `[` appears at bottom.

---

## 6. Header

The header should be extremely restrained.

### Identity

Display:

**MAKING SOFTWARE**

in Departure Mono / pixel-like typography.

The logo should behave more like a book masthead than a startup logo.

### Supporting text

A small editorial descriptor sits near the title:

> A reference manual for people who design and build software.  
> Written and illustrated by Dan Hollick.

This supporting text should be visually subordinate to the title.

### Navigation

Navigation should remain small and utilitarian.

Potential destinations:

- Contents
- About
- Chapters / Manual
- Newsletter / Early access

Avoid a large multi-level navigation system.

---

## 7. Hero

**[CONFIRMED from live site]** The hero is NOT a headline-left / diagram-right layout.

It is a full-width, long editorial spread:

```text
LEFT (approximately 38% width)
  serif body text — continuous paragraphs
  Drop capital on first paragraph (very large H)
  Inline small diagrams interspersed between paragraphs:
    FIG.002  (touchscreen electrode layer stack, isometric)
    FIG.003  (Gaussian curve / bell curve)
  "FIG.001" rotated 90° in the left margin

RIGHT (approximately 62% width)
  Full-height annotated exploded diagram
  Subject: 3.5" Floppy Disk
  Isometric exploded view
  Parts labeled with thin blue leader lines:
    HD NOTCH
    TOP SHELL
    DUST LINER (×2)
    MAGNETIC DISK
    HUB
    WRITE PROTECT TAB
  Vertical label "[ 3.5" FLOPPY DISK ]" rotated 90° on far right edge
  FIG label "FIG.001" rotated 90° on the left edge of the right column
```

The two columns have no card border — they sit directly on the background.

The left body text reads:

> *"Have you ever wondered how a touch screen knows you are touching it? Well, it has these layers of transparent metal electrodes embedded in the display. When your finger gets close to the screen it causes a disturbance in the magnetic field that the electrodes sense.*
>
> *Because the electrodes are laid out on a grid, they can report back the x and y co-ordinates of the disturbance to the operating system. Pretty neat.*
>
> *Or maybe you've wondered why we call it a Gaussian blur? When we blur an image, we look at all the neighbouring pixels and multiply them by a matrix of weights called a kernel.*
>
> *They control the points on a bezier curve which is a cool piece of math we use to draw curves in vector graphics, like fonts and SVGs.*"

### Hero illustration style

- thin blue (`#324CC3`) strokes, 1–1.4px
- transparent fills
- dashed leader lines to labels
- flat isometric projection (no shading)
- selective blue-filled region (magnetic disk face filled with `#7B8EC8` or similar muted blue)
- labels in Departure Mono, uppercase, ~10–11px
- grid paper background behind the right diagram

---

## 8. Illustration Language

This is the most important visual differentiator.

### Drawing rules

Illustrations should use:

- fine blue/gray strokes
- transparent or white fills
- subtle grid paper
- geometric construction lines
- labels positioned around objects
- exploded views
- sectional views
- simple isometric projection
- occasional blue highlight planes

Avoid:

- photorealism
- glossy materials
- heavy shadows
- gradients
- cartoon outlines
- excessive visual noise

### Example visual vocabulary

The reference imagery includes diagrams such as:

- touchscreen electrode layers
- Gaussian distribution surfaces
- vector Bézier curves
- rasterized letters
- exploded technical objects
- GPU / graphics concepts
- software infrastructure diagrams

These illustrations should be treated as **explanatory diagrams**, not decorative artwork.

---

## 9. Grid / Paper Texture

A subtle technical grid can sit behind diagrams.

Example:

```css
background-image:
  linear-gradient(rgba(50, 76, 195, .08) 1px, transparent 1px),
  linear-gradient(90deg, rgba(50, 76, 195, .08) 1px, transparent 1px);

background-size: 16px 16px;
```

Use the grid selectively.

Recommended:

- behind diagrams
- behind large technical illustrations
- inside visual explanation panels

Avoid putting the grid behind the entire website continuously; the original visual language benefits from alternating clean paper and technical drawing surfaces.

---

## 10. Content Layout

The main content should use editorial proportions rather than a standard 12-column SaaS grid.

Recommended desktop structure:

```text
page padding: 4–7vw

content max-width: 1400–1600px

text measure: approximately 35–55rem

diagram area: flexible

body copy: narrow enough to remain highly readable
```

Use asymmetric compositions.

For example:

```text
┌──────────────┬──────────────────────────────┐
│ text         │                              │
│              │ large diagram                │
│ explanation  │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

Then reverse the relationship in the following section:

```text
┌──────────────────────────────┬──────────────┐
│                              │ text         │
│ large diagram                │              │
│                              │ explanation  │
└──────────────────────────────┴──────────────┘
```

This prevents the page from becoming visually repetitive.

---

## 11. Editorial Text Treatment

Long paragraphs should look like book text.

Characteristics:

- serif body font
- comfortable line height
- relatively narrow measure
- minimal decorative containers
- occasional large initial letter
- short technical captions
- diagrams integrated directly with text

Do not put every paragraph inside a card.

The whitespace itself provides separation.

---

## 12. Interactive Text Highlight

One of the site's distinctive micro-interactions is a handwritten-looking blue highlight.

When an interactive/linked phrase is activated or hovered:

1. the text changes toward the signature blue;
2. a loose, irregular blue underline appears;
3. the underline resembles a hand-drawn pen stroke;
4. the animation should feel slightly organic rather than perfectly geometric.

Conceptually:

```text
normal text
       ↓ hover
blue text + animated wavy underline
```

The underline should be implemented as an SVG/path, CSS mask, or equivalent rather than a normal `text-decoration`.

Animation:

```text
duration: ~300–600ms
easing: ease-out
direction: left → right
```

The effect should be subtle enough that it feels like a physical annotation in a book.

---

## 13. Chapter / Contents Section

The manual has a structured table of contents.

The indexed version contains **8 sections and 45 chapters**, including:

**[CONFIRMED chapter titles and word counts from live site]**

### 1 — Pixels and Color

- How does a screen work? ............. 3.6K WORDS
- What is a color space? .............. 6.2K WORDS
- Blending modes. ..................... 1.9K WORDS
- Digital images. ..................... 3.5K WORDS
- Touch screens. ...................... 1.4K WORDS

### 2 — Fonts and Vectors

- Drawing curves. ..................... 2.0K WORDS
- How to make a font. ................. 6.1K WORDS
- Rasterisation and anti-aliasing. .... 1.8K WORDS
- Scalable Vector Graphics. ........... 4.4K WORDS
- Boolean operations. ................. 3.2K WORDS

### 3 — 3D and Graphics

- How does a GPU work? ............... 3.6K WORDS
- Shaders. ........................... 4.6K WORDS
- Rays and SDFs. ..................... 2.0K WORDS
- Blurs, noise and other effects. .... 2.8K WORDS

### 4 — AI and ML

- Neural nets and transformers. ...... (in progress)
- Gradient descent and backpropagation. (in progress)
- Embeddings and attention. .......... (in progress)
- Generating images. ................. (in progress)

### 5 — Data and Compression

- Bits, bytes and binary. ............ 3.1K WORDS
- Entropy and compression. ........... 5.1K WORDS
- Image compression. ................. 5.4K WORDS
- Cryptography. ...................... 3.4K WORDS
- How is data stored? ................ 4.9K WORDS

### 6 — Networking and The Web

- Sending and receiving data. ........ 3.0K WORDS
- How the internet works. ............ 3.7K WORDS
- What is a browser? ................. (in progress)

### 7 — Compilers and Interpreters

- What is code? ...................... (in progress)
- Compilers and interpreters. ........ (in progress)
- What makes code fast? .............. (in progress)

### 8 — Misc

- QR and barcodes. ................... 2.1K WORDS
- Quantum computing. ................. (in progress)

Note: Chapters with no word count are yet to be published / under construction.

The contents should feel like a **technical index**, not a conventional feature grid.

---

## 14. Chapter List Interaction

Recommended interaction:

```text
chapter row
    ↓ hover
small blue movement / underline
    ↓ click
chapter page
```

Rows should remain lightweight.

Example:

```text
01. Pixels and Color

01.01  How does a screen work?
01.02  Color spaces, models and gamuts
01.03  The problem of color contrast
...
```

Use typography and spacing rather than cards.

---

## 14b. TOC Structure Details

**[CONFIRMED from live site]** The Table of Contents has a specific structure:

```text
V1.0
Table of Contents.  ─────────────────────────────────  PROGRESS · WORDS
```

- `V1.0` is a tiny mono label above-left
- `Table of Contents.` is a serif heading with period, font-size ~1.8rem
- A long horizontal rule connects heading to right-side toggle
- `PROGRESS · WORDS` on the right is mono uppercase; `WORDS` is in blue and clickable

The chapter list is a **two-column CSS grid** (not an accordion):

```text
1. PIXELS AND COLOR           5. DATA AND COMPRESSION
  • How does a screen work?     • Bits, bytes and binary.
    .......................3.6K WORDS
```

- Section headers are mono uppercase: `1. PIXELS AND COLOR`
- Chapter rows use dotted leader lines to right-align word counts
- Word counts (`3.6K WORDS`) are mono, muted, ~11px
- Unpublished chapters have no word count, the leader line is still present but faint
- Hover on chapter row: text color → blue

---

## 15. Technical Diagram Animation

Where diagrams are animated, motion should reveal how something works.

Good motion:

- layers separating
- components moving along axes
- arrows drawing themselves
- vectors extending
- pixels appearing
- grids changing resolution
- highlighted regions propagating
- labels appearing after the object they describe

Avoid:

- generic fade-in animations everywhere
- large parallax effects
- bouncing objects
- excessive scroll-jacking

Animation should communicate **mechanism**.

---

## 16. Scroll Behavior

The website is designed around long scrolling.

Recommended:

- natural browser scrolling
- section-based reveals
- diagrams entering progressively
- subtle viewport-triggered animation
- no aggressive snap scrolling

For technical illustrations, scroll-linked animation can be used when it explains a process.

Example:

```text
scroll 0%
    component assembled

scroll 30%
    component separates

scroll 60%
    internal layer becomes visible

scroll 100%
    complete annotated explanation
```

The page should remain usable without animation.

---

## 17. Page Load

**[CONFIRMED from live site]** The page load animation materialises the site title.

In screenshot 1 (immediately after load) the `MAKING SOFTWARE` title appears with a **dissolving / glitch effect**: the letterforms are visible but partially rendered with dashed/dotted strokes — as if the pixel font is being drawn character by character with imperfect ink.

In screenshot 2 (shortly after) the title is fully solid blue.

Recommended recreation:

1. On DOMContentLoaded: hide page content (`opacity: 0`)
2. Show full-page overlay, background = `var(--background)`
3. The site title `MAKING SOFTWARE` is visible but each letter has:
   - `opacity` cycling 0→1 with staggered delays
   - A brief `letter-spacing` compression (tight → normal)
4. After ~600ms: reveal the rest of the page with a fade-in
5. No spinner, no bar — just the title materialising

```css
@keyframes letter-appear {
  0%   { opacity: 0; filter: blur(2px); }
  60%  { opacity: 0.6; }
  100% { opacity: 1; filter: blur(0); }
}
```

Each letter gets `animation-delay: calc(var(--i) * 40ms)` where `--i` is its index.

---

## 18. Early Access CTA

**[CONFIRMED from live site]** The CTA is NOT a newsletter subscription form. It is an **Early Access purchase section**.

Layout: two-column, same as editorial content blocks:

```text
LEFT (diagram area, grid paper background)
  FIG.006 — Cathode Ray Tube Display
  Annotated technical diagram:
    ELECTRON GUN
    ANODES
    DEFLECTING MAGNETS
    VACUUM TUBE
    ELECTRON BEAM
    THICK LEAD GLASS
    PHOSPHORESCENT COATING
    LIGHT (arrow pointing right)
  Label: [ CATHODE RAY TUBE DISPLAY ] rotated vertical-right
  Small annotation: ©1980

RIGHT (text)
  "Early Access"  (serif, ~1.4rem, bold)
  "You can now buy the book in early access. Just remember that
   it isn't finished yet - I'll be chipping away at it and
   releasing new chapters when they are ready."

  [ GET EARLY ACCESS ($99) ]  ← square-corner mono button, bordered

  "Want some free chapters? Join the mailing list"
   ("Join the mailing list" has a dotted underline, not the wavy one)
```

The button style:

```css
.btn-access {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: .1em;
  text-transform: uppercase;
  padding: 12px 20px;
  border: 1px solid var(--ink);
  border-radius: 0;  /* square corners */
  background: transparent;
}
```

The mailing list link uses a plain dotted underline (`text-decoration: underline dotted`) rather than the animated wavy SVG underline.

---

## 19. FAQ

The FAQ should continue the technical/manual metaphor.

Recommended interaction:

```text
QUESTION
────────────────────────────
When will it launch?                    +

QUESTION
────────────────────────────
Who is this for?                        +

QUESTION
────────────────────────────
What will the manual cover?             +
```

On activation:

```text
QUESTION
────────────────────────────
ANSWER TEXT
────────────────────────────
```

Avoid conventional accordion cards.

The plus/minus control should be tiny and typographic.

---

## 20. Footer

The footer should be sparse.

Include:

- Making Software
- author attribution
- relevant navigation
- social / external links
- privacy
- copyright

The footer should feel like the colophon of a book.

Possible conceptual structure:

```text
MAKING SOFTWARE

Written and illustrated by Dan Hollick.

Contents
About
Newsletter

© Making Software
```

---

## 21. Responsive Design

### Desktop

Use the full editorial compositions.

```text
≥ 1200px
```

- two-column diagrams
- large title
- generous whitespace
- asymmetric layouts
- large technical illustrations

### Tablet

```text
768px–1199px
```

- reduce side margins
- maintain two columns where useful
- reduce diagram scale
- simplify annotation density

### Mobile

```text
< 768px
```

Collapse everything into a single reading column.

Priority:

1. title
2. introduction
3. illustration
4. explanation
5. chapter navigation
6. CTA
7. FAQ
8. footer

Do not simply shrink desktop diagrams. Recompose them.

Technical annotations that become unreadable should be removed or repositioned.

---

## 22. Mobile Typography

Suggested starting values:

```css
body:
  font-size: 17px;
  line-height: 1.55;

h1:
  font-size: clamp(3rem, 15vw, 6rem);

technical-label:
  font-size: 10px–12px;
```

The title can wrap naturally.

Avoid forcing the logo into a single line on narrow screens.

---

## 23. Spacing System

Use generous vertical rhythm.

Suggested base unit:

```css
--space: 4px;
```

Useful scales:

```text
8px
16px
24px
32px
48px
64px
96px
128px
192px
```

Major sections can have 120–200px of vertical separation on desktop.

The large whitespace is part of the design, not unused space.

---

## 24. Borders and Rules

Use thin rules extensively.

```css
border: 1px solid rgba(23, 23, 23, .18);
```

Rules should resemble editorial print layout:

- section dividers
- chapter separators
- metadata separators
- footer rules
- diagram boundaries

Avoid thick UI borders.

---

## 25. Buttons

Buttons should be minimal.

Preferred:

```text
[ READ THE MANUAL → ]
```

or

```text
[ GET UPDATES ]
```

Style:

- monospaced text
- thin border
- square or nearly square corners
- transparent/white background
- blue hover state
- small arrow or typographic marker

Avoid pill-shaped buttons.

---

## 26. Interaction Principles

Every interaction should reinforce the site's physical-manual metaphor.

### Good

- handwritten highlight
- diagram annotation
- underline drawing
- chapter expansion
- technical object movement
- progressive disclosure
- subtle link color changes

### Avoid

- generic hover scaling
- excessive shadows
- large cursor effects
- glass panels
- decorative particle systems
- excessive parallax
- animated gradients

---

## 27. Cursor / Pointer

The normal browser cursor should be retained unless a custom cursor directly contributes to the interaction.

The website's personality comes from typography and diagrams, not cursor effects.

---

## 28. Accessibility

Maintain:

- semantic headings
- real text rather than text baked into images where possible
- keyboard-accessible chapter links
- visible focus states
- sufficient contrast
- reduced-motion support
- accessible form labels
- alt text for explanatory diagrams

For animated diagrams:

```css
@media (prefers-reduced-motion: reduce) {
  /* disable scroll-linked and decorative animation */
}
```

Do not make essential information dependent on animation.

---

## 29. Suggested Component Architecture

For a React / Next.js recreation:

```text
app/
├── page.tsx
├── chapters/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
│
components/
├── Header.tsx
├── Hero.tsx
├── TechnicalDiagram.tsx
├── EditorialSection.tsx
├── ChapterIndex.tsx
├── ChapterRow.tsx
├── HighlightLink.tsx
├── Newsletter.tsx
├── FAQ.tsx
└── Footer.tsx

styles/
├── globals.css
├── typography.css
├── diagrams.css
└── animations.css

public/
├── diagrams/
├── textures/
├── fonts/
└── illustrations/
```

---

## 30. Recommended Technology

The reference site has been identified by design galleries as using:

- Next.js
- Tailwind CSS
- Departure Mono
- New York

A close recreation can therefore use:

```text
Next.js
React
Tailwind CSS
SVG
CSS
Framer Motion / Motion
```

For highly technical diagrams:

```text
SVG → static diagrams
Canvas → complex interactive diagrams
CSS → simple transitions
Motion → scroll-linked animation
```

Do not introduce WebGL unless the specific diagram requires it.

---

## 31. Asset Strategy

### Typography

Acquire and self-host:

```text
Departure Mono
New York
```

Use `font-display: swap`.

### Diagrams

Prefer SVG.

Benefits:

- crisp at every resolution
- editable
- small for line-based drawings
- supports animation
- works well with technical annotations

### Grid

Prefer CSS-generated grid rather than image textures where possible.

---

## 32. Design Tokens

```css
:root {
  --background: #F8F9FC;
  --surface: #FFFFFF;

  --ink: #171717;
  --muted: #777777;
  --muted-light: #848484;

  --blue: #324CC3;
  --blue-light: #93A8F4;
  --blue-soft: #EAEBF8;
  --blue-bright: #6C94FC;

  --rule: rgba(23, 23, 23, 0.18);

  --grid-size: 16px;

  --font-mono: "Departure Mono", monospace;
  --font-serif: "New York", Georgia, serif;

  --page-width: 1600px;
  --page-padding: clamp(20px, 5vw, 96px);
}
```

---

## 33. Visual Quality Checklist

Before considering a recreation complete:

- [ ] Background is almost white, not pure white.
- [ ] Blue is used as a controlled accent.
- [ ] Title feels pixel/technical.
- [ ] Serif body copy creates editorial contrast.
- [ ] Diagrams dominate the visual identity.
- [ ] Illustrations use thin technical linework.
- [ ] Grid paper appears selectively.
- [ ] Layout feels like a printed technical manual.
- [ ] Sections have generous whitespace.
- [ ] There are very few cards.
- [ ] Buttons are not pill-shaped.
- [ ] Interactive links use the hand-drawn blue underline effect.
- [ ] Chapter navigation feels like an index.
- [ ] Motion explains systems rather than decorating them.
- [ ] Mobile recomposes diagrams rather than merely shrinking them.
- [ ] Reduced-motion mode is supported.
- [ ] The page remains readable without JavaScript-driven animation.

---

## 34. Overall Design Formula

The simplest way to reproduce the visual identity is:

```text
technical manual
        +
editorial book layout
        +
pixel/mono typography
        +
serif reading text
        +
blue engineering diagrams
        +
graph-paper grids
        +
large whitespace
        +
small human touches
        =
Making Software aesthetic
```

The key is **restraint**. The site works because a small number of visual ideas are repeated consistently: paper, blue ink, mono labels, serif explanations, diagrams, rules and whitespace.

---

## 35. Reference Notes

The site is consistently described by design galleries as:

- minimal
- monochromatic / blue-and-white
- retro
- editorial
- technical
- isometric
- typographic
- illustration-driven
- long-scrolling
- built with Next.js / Tailwind

The distinctive blue wavy text-highlight interaction has also been independently documented as a notable detail of the site.

The chapter index currently exposes 8 sections and 45 chapters, establishing that the site is not merely a promotional landing page but a browsable reference-manual interface.

