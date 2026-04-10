# Moodvie — Homepage Mockup

## Note
There is no static mockup image. The homepage **is** the mockup — it's a fully interactive, production-ready page built directly in code.

This was intentional. The design relies heavily on motion, 3D interaction, and scroll-driven animation that can't be communicated in a flat image. A Figma board would have been a lie about what the experience actually feels like.

## How to view
Open `landing.html` in a browser. That's the homepage.

## Page flow (what you'll see)

### 1. Cinematic intro (0–4s)
- Black screen
- "Moodvie Presents" fades in, italic serif, gold text
- Subtitle: "Movies that meet you where you are."
- Red theatre curtains pull apart (repeating gradient texture, scale transform)
- Gold-fringed valance rises out of frame
- Screen dims → hero revealed

### 2. Hero section
- **3D poster ring**: 14 real movie posters from TMDB arranged in a cylinder
  - Draggable left/right with momentum and inertia
  - Auto-rotates slowly when idle
  - Depth-of-field blur on distant posters
  - Front poster gets gold border glow + title overlay
  - Click any poster → spotlight modal
- **Headline** overlaid with `mix-blend-mode: screen`:
  - "Find the film" (cream)
  - "your mood deserves." (gold italic)
  - Letters animate in one by one
- **Audience silhouettes** at bottom (SVG heads + shoulders)
- **Mouse parallax** tilts the entire 3D ring stage
- **Cinema screen frame** with gold corner brackets
- Drag hint + scroll cue fade in last

### 3. How it works (pinned scroll section)
Three fullscreen scenes, pinned and scrolled through:

**Scene 01 — Mood**
- Giant italic gold "01" on the left
- "Type how you feel. However it comes out of you."
- Speech bubble SVG illustration on the right
- Body: "A single word. A messy paragraph. An oddly specific Sunday night..."

**Scene 02 — Match**
- Giant "02"
- "Our AI reads between the lines of what you wrote."
- Concentric pulse rings SVG
- Body: "Not keywords. Not your watch history. Not what's trending..."

**Scene 03 — Watch**
- Giant "03"
- "One film. A real reason why. Where to watch it."
- Spinning film reel SVG
- Body: "A single recommendation — with the poster, the trailer..."

**Navigation aids:**
- Side progress indicator (01 · Mood / 02 · Match / 03 · Watch)
- Bottom progress fill bar
- Background gradient shifts per scene

### 4. CTA section (final screen)
- "Your turn" eyebrow
- "So — what are you feeling tonight?" headline
- "Tell Moodvie how you feel, in your own words..." subtext
- "Find My Film →" button (gold gradient hover fill)
- Footer: "Moodvie · made by Galina"

### 5. Navigation
- Fixed top bar with `mix-blend-mode: difference`
- "MOODVIE" wordmark (left)
- "About" + "Try it" links (right) with animated gold underline on hover

## How the design was built

This design was not built from a mockup. It was built iteratively through a feedback loop:

1. **Reference gathering** — Found 4 sites that had the right energy (sloshseltzer, buttermax, chirpley, scroll-driven-animations.style)
2. **First pass** — Built a scroll-driven page with stacking cards and a horizontal poster marquee
3. **Feedback: "ok not bad... but I want something wow"** — Rebuilt hero as a draggable 3D poster ring
4. **Feedback: "not bad, could be even better like the websites I showed"** — Added cinematic intro (curtains, audience), Lenis smooth scroll, fullscreen story scenes with massive typography
5. **Feedback: "ew" at wording, "the how it works nah"** — Rewrote all copy to be direct and human. Dropped pretentious language ("picture", "reel")
6. **Feedback: "the lights are down come on man lol"** — Rewrote CTA to be conversational
7. **Feedback: "love loveee the part when you get the movie... it's fun I love fun stuff"** — Added ticket stub, mood match badge, ritual suggestions

The final design is the result of ~7 major iterations driven entirely by gut-level feedback ("ew", "love", "wow", "come on man"). No wireframes. No design system document created upfront. The style guide was written after the fact to document what emerged.

This is a valid design process. Arguably a better one for a solo builder — because the decisions were made looking at real, interactive output, not static rectangles.
