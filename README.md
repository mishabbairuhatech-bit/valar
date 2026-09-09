# Velar

A Next.js recreation of the reference animation — a real-estate landing page built
around one photograph, a pinned statement panel, and a hover-driven gallery.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## How the scroll is put together

The whole page is one scroll choreography, in four beats:

1. **Hero.** Three rates at once: the sky and the headline scroll away with the page,
   while the building is welded to the viewport — so it is already drifting down
   against the rising sky — and then slides down the screen as well. It is painted
   over the statement panel and under the gallery, so it crosses the second section on
   its way down and the third one swallows it. `IRREPLACEABLE` is set on one line
   spanning the full gutter-to-gutter measure.
2. **Statement.** A dark panel climbs over the pinned photograph and then sticks
   (`position: sticky`) — the copy and the three figures hold still while the page
   keeps moving underneath them.
3. **Gallery.** Its approach is compressed. Left to scroll normally its top edge would
   take a full viewport to climb the pinned panel, wiping across the copy on the way;
   instead it rises naturally until it meets the bottom of the panel and then covers the
   screen in about a quarter of that distance. The panel's copy fades out ahead of it, so
   the rising edge never slices a line of text. Only the paint position moves — layout is
   untouched, so the section after it keeps its place and the hand-off needs no spacer.

   The curve is a **cubic Hermite pinned at both ends**, not a power curve: it leaves the
   panel already matching the speed the section was rising at, peaks near 4.8x in the
   middle, and arrives at the top with its gradient back at zero. A power curve gets there
   just as fast but starts at 16x the scroll rate, which reads as a lurch at the moment of
   contact. Measured live:

   | natural top | 1000 | 960 | 920 | 880 | 840 | 800 | 760 | 720 | 680 |
   |---|---|---|---|---|---|---|---|---|---|
   | speed | 1.00x | 1.00 | 1.69 | 3.36 | 4.40 | 4.76 | 4.44 | 3.45 | 1.79 |

   It also runs its own rAF rather than waiting on scroll events — under smooth scrolling
   an event-driven transform lands a frame late and stutters. `TAKEOVER`, `FADE_FROM` and
   `FADE_SPAN` in `app/components/Gallery.tsx` tune it.

   On a phone the marquee is lifted out from behind the rail: through 4px gaps it only
   ever showed as white slivers, which read as noise rather than type, so it takes its own
   band above the frames at a legible size. The tapped frame also grows further there
   (`flex-grow: 4`) since there is no hover to preview with — one tap has to carry the
   section. Five frames sit flush across the viewport at equal width. Hovering one
   grows it to ~3.9× its siblings and drops an amber rule along its bottom edge; a
   very large marquee runs behind them and is only ever glimpsed through the gaps.
4. **Rooms that endure.** A white section: a one-line headline set in the same extended
   face as the hero, over a bowed strip of interiors that travels sideways as you
   scroll — see below.
5. **Footer.** Back to dark: wordmark and a hairline lit at both ends in the accent
   amber, tracked uppercase nav and socials to the right, a wide-tracked line holding
   the middle, and a split base — booking on the left, legal on the right.

The header is fixed for the whole ride and flips ink→paper over 0.3s the moment a dark
panel passes under it — it walks the `data-tone` markers in `page.tsx` and takes the
last one it has passed (`app/components/Header.tsx`).

The statement's sticky range is scoped to the `.stack` wrapper around it, the reveal gap
and the gallery. Left unscoped it stays pinned behind every later section, and a
subpixel seam at a section join lets its text show through.

