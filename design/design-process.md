# Moodvie — Design Process

## How this design actually happened

This wasn't a linear process. There was no wireframe → mockup → build pipeline. The design emerged through a loop of building, looking, reacting, and rebuilding. Here's the real timeline.

---

## Phase 1: References & gut feeling

Before writing any code, I collected sites that made me *feel* something:

- **sloshseltzer.com** — A seltzer brand that looks like a film studio. Massive typography, scroll choreography, dramatic reveals. Proved that a simple product can feel premium.
- **buttermax.net** — Custom WebGL, cinematic transitions. Every pixel is intentional. This is what "wow" looks like.
- **chirpley.ai** — Bold 3D hero, interactive elements that make you want to scroll down.
- **scroll-driven-animations.style** — Technical reference for what's possible with scroll-driven animation.

I didn't take specific elements from these. I took the *energy*. The feeling of "someone cared about every detail here."

**What I learned:** The bar for "premium" on the web is higher than I thought. It's not about color choices — it's about motion, timing, and restraint.

---

## Phase 2: First build — "not bad but not wow"

**What I built:** A scroll-driven landing page with horizontal poster marquee and stacking story cards explaining how the app works.

**What was wrong:** It looked like a template. The stacking cards felt generic. The marquee was fine but forgettable. Nothing made you stop scrolling.

**The feedback that changed everything:** *"It's ok, not bad... but I want something WOW."*

**Decision:** Kill the safe approach. Build something interactive and 3D.

---

## Phase 3: The 3D poster ring — "now we're talking"

**What I built:** A draggable 3D carousel of real movie posters (fetched from TMDB API). 14 posters arranged in a cylinder in CSS 3D space. You can grab and spin it. Click any poster for a spotlight modal with details.

**What made it work:**
- Depth-of-field blur on distant posters (they get blurry as they rotate away)
- The front poster gets a golden border glow
- Momentum and inertia on drag — it keeps spinning when you let go
- Mouse parallax tilts the entire ring stage

**But it still wasn't enough.** The ring was cool, but the page around it was ordinary.

---

## Phase 4: The cinematic intro — "this is a movie theater"

**What I added:**
- A "Moodvie Presents" title card that fades in on a black screen
- Red theatre curtains that physically pull apart (CSS repeating gradients for the fabric texture)
- A gold-fringed valance that rises
- Audience silhouettes that slide up from the bottom
- The headline letters animate in one by one

**Why it worked:** It committed fully to the cinema metaphor. You're not loading a website — you're walking into a theater. The 4-second intro builds anticipation instead of showing everything at once.

---

## Phase 5: Scroll storytelling — "how it works, but make it cinematic"

**Problem:** The "how it works" section was three small cards. Boring. Didn't match the energy of the hero.

**What I built:** Three fullscreen pinned scenes that you scroll through:
- Giant italic gold numbers (22vw) on the left
- Line-by-line headline reveals
- SVG illustrations per scene (speech bubble, pulse rings, spinning film reel)
- Side progress indicator
- Bottom progress fill bar
- Background gradient shifts per scene

**Added Lenis smooth scroll** — this was the single biggest quality-of-life improvement. Buttery smooth scrolling makes everything feel 2x more expensive.

---

## Phase 6: Copy — the hardest part

Design isn't just visual. The words matter as much as the pixels.

**Things that got rejected:**
- "How a picture finds you" → *"ew"* — too pretentious
- "The lights are down. The reel is cued." → *"come on man lol"* — too theatrical
- "Three moods. Three films we picked." → removed entirely — felt like filler
- The word "picture" in general → replaced with "film" everywhere

**Things that survived:**
- "Find the film your mood deserves."
- "Type how you feel. However it comes out of you."
- "Our AI reads between the lines of what you wrote."
- "One film. A real reason why. Where to watch it."

**What I learned:** Good copy sounds like something a person would actually say. If you wouldn't text it to a friend, it doesn't belong on the page.

---

## Phase 7: The result page — "make it fun"

**The brief:** *"When they get the movie rec it shows the trailer, it needs to show where they can watch it, and something fun."*

**What I added:**
1. **Movie metadata** — tagline, runtime, genres, rating, director, top cast (all from TMDB API, fetched in parallel)
2. **Where to watch** — streaming provider logos with multi-region fallback (MK → US → GB)
3. **Mood match badge** — SVG circle ring that fills to a percentage (88-99%), with sub-text that varies ("A scary-good fit" / "Hits the exact spot")
4. **"Before the film" ritual** — three italic suggestions picked per film (e.g. "Pour something warm / Dim every light / Phone face down"). Like an usher's note.
5. **Golden cinema ticket** — a 3D interactive souvenir stub that unfolds toward you when the result loads. Shows the film title, your mood quoted, today's date, a faux seat number. Tilts with your mouse like a hologram.

**The ticket is the thing people will screenshot.** It's the most "Moodvie" element on the whole site — it takes the cinema metaphor all the way to the physical souvenir.

---

## Phase 8: The about page — "be real"

**The brief:** *"I want to write what this is, why I made it, no charge."*

**First draft problems:**
- A "$0 / Always free / No ads · No catch · No upsell" badge → *"the no catch no stuff card is cringy remove it"*
- Copy was too polished, didn't sound like a real person

**What worked:** Being genuinely honest:
- Admitting this is a learning project
- Acknowledging that you could just use ChatGPT for the same thing
- Explaining why this exists anyway (focused, one answer not forty, feels like something)
- A quiet coffee link instead of a badge

---

## Design principles that emerged

These weren't written down at the start. They revealed themselves through the iterations:

1. **Commit to the metaphor.** Half-cinema looks worse than no-cinema. Curtains, tickets, audience silhouettes, film grain, golden light — all or nothing.

2. **Movement earns attention.** The curtain intro, the ring spinning, the ticket unfolding — each animation creates a *moment*. Remove any one and the page feels flatter.

3. **Less gold is more gold.** Early versions had too much gold. It became noise. The final design uses gold sparingly — an eyebrow label here, an italic word there — so each hit of gold feels intentional.

4. **Copy is design.** Changing "picture" to "film" and "the lights are down" to "what are you feeling tonight" didn't change any pixels, but it changed how the whole site felt.

5. **Trust your taste.** The best design decisions were gut reactions: "ew", "love", "come on man." Not every decision needs a rationale. Sometimes "this doesn't feel right" is the most useful feedback there is.

---

## Tools used

- **Claude Code** — AI pair programmer, built everything through conversation
- **Vanilla HTML/CSS/JS** — no framework, no build tools (except a tiny bash script for deployment)
- **GSAP + ScrollTrigger** — scroll-driven animations on the landing page
- **Lenis** — smooth scroll library
- **TMDB API** — movie data, posters, trailers, streaming providers
- **Groq API** (Llama 3.3 70B) — AI mood analysis and film matching
- **Cloudflare Pages** — hosting
- **GitHub** — version control

---

## What I'd do differently next time

1. **Start with the copy.** I rewrote the words three times. If I'd nailed the tone first, the design would have followed faster.
2. **Set up deployment earlier.** We built locally for a long time before deploying. Seeing it live on a real URL changes how you evaluate it.
3. **Kill darlings faster.** The marquee strip, the examples section, the free badge — all got built and then removed. That's fine, but I could have felt the "no" earlier.
