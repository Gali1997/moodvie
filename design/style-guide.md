# Moodvie — Style Guide

## Overview
Moodvie's visual language draws from independent cinema — dark theaters, golden light, textured surfaces, and typographic restraint. Every design decision reinforces the metaphor: you're walking into a private screening room, not opening an app.

The design is built in vanilla HTML/CSS/JS with no framework. Animations use GSAP + ScrollTrigger on the landing page and CSS transitions/keyframes on the app page.

---

## Colour Palette

### Primary

| Name     | Hex       | Role                                         |
|----------|-----------|----------------------------------------------|
| Black    | `#080808` | Primary background. The theater walls.       |
| Gold     | `#c9a84c` | Primary accent. Headings, borders, CTAs.      |
| Cream    | `#f0ece4` | Body text. Warm white, never pure `#fff`.     |

### Secondary

| Name     | Hex       | Role                                         |
|----------|-----------|----------------------------------------------|
| Crimson  | `#8b1a1a` | Deep red accent. Curtains, subtle gradients.  |
| Muted    | `#6b6460` | Secondary text, labels, disabled states.      |
| Deep     | `#050302` | Darker-than-black for gradients and depth.    |
| Amber    | `#b4761e` | CTA hover gradients, warm gold transition.    |

### Usage rules
- Gold is used sparingly — accent only. If everything is gold, nothing is.
- Backgrounds use radial gradients mixing black → deep → ink (`#1a0f08`) for warmth. Never flat black.
- Borders are always `rgba(201,168,76, 0.15–0.55)` — gold at low opacity. Never grey.
- Text links: gold with a 1px underline at reduced opacity, full opacity on hover.

### Landing page extended palette
The landing page uses slightly different gold/cream values for the heavier blend-mode work:

| Name   | Hex       | Context               |
|--------|-----------|----------------------|
| Gold   | `#d4a84a` | Landing headings     |
| Cream  | `#f1e3bf` | Landing body text    |
| Ink    | `#1a0f08` | Warm gradient midpoint|

---

## Typography

### Fonts
- **Playfair Display** (serif) — headlines, movie titles, the Moodvie wordmark, ticket text, anything with emotional weight
- **Inter** (sans-serif) — body text, labels, eyebrows, meta information, UI elements

Both loaded from Google Fonts:
```
Playfair Display: 400, 400i, 500, 500i, 700, 700i, 900
Inter: 300, 400, 500, 600
```

### Type scale

| Element              | Font        | Size                        | Weight | Style    | Tracking       |
|---------------------|-------------|------------------------------|--------|----------|----------------|
| Hero headline       | Playfair    | `clamp(3rem, 8.6vw, 8.8rem)`| 400    | Normal   | `-0.012em`     |
| Hero headline em    | Playfair    | inherit                      | 400    | Italic   | inherit        |
| Section headline    | Playfair    | `clamp(2.4rem, 5vw, 4.4rem)`| 400    | Normal   | `-0.012em`     |
| Movie title         | Playfair    | `1.7rem`                     | 700    | Italic   | default        |
| Body text           | Playfair    | `1.15rem`                    | 400    | Normal   | default        |
| App body text       | Inter       | `0.92rem`                    | 300    | Normal   | default        |
| Eyebrow labels      | Inter       | `0.55rem`                    | 400    | Normal   | `0.45–0.55em`  |
| Meta/labels         | Inter       | `0.5–0.55rem`                | 300-400| Normal   | `0.38–0.42em`  |
| Nav wordmark        | Playfair    | `1.3–1.4rem`                 | 700    | Normal   | `0.2–0.32em`   |
| Buttons (CTA)       | Inter       | `0.6–0.7rem`                 | 500    | Normal   | `0.4em`        |

### Type rules
- Headlines always use Playfair. If the line has emotional emphasis, use `<em>` with `font-style: italic; color: var(--gold)`.
- Body copy is always Inter at weight 300 (light) on the app page, Playfair at 400 on the landing/about pages.
- All-caps labels use Inter with very wide tracking (`0.4em+`). These are the "eyebrow" elements — small, gold, uppercase. Usually preceded by a gold horizontal line (`::before` pseudo-element, 24–38px wide, 1px tall).
- Line height: 0.94–1.05 for headlines, 1.7–1.85 for body.

---

## Iconography

Moodvie uses no icon library. All icons are inline SVGs with `stroke="currentColor"` and `stroke-width="1.5"`. This keeps them light and consistent with the line-art aesthetic.

### Icon style
- Stroke only, no fills (except the play triangle)
- 1.5px stroke weight
- Sized 13–18px depending on context
- Color inherits from parent (`currentColor`)

### Common icons
- **Arrow right** — CTA buttons: `M5 12h14M12 5l7 7-7 7`
- **Bookmark** — Watchlist: `M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z`
- **Play** — Trailer button: `M8 5v14l11-7z` (filled, exception to stroke rule)
- **Close (✕)** — Modals: text character, not SVG

### Decorative SVGs (landing page)
Each "How it works" scene has a large SVG illustration:
- Scene 1 (Mood): Speech bubble with text lines
- Scene 2 (Match): Concentric pulse rings radiating from center
- Scene 3 (Watch): Spinning film reel with rotating animation

These use the `.stroke` class (`stroke: rgba(212,168,74,0.55); stroke-width: 1; fill: none`) and `.gold-fill` for accent dots (`fill: rgba(212,168,74,0.18)`).

