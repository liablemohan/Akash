# Remaking patra.html — Identical to makingsoftware.com

## What we observed on the live site

From the browser screenshots the real site differs from the current `patra.html` in several **key structural ways**:

### Real site layout (confirmed from screenshots)

| Section | What it actually is |
|---|---|
| **Header** | Top-left: big pixel "MAKING SOFTWARE" title (blue, Departure Mono). Top-right: two lines of right-aligned serif text: *"A reference manual…"* / **Written and illustrated by Dan Hollick.** No nav links visible in header |
| **Separator** | A full-width row of ░ (light stippled dashes) in blue, separating header from body |
| **Hero body** | Two-column split: LEFT = serif body text with a large drop-capital "H" + inline SVG diagrams (FIG. 002, FIG. 003…). RIGHT = a large exploded isometric diagram (floppy disk, 3.5" FLOPPY DISK label rotated vertically). Annotated with DUST LINER, TOP SHELL, MAGNETIC DISK, HD NOTCH, etc. |
| **Rotated FIG labels** | Small mono labels (`FIG.001`, `FIG.002` etc.) rotated 90°, positioned on left margin |
| **Rotated section label** | `[ 3.5" FLOPPY DISK ]` rotated 90° on the far right |
| **Background** | Very light blue-gray (`#E8ECF5` approx), NOT white |
| **Section separator** | A full-width row ░░░░ MAKING SOFTWARE ░░░░ between sections |
| **Editorial / about section** | Two-column: LEFT = FIG.004 (Bézier curve). RIGHT = 4 serif paragraphs of editorial copy |
| **Early Access CTA** | NOT a newsletter form. Left = FIG.006 (cathode ray tube diagram). Right = serif `Early Access` heading + body copy + `GET EARLY ACCESS ($99)` button (square, mono, bordered) + `Want some free chapters? Join the mailing list` (with dotted underline link) |
| **Table of Contents** | Headed with `V1.0` / `Table of Contents.` + long rule + `PROGRESS · WORDS` toggle. TWO-COLUMN grid of 8 sections. Section headers in MONO UPPERCASE (e.g. `1. PIXELS AND COLOR`). Chapter rows use dotted leader lines (…………) to right-aligned `3.6K WORDS` mono labels. Under-construction chapters show no word count |
| **Page load** | The title "MAKING SOFTWARE" appears to animate/materialize; in scroll-1 screenshot the letters are rendered with a "glitch/dissolving" dashed-stroke effect showing through the letterforms |
| **Background gradient** | Subtle top-to-bottom: lighter at top, slightly more blue at bottom edges |

---

## Changes to patra.md

Update `patra.md` with the **confirmed** technical facts from browser inspection:

1. Section 3.1: Background is `~#E8ECF5` (light blue-grey), not pure `#F8F9FC`
2. Section 7: The hero is NOT a "title left / diagram right" split — it is a **manuscript/editorial** split where the LEFT is continuous body text interleaved with diagrams (FIG.001, FIG.002…) and the RIGHT is one large annotated floppy-disk diagram
3. New section: **Separator strips** — the site uses a repeating pattern of ░ characters (light blue stipple) as section separators, with "MAKING SOFTWARE" centered in the middle strip
4. New section: **Figure labels** — vertical monospaced `FIG.001` labels rotated 90° on the left margin, and vertical section labels on the right
5. Section 18/CTA: The CTA is NOT a newsletter form — it is an **Early Access** purchase section with `GET EARLY ACCESS ($99)` button
6. Section 13: Table of Contents uses a **two-column grid** (not an accordion), dotted leader lines to word counts, `PROGRESS · WORDS` toggle
7. Actual real chapter titles confirmed (matching browser content)

---

## Changes to patra.html

### Structure overhaul

1. **Header**: Large pixel-font `MAKING SOFTWARE` left; right-aligned descriptor text, right. Remove nav links from header.
2. **Stipple separator**: A `<div class="stipple-row">` — full-width repeating `░` characters
3. **Hero section**: Two-column: LEFT = editorial body text with inline SVG diagrams; RIGHT = large floppy-disk annotated diagram. Vertical `FIG.00x` labels on left margin.
4. **About section**: Two-column: LEFT = Bézier curve diagram; RIGHT = 4 editorial paragraphs
5. **Section break with centered title**: `░░░ MAKING SOFTWARE ░░░`
6. **Early Access CTA**: LEFT = Cathode Ray Tube diagram; RIGHT = `Early Access` + body text + bordered button + mailing list link
7. **Table of Contents**: Two-column grid, dotted leaders, word counts, `PROGRESS · WORDS` toggle
8. **Footer**: sparse, book-colophon style

### Visual corrections

- Background: `#E8ECF5` (or close approximation)
- Drop capitals on first paragraphs
- Rotated FIG labels via `writing-mode: vertical-rl; transform: rotate(180deg)`
- Stipple rows using a repeating `░` character, light blue opacity
- Dotted leader lines in TOC (CSS border-bottom dotted or `::after` content trick)
- `GET EARLY ACCESS ($99)` button — square corners, mono, bordered

### Animations to implement

- **Page load**: Title "MAKING SOFTWARE" materialises with a typewriter / dissolve effect using CSS `animation` on individual letter opacity + clip
- **Scroll reveals**: Content sections fade + slide up on IntersectionObserver
- **TOC hover**: Chapter rows translate right + color to blue
- **Wavy underline** (existing `.hl` class): Keep as-is — SVG path drawn left→right on hover

---

## Verification Plan

1. Open `patra.html` in browser side-by-side with live site screenshot
2. Check header layout, separator, hero two-column split
3. Verify drop capitals render
4. Confirm TOC columns, dotted leaders, word counts
5. Test hover states (underline, TOC translate)
6. Test page load animation