Smooth scrolling comes from [Lenis](https://github.com/darkroomengineering/lenis);
`prefers-reduced-motion` turns it — and every transition — off.

## The hero layers

`hero-sky.jpg` and `hero-building.webp` are cut from one 4096 × 2304 frame, so a single
`object-fit: cover` / `object-position: 47% 0%` keeps them in register — only the
building carries a transform.

Its timing is measured off the reel — the sky's lower edge gives the scroll position and
the lamp head gives the travel:

| hero progress | 0.53 | 0.61 | 0.70 | 0.82 |
|---|---|---|---|---|
| travel (vh) | 9.2 | 24.2 | 41.2 | 50.9 |

A hold to just under halfway, then a quick ramp — `1 − (1 − t)^1.6` over
`p ∈ [0.47, 0.85]`, which fits within ~3vh at every sample — carrying it to 48vh, the
point where the roofline is crossing the figures on the panel below.

From there it runs rather than parks. A linear term picks up the speed the ramp was
carrying and a squared term keeps building on it, so it leaves at nearly twice the
scroll rate and is a full viewport clear by `p ≈ 1.3` — well before the gallery arrives
at `p ≈ 1.9`. (The reel keeps a sliver of roofline at the bottom edge until the gallery
covers it; seeing itself out was asked for.)

There is no fade: the building is occluded or gone, never dissolved, which is why paint
order matters — sky 0, hero copy 1, statement 2, **building 3**, gallery 4. Every
constant is named at the top of `app/components/HeroMedia.tsx`.

The supplied cut-out had the lamp knocked out along with the sky, so it is composited
back in from the original frame before both layers are graded and resized.

## The bowed carousel

Measuring the reference showed the frames keep a constant width (265px) and a constant
pitch (277px) all the way across, while their heights grow from 310px in the middle to
~390px at the edges. That rules out a 3D ring — perspective would widen the outer cards
too. It is a **vertical-only warp**: a flat strip bowed by

```
s(u) = 1 + 1.032 · u²        u = (x − centre) / viewportWidth
```

A per-card `scaleY` would step at every card edge and break the arc. Instead each card
carries a projective `matrix3d` that pins its left and right edges to their laid-out x
while stretching those two edges by `s(left)` and `s(right)`, so neighbouring cards meet
on one continuous curve. Eight frames wrap modulo the strip length, so it reads as
endless; the offset is driven by the section's scroll progress and eased each frame, which
lets the strip glide on for a beat after the wheel stops.

`app/components/StudioCarousel.tsx` holds the maths; `BOW` controls how hard the band
bends and `TRAVEL` how many cards pass during one traverse of the section. Card size is
`--card-w` / `--card-h` on `.studio`; the arc adapts to whatever you set.

Progress runs from *the section's top entering at the bottom of the window* to *its own
bottom leaving past the top*, so the strip keeps travelling for as long as any part of
the section is on screen. Ending the range at the section's own bottom instead makes it
stall the moment the next section appears underneath.

## Type

The reference sets its display line in an ultra-extended grotesque. The closest freely
available face is **Anybody**, whose width axis is pushed to its maximum (`wdth 150`)
and then stretched the remaining ~32% with `scaleX`, with the weight pulled back to
`670` so the stems stay the right thickness after the stretch. Measured against the
source frames the headline now matches letter-for-letter (567px of ink across a
640px-wide reference frame).

- Display / headline / marquee — **Anybody**
- Wordmark and the hero caption — **Outfit** (geometric, single-storey `a`)
- Prose and figures — **Helvetica Neue**, falling back to **Inter**

## Layout units

Every measurement in `app/globals.css` is derived from the reference frames, which are
640 × 466. Horizontal values are `px / 640 × 100` in `vw`; vertical values are
`px / 466 × 100` in `vh`. That keeps the composition proportional at any window size
instead of only matching at one width.

## Assets and the two liberties taken

- `public/img/hero-sky.jpg`, `public/img/hero-building.webp` — the supplied separated
  layers, lamp restored and colour-matched to the reference frames.
- `public/img/estate-1..5.jpg` — the reference's five gallery photographs are only ever
  shown as narrow crops, so they could not be recovered. These are Unsplash
  architecture shots graded to the same blue-hour palette.
- `public/img/interior-1..8.jpg` — likewise for the studio carousel: Unsplash interiors
  graded warm and desaturated so the strip reads as one cream palette.
- The marquee copy behind the gallery is illegible in the source (only fragments of
  letters ever clear the cards). **Selected residences —** is a stand-in; change
  `MARQUEE` in `app/components/Gallery.tsx`.

The navigation overlay is likewise an addition — the reference never opens the menu.