---

## Layout & Spacing

### Grid
No formal grid system. Layouts use flexbox and CSS grid where needed:
- Landing page story scenes: `grid-template-columns: auto 1fr` (number + content)
- App result card: flexbox with poster left, info right
- Max content width: `720–780px` for text sections, `1200–1300px` for wider layouts

### Spacing scale
Spacing is done in `rem` and `vh/vw` units, not a strict scale. General patterns:
- Section padding: `14vh 6vw` (landing), `2.25rem 3rem` (app nav)
- Between elements: `1.2–2rem` typical
- Large gaps between sections: `6–8rem` or `14vh`
- Inner card padding: `1.4–2.4rem`

### Borders
- Section dividers: `1px solid rgba(201,168,76, 0.15–0.22)`
- Cards/tickets: `1px solid rgba(201,168,76, 0.18–0.55)` with a nested inner border (pseudo-element) at lower opacity
- Dashed lines: `1.5px dashed rgba(201,168,76, 0.18–0.32)` for ticket perforations

### Border radius
- Nearly zero everywhere: `1–4px` max
- The design is angular, not rounded. This is a cinema ticket, not a chat bubble.

---

## Textures & Effects

### Film grain
A fixed-position SVG noise overlay covers the entire viewport:
- `opacity: 0.04–0.08`
- `mix-blend-mode: overlay`
- Animated with `steps()` to simulate real film grain movement
- `pointer-events: none` — purely decorative

### Radial gradients
Backgrounds are never flat. Common patterns:
- `radial-gradient(ellipse at center, #1a0f08 0%, #050302 60%, #000 100%)` — warm center fade
- Accent glows: `radial-gradient(circle at 20% 30%, rgba(212,168,74,0.08), transparent 50%)` — subtle gold warmth

### Box shadows
Heavy, cinematic shadows on cards and posters:
```css
box-shadow:
  0 30px 60px rgba(0,0,0,0.6),
  0 0 40px rgba(201,168,76,0.1),
  inset 0 0 60px rgba(0,0,0,0.4);
```

### Custom cursor
Two-part cursor replacing system default:
- Outer ring: 36px, gold border, `mix-blend-mode: difference`
- Inner dot: 5px, solid gold
- Expands to 60–70px on interactive elements
- Smooth follow with `requestAnimationFrame` lerp

---

## Interactive Elements

### Buttons (primary CTA)
- Gold border, transparent background, crimson tint (`rgba(122,24,24,0.18)`)
- On hover: gold gradient slides in from left (`translateX(-101% → 0)`)
- Text inverts to dark on hover
- Uppercase Inter, wide tracking

### 3D Poster tilt
Movie poster responds to mouse position with `perspective(800px) rotateY/rotateX`. Scale bumps to 1.03 on hover. Returns to flat on mouse leave.

### 3D Ticket unfold
The golden ticket starts folded (`rotateX(-90deg)`) and unfolds toward the viewer with a bounce overshoot. After unfolding:
- A gold light sweep glides across the surface
- Border glow fades in
- Mouse tilt becomes interactive (±14deg Y, ±10deg X)

### Poster ring (landing page)
14 TMDB top-rated posters arranged in a 3D cylinder (`translateZ(540px)`):
- Draggable with momentum/inertia
- Auto-rotates when idle
- Depth-of-field blur on distant posters
- Mouse parallax tilts the entire ring stage
- Click any poster → spotlight modal with film details

---

## Component Patterns

### Eyebrow label
The repeated small-caps gold label with a line:
```css
font-family: var(--sans);
font-size: 0.55rem;
font-weight: 400;
letter-spacing: 0.55em;
text-transform: uppercase;
color: rgba(212,168,74,0.85);
```
With `::before` pseudo: `width: 38px; height: 1px; background: rgba(212,168,74,0.7)`

### Double-border card
Cards have an outer border and an inner border (via `::before` pseudo-element at `inset: 0.35–0.6rem`). This creates a subtle ticket/frame effect.

### Mood match badge
SVG circle ring with `stroke-dasharray/offset` fill animation. Percentage inside. Sub-text varies by score ("A scary-good fit" / "Hits the exact spot" / "A strong match").

### Cinema ticket stub
3D golden ticket with perforation holes, main section (title, mood quote, date/seat/number), and tear-off stub end. Unfolds in 3D on result load.

---

## Tone of Voice (recap)

| Do                                    | Don't                                     |
|---------------------------------------|-------------------------------------------|
| "Find the film your mood deserves"    | "Discover personalized recommendations"   |
| "Type how you feel"                   | "Enter your preferences"                  |
| "One film. A real reason why."        | "AI-curated selection based on analysis"  |
| "made by Galina"                      | "© 2026 Moodvie Technologies"             |
| "film"                                | "content"                                 |
| "mood"                                | "preference" or "input"                   |
| Short, direct, warm                   | Corporate, feature-listy, buzzwordy       |

---

## File Structure

```
moodvie/
├── landing.html      — Landing page (3D ring, curtain intro, how it works)
├── index.html        — App page (mood input → AI → result)
├── about.html        — Personal note from the maker
├── style.css         — App styles
├── app.js            — App logic (AI, TMDB, render, ticket, ritual)
├── hero3d.js         — Three.js hero canvas (app page)
├── config.js         — API keys
├── firebase-config.js— Firebase auth config
└── design/           — Design documentation (this folder)
```
