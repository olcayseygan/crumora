# Per-round design checklist

Walk this on **every round, champion included**, right after the render (§2c) and alongside the
alignment audit (§4). Each box is answered from the **render**, not the source. Any unticked box is
a miss and must be named in the round log; the caps below are hard.

## Accessibility
- [ ] Every interactive element is reachable by keyboard, in reading order, with a **visible** focus
      ring that is not the browser default washed out to invisible.
- [ ] Every control has an accessible name (label, `aria-label`, or visible text) — an icon-only
      button without one is a fail.
- [ ] Semantics carry the structure: headings in order, lists as lists, buttons as `<button>`,
      landmarks present. Not `<div>` with a click handler.
- [ ] Nothing is signalled by colour alone — error, selection, status and required each carry a
      second cue (icon, text, weight, underline).
- [ ] Images/icons that mean something have alt text; purely decorative ones are hidden from AT.
- [ ] Touch/click targets ≥ 44×44 CSS px (or the platform minimum), with no two targets closer than
      one spacing step.
- [ ] Motion respects `prefers-reduced-motion`; nothing autoplays, flashes or blocks reading.
- [ ] Text can zoom to 200% without clipping or horizontal scroll.

## Responsive
- [ ] Rendered at **every declared viewport** — and at minimum a narrow (~360px), a mid (~768px) and
      a wide (~1440px) one for web.
- [ ] No horizontal scrollbar at any viewport; nothing clipped, nothing overlapping.
- [ ] Breakpoints are where the **content** breaks, not at device names copied from a framework.
- [ ] Reading order survives the reflow — the primary action stays primary at narrow width.
- [ ] Tables/charts/wide content have a stated strategy (scroll container, stacked cards, collapsed
      columns), not accidental overflow.
- [ ] The stress content (longest label, biggest number, 40-item list, empty state) is rendered at
      the narrowest viewport too.

## Alignment — mathematical
Not "looks right". Measure it, write the numbers down.
- [ ] Every x/y coordinate that elements are meant to share is **listed with its measured value**;
      shared edges differ by **0px**, not 1-2px.
- [ ] Every gap between siblings is a value **from the declared spacing scale** — list the distinct
      gap values found and confirm the set is a subset of the scale. Any stray value (13px, 17px, 22px)
      is a miss.
- [ ] Equivalent relationships use equal numbers: all card gaps equal, all label→field gaps equal,
      all section gaps equal.
- [ ] Container padding measured on all four sides; left = right unless a stated reason says otherwise.
- [ ] Repeated blocks have identical measured height and identical internal padding.
- [ ] Text sits on a consistent baseline grid or line-height rhythm; line heights come from the type
      scale.
- [ ] Optical corrections are **deliberate and recorded** — an icon nudged 1px is fine when written
      down as an optical nudge, not when it is an unexplained leftover.
- [ ] Numbers right- or decimal-aligned; one alignment per column.

**Cap:** unfixed misses here hold Layout & alignment at **≤ 7**.

## Contrast
- [ ] Contrast ratios are **computed**, not eyeballed — the pairs and their ratios are written out.
- [ ] Body text ≥ **4.5:1**; large text (≥24px, or ≥19px bold) ≥ **3:1**.
- [ ] UI boundaries that carry meaning — borders, input outlines, icons, chart strokes, focus rings —
      ≥ **3:1** against their background.
- [ ] Disabled state is distinguishable without being unreadable, and disabled is never the only cue.
- [ ] Text over images/gradients checked at its **worst** point, not its best.
- [ ] Every state (hover, active, selected, error) rechecked — hover is where contrast usually dies.

**Red line:** any text failing AA is an automatic VS loss (§5).

## Dark and light mode
- [ ] **Both** modes rendered and screenshotted. Not one plus an assumption.
- [ ] Colours come from **semantic tokens** (surface, on-surface, border, accent, danger), not from
      literal hex flipped per mode.
- [ ] Contrast checklist re-run **in full** against the second mode.
- [ ] Elevation reads correctly in both — dark mode uses lighter surfaces, not the light-mode
      drop shadows recycled into a black void.
- [ ] Images, icons, illustrations, charts and code blocks are legible in both; nothing is a white
      PNG on a white page.
- [ ] The default follows the system preference, and any explicit toggle overrides it in both
      directions.
- [ ] No flash of the wrong theme on load.

## Components
- [ ] Every element on the surface is either an existing project component or a **new one that is
      justified in one sentence**.
- [ ] The project's existing library was searched first — no re-drawn button, card, modal or input
      that already exists a few files over.
- [ ] Existing components are used with their existing API; no local override that forks their
      behaviour.
- [ ] Project design tokens are used; a parallel scale invented alongside them is a red line (§5).
- [ ] Every component renders its full state set: default, hover, active, focus, disabled, loading,
      error, empty.
- [ ] Nothing is a one-off styled `<div>` where a component belongs.

## Unique component, variants
- [ ] **One** component per job across the surface — the same thing never exists twice under two
      names or two implementations.
- [ ] Differences between near-duplicates are expressed as **variants/props** of one component
      (`variant="danger"`, `size="sm"`, `density="compact"`), not as forked copies.
- [ ] The variant axes are named and bounded — a component with a dozen boolean props that combine
      into contradictory states is a fail; splitting it or replacing the booleans with one enum is
      the fix.
- [ ] No variant exists that this surface does not use. Speculative variants are dead flexibility.
- [ ] Duplicates found during the round are listed in the round log with what they collapse into.
