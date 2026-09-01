# Layout — grouping, emphasis, the card, the page

Seven patterns. Cite a violation as `slug#n`.

---

### proximity-rule — Proximity Rule
*Applies when:* the target places sibling elements with gaps — a form, a toolbar, a nav, a section.
1. Close reads as one group, far reads as separate: spacing groups the UI before any border does.
2. The gap inside a group is smaller than the gap between groups; equal spacing everywhere flattens hierarchy.
3. Related fields tighten to ~12px; section breaks open to ~40px.
4. Toolbar and nav controls are grouped by function.
5. No box or divider is used where a larger gap would do the same job.

### gestalt-laws — Gestalt Laws
*Applies when:* the target arranges more than a handful of elements, or an overlay sits over content.
1. Closure: an incomplete shape still reads — an icon does not need every line.
2. Similarity: a shared property (colour, shape, size) groups elements, and recolouring rows splits a grid into Navigation, Content, Actions.
3. Continuity: controls align on a common axis so the eye flows; scattered placement forces erratic jumping.
4. Figure-ground: the background is dimmed or blurred to push a modal forward — a modal over an undimmed page competes instead of standing out.
5. Common region: a shared border or container groups distant elements without moving them — loosely placed elements are wrapped in a bordered card when proximity alone fails.

### serial-position — Serial Position
*Applies when:* the target orders a list, a nav, an onboarding flow or a page of sections.
1. Recall is U-shaped: the first and last items are remembered, the middle is not.
2. The single most important item is anchored at the start and at the end.
3. A navbar leads with the logo and closes with the primary CTA.
4. A landing page opens with the strongest USP and ends with the strongest proof; onboarding hooks on the first slide and pays off on the last.
5. A critical CTA or key fact is never buried in the middle of a list.

### von-restorff — Von Restorff Effect
*Applies when:* the target presents a set of comparable options, or one action must win a screen.
1. The isolation effect only works against a uniform baseline — three identical cards give the eye nowhere to go.
2. Exactly one thing changes; emphasis is limited to a single element per view, because two or three highlights cancel each other.
3. Pricing isolates the target plan: scale it up, add a "Most Popular" badge, dim the alternatives.
4. The single CTA is lifted by colour, scale and glow while nav links recede; in a form the primary action is emphasised and the secondary ones are muted.
5. The standout is more than colour — scale, elevation and glow combine so it reads for colour-blind users too.

### landing-page-skeleton — Landing Page Skeleton
*Applies when:* the target is a marketing or landing page.
1. Five sections in order: Hero -> Proof -> Problem -> Solution -> CTA.
2. The hero answers what, who and why in ~3 seconds and holds only a headline, a subhead and one CTA — no carousel, no slider.
3. Proof sits directly below the hero — logos, one testimonial, one hard number — never buried at the bottom.
4. The problem names the real cost in time, money or frustration before the solution appears.
5. Benefits are concrete outcomes, three at most: "save 10 hours a week", not "advanced automation".
6. The same CTA repeats top and bottom with the same colour and the same copy.

### perfect-card — Perfect Card
*Applies when:* the target renders a card surface.
1. Padding 40px, not a cramped 12px.
2. Border-radius 24px, not near-zero.
3. Title at weight 600 and ~38px; body at 55% opacity — title and body never share weight and opacity.
4. Hairline border at ~12% opacity.
5. Shadow stack: a tight dark shadow for contrast plus a wide soft shadow for ambient elevation, with the subtle border.
6. Hover lifts ~8px, scales to 1.02, and deepens the shadow.

### card-hover-anatomy — Card Hover Anatomy
*Applies when:* a card in the target responds to hover.
1. The card lifts ~8px with the shadow stretching over ~200ms ease-out — faster reads twitchy, slower feels stuck.
2. An accent border pulse or gradient sweep marks the alive state.
3. Hidden buttons reveal staggered ~60ms apart, anchored at the card bottom edge — never stacked over the title, never spilling outside the card.
4. The image scales to ~1.05 inside an `overflow: hidden` frame with the container fixed; the whole card never scales, because that shifts neighbours and breaks the grid.

### stepper-wizard — Stepper Wizard
*Applies when:* the target collects more than a handful of fields, or splits a task into steps.
1. Long forms are chunked: three fields read effortlessly, twelve in a row trigger scroll fatigue.
2. Fields group by meaning — Personal, Payment, Review — not by count.
3. A progress indicator is always visible: a linear bar, numbered dots or step labels.
4. Validation happens inline inside each step; a step-one error never surfaces on the final screen.
5. State persists on every step change, so Back and Refresh preserve progress.
